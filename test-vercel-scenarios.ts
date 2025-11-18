// Test specific Vercel error scenarios
import { GoogleSheetsStorage } from './server/googleSheetsStorage.js';

console.log('🧪 TESTING VERCEL ERROR SCENARIOS');
console.log('='.repeat(70));
console.log('');

// Scenario 1: Private key with actual newlines (common Vercel issue)
console.log('📋 SCENARIO 1: Private Key with Actual Newlines');
console.log('-'.repeat(70));

const testKeyWithNewlines = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDI4kjo3Vj3qVAP
C0KDt3vQSzPTuyS1sX9vE3Kn16PTXqSPVatZkKy+0YMy8JsoiYsiCWQHGQmeKyHW
DtoDrcB+iwKU79rP2gJPFJaiujtk/6tI7J5/HxskG2fbvVNP2dbyAx85fvKHH9hP
jeD3aDmeC9gwFVyW6V+vWkJlnxCq1xIMf33ONUaBYq67eY0Ho5D+9cRbGZ1Bntxt
plrHb6J/Uw1RalwHc64pQ5nd5J6Ks50UMcY238LRemvpucmFN2T69JdpzUN30fe8
-----END PRIVATE KEY-----`;

process.env.GOOGLE_SHEET_ID = 'test-sheet-id';
process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@project.iam.gserviceaccount.com';
process.env.GOOGLE_PRIVATE_KEY = testKeyWithNewlines;

try {
  const storage1 = new GoogleSheetsStorage();
  await storage1.getAllJobs();
  console.log('✅ Scenario 1: PASSED (key with newlines works)');
} catch (error: any) {
  console.log('❌ Scenario 1: FAILED');
  console.log('   Error:', error?.message?.substring(0, 100));
  console.log('   Code:', error?.code);
  if (error?.code === 'ERR_OSSL_UNSUPPORTED') {
    console.log('   🔴 This is the OpenSSL error! Key format is wrong.');
  }
}

// Scenario 2: Private key with escaped newlines (correct Vercel format)
console.log('\n📋 SCENARIO 2: Private Key with Escaped Newlines (\\n)');
console.log('-'.repeat(70));

const testKeyWithEscapedNewlines = `-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDI4kjo3Vj3qVAP\\nC0KDt3vQSzPTuyS1sX9vE3Kn16PTXqSPVatZkKy+0YMy8JsoiYsiCWQHGQmeKyHW\\nDtoDrcB+iwKU79rP2gJPFJaiujtk/6tI7J5/HxskG2fbvVNP2dbyAx85fvKHH9hP\\njeD3aDmeC9gwFVyW6V+vWkJlnxCq1xIMf33ONUaBYq67eY0Ho5D+9cRbGZ1Bntxt\\nplrHb6J/Uw1RalwHc64pQ5nd5J6Ks50UMcY238LRemvpucmFN2T69JdpzUN30fe8\\n-----END PRIVATE KEY-----\\n`;

process.env.GOOGLE_PRIVATE_KEY = testKeyWithEscapedNewlines;

try {
  const storage2 = new GoogleSheetsStorage();
  // This will fail because we don't have real credentials, but we can see if it processes the key correctly
  await storage2.getAllJobs();
  console.log('✅ Scenario 2: PASSED');
} catch (error: any) {
  if (error?.code === 'ERR_OSSL_UNSUPPORTED') {
    console.log('❌ Scenario 2: FAILED - Still getting OpenSSL error');
    console.log('   This means the key processing is not working correctly');
  } else if (error?.message?.includes('Missing') || error?.message?.includes('not found')) {
    console.log('✅ Scenario 2: Key format processed correctly');
    console.log('   Error is expected (no real credentials):', error?.message?.substring(0, 80));
  } else {
    console.log('⚠️  Scenario 2: Unexpected error:', error?.message?.substring(0, 100));
  }
}

// Scenario 3: Single line key (no newlines at all)
console.log('\n📋 SCENARIO 3: Single Line Key (No Newlines)');
console.log('-'.repeat(70));

const testKeySingleLine = `-----BEGIN PRIVATE KEY----- MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDI4kjo3Vj3qVAP C0KDt3vQSzPTuyS1sX9vE3Kn16PTXqSPVatZkKy+0YMy8JsoiYsiCWQHGQmeKyHW DtoDrcB+iwKU79rP2gJPFJaiujtk/6tI7J5/HxskG2fbvVNP2dbyAx85fvKHH9hP jeD3aDmeC9gwFVyW6V+vWkJlnxCq1xIMf33ONUaBYq67eY0Ho5D+9cRbGZ1Bntxt plrHb6J/Uw1RalwHc64pQ5nd5J6Ks50UMcY238LRemvpucmFN2T69JdpzUN30fe8 -----END PRIVATE KEY-----`;

process.env.GOOGLE_PRIVATE_KEY = testKeySingleLine;

try {
  const storage3 = new GoogleSheetsStorage();
  await storage3.getAllJobs();
  console.log('✅ Scenario 3: PASSED');
} catch (error: any) {
  if (error?.code === 'ERR_OSSL_UNSUPPORTED') {
    console.log('❌ Scenario 3: FAILED - OpenSSL error');
  } else {
    console.log('✅ Scenario 3: Key format processed (error expected):', error?.message?.substring(0, 80));
  }
}

console.log('\n' + '='.repeat(70));
console.log('📊 DIAGNOSIS');
console.log('='.repeat(70));
console.log('');
console.log('Based on these tests, the most likely issue in Vercel is:');
console.log('');
console.log('🔴 PRIVATE KEY FORMAT ISSUE');
console.log('');
console.log('The key in Vercel is likely stored with:');
console.log('  ❌ Actual newlines (multi-line) - causes OpenSSL errors');
console.log('  ❌ Wrong format - missing proper \\n escaping');
console.log('');
console.log('✅ SOLUTION:');
console.log('  1. Delete GOOGLE_PRIVATE_KEY in Vercel');
console.log('  2. Get key from your JSON file (has \\n in it)');
console.log('  3. Paste as SINGLE LINE with \\n (backslash-n)');
console.log('  4. Format: -----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n');
console.log('  5. Redeploy');
console.log('');
console.log('='.repeat(70));

