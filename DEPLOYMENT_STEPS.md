# Deployment Steps for Username Feature

## Issue
The profile page shows 404 error because the backend on Render doesn't have the new routes yet.

## Steps to Deploy

### 1. Run Database Migration Locally (Test First)
```bash
cd backend
npx prisma migrate deploy
```

This will:
- Add the `username` column to the User table
- Set default usernames for existing users (email_prefix + user_id)
- Create unique index on username

### 2. Commit and Push Changes
```bash
git add .
git commit -m "Add username/nickname feature"
git push origin main
```

### 3. Deploy Backend to Render
Render should automatically deploy when you push to main. If not:
- Go to your Render dashboard
- Find your backend service
- Click "Manual Deploy" > "Deploy latest commit"

### 4. Run Migration on Production Database
After backend deploys, you need to run the migration on production:

**Option A: Via Render Shell**
1. Go to Render dashboard
2. Select your backend service
3. Click "Shell" tab
4. Run: `npx prisma migrate deploy`

**Option B: Via Local Connection**
```bash
cd backend
# Make sure DATABASE_URL in .env points to production
npx prisma migrate deploy
```

### 5. Verify Deployment
1. Check backend logs in Render for any errors
2. Test the profile endpoint: `https://task-manager-yjcd.onrender.com/api/auth/profile`
3. Visit your app and click "profile()" button

## Troubleshooting

### If migration fails with "username already exists"
The migration file already handles this, but if you get errors:
```sql
-- Manually run in your database console:
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT DEFAULT '';
UPDATE "User" SET "username" = SPLIT_PART("email", '@', 1) || '_' || "id"::TEXT WHERE "username" = '';
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
```

### If you see "Cannot GET /api/auth/profile"
- Backend hasn't deployed yet
- Check Render logs for deployment status
- Verify authRoutes.js is properly loaded in server.js

### Double Toast Issue
Fixed by adding cleanup function to useEffect. This prevents the toast from showing twice in React Strict Mode (development only).
