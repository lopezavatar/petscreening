import { promises as fs } from "fs";
import path from "path";
import type { Database } from "./types";
import { generateSeedData } from "./seed";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

let dbCache: Database | null = null;

async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function readDb(): Promise<Database> {
  // Return cached version if available
  if (dbCache) {
    return dbCache;
  }

  await ensureDataDir();

  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    dbCache = JSON.parse(data) as Database;
    return dbCache;
  } catch {
    // File doesn't exist, seed it
    const seedData = generateSeedData();
    await writeDb(seedData);
    return seedData;
  }
}

export async function writeDb(db: Database): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  dbCache = db;
}

export async function clearDb(): Promise<void> {
  try {
    await fs.unlink(DB_PATH);
    dbCache = null;
  } catch {
    // File doesn't exist, that's fine
  }
}

export async function resetDb(): Promise<Database> {
  const seedData = generateSeedData();
  await writeDb(seedData);
  return seedData;
}

// Invalidate cache (useful when external changes might have happened)
export function invalidateCache(): void {
  dbCache = null;
}
