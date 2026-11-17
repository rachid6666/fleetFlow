import fs from "node:fs";
import { parseEnv } from "node:util";
import { randomBytes } from "node:crypto";

const env = { ...parseEnv(fs.readFileSync('.env', 'utf8')), ...process.env };
function sourceDatabaseUrl() {
  if (env.SUPERSET_DATABASE_URL) return env.SUPERSET_DATABASE_URL;
  const url = new URL('postgresql://postgres');
  url.username = env.POSTGRES_USER || 'fleetflow';
  url.password = env.POSTGRES_PASSWORD || 'fleetflow-local-password';
  url.hostname = 'postgres';
  url.port = '5432';
  url.pathname = `/${env.POSTGRES_DB || 'fleetflow'}`;
  return url.toString();
}
const sourceUrl = sourceDatabaseUrl();
const path = 'superset/.env';
if (!fs.existsSync(path)) {
  const url = new URL(sourceUrl);
  url.searchParams.delete('schema');
  const settings = {
    SUPERSET_SECRET_KEY: randomBytes(48).toString('hex'),
    SUPERSET_ADMIN_PASSWORD: randomBytes(24).toString('hex'),
    SUPERSET_EMBED_PASSWORD: randomBytes(24).toString('hex'),
    FLEETFLOW_DATABASE_URL: url.toString().replace(/^postgres(ql)?:/, 'postgresql+psycopg2:'),
    FLEETFLOW_ORIGIN: env.AUTH_URL || 'http://localhost:3000',
  };
  fs.writeFileSync(path, Object.entries(settings).map(([k,v]) => `${k}='${v.replaceAll("'", "\\'")}'`).join('\n')+'\n');
}
const settings = parseEnv(fs.readFileSync(path, 'utf8'));
// Refresh the source connection without rotating metadata encryption or login secrets.
const databaseUrl = new URL(sourceUrl);
databaseUrl.searchParams.delete('schema');
settings.FLEETFLOW_DATABASE_URL = databaseUrl.toString().replace(/^postgres(ql)?:/, 'postgresql+psycopg2:');
fs.writeFileSync(path, Object.entries(settings).map(([k,v]) => `${k}='${v.replaceAll("'", "\\'")}'`).join('\n')+'\n');
const localPath = '.env.local';
let local = fs.existsSync(localPath) ? fs.readFileSync(localPath, 'utf8') : '';
const updates = {
  SUPERSET_URL: 'http://localhost:8088',
  NEXT_PUBLIC_SUPERSET_URL: 'http://localhost:8088',
  SUPERSET_ANALYTICS_DASHBOARD_ID: 'd0f7c674-0177-4b8f-9743-c27fabab931a',
  SUPERSET_USERNAME: 'fleetflow-embed-service',
  SUPERSET_PASSWORD: settings.SUPERSET_EMBED_PASSWORD,
};
for (const [k,v] of Object.entries(updates)) {
  local = local.replace(new RegExp(`^${k}=.*\\r?\\n?`, 'gm'), '');
  local += `\n${k}=${JSON.stringify(v)}\n`;
}
fs.writeFileSync(localPath, local);
console.log('Local analytics configuration prepared. Secrets are in ignored superset/.env and .env.local.');
