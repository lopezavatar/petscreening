"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/account");
    }
  }, [user, isLoading, router]);

  const handleLoginSuccess = () => {
    router.push("/account");
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <div className="animate-pulse text-lg" style={{ color: "var(--fg-muted)" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      {/* Header */}
      <div className="px-6 py-6">
        <button
          onClick={() => router.push("/")}
          className="text-sm flex items-center gap-1"
          style={{
            background: "none",
            border: "none",
            color: "var(--fg-muted)",
            cursor: "pointer",
          }}
        >
          ← Back to menu
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image src="/logo.svg" alt="Pie In The Sky" width={180} height={36} priority />
          </div>

          {/* Title */}
          <h1
            className="text-2xl font-bold text-center mb-2"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--fg)",
            }}
          >
            Welcome Back
          </h1>
          <p
            className="text-center mb-8"
            style={{ color: "var(--fg-muted)" }}
          >
            Sign in to access your rewards and order history
          </p>

          {/* Login form */}
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  );
}
