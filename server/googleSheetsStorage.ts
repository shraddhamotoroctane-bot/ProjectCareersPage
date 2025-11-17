import { google } from 'googleapis';
import { type User, type InsertUser, type Job, type InsertJob, type Application, type InsertApplication, type AdminUser, type InsertAdminUser } from '@shared/schema';

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin Users
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser>;
  
  // Jobs
  getAllJobs(): Promise<Job[]>;
  getActiveJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;
  searchJobs(keyword: string): Promise<Job[]>;
  
  // Applications
  getApplicationsForJob(jobId: string): Promise<Application[]>;
  getAllApplications(): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: string, status: string, notes?: string): Promise<Application | undefined>;
}

export class GoogleSheetsStorage implements IStorage {
  private sheets: any;
  private spreadsheetId: string;
  private initialized: boolean = false;
  
  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID!;
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeSheets();
      this.initialized = true;
    }
  }

  private async initializeSheets() {
    try {
      // Get environment variables
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;

      if (!serviceAccountEmail || !privateKey) {
        throw new Error('Missing Google Sheets credentials. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.');
      }

      // Create JWT auth from service account credentials
      const auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: privateKey.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
      
      this.sheets = google.sheets({ version: 'v4', auth });
      console.log('Google Sheets authentication successful');
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error);
      // Fall back to returning empty data if authentication fails
      this.sheets = null;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private async generateApplicationId(): Promise<string> {
    // Get today's date in YYYYMMDD format
    const today = new Date();
    const dateStr = today.getFullYear().toString() + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0');
    
    // Get existing applications for today to determine next number
    const allApplications = await this.getAllApplications();
    const todayApplications = allApplications.filter(app => 
      app.id.startsWith(dateStr)
    );
    
    // Generate next sequential number for today
    const nextNumber = (todayApplications.length + 1).toString().padStart(3, '0');
    
    return `${dateStr}-${nextNumber}`;
  }

  // Initialize Google Sheets with proper structure and sample data
  private async initializeSheetsStructure() {
    try {
      // Check if Jobs sheet exists and has data
      const jobsData = await this.readSheet('Jobs!A1:L2');
      
      if (jobsData.length === 0) {
        console.log('Initializing Jobs sheet with headers and sample data...');
        
        // Create headers
        const headers = [
          ['ID', 'Title', 'Department', 'Type', 'Level', 'Location', 'Description', 'Requirements', 'ApplicationURL', 'IsActive', 'CreatedAt', 'UpdatedAt']
        ];
        
        // Sample job data
        const sampleJobs = [
          [
            'job1',
            'Senior Frontend Developer',
            'Engineering',
            'Full-time',
            'Senior',
            'Remote',
            'Join our team to build amazing user experiences with React and TypeScript. You\'ll work on cutting-edge web applications.',
            JSON.stringify(['React', 'TypeScript', 'CSS', '3+ years experience']),
            'https://forms.google.com/sample-frontend',
            'TRUE',
            new Date().toISOString(),
            new Date().toISOString()
          ],
          [
            'job2',
            'Product Designer',
            'Design',
            'Full-time',
            'Mid-level',
            'San Francisco, CA',
            'Design beautiful and intuitive user interfaces for our products. Collaborate with engineering and product teams.',
            JSON.stringify(['Figma', 'Design Systems', 'User Research', '2+ years experience']),
            'https://forms.google.com/sample-designer',
            'TRUE',
            new Date().toISOString(),
            new Date().toISOString()
          ],
          [
            'job3',
            'Backend Engineer',
            'Engineering',
            'Full-time',
            'Mid-level',
            'Remote',
            'Build scalable backend systems and APIs. Work with modern cloud technologies and databases.',
            JSON.stringify(['Node.js', 'PostgreSQL', 'AWS', '2+ years experience']),
            'https://forms.google.com/sample-backend',
            'TRUE',
            new Date().toISOString(),
            new Date().toISOString()
          ],
          [
            'job4',
            'Marketing Manager',
            'Marketing',
            'Full-time',
            'Senior',
            'New York, NY',
            'Lead our marketing efforts and drive growth. Develop and execute marketing strategies across multiple channels.',
            JSON.stringify(['Digital Marketing', 'Analytics', 'Content Strategy', '3+ years experience']),
            'https://forms.google.com/sample-marketing',
            'TRUE',
            new Date().toISOString(),
            new Date().toISOString()
          ],
          [
            'job5',
            'Data Scientist',
            'Data',
            'Full-time',
            'Senior',
            'Remote',
            'Analyze complex datasets and build machine learning models to drive business insights and decisions.',
            JSON.stringify(['Python', 'Machine Learning', 'SQL', 'Statistics', '3+ years experience']),
            'https://forms.google.com/sample-data-science',
            'TRUE',
            new Date().toISOString(),
            new Date().toISOString()
          ],
          [
            'job6',
            'Sales Representative',
            'Sales',
            'Full-time',
            'Entry-level',
            'Chicago, IL',
            'Join our sales team and help grow our customer base. Great opportunity for career growth and development.',
            JSON.stringify(['Communication Skills', 'CRM Experience', 'Customer Focus']),
            'https://forms.google.com/sample-sales',
            'TRUE',
            new Date().toISOString(),
            new Date().toISOString()
          ],
          [
            'job7',
            'UX Researcher',
            'Design',
            'Contract',
            'Senior',
            'Remote',
            'Conduct user research to inform product decisions. Design and execute research studies.',
            JSON.stringify(['User Research', 'Data Analysis', 'Interviewing', '3+ years experience']),
            'https://forms.google.com/sample-ux-research',
            'TRUE',
            new Date().toISOString(),
            new Date().toISOString()
          ],
          [
            'job8',
            'DevOps Engineer',
            'Engineering',
            'Full-time',
            'Senior',
            'Austin, TX',
            'Manage our infrastructure and deployment pipelines. Ensure high availability and scalability.',
            JSON.stringify(['Kubernetes', 'Docker', 'CI/CD', 'AWS', '3+ years experience']),
            'https://forms.google.com/sample-devops',
            'TRUE',
            new Date().toISOString(),
            new Date().toISOString()
          ]
        ];
        
        // Add headers and sample data
        await this.appendToSheet('Jobs!A1:L1', headers);
        await this.appendToSheet('Jobs!A2:L9', sampleJobs);
        
        console.log('Jobs sheet initialized with sample data');
      }
      
      // Check if Applications sheet exists
      const appsData = await this.readSheet('Applications!A1:L1');
      
      if (appsData.length === 0) {
        console.log('Initializing Applications sheet with headers...');
        
        const appHeaders = [
          ['ID', 'JobID', 'ApplicantName', 'FirstName', 'LastName', 'Email', 'Phone', 'ResumeURL', 'CanTravelToNaviMumbai', 'CurrentSalary', 'ExpectedSalary', 'WhyMotorOctane', 'JobSpecificAnswers', 'Status', 'Notes', 'AppliedAt', 'UpdatedAt']
        ];
        
        await this.appendToSheet('Applications!A1:Q1', appHeaders);
        console.log('Applications sheet initialized');
      }

      // Old JobSpecificResponses sheet is deprecated - we only use JobSpecificAnswers now

      // Check if JobSpecificAnswers sheet exists (new column-wise format)
      try {
        console.log('Checking if JobSpecificAnswers sheet exists...');
        const answersData = await this.readSheet('JobSpecificAnswers!A1:L1');
        
        if (answersData.length === 0) {
          console.log('JobSpecificAnswers sheet exists but is empty. Initializing with headers...');
          
          // Initialize with base headers and some question columns
          const answerHeaders = [
            ['ApplicationID', 'JobTitle', 'ApplicantName', 'JobID', 'Question1', 'Question2', 'Question3', 'Question4', 'Question5', 'Question6', 'Question7', 'Question8']
          ];
          
          await this.appendToSheet('JobSpecificAnswers!A1:L1', answerHeaders);
          console.log('JobSpecificAnswers sheet initialized with extended headers');
        } else {
          console.log('JobSpecificAnswers sheet exists with data:', answersData);
        }
      } catch (error: any) {
        console.error('JobSpecificAnswers sheet does not exist or has different name. Error:', error?.message || error);
        console.log('Creating JobSpecificAnswers sheet...');
        
        // Try to create the sheet by writing headers
        try {
          const answerHeaders = [
            ['ApplicationID', 'JobTitle', 'ApplicantName', 'JobID', 'Question1', 'Question2', 'Question3', 'Question4', 'Question5', 'Question6', 'Question7', 'Question8']
          ];
          
          await this.appendToSheet('JobSpecificAnswers!A1:L1', answerHeaders);
          console.log('JobSpecificAnswers sheet created successfully');
        } catch (createError: any) {
          console.error('Failed to create JobSpecificAnswers sheet:', createError?.message || createError);
          console.log('Please manually create a sheet named "JobSpecificAnswers" in your Google Sheets document');
        }
      }
      
    } catch (error) {
      console.log('Sheet structure initialization completed (sheets may already exist)');
    }
  }

  // Helper method to read sheet data
  private async readSheet(range: string): Promise<any[][]> {
    await this.ensureInitialized();
    if (!this.sheets) {
      console.log('Google Sheets not initialized, returning empty data');
      return [];
    }
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: range,
      });
      return response.data.values || [];
    } catch (error) {
      console.error(`Error reading sheet range ${range}:`, error);
      return [];
    }
  }

  // Helper method to append data to sheet
  private async appendToSheet(range: string, values: any[][]): Promise<void> {
    await this.ensureInitialized();
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: {
          values: values,
        },
      });
    } catch (error) {
      console.error(`Error appending to sheet range ${range}:`, error);
    }
  }

  // Helper method to update sheet data
  private async updateSheet(range: string, values: any[][]): Promise<void> {
    await this.ensureInitialized();
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: {
          values: values,
        },
      });
    } catch (error) {
      console.error(`Error updating sheet range ${range}:`, error);
    }
  }

  // Helper method to store job-specific answers in column-wise format
  private async storeJobSpecificAnswersColumnWise(application: any, jobSpecificAnswers: any, jobTitle: string): Promise<void> {
    try {
      // Parse the job-specific answers
      const responses = JSON.parse(jobSpecificAnswers);
      const questionsArray = Object.keys(responses);
      
      console.log('=== INSIDE HORIZONTAL STORAGE METHOD ===');
      console.log('Debug: Storing column-wise answers for:', application.firstName, application.lastName);
      console.log('Debug: Questions found:', questionsArray);
      console.log('Debug: Responses:', responses);
      console.log('Debug: Job Title:', jobTitle);
      
      // Read current headers from JobSpecificAnswers sheet (Sheet 3)
      console.log('=== READING FROM JobSpecificAnswers SHEET ===');
      const currentHeaders = await this.readSheet('JobSpecificAnswers!1:1');
      console.log('Current headers from JobSpecificAnswers sheet:', currentHeaders);
      let headers: string[] = [];
      
      // Initialize base headers to match your sheet exactly
      const baseHeaders = ['ApplicationID', 'JobTitle', 'ApplicantName', 'JobID'];
      
      // Initialize headers if sheet is empty or corrupted
      if (currentHeaders.length === 0 || currentHeaders[0].length === 0) {
        headers = [...baseHeaders];
        
        // Add question columns as Question1, Question2, etc. to match your sheet
        for (let i = 1; i <= questionsArray.length; i++) {
          headers.push(`Question${i}`);
        }
        
        // Set the headers
        await this.updateSheet('JobSpecificAnswers!1:1', [headers]);
        console.log('Initialized JobSpecificAnswers headers:', headers);
      } else {
        headers = currentHeaders[0];
        
        // Check if we need to add more question columns
        const existingQuestionCount = headers.filter(h => h.startsWith('Question')).length;
        const neededQuestionCount = questionsArray.length;
        
        if (neededQuestionCount > existingQuestionCount) {
          // Add missing question columns
          for (let i = existingQuestionCount + 1; i <= neededQuestionCount; i++) {
            headers.push(`Question${i}`);
          }
          // Update headers
          await this.updateSheet('JobSpecificAnswers!1:1', [headers]);
          console.log('Added new question columns. Updated headers:', headers);
        }
      }
      
      // Prepare the row data - ensure it matches header length
      const rowData = new Array(headers.length).fill('');
      
      // Fill in the basic information (no CreatedAt as requested)
      const applicationIdIndex = headers.indexOf('ApplicationID');
      const jobTitleIndex = headers.indexOf('JobTitle');
      const applicantNameIndex = headers.indexOf('ApplicantName');
      const jobIdIndex = headers.indexOf('JobID');
      
      if (applicationIdIndex >= 0) rowData[applicationIdIndex] = application.id;
      if (jobTitleIndex >= 0) rowData[jobTitleIndex] = jobTitle;
      if (applicantNameIndex >= 0) rowData[applicantNameIndex] = `${application.firstName} ${application.lastName}`;
      if (jobIdIndex >= 0) rowData[jobIdIndex] = application.jobId;
      
      // Fill in the question answers in order (Question1, Question2, etc.)
      questionsArray.forEach((question, index) => {
        const questionHeader = `Question${index + 1}`;
        const questionIndex = headers.indexOf(questionHeader);
        if (questionIndex >= 0) {
          // Store only the response, not the question
          rowData[questionIndex] = String(responses[question] || '');
        }
      });
      
      // Find the next empty row to append data
      console.log('=== FINDING NEXT ROW IN JobSpecificAnswers SHEET ===');
      const existingData = await this.readSheet('JobSpecificAnswers!A:A');
      const nextRow = existingData.length + 1;
      console.log('Existing data rows:', existingData.length, 'Next row will be:', nextRow);
      
      // Append the row to the specific row (not using append which might create issues)
      const endColumn = String.fromCharCode(65 + headers.length - 1);
      const range = `JobSpecificAnswers!A${nextRow}:${endColumn}${nextRow}`;
      console.log('Debug: Calculated range:', range, 'Headers length:', headers.length, 'End column:', endColumn);
      console.log('=== WRITING TO JobSpecificAnswers SHEET ===');
      console.log('Target sheet: JobSpecificAnswers (Sheet 3)');
      console.log('Writing range:', range);
      console.log('Data to write:', rowData);
      await this.updateSheet(range, [rowData]);
      
      console.log(`=== HORIZONTAL STORAGE SUCCESS ===`);
      console.log(`Job-specific answers stored in row ${nextRow} with ${rowData.length} columns`);
      console.log('Headers used:', headers);
      console.log('Data stored:', rowData);
      console.log('Range used:', range);
      console.log('=== END HORIZONTAL STORAGE METHOD ===');
      
    } catch (error: any) {
      console.error('=== HORIZONTAL STORAGE ERROR ===');
      console.error('Error storing job-specific answers in column-wise format:', error?.message || error);
      console.error('Full error details:', error);
      console.error('=== END HORIZONTAL STORAGE ERROR ===');
      
      // If horizontal storage fails, we need to ensure the data doesn't get lost
      throw error; // Re-throw to prevent silent failure
    }
  }


  // Helper method to ensure Applications sheet has proper headers
  private async ensureApplicationsHeaders(): Promise<void> {
    try {
      const currentHeaders = await this.readSheet('Applications!1:1');
      const expectedHeaders = [
        'ApplicationID', 'JobID', 'FirstName', 'LastName', 'Email', 'Phone', 
        'ResumeURL', 'CanTravelToNaviMumbai', 'CurrentSalary', 'ExpectedSalary', 
        'WhyMotorOctane', 'JobSpecificAnswers', 'Status', 'Notes', 'AppliedAt', 'UpdatedAt'
      ];
      
      // If headers are missing or incorrect, set them
      if (currentHeaders.length === 0 || currentHeaders[0].length === 0 || 
          JSON.stringify(currentHeaders[0]) !== JSON.stringify(expectedHeaders)) {
        await this.updateSheet('Applications!1:1', [expectedHeaders]);
        console.log('Applications sheet headers ensured:', expectedHeaders);
      }
    } catch (error) {
      console.error('Error ensuring Applications headers:', error);
    }
  }

  // Jobs methods
  // Jobs methods
async getAllJobs(): Promise<Job[]> {
  const rows = await this.readSheet('Jobs!A2:L1000'); // skip header
  return rows.map(row => ({
    id: row[0],
    title: row[1],
    department: row[2],
    type: row[3],
    level: row[4] || null, // Handle missing level gracefully
    location: row[5],
    description: row[6],
    requirements: row[7] ? JSON.parse(row[7]) : [],
    applicationUrl: row[8],
    isActive: row[9] === 'TRUE',
    createdAt: new Date(row[10] || Date.now()),
    updatedAt: new Date(row[11] || Date.now()),
  }));
}

async getActiveJobs(): Promise<Job[]> {
  const allJobs = await this.getAllJobs();
  return allJobs.filter(job => job.isActive);
}

  async getJob(id: string): Promise<Job | undefined> {
    const jobs = await this.getAllJobs();
    return jobs.find(job => job.id === id);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.generateId();
    const now = new Date().toISOString();
    const job: Job = {
      id,
      ...insertJob,
      level: insertJob.level || null, // Ensure level is properly typed
      isActive: true,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    const values = [[
      job.id,
      job.title,
      job.department,
      job.type,
      job.level || '', // Handle null/undefined level
      job.location,
      job.description,
      JSON.stringify(job.requirements),
      job.applicationUrl,
      job.isActive.toString(),
      now,
      now
    ]];

    await this.appendToSheet('Jobs!A:L', values);
    return job;
  }

  async updateJob(id: string, updateData: Partial<InsertJob>): Promise<Job | undefined> {
    const jobs = await this.getAllJobs();
    const jobIndex = jobs.findIndex(job => job.id === id);
    
    if (jobIndex === -1) return undefined;

    const existingJob = jobs[jobIndex];
    const updatedJob = { ...existingJob, ...updateData, updatedAt: new Date() };

    const values = [[
      updatedJob.id,
      updatedJob.title,
      updatedJob.department,
      updatedJob.type,
      updatedJob.level || '', // Handle null/undefined level
      updatedJob.location,
      updatedJob.description,
      JSON.stringify(updatedJob.requirements),
      updatedJob.applicationUrl,
      updatedJob.isActive.toString(),
      updatedJob.createdAt.toISOString(),
      updatedJob.updatedAt.toISOString()
    ]];

    // Update the specific row (add 2 because: 1 for 1-indexing, 1 for header)
    await this.updateSheet(`Jobs!A${jobIndex + 2}:L${jobIndex + 2}`, values);
    return updatedJob;
  }

  async deleteJob(id: string): Promise<boolean> {
    // Instead of deleting, we'll mark as inactive
    const updated = await this.updateJob(id, { isActive: false } as any);
    return !!updated;
  }

  async searchJobs(keyword: string): Promise<Job[]> {
    const jobs = await this.getActiveJobs();
    const searchTerm = keyword.toLowerCase();
    
    return jobs.filter(job => 
      job.title.toLowerCase().includes(searchTerm) ||
      job.description.toLowerCase().includes(searchTerm) ||
      job.department.toLowerCase().includes(searchTerm) ||
      job.requirements.some(req => req.toLowerCase().includes(searchTerm))
    );
  }

  // Applications methods
  async getApplicationsForJob(jobId: string): Promise<Application[]> {
    const rows = await this.readSheet('Applications!A2:P1000');
    return rows
      .filter(row => row[1] === jobId) // Filter by jobId column
      .map(row => ({
        id: row[0] || '',
        jobId: row[1] || '',
        firstName: row[2] || '',
        lastName: row[3] || '',
        email: row[4] || '',
        phone: row[5] || '',
        resumeUrl: row[6] || '',
        canTravelToNaviMumbai: row[7] || '',
        currentSalary: row[8] || '',
        expectedSalary: row[9] || '',
        whyMotorOctane: row[10] || '',
        jobSpecificAnswers: row[11] || '',
        status: row[12] || 'pending',
        notes: row[13] || '',
        appliedAt: new Date(row[14] || Date.now()),
        updatedAt: new Date(row[15] || Date.now()),
      }));
  }

  async getAllApplications(): Promise<Application[]> {
    const rows = await this.readSheet('Applications!A2:P1000');
    return rows.map(row => ({
      id: row[0] || '',
      jobId: row[1] || '',
      firstName: row[2] || '',
      lastName: row[3] || '',
      email: row[4] || '',
      phone: row[5] || '',
      resumeUrl: row[6] || '',
      canTravelToNaviMumbai: row[7] || '',
      currentSalary: row[8] || '',
      expectedSalary: row[9] || '',
      whyMotorOctane: row[10] || '',
      jobSpecificAnswers: row[11] || '',
      status: row[12] || 'pending',
      notes: row[13] || '',
      appliedAt: new Date(row[14] || Date.now()),
      updatedAt: new Date(row[15] || Date.now()),
    }));
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const applications = await this.getAllApplications();
    return applications.find(app => app.id === id);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = await this.generateApplicationId();
    const now = new Date().toISOString();
    const application: Application = {
      id,
      ...insertApplication,
      phone: insertApplication.phone || null,
      resumeUrl: insertApplication.resumeUrl || null,
      canTravelToNaviMumbai: insertApplication.canTravelToNaviMumbai || null,
      currentSalary: insertApplication.currentSalary || null,
      expectedSalary: insertApplication.expectedSalary || null,
      whyMotorOctane: insertApplication.whyMotorOctane || null,
      jobSpecificAnswers: insertApplication.jobSpecificAnswers || null,
      notes: insertApplication.notes || null,
      status: 'pending',
      appliedAt: new Date(now),
      updatedAt: new Date(now),
    };

    const values = [[
      application.id,
      application.jobId,
      application.firstName,
      application.lastName,
      application.email,
      application.phone || '',
      application.resumeUrl || '',
      application.canTravelToNaviMumbai || '',
      application.currentSalary || '',
      application.expectedSalary || '',
      application.whyMotorOctane || '',
      '', // JobSpecificAnswers column left empty - data goes to separate sheet
      application.status,
      application.notes || '',
      now,
      now
    ]];

    // Ensure Applications sheet has proper headers
    await this.ensureApplicationsHeaders();
    
    // Find the next empty row to append data (prevent header duplication)
    const existingApplications = await this.readSheet('Applications!A:A');
    const nextAppRow = existingApplications.length + 1;
    
    // Use specific range instead of append to prevent header issues
    const appRange = `Applications!A${nextAppRow}:P${nextAppRow}`;
    await this.updateSheet(appRange, values);
    
    console.log(`Application stored in row ${nextAppRow}`);

    // Store job-specific responses in horizontal format only
    console.log('=== HORIZONTAL STORAGE DEBUG ===');
    console.log('Debug: jobSpecificAnswers value:', application.jobSpecificAnswers);
    if (application.jobSpecificAnswers) {
      try {
        const responses = JSON.parse(application.jobSpecificAnswers);
        console.log('Debug: parsed responses:', responses);
        
        // Get job title for better organization
        const job = await this.getJob(application.jobId);
        const jobTitle = job ? job.title : 'Unknown Job';
        
        console.log('=== CALLING HORIZONTAL STORAGE METHOD ===');
        // Store in horizontal column-wise format only
        await this.storeJobSpecificAnswersColumnWise(application, application.jobSpecificAnswers, jobTitle);
        console.log('=== HORIZONTAL STORAGE COMPLETED ===');
        
      } catch (error) {
        console.error('Error storing job-specific responses:', error);
        console.error('Raw jobSpecificAnswers data:', application.jobSpecificAnswers);
      }
    } else {
      console.log('Debug: no jobSpecificAnswers data found');
    }
    console.log('=== END HORIZONTAL STORAGE DEBUG ===');

    return application;
  }

  async updateApplicationStatus(id: string, status: string, notes?: string): Promise<Application | undefined> {
    const applications = await this.getAllApplications();
    const appIndex = applications.findIndex(app => app.id === id);
    
    if (appIndex === -1) return undefined;

    const existingApp = applications[appIndex];
    const updatedApp = { 
      ...existingApp, 
      status, 
      notes: notes || existingApp.notes,
      updatedAt: new Date() 
    };

    const values = [[
      updatedApp.id,
      updatedApp.jobId,
      updatedApp.firstName,
      updatedApp.lastName,
      updatedApp.email,
      updatedApp.phone || '',
      updatedApp.resumeUrl || '',
      updatedApp.canTravelToNaviMumbai || '',
      updatedApp.currentSalary || '',
      updatedApp.expectedSalary || '',
      updatedApp.whyMotorOctane || '',
      updatedApp.jobSpecificAnswers || '',
      updatedApp.status,
      updatedApp.notes || '',
      updatedApp.appliedAt.toISOString(),
      updatedApp.updatedAt.toISOString()
    ]];

    // Update the specific row
    await this.updateSheet(`Applications!A${appIndex + 2}:P${appIndex + 2}`, values);
    return updatedApp;
  }

  // User methods (basic implementation)
  async getUser(id: string): Promise<User | undefined> {
    // Basic implementation - you can extend this if needed
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Basic implementation - you can extend this if needed
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Basic implementation - you can extend this if needed
    const id = this.generateId();
    return { id, ...insertUser };
  }

  // Admin User methods (basic implementation)
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    // Basic implementation - you can extend this if needed
    return undefined;
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    // Basic implementation - you can extend this if needed
    return undefined;
  }

  async createAdminUser(insertAdminUser: InsertAdminUser): Promise<AdminUser> {
    // Basic implementation - you can extend this if needed
    const id = this.generateId();
    const now = new Date();
    return { id, ...insertAdminUser, createdAt: now };
  }
}