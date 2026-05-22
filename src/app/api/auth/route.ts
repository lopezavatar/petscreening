import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { toSafeDbUser } from "@/lib/db/types";

export async function POST(request: NextRequest) {
  const db = await readDb();
  const body = await request.json();

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing required fields: email, password" },
      { status: 400 }
    );
  }

  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: toSafeDbUser(user),
  });
}
