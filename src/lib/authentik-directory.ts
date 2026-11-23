import type { Role } from "@prisma/client";
import { Pool } from "pg";
import { prisma } from "@/lib/prisma";

type DirectoryUser = {
  id: string;
  email: string;
  name: string;
  role: Exclude<Role, "ADMIN">;
};

type DirectoryRow = {
  uuid: string;
  email: string | null;
  name: string | null;
  group_name: string;
};

type AuthentikGlobal = typeof globalThis & {
  __fleetflowAuthentikPool?: Pool;
};

const globalForAuthentik = globalThis as AuthentikGlobal;

function getAuthentikPool() {
  if (globalForAuthentik.__fleetflowAuthentikPool) {
    return globalForAuthentik.__fleetflowAuthentikPool;
  }

  const required = {
    host: process.env.AUTHENTIK_DB_HOST,
    database: process.env.AUTHENTIK_DB_NAME,
    user: process.env.AUTHENTIK_DB_USER,
    password: process.env.AUTHENTIK_DB_PASSWORD,
  };
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Authentik directory configuration is incomplete: ${missing.join(", ")}`);
  }

  globalForAuthentik.__fleetflowAuthentikPool = new Pool({
    host: required.host,
    port: Number(process.env.AUTHENTIK_DB_PORT ?? 5432),
    database: required.database,
    user: required.user,
    password: required.password,
    ssl: process.env.AUTHENTIK_DB_SSLMODE === "disable"
      ? undefined
      : { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  return globalForAuthentik.__fleetflowAuthentikPool;
}

export async function closeAuthentikDirectoryPool() {
  const pool = globalForAuthentik.__fleetflowAuthentikPool;
  if (!pool) return;
  delete globalForAuthentik.__fleetflowAuthentikPool;
  await pool.end();
}

export async function syncAuthentikDirectoryUsers(): Promise<DirectoryUser[]> {
  const driverGroup = process.env.AUTHENTIK_DRIVER_GROUP ?? "FleetFlow Drivers";
  const customerGroup = process.env.AUTHENTIK_CUSTOMER_GROUP ?? "FleetFlow Customers";
  const result = await getAuthentikPool().query<DirectoryRow>(`
    SELECT
      u.uuid::text AS uuid,
      u.email,
      COALESCE(NULLIF(u.name, ''), NULLIF(BTRIM(CONCAT(u.first_name, ' ', u.last_name)), ''), u.username) AS name,
      g.name AS group_name
    FROM authentik_core_user u
    JOIN authentik_core_user_groups ug ON ug.user_id = u.id
    JOIN authentik_core_group g ON g.group_uuid = ug.group_id
    WHERE u.is_active = TRUE
      AND g.name = ANY($1::text[])
    ORDER BY CASE WHEN g.name = $2 THEN 0 ELSE 1 END, u.email
  `, [[driverGroup, customerGroup], driverGroup]);

  const users = new Map<string, DirectoryUser>();
  for (const row of result.rows) {
    const email = row.email?.trim().toLowerCase();
    if (!email || !row.uuid) continue;

    const role = row.group_name === driverGroup ? "DRIVER" : "CUSTOMER";
    const existing = users.get(email);
    if (existing?.role === "DRIVER") continue;

    users.set(email, {
      id: row.uuid,
      email,
      name: row.name?.trim() || email,
      role,
    });
  }

  const records = await prisma.$transaction(
    [...users.values()].map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name, role: user.role },
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          password: "authentik-managed",
          role: user.role,
        },
        select: { id: true, email: true, name: true, role: true },
      }),
    ),
  );

  return records
    .filter((record): record is DirectoryUser => record.role === "DRIVER" || record.role === "CUSTOMER")
    .map((record) => ({ ...record, email: record.email }));
}
