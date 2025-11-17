import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertJobSchema, insertApplicationSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

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
  // Job Routes
  
  // Get all active jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getActiveJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
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

  // Create application with local file uploads
  app.post("/api/applications", upload.fields([
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
          fs.unlink(cvFile.path, () => {});
          return res.status(400).json({ 
            error: "File too large", 
            details: "CV file must be under 5MB for security reasons." 
          });
        }
        
        // Create accessible URL for the file
        const protocol = req.protocol;
        const host = req.get('host');
        cvUrl = `${protocol}://${host}/api/files/${cvFile.filename}`;
        
        console.log(`✅ CV processed: ${cvFile.filename} (${cvFile.size} bytes)`);
        console.log(`� CV URL: ${cvUrl}`);
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
    try {
      const filename = req.params.filename;
      
      // Security: Only allow files with safe patterns
      if (!/^CV_[a-zA-Z0-9_]+\.(pdf|doc|docx)$/i.test(filename)) {
        return res.status(400).json({ error: "Invalid filename format" });
      }
      
      const filePath = path.join(uploadsDir, filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
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
      
      // Set headers for file download/view
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      console.log(`📥 File served: ${filename} (${stats.size} bytes)`);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ error: "Failed to serve file" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
