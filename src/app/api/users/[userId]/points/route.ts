import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { toSafeDbUser } from "@/lib/db/types";
import { getTierFromPoints } from "@/lib/loyalty";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { userId } = await params;
  const db = await readDb();
  const body = await request.json();

  const userIndex = db.users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { delta, absolute } = body;

  if (delta === undefined && absolute === undefined) {
    return NextResponse.json(
      { error: "Must provide either 'delta' (±points) or 'absolute' (set points)" },
      { status: 400 }
    );
  }

  const user = db.users[userIndex];
  const previousPoints = user.points;
  const previousTier = user.tier;

  if (absolute !== undefined) {
    user.points = Math.max(0, absolute);
  } else {
    user.points = Math.max(0, user.points + delta);
  }

  user.tier = getTierFromPoints(user.points);

  db.users[userIndex] = user;
  await writeDb(db);

  return NextResponse.json({
    user: toSafeDbUser(user),
    change: {
      previousPoints,
      newPoints: user.points,
      delta: user.points - previousPoints,
      previousTier,
      newTier: user.tier,
      tierChanged: previousTier !== user.tier,
    },
  });
}
