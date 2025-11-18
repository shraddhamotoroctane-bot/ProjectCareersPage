// Test storage initialization to find potential Vercel errors
import { GoogleSheetsStorage } from './server/googleSheetsStorage.js';

console.log('🧪 Testing Google Sheets Storage Initialization\n');
console.log('='.repeat(60));

// Simulate Vercel conditions - no environment variables
console.log('\n📋 Test: Missing Environment Variables (Most Common Vercel Issue)');
console.log('-'.repeat(60));

// Clear all environment variables
const originalEnv = {
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY
};

delete process.env.GOOGLE_SHEET_ID;
delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
delete process.env.GOOGLE_PRIVATE_KEY;

try {
  console.log('Creating GoogleSheetsStorage instance...');
  const storage = new GoogleSheetsStorage();
  console.log('✅ Constructor completed');
  console.log('Storage type:', storage.constructor.name);
  
  // Try to initialize (this will fail)
  console.log('\nAttempting to get jobs (will trigger initialization)...');
  try {
    await storage.getAllJobs();
    console.log('✅ getAllJobs succeeded (unexpected)');
  } catch (error: any) {
    console.log('❌ getAllJobs failed as expected');
    console.log('Error type:', error?.constructor?.name);
    console.log('Error message:', error?.message);
    console.log('This is the error that would appear in Vercel logs');
  }
} catch (error: any) {
  console.error('❌ Constructor error:', error?.message);
  console.error('Error type:', error?.constructor?.name);
}

// Restore environment variables
process.env.GOOGLE_SHEET_ID = originalEnv.GOOGLE_SHEET_ID;
process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = originalEnv.GOOGLE_SERVICE_ACCOUNT_EMAIL;
process.env.GOOGLE_PRIVATE_KEY = originalEnv.GOOGLE_PRIVATE_KEY;

console.log('\n' + '='.repeat(60));
console.log('✅ Test completed');
console.log('\n💡 Key Findings:');
console.log('   - Constructor should not throw (handles missing vars gracefully)');
console.log('   - Initialization errors occur when trying to use the storage');
console.log('   - Debug logs will show exactly where it fails');

