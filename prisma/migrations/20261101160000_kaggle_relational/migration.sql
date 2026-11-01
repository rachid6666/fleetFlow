-- DropTable
DROP TABLE "ImportedDatasetRow";

-- CreateTable
CREATE TABLE "kaggle_customers" (
    "customer_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_type" TEXT NOT NULL,
    "credit_terms_days" INTEGER NOT NULL,
    "primary_freight_type" TEXT NOT NULL,
    "account_status" TEXT NOT NULL,
    "contract_start_date" DATE NOT NULL,
    "annual_revenue_potential" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "kaggle_customers_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "kaggle_drivers" (
    "driver_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "hire_date" DATE NOT NULL,
    "termination_date" DATE,
    "license_number" TEXT NOT NULL,
    "license_state" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "home_terminal" TEXT NOT NULL,
    "employment_status" TEXT NOT NULL,
    "cdl_class" TEXT NOT NULL,
    "years_experience" INTEGER NOT NULL,

    CONSTRAINT "kaggle_drivers_pkey" PRIMARY KEY ("driver_id")
);

-- CreateTable
CREATE TABLE "kaggle_trucks" (
    "truck_id" TEXT NOT NULL,
    "unit_number" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model_year" INTEGER NOT NULL,
    "vin" TEXT NOT NULL,
    "acquisition_date" DATE NOT NULL,
    "acquisition_mileage" INTEGER NOT NULL,
    "fuel_type" TEXT NOT NULL,
    "tank_capacity_gallons" DECIMAL(8,2) NOT NULL,
    "status" TEXT NOT NULL,
    "home_terminal" TEXT NOT NULL,

    CONSTRAINT "kaggle_trucks_pkey" PRIMARY KEY ("truck_id")
);

-- CreateTable
CREATE TABLE "kaggle_trailers" (
    "trailer_id" TEXT NOT NULL,
    "trailer_number" INTEGER NOT NULL,
    "trailer_type" TEXT NOT NULL,
    "length_feet" INTEGER NOT NULL,
    "model_year" INTEGER NOT NULL,
    "vin" TEXT NOT NULL,
    "acquisition_date" DATE NOT NULL,
    "status" TEXT NOT NULL,
    "current_location" TEXT NOT NULL,

    CONSTRAINT "kaggle_trailers_pkey" PRIMARY KEY ("trailer_id")
);

-- CreateTable
CREATE TABLE "kaggle_facilities" (
    "facility_id" TEXT NOT NULL,
    "facility_name" TEXT NOT NULL,
    "facility_type" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "dock_doors" INTEGER NOT NULL,
    "operating_hours" TEXT NOT NULL,

    CONSTRAINT "kaggle_facilities_pkey" PRIMARY KEY ("facility_id")
);

-- CreateTable
CREATE TABLE "kaggle_routes" (
    "route_id" TEXT NOT NULL,
    "origin_city" TEXT NOT NULL,
    "origin_state" TEXT NOT NULL,
    "destination_city" TEXT NOT NULL,
    "destination_state" TEXT NOT NULL,
    "typical_distance_miles" INTEGER NOT NULL,
    "base_rate_per_mile" DECIMAL(8,3) NOT NULL,
    "fuel_surcharge_rate" DECIMAL(6,4) NOT NULL,
    "typical_transit_days" INTEGER NOT NULL,

    CONSTRAINT "kaggle_routes_pkey" PRIMARY KEY ("route_id")
);

-- CreateTable
CREATE TABLE "kaggle_loads" (
    "load_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "load_date" DATE NOT NULL,
    "load_type" TEXT NOT NULL,
    "weight_lbs" INTEGER NOT NULL,
    "pieces" INTEGER NOT NULL,
    "revenue" DECIMAL(12,2) NOT NULL,
    "fuel_surcharge" DECIMAL(12,2) NOT NULL,
    "accessorial_charges" DECIMAL(12,2) NOT NULL,
    "load_status" TEXT NOT NULL,
    "booking_type" TEXT NOT NULL,

    CONSTRAINT "kaggle_loads_pkey" PRIMARY KEY ("load_id")
);

-- CreateTable
CREATE TABLE "kaggle_trips" (
    "trip_id" TEXT NOT NULL,
    "load_id" TEXT NOT NULL,
    "driver_id" TEXT,
    "truck_id" TEXT,
    "trailer_id" TEXT,
    "dispatch_date" DATE NOT NULL,
    "actual_distance_miles" INTEGER NOT NULL,
    "actual_duration_hours" DECIMAL(8,2) NOT NULL,
    "fuel_gallons_used" DECIMAL(8,2) NOT NULL,
    "average_mpg" DECIMAL(6,2) NOT NULL,
    "idle_time_hours" DECIMAL(8,2) NOT NULL,
    "trip_status" TEXT NOT NULL,

    CONSTRAINT "kaggle_trips_pkey" PRIMARY KEY ("trip_id")
);

-- CreateTable
CREATE TABLE "kaggle_fuel_purchases" (
    "fuel_purchase_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "truck_id" TEXT,
    "driver_id" TEXT,
    "purchase_date" TIMESTAMP(6) NOT NULL,
    "location_city" TEXT NOT NULL,
    "location_state" TEXT NOT NULL,
    "gallons" DECIMAL(8,2) NOT NULL,
    "price_per_gallon" DECIMAL(6,3) NOT NULL,
    "total_cost" DECIMAL(10,2) NOT NULL,
    "fuel_card_number" TEXT,

    CONSTRAINT "kaggle_fuel_purchases_pkey" PRIMARY KEY ("fuel_purchase_id")
);

-- CreateTable
CREATE TABLE "kaggle_maintenance_records" (
    "maintenance_id" TEXT NOT NULL,
    "truck_id" TEXT NOT NULL,
    "maintenance_date" DATE NOT NULL,
    "maintenance_type" TEXT NOT NULL,
    "odometer_reading" INTEGER NOT NULL,
    "labor_hours" DECIMAL(8,2) NOT NULL,
    "labor_cost" DECIMAL(12,2) NOT NULL,
    "parts_cost" DECIMAL(12,2) NOT NULL,
    "total_cost" DECIMAL(12,2) NOT NULL,
    "facility_location" TEXT NOT NULL,
    "downtime_hours" DECIMAL(8,2) NOT NULL,
    "service_description" TEXT NOT NULL,

    CONSTRAINT "kaggle_maintenance_records_pkey" PRIMARY KEY ("maintenance_id")
);

-- CreateTable
CREATE TABLE "kaggle_delivery_events" (
    "event_id" TEXT NOT NULL,
    "load_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "scheduled_datetime" TIMESTAMP(6) NOT NULL,
    "actual_datetime" TIMESTAMP(6) NOT NULL,
    "detention_minutes" INTEGER NOT NULL,
    "on_time_flag" BOOLEAN NOT NULL,
    "location_city" TEXT NOT NULL,
    "location_state" TEXT NOT NULL,

    CONSTRAINT "kaggle_delivery_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "kaggle_safety_incidents" (
    "incident_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "truck_id" TEXT,
    "driver_id" TEXT,
    "incident_date" TIMESTAMP(6) NOT NULL,
    "incident_type" TEXT NOT NULL,
    "location_city" TEXT NOT NULL,
    "location_state" TEXT NOT NULL,
    "at_fault_flag" BOOLEAN NOT NULL,
    "injury_flag" BOOLEAN NOT NULL,
    "vehicle_damage_cost" DECIMAL(12,2) NOT NULL,
    "cargo_damage_cost" DECIMAL(12,2) NOT NULL,
    "claim_amount" DECIMAL(12,2) NOT NULL,
    "preventable_flag" BOOLEAN NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "kaggle_safety_incidents_pkey" PRIMARY KEY ("incident_id")
);

-- CreateTable
CREATE TABLE "kaggle_driver_monthly_metrics" (
    "driver_id" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "trips_completed" INTEGER NOT NULL,
    "total_miles" INTEGER NOT NULL,
    "total_revenue" DECIMAL(12,2) NOT NULL,
    "average_mpg" DECIMAL(6,2) NOT NULL,
    "total_fuel_gallons" DECIMAL(10,2) NOT NULL,
    "on_time_delivery_rate" DECIMAL(6,4) NOT NULL,
    "average_idle_hours" DECIMAL(8,2) NOT NULL,

    CONSTRAINT "kaggle_driver_monthly_metrics_pkey" PRIMARY KEY ("driver_id","month")
);

-- CreateTable
CREATE TABLE "kaggle_truck_utilization_metrics" (
    "truck_id" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "trips_completed" INTEGER NOT NULL,
    "total_miles" INTEGER NOT NULL,
    "total_revenue" DECIMAL(12,2) NOT NULL,
    "average_mpg" DECIMAL(6,2) NOT NULL,
    "maintenance_events" INTEGER NOT NULL,
    "maintenance_cost" DECIMAL(12,2) NOT NULL,
    "downtime_hours" DECIMAL(8,2) NOT NULL,
    "utilization_rate" DECIMAL(6,4) NOT NULL,

    CONSTRAINT "kaggle_truck_utilization_metrics_pkey" PRIMARY KEY ("truck_id","month")
);

-- CreateIndex
CREATE INDEX "kaggle_loads_customer_id_idx" ON "kaggle_loads"("customer_id");

-- CreateIndex
CREATE INDEX "kaggle_loads_route_id_idx" ON "kaggle_loads"("route_id");

-- CreateIndex
CREATE INDEX "kaggle_loads_load_date_idx" ON "kaggle_loads"("load_date");

-- CreateIndex
CREATE UNIQUE INDEX "kaggle_trips_load_id_key" ON "kaggle_trips"("load_id");

-- CreateIndex
CREATE INDEX "kaggle_trips_driver_id_idx" ON "kaggle_trips"("driver_id");

-- CreateIndex
CREATE INDEX "kaggle_trips_truck_id_idx" ON "kaggle_trips"("truck_id");

-- CreateIndex
CREATE INDEX "kaggle_trips_trailer_id_idx" ON "kaggle_trips"("trailer_id");

-- CreateIndex
CREATE INDEX "kaggle_trips_dispatch_date_idx" ON "kaggle_trips"("dispatch_date");

-- CreateIndex
CREATE INDEX "kaggle_fuel_purchases_trip_id_idx" ON "kaggle_fuel_purchases"("trip_id");

-- CreateIndex
CREATE INDEX "kaggle_fuel_purchases_truck_id_idx" ON "kaggle_fuel_purchases"("truck_id");

-- CreateIndex
CREATE INDEX "kaggle_fuel_purchases_driver_id_idx" ON "kaggle_fuel_purchases"("driver_id");

-- CreateIndex
CREATE INDEX "kaggle_fuel_purchases_purchase_date_idx" ON "kaggle_fuel_purchases"("purchase_date");

-- CreateIndex
CREATE INDEX "kaggle_maintenance_records_truck_id_maintenance_date_idx" ON "kaggle_maintenance_records"("truck_id", "maintenance_date");

-- CreateIndex
CREATE INDEX "kaggle_delivery_events_load_id_actual_datetime_idx" ON "kaggle_delivery_events"("load_id", "actual_datetime");

-- CreateIndex
CREATE INDEX "kaggle_delivery_events_trip_id_idx" ON "kaggle_delivery_events"("trip_id");

-- CreateIndex
CREATE INDEX "kaggle_delivery_events_facility_id_idx" ON "kaggle_delivery_events"("facility_id");

-- CreateIndex
CREATE INDEX "kaggle_safety_incidents_trip_id_idx" ON "kaggle_safety_incidents"("trip_id");

-- CreateIndex
CREATE INDEX "kaggle_safety_incidents_truck_id_idx" ON "kaggle_safety_incidents"("truck_id");

-- CreateIndex
CREATE INDEX "kaggle_safety_incidents_driver_id_idx" ON "kaggle_safety_incidents"("driver_id");

-- CreateIndex
CREATE INDEX "kaggle_safety_incidents_incident_date_idx" ON "kaggle_safety_incidents"("incident_date");

-- CreateIndex
CREATE INDEX "kaggle_driver_monthly_metrics_month_idx" ON "kaggle_driver_monthly_metrics"("month");

-- CreateIndex
CREATE INDEX "kaggle_truck_utilization_metrics_month_idx" ON "kaggle_truck_utilization_metrics"("month");

-- AddForeignKey
ALTER TABLE "kaggle_loads" ADD CONSTRAINT "kaggle_loads_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "kaggle_customers"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_loads" ADD CONSTRAINT "kaggle_loads_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "kaggle_routes"("route_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_trips" ADD CONSTRAINT "kaggle_trips_load_id_fkey" FOREIGN KEY ("load_id") REFERENCES "kaggle_loads"("load_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_trips" ADD CONSTRAINT "kaggle_trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "kaggle_drivers"("driver_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_trips" ADD CONSTRAINT "kaggle_trips_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "kaggle_trucks"("truck_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_trips" ADD CONSTRAINT "kaggle_trips_trailer_id_fkey" FOREIGN KEY ("trailer_id") REFERENCES "kaggle_trailers"("trailer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_fuel_purchases" ADD CONSTRAINT "kaggle_fuel_purchases_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "kaggle_trips"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_fuel_purchases" ADD CONSTRAINT "kaggle_fuel_purchases_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "kaggle_trucks"("truck_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_fuel_purchases" ADD CONSTRAINT "kaggle_fuel_purchases_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "kaggle_drivers"("driver_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_maintenance_records" ADD CONSTRAINT "kaggle_maintenance_records_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "kaggle_trucks"("truck_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_delivery_events" ADD CONSTRAINT "kaggle_delivery_events_load_id_fkey" FOREIGN KEY ("load_id") REFERENCES "kaggle_loads"("load_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_delivery_events" ADD CONSTRAINT "kaggle_delivery_events_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "kaggle_trips"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_delivery_events" ADD CONSTRAINT "kaggle_delivery_events_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "kaggle_facilities"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_safety_incidents" ADD CONSTRAINT "kaggle_safety_incidents_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "kaggle_trips"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_safety_incidents" ADD CONSTRAINT "kaggle_safety_incidents_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "kaggle_trucks"("truck_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_safety_incidents" ADD CONSTRAINT "kaggle_safety_incidents_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "kaggle_drivers"("driver_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_driver_monthly_metrics" ADD CONSTRAINT "kaggle_driver_monthly_metrics_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "kaggle_drivers"("driver_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_truck_utilization_metrics" ADD CONSTRAINT "kaggle_truck_utilization_metrics_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "kaggle_trucks"("truck_id") ON DELETE RESTRICT ON UPDATE CASCADE;
