-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACCEPTED', 'PENDING', 'REJECTED');

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN "assignmentStatus" "AssignmentStatus" NOT NULL DEFAULT 'ACCEPTED';
