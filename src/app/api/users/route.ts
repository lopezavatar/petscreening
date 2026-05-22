import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { toSafeDbUser, type DbUser } from "@/lib/db/types";
import { getTierFromPoints } from "@/lib/loyalty";

export async function GET(request: NextRequest) {
  const db = await readDb();
  const { searchParams } = new URL(request.url);

  // Optional query params
  const tier = searchParams.get("tier");
  const email = searchParams.get("email");
  const includePassword = searchParams.get("includePassword") === "true";

  let users = db.users;

  if (tier) {
    users = users.filter((u) => u.tier === tier);
  }

  if (email) {
    users = users.filter((u) => u.email.toLowerCase().includes(email.toLowerCase()));
  }

  const result = includePassword ? users : users.map(toSafeDbUser);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const db = await readDb();
  const body = await request.json();

  const { email, password, name, points = 0 } = body;

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Missing required fields: email, password, name" },
      { status: 400 }
    );
  }

  // Check for duplicate email
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 409 }
    );
  }

  const newUser: DbUser = {
    id: `user-${Date.now()}`,
    email,
    password,
    name,
    tier: getTierFromPoints(points),
    points,
    joinedAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  await writeDb(db);

  return NextResponse.json(toSafeDbUser(newUser), { status: 201 });
}
