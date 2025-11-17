import { type User, type InsertUser, type Job, type InsertJob, type Application, type InsertApplication, type AdminUser, type InsertAdminUser } from "../shared/schema.js";
import { IStorage } from "./storage.js";

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private adminUsers: AdminUser[] = [];
  private jobs: Job[] = [];
  private applications: Application[] = [];

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.generateId(),
      ...user
    };
    this.users.push(newUser);
    return newUser;
  }

  // Admin Users
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    return this.adminUsers.find(admin => admin.id === id);
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    return this.adminUsers.find(admin => admin.email === email);
  }

  async createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser> {
    const newAdminUser: AdminUser = {
      id: this.generateId(),
      ...adminUser,
      createdAt: new Date()
    };
    this.adminUsers.push(newAdminUser);
    return newAdminUser;
  }

  // Jobs
  async getAllJobs(): Promise<Job[]> {
    return this.jobs;
  }

  async getActiveJobs(): Promise<Job[]> {
    return this.jobs.filter(job => job.isActive);
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.find(job => job.id === id);
  }

  async createJob(job: InsertJob): Promise<Job> {
    const newJob: Job = {
      id: this.generateId(),
      ...job,
      level: job.level || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.jobs.push(newJob);
    return newJob;
  }

  async updateJob(id: string, jobUpdate: Partial<InsertJob>): Promise<Job | undefined> {
    const jobIndex = this.jobs.findIndex(job => job.id === id);
    if (jobIndex === -1) return undefined;

    this.jobs[jobIndex] = {
      ...this.jobs[jobIndex],
      ...jobUpdate,
      updatedAt: new Date()
    };
    return this.jobs[jobIndex];
  }

  async deleteJob(id: string): Promise<boolean> {
    const jobIndex = this.jobs.findIndex(job => job.id === id);
    if (jobIndex === -1) return false;

    this.jobs.splice(jobIndex, 1);
    return true;
  }

  async searchJobs(keyword: string): Promise<Job[]> {
    const lowerKeyword = keyword.toLowerCase();
    return this.jobs.filter(job => 
      job.title.toLowerCase().includes(lowerKeyword) ||
      job.department.toLowerCase().includes(lowerKeyword) ||
      job.description.toLowerCase().includes(lowerKeyword) ||
      job.requirements.some(req => req.toLowerCase().includes(lowerKeyword))
    );
  }

  // Applications
  async getApplicationsForJob(jobId: string): Promise<Application[]> {
    return this.applications.filter(app => app.jobId === jobId);
  }

  async getAllApplications(): Promise<Application[]> {
    return this.applications;
  }

  async getApplication(id: string): Promise<Application | undefined> {
    return this.applications.find(app => app.id === id);
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const newApplication: Application = {
      id: this.generateId(),
      ...application,
      phone: application.phone || null,
      resumeUrl: application.resumeUrl || null,
      canTravelToNaviMumbai: application.canTravelToNaviMumbai || null,
      currentSalary: application.currentSalary || null,
      expectedSalary: application.expectedSalary || null,
      whyMotorOctane: application.whyMotorOctane || null,
      jobSpecificAnswers: application.jobSpecificAnswers || null,
      notes: application.notes || null,
      status: application.status || 'pending',
      appliedAt: new Date(),
      updatedAt: new Date()
    };
    this.applications.push(newApplication);
    return newApplication;
  }

  async updateApplicationStatus(id: string, status: string, notes?: string): Promise<Application | undefined> {
    const appIndex = this.applications.findIndex(app => app.id === id);
    if (appIndex === -1) return undefined;

    this.applications[appIndex] = {
      ...this.applications[appIndex],
      status,
      notes: notes || this.applications[appIndex].notes,
      updatedAt: new Date()
    };
    return this.applications[appIndex];
  }
}
