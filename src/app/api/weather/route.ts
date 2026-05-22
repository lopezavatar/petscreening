import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { isCurrentlyRaining } from "@/lib/rain";

export async function GET() {
  const db = await readDb();

  const computedRain = isCurrentlyRaining();
  const override = db.weather.forceRain;

  // If override is set (true or false), use that; otherwise use computed
  const effectiveRain = override !== null ? override : computedRain;

  return NextResponse.json({
    isRaining: effectiveRain,
    computed: computedRain,
    override: override,
    hasOverride: override !== null,
    updatedAt: db.weather.updatedAt,
  });
}

export async function POST(request: NextRequest) {
  const db = await readDb();
  const body = await request.json();

  const { forceRain } = body;

  // Allow true, false, or null (to clear override)
  if (forceRain !== true && forceRain !== false && forceRain !== null) {
    return NextResponse.json(
      { error: "forceRain must be true, false, or null" },
      { status: 400 }
    );
  }

  db.weather = {
    forceRain,
    updatedAt: new Date().toISOString(),
  };

  await writeDb(db);

  const computedRain = isCurrentlyRaining();
  const effectiveRain = forceRain !== null ? forceRain : computedRain;

  return NextResponse.json({
    success: true,
    message:
      forceRain === null
        ? "Weather override cleared, using computed rain status"
        : `Weather override set to: ${forceRain ? "raining" : "not raining"}`,
    isRaining: effectiveRain,
    computed: computedRain,
    override: forceRain,
    hasOverride: forceRain !== null,
    updatedAt: db.weather.updatedAt,
  });
}

export async function DELETE() {
  const db = await readDb();

  db.weather = {
    forceRain: null,
    updatedAt: new Date().toISOString(),
  };

  await writeDb(db);

  const computedRain = isCurrentlyRaining();

  return NextResponse.json({
    success: true,
    message: "Weather override cleared",
    isRaining: computedRain,
    computed: computedRain,
    override: null,
    hasOverride: false,
  });
}
