"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function AdminSignupContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteCode, setAdminInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { adminSignup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectTo =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminSignup(email, password, name, adminInviteCode);
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm animate-fade-in-up">
      <h1 className="font-display text-3xl text-[rgb(var(--color-ink))]">Create manager account</h1>
      <p className="mt-2 text-sm text-[rgb(var(--color-ink-muted))]">
        This is separate from public signup and requires an admin invite code.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[rgb(var(--color-ink-muted))]">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[rgb(var(--color-ink-muted))]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[rgb(var(--color-ink-muted))]">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="invite" className="block text-sm font-medium text-[rgb(var(--color-ink-muted))]">
            Admin invite code
          </label>
          <input
            id="invite"
            type="password"
            required
            value={adminInviteCode}
            onChange={(e) => setAdminInviteCode(e.target.value)}
            className="input-field mt-1.5"
          />
        </div>
        {error && (
          <p className="text-sm text-[rgb(var(--color-accent))]" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating manager account…" : "Create manager account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[rgb(var(--color-ink-muted))]">
        Already have a manager account?{" "}
        <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="link-accent-underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function AdminSignupPage() {
  return (
    <Suspense fallback={<p className="text-[rgb(var(--color-ink-muted))]">Loading…</p>}>
      <AdminSignupContent />
    </Suspense>
  );
}
