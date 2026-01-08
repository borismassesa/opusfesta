# Supabase OAuth Setup Guide

## Issue
If you're seeing the error: `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`, it means the OAuth providers (Google/Apple) are not enabled in your Supabase project.

## Solution: Enable OAuth Providers in Supabase

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project

### Step 2: Enable Google OAuth
1. Navigate to **Authentication** → **Providers** in the left sidebar
2. Find **Google** in the list of providers
3. Toggle it to **Enabled**
4. You'll need to provide:
   - **Client ID (for OAuth)**: From Google Cloud Console
   - **Client Secret (for OAuth)**: From Google Cloud Console
5. Click **Save**

### Step 3: Enable Apple OAuth
1. In the same **Providers** page
2. Find **Apple** in the list
3. Toggle it to **Enabled**
4. You'll need to provide:
   - **Services ID**: From Apple Developer account
   - **Secret Key**: From Apple Developer account
5. Click **Save**

### Step 4: Configure Redirect URLs
1. Go to **Authentication** → **URL Configuration**
2. Add your redirect URLs:
   - **Development**: `http://localhost:3000/auth/callback`
   - **Production**: `https://yourdomain.com/auth/callback`
3. Click **Save**

### Step 5: Get OAuth Credentials

#### For Google:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: Add your Supabase callback URL
   - Format: `https://[your-project-ref].supabase.co/auth/v1/callback`
7. Copy **Client ID** and **Client Secret** to Supabase

#### For Apple:
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create a **Services ID**:
   - Click the "+" button to create a new identifier
   - Select "Services IDs" and continue
   - Enter a description (e.g., "TheFesta Web App")
   - Enter an identifier in reverse-domain format: `com.yourcompany.thefesta` (NOT an email address)
   - Register the Services ID
4. Configure **Sign in with Apple**:
   - Click on your Services ID
   - Check "Sign in with Apple"
   - Click "Configure"
   - Select your Primary App ID (or create one if needed)
   - Add your domain (e.g., `thefesta.com` or `localhost:3000` for development)
   - Add redirect URLs:
     - Development: `http://localhost:3000/auth/callback`
     - Production: `https://yourdomain.com/auth/callback`
   - Save the configuration
5. Create a **Key** for Sign in with Apple:
   - Go to **Keys** section
   - Click the "+" button to create a new key
   - Enter a key name (e.g., "TheFesta Sign in with Apple")
   - Check "Sign in with Apple"
   - Click "Configure" and select your Primary App ID
   - Click "Continue" and then "Register"
   - **IMPORTANT**: Download the key file (`.p8`) - you can only download it once!
   - Note the **Key ID** shown
6. Generate the **Secret Key (JWT)**:
   - You need to create a JWT using the downloaded `.p8` key file
   - Use the following information:
     - **Team ID**: Found in your Apple Developer account membership
     - **Key ID**: From step 5
     - **Client ID**: Your Services ID from step 3 (e.g., `com.yourcompany.thefesta`)
     - **Private Key**: Contents of the `.p8` file
   - You can use online tools or libraries to generate the JWT, or use this Node.js script:
   ```javascript
   const jwt = require('jsonwebtoken');
   const fs = require('fs');
   
   const teamId = 'YOUR_TEAM_ID';
   const keyId = 'YOUR_KEY_ID';
   const clientId = 'com.yourcompany.thefesta'; // Your Services ID
   const privateKey = fs.readFileSync('path/to/your/key.p8');
   
   const token = jwt.sign(
     { iss: teamId, iat: Math.floor(Date.now() / 1000) },
     privateKey,
     {
       algorithm: 'ES256',
       expiresIn: '180d', // Apple keys expire after 6 months
       audience: 'https://appleid.apple.com',
       subject: clientId,
       keyid: keyId,
     }
   );
   
   console.log(token); // This is your Secret Key
   ```
7. Copy to Supabase:
   - **Client IDs**: Your Services ID (e.g., `com.yourcompany.thefesta`) - NOT an email address
   - **Secret Key (for OAuth)**: The JWT token generated in step 6

## Testing
After enabling the providers:
1. Try signing in with Google/Apple from the login page
2. You should be redirected to the provider's authentication page
3. After authentication, you'll be redirected back to your app

## Troubleshooting

### Error: "Provider is not enabled"
- **Solution**: Make sure you've toggled the provider to **Enabled** in Supabase Dashboard
- **Check**: Go to Authentication → Providers and verify the toggle is ON

### Error: "Invalid redirect URI"
- **Solution**: Add the correct redirect URL in both:
  - Supabase Dashboard → Authentication → URL Configuration
  - Google Cloud Console / Apple Developer Portal (OAuth settings)

### Error: "Invalid client credentials"
- **Solution**: Verify that:
  - Client ID and Secret are correctly copied (no extra spaces)
  - Credentials are from the correct project/environment
  - OAuth consent screen is properly configured (Google)

### Apple OAuth: "Invalid characters" in Client IDs
- **Error**: "Invalid characters. Each ID should follow a reverse-domain style string (e.g. com.example.app)"
- **Solution**: 
  - Client IDs must be in reverse-domain format: `com.yourcompany.appname`
  - Do NOT use an email address (e.g., `user@gmail.com` is invalid)
  - Use your Services ID from Apple Developer Portal
  - Example: `com.thefesta.webapp` or `com.yourcompany.thefesta`

### Apple OAuth: "Secret key should be a JWT"
- **Error**: "Secret key should be a JWT"
- **Solution**:
  - The Secret Key must be a valid JWT token, not the raw `.p8` key file
  - Generate the JWT using your Team ID, Key ID, Services ID, and the `.p8` private key
  - Use the script provided in the setup instructions above
  - The JWT expires after 6 months - you'll need to regenerate it

## Notes
- OAuth providers must be enabled in Supabase Dashboard for the authentication to work
- Each provider requires separate configuration with their respective credentials
- Redirect URLs must match exactly in all configurations
- For development, use `http://localhost:3000`
- For production, use your actual domain
