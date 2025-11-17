import { type User, type InsertUser, type Job, type InsertJob, type Application, type InsertApplication, type AdminUser, type InsertAdminUser } from "../shared/schema";
import { GoogleSheetsStorage } from "./googleSheetsStorage";
import { MemoryStorage } from "./memoryStorage";

// modify the interface with any CRUD methods
// you might need

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

// Use memory storage for development if Google Sheets credentials are not available
const hasGoogleSheetId = !!process.env.GOOGLE_SHEET_ID;
const hasServiceAccountEmail = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const hasPrivateKey = !!process.env.GOOGLE_PRIVATE_KEY;

const useMemoryStorage = !hasGoogleSheetId || !hasServiceAccountEmail || !hasPrivateKey;

if (useMemoryStorage) {
  console.warn('⚠️ Using MemoryStorage - Google Sheets credentials not found');
  console.warn('Missing:', {
    GOOGLE_SHEET_ID: !hasGoogleSheetId,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: !hasServiceAccountEmail,
    GOOGLE_PRIVATE_KEY: !hasPrivateKey
  });
} else {
  console.log('✅ Using GoogleSheetsStorage');
  console.log('Google Sheet ID:', process.env.GOOGLE_SHEET_ID);
}

export const storage = useMemoryStorage ? new MemoryStorage() : new GoogleSheetsStorage();
