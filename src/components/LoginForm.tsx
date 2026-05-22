"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      onSuccess?.();
    } else {
      setError(result.error || "Login failed");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "var(--fg)" }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full px-4 py-3 rounded-lg text-base"
          style={{
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
          }}
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "var(--fg)" }}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          className="w-full px-4 py-3 rounded-lg text-base"
          style={{
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
          }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            background: "var(--cherry-100)",
            color: "var(--status-error)",
          }}
        >
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-full text-base font-semibold uppercase transition-all"
        style={{
          background: isLoading ? "var(--cream-400)" : "var(--action)",
          color: "var(--action-fg)",
          letterSpacing: "0.08em",
          boxShadow: isLoading ? "none" : "var(--shadow-btn)",
          cursor: isLoading ? "not-allowed" : "pointer",
          border: "none",
        }}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>

      {/* Test accounts hint */}
      <div
        className="mt-6 p-4 rounded-lg"
        style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
      >
        <p
          className="text-xs font-semibold uppercase mb-2"
          style={{ letterSpacing: "0.1em", color: "var(--fg-subtle)" }}
        >
          Test Accounts
        </p>
        <div className="space-y-1 text-sm" style={{ color: "var(--fg-muted)" }}>
          <p><span className="font-mono">bronze@test.com</span> — Bronze tier</p>
          <p><span className="font-mono">silver@test.com</span> — Silver tier</p>
          <p><span className="font-mono">gold@test.com</span> — Gold tier</p>
          <p><span className="font-mono">platinum@test.com</span> — Platinum tier</p>
          <p className="mt-2 text-xs" style={{ color: "var(--fg-subtle)" }}>
            Password: <span className="font-mono">password123</span>
          </p>
        </div>
      </div>
    </form>
  );
}
