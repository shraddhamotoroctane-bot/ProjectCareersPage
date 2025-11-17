// Google Sheets Setup Helper
// Run this after completing the Google Cloud setup

const fs = require('fs');
const path = require('path');

console.log('🔗 Google Sheets Integration Setup Helper\n');

console.log('📋 Next Steps:');
console.log('1. Download your service account JSON file from Google Cloud');
console.log('2. Save it as "google-service-account.json" in this project folder');
console.log('3. Copy your Google Sheet ID from the URL');
console.log('4. Run: node setup-google-sheets.js <SHEET_ID>');
console.log('\nExample: node setup-google-sheets.js 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');

const sheetId = process.argv[2];

if (!sheetId) {
  console.log('\n❌ Please provide your Google Sheet ID as an argument');
  process.exit(1);
}

// Check if credentials file exists
const credentialsPath = path.join(__dirname, 'google-service-account.json');
if (!fs.existsSync(credentialsPath)) {
  console.log('\n❌ google-service-account.json not found!');
  console.log('Please download your service account JSON file and save it as "google-service-account.json"');
  process.exit(1);
}

// Read credentials to get service account email
let serviceAccountEmail;
try {
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  serviceAccountEmail = credentials.client_email;
  console.log(`\n✅ Found service account: ${serviceAccountEmail}`);
} catch (error) {
  console.log('\n❌ Error reading credentials file:', error.message);
  process.exit(1);
}

// Create .env file
const envContent = `# Google Sheets Configuration
GOOGLE_SHEET_ID=${sheetId}
GOOGLE_SERVICE_ACCOUNT_EMAIL=${serviceAccountEmail}
GOOGLE_PRIVATE_KEY="${fs.readFileSync(credentialsPath, 'utf8').match(/"private_key":\s*"([^"]+)"/)[1]}"

# Server Configuration  
PORT=5000
`;

fs.writeFileSync('.env', envContent);

console.log('\n✅ .env file created successfully!');
console.log('\n🔗 Final Steps:');
console.log('1. Share your Google Sheet with:', serviceAccountEmail);
console.log('2. Give the service account "Editor" permissions');
console.log('3. Restart your development server: npm run dev');
console.log('\n🎉 Your website will then be connected to Google Sheets!');
