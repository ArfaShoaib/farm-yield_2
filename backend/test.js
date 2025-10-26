
// ===================================
// FILE: backend/test.js
// Quick API tester using Node.js
// ===================================

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TEST_WALLET = 'BYTUgEJ66MDzQHAjf19ir2rHfPvMobVkjg1UgnaiTqB8';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`\n${colors.yellow}🧪 ${msg}${colors.reset}`)
};

async function testAPI() {
  console.log('\n═══════════════════════════════════════');
  console.log('🧪 FarmYield API Test Suite');
  console.log('═══════════════════════════════════════\n');

  let reportId = null;

  try {
    // Test 1: Health Check
    log.test('Test 1: Health Check');
    const health = await axios.get('http://localhost:5000/health');
    log.success(`Health: ${health.data.status}`);
    log.info(`Network: ${health.data.network}`);
    log.info(`Treasury: ${health.data.treasuryConfigured ? 'Configured' : 'Not configured'}`);

    // Test 2: Login/Register User
    log.test('Test 2: User Login/Register');
    const login = await axios.post(`${API_URL}/auth/login`, {
      walletAddress: TEST_WALLET,
      username: 'Test Farmer',
      location: { district: 'Multan', province: 'Punjab' }
    });
    log.success(`User logged in: ${login.data.user.username}`);
    log.info(`Total Reports: ${login.data.user.totalReports}`);

    // Test 3: Get Profile
    log.test('Test 3: Get User Profile');
    const profile = await axios.get(`${API_URL}/auth/profile/${TEST_WALLET}`);
    log.success(`Profile fetched: ${profile.data.user.username}`);
    log.info(`Reputation: ${profile.data.user.reputationScore}`);

    // Test 4: Submit Report
    log.test('Test 4: Submit Crop Report');
    const reportData = {
      cropType: 'wheat',
      quantity: 500,
      unit: 'kg',
      latitude: 30.1575,
      longitude: 71.5249,
      district: 'Multan',
      province: 'Punjab',
      village: 'Test Village',
      marketPrice: 3500
    };
    
    const report = await axios.post(`${API_URL}/reports/submit`, reportData, {
      headers: { 'x-wallet-address': TEST_WALLET }
    });
    reportId = report.data.report._id;
    log.success(`Report submitted: ${report.data.report.reportId}`);
    log.info(`Status: ${report.data.report.status}`);

    // Test 5: Get All Reports
    log.test('Test 5: Get All Reports');
    const reports = await axios.get(`${API_URL}/reports?limit=5`);
    log.success(`Fetched ${reports.data.reports.length} reports`);
    log.info(`Total in DB: ${reports.data.pagination.total}`);

    // Test 6: Vote on Report
    if (reportId) {
      log.test('Test 6: Vote on Report');
      const vote = await axios.post(
        `${API_URL}/reports/${reportId}/vote`,
        { voteType: 'approve', comment: 'Test vote' },
        { headers: { 'x-wallet-address': '9cnaWqT8uHes44V8gVqvfKNRSs3zu3DdTSTkiFz3ubZr' } }
      );
      log.success(`Vote recorded: ${vote.data.report.status}`);
      log.info(`Votes: ${JSON.stringify(vote.data.report.votes)}`);
    }

    // Test 7: Get Map Data
    log.test('Test 7: Get Map Data');
    const mapData = await axios.get(`${API_URL}/reports/map/data`);
    log.success(`Map data fetched: ${mapData.data.data.length} data points`);

    // Test 8: Get Leaderboard
    log.test('Test 8: Get Leaderboard');
    const leaderboard = await axios.get(`${API_URL}/auth/leaderboard?limit=5`);
    log.success(`Leaderboard fetched: ${leaderboard.data.leaderboard.length} users`);

    // Test 9: Get User's Reports
    log.test('Test 9: Get User\'s Reports');
    const userReports = await axios.get(`${API_URL}/reports/user/${TEST_WALLET}`);
    log.success(`User reports fetched: ${userReports.data.reports.length} reports`);

    console.log('\n═══════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run tests
testAPI();
