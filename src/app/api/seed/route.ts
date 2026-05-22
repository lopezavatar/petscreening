import { NextResponse } from "next/server";
import { resetDb } from "@/lib/db";

export async function POST() {
  const db = await resetDb();
  return NextResponse.json({
    success: true,
    message: "Database reset to initial seed data",
    seededAt: db.seededAt,
    counts: {
      users: db.users.length,
      products: db.products.length,
      orders: db.orders.length,
      promoCodes: db.promoCodes.length,
    },
  });
}
