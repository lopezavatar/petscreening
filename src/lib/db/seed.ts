import type { Database, DbUser, DbProduct, DbOrder, DbPromoCode, WeatherOverride } from "./types";
import { TEST_ACCOUNTS } from "../accounts";
import { PIE_CATALOG } from "../products";
import type { Order, OrderStatus } from "@/types/order";

// Generate a deterministic order ID
function generateOrderId(index: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "PIE-";
  // Use index to create a deterministic but varied ID
  const seed = (index * 7919) % 1679616; // Large prime for distribution
  let remaining = seed;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(remaining % chars.length);
    remaining = Math.floor(remaining / chars.length);
  }
  return result;
}

function getRandomPie(index: number) {
  return PIE_CATALOG[index % PIE_CATALOG.length];
}

const ADDRESSES = [
  { address: "123 Main St, Los Angeles, CA", distance: 5.2 },
  { address: "456 Oak Ave, Santa Monica, CA", distance: 12.8 },
  { address: "789 Sunset Blvd, Hollywood, CA", distance: 8.1 },
  { address: "321 Vine St, Downtown LA, CA", distance: 3.5 },
  { address: "654 Palm Dr, Beverly Hills, CA", distance: 15.3 },
  { address: "987 Beach Rd, Venice, CA", distance: 18.7 },
  { address: "147 Hill St, Pasadena, CA", distance: 22.4 },
  { address: "258 Valley Blvd, Glendale, CA", distance: 11.2 },
];

function generateMockOrder(
  userId: string,
  daysAgo: number,
  status: OrderStatus,
  index: number
): DbOrder {
  const pie = getRandomPie(index);
  const quantity = (index % 3) + 1;
  const addressInfo = ADDRESSES[index % ADDRESSES.length];
  const isWeekend = index % 5 === 0;
  const isRaining = index % 4 === 0;

  const orderDate = new Date();
  orderDate.setDate(orderDate.getDate() - daysAgo);

  const baseCost = addressInfo.distance <= 10 ? 10 : 25;
  const rainSurcharge = isRaining ? 10 : 0;
  const deliveryCost = isWeekend ? 50 : baseCost + rainSurcharge;

  return {
    orderId: generateOrderId(index),
    items: [
      {
        product: pie,
        quantity,
        unitPrice: pie.price,
      },
    ],
    subtotal: pie.price * quantity,
    address: addressInfo.address,
    displayAddress: addressInfo.address,
    deliveryDate: orderDate.toISOString().split("T")[0],
    deliveryTime: `${12 + (index % 8)}:${index % 2 === 0 ? "00" : "30"}`,
    distanceKm: addressInfo.distance,
    billing: {
      lineItems: [
        {
          label: isWeekend
            ? "Weekend delivery (flat rate)"
            : addressInfo.distance <= 10
            ? `Base delivery (${addressInfo.distance.toFixed(1)} km, within 10 km)`
            : `Long-range delivery (${addressInfo.distance.toFixed(1)} km, over 10 km)`,
          amount: isWeekend ? 50 : baseCost,
          applies: true,
        },
        {
          label: "Rain surcharge (drone waterproofing)",
          amount: rainSurcharge,
          applies: isRaining && !isWeekend,
        },
      ],
      total: deliveryCost,
      isWeekendFlat: isWeekend,
    },
    tip: index % 3 === 0 ? (index % 10) + 2 : 0,
    isRaining,
    createdAt: orderDate.toISOString(),
    status,
    userId,
    pointsEarned: Math.floor(pie.price * quantity),
  };
}

function generateOrders(): DbOrder[] {
  const orders: DbOrder[] = [];
  let index = 0;

  // Bronze user - 3 orders
  orders.push(generateMockOrder("user-bronze", 5, "delivered", index++));
  orders.push(generateMockOrder("user-bronze", 15, "delivered", index++));
  orders.push(generateMockOrder("user-bronze", 30, "delivered", index++));

  // Silver user - 8 orders
  orders.push(generateMockOrder("user-silver", 2, "in_transit", index++));
  orders.push(generateMockOrder("user-silver", 7, "delivered", index++));
  orders.push(generateMockOrder("user-silver", 14, "delivered", index++));
  orders.push(generateMockOrder("user-silver", 21, "delivered", index++));
  orders.push(generateMockOrder("user-silver", 35, "delivered", index++));
  orders.push(generateMockOrder("user-silver", 50, "cancelled", index++));
  orders.push(generateMockOrder("user-silver", 65, "delivered", index++));
  orders.push(generateMockOrder("user-silver", 80, "delivered", index++));

  // Gold user - 15 orders
  orders.push(generateMockOrder("user-gold", 1, "pending", index++));
  orders.push(generateMockOrder("user-gold", 3, "in_transit", index++));
  orders.push(generateMockOrder("user-gold", 8, "delivered", index++));
  orders.push(generateMockOrder("user-gold", 12, "delivered", index++));
  orders.push(generateMockOrder("user-gold", 18, "delivered", index++));
  orders.push(generateMockOrder("user-gold", 25, "delivered", index++));
  orders.push(generateMockOrder("user-gold", 32, "cancelled", index++));
  orders.push(generateMockOrder("user-gold", 40, "delivered", index++));
  orders.push(generateMockOrder("user-gold", 48, "delivered", index++));
  orders.push(generateMockOrder("user-gold", 55, "delivered", index++));
  orders.push(generateMockOrder("user-gold", 70, "delivered", index++));
  orders.push(generateMockOrder("user-gold", 90, "delivered", index++));
  orders.push(generateMockOrder("user-gold", 120, "delivered", index++));
  orders.push(generateMockOrder("user-gold", 150, "delivered", index++));
  orders.push(generateMockOrder("user-gold", 180, "delivered", index++));

  // Platinum user - 25 orders
  orders.push(generateMockOrder("user-platinum", 1, "pending", index++));
  orders.push(generateMockOrder("user-platinum", 2, "in_transit", index++));
  orders.push(generateMockOrder("user-platinum", 4, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 7, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 10, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 14, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 18, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 22, "cancelled", index++));
  orders.push(generateMockOrder("user-platinum", 28, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 35, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 42, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 50, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 60, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 75, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 90, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 110, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 130, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 150, "cancelled", index++));
  orders.push(generateMockOrder("user-platinum", 180, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 210, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 250, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 300, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 350, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 400, "delivered", index++));
  orders.push(generateMockOrder("user-platinum", 450, "delivered", index++));

  return orders;
}

function generatePromoCodes(): DbPromoCode[] {
  return [
    {
      code: "NEWPIE10",
      type: "percentage",
      value: 10,
      description: "10% off for new customers",
      usageCount: 0,
      maxUses: 100,
      active: true,
    },
    {
      code: "SAVE5",
      type: "fixed",
      value: 5,
      minOrderAmount: 25,
      description: "$5 off orders over $25",
      usageCount: 15,
      maxUses: 500,
      active: true,
    },
    {
      code: "FREEFLY",
      type: "free_delivery",
      value: 0,
      description: "Free delivery on your order",
      usageCount: 8,
      active: true,
    },
    {
      code: "EXPIRED2024",
      type: "percentage",
      value: 20,
      description: "20% off - expired",
      expiresAt: "2024-01-01T00:00:00Z",
      usageCount: 50,
      active: false,
    },
    {
      code: "SUMMER25",
      type: "percentage",
      value: 25,
      maxDiscount: 15,
      description: "25% off (max $15)",
      usageCount: 0,
      active: true,
    },
  ];
}

export function generateSeedData(): Database {
  const users: DbUser[] = TEST_ACCOUNTS.map((account) => ({
    id: account.id,
    email: account.email,
    password: account.password,
    name: account.name,
    tier: account.tier,
    points: account.points,
    joinedAt: account.joinedAt,
  }));

  const products: DbProduct[] = PIE_CATALOG.map((product) => ({ ...product }));

  const orders: DbOrder[] = generateOrders();

  const promoCodes: DbPromoCode[] = generatePromoCodes();

  const weather: WeatherOverride = {
    forceRain: null,
    updatedAt: new Date().toISOString(),
  };

  return {
    users,
    products,
    orders,
    promoCodes,
    weather,
    seededAt: new Date().toISOString(),
  };
}
