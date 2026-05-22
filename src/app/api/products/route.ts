import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import type { DbProduct } from "@/lib/db/types";
import type { PieCategory } from "@/types/product";

export async function GET(request: NextRequest) {
  const db = await readDb();
  const { searchParams } = new URL(request.url);

  // Optional query params
  const category = searchParams.get("category") as PieCategory | null;
  const available = searchParams.get("available");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder") || "asc";

  let products = [...db.products];

  if (category) {
    products = products.filter((p) => p.category === category);
  }

  if (available !== null) {
    const isAvailable = available === "true";
    products = products.filter((p) => p.available === isAvailable);
  }

  if (minPrice) {
    products = products.filter((p) => p.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    products = products.filter((p) => p.price <= parseFloat(maxPrice));
  }

  if (sortBy) {
    products.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortBy) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "price":
          aVal = a.price;
          bVal = b.price;
          break;
        case "popularity":
          aVal = a.popularity;
          bVal = b.popularity;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const db = await readDb();
  const body = await request.json();

  const { id, name, description, price, category, available = true, popularity = 50 } = body;

  if (!name || !description || price === undefined || !category) {
    return NextResponse.json(
      { error: "Missing required fields: name, description, price, category" },
      { status: 400 }
    );
  }

  const productId = id || `pie-${Date.now()}`;

  // Check for duplicate id
  if (db.products.some((p) => p.id === productId)) {
    return NextResponse.json(
      { error: "Product ID already exists" },
      { status: 409 }
    );
  }

  const newProduct: DbProduct = {
    id: productId,
    name,
    description,
    price,
    image: body.image || "/icon-pie.svg",
    category,
    available,
    popularity,
  };

  db.products.push(newProduct);
  await writeDb(db);

  return NextResponse.json(newProduct, { status: 201 });
}
