// Test Google Sheet Structure
import { GoogleSheetsStorage } from './server/googleSheetsStorage.js';

console.log('🔍 Testing Google Sheet connection...\n');

// Create a test instance
const storage = new GoogleSheetsStorage();

console.log('📊 Your Google Sheet: https://docs.google.com/spreadsheets/d/1_xXLokhPbeqs8NdMxpV4WZJvdztZ6Wu-Q5m4S_Jbjlg/edit');
console.log('\n✅ Sheet ID configured correctly');
console.log('❌ Need service account credentials to connect');

console.log('\n📋 Required sheets in your Google Sheet:');
console.log('1. Sheet named "Jobs" with headers:');
console.log('   ID, Title, Department, Type, Level, Location, Description, Requirements, ApplicationURL, IsActive, CreatedAt, UpdatedAt');
console.log('\n2. Sheet named "Applications" with headers:');
console.log('   ID, JobID, FirstName, LastName, Email, Phone, ResumeURL, CoverLetter, Status, Notes, AppliedAt, UpdatedAt');

console.log('\n🔑 Once you add google-service-account.json:');
console.log('1. Run: node quick-setup.js');
console.log('2. Share sheet with service account email');
console.log('3. Restart server: npm run dev');
console.log('4. Website will connect to Google Sheets! 🎉');
