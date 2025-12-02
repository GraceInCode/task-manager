-- AlterTable
ALTER TABLE "User" ADD COLUMN "username" TEXT NOT NULL DEFAULT '';

-- Update existing users to have username based on email
UPDATE "User" SET "username" = SPLIT_PART("email", '@', 1) || '_' || "id"::TEXT WHERE "username" = '';

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
