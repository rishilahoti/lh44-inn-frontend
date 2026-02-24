"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const { token, isReady, isAdmin, rolesChecked } = useAuth();

  useEffect(() => {
    if (isReady && token && rolesChecked && isAdmin) {
      router.replace("/admin/hotels");
    }
  }, [isReady, token, rolesChecked, isAdmin, router]);

  if (!isReady) return <p className="text-[rgb(var(--color-ink-muted))]">Loading…</p>;
  if (!token) {
    return (
      <div className="animate-fade-in-up">
        <p className="text-[rgb(var(--color-ink-muted))]">Log in to access admin.</p>
        <div className="mt-3 flex gap-4">
          <Link href="/login?redirect=%2Fadmin" className="link-accent-underline inline-block">Log in</Link>
          <Link href="/admin/signup?redirect=%2Fadmin" className="link-accent-underline inline-block">Create manager account</Link>
        </div>
      </div>
    );
  }
  if (token && rolesChecked && !isAdmin) {
    return (
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl text-[rgb(var(--color-ink))]">Admin</h1>
        <p className="mt-4 text-[rgb(var(--color-ink-muted))]">
          Admin access is required. This area is for hotel managers only.
        </p>
        <div className="mt-4 flex gap-4">
          <Link href="/" className="link-accent-underline inline-block">Back to home</Link>
          <Link href="/admin/signup?redirect=%2Fadmin" className="link-accent-underline inline-block">Create manager account</Link>
        </div>
      </div>
    );
  }
  return <p className="text-[rgb(var(--color-ink-muted))]">Redirecting…</p>;
}
