import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import type { OrderStatus } from "@/types/order";

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { orderId } = await params;
  const db = await readDb();

  const order = db.orders.find((o) => o.orderId === orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { orderId } = await params;
  const db = await readDb();
  const body = await request.json();

  const orderIndex = db.orders.findIndex((o) => o.orderId === orderId);

  if (orderIndex === -1) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = db.orders[orderIndex];

  // Update allowed fields
  if (body.status !== undefined) {
    const validStatuses: OrderStatus[] = ["pending", "in_transit", "delivered", "cancelled"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }
    order.status = body.status;
  }

  if (body.deliveryDate !== undefined) order.deliveryDate = body.deliveryDate;
  if (body.deliveryTime !== undefined) order.deliveryTime = body.deliveryTime;
  if (body.deliveryInstructions !== undefined) order.deliveryInstructions = body.deliveryInstructions;
  if (body.tip !== undefined) order.tip = body.tip;

  db.orders[orderIndex] = order;
  await writeDb(db);

  return NextResponse.json(order);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { orderId } = await params;
  const db = await readDb();

  const orderIndex = db.orders.findIndex((o) => o.orderId === orderId);

  if (orderIndex === -1) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const deleted = db.orders.splice(orderIndex, 1)[0];
  await writeDb(db);

  return NextResponse.json({
    success: true,
    deleted,
  });
}
