import { loadEnvConfig } from "@next/env";
import { parse } from "csv-parse";
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { Prisma, PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const BATCH_SIZE = 1_000;
type CsvRow = Record<string, string>;
type BatchCreator<T> = (rows: T[]) => Promise<{ count: number }>;

function getSourceDirectory() {
  const sourceIndex = process.argv.indexOf("--source");
  const sourceDirectory =
    sourceIndex >= 0 ? process.argv[sourceIndex + 1] : process.env.KAGGLE_DATASET_DIR;
  if (!sourceDirectory || !existsSync(sourceDirectory)) {
    throw new Error(
      'Provide the extracted Kaggle directory with "--source <path>" or KAGGLE_DATASET_DIR.',
    );
  }
  return sourceDirectory;
}

function requiredText(row: CsvRow, field: string) {
  const value = row[field]?.trim();
  if (!value) throw new Error(`Missing required CSV value: ${field}`);
  return value;
}

function optionalText(row: CsvRow, field: string) {
  return row[field]?.trim() || null;
}

function integer(row: CsvRow, field: string) {
  const value = Number(requiredText(row, field));
  if (!Number.isInteger(value)) throw new Error(`Invalid integer in CSV field: ${field}`);
  return value;
}

function decimal(row: CsvRow, field: string) {
  const value = requiredText(row, field);
  try {
    return new Prisma.Decimal(value);
  } catch {
    throw new Error(`Invalid decimal in CSV field: ${field}`);
  }
}

function date(row: CsvRow, field: string) {
  const value = requiredText(row, field);
  const dateValue = new Date(value.includes(" ") ? `${value.replace(" ", "T")}Z` : `${value}T00:00:00Z`);
  if (Number.isNaN(dateValue.getTime())) throw new Error(`Invalid date in CSV field: ${field}`);
  return dateValue;
}

function boolean(row: CsvRow, field: string) {
  const value = requiredText(row, field).toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Invalid boolean in CSV field: ${field}`);
}

async function importCsv<T>(
  fileName: string,
  sourceDirectory: string,
  transform: (row: CsvRow) => T,
  createMany: BatchCreator<T>,
) {
  const filePath = join(sourceDirectory, fileName);
  if (!existsSync(filePath)) throw new Error(`Dataset file is missing: ${fileName}`);

  const parser = createReadStream(filePath).pipe(
    parse({ columns: true, skip_empty_lines: true, bom: true }),
  );
  let batch: T[] = [];
  let inserted = 0;

  async function flushBatch() {
    if (batch.length === 0) return;
    inserted += (await createMany(batch)).count;
    batch = [];
  }

  for await (const record of parser) {
    batch.push(transform(record as CsvRow));
    if (batch.length >= BATCH_SIZE) await flushBatch();
  }
  await flushBatch();
  console.log(`${fileName}: inserted ${inserted} new rows`);
  return inserted;
}

async function main() {
  const sourceDirectory = getSourceDirectory();
  const prisma = new PrismaClient();
  let totalInserted = 0;
  const insert = async <T>(fileName: string, transform: (row: CsvRow) => T, createMany: BatchCreator<T>) => {
    totalInserted += await importCsv(fileName, sourceDirectory, transform, createMany);
  };

  try {
    await insert(
      "customers.csv",
      (row) => ({
        customerId: requiredText(row, "customer_id"),
        customerName: requiredText(row, "customer_name"),
        customerType: requiredText(row, "customer_type"),
        creditTermsDays: integer(row, "credit_terms_days"),
        primaryFreightType: requiredText(row, "primary_freight_type"),
        accountStatus: requiredText(row, "account_status"),
        contractStartDate: date(row, "contract_start_date"),
        annualRevenuePotential: decimal(row, "annual_revenue_potential"),
      }),
      (data) => prisma.kaggleCustomer.createMany({ data, skipDuplicates: true }),
    );
    await insert(
      "drivers.csv",
      (row) => ({
        driverId: requiredText(row, "driver_id"),
        firstName: requiredText(row, "first_name"),
        lastName: requiredText(row, "last_name"),
        hireDate: date(row, "hire_date"),
        terminationDate: optionalText(row, "termination_date")
          ? date(row, "termination_date")
          : null,
        licenseNumber: requiredText(row, "license_number"),
        licenseState: requiredText(row, "license_state"),
        dateOfBirth: date(row, "date_of_birth"),
        homeTerminal: requiredText(row, "home_terminal"),
        employmentStatus: requiredText(row, "employment_status"),
        cdlClass: requiredText(row, "cdl_class"),
        yearsExperience: integer(row, "years_experience"),
      }),
      (data) => prisma.kaggleDriver.createMany({ data, skipDuplicates: true }),
    );
    await insert(
      "trucks.csv",
      (row) => ({
        truckId: requiredText(row, "truck_id"),
        unitNumber: integer(row, "unit_number"),
        make: requiredText(row, "make"),
        modelYear: integer(row, "model_year"),
        vin: requiredText(row, "vin"),
        acquisitionDate: date(row, "acquisition_date"),
        acquisitionMileage: integer(row, "acquisition_mileage"),
        fuelType: requiredText(row, "fuel_type"),
        tankCapacityGallons: decimal(row, "tank_capacity_gallons"),
        status: requiredText(row, "status"),
        homeTerminal: requiredText(row, "home_terminal"),
      }),
      (data) => prisma.kaggleTruck.createMany({ data, skipDuplicates: true }),
    );
    await insert(
      "trailers.csv",
      (row) => ({
        trailerId: requiredText(row, "trailer_id"),
        trailerNumber: integer(row, "trailer_number"),
        trailerType: requiredText(row, "trailer_type"),
        lengthFeet: integer(row, "length_feet"),
        modelYear: integer(row, "model_year"),
        vin: requiredText(row, "vin"),
        acquisitionDate: date(row, "acquisition_date"),
        status: requiredText(row, "status"),
        currentLocation: requiredText(row, "current_location"),
      }),
      (data) => prisma.kaggleTrailer.createMany({ data, skipDuplicates: true }),
    );
    await insert(
      "facilities.csv",
      (row) => ({
        facilityId: requiredText(row, "facility_id"),
        facilityName: requiredText(row, "facility_name"),
        facilityType: requiredText(row, "facility_type"),
        city: requiredText(row, "city"),
        state: requiredText(row, "state"),
        latitude: decimal(row, "latitude"),
        longitude: decimal(row, "longitude"),
        dockDoors: integer(row, "dock_doors"),
        operatingHours: requiredText(row, "operating_hours"),
      }),
      (data) => prisma.kaggleFacility.createMany({ data, skipDuplicates: true }),
    );
    await insert(
      "routes.csv",
      (row) => ({
        routeId: requiredText(row, "route_id"),
        originCity: requiredText(row, "origin_city"),
        originState: requiredText(row, "origin_state"),
        destinationCity: requiredText(row, "destination_city"),
        destinationState: requiredText(row, "destination_state"),
        typicalDistanceMiles: integer(row, "typical_distance_miles"),
        baseRatePerMile: decimal(row, "base_rate_per_mile"),
        fuelSurchargeRate: decimal(row, "fuel_surcharge_rate"),
        typicalTransitDays: integer(row, "typical_transit_days"),
      }),
      (data) => prisma.kaggleRoute.createMany({ data, skipDuplicates: true }),
    );
    await insert(
      "loads.csv",
      (row) => ({
        loadId: requiredText(row, "load_id"),
        customerId: requiredText(row, "customer_id"),
        routeId: requiredText(row, "route_id"),
        loadDate: date(row, "load_date"),
        loadType: requiredText(row, "load_type"),
        weightLbs: integer(row, "weight_lbs"),
        pieces: integer(row, "pieces"),
        revenue: decimal(row, "revenue"),
        fuelSurcharge: decimal(row, "fuel_surcharge"),
        accessorialCharges: decimal(row, "accessorial_charges"),
        loadStatus: requiredText(row, "load_status"),
        bookingType: requiredText(row, "booking_type"),
      }),
      (data) => prisma.kaggleLoad.createMany({ data, skipDuplicates: true }),
    );
    await insert(
      "trips.csv",
      (row) => ({
        tripId: requiredText(row, "trip_id"),
        loadId: requiredText(row, "load_id"),
        driverId: optionalText(row, "driver_id"),
        truckId: optionalText(row, "truck_id"),
        trailerId: optionalText(row, "trailer_id"),
        dispatchDate: date(row, "dispatch_date"),
        actualDistanceMiles: integer(row, "actual_distance_miles"),
        actualDurationHours: decimal(row, "actual_duration_hours"),
        fuelGallonsUsed: decimal(row, "fuel_gallons_used"),
        averageMpg: decimal(row, "average_mpg"),
        idleTimeHours: decimal(row, "idle_time_hours"),
        tripStatus: requiredText(row, "trip_status"),
      }),
      (data) => prisma.kaggleTrip.createMany({ data, skipDuplicates: true }),
    );
    await insert(
      "fuel_purchases.csv",
      (row) => ({
        fuelPurchaseId: requiredText(row, "fuel_purchase_id"),
        tripId: requiredText(row, "trip_id"),
        truckId: optionalText(row, "truck_id"),
        driverId: optionalText(row, "driver_id"),
        purchaseDate: date(row, "purchase_date"),
        locationCity: requiredText(row, "location_city"),
        locationState: requiredText(row, "location_state"),
        gallons: decimal(row, "gallons"),
        pricePerGallon: decimal(row, "price_per_gallon"),
        totalCost: decimal(row, "total_cost"),
        fuelCardNumber: optionalText(row, "fuel_card_number"),
      }),
      (data) => prisma.kaggleFuelPurchase.createMany({ data, skipDuplicates: true }),
    );
    await insert(
      "maintenance_records.csv",
      (row) => ({
        maintenanceId: requiredText(row, "maintenance_id"),
        truckId: requiredText(row, "truck_id"),
        maintenanceDate: date(row, "maintenance_date"),
        maintenanceType: requiredText(row, "maintenance_type"),
        odometerReading: integer(row, "odometer_reading"),
        laborHours: decimal(row, "labor_hours"),
        laborCost: decimal(row, "labor_cost"),
        partsCost: decimal(row, "parts_cost"),
        totalCost: decimal(row, "total_cost"),
        facilityLocation: requiredText(row, "facility_location"),
        downtimeHours: decimal(row, "downtime_hours"),
        serviceDescription: requiredText(row, "service_description"),
      }),
      (data) => prisma.kaggleMaintenanceRecord.createMany({ data, skipDuplicates: true }),
    );
    await insert(
      "delivery_events.csv",
      (row) => ({
        eventId: requiredText(row, "event_id"),
        loadId: requiredText(row, "load_id"),
        tripId: requiredText(row, "trip_id"),
        eventType: requiredText(row, "event_type"),
        facilityId: requiredText(row, "facility_id"),
        scheduledDatetime: date(row, "scheduled_datetime"),
        actualDatetime: date(row, "actual_datetime"),
        detentionMinutes: integer(row, "detention_minutes"),
        onTimeFlag: boolean(row, "on_time_flag"),
        locationCity: requiredText(row, "location_city"),
        locationState: requiredText(row, "location_state"),
      }),
      (data) => prisma.kaggleDeliveryEvent.createMany({ data, skipDuplicates: true }),
    );
    await insert(
      "safety_incidents.csv",
      (row) => ({
        incidentId: requiredText(row, "incident_id"),
        tripId: requiredText(row, "trip_id"),
        truckId: optionalText(row, "truck_id"),
        driverId: optionalText(row, "driver_id"),
        incidentDate: date(row, "incident_date"),
        incidentType: requiredText(row, "incident_type"),
        locationCity: requiredText(row, "location_city"),
        locationState: requiredText(row, "location_state"),
        atFaultFlag: boolean(row, "at_fault_flag"),
        injuryFlag: boolean(row, "injury_flag"),
        vehicleDamageCost: decimal(row, "vehicle_damage_cost"),
        cargoDamageCost: decimal(row, "cargo_damage_cost"),
        claimAmount: decimal(row, "claim_amount"),
        preventableFlag: boolean(row, "preventable_flag"),
        description: requiredText(row, "description"),
      }),
      (data) => prisma.kaggleSafetyIncident.createMany({ data, skipDuplicates: true }),
    );
    await insert(
      "driver_monthly_metrics.csv",
      (row) => ({
        driverId: requiredText(row, "driver_id"),
        month: date(row, "month"),
        tripsCompleted: integer(row, "trips_completed"),
        totalMiles: integer(row, "total_miles"),
        totalRevenue: decimal(row, "total_revenue"),
        averageMpg: decimal(row, "average_mpg"),
        totalFuelGallons: decimal(row, "total_fuel_gallons"),
        onTimeDeliveryRate: decimal(row, "on_time_delivery_rate"),
        averageIdleHours: decimal(row, "average_idle_hours"),
      }),
      (data) => prisma.kaggleDriverMonthlyMetric.createMany({ data, skipDuplicates: true }),
    );
    await insert(
      "truck_utilization_metrics.csv",
      (row) => ({
        truckId: requiredText(row, "truck_id"),
        month: date(row, "month"),
        tripsCompleted: integer(row, "trips_completed"),
        totalMiles: integer(row, "total_miles"),
        totalRevenue: decimal(row, "total_revenue"),
        averageMpg: decimal(row, "average_mpg"),
        maintenanceEvents: integer(row, "maintenance_events"),
        maintenanceCost: decimal(row, "maintenance_cost"),
        downtimeHours: decimal(row, "downtime_hours"),
        utilizationRate: decimal(row, "utilization_rate"),
      }),
      (data) => prisma.kaggleTruckUtilizationMetric.createMany({ data, skipDuplicates: true }),
    );
    console.log(`Relational dataset import complete: ${totalInserted} new rows`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Dataset import failed:", error);
  process.exitCode = 1;
});
