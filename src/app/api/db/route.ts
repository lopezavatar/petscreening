import { NextResponse } from "next/server";
import { readDb, clearDb } from "@/lib/db";

export async function GET() {
  const db = await readDb();
  return NextResponse.json(db);
}

export async function DELETE() {
  await clearDb();
  return NextResponse.json({
    success: true,
    message: "Database cleared. Next request will auto-seed.",
  });
}
