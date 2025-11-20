import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { storage } from "./storage.js";
import { insertJobSchema, insertApplicationSchema } from "../shared/schema.js";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { GoogleDriveService } from "./googleDriveService.js";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

const fileStorageDriver = (process.env.FILE_STORAGE_DRIVER || process.env.FILE_STORAGE || "local").toLowerCase();
const useGoogleDrive = fileStorageDriver === "google" || fileStorageDriver === "gdrive" || fileStorageDriver === "drive";
const googleDriveService = useGoogleDrive ? new GoogleDriveService() : null;

// Rate limiter for application submissions - prevent spam/abuse
const applicationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 applications per windowMs
  message: {
    error: 'Too many applications submitted',
    details: 'You have exceeded the maximum number of applications allowed. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting in development
  skip: (req) => process.env.NODE_ENV === 'development'
});

// Configure multer for local file storage with enhanced security
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // Create secure filename with timestamp
      const extension = path.extname(file.originalname).toLowerCase();
      const safeFirst = (req.body?.firstName || 'First').replace(/[^a-zA-Z0-9]/g, '_');
      const safeLast = (req.body?.lastName || 'Last').replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const filename = `CV_${safeFirst}_${safeLast}_${timestamp}_${randomId}${extension}`;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for security
    files: 1, // Only allow 1 file
  },
  fileFilter: (req, file, cb) => {
    // Strict validation for security
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Security checks
    const securityChecks = {
      mimeType: allowedMimeTypes.includes(file.mimetype),
      extension: allowedExtensions.includes(fileExtension),
      filename: /^[a-zA-Z0-9._\-\s]+$/.test(file.originalname), // Only allow safe characters
      size: true // Will be checked by multer limits
    };

    // Log security attempt for monitoring
    if (!securityChecks.mimeType || !securityChecks.extension || !securityChecks.filename) {
      console.warn(`🚨 SECURITY: Rejected potentially unsafe file upload:`, {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        checks: securityChecks,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    if (!securityChecks.mimeType) {
      return cb(new Error(`SECURITY_FILE_TYPE: Only PDF and Word documents are allowed. Received: ${file.mimetype}`));
    }

    if (!securityChecks.extension) {
      return cb(new Error(`SECURITY_FILE_EXT: File extension not allowed. Only .pdf, .doc, .docx are permitted.`));
    }

    if (!securityChecks.filename) {
      return cb(new Error(`SECURITY_FILENAME: Filename contains unsafe characters. Please use only letters, numbers, spaces, dots, dashes and underscores.`));
    }

    // Additional security: Check for suspicious patterns
    const suspiciousPatterns = [
      /\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.com$/i, /\.scr$/i, /\.pif$/i,
      /\.vbs$/i, /\.js$/i, /\.jar$/i, /\.zip$/i, /\.rar$/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.originalname))) {
      console.error(`🚨 SECURITY ALERT: Blocked suspicious file pattern:`, file.originalname);
      return cb(new Error(`SECURITY_SUSPICIOUS: File type blocked for security reasons.`));
    }

    console.log(`✅ File validation passed:`, file.originalname, file.mimetype);
    cb(null, true);
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const healthData: Record<string, any> = {
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "unknown",
        storage: {
          type: storage.constructor.name,
          isGoogleSheets: storage.constructor.name === "GoogleSheetsStorage",
          isMemory: storage.constructor.name === "MemoryStorage"
        },
        environmentVariables: {
          hasGoogleSheetId: !!process.env.GOOGLE_SHEET_ID,
          hasServiceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
          googleSheetId: process.env.GOOGLE_SHEET_ID || "NOT SET",
          serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.substring(0, 20) + "..." : "NOT SET"
        },
        diagnostics: {
          usingMemoryStorage: storage.constructor.name === "MemoryStorage",
          reason: storage.constructor.name === "MemoryStorage"
            ? "Environment variables missing - using MemoryStorage (empty)"
            : "Using GoogleSheetsStorage - configured correctly"
        }
      };

      // Try to get job count if using Google Sheets
      if (storage.constructor.name === "GoogleSheetsStorage") {
        try {
          const jobs = await storage.getAllJobs();
          const activeJobs = await storage.getActiveJobs();
          healthData.jobs = {
            total: jobs.length,
            active: activeJobs.length,
            inactive: jobs.length - activeJobs.length
          };
        } catch (error: any) {
          healthData.jobs = {
            error: error.message,
            note: "Could not fetch jobs - check Google Sheets access"
          };
        }
      }

      res.json(healthData);
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Debug endpoint for Google Sheets troubleshooting (DISABLED IN PRODUCTION)
  if (process.env.NODE_ENV !== 'production') {
    app.get("/api/debug/google-sheets", async (req, res) => {
      console.log('🔍 [DEBUG] ========== /api/debug/google-sheets called ==========');
      const debugInfo: Record<string, any> = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "unknown",
        platform: process.platform,
        nodeVersion: process.version,
      };

      try {
        // Environment variable analysis
        debugInfo.environmentVariables = {
          GOOGLE_SHEET_ID: {
            exists: !!process.env.GOOGLE_SHEET_ID,
            length: process.env.GOOGLE_SHEET_ID?.length || 0,
            preview: process.env.GOOGLE_SHEET_ID ? process.env.GOOGLE_SHEET_ID.substring(0, 30) + '...' : 'NOT SET',
            value: process.env.GOOGLE_SHEET_ID || 'NOT SET',
            isValid: !!process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SHEET_ID.length > 10
          },
          GOOGLE_SERVICE_ACCOUNT_EMAIL: {
            exists: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            length: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.length || 0,
            preview: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.substring(0, 30) + '...' : 'NOT SET',
            value: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'NOT SET',
            containsAt: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.includes('@') || false,
            endsWithServiceAccount: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.endsWith('.iam.gserviceaccount.com') || false,
            isValid: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.includes('@')
          },
          GOOGLE_PRIVATE_KEY: {
            exists: !!process.env.GOOGLE_PRIVATE_KEY,
            length: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
            startsWith: process.env.GOOGLE_PRIVATE_KEY?.startsWith('-----BEGIN PRIVATE KEY-----') || false,
            endsWith: process.env.GOOGLE_PRIVATE_KEY?.endsWith('-----END PRIVATE KEY-----') || false,
            containsEscapedNewlines: process.env.GOOGLE_PRIVATE_KEY?.includes('\\n') || false,
            containsActualNewlines: process.env.GOOGLE_PRIVATE_KEY?.includes('\n') || false,
            firstChars: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.substring(0, 50) : 'NOT SET',
            lastChars: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.substring(Math.max(0, (process.env.GOOGLE_PRIVATE_KEY.length - 50))) : 'NOT SET',
            isValid: !!process.env.GOOGLE_PRIVATE_KEY &&
              process.env.GOOGLE_PRIVATE_KEY.startsWith('-----BEGIN PRIVATE KEY-----') &&
              process.env.GOOGLE_PRIVATE_KEY.endsWith('-----END PRIVATE KEY-----')
          }
        };

        // Storage type analysis
        debugInfo.storage = {
          type: storage.constructor.name,
          isGoogleSheets: storage.constructor.name === "GoogleSheetsStorage",
          isMemory: storage.constructor.name === "MemoryStorage"
        };

        // If using GoogleSheetsStorage, try to get internal state
        if (storage.constructor.name === "GoogleSheetsStorage") {
          try {
            // Access private properties via type assertion for debugging
            const gsStorage = storage as any;

            debugInfo.googleSheetsStorage = {
              spreadsheetId: gsStorage.spreadsheetId || 'NOT SET',
              initialized: gsStorage.initialized || false,
              sheetsClientExists: !!gsStorage.sheets,
              sheetsClientType: gsStorage.sheets ? gsStorage.sheets.constructor.name : 'null'
            };

            // Try to test connection
            console.log('🔍 [DEBUG] Testing Google Sheets connection...');
            try {
              const testJobs = await storage.getAllJobs();
              debugInfo.connectionTest = {
                success: true,
                jobsCount: testJobs.length,
                message: 'Successfully connected and fetched jobs'
              };
            } catch (testError: any) {
              debugInfo.connectionTest = {
                success: false,
                error: testError?.message || String(testError),
                errorType: testError?.constructor?.name || typeof testError,
                errorCode: testError?.code,
                errorStatus: testError?.status || testError?.response?.status,
                errorDetails: testError?.response?.data || null
              };
            }
          } catch (error: any) {
            debugInfo.googleSheetsStorage = {
              error: 'Could not inspect GoogleSheetsStorage internals',
              errorMessage: error?.message || String(error)
            };
          }
        }

        // Summary
        debugInfo.summary = {
          allEnvVarsPresent:
            !!process.env.GOOGLE_SHEET_ID &&
            !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
            !!process.env.GOOGLE_PRIVATE_KEY,
          usingCorrectStorage: storage.constructor.name === "GoogleSheetsStorage",
          connectionWorking: debugInfo.connectionTest?.success || false,
          recommendations: []
        };

        // Add recommendations
        if (!debugInfo.environmentVariables.GOOGLE_SHEET_ID.exists) {
          debugInfo.summary.recommendations.push('GOOGLE_SHEET_ID is missing - set it in Vercel environment variables');
        }
        if (!debugInfo.environmentVariables.GOOGLE_SERVICE_ACCOUNT_EMAIL.exists) {
          debugInfo.summary.recommendations.push('GOOGLE_SERVICE_ACCOUNT_EMAIL is missing - set it in Vercel environment variables');
        }
        if (!debugInfo.environmentVariables.GOOGLE_PRIVATE_KEY.exists) {
          debugInfo.summary.recommendations.push('GOOGLE_PRIVATE_KEY is missing - set it in Vercel environment variables');
        }
        if (debugInfo.environmentVariables.GOOGLE_PRIVATE_KEY.exists && !debugInfo.environmentVariables.GOOGLE_PRIVATE_KEY.isValid) {
          debugInfo.summary.recommendations.push('GOOGLE_PRIVATE_KEY format appears invalid - ensure it includes BEGIN and END markers');
        }
        if (storage.constructor.name === "MemoryStorage") {
          debugInfo.summary.recommendations.push('Using MemoryStorage instead of GoogleSheetsStorage - check environment variables');
        }
        if (debugInfo.connectionTest && !debugInfo.connectionTest.success) {
          debugInfo.summary.recommendations.push(`Connection test failed: ${debugInfo.connectionTest.error} - check service account permissions`);
        }

        console.log('✅ [DEBUG] Debug info collected successfully');
        res.json(debugInfo);
      } catch (error: any) {
        console.error('❌ [DEBUG] Error in debug endpoint:', error);
        res.status(500).json({
          error: 'Failed to collect debug information',
          message: error?.message || String(error),
          timestamp: new Date().toISOString()
        });
      }
    });
  } else {
    // In production, return 404 for debug endpoint
    app.get("/api/debug/google-sheets", (req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

  // Job Routes

  // Get all active jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      console.log("=== FETCHING JOBS ===");
      console.log("Storage type:", storage.constructor.name);
      console.log("Environment check:", {
        hasGoogleSheetId: !!process.env.GOOGLE_SHEET_ID,
        hasServiceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY
      });

      const jobs = await storage.getActiveJobs();
      console.log(`Found ${jobs.length} active jobs`);

      if (jobs.length === 0) {
        console.warn("⚠️ No jobs found - this could mean:");
        console.warn("1. Google Sheet is empty");
        console.warn("2. All jobs are marked as inactive (IsActive = FALSE)");
        console.warn("3. Storage is using MemoryStorage (env vars missing)");
      }

      console.log("=== JOBS FETCH COMPLETE ===");
      res.json(jobs);
    } catch (error: any) {
      console.error("=== ERROR FETCHING JOBS ===");
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      console.error("Storage type:", storage.constructor.name);
      console.error("=== END ERROR ===");

      // Provide detailed error information for debugging
      const errorDetails: any = {
        error: "Failed to fetch jobs",
        message: error?.message || "Unknown error",
        storageType: storage.constructor.name,
        hasEnvVars: {
          sheetId: !!process.env.GOOGLE_SHEET_ID,
          serviceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          privateKey: !!process.env.GOOGLE_PRIVATE_KEY
        }
      };

      // Add more diagnostic info if it's a Google Sheets error
      if (error?.message?.includes('OpenSSL') || error?.code === 'ERR_OSSL_UNSUPPORTED') {
        errorDetails.diagnosis = 'Private key format error';
        errorDetails.solution = 'Check GOOGLE_PRIVATE_KEY format in Vercel - should be single line with \\n';
      } else if (error?.message?.includes('permission') || error?.code === 403) {
        errorDetails.diagnosis = 'Permission denied';
        errorDetails.solution = 'Ensure service account has Editor access to Google Sheet';
      } else if (error?.message?.includes('not found') || error?.code === 404) {
        errorDetails.diagnosis = 'Spreadsheet not found';
        errorDetails.solution = 'Verify GOOGLE_SHEET_ID is correct';
      }

      // Include error code if available
      if (error?.code) {
        errorDetails.errorCode = error.code;
      }

      // Include status if it's an HTTP error
      if (error?.response?.status) {
        errorDetails.httpStatus = error.response.status;
        errorDetails.httpStatusText = error.response.statusText;
      }

      res.status(500).json(errorDetails);
    }
  });

  // Search jobs
  app.get("/api/jobs/search", async (req, res) => {
    try {
      const keyword = req.query.keyword as string;
      if (!keyword) {
        return res.status(400).json({ error: "Keyword is required" });
      }
      const jobs = await storage.searchJobs(keyword);
      res.json(jobs);
    } catch (error) {
      console.error("Error searching jobs:", error);
      res.status(500).json({ error: "Failed to search jobs" });
    }
  });

  // Get specific job
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  // Create job (for admin use later)
  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid job data", details: error.errors });
      }
      console.error("Error creating job:", error);
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  // Update job (for admin use later)
  app.put("/api/jobs/:id", async (req, res) => {
    try {
      const jobData = insertJobSchema.partial().parse(req.body);
      const job = await storage.updateJob(req.params.id, jobData);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid job data", details: error.errors });
      }
      console.error("Error updating job:", error);
      res.status(500).json({ error: "Failed to update job" });
    }
  });

  // Delete job (for admin use later)
  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const success = await storage.deleteJob(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  // Application Routes

  // Create application with local file uploads (with rate limiting)
  app.post("/api/applications", applicationLimiter, upload.fields([
    { name: 'cv', maxCount: 1 }
  ]), async (req, res) => {
    console.log('\n=== APPLICATION SUBMISSION START ===');

    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      console.log('✅ Request received successfully');
      console.log('📋 Body keys:', Object.keys(req.body || {}));
      console.log('📎 Files:', files ? Object.keys(files) : 'No files');

      // Debug: Log all form data (excluding sensitive info)
      console.log('📝 Form data:');
      Object.entries(req.body || {}).forEach(([key, value]) => {
        if (key === 'jobSpecificAnswers') {
          try {
            const parsed = JSON.parse(value as string);
            console.log(`  ${key}:`, Object.keys(parsed));
          } catch {
            console.log(`  ${key}:`, typeof value);
          }
        } else {
          console.log(`  ${key}:`, value);
        }
      });

      // Handle uploaded CV file
      let cvUrl = null;

      if (files?.cv && files.cv[0]) {
        console.log('📁 Processing CV upload...');
        const cvFile = files.cv[0];

        // Additional server-side security validation
        if (cvFile.size > 5 * 1024 * 1024) {
          console.log('❌ File too large:', cvFile.size);
          // Delete the uploaded file if size check fails
          fs.unlink(cvFile.path, () => { });
          return res.status(400).json({
            error: "File too large",
            details: "CV file must be under 5MB for security reasons."
          });
        }

        if (useGoogleDrive && googleDriveService) {
          console.log('☁️ Uploading CV to Google Drive (file storage driver: google)');
          const filePath = cvFile.path || path.join(cvFile.destination || uploadsDir, cvFile.filename);
          const fileBuffer = fs.readFileSync(filePath);
          const originalName = cvFile.originalname || cvFile.filename;
          const mimeType = cvFile.mimetype || 'application/pdf';

          cvUrl = await googleDriveService.uploadCVToFolder(fileBuffer, originalName, mimeType);

          // Remove the temporary local file once uploaded
          fs.unlink(filePath, () => { });
          console.log(`✅ CV uploaded to Google Drive. Public link: ${cvUrl}`);
        } else {
          // Create accessible URL for the local file
          const forwardedProto = req.headers["x-forwarded-proto"];
          const protocol = typeof forwardedProto === "string" ? forwardedProto.split(",")[0] : req.protocol;
          const host = req.get('host');
          cvUrl = `${protocol}://${host}/api/files/${cvFile.filename}`;
          console.log(`✅ CV stored locally. URL: ${cvUrl}`);
        }

        console.log(`📄 CV processed successfully: ${cvFile.filename} (${cvFile.size} bytes)`);
      } else {
        console.log('ℹ️ No CV file uploaded');
      }

      console.log('🏗️ Building application data...');
      const applicationData = {
        jobId: req.body.jobId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        resumeUrl: cvUrl,
        canTravelToNaviMumbai: req.body.canTravelToNaviMumbai,
        currentSalary: req.body.currentSalary || null,
        expectedSalary: req.body.expectedSalary || null,
        whyMotorOctane: req.body.whyMotorOctane,
        jobSpecificAnswers: req.body.jobSpecificAnswers || null,
        status: 'pending',
        notes: '',
      };

      console.log('📊 Application data prepared:', {
        jobId: applicationData.jobId,
        name: `${applicationData.firstName} ${applicationData.lastName}`,
        email: applicationData.email,
        hasCV: !!cvUrl,
        hasJobSpecificAnswers: !!applicationData.jobSpecificAnswers
      });

      console.log('💾 Calling storage.createApplication...');
      const application = await storage.createApplication(applicationData);
      console.log('✅ Application created with ID:', application.id);

      const response = {
        ...application,
        success: true
      };

      console.log('🎉 SUCCESS: Application submission complete');
      console.log('=== APPLICATION SUBMISSION END ===\n');

      res.status(201).json(response);
    } catch (error: any) {
      console.error('\n❌ === APPLICATION SUBMISSION ERROR ===');
      console.error('Error type:', error?.constructor?.name || 'Unknown');
      console.error('Error message:', error?.message || 'No message');
      console.error('Full error object:', error);

      if (error?.stack) {
        console.error('Stack trace:');
        console.error(error.stack);
      }

      // Handle specific security errors with user-friendly messages
      if (error?.message?.startsWith('SECURITY_')) {
        console.log('🛡️ Security error detected');
        const securityMessages = {
          'SECURITY_FILE_TYPE': 'Invalid file type. Please upload only PDF or Word documents (.pdf, .doc, .docx).',
          'SECURITY_FILE_EXT': 'Invalid file extension. Please ensure your file ends with .pdf, .doc, or .docx.',
          'SECURITY_FILENAME': 'Invalid filename. Please rename your file using only letters, numbers, and basic punctuation.',
          'SECURITY_SUSPICIOUS': 'File blocked for security reasons. Please upload a standard CV document.'
        };

        const errorType = error.message.split(':')[0];
        const userMessage = securityMessages[errorType as keyof typeof securityMessages] ||
          'File upload blocked for security reasons. Please upload a valid PDF or Word document.';

        console.error('=== END ERROR LOG ===\n');
        return res.status(400).json({
          error: "File Security Error",
          details: userMessage,
          code: errorType
        });
      }

      const message = (error && error.message) ? error.message : String(error);
      console.error('📤 Sending error response:', message);
      console.error('=== END ERROR LOG ===\n');

      res.status(500).json({
        error: "Failed to create application",
        details: `Server error: ${message}. Please check server logs for more details.`
      });
    }
  });

  // Get all applications (admin only)
  app.get("/api/applications", async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Get applications for a specific job (admin only)
  app.get("/api/applications/job/:jobId", async (req, res) => {
    try {
      const applications = await storage.getApplicationsForJob(req.params.jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ error: "Failed to fetch job applications" });
    }
  });

  // Update application status (admin only)
  app.put("/api/applications/:id/status", async (req, res) => {
    try {
      const { status, notes } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const application = await storage.updateApplicationStatus(req.params.id, status, notes);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ error: "Failed to update application status" });
    }
  });

  // File download/view endpoint for uploaded CVs
  app.get("/api/files/:filename", async (req, res) => {
    if (useGoogleDrive) {
      return res.status(404).json({
        error: "Files are stored in Google Drive",
        details: "This endpoint is only available when using local file storage."
      });
    }
    try {
      const filename = req.params.filename;

      // Security: Only allow files with safe patterns
      if (!/^CV_[a-zA-Z0-9_]+\.(pdf|doc|docx)$/i.test(filename)) {
        console.error(`🚨 Invalid filename format attempted: ${filename}`);
        return res.status(400).json({ error: "Invalid filename format" });
      }

      const filePath = path.join(uploadsDir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return res.status(404).json({ error: "File not found" });
      }

      // Get file stats for proper headers
      const stats = fs.statSync(filePath);
      const extension = path.extname(filename).toLowerCase();

      // Set appropriate content type
      let contentType = 'application/octet-stream';
      if (extension === '.pdf') {
        contentType = 'application/pdf';
      } else if (extension === '.doc') {
        contentType = 'application/msword';
      } else if (extension === '.docx') {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }

      // Extract original filename (remove CV_ prefix and timestamp)
      const originalFilename = filename.replace(/^CV_\d+_/, '');

      // Set headers for file download
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`);
      res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // Prevent caching issues
      res.setHeader('Pragma', 'public');
      res.setHeader('Expires', '0');

      // Stream the file
      const fileStream = fs.createReadStream(filePath);

      fileStream.on('error', (streamError) => {
        console.error(`❌ Error streaming file ${filename}:`, streamError);
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to stream file" });
        }
      });

      fileStream.pipe(res);

      console.log(`📥 File served for download: ${filename} (${stats.size} bytes)`);
    } catch (error) {
      console.error("❌ Error serving file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to serve file" });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
