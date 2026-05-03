import pg from "pg";

const isRunningInDocker = Bun.env.RUNNING_IN_DOCKER === "true" || await Bun.file("/.dockerenv").exists();
const testDatabaseUrl =
  Bun.env.TEST_DATABASE_URL ??
  (isRunningInDocker
    ? "postgres://admin:admin@postgres:5432/auction_test?schema=public"
    : "postgres://admin:admin@localhost:5432/auction_test?schema=public");

function getMaintenanceDatabaseUrl(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  url.pathname = "/postgres";
  url.search = "";

  return url.toString();
}

function getDatabaseName(databaseUrl: string): string {
  const databaseName = new URL(databaseUrl).pathname.replace(/^\//, "");

  if (!/^[a-zA-Z0-9_-]+$/.test(databaseName) || !databaseName.toLowerCase().includes("test")) {
    throw new Error("TEST_DATABASE_URL must point to a safe database name containing 'test'.");
  }

  return databaseName;
}

async function ensureTestDatabase(): Promise<void> {
  const databaseName = getDatabaseName(testDatabaseUrl);
  const pool = new pg.Pool({ connectionString: getMaintenanceDatabaseUrl(testDatabaseUrl) });

  try {
    await pool.query(`CREATE DATABASE "${databaseName}"`);
  } catch (error) {
    if ((error as { code?: string }).code !== "42P04") {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

async function runCommand(command: string[]): Promise<void> {
  const subprocess = Bun.spawn(command, {
    env: {
      ...Bun.env,
      DATABASE_URL: testDatabaseUrl,
      NODE_ENV: "test",
      TEST_DATABASE_URL: testDatabaseUrl,
    },
    stderr: "inherit",
    stdout: "inherit",
  });

  const exitCode = await subprocess.exited;

  if (exitCode !== 0) {
    throw new Error(`${command.join(" ")} exited with code ${exitCode}`);
  }
}

await ensureTestDatabase();
await runCommand(["bun", "run", "prisma:migrate:deploy"]);
await runCommand(["bun", "run", "test:integration"]);
