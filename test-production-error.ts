// Comprehensive test to find the production error
import { GoogleSheetsStorage } from './server/googleSheetsStorage.js';
import { storage } from './server/storage.js';

console.log('🧪 PRODUCTION ERROR DIAGNOSTIC TEST');
console.log('='.repeat(70));
console.log('');

const testResults: Array<{test: string, passed: boolean, error?: string, details?: any}> = [];

function logTest(name: string, passed: boolean, error?: string, details?: any) {
  testResults.push({ test: name, passed, error, details });
  const icon = passed ? '✅' : '❌';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${icon} ${name}\x1b[0m`);
  if (error) {
    console.log(`   Error: ${error}`);
  }
  if (details) {
    console.log(`   Details:`, details);
  }
}

// ============================================================================
// TEST 1: Environment Variables Check
// ============================================================================
console.log('📋 TEST 1: Environment Variables');
console.log('-'.repeat(70));

const hasSheetId = !!process.env.GOOGLE_SHEET_ID;
const hasServiceAccount = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const hasPrivateKey = !!process.env.GOOGLE_PRIVATE_KEY;

logTest('1.1 GOOGLE_SHEET_ID exists', hasSheetId, 
  !hasSheetId ? 'Variable not set' : undefined,
  hasSheetId ? { length: process.env.GOOGLE_SHEET_ID?.length } : undefined
);

logTest('1.2 GOOGLE_SERVICE_ACCOUNT_EMAIL exists', hasServiceAccount,
  !hasServiceAccount ? 'Variable not set' : undefined,
  hasServiceAccount ? { 
    length: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.length,
    endsWith: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.endsWith('.iam.gserviceaccount.com')
  } : undefined
);

logTest('1.3 GOOGLE_PRIVATE_KEY exists', hasPrivateKey,
  !hasPrivateKey ? 'Variable not set' : undefined,
  hasPrivateKey ? { length: process.env.GOOGLE_PRIVATE_KEY?.length } : undefined
);

// ============================================================================
// TEST 2: Private Key Format Analysis
// ============================================================================
console.log('\n📋 TEST 2: Private Key Format Analysis');
console.log('-'.repeat(70));

if (hasPrivateKey) {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!;
  
  const startsWith = privateKey.trimStart().startsWith('-----BEGIN PRIVATE KEY-----');
  const endsWith = privateKey.trimEnd().endsWith('-----END PRIVATE KEY-----');
  const hasEscapedNewlines = privateKey.includes('\\n');
  const hasActualNewlines = privateKey.includes('\n');
  const hasCarriageReturn = privateKey.includes('\r');
  const length = privateKey.length;
  const validLength = length >= 1700 && length <= 2000;
  
  logTest('2.1 Has BEGIN marker', startsWith,
    !startsWith ? 'Missing -----BEGIN PRIVATE KEY-----' : undefined
  );
  
  logTest('2.2 Has END marker', endsWith,
    !endsWith ? 'Missing -----END PRIVATE KEY-----' : undefined
  );
  
  logTest('2.3 Has escaped newlines (\\n)', hasEscapedNewlines,
    !hasEscapedNewlines ? 'Should have \\n for Vercel' : undefined,
    { recommendation: 'For Vercel, use \\n (backslash-n) not actual newlines' }
  );
  
  logTest('2.4 Has actual newlines', hasActualNewlines,
    hasActualNewlines ? 'Has actual newlines - may cause issues in Vercel' : undefined,
    { recommendation: 'Vercel works better with \\n format' }
  );
  
  logTest('2.5 Has carriage returns', hasCarriageReturn,
    hasCarriageReturn ? 'Has \\r which may cause issues' : undefined
  );
  
  logTest('2.6 Valid length', validLength,
    !validLength ? `Length ${length} is outside expected range (1700-2000)` : undefined,
    { length, expected: '1700-2000' }
  );
  
  // Analyze key structure
  const keyContent = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');
  
  logTest('2.7 Key content length', keyContent.length > 100,
    keyContent.length <= 100 ? `Key content too short: ${keyContent.length} chars` : undefined,
    { contentLength: keyContent.length }
  );
} else {
  logTest('2.1-2.7 Private key format tests', false, 'Skipped - GOOGLE_PRIVATE_KEY not set');
}

// ============================================================================
// TEST 3: Storage Initialization
// ============================================================================
console.log('\n📋 TEST 3: Storage Initialization');
console.log('-'.repeat(70));

const storageType = storage.constructor.name;
const isGoogleSheets = storageType === 'GoogleSheetsStorage';

logTest('3.1 Using GoogleSheetsStorage', isGoogleSheets,
  !isGoogleSheets ? `Using ${storageType} instead` : undefined
);

// ============================================================================
// TEST 4: Google Sheets Connection Test
// ============================================================================
console.log('\n📋 TEST 4: Google Sheets Connection Test');
console.log('-'.repeat(70));

if (isGoogleSheets && hasSheetId && hasServiceAccount && hasPrivateKey) {
  const gsStorage = storage as GoogleSheetsStorage;
  
  try {
    console.log('   Attempting to initialize and fetch jobs...');
    const jobs = await gsStorage.getAllJobs();
    
    logTest('4.1 Connection successful', true,
      undefined,
      { jobsCount: jobs.length }
    );
    
    logTest('4.2 Jobs retrieved', jobs.length > 0,
      jobs.length === 0 ? 'No jobs found in sheet' : undefined,
      { 
        jobsCount: jobs.length,
        note: jobs.length === 0 ? 'Sheet may be empty or all jobs inactive' : 'Success'
      }
    );
    
    if (jobs.length > 0) {
      const activeJobs = jobs.filter(j => j.isActive);
      logTest('4.3 Active jobs found', activeJobs.length > 0,
        activeJobs.length === 0 ? 'No active jobs' : undefined,
        { activeJobs: activeJobs.length, totalJobs: jobs.length }
      );
    }
    
  } catch (error: any) {
    logTest('4.1 Connection test', false,
      error?.message || String(error),
      {
        errorType: error?.constructor?.name,
        errorCode: error?.code,
        errorStatus: error?.status || error?.response?.status,
        opensslError: error?.opensslErrorStack?.[0],
        isOpenSSLError: error?.code === 'ERR_OSSL_UNSUPPORTED' || !!error?.opensslErrorStack,
        isPermissionError: error?.code === 403 || error?.message?.includes('permission'),
        isNotFoundError: error?.code === 404 || error?.message?.includes('not found'),
        fullError: error?.stack?.split('\n').slice(0, 5).join('\n')
      }
    );
    
    // Provide specific diagnosis
    if (error?.code === 'ERR_OSSL_UNSUPPORTED' || error?.opensslErrorStack) {
      console.log('\n🔴 DIAGNOSIS: Private Key Format Error');
      console.log('   The private key cannot be decoded by OpenSSL.');
      console.log('   SOLUTION: In Vercel, paste key as SINGLE LINE with \\n');
      console.log('   Example: -----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n');
    } else if (error?.code === 403 || error?.message?.includes('permission')) {
      console.log('\n🔴 DIAGNOSIS: Permission Denied');
      console.log('   Service account does not have access to the spreadsheet.');
      console.log('   SOLUTION: Share Google Sheet with service account email (Editor access)');
    } else if (error?.code === 404 || error?.message?.includes('not found')) {
      console.log('\n🔴 DIAGNOSIS: Spreadsheet Not Found');
      console.log('   The GOOGLE_SHEET_ID is incorrect or spreadsheet does not exist.');
      console.log('   SOLUTION: Verify spreadsheet ID matches your actual sheet');
    } else {
      console.log('\n🔴 DIAGNOSIS: Unknown Error');
      console.log('   Error type:', error?.constructor?.name);
      console.log('   Error code:', error?.code);
      console.log('   Error message:', error?.message);
    }
  }
} else {
  logTest('4.1 Connection test', false, 'Skipped - Missing environment variables or using MemoryStorage');
}

// ============================================================================
// TEST 5: Simulate Vercel Conditions
// ============================================================================
console.log('\n📋 TEST 5: Simulate Vercel Private Key Format');
console.log('-'.repeat(70));

if (hasPrivateKey) {
  const originalKey = process.env.GOOGLE_PRIVATE_KEY!;
  
  // Test with escaped newlines (Vercel format)
  const vercelFormatKey = originalKey.replace(/\n/g, '\\n').replace(/\r\n/g, '\\n');
  
  // Temporarily set to Vercel format
  process.env.GOOGLE_PRIVATE_KEY = vercelFormatKey;
  
  try {
    const testStorage = new GoogleSheetsStorage();
    await testStorage.getAllJobs();
    logTest('5.1 Vercel format key works', true);
  } catch (error: any) {
    logTest('5.1 Vercel format key', false,
      error?.message?.substring(0, 100),
      {
        isOpenSSLError: error?.code === 'ERR_OSSL_UNSUPPORTED',
        errorCode: error?.code
      }
    );
  }
  
  // Restore original
  process.env.GOOGLE_PRIVATE_KEY = originalKey;
}

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n' + '='.repeat(70));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(70));

const totalTests = testResults.length;
const passedTests = testResults.filter(t => t.passed).length;
const failedTests = totalTests - passedTests;

console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log('');

if (failedTests > 0) {
  console.log('❌ FAILED TESTS:');
  console.log('-'.repeat(70));
  testResults
    .filter(t => !t.passed)
    .forEach(t => {
      console.log(`  ❌ ${t.test}`);
      if (t.error) {
        console.log(`     Error: ${t.error}`);
      }
      if (t.details) {
        console.log(`     Details:`, JSON.stringify(t.details, null, 2));
      }
    });
  console.log('');
}

// Final Recommendations
console.log('💡 RECOMMENDATIONS:');
console.log('-'.repeat(70));

const hasOpenSSLError = testResults.some(t => 
  t.details?.isOpenSSLError || t.error?.includes('OpenSSL')
);

if (hasOpenSSLError) {
  console.log('🔴 CRITICAL: OpenSSL Decoder Error Detected');
  console.log('');
  console.log('   The private key format is incorrect for Vercel.');
  console.log('   FIX:');
  console.log('   1. Go to Vercel → Settings → Environment Variables');
  console.log('   2. Delete GOOGLE_PRIVATE_KEY');
  console.log('   3. Create new one');
  console.log('   4. Paste key as SINGLE LINE with \\n (backslash-n)');
  console.log('   5. Format: -----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n');
  console.log('   6. Redeploy');
  console.log('');
}

const hasPermissionError = testResults.some(t => 
  t.details?.isPermissionError
);

if (hasPermissionError) {
  console.log('🔴 CRITICAL: Permission Denied Error');
  console.log('');
  console.log('   Service account does not have access to Google Sheet.');
  console.log('   FIX:');
  console.log('   1. Open your Google Sheet');
  console.log('   2. Click "Share" button');
  console.log('   3. Add service account email with Editor access');
  console.log('   4. Service account: areers21@carlogform.iam.gserviceaccount.com');
  console.log('');
}

const hasNotFoundError = testResults.some(t => 
  t.details?.isNotFoundError
);

if (hasNotFoundError) {
  console.log('🔴 CRITICAL: Spreadsheet Not Found');
  console.log('');
  console.log('   The GOOGLE_SHEET_ID is incorrect.');
  console.log('   FIX:');
  console.log('   1. Open your Google Sheet');
  console.log('   2. Copy ID from URL: /d/{ID}/edit');
  console.log('   3. Update GOOGLE_SHEET_ID in Vercel');
  console.log('   4. Redeploy');
  console.log('');
}

if (failedTests === 0) {
  console.log('✅ All tests passed! The issue may be in Vercel deployment.');
  console.log('   Check:');
  console.log('   - Latest code is deployed');
  console.log('   - Environment variables are set correctly');
  console.log('   - Service account has sheet access');
}

console.log('\n' + '='.repeat(70));
console.log('✅ Diagnostic test completed!');
console.log('='.repeat(70));

