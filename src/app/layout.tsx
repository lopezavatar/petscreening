import type { Metadata } from "next";
import { RainProvider } from "@/context/RainContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { RainOverlay } from "@/components/RainOverlay";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pie In The Sky — Drone Pie Delivery",
  description: "One pie. One button. One very happy you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-body)" }}>
        <AuthProvider>
          <RainProvider>
            <CartProvider>
              <RainOverlay />
              {children}
            </CartProvider>
          </RainProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
