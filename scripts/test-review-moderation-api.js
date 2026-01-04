/**
 * Test script for Review Moderation API
 * Run with: node scripts/test-review-moderation-api.js
 * 
 * Prerequisites:
 * 1. Set ADMIN_TOKEN environment variable (admin user JWT)
 * 2. Set USER_TOKEN environment variable (regular user JWT)
 * 3. Set VENDOR_ID environment variable (test vendor UUID)
 * 4. Set INQUIRY_ID environment variable (completed inquiry UUID)
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const USER_TOKEN = process.env.USER_TOKEN;
const VENDOR_ID = process.env.VENDOR_ID;
const INQUIRY_ID = process.env.INQUIRY_ID;

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI(method, endpoint, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
    };
  }
}

async function runTests() {
  log('\n🧪 Review Moderation API Tests', 'blue');
  log('================================\n', 'blue');

  // Check prerequisites
  if (!ADMIN_TOKEN) {
    log('❌ ADMIN_TOKEN environment variable not set', 'red');
    log('   Set it with: export ADMIN_TOKEN="your-admin-jwt-token"', 'yellow');
    return;
  }

  if (!USER_TOKEN) {
    log('❌ USER_TOKEN environment variable not set', 'red');
    log('   Set it with: export USER_TOKEN="your-user-jwt-token"', 'yellow');
    return;
  }

  if (!VENDOR_ID) {
    log('❌ VENDOR_ID environment variable not set', 'red');
    log('   Set it with: export VENDOR_ID="vendor-uuid"', 'yellow');
    return;
  }

  // Test 1: Submit a review
  log('\n📝 Test 1: Submit Review', 'blue');
  log('-------------------------', 'blue');
  
  const reviewData = {
    vendorId: VENDOR_ID,
    rating: 5,
    title: 'Test Review',
    content: 'This is a test review for moderation testing.',
    eventType: 'wedding',
    eventDate: new Date().toISOString().split('T')[0],
    ...(INQUIRY_ID && { inquiryId: INQUIRY_ID }),
  };

  const submitResult = await testAPI('POST', '/api/reviews', reviewData, USER_TOKEN);
  
  if (submitResult.ok) {
    log('✅ Review submitted successfully', 'green');
    log(`   Review ID: ${submitResult.data.review?.id}`, 'green');
    log(`   Status: ${submitResult.data.review?.moderationStatus}`, 'green');
    
    const reviewId = submitResult.data.review?.id;
    
    // Test 2: Get pending reviews (admin)
    log('\n📋 Test 2: Get Pending Reviews (Admin)', 'blue');
    log('----------------------------------------', 'blue');
    
    const pendingResult = await testAPI('GET', '/api/admin/reviews?status=pending&limit=10', null, ADMIN_TOKEN);
    
    if (pendingResult.ok) {
      log('✅ Fetched pending reviews successfully', 'green');
      log(`   Found ${pendingResult.data.reviews?.length || 0} pending reviews`, 'green');
      
      if (pendingResult.data.reviews?.length > 0) {
        const testReview = pendingResult.data.reviews.find(r => r.id === reviewId) || pendingResult.data.reviews[0];
        
        // Test 3: Approve review
        log('\n✅ Test 3: Approve Review', 'blue');
        log('-------------------------', 'blue');
        
        const approveResult = await testAPI(
          'POST',
          `/api/admin/reviews/${testReview.id}/moderate`,
          { action: 'approve', notes: 'Test approval' },
          ADMIN_TOKEN
        );
        
        if (approveResult.ok) {
          log('✅ Review approved successfully', 'green');
          log(`   Status: ${approveResult.data.review?.moderationStatus}`, 'green');
        } else {
          log(`❌ Failed to approve review: ${approveResult.data?.error || approveResult.error}`, 'red');
        }
        
        // Test 4: Reject review (create another one first)
        log('\n❌ Test 4: Reject Review', 'blue');
        log('-------------------------', 'blue');
        
        // Submit another review for rejection test
        const rejectReviewData = {
          vendorId: VENDOR_ID,
          rating: 1,
          title: 'Test Review for Rejection',
          content: 'This review will be rejected.',
        };
        
        const rejectSubmitResult = await testAPI('POST', '/api/reviews', rejectReviewData, USER_TOKEN);
        
        if (rejectSubmitResult.ok && rejectSubmitResult.data.review?.id) {
          const rejectReviewId = rejectSubmitResult.data.review.id;
          
          // Wait a bit for the review to be created
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const rejectResult = await testAPI(
            'POST',
            `/api/admin/reviews/${rejectReviewId}/moderate`,
            { action: 'reject', reason: 'Test rejection - inappropriate content' },
            ADMIN_TOKEN
          );
          
          if (rejectResult.ok) {
            log('✅ Review rejected successfully', 'green');
            log(`   Status: ${rejectResult.data.review?.moderationStatus}`, 'green');
          } else {
            log(`❌ Failed to reject review: ${rejectResult.data?.error || rejectResult.error}`, 'red');
          }
        }
      }
    } else {
      log(`❌ Failed to fetch pending reviews: ${pendingResult.data?.error || pendingResult.error}`, 'red');
      log(`   Status: ${pendingResult.status}`, 'red');
    }
    
    // Test 5: Get all reviews with filters
    log('\n🔍 Test 5: Get Reviews with Filters', 'blue');
    log('------------------------------------', 'blue');
    
    const allStatuses = ['pending', 'approved', 'rejected', 'flagged'];
    for (const status of allStatuses) {
      const filterResult = await testAPI('GET', `/api/admin/reviews?status=${status}&limit=5`, null, ADMIN_TOKEN);
      if (filterResult.ok) {
        log(`✅ Fetched ${status} reviews: ${filterResult.data.reviews?.length || 0}`, 'green');
      }
    }
    
  } else {
    log(`❌ Failed to submit review: ${submitResult.data?.error || submitResult.error}`, 'red');
    log(`   Status: ${submitResult.status}`, 'red');
    
    if (submitResult.status === 401) {
      log('   ⚠️  Authentication failed. Check USER_TOKEN.', 'yellow');
    } else if (submitResult.status === 403) {
      log('   ⚠️  User may not have permission to review this vendor.', 'yellow');
      log('   ⚠️  Ensure user has a completed inquiry for this vendor.', 'yellow');
    }
  }

  log('\n✅ Test suite completed!', 'green');
  log('\nNext steps:', 'blue');
  log('1. Check the admin interface at /reviews', 'yellow');
  log('2. Verify reviews appear with correct moderation status', 'yellow');
  log('3. Test the UI moderation actions', 'yellow');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests, testAPI };
