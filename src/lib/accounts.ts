export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  tier: LoyaltyTier;
  points: number;
  joinedAt: string;
}

// Hardcoded test accounts for QA testing
export const TEST_ACCOUNTS: User[] = [
  {
    id: "user-bronze",
    email: "bronze@test.com",
    password: "password123",
    name: "Bronze User",
    tier: "bronze",
    points: 150,
    joinedAt: "2024-06-15T10:00:00Z",
  },
  {
    id: "user-silver",
    email: "silver@test.com",
    password: "password123",
    name: "Silver User",
    tier: "silver",
    points: 820,
    joinedAt: "2024-03-20T14:30:00Z",
  },
  {
    id: "user-gold",
    email: "gold@test.com",
    password: "password123",
    name: "Gold User",
    tier: "gold",
    points: 2100,
    joinedAt: "2023-11-08T09:15:00Z",
  },
  {
    id: "user-platinum",
    email: "platinum@test.com",
    password: "password123",
    name: "Platinum User",
    tier: "platinum",
    points: 4500,
    joinedAt: "2023-05-01T16:45:00Z",
  },
];

export function authenticateUser(email: string, password: string): User | null {
  const user = TEST_ACCOUNTS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
}

export function getUserById(id: string): User | null {
  return TEST_ACCOUNTS.find((u) => u.id === id) || null;
}

// For display purposes - don't expose actual password
export type SafeUser = Omit<User, "password">;

export function toSafeUser(user: User): SafeUser {
  const { password, ...safeUser } = user;
  return safeUser;
}
