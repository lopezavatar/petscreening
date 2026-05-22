import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import type { DbOrder } from "@/lib/db/types";
import type { OrderStatus, OrderItem } from "@/types/order";
import { calculateBilling } from "@/lib/billing";
import { calculatePointsEarned } from "@/lib/loyalty";

function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "PIE-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(request: NextRequest) {
  const db = await readDb();
  const { searchParams } = new URL(request.url);

  // Optional query params
  const userId = searchParams.get("userId");
  const status = searchParams.get("status") as OrderStatus | null;
  const orderId = searchParams.get("orderId");
  const minTotal = searchParams.get("minTotal");
  const maxTotal = searchParams.get("maxTotal");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  let orders = [...db.orders];

  if (userId) {
    orders = orders.filter((o) => o.userId === userId);
  }

  if (status) {
    orders = orders.filter((o) => o.status === status);
  }

  if (orderId) {
    orders = orders.filter((o) =>
      o.orderId.toLowerCase().includes(orderId.toLowerCase())
    );
  }

  if (minTotal) {
    const min = parseFloat(minTotal);
    orders = orders.filter((o) => o.subtotal + o.billing.total >= min);
  }

  if (maxTotal) {
    const max = parseFloat(maxTotal);
    orders = orders.filter((o) => o.subtotal + o.billing.total <= max);
  }

  if (fromDate) {
    const from = new Date(fromDate);
    orders = orders.filter((o) => new Date(o.createdAt) >= from);
  }

  if (toDate) {
    const to = new Date(toDate);
    orders = orders.filter((o) => new Date(o.createdAt) <= to);
  }

  // Sort
  orders.sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    switch (sortBy) {
      case "createdAt":
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
        break;
      case "total":
        aVal = a.subtotal + a.billing.total;
        bVal = b.subtotal + b.billing.total;
        break;
      case "status":
        aVal = a.status;
        bVal = b.status;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const db = await readDb();
  const body = await request.json();

  const {
    userId,
    items: rawItems,
    address = "123 Test St, Los Angeles, CA",
    distanceKm = 5.0,
    isRaining = false,
    isWeekend = false,
    deliveryDate,
    deliveryTime = "12:00",
    deliveryInstructions,
    tip = 0,
    status = "pending" as OrderStatus,
  } = body;

  if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
    return NextResponse.json(
      { error: "Must provide items array with at least one item" },
      { status: 400 }
    );
  }

  // Resolve products and build order items
  const orderItems: OrderItem[] = [];
  let subtotal = 0;

  for (const item of rawItems) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Product not found: ${item.productId}` },
        { status: 400 }
      );
    }

    const quantity = item.quantity || 1;
    const unitPrice = product.price;

    orderItems.push({
      product,
      quantity,
      unitPrice,
    });

    subtotal += unitPrice * quantity;
  }

  // Get user tier for loyalty discount
  let loyaltyTier: "bronze" | "silver" | "gold" | "platinum" | undefined;
  if (userId) {
    const user = db.users.find((u) => u.id === userId);
    if (user) {
      loyaltyTier = user.tier;
    }
  }

  // Calculate billing using the existing function (preserves the <= 10km bug)
  const billing = calculateBilling({
    distanceKm,
    isRaining,
    isWeekend,
    loyaltyTier,
  });

  // Calculate points earned using existing function (preserves Math.floor bug)
  const pointsEarned = calculatePointsEarned(subtotal);

  const newOrder: DbOrder = {
    orderId: generateOrderId(),
    items: orderItems,
    subtotal,
    address,
    displayAddress: address,
    deliveryDate: deliveryDate || new Date().toISOString().split("T")[0],
    deliveryTime,
    deliveryInstructions,
    distanceKm,
    billing,
    tip,
    isRaining,
    createdAt: new Date().toISOString(),
    status,
    userId,
    pointsEarned,
  };

  db.orders.push(newOrder);
  await writeDb(db);

  return NextResponse.json(newOrder, { status: 201 });
}
