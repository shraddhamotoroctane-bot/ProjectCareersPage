import { Response } from "express";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export class LocalFileStorageService {
  private uploadsDir: string;

  constructor() {
    // Get current directory for ES modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Create uploads directory in the server folder
    this.uploadsDir = path.join(__dirname, 'uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      console.log('Created uploads directory:', this.uploadsDir);
    }
  }

  // Stores a file buffer to local storage and returns an access path
  async storeFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const fileId = randomUUID();
    const fileExtension = fileName.split('.').pop() || '';
    const storedFileName = `${fileId}.${fileExtension}`;
    const filePath = path.join(this.uploadsDir, storedFileName);

    // Write file to local storage
    fs.writeFileSync(filePath, fileBuffer);

    console.log(`File stored locally: ${storedFileName}`);
    
    // Return the access path for the API
    return `/api/files/${storedFileName}`;
  }

  // Gets a file from local storage
  getFile(fileName: string): { exists: boolean; filePath?: string } {
    const filePath = path.join(this.uploadsDir, fileName);
    const exists = fs.existsSync(filePath);
    
    return {
      exists,
      filePath: exists ? filePath : undefined
    };
  }

  // Downloads a file to the response
  downloadFile(fileName: string, res: Response): void {
    const { exists, filePath } = this.getFile(fileName);
    
    if (!exists || !filePath) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    try {
      // Get file stats
      const stats = fs.statSync(filePath);
      
      // Determine content type based on file extension
      const ext = path.extname(fileName).toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (ext) {
        case '.pdf':
          contentType = 'application/pdf';
          break;
        case '.doc':
          contentType = 'application/msword';
          break;
        case '.docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
      }

      // Set headers
      res.set({
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=3600'
      });

      // Create read stream and pipe to response
      const readStream = fs.createReadStream(filePath);
      
      readStream.on('error', (err) => {
        console.error('Error reading file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error reading file' });
        }
      });

      readStream.pipe(res);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ error: 'Error downloading file' });
    }
  }
}
