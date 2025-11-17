import { google } from 'googleapis';
import { Readable } from 'stream';

export class GoogleDriveService {
  private drive: any;
  private initialized: boolean = false;

  constructor() {
    // Don't throw during construction - initialize lazily
    this.initialized = false;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      // Use the same authentication approach as GoogleSheetsStorage
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;

      if (!serviceAccountEmail || !privateKey) {
        throw new Error('Missing Google Drive credentials. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.');
      }

      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: serviceAccountEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        },
        scopes: [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive'
        ]
      });

      this.drive = google.drive({ version: 'v3', auth });
      this.initialized = true;
      console.log('Google Drive service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Drive service:', error);
      throw error;
    }
  }

  async createFolderIfNotExists(folderName: string): Promise<string> {
    try {
      await this.ensureInitialized();
      
      // Check if folder already exists
      const response = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
        spaces: 'drive'
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create folder if it doesn't exist
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      };

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id'
      });

      // Make folder publicly accessible
      await this.drive.permissions.create({
        fileId: folder.data.id,
        resource: {
          role: 'reader',
          type: 'anyone'
        }
      });

      console.log(`Created Google Drive folder: ${folderName} with ID: ${folder.data.id}`);
      return folder.data.id;
    } catch (error) {
      console.error('Error creating Google Drive folder:', error);
      throw error;
    }
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string, folderId?: string): Promise<string> {
    try {
      await this.ensureInitialized();
      
      const fileMetadata: any = {
        name: fileName
      };

      if (folderId) {
        fileMetadata.parents = [folderId];
      }

      const media = {
        mimeType: mimeType,
        body: Readable.from(fileBuffer)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      });

      const fileId = response.data.id;

      // Make file publicly accessible
      await this.drive.permissions.create({
        fileId: fileId,
        resource: {
          role: 'reader',
          type: 'anyone'
        }
      });

      // Generate direct download link
      const downloadLink = `https://drive.google.com/uc?id=${fileId}&export=download`;
      
      console.log(`Uploaded file to Google Drive: ${fileName} with ID: ${fileId}`);
      console.log(`Direct download link: ${downloadLink}`);
      
      return downloadLink;
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw error;
    }
  }

  async uploadCVToFolder(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      // Ensure MotorOctane CVs folder exists
      const folderId = await this.createFolderIfNotExists('MotorOctane CVs');
      
      // Upload file to the folder
      return await this.uploadFile(fileBuffer, fileName, mimeType, folderId);
    } catch (error) {
      console.error('Error uploading CV to Google Drive folder:', error);
      throw error;
    }
  }

  async uploadCoverLetterToFolder(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      // Ensure MotorOctane Cover Letters folder exists
      const folderId = await this.createFolderIfNotExists('MotorOctane Cover Letters');
      
      // Upload file to the folder
      return await this.uploadFile(fileBuffer, fileName, mimeType, folderId);
    } catch (error) {
      console.error('Error uploading cover letter to Google Drive folder:', error);
      throw error;
    }
  }

  // Alias method to match LocalFileStorageService interface
  async storeFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    return await this.uploadCVToFolder(fileBuffer, fileName, mimeType);
  }

  // Method to handle file downloads (redirect to Google Drive)
  downloadFile(fileName: string, res: any): void {
    // Since files are stored in Google Drive with public access,
    // we need to redirect to the Google Drive download URL
    // This is a simplified approach - in production you might want to store file IDs
    res.status(302).redirect(`https://drive.google.com/uc?export=download&id=${fileName}`);
  }
}