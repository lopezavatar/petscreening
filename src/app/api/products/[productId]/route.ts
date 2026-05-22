import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { productId } = await params;
  const db = await readDb();

  const product = db.products.find((p) => p.id === productId);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { productId } = await params;
  const db = await readDb();
  const body = await request.json();

  const productIndex = db.products.findIndex((p) => p.id === productId);

  if (productIndex === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const product = db.products[productIndex];

  // Update allowed fields
  if (body.name !== undefined) product.name = body.name;
  if (body.description !== undefined) product.description = body.description;
  if (body.price !== undefined) product.price = body.price;
  if (body.image !== undefined) product.image = body.image;
  if (body.category !== undefined) product.category = body.category;
  if (body.available !== undefined) product.available = body.available;
  if (body.popularity !== undefined) product.popularity = body.popularity;

  db.products[productIndex] = product;
  await writeDb(db);

  return NextResponse.json(product);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { productId } = await params;
  const db = await readDb();

  const productIndex = db.products.findIndex((p) => p.id === productId);

  if (productIndex === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const deleted = db.products.splice(productIndex, 1)[0];
  await writeDb(db);

  return NextResponse.json({
    success: true,
    deleted,
  });
}
