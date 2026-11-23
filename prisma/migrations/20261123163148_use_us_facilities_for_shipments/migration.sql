-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "destinationFacilityId" TEXT,
ADD COLUMN     "originFacilityId" TEXT;

-- CreateIndex
CREATE INDEX "Shipment_originFacilityId_idx" ON "Shipment"("originFacilityId");

-- CreateIndex
CREATE INDEX "Shipment_destinationFacilityId_idx" ON "Shipment"("destinationFacilityId");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_originFacilityId_fkey" FOREIGN KEY ("originFacilityId") REFERENCES "facilities"("facility_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_destinationFacilityId_fkey" FOREIGN KEY ("destinationFacilityId") REFERENCES "facilities"("facility_id") ON DELETE SET NULL ON UPDATE CASCADE;
