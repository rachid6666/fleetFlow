-- CreateEnum
CREATE TYPE "HandoverEventStatus" AS ENUM ('PROCESSED', 'REJECTED');

-- CreateTable
CREATE TABLE "HandoverEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "fromDriverId" TEXT NOT NULL,
    "toDriverId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "status" "HandoverEventStatus" NOT NULL,
    "errorReason" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HandoverEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HandoverEvent_eventId_key" ON "HandoverEvent"("eventId");

-- CreateIndex
CREATE INDEX "HandoverEvent_shipmentId_createdAt_idx" ON "HandoverEvent"("shipmentId", "createdAt");

-- CreateIndex
CREATE INDEX "HandoverEvent_status_createdAt_idx" ON "HandoverEvent"("status", "createdAt");
