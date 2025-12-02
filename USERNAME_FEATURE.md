# Username/Nickname Feature Implementation

## Overview
Added username/nickname functionality to the collaborative task manager. Users can now set a unique username that will be displayed instead of email addresses throughout the application.

## Changes Made

### Backend Changes

#### 1. Database Schema (`backend/prisma/schema.prisma`)
- Added `username` field to User model (unique, with default empty string)
- Migration file created: `20251202144116_add_username/migration.sql`
  - Adds username column with default value
  - Updates existing users with username based on email (email prefix + user ID)
  - Creates unique index on username

#### 2. Authentication Controller (`backend/controllers/authController.js`)
- **register**: Now requires username, checks for uniqueness, returns user data with username
- **login**: Returns user data including username
- **updateUsername** (NEW): Endpoint to update username with uniqueness validation
- **getProfile** (NEW): Endpoint to get current user profile

#### 3. Auth Routes (`backend/routes/authRoutes.js`)
- Added `GET /auth/profile` - Get user profile
- Added `PUT /auth/username` - Update username

#### 4. Auth Middleware (`backend/middleware/authMiddleware.js`)
- Now fetches full user data (id, email, username) from database
- Attaches complete user object to req.user instead of just ID

#### 5. Card Controller (`backend/controllers/cardController.js`)
- Updated email notification to use username: "Hi {username}, you have been assigned to..."
- All database queries now select username along with email for users
- Comments, cards, and attachments include username in responses

#### 6. Board Controller (`backend/controllers/boardController.js`)
- Updated getUserBoards to include username in owner and collaborators
- Updated getBoard to include username in owner and collaborators

### Frontend Changes

#### 1. Registration (`frontend/src/components/Auth/Register.js`)
- Added username input field
- Validates and sends username during registration
- Shows appropriate error messages for duplicate usernames

#### 2. Card Modal (`frontend/src/components/CardModal.js`)
- Displays username (with email fallback) in assignee dropdown
- Shows username in comment author display
- Uses username for avatar initials

#### 3. Board View (`frontend/src/components/BoardView.js`)
- Toast notifications now show username instead of email
- Real-time updates display username for card updates, comments, and attachments

#### 4. Card Component (`frontend/src/components/Card.js`)
- Avatar displays username initial (with tooltip showing full username)
- Falls back to email if username not available

#### 5. Profile Page (`frontend/src/components/Profile.js`) - NEW
- Displays user email (read-only)
- Allows users to update their username
- Shows user ID
- Validates username uniqueness
- Provides feedback on successful updates

#### 6. App Routes (`frontend/src/App.js`)
- Added `/profile` route

#### 7. Dashboard (`frontend/src/components/Dashboard.js`)
- Added "profile()" button in header to navigate to profile page

## Database Migration

To apply the database changes:

```bash
cd backend
npx prisma migrate deploy
```

Or for development:

```bash
cd backend
npx prisma migrate dev
```

## API Endpoints

### New Endpoints
- `GET /auth/profile` - Get current user profile (requires auth)
- `PUT /auth/username` - Update username (requires auth)
  - Body: `{ "username": "new_username" }`
  - Returns: Updated user object

### Modified Endpoints
- `POST /auth/register` - Now requires username field
  - Body: `{ "email": "...", "username": "...", "password": "..." }`
- `POST /auth/login` - Now returns user data with username
- All board and card endpoints now include username in user objects

## Features

1. **Unique Username**: Each username must be unique across the system
2. **Username Validation**: Checks for existing usernames during registration and updates
3. **Display Priority**: Username is displayed throughout the app with email as fallback
4. **Profile Management**: Users can update their username from the profile page
5. **Real-time Updates**: Usernames appear in notifications and live updates
6. **Email Notifications**: Assignment emails now address users by username
7. **Backward Compatibility**: Existing users get auto-generated usernames (email_prefix + ID)

## Testing Checklist

- [ ] Register new user with username
- [ ] Try registering with duplicate username (should fail)
- [ ] Login and verify username is displayed
- [ ] Update username from profile page
- [ ] Try updating to existing username (should fail)
- [ ] Assign card to user and verify username in notification
- [ ] Check username display in comments
- [ ] Verify username in board collaborators list
- [ ] Test real-time updates show username
- [ ] Verify email notifications use username

## Notes

- Existing users will have auto-generated usernames (email prefix + user ID)
- Users should be encouraged to update their username from the profile page
- Username field has a default value to handle existing data
- All user-facing displays prioritize username over email
