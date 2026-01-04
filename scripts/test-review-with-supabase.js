/**
 * Test Review API using Supabase Client
 * This script uses your Supabase credentials to authenticate and test the review API
 * 
 * Usage: node scripts/test-review-with-supabase.js
 * 
 * Make sure you have these environment variables set:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)
 * - Or edit the script to use your credentials directly
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Get Supabase credentials from environment or use defaults
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.log('\nPlease set environment variables:');
  console.log('  export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"');
  console.log('  export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"');
  console.log('\nOr edit this script to include them directly.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test data
const USER_EMAIL = 'boris.massesa@thefestaevents.com';
const USER_PASSWORD = process.env.USER_PASSWORD; // You'll need to provide this
const VENDOR_ID = 'b0000002-0002-4002-8002-000000000002'; // Bella Photography
const INQUIRY_ID = 'ba0f7d62-5cdf-4018-ae62-81bf935a2156';
const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testReviewSubmission() {
  console.log('🧪 Testing Review Submission API');
  console.log('================================\n');

  // Step 1: Sign in to get token
  console.log('📝 Step 1: Authenticating...');
  
  if (!USER_PASSWORD) {
    console.log('⚠️  USER_PASSWORD not set. Using existing session if available...');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('❌ No active session. Please provide password:');
      console.log('   export USER_PASSWORD="your-password"');
      console.log('   Or sign in through your app first');
      return;
    }
    
    console.log('✅ Using existing session');
    await testWithToken(session.access_token);
  } else {
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: USER_EMAIL,
      password: USER_PASSWORD,
    });

    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      console.log('\nTroubleshooting:');
      console.log('1. Check your password is correct');
      console.log('2. Make sure the user exists in auth.users');
      console.log('3. Try signing in through your app first');
      return;
    }

    console.log('✅ Signed in successfully');
    console.log(`   User: ${user.email}`);
    
    // Get the session token
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await testWithToken(session.access_token);
    }
  }
}

async function testWithToken(token) {
  console.log('\n📝 Step 2: Submitting review...');
  
  const reviewData = {
    vendorId: VENDOR_ID,
    inquiryId: INQUIRY_ID,
    rating: 5,
    title: 'Amazing Photography Service!',
    content: 'Bella Photography Studio provided exceptional service for our wedding. The photos turned out beautifully and the team was professional throughout the entire event.',
    eventType: 'wedding',
    eventDate: '2025-12-24',
  };

  try {
    const response = await fetch(`${API_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Review submitted successfully!');
      console.log('\nReview Details:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.review) {
        console.log(`\n📋 Review ID: ${data.review.id}`);
        console.log(`   Status: ${data.review.moderationStatus}`);
        console.log(`   Verified: ${data.review.verified}`);
      }
    } else {
      console.error('❌ Failed to submit review');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${data.error || JSON.stringify(data)}`);
      
      if (response.status === 401) {
        console.log('\n💡 Tip: Token might be expired. Try signing in again.');
      } else if (response.status === 403) {
        console.log('\n💡 Tip: Check that:');
        console.log('   - User has a completed inquiry for this vendor');
        console.log('   - Inquiry status is "accepted" or "responded"');
        console.log('   - Event date is in the past');
      }
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.log('\n💡 Tip: Make sure your website app is running:');
    console.log('   cd apps/website && npm run dev');
  }
}

// Run the test
testReviewSubmission().catch(console.error);
