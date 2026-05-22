import type { Order, OrderStatus } from "@/types/order";
import { PIE_CATALOG } from "./products";

// Generate realistic mock orders for each test account
function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "PIE-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomPie() {
  return PIE_CATALOG[Math.floor(Math.random() * PIE_CATALOG.length)];
}

function getRandomAddress(): { address: string; distance: number } {
  const addresses = [
    { address: "123 Main St, Los Angeles, CA", distance: 5.2 },
    { address: "456 Oak Ave, Santa Monica, CA", distance: 12.8 },
    { address: "789 Sunset Blvd, Hollywood, CA", distance: 8.1 },
    { address: "321 Vine St, Downtown LA, CA", distance: 3.5 },
    { address: "654 Palm Dr, Beverly Hills, CA", distance: 15.3 },
    { address: "987 Beach Rd, Venice, CA", distance: 18.7 },
    { address: "147 Hill St, Pasadena, CA", distance: 22.4 },
    { address: "258 Valley Blvd, Glendale, CA", distance: 11.2 },
  ];
  return addresses[Math.floor(Math.random() * addresses.length)];
}

function generateMockOrder(
  userId: string,
  daysAgo: number,
  status: OrderStatus
): Order {
  const pie = getRandomPie();
  const quantity = Math.floor(Math.random() * 3) + 1;
  const { address, distance } = getRandomAddress();
  const isWeekend = Math.random() > 0.7;
  const isRaining = Math.random() > 0.7;

  const orderDate = new Date();
  orderDate.setDate(orderDate.getDate() - daysAgo);

  const baseCost = distance <= 10 ? 10 : 25;
  const rainSurcharge = isRaining ? 10 : 0;
  const deliveryCost = isWeekend ? 50 : baseCost + rainSurcharge;

  return {
    orderId: generateOrderId(),
    items: [
      {
        product: pie,
        quantity,
        unitPrice: pie.price,
      },
    ],
    subtotal: pie.price * quantity,
    address,
    displayAddress: address,
    deliveryDate: orderDate.toISOString().split("T")[0],
    deliveryTime: `${12 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? "00" : "30"}`,
    distanceKm: distance,
    billing: {
      lineItems: [
        {
          label: isWeekend
            ? "Weekend delivery (flat rate)"
            : distance <= 10
            ? `Base delivery (${distance.toFixed(1)} km, within 10 km)`
            : `Long-range delivery (${distance.toFixed(1)} km, over 10 km)`,
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
    tip: Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 2 : 0,
    isRaining,
    createdAt: orderDate.toISOString(),
    status,
    userId,
    pointsEarned: Math.floor(pie.price * quantity),
  };
}

// Generate orders for each test user
export const MOCK_ORDERS: Order[] = [
  // Bronze user - 3 orders (newer account)
  generateMockOrder("user-bronze", 5, "delivered"),
  generateMockOrder("user-bronze", 15, "delivered"),
  generateMockOrder("user-bronze", 30, "delivered"),

  // Silver user - 8 orders
  generateMockOrder("user-silver", 2, "in_transit"),
  generateMockOrder("user-silver", 7, "delivered"),
  generateMockOrder("user-silver", 14, "delivered"),
  generateMockOrder("user-silver", 21, "delivered"),
  generateMockOrder("user-silver", 35, "delivered"),
  generateMockOrder("user-silver", 50, "cancelled"),
  generateMockOrder("user-silver", 65, "delivered"),
  generateMockOrder("user-silver", 80, "delivered"),

  // Gold user - 15 orders
  generateMockOrder("user-gold", 1, "pending"),
  generateMockOrder("user-gold", 3, "in_transit"),
  generateMockOrder("user-gold", 8, "delivered"),
  generateMockOrder("user-gold", 12, "delivered"),
  generateMockOrder("user-gold", 18, "delivered"),
  generateMockOrder("user-gold", 25, "delivered"),
  generateMockOrder("user-gold", 32, "cancelled"),
  generateMockOrder("user-gold", 40, "delivered"),
  generateMockOrder("user-gold", 48, "delivered"),
  generateMockOrder("user-gold", 55, "delivered"),
  generateMockOrder("user-gold", 70, "delivered"),
  generateMockOrder("user-gold", 90, "delivered"),
  generateMockOrder("user-gold", 120, "delivered"),
  generateMockOrder("user-gold", 150, "delivered"),
  generateMockOrder("user-gold", 180, "delivered"),

  // Platinum user - 25 orders
  generateMockOrder("user-platinum", 1, "pending"),
  generateMockOrder("user-platinum", 2, "in_transit"),
  generateMockOrder("user-platinum", 4, "delivered"),
  generateMockOrder("user-platinum", 7, "delivered"),
  generateMockOrder("user-platinum", 10, "delivered"),
  generateMockOrder("user-platinum", 14, "delivered"),
  generateMockOrder("user-platinum", 18, "delivered"),
  generateMockOrder("user-platinum", 22, "cancelled"),
  generateMockOrder("user-platinum", 28, "delivered"),
  generateMockOrder("user-platinum", 35, "delivered"),
  generateMockOrder("user-platinum", 42, "delivered"),
  generateMockOrder("user-platinum", 50, "delivered"),
  generateMockOrder("user-platinum", 60, "delivered"),
  generateMockOrder("user-platinum", 75, "delivered"),
  generateMockOrder("user-platinum", 90, "delivered"),
  generateMockOrder("user-platinum", 110, "delivered"),
  generateMockOrder("user-platinum", 130, "delivered"),
  generateMockOrder("user-platinum", 150, "cancelled"),
  generateMockOrder("user-platinum", 180, "delivered"),
  generateMockOrder("user-platinum", 210, "delivered"),
  generateMockOrder("user-platinum", 250, "delivered"),
  generateMockOrder("user-platinum", 300, "delivered"),
  generateMockOrder("user-platinum", 350, "delivered"),
  generateMockOrder("user-platinum", 400, "delivered"),
  generateMockOrder("user-platinum", 450, "delivered"),
];

export function getOrdersForUser(userId: string): Order[] {
  return MOCK_ORDERS.filter((order) => order.userId === userId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrderById(orderId: string): Order | undefined {
  return MOCK_ORDERS.find((order) => order.orderId === orderId);
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: "var(--crust-100)", text: "var(--crust-700)" },
  in_transit: { bg: "var(--sky-100)", text: "var(--sky-700)" },
  delivered: { bg: "#D1F0E2", text: "#1A6B42" },
  cancelled: { bg: "var(--cherry-100)", text: "var(--cherry-700)" },
};

export const ORDERS_PER_PAGE = 10;
