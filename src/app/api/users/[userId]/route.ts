import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { toSafeDbUser } from "@/lib/db/types";
import { getTierFromPoints } from "@/lib/loyalty";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { userId } = await params;
  const db = await readDb();
  const { searchParams } = new URL(request.url);
  const includePassword = searchParams.get("includePassword") === "true";

  const user = db.users.find((u) => u.id === userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(includePassword ? user : toSafeDbUser(user));
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { userId } = await params;
  const db = await readDb();
  const body = await request.json();

  const userIndex = db.users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = db.users[userIndex];

  // Update allowed fields
  if (body.email !== undefined) {
    // Check for duplicate email
    const duplicate = db.users.find(
      (u) => u.id !== userId && u.email.toLowerCase() === body.email.toLowerCase()
    );
    if (duplicate) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    user.email = body.email;
  }

  if (body.password !== undefined) {
    user.password = body.password;
  }

  if (body.name !== undefined) {
    user.name = body.name;
  }

  if (body.points !== undefined) {
    user.points = Math.max(0, body.points);
    user.tier = getTierFromPoints(user.points);
  }

  db.users[userIndex] = user;
  await writeDb(db);

  return NextResponse.json(toSafeDbUser(user));
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { userId } = await params;
  const db = await readDb();

  const userIndex = db.users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const deleted = db.users.splice(userIndex, 1)[0];
  await writeDb(db);

  return NextResponse.json({
    success: true,
    deleted: toSafeDbUser(deleted),
  });
}
