# Tripzy Issue Tracker & Antigravity Prompt Collection

This document collects and tracks issues found during testing before preparing any fixes or prompts.

---

## Issue 1: Login Returns HTTP 500 Internal Error on Invalid Credentials

- **Severity**: Medium (User Experience / Error Classification)
- **Component**: Backend (`com.tripzy.exception.GlobalExceptionHandler`), Frontend (`src/pages/Login.jsx`)
- **Status**: ✅ **RESOLVED** (Applied & Verified)

### Symptoms
When attempting to log in with an incorrect password or an unseeded/unregistered email address, the UI shows:
> **"An internal error occurred: Bad credentials."**

The browser network inspector reveals the API returns:
```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "status": 500,
  "error": "Internal Server Error",
  "message": "An internal error occurred: Bad credentials",
  "timestamp": "2026-10-13T..."
}
```

### Technical Root Cause
1. In `AuthService.java`, authentication is delegated to Spring Security:
   ```java
   Authentication authentication = authenticationManager.authenticate(
       new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
   );
   ```
2. When credentials do not match or user is not found, Spring Security's `DaoAuthenticationProvider` throws `org.springframework.security.authentication.BadCredentialsException`.
3. In `backend/src/main/java/com/tripzy/exception/GlobalExceptionHandler.java`, there is **no specific `@ExceptionHandler`** for `BadCredentialsException` or `AuthenticationException`.
4. As a result, the exception falls into the fallback catch-all handler:
   ```java
   @ExceptionHandler(Exception.class)
   public ResponseEntity<Map<String, Object>> handleGlobalException(Exception ex) {
       return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An internal error occurred: " + ex.getMessage());
   }
   ```
   This transforms a normal client authentication failure (HTTP 401) into an internal server crash message (HTTP 500).
5. The frontend displays `err.response?.data?.message`, exposing the internal server error message to the user.

### Seeded Demo Credentials Reference
For normal testing without errors, the following seeded accounts exist in `DataSeedService.java`:
| Account | Email | Password | Role |
|---|---|---|---|
| **Alex Rivers** (Solo Explorer) | `alex@tripzy.com` | `Travel@123` | `ROLE_USER` |
| **Sarah Jenkins** (Trip Organizer) | `sarah@tripzy.com` | `Travel@123` | `ROLE_USER` |
| **Tripzy Admin** (Moderator) | `admin@tripzy.com` | `Admin@123` | `ROLE_ADMIN` |
| **Rahul Sharma** (Cultural Traveler)| `rahul@tripzy.com` | `Travel@123` | `ROLE_USER` |

### Solution Applied & Verified
1. **Backend ([GlobalExceptionHandler.java](file:///Users/canzei/Documents/tripzy/backend/src/main/java/com/tripzy/exception/GlobalExceptionHandler.java))**:
   Added explicit handlers for `BadCredentialsException` and `AuthenticationException` returning clean HTTP 401:
   ```json
   {
     "status": 401,
     "error": "Unauthorized",
     "message": "Invalid email or password. Please verify your credentials or use a 1-click demo account."
   }
   ```
2. **Frontend ([Login.jsx](file:///Users/canzei/Documents/tripzy/frontend/src/pages/Login.jsx))**:
   - Added Show/Hide password toggle (eye icon) so users can check for typos and case sensitivity (`Travel@123`).
   - Cleaned up user-facing alert message to guide users to the 1-click demo accounts or registration if account doesn't exist.
   - Displayed demo password reminder directly under the input.
3. **Services**:
   Both Spring Boot (port 8080) and Vite (port 5173) have been restarted directly from `/Users/canzei/Documents/tripzy`.

