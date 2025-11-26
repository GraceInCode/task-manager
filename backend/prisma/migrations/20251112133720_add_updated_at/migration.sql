/*
  Warnings:

  - Added the required column `updatedAt` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Card" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now();

-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now();