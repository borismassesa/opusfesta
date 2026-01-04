# Quick Test Guide - Review Submission API

## Option 1: Get Token from Supabase Dashboard (Easiest) ⭐

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find your user: `boris.massesa@thefestaevents.com`
3. Click on the user
4. In the user details, look for **"Access Token"** or **"Generate new token"**
5. Copy the token

Then test:
```bash
export USER_TOKEN="your-token-here"
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "vendorId": "b0000002-0002-4002-8002-000000000002",
    "inquiryId": "ba0f7d62-5cdf-4018-ae62-81bf935a2156",
    "rating": 5,
    "title": "Amazing Photography Service!",
    "content": "Bella Photography Studio provided exceptional service for our wedding.",
    "eventType": "wedding",
    "eventDate": "2025-12-24"
  }'
```

## Option 2: Test Through Browser (If App is Running)

1. Make sure your website app is running:
   ```bash
   cd apps/website
   npm run dev
   ```

2. Open browser: `http://localhost:3000`

3. Log in with: `boris.massesa@thefestaevents.com`

4. Open DevTools (F12) → **Console** tab

5. Run this JavaScript in the console:
   ```javascript
   // Get your token
   const token = localStorage.getItem('sb-<your-project>-auth-token') || 
                 JSON.parse(localStorage.getItem('supabase.auth.token') || '{}').access_token;
   
   console.log('Your token:', token);
   
   // Test the API
   fetch('http://localhost:3000/api/reviews', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify({
       vendorId: 'b0000002-0002-4002-8002-000000000002',
       inquiryId: 'ba0f7d62-5cdf-4018-ae62-81bf935a2156',
       rating: 5,
       title: 'Amazing Photography Service!',
       content: 'Bella Photography Studio provided exceptional service for our wedding.',
       eventType: 'wedding',
       eventDate: '2025-12-24'
     })
   })
   .then(r => r.json())
   .then(data => console.log('Response:', data))
   .catch(err => console.error('Error:', err));
   ```

## Option 3: Generate Token via API

If you know your password:

```bash
# Replace with your actual Supabase URL and anon key
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"

curl -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "boris.massesa@thefestaevents.com",
    "password": "YOUR_PASSWORD"
  }' | jq -r '.access_token'
```

Then use that token in Option 1.

## Verify Review Was Created

After submitting, check the database:

```sql
SELECT 
  id,
  vendor_id,
  user_id,
  rating,
  title,
  content,
  moderation_status,
  verified,
  inquiry_id,
  created_at
FROM reviews
WHERE user_id = 'ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e'
ORDER BY created_at DESC
LIMIT 1;
```

## Expected Response

If successful, you should see:
```json
{
  "success": true,
  "review": {
    "id": "review-uuid",
    "vendorId": "b0000002-0002-4002-8002-000000000002",
    "rating": 5,
    "moderationStatus": "approved",
    "verified": true,
    "createdAt": "2025-12-31T..."
  }
}
```

The review should be **auto-approved** because your inquiry status is `accepted` and the event date is in the past.
