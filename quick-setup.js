// Quick Google Sheets Setup
import fs from 'fs';

console.log('🔗 Setting up Google Sheets connection...\n');

const SHEET_ID = '1_xXLokhPbeqs8NdMxpV4WZJvdztZ6Wu-Q5m4S_Jbjlg';

// Check if credentials file exists
if (!fs.existsSync('google-service-account.json')) {
  console.log('❌ Missing: google-service-account.json');
  console.log('\n📋 Steps to get this file:');
  console.log('1. Go to: https://console.cloud.google.com/');
  console.log('2. Enable Google Sheets API');
  console.log('3. Create Service Account');
  console.log('4. Download JSON key');
  console.log('5. Save as "google-service-account.json" in this folder');
  console.log('6. Run: node quick-setup.js');
  process.exit(1);
}

// Read credentials
let credentials;
try {
  credentials = JSON.parse(fs.readFileSync('google-service-account.json', 'utf8'));
  console.log('✅ Found credentials file');
} catch (error) {
  console.log('❌ Error reading credentials:', error.message);
  process.exit(1);
}

// Extract service account email and private key
const serviceAccountEmail = credentials.client_email;
const privateKey = credentials.private_key;

console.log(`📧 Service Account: ${serviceAccountEmail}`);

// Create .env file
const envContent = `# Google Sheets Configuration
GOOGLE_SHEET_ID=${SHEET_ID}
GOOGLE_SERVICE_ACCOUNT_EMAIL=${serviceAccountEmail}
GOOGLE_PRIVATE_KEY="${privateKey}"

# Server Configuration
PORT=5000
`;

fs.writeFileSync('.env', envContent);

console.log('\n✅ .env file created successfully!');
console.log('\n🔗 IMPORTANT - Final Steps:');
console.log(`1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`);
console.log(`2. Click "Share" button`);
console.log(`3. Add this email as Editor: ${serviceAccountEmail}`);
console.log('4. Restart server: npm run dev');
console.log('\n🎉 Then your website will be connected to Google Sheets!');
