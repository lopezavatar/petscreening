import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import type { DbPromoCode } from "@/lib/db/types";

export async function GET(request: NextRequest) {
  const db = await readDb();
  const { searchParams } = new URL(request.url);

  // Optional query params
  const active = searchParams.get("active");
  const type = searchParams.get("type");

  let promoCodes = [...db.promoCodes];

  if (active !== null) {
    const isActive = active === "true";
    promoCodes = promoCodes.filter((p) => p.active === isActive);
  }

  if (type) {
    promoCodes = promoCodes.filter((p) => p.type === type);
  }

  return NextResponse.json(promoCodes);
}

export async function POST(request: NextRequest) {
  const db = await readDb();
  const body = await request.json();

  const {
    code,
    type,
    value,
    minOrderAmount,
    maxDiscount,
    expiresAt,
    description,
    maxUses,
  } = body;

  if (!code || !type || !description) {
    return NextResponse.json(
      { error: "Missing required fields: code, type, description" },
      { status: 400 }
    );
  }

  const validTypes = ["percentage", "fixed", "free_delivery"];
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  // Check for duplicate code (case-insensitive)
  if (db.promoCodes.some((p) => p.code.toLowerCase() === code.toLowerCase())) {
    return NextResponse.json(
      { error: "Promo code already exists" },
      { status: 409 }
    );
  }

  const newPromoCode: DbPromoCode = {
    code: code.toUpperCase(),
    type,
    value: value || 0,
    minOrderAmount,
    maxDiscount,
    expiresAt,
    description,
    usageCount: 0,
    maxUses,
    active: true,
  };

  db.promoCodes.push(newPromoCode);
  await writeDb(db);

  return NextResponse.json(newPromoCode, { status: 201 });
}
