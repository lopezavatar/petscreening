import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { code } = await params;
  const db = await readDb();

  const promoCode = db.promoCodes.find(
    (p) => p.code.toLowerCase() === code.toLowerCase()
  );

  if (!promoCode) {
    return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
  }

  return NextResponse.json(promoCode);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { code } = await params;
  const db = await readDb();
  const body = await request.json();

  const promoIndex = db.promoCodes.findIndex(
    (p) => p.code.toLowerCase() === code.toLowerCase()
  );

  if (promoIndex === -1) {
    return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
  }

  const promo = db.promoCodes[promoIndex];

  // Update allowed fields
  if (body.type !== undefined) {
    const validTypes = ["percentage", "fixed", "free_delivery"];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }
    promo.type = body.type;
  }

  if (body.value !== undefined) promo.value = body.value;
  if (body.minOrderAmount !== undefined) promo.minOrderAmount = body.minOrderAmount;
  if (body.maxDiscount !== undefined) promo.maxDiscount = body.maxDiscount;
  if (body.expiresAt !== undefined) promo.expiresAt = body.expiresAt;
  if (body.description !== undefined) promo.description = body.description;
  if (body.usageCount !== undefined) promo.usageCount = body.usageCount;
  if (body.maxUses !== undefined) promo.maxUses = body.maxUses;
  if (body.active !== undefined) promo.active = body.active;

  db.promoCodes[promoIndex] = promo;
  await writeDb(db);

  return NextResponse.json(promo);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { code } = await params;
  const db = await readDb();

  const promoIndex = db.promoCodes.findIndex(
    (p) => p.code.toLowerCase() === code.toLowerCase()
  );

  if (promoIndex === -1) {
    return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
  }

  const deleted = db.promoCodes.splice(promoIndex, 1)[0];
  await writeDb(db);

  return NextResponse.json({
    success: true,
    deleted,
  });
}
