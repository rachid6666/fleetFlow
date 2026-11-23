-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'OTHER');

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "chargeAmount" DECIMAL(12,2);

-- CreateTable
CREATE TABLE "ShipmentPayment" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedByEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShipmentPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShipmentPayment_shipmentId_receivedAt_idx" ON "ShipmentPayment"("shipmentId", "receivedAt");

-- CreateIndex
CREATE INDEX "ShipmentPayment_receivedAt_idx" ON "ShipmentPayment"("receivedAt");

-- AddForeignKey
ALTER TABLE "ShipmentPayment" ADD CONSTRAINT "ShipmentPayment_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
