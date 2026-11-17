-- CreateEnum
CREATE TYPE "DriverAvailability" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "availability" "DriverAvailability" NOT NULL DEFAULT 'AVAILABLE';
