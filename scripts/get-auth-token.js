/**
 * Helper script to get authentication token
 * Run with: node scripts/get-auth-token.js
 * 
 * This helps you get a JWT token for testing
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔑 Get Authentication Token');
console.log('============================\n');
console.log('Options:');
console.log('1. Get token from Supabase Dashboard');
console.log('   - Go to: Supabase Dashboard → Authentication → Users');
console.log('   - Find your user: boris.massesa@thefestaevents.com');
console.log('   - Click on user → Copy access token\n');
console.log('2. Get token from browser (if logged in)');
console.log('   - Open DevTools → Application → Local Storage');
console.log('   - Look for: supabase.auth.token or similar\n');
console.log('3. Generate token via API (requires password)');
console.log('   - Use the curl command in TEST_REVIEW_SUBMISSION.md\n');

rl.question('Do you have your token? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    rl.question('Paste your token here: ', (token) => {
      console.log('\n✅ Token received!');
      console.log('\nTo use it, run:');
      console.log(`export USER_TOKEN="${token}"`);
      console.log('\nThen run the test script:');
      console.log('./scripts/test-review-api.sh');
      rl.close();
    });
  } else {
    console.log('\n📖 See docs/TEST_REVIEW_SUBMISSION.md for detailed instructions');
    rl.close();
  }
});
