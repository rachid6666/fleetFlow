-- Add reversible GPS telemetry for synthetic and future live shipment tracking.
ALTER TABLE "Shipment"
    ADD COLUMN "originLatitude" DECIMAL(9,6),
    ADD COLUMN "originLongitude" DECIMAL(9,6),
    ADD COLUMN "destinationLatitude" DECIMAL(9,6),
    ADD COLUMN "destinationLongitude" DECIMAL(9,6),
    ADD COLUMN "estimatedArrival" TIMESTAMP(3);

CREATE TABLE "ShipmentLocationPing" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "speedMph" DECIMAL(5,2),
    "headingDegrees" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'synthetic',
    CONSTRAINT "ShipmentLocationPing_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShipmentLocationPing_shipmentId_recordedAt_idx"
ON "ShipmentLocationPing"("shipmentId", "recordedAt");

ALTER TABLE "ShipmentLocationPing"
ADD CONSTRAINT "ShipmentLocationPing_shipmentId_fkey"
FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;