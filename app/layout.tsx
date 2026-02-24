import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Nav } from "@/components/Nav";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LH44-INN",
  description: "Hotel booking frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <header className="border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-paper-elevated))]">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
              <Link
                href="/"
                className="font-display text-xl text-[rgb(var(--color-ink))] transition-opacity hover:opacity-80"
              >
                LH44-INN
              </Link>
              <Nav />
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
