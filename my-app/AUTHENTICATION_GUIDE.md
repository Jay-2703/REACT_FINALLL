# Frontend Authentication Implementation Guide

This document provides comprehensive step-by-step explanations of all authentication flows integrated with your backend and common debugging solutions.

---

## Table of Contents
1. [Manual Registration Flow](#manual-registration-flow)
2. [Google OAuth Flow](#google-oauth-flow)
3. [Manual Login Flow](#manual-login-flow)
4. [Forgot Password Flow](#forgot-password-flow)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Security Best Practices](#security-best-practices)
7. [Common Debugging Issues](#common-debugging-issues)

---

## Manual Registration Flow

### Step-by-Step Process

**File:** `src/pages/auth/register.jsx`

### Step 1: User Fills Registration Form
```javascript
// Frontend collects these REQUIRED fields:
- username (3+ characters)
- first_name
- email (valid email format)
- password (8+ chars, uppercase, lowercase, number, special char)
- contact (Philippine format: 9123456789)

// OPTIONAL fields:
- last_name
- birthday (ISO8601 format, age 5-100)
- home_address (5+ chars, must contain space)
```

### Step 2: Send Registration OTP
```javascript
// API Call:
POST /api/auth/send-registration-otp
Content-Type: application/json

Request Payload:
{
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",           // optional
  "email": "john@example.com",
  "password": "SecurePass123!",
  "birthday": "1995-05-15",     // optional
  "contact": "9165234567",
  "home_address": "123 Main St, Quezon City"  // optional
}

Expected Response:
{
  "success": true,
  "message": "OTP sent to your email. Please check your inbox.",
  "otp": "123456"  // ONLY in development mode
}
```

**Backend Logic:**
- Validates all required fields
- Checks if username already exists
- Checks if email already exists
- Generates 6-digit OTP
- Sends OTP to user's email
- If development mode, returns OTP in response for testing

### Step 3: Show OTP Input Screen
User is redirected to OTP verification step and enters 6-digit code.

### Step 4: Verify OTP & Create Account
```javascript
// API Call:
POST /api/auth/verify-registration-otp
Content-Type: application/json

Request Payload:
{
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "birthday": "1995-05-15",
  "contact": "9165234567",
  "home_address": "123 Main St, Quezon City",
  "otp": "123456"  // User entered OTP
}

Expected Response:
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "role": "student",
    "is_verified": true,
    "created_at": "2024-11-22T10:00:00Z"
  }
}
```

**Backend Logic:**
- Verifies OTP is correct and not expired
- Double-checks username/email don't exist
- Hashes password with bcrypt
- Inserts user record into database
- Generates JWT token (7 days expiry)
- Sets HTTP-only cookie with token
- Returns token + user data to frontend

### Step 5: Success & Redirect
```javascript
// Frontend handles response:
1. Store token in localStorage: localStorage.setItem('token', response.token)
2. Store user data: localStorage.setItem('user', JSON.stringify(response.user))
3. Show "Account Successfully Created" screen
4. Redirect to /auth/login after 2 seconds
```

---

## Google OAuth Flow

### Step 1: User Clicks "Continue with Google"

**File:** `src/pages/auth/Login.jsx`

```javascript
const handleGoogleSignIn = async () => {
  const win = window.open(
    `${import.meta.env.VITE_API_URL}/auth/google`,
    '_blank',
    'width=500,height=600'
  )
  // Poll until window closes, then redirect
  const pollTimer = window.setInterval(() => {
    if (win.closed) {
      window.clearInterval(pollTimer)
      window.location.href = '/'
    }
  }, 500)
}
```

### Step 2: Backend Redirects to Google OAuth
```
GET /api/auth/google
- Redirects to: https://accounts.google.com/o/oauth2/v2/auth
- Requests: profile, email
```

### Step 3: Google Redirects Back
```
GET /api/auth/google/callback?code=GOOGLE_AUTH_CODE
```

### Step 4: Backend Exchanges Code for Token
```javascript
// Backend:
1. Exchanges authorization code for Google access token
2. Calls Google API to get user info: name, email, ID
3. Checks if user already exists in database
   - If YES: Updates last login
   - If NO: Creates new user with:
     * username: email_prefix_+ first_6_chars_of_google_id
     * first_name: Given name from Google
     * last_name: Family name from Google
     * email: From Google
     * role: student
     * is_verified: true (always for OAuth)
     * hashed_password: oauth_user_[google_id]
4. Generates JWT token
5. Sets HTTP-only cookie with token
6. Redirects to frontend: /auth/login?token=JWT_TOKEN&oauth=google
```

### Step 5: Landing Page Handles OAuth Callback

**File:** `src/pages/Landing.jsx`

```javascript
useEffect(() => {
  const qs = new URLSearchParams(window.location.search)
  const oauthToken = qs.get('token')
  
  if (oauthToken) {
    // 1. Store token
    localStorage.setItem('token', oauthToken)
    
    // 2. Fetch user profile if needed
    api.get('/profile')
      .then(r => {
        if (r.status === 200 && r.data?.user) {
          localStorage.setItem('user', JSON.stringify(r.data.user))
          setUser(r.data.user)
        }
      })
    
    // 3. Clean up URL
    const url = new URL(window.location.href)
    url.searchParams.delete('token')
    url.searchParams.delete('oauth')
    window.history.replaceState({}, document.title, url.pathname)
  }
}, [])
```

### Step 6: Display Profile Bubble
```javascript
// Header shows:
<div className="flex items-center gap-2">
  {/* Profile Bubble */}
  <span className="bg-[#ffd700] text-black w-10 h-10 rounded-full flex items-center justify-center">
    J  {/* First letter of name */}
  </span>
  {/* Notification Icon */}
  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full">
    🔔
  </span>
  {/* User Name */}
  <span className="font-semibold">John Doe</span>
</div>
```

**Important:** No OTP required for Google OAuth users!

---

## Manual Login Flow

### Step 1: User Enters Credentials

**File:** `src/pages/auth/Login.jsx`

```javascript
// User provides:
- Email OR Username
- Password
```

### Step 2: Submit Login Request
```javascript
// API Call:
POST /api/auth/login
Content-Type: application/json

Request Payload:
{
  "username": "john_doe",  // Can be email OR username
  "password": "SecurePass123!"
}

Expected Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "first_name": "John",
    "email": "john@example.com",
    "role": "student",
    "is_verified": true,
    "created_at": "2024-11-22T10:00:00Z"
  }
}
```

**Backend Logic:**
- Finds user by username OR email
- Verifies password matches hashed password
- Checks account is verified (is_verified === true)
- Generates JWT token
- Sets HTTP-only cookie
- Returns token + user data

### Step 3: Handle Success or Error
```javascript
if (response.success) {
  // 1. Store token
  localStorage.setItem('token', response.token)
  
  // 2. Store user
  localStorage.setItem('user', JSON.stringify(response.user))
  
  // 3. Redirect to landing page
  window.location.href = '/'
} else {
  // Show error message from backend
  setError(response.message)
  // Examples:
  // - "Invalid username or password"
  // - "Please verify your email address before logging in"
  // - "Account is locked due to multiple failed attempts"
}
```

---

## Forgot Password Flow

### Step 1: User Enters Email

**File:** `src/pages/auth/Forgot-password.jsx`

```javascript
// API Call:
POST /api/auth/forgot-password
Content-Type: application/json

Request Payload:
{
  "email": "john@example.com"
}

Expected Response:
{
  "success": true,
  "message": "OTP sent to your email.",
  "otp": "123456"  // ONLY in development
}

Error Response (if email not found):
{
  "success": false,
  "message": "Email address not found. Please check and try again."
}
```

**Backend Logic:**
- Checks if email exists in database
- Returns 404 if email not found
- Generates 6-digit OTP
- Sends OTP to email
- Returns OTP in dev mode for testing

### Step 2: Verify OTP

**File:** `src/pages/auth/Verify-reset-otp.jsx`

```javascript
// API Call:
POST /api/auth/verify-reset-otp
Content-Type: application/json

Request Payload:
{
  "email": "john@example.com",
  "otp": "123456"
}

Expected Response:
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // 15 min expiry
}

Error Response:
{
  "success": false,
  "message": "Invalid OTP" or "OTP has expired"
}
```

**Backend Logic:**
- Verifies OTP is correct
- Checks OTP hasn't expired (usually 10 minutes)
- Generates temporary reset token (15 minutes expiry)
- Returns reset token to frontend

### Step 3: Frontend Stores Reset Token
```javascript
// Store in sessionStorage (temporary, cleared on tab close):
sessionStorage.setItem('resetEmail', email)
sessionStorage.setItem('resetToken', response.resetToken)

// Redirect to reset password page
window.location.href = '/auth/reset-password'
```

### Step 4: Set New Password

**File:** `src/pages/auth/Reset-password.jsx`

```javascript
// API Call:
POST /api/auth/reset-password
Content-Type: application/json

Request Payload:
{
  "email": "john@example.com",
  "newPassword": "NewSecurePass456!",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Expected Response:
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password."
}

Error Response:
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

**Backend Logic:**
- Verifies reset token is valid and not expired
- Verifies email in token matches request email
- Finds user by email
- Hashes new password
- Updates password in database
- Returns success message

### Step 5: Success & Redirect
```javascript
// Clear sessionStorage
sessionStorage.removeItem('resetEmail')
sessionStorage.removeItem('resetToken')

// Show success message
// Redirect to login after 2 seconds
```

---

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/auth/send-registration-otp` | Send OTP for registration | No |
| POST | `/auth/verify-registration-otp` | Verify OTP and create account | No |
| POST | `/auth/resend-registration-otp` | Resend registration OTP | No |
| POST | `/auth/login` | Login with email/username + password | No |
| POST | `/auth/forgot-password` | Send password reset OTP | No |
| POST | `/auth/verify-reset-otp` | Verify OTP for password reset | No |
| POST | `/auth/reset-password` | Set new password | No |
| POST | `/auth/resend-otp` | Resend password reset OTP | No |
| GET | `/auth/google` | Start Google OAuth | No |
| GET | `/auth/google/callback` | Google OAuth callback | No |
| POST | `/auth/logout` | Logout (clear cookie) | Yes |

### Request Headers
```javascript
// For all requests:
Content-Type: application/json

// For authenticated endpoints (if needed):
Authorization: Bearer {token}
```

---

## Security Best Practices

### 1. Never Store Passwords
```javascript
// WRONG:
localStorage.setItem('password', userPassword)

// RIGHT:
// Never store passwords. Only store token.
localStorage.setItem('token', response.token)
```

### 2. Use HTTP-Only Cookies
Backend sets HTTP-only cookies automatically. Frontend doesn't need to handle this, but ensure `withCredentials: true` in axios.

```javascript
// In api.js:
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true  // Important!
})
```

### 3. Sanitize User Inputs
```javascript
import DOMPurify from 'dompurify'

// In input handlers:
const handleChange = (e) => {
  const sanitized = DOMPurify.sanitize(e.target.value)
  setFormData(prev => ({ ...prev, [field]: sanitized }))
}
```

### 4. Validate on Frontend AND Backend
Frontend validation improves UX, but backend validation is critical for security.

**Frontend Validation:**
```javascript
// Check email format
if (!/\S+@\S+\.\S+/.test(email)) {
  setError('Invalid email')
}

// Check password strength
if (password.length < 8 || !/[A-Z]/.test(password)) {
  setError('Password too weak')
}
```

**Backend Validation:** (Already implemented in `middleware/validation.js`)
- Username length 3+
- Email format validation
- Password strength requirements
- Contact number format (PH)
- Birthday age range (5-100)
- Address format

### 5. Clear Auth Data on Logout
```javascript
const handleLogout = async () => {
  await apiService.logout()
  
  // Clear all auth data
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  
  // Redirect
  window.location.href = '/auth/login'
}
```

### 6. Handle Token Expiry
```javascript
// In api.js response interceptor:
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)
```

### 7. Protect Sensitive Routes
```javascript
// Before rendering protected page:
useEffect(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    window.location.href = '/auth/login'
  }
}, [])
```

---

## Common Debugging Issues

### Issue 1: CORS Error
**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
```javascript
// Check backend CORS configuration in server.js:
app.use(cors({
  origin: 'http://localhost:5173',  // Your Vite dev server
  credentials: true  // Allow cookies
}))

// Check frontend API configuration:
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true  // Match backend
})
```

### Issue 2: Payload Mismatch (400 Bad Request)
**Error:** `Field validation failed` or `Username is required`

**Solution:**
Ensure request payload matches backend expectations:

```javascript
// WRONG (using identifier instead of username):
{
  "identifier": "john_doe",
  "password": "pass"
}

// RIGHT:
{
  "username": "john_doe",  // Backend expects 'username'
  "password": "pass"
}

// For registration, ensure all fields match:
{
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",      // Optional but send it
  "email": "john@example.com",
  "password": "SecurePass123!",
  "birthday": "1995-05-15",  // Optional
  "contact": "9165234567",
  "home_address": "123 Main St",  // Optional
  "otp": "123456"
}
```

### Issue 3: Invalid OTP
**Error:** `Invalid OTP` or `OTP has expired`

**Solutions:**
1. **OTP mismatch:** Copy-paste from email exactly (leading zeros matter)
2. **OTP expired:** Resend OTP (usually 10 minute window)
3. **Network delay:** Ensure token endpoint was called before verifying OTP
4. **Development mode:** Backend returns OTP in response for testing

```javascript
// In development, you can copy OTP from response:
const response = await apiService.sendRegistrationOTP(data)
// response.otp contains the OTP for testing
```

### Issue 4: Password Reset Token Invalid
**Error:** `Invalid or expired reset token`

**Solutions:**
1. **Session cleared:** Ensure `sessionStorage` is not cleared
2. **Token expired:** Token valid for 15 minutes only
3. **Flow sequence:** Must follow: forgot-password → verify-otp → reset-password
4. **Email mismatch:** Email in forgot-password and reset-password must match

```javascript
// Correct flow:
sessionStorage.setItem('resetEmail', email)
sessionStorage.setItem('resetToken', token)
// Then navigate to reset-password page
// Don't refresh or go to different tab
```

### Issue 5: Google OAuth Not Working
**Error:** `OAuth not configured` or redirect fails

**Solutions:**
1. **Environment variables:** Check `.env` has:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Backend env file:** Check `.env` has:
   ```
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   ```

3. **Google Console:** Verify:
   - OAuth credentials are created
   - Redirect URI matches backend config
   - Client ID and Secret are correct

4. **Frontend callback:** Ensure popup window closes and token is handled:
   ```javascript
   // Check browser console for token parameter in URL
   // window.location.search should contain: ?token=JWT&oauth=google
   ```

### Issue 6: Token Not Persisting
**Error:** User logged out when page refreshes

**Solutions:**
1. **localStorage not working:** Check browser dev tools → Storage → localStorage
2. **Clear auth on error:** Don't call logout on every API error
3. **Check token format:** Should be `eyJhbGciOi...` (JWT format)
4. **API interceptor:** Verify token is attached to requests:

```javascript
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Issue 7: User Still Logged in After Logout
**Error:** After logout, user can still access protected pages

**Solutions:**
1. **Clear all auth data:**
   ```javascript
   localStorage.removeItem('token')
   localStorage.removeItem('user')
   sessionStorage.clear()  // Also clear session
   ```

2. **Redirect immediately:**
   ```javascript
   window.location.href = '/auth/login'  // Force page reload
   ```

3. **Backend logout:** Call logout endpoint to clear server cookie:
   ```javascript
   await apiService.logout()  // POST /auth/logout
   ```

### Issue 8: Form Validation Not Showing
**Error:** Error messages not displayed or backend errors ignored

**Solutions:**
1. **Check error state:** Ensure component has error state and displays it:
   ```javascript
   {error && <div className="text-red-500">{error}</div>}
   ```

2. **Catch API errors:** Handle backend error messages:
   ```javascript
   catch (err) {
     const message = err.response?.data?.message || 'Error occurred'
     setError(message)
   }
   ```

3. **Field-specific errors:** Backend returns `field` property:
   ```javascript
   // Response:
   {
     "success": false,
     "message": "This username is already taken",
     "field": "username"  // Use this to show field-specific error
   }
   ```

### Issue 9: OTP Not Sending to Email
**Error:** Email doesn't arrive with OTP

**Solutions:**
1. **Check backend email service:** Verify email configuration in `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   ```

2. **Check spam folder:** OTP emails sometimes go to spam
3. **Check email address:** Verify user entered correct email
4. **Development mode:** OTP is returned in API response for testing:
   ```javascript
   // In response:
   "otp": "123456"  // Available only in NODE_ENV === 'development'
   ```

### Issue 10: Account Locked After Failed Logins
**Error:** `Account is locked due to multiple failed attempts`

**Solutions:**
1. **Wait timeout:** Account locks for 15 minutes after 5 failed attempts
2. **Correct credentials:** Ensure username/email and password are correct
3. **Reset attempt:** Try again after waiting period
4. **Admin reset:** Admin can reset failed login attempts

```javascript
// Error response when locked:
{
  "success": false,
  "message": "Account is locked. Please try again in 15 minutes.",
  "status": 423  // Locked response code
}
```

---

## Testing the Authentication Flow

### Manual Testing Checklist

- [ ] **Registration**
  - [ ] Fill form with valid data
  - [ ] Verify OTP is sent to email
  - [ ] Enter OTP and verify account
  - [ ] See success message
  - [ ] Redirected to login page

- [ ] **Login**
  - [ ] Login with username
  - [ ] Login with email
  - [ ] Try with wrong password (error shown)
  - [ ] Try with non-existent user (error shown)
  - [ ] Successful login redirects to landing page

- [ ] **Google OAuth**
  - [ ] Click "Continue with Google"
  - [ ] Authorize in Google popup
  - [ ] Popup closes and redirected to landing page
  - [ ] Profile bubble shows with user name
  - [ ] Notification icon visible next to profile

- [ ] **Forgot Password**
  - [ ] Enter email
  - [ ] OTP sent to email
  - [ ] Enter OTP
  - [ ] New password set
  - [ ] Can login with new password

- [ ] **Logout**
  - [ ] Logout button removes auth
  - [ ] Page redirects to login
  - [ ] Cannot access protected pages without login

### Curl Commands for API Testing

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/send-registration-otp \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "first_name": "Test",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "contact": "9165234567"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePass123!"
  }'

# Forgot password
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## Summary

**Key Files Modified:**
- `src/pages/auth/Login.jsx` - Fixed to use 'username' field
- `src/pages/auth/register.jsx` - Fixed to send all registration fields to verify-otp
- `src/pages/auth/Forgot-password.jsx` - Updated to use apiService and sessionStorage
- `src/pages/auth/Verify-reset-otp.jsx` - Created for OTP verification with resend
- `src/pages/auth/Reset-password.jsx` - Updated to use resetToken from backend
- `src/pages/Landing.jsx` - Updated to handle OAuth callback and show profile bubble
- `src/lib/apiService.js` - Already configured with correct endpoints

**Key Features Implemented:**
✅ Manual registration with OTP verification
✅ Google OAuth without OTP
✅ Email/username login
✅ Forgot password with OTP reset flow
✅ Profile bubble with notification icon
✅ Input sanitization with DOMPurify
✅ Error handling from backend
✅ Token management with localStorage
✅ Session management with sessionStorage for password reset
✅ Resend OTP with cooldown timer

**Next Steps:**
1. Test registration flow end-to-end
2. Test login with email and username
3. Test Google OAuth flow
4. Test forgot password flow
5. Monitor backend logs for any issues
6. Set up error tracking/logging
