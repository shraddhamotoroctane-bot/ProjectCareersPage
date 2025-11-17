import { google } from 'googleapis';
import { Readable } from 'stream';

class GoogleDriveService {
  private drive: any;
  private initialized: boolean = false;

  constructor() { console.log('🔐 GOOGLE_APPLICATION_CREDENTIALS =', process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log('🔐 GOOGLE_SHEET_ID =', process.env.GOOGLE_SHEET_ID);
    // Will initialize on first use
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeDrive();
      this.initialized = true;
    }
  }

  private async initializeDrive() {
    try {
      // Get environment variables (same as Google Sheets)
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;

      if (!serviceAccountEmail || !privateKey) {
        throw new Error('Missing Google Drive credentials. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.');
      }

      // Create JWT auth from service account credentials
      const auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: privateKey.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/drive.file']
      });
      
      this.drive = google.drive({ version: 'v3', auth });
      console.log('Google Drive authentication successful');
    } catch (error) {
      console.error('Failed to initialize Google Drive:', error);
      throw error;
    }
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string | null> {
    try {
      await this.ensureInitialized();
      
      console.log(`Starting Google Drive upload for file: ${fileName}`);
      
      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(fileBuffer);
      bufferStream.push(null);

      const fileMetadata = {
        name: fileName,
        // Save to a folder called "MotorOctane CVs" - create if doesn't exist
        parents: await this.getOrCreateFolder('MotorOctane CVs')
      };

      const media = {
        mimeType: mimeType,
        body: bufferStream,
      };

      console.log('Uploading file to Google Drive...');
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink',
      });

      console.log('File uploaded to Google Drive successfully:', response.data.name);
      console.log('File ID:', response.data.id);
      
      // Make file shareable (viewable by anyone with link)
      console.log('Setting file permissions...');
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      console.log('File permissions set. WebView Link:', response.data.webViewLink);
      return response.data.webViewLink;
    } catch (error: unknown) {
      console.error('Error uploading to Google Drive:', error);

      // Safely log error details if it's an Error instance
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }

      // Safely log response details if available (common with Axios errors)
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as any).response === 'object' &&
        (error as any).response !== null &&
        'data' in (error as any).response
      ) {
        console.error('Error response:', (error as any).response.data);
      }

      // Return null instead of throwing to prevent application crash
      return null;
    }
  }

  private async getOrCreateFolder(folderName: string): Promise<string[]> {
    try {
      // Search for existing folder
      const response = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (response.data.files && response.data.files.length > 0) {
        return [response.data.files[0].id];
      }

      // Create folder if it doesn't exist
      const folderResponse = await this.drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });

      console.log('Created Google Drive folder:', folderName);
      return [folderResponse.data.id];
    } catch (error) {
      console.error('Error creating/finding folder:', error);
      return []; // No folder, will save to root
    }
  }
}

export { GoogleDriveService };
