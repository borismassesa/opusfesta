# Careers Portal Account Creation and Login Flow

## Complete Flow Diagram

```mermaid
flowchart TD
    Start([User visits Careers Portal]) --> Browse[Browse Job Listings]
    Browse --> ApplyClick{User clicks<br/>Apply Now?}
    
    ApplyClick -->|Not Authenticated| RedirectToLogin[Redirect to<br/>/careers/login?next=/careers/id/apply]
    ApplyClick -->|Authenticated| ShowApplyForm[Show Application Form]
    
    RedirectToLogin --> LoginOrSignup{User Action}
    
    LoginOrSignup -->|Has Account| Login[Enter Email & Password]
    LoginOrSignup -->|New User| Signup[Go to /careers/signup]
    
    %% Signup Flow
    Signup --> FillSignupForm[Fill Signup Form:<br/>- First Name<br/>- Last Name<br/>- Email<br/>- Phone optional<br/>- Password]
    FillSignupForm --> SubmitSignup[POST /api/auth/signup]
    
    SubmitSignup --> CheckExisting{User Exists?}
    CheckExisting -->|Yes, Verified| ErrorMsg1[Error: Account exists<br/>Redirect to Login]
    CheckExisting -->|Yes, Not Verified| RedirectVerify1[Redirect to<br/>/verify-email]
    CheckExisting -->|No| CreateAuthUser[Create User in Supabase Auth<br/>email_confirmed = false]
    
    CreateAuthUser --> GenerateCode[Generate 6-digit<br/>Verification Code]
    GenerateCode --> HashCode[Hash Code SHA-256]
    HashCode --> StoreCode[Store in verification_codes table:<br/>- email<br/>- code_hash<br/>- user_id<br/>- expires_at 10min]
    StoreCode --> SendEmail[Send Email with<br/>Verification Code]
    SendEmail --> RedirectVerify2[Redirect to<br/>/verify-email?email=...&next=...]
    
    %% Verification Flow
    RedirectVerify1 --> VerifyPage[Verify Email Page]
    RedirectVerify2 --> VerifyPage
    VerifyPage --> EnterCode[User Enters<br/>6-digit Code]
    EnterCode --> VerifyAPI[POST /api/auth/verify-code]
    
    VerifyAPI --> ValidateCode{Code Valid?}
    ValidateCode -->|Invalid/Expired| ErrorMsg2[Show Error<br/>Allow Resend]
    ValidateCode -->|Valid| MarkVerified[Mark code as verified]
    
    MarkVerified --> ConfirmEmail[Admin API:<br/>email_confirm = true]
    ConfirmEmail --> CreateUserRecord[Create/Update user in<br/>users table via upsert]
    CreateUserRecord --> ReturnSuccess[Return requiresSignIn: true]
    
    ReturnSuccess --> CheckContext{In Careers<br/>Context?}
    CheckContext -->|Yes| RedirectCareersLogin[Redirect to<br/>/careers/login?verified=true<br/>&email=...&next=...]
    CheckContext -->|No| RedirectMainLogin[Redirect to<br/>/login?verified=true<br/>&email=...]
    
    %% Login Flow
    RedirectCareersLogin --> LoginPage[Careers Login Page]
    RedirectMainLogin --> LoginPage
    Login --> LoginPage
    ErrorMsg1 --> LoginPage
    
    LoginPage --> EnterCredentials[Enter Email & Password]
    EnterCredentials --> SignInAPI[supabase.auth.signInWithPassword]
    
    SignInAPI --> CheckAuth{Sign In<br/>Success?}
    CheckAuth -->|Error| ShowError[Show Error Message:<br/>- Invalid credentials<br/>- Email not confirmed<br/>- Too many requests]
    CheckAuth -->|Success| CheckSession{Session<br/>Created?}
    
    CheckSession -->|No| ShowError2[Error: No session]
    CheckSession -->|Yes| ClearRedirectGuard[Clear redirect_guard<br/>from sessionStorage]
    ClearRedirectGuard --> EnsureUserRecord[ensureUserRecord session]
    
    EnsureUserRecord --> CheckUserExists{User in<br/>users table?}
    CheckUserExists -->|Yes| GetUserType[Get userType from role]
    CheckUserExists -->|No| CreateUserRecord2[Create user record<br/>in users table]
    CreateUserRecord2 --> GetUserType
    
    GetUserType --> GetRedirectPath[getRedirectPath userType, next]
    GetRedirectPath --> ClearStorage[Clear auth_redirect<br/>from sessionStorage]
    ClearStorage --> RedirectUser[Redirect to:<br/>- /careers/[id]/apply if next set<br/>- /careers if careers context<br/>- / otherwise]
    
    %% Protected Page Flow
    RedirectUser --> ProtectedPage{Protected Page?<br/>e.g., /careers/id/apply}
    ProtectedPage -->|Yes| ApplyClient[ApplyClient Component]
    ProtectedPage -->|No| ShowContent[Show Page Content]
    
    ApplyClient --> CheckAuthState[Check Auth State:<br/>onAuthStateChange listener]
    CheckAuthState --> GetSession[supabase.auth.getSession]
    
    GetSession --> HasSession{Has<br/>Session?}
    HasSession -->|No| CheckRedirectGuard{Redirect<br/>Guard < 2?}
    HasSession -->|Yes| VerifyUser[Verify User Record]
    
    CheckRedirectGuard -->|Yes| IncrementGuard[Increment redirect_guard<br/>in sessionStorage]
    IncrementGuard --> RedirectToLogin2[Redirect to<br/>/careers/login?next=...]
    RedirectToLogin2 --> LoginPage
    
    CheckRedirectGuard -->|No| BreakLoop[Break Loop:<br/>Redirect to /careers]
    
    VerifyUser --> CheckUserAuth{User in<br/>Auth?}
    CheckUserAuth -->|No| SignOut[Sign Out<br/>Redirect to Login]
    CheckUserAuth -->|Yes| EnsureRecord[ensureUserRecord]
    
    EnsureRecord --> RecordSuccess{Record<br/>Created?}
    RecordSuccess -->|Yes| ClearGuard[Clear redirect_guard]
    RecordSuccess -->|No| RedirectToLogin2
    
    ClearGuard --> SetAuthenticated[Set isCheckingAuth = false<br/>authStatus = authenticated]
    SetAuthenticated --> LoadJob[Load Job Details]
    LoadJob --> ShowApplyForm
    
    ShowApplyForm --> SubmitApplication[User Submits<br/>Application]
    SubmitApplication --> Success[Application Submitted<br/>Redirect to /careers]
    
    style Start fill:#e1f5ff
    style ShowApplyForm fill:#c8e6c9
    style Success fill:#c8e6c9
    style ErrorMsg1 fill:#ffcdd2
    style ErrorMsg2 fill:#ffcdd2
    style ShowError fill:#ffcdd2
    style ShowError2 fill:#ffcdd2
    style BreakLoop fill:#fff9c4
```

## Step-by-Step Flow

### 1. Account Creation Flow

#### Step 1.1: User Initiates Signup
- **Location**: `/careers/signup`
- **Action**: User fills out signup form
  - First Name (required)
  - Last Name (required)
  - Email (required)
  - Phone (optional)
  - Password (required, min 8 characters)
  - `userType` is automatically set to `"couple"` for careers signups

#### Step 1.2: Submit Signup Request
- **API**: `POST /api/auth/signup`
- **Backend Process**:
  1. Validates input data (Zod schema)
  2. Checks if user already exists in Supabase Auth
  3. **If user exists and verified**: Returns error, suggests login
  4. **If user exists but not verified**: Returns error with `canResend: true`, redirects to verify page
  5. **If user doesn't exist**: Creates new user in Supabase Auth
     - Sets `email_confirmed: false`
     - Stores user metadata (firstName, lastName, phone, userType)

#### Step 1.3: Generate Verification Code
- **Backend Process**:
  1. Generates 6-digit random code (100000-999999)
  2. Hashes code using SHA-256
  3. Stores in `verification_codes` table:
     - `email`
     - `code_hash` (hashed code)
     - `user_id` (from auth.users)
     - `expires_at` (10 minutes from now)
     - `purpose: "email_verification"`
     - `verified: false`
     - `attempts: 0`

#### Step 1.4: Send Verification Email
- **Backend Process**:
  1. Sends email via Resend with verification code
  2. Email contains the 6-digit code

#### Step 1.5: Redirect to Verification Page
- **Location**: `/verify-email?email=...&next=...`
- **Action**: 
  - Stores `next` parameter in `sessionStorage` as `auth_redirect`
  - Shows OTP input form
  - Displays countdown timer (10 minutes)

### 2. Email Verification Flow

#### Step 2.1: User Enters Verification Code
- **Location**: `/verify-email`
- **Action**: User enters 6-digit code from email

#### Step 2.2: Verify Code
- **API**: `POST /api/auth/verify-code`
- **Backend Process**:
  1. Hashes entered code
  2. Looks up code in `verification_codes` table:
     - Matches `email`, `code_hash`, `purpose`, `verified: false`
     - Checks `expires_at` > now
     - Checks `attempts` < 5
  3. **If invalid**: Increments attempts, returns error
  4. **If valid**:
     - Marks code as `verified: true`
     - Confirms email in Supabase Auth: `email_confirm: true`
     - Creates/updates user record in `users` table via upsert:
       - `id` (from auth.users)
       - `email`
       - `password` (placeholder, not used)
       - `name` (from metadata)
       - `phone` (from metadata)
       - `role: "user"` (for careers users)
     - Returns `requiresSignIn: true` (no session tokens)

#### Step 2.3: Redirect to Login
- **Context Detection**: Checks if in careers context:
  - Checks `next` parameter for "/careers"
  - Checks `sessionStorage.auth_redirect` for "/careers"
  - Checks `window.location.pathname` for "/careers"
- **Redirect**:
  - **Careers context**: `/careers/login?verified=true&email=...&next=...`
  - **Non-careers context**: `/login?verified=true&email=...`

### 3. Login Flow

#### Step 3.1: User Enters Credentials
- **Location**: `/careers/login`
- **Action**: User enters email and password

#### Step 3.2: Sign In
- **API**: `supabase.auth.signInWithPassword({ email, password })`
- **Process**:
  1. Supabase validates credentials
  2. Checks if email is confirmed
  3. Creates session if valid

#### Step 3.3: Handle Login Response
- **If Error**:
  - **Invalid credentials**: "Invalid email or password. Please check your credentials and try again."
  - **Email not confirmed**: "Please verify your email address before signing in. Check your inbox for the verification code."
  - **Too many requests**: "Too many sign-in attempts. Please wait a moment and try again."
  - **Other errors**: Shows error message from Supabase

- **If Success**:
  1. Clears `auth_redirect_guard` from sessionStorage
  2. Calls `ensureUserRecord(session)`:
     - Checks if user exists in `users` table
     - If not exists, creates user record
     - Returns userType
  3. Gets redirect path via `getRedirectPath(userType, undefined, next)`
  4. Clears `auth_redirect` from sessionStorage
  5. Redirects user:
     - If `next` parameter exists and is valid: redirects to `next`
     - If in careers context: redirects to `/careers` or specific careers page
     - Otherwise: redirects to `/`

### 4. Protected Page Access Flow

#### Step 4.1: User Accesses Protected Page
- **Example**: `/careers/[id]/apply`
- **Component**: `ApplyClient`

#### Step 4.2: Authentication Check
- **Process**:
  1. Sets `isCheckingAuth = true`
  2. Sets up `onAuthStateChange` listener
  3. Gets current session via `supabase.auth.getSession()`
  4. **If no session**: Checks redirect guard
     - If guard count < 2: Increments guard, redirects to login
     - If guard count >= 2: Breaks loop, redirects to `/careers`
  5. **If session exists**: Verifies user record
     - Checks user exists in Supabase Auth
     - Calls `ensureUserRecord(session)`
     - If successful: Clears guard, sets authenticated
     - If failed: Redirects to login

#### Step 4.3: Load Protected Content
- **Process**:
  1. Sets `isCheckingAuth = false`
  2. Sets `authStatus = "authenticated"`
  3. Loads job details with Authorization header
  4. Shows application form

## Key Components

### SessionStorage Keys
- `auth_redirect`: Stores the intended destination after login
- `auth_redirect_guard`: Counter to prevent redirect loops (max 2)

### API Endpoints
- `POST /api/auth/signup`: Creates user account and sends verification code
- `POST /api/auth/verify-code`: Verifies email code and confirms email
- `POST /api/auth/resend-code`: Resends verification code

### Auth Functions
- `ensureUserRecord(session)`: Ensures user record exists in `users` table
- `getRedirectPath(userType, role, next)`: Determines redirect path based on context
- `getUserTypeFromSession(session)`: Gets user type from session

### Redirect Logic
- **Careers context detection**: Checks URL params, sessionStorage, and pathname
- **Redirect guard**: Prevents infinite redirect loops (max 2 attempts)
- **Context-aware redirects**: Different paths for careers vs main site

## Error Handling

### Common Errors
1. **Account already exists**: Redirects to login or verify page
2. **Invalid verification code**: Shows error, allows resend
3. **Code expired**: Shows error, allows resend
4. **Too many attempts**: Shows error, requires new code
5. **Login failures**: Specific error messages for different scenarios
6. **Redirect loops**: Guard mechanism breaks loop after 2 attempts

### Error Recovery
- Users can resend verification codes
- Users can request new codes if expired
- Redirect guard prevents infinite loops
- Clear error messages guide users

## Security Features

1. **Code Hashing**: Verification codes are hashed (SHA-256) before storage
2. **Code Expiration**: Codes expire after 10 minutes
3. **Attempt Limiting**: Maximum 5 verification attempts per code
4. **Email Confirmation**: Email must be confirmed before login
5. **Session Validation**: Sessions are validated on protected pages
6. **RLS Policies**: Row-level security on database tables

## User Experience Improvements

1. **Seamless Flow**: Auto-redirect to verify page after signup
2. **Context Preservation**: `next` parameter preserved throughout flow
3. **Clear Feedback**: Toast notifications at each step
4. **Loading States**: Shows loading indicators during async operations
5. **Error Recovery**: Clear error messages with actionable steps
6. **Redirect Prevention**: Guard mechanism prevents frustrating loops
