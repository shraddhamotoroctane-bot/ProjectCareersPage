// Deep test to simulate Vercel conditions and validate Google Sheets integration
import { GoogleSheetsStorage } from './server/googleSheetsStorage.js';
import { storage } from './server/storage.js';

console.log('🧪 DEEP TEST: Vercel Google Sheets Integration');
console.log('='.repeat(70));
console.log('');

// Test Results Tracker
const testResults: Array<{test: string, passed: boolean, details: string}> = [];

function logTest(name: string, passed: boolean, details: string) {
  testResults.push({ test: name, passed, details });
  const icon = passed ? '✅' : '❌';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${icon} ${name}\x1b[0m`);
  if (details) {
    console.log(`   ${details}`);
  }
}

// ============================================================================
// TEST SUITE 1: Environment Variable Validation
// ============================================================================
console.log('📋 TEST SUITE 1: Environment Variable Validation');
console.log('-'.repeat(70));

// Test 1.1: Check if variables exist
const hasSheetId = !!process.env.GOOGLE_SHEET_ID;
const hasServiceAccount = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const hasPrivateKey = !!process.env.GOOGLE_PRIVATE_KEY;

logTest(
  '1.1 GOOGLE_SHEET_ID exists',
  hasSheetId,
  hasSheetId 
    ? `Value: ${process.env.GOOGLE_SHEET_ID?.substring(0, 30)}... (length: ${process.env.GOOGLE_SHEET_ID?.length})`
    : 'Variable not set'
);

logTest(
  '1.2 GOOGLE_SERVICE_ACCOUNT_EMAIL exists',
  hasServiceAccount,
  hasServiceAccount
    ? `Value: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.substring(0, 40)}... (length: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.length})`
    : 'Variable not set'
);

logTest(
  '1.3 GOOGLE_PRIVATE_KEY exists',
  hasPrivateKey,
  hasPrivateKey
    ? `Value: ${process.env.GOOGLE_PRIVATE_KEY?.substring(0, 50)}... (length: ${process.env.GOOGLE_PRIVATE_KEY?.length})`
    : 'Variable not set'
);

// Test 1.4: Validate private key format
if (hasPrivateKey) {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!;
  const startsWith = privateKey.trimStart().startsWith('-----BEGIN PRIVATE KEY-----');
  const endsWith = privateKey.trimEnd().endsWith('-----END PRIVATE KEY-----');
  const hasNewlines = privateKey.includes('\n') || privateKey.includes('\\n');
  const length = privateKey.length;
  const validLength = length >= 1700 && length <= 2000;
  
  logTest(
    '1.4 Private key has BEGIN marker',
    startsWith,
    startsWith ? '✅ Correct' : '❌ Missing BEGIN marker'
  );
  
  logTest(
    '1.5 Private key has END marker',
    endsWith,
    endsWith ? '✅ Correct' : '❌ Missing END marker'
  );
  
  logTest(
    '1.6 Private key has newlines',
    hasNewlines,
    hasNewlines ? '✅ Has newlines' : '⚠️ No newlines (may need \\n)'
  );
  
  logTest(
    '1.7 Private key length is valid',
    validLength,
    validLength 
      ? `✅ Length: ${length} characters` 
      : `❌ Length: ${length} (expected 1700-2000)`
  );
}

// Test 1.8: Validate service account email format
if (hasServiceAccount) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const hasAt = email.includes('@');
  const endsWithServiceAccount = email.endsWith('.iam.gserviceaccount.com');
  
  logTest(
    '1.8 Service account email has @',
    hasAt,
    hasAt ? '✅ Correct' : '❌ Invalid email format'
  );
  
  logTest(
    '1.9 Service account email ends correctly',
    endsWithServiceAccount,
    endsWithServiceAccount 
      ? '✅ Correct format' 
      : '❌ Should end with .iam.gserviceaccount.com'
  );
}

// Test 1.10: Validate spreadsheet ID format
if (hasSheetId) {
  const sheetId = process.env.GOOGLE_SHEET_ID!;
  const validLength = sheetId.length >= 40 && sheetId.length <= 60;
  const hasValidChars = /^[a-zA-Z0-9_-]+$/.test(sheetId);
  
  logTest(
    '1.10 Spreadsheet ID length is valid',
    validLength,
    validLength 
      ? `✅ Length: ${sheetId.length} characters` 
      : `❌ Length: ${sheetId.length} (expected 40-60)`
  );
  
  logTest(
    '1.11 Spreadsheet ID has valid characters',
    hasValidChars,
    hasValidChars ? '✅ Valid characters' : '❌ Invalid characters detected'
  );
}

console.log('');

// ============================================================================
// TEST SUITE 2: Storage Initialization
// ============================================================================
console.log('📋 TEST SUITE 2: Storage Initialization');
console.log('-'.repeat(70));

// Test 2.1: Check storage type
const storageType = storage.constructor.name;
const isGoogleSheets = storageType === 'GoogleSheetsStorage';
const isMemory = storageType === 'MemoryStorage';

logTest(
  '2.1 Storage type is GoogleSheetsStorage',
  isGoogleSheets,
  isGoogleSheets 
    ? '✅ Using GoogleSheetsStorage' 
    : `❌ Using ${storageType} (expected GoogleSheetsStorage)`
);

if (isMemory) {
  logTest(
    '2.2 MemoryStorage fallback reason',
    false,
    '⚠️ Using MemoryStorage - environment variables may be missing'
  );
}

console.log('');

// ============================================================================
// TEST SUITE 3: Google Sheets API Connection
// ============================================================================
console.log('📋 TEST SUITE 3: Google Sheets API Connection');
console.log('-'.repeat(70));

if (isGoogleSheets && hasSheetId && hasServiceAccount && hasPrivateKey) {
  const gsStorage = storage as GoogleSheetsStorage;
  
  // Test 3.1: Try to get jobs (will trigger initialization)
  try {
    console.log('   Attempting to fetch jobs (this will test full initialization)...');
    const jobs = await gsStorage.getAllJobs();
    
    logTest(
      '3.1 Google Sheets initialization successful',
      true,
      '✅ Successfully connected to Google Sheets'
    );
    
    logTest(
      '3.2 Jobs fetched successfully',
      true,
      `✅ Found ${jobs.length} jobs in sheet`
    );
    
    if (jobs.length > 0) {
      const activeJobs = jobs.filter(j => j.isActive);
      logTest(
        '3.3 Active jobs found',
        activeJobs.length > 0,
        activeJobs.length > 0 
          ? `✅ ${activeJobs.length} active jobs` 
          : '⚠️ No active jobs (all may be inactive)'
      );
      
      // Test 3.4: Validate job structure
      const firstJob = jobs[0];
      const hasRequiredFields = !!(firstJob.id && firstJob.title && firstJob.department);
      logTest(
        '3.4 Job data structure is valid',
        hasRequiredFields,
        hasRequiredFields 
          ? `✅ Job structure valid (sample: ${firstJob.title})` 
          : '❌ Job structure missing required fields'
      );
    } else {
      logTest(
        '3.2 Jobs fetched (empty sheet)',
        true,
        '⚠️ Sheet is empty or has no data rows'
      );
    }
    
    // Test 3.5: Try to get active jobs
    try {
      const activeJobs = await gsStorage.getActiveJobs();
      logTest(
        '3.5 getActiveJobs() works',
        true,
        `✅ Found ${activeJobs.length} active jobs`
      );
    } catch (error: any) {
      logTest(
        '3.5 getActiveJobs() works',
        false,
        `❌ Error: ${error?.message || error}`
      );
    }
    
  } catch (error: any) {
    logTest(
      '3.1 Google Sheets initialization',
      false,
      `❌ Failed: ${error?.message || error}`
    );
    
    // Analyze the error
    if (error?.message?.includes('Missing')) {
      logTest(
        '3.1.1 Error analysis',
        false,
        '❌ Missing environment variables - check Vercel settings'
      );
    } else if (error?.message?.includes('permission') || error?.code === 403) {
      logTest(
        '3.1.2 Error analysis',
        false,
        '❌ Permission denied - service account needs Editor access to sheet'
      );
    } else if (error?.message?.includes('not found') || error?.code === 404) {
      logTest(
        '3.1.3 Error analysis',
        false,
        '❌ Spreadsheet not found - check GOOGLE_SHEET_ID'
      );
    } else if (error?.message?.includes('Invalid') || error?.code === 'invalid_grant') {
      logTest(
        '3.1.4 Error analysis',
        false,
        '❌ Invalid credentials - check private key format'
      );
    }
  }
} else {
  logTest(
    '3.1 Google Sheets connection test',
    false,
    '⚠️ Skipped - using MemoryStorage or missing environment variables'
  );
}

console.log('');

// ============================================================================
// TEST SUITE 4: Error Handling
// ============================================================================
console.log('📋 TEST SUITE 4: Error Handling & Edge Cases');
console.log('-'.repeat(70));

// Test 4.1: Test with missing variables (simulate Vercel issue)
const originalEnv = {
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY
};

delete process.env.GOOGLE_SHEET_ID;
delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
delete process.env.GOOGLE_PRIVATE_KEY;

try {
  const testStorage = new GoogleSheetsStorage();
  logTest(
    '4.1 Constructor handles missing variables gracefully',
    true,
    '✅ Constructor does not throw with missing variables'
  );
  
  try {
    await testStorage.getAllJobs();
    logTest(
      '4.2 Error handling for missing variables',
      false,
      '❌ Should have thrown error for missing variables'
    );
  } catch (error: any) {
    const hasHelpfulMessage = error?.message?.includes('Missing') || 
                              error?.message?.includes('not initialized');
    logTest(
      '4.2 Error handling for missing variables',
      hasHelpfulMessage,
      hasHelpfulMessage 
        ? `✅ Provides helpful error: ${error?.message?.substring(0, 60)}...` 
        : `⚠️ Error message could be more helpful: ${error?.message}`
    );
  }
} catch (error: any) {
  logTest(
    '4.1 Constructor handles missing variables',
    false,
    `❌ Constructor threw error: ${error?.message}`
  );
}

// Restore environment variables
process.env.GOOGLE_SHEET_ID = originalEnv.GOOGLE_SHEET_ID;
process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = originalEnv.GOOGLE_SERVICE_ACCOUNT_EMAIL;
process.env.GOOGLE_PRIVATE_KEY = originalEnv.GOOGLE_PRIVATE_KEY;

console.log('');

// ============================================================================
// TEST SUITE 5: Debug Logging
// ============================================================================
console.log('📋 TEST SUITE 5: Debug Logging Verification');
console.log('-'.repeat(70));

// Check if debug logs are present in the code
const fs = await import('fs');
const googleSheetsCode = fs.readFileSync('./server/googleSheetsStorage.ts', 'utf-8');

const hasDebugLogs = googleSheetsCode.includes('[DEBUG]');
const hasInitLogs = googleSheetsCode.includes('initializeSheets START');
const hasErrorLogs = googleSheetsCode.includes('initializeSheets FAILED');

logTest(
  '5.1 Debug logging is present',
  hasDebugLogs,
  hasDebugLogs ? '✅ Debug logs found in code' : '❌ Debug logs missing'
);

logTest(
  '5.2 Initialization logging present',
  hasInitLogs,
  hasInitLogs ? '✅ Initialization logs found' : '❌ Initialization logs missing'
);

logTest(
  '5.3 Error logging present',
  hasErrorLogs,
  hasErrorLogs ? '✅ Error logs found' : '❌ Error logs missing'
);

console.log('');

// ============================================================================
// SUMMARY
// ============================================================================
console.log('='.repeat(70));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(70));

const totalTests = testResults.length;
const passedTests = testResults.filter(t => t.passed).length;
const failedTests = totalTests - passedTests;
const passRate = ((passedTests / totalTests) * 100).toFixed(1);

console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`Pass Rate: ${passRate}%`);
console.log('');

if (failedTests > 0) {
  console.log('❌ FAILED TESTS:');
  console.log('-'.repeat(70));
  testResults
    .filter(t => !t.passed)
    .forEach(t => {
      console.log(`  ❌ ${t.test}`);
      if (t.details) {
        console.log(`     ${t.details}`);
      }
    });
  console.log('');
}

// Recommendations
console.log('💡 RECOMMENDATIONS:');
console.log('-'.repeat(70));

if (!hasSheetId || !hasServiceAccount || !hasPrivateKey) {
  console.log('  ⚠️  Missing environment variables:');
  if (!hasSheetId) console.log('     - Set GOOGLE_SHEET_ID in Vercel');
  if (!hasServiceAccount) console.log('     - Set GOOGLE_SERVICE_ACCOUNT_EMAIL in Vercel');
  if (!hasPrivateKey) console.log('     - Set GOOGLE_PRIVATE_KEY in Vercel');
  console.log('     - Redeploy after setting variables');
}

if (isMemory) {
  console.log('  ⚠️  Using MemoryStorage - set all environment variables to use GoogleSheetsStorage');
}

if (hasPrivateKey) {
  const pk = process.env.GOOGLE_PRIVATE_KEY!;
  if (!pk.trimStart().startsWith('-----BEGIN PRIVATE KEY-----')) {
    console.log('  ⚠️  Private key missing BEGIN marker - check format');
  }
  if (!pk.trimEnd().endsWith('-----END PRIVATE KEY-----')) {
    console.log('  ⚠️  Private key missing END marker - check format');
  }
}

if (hasServiceAccount) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  if (!email.endsWith('.iam.gserviceaccount.com')) {
    console.log('  ⚠️  Service account email format may be incorrect');
  }
  console.log('  ✅ Verify service account has Editor access to Google Sheet');
}

console.log('  ✅ After deploying to Vercel, check:');
console.log('     - /api/debug/google-sheets endpoint');
console.log('     - Vercel function logs for [DEBUG] markers');
console.log('');

console.log('='.repeat(70));
console.log('✅ Deep test completed!');
console.log('='.repeat(70));

