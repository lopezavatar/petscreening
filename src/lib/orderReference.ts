export function generateOrderId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");

  // Generate random alphanumeric suffix (4 chars)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoiding confusing chars like 0/O, 1/I/L
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `PITS-${dateStr}-${suffix}`;
}
