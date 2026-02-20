const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");
const { Client } = require("pg");
const REPO_ROOT = path.resolve(__dirname, "..");

const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "base",
  "host.docker.internal",
]);

function formatError(error) {
  if (error instanceof AggregateError && Array.isArray(error.errors)) {
    const nested = error.errors
      .map((err) => formatError(err))
      .filter(Boolean)
      .join(" | ");
    if (nested) return nested;
  }

  if (error && typeof error === "object") {
    const maybeMessage = typeof error.message === "string" ? error.message : "";
    const maybeCode = typeof error.code === "string" ? error.code : "";
    const maybeCause =
      error.cause && typeof error.cause === "object"
        ? formatError(error.cause)
        : "";
    return [maybeCode, maybeMessage, maybeCause].filter(Boolean).join(" ");
  }

  return String(error || "");
}

function printUsage() {
  console.log(`Usage:
  npm run db:run:sql -- --file <migration.sql> [--env-file env.development] [--allow-remote] [--dry-run]

Examples:
  npm run db:run:sql -- --file 066_remove_timesheet_system.sql
  npm run db:run:sql -- --file supabase/migrations/066_remove_timesheet_system.sql --env-file .env.local
  npm run db:run:sql -- --file 066_remove_timesheet_system.sql --allow-remote
`);
}

function parseArgs(argv) {
  const options = {
    file: undefined,
    envFile: "env.development",
    allowRemote: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--file") {
      options.file = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--env-file") {
      options.envFile = argv[i + 1] || options.envFile;
      i += 1;
      continue;
    }
    if (arg === "--allow-remote") {
      options.allowRemote = true;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const envVars = {};
  const content = readFileSync(filePath, "utf-8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex < 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    envVars[key] = value;
  }

  return envVars;
}

function resolveMigrationPath(fileArg) {
  const migrationsDir = path.resolve(REPO_ROOT, "supabase/migrations");

  const candidate = (() => {
    if (path.isAbsolute(fileArg)) return path.resolve(fileArg);
    if (!fileArg.includes(path.sep)) return path.resolve(migrationsDir, fileArg);

    const fromCwd = path.resolve(process.cwd(), fileArg);
    if (existsSync(fromCwd)) return fromCwd;

    return path.resolve(REPO_ROOT, fileArg);
  })();

  if (!candidate.endsWith(".sql")) {
    throw new Error("Migration file must be a .sql file");
  }

  const normalizedMigrationsDir = `${migrationsDir}${path.sep}`;
  if (!candidate.startsWith(normalizedMigrationsDir)) {
    throw new Error("For safety, migration file must be inside supabase/migrations");
  }

  if (!existsSync(candidate)) {
    throw new Error(`Migration file not found: ${candidate}`);
  }

  return candidate;
}

function resolveEnvFilePath(envFileArg) {
  if (path.isAbsolute(envFileArg)) return envFileArg;

  const fromCwd = path.resolve(process.cwd(), envFileArg);
  if (existsSync(fromCwd)) return fromCwd;

  return path.resolve(REPO_ROOT, envFileArg);
}

function getDatabaseUrl(envFilePath) {
  const fileEnv = parseEnvFile(envFilePath);
  const databaseUrl = process.env.DATABASE_URL || fileEnv.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      `DATABASE_URL not found. Checked process env and ${envFilePath}`
    );
  }
  return databaseUrl;
}

function enforceTargetSafety(databaseUrl, allowRemote) {
  const parsed = new URL(databaseUrl);
  const originalHost = parsed.hostname;

  if (parsed.hostname === "base") {
    parsed.hostname = "127.0.0.1";
  }

  const isLocal = LOCAL_HOSTS.has(originalHost) || LOCAL_HOSTS.has(parsed.hostname);
  if (!allowRemote && !isLocal) {
    throw new Error(
      `Refusing to run on non-local database host (${originalHost}). Use --allow-remote to override.`
    );
  }

  return parsed.toString();
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.file) {
    printUsage();
    throw new Error("--file is required");
  }

  const envFilePath = resolveEnvFilePath(options.envFile);
  const migrationPath = resolveMigrationPath(options.file);
  const sql = readFileSync(migrationPath, "utf-8");
  if (!sql.trim()) {
    throw new Error(`Migration is empty: ${migrationPath}`);
  }

  const rawDatabaseUrl = getDatabaseUrl(envFilePath);
  const databaseUrl = enforceTargetSafety(rawDatabaseUrl, options.allowRemote);
  const parsedDbUrl = new URL(databaseUrl);

  console.log("Migration file:", migrationPath);
  console.log("Database host:", parsedDbUrl.hostname);
  console.log("Database name:", parsedDbUrl.pathname.replace(/^\//, ""));
  console.log("Env file:", existsSync(envFilePath) ? envFilePath : "(not found, used process env)");

  if (options.dryRun) {
    console.log("Dry run enabled. Connectivity and SQL execution skipped.");
    return;
  }

  const client = new Client({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    await client.query("SELECT 1");
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("Migration applied successfully.");
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore rollback errors
    }
    throw error;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  const message = formatError(error);
  console.error("Failed to run migration:", message || "(no error message returned by driver)");
  process.exit(1);
});
