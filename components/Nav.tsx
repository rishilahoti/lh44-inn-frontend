"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const navLinkClass =
  "text-sm font-medium text-[rgb(var(--color-ink-muted))] transition-colors hover:text-[rgb(var(--color-ink))]";

export function Nav() {
  const { token, logout, isReady, isAdmin } = useAuth();

  return (
    <nav className="flex flex-wrap items-center gap-6" aria-label="Main navigation">
      <Link href="/hotels" className={navLinkClass}>
        Search
      </Link>
      {token && (
        <>
          <Link href="/my-bookings" className={navLinkClass}>
            My bookings
          </Link>
          <Link href="/my-guests" className={navLinkClass}>
            My guests
          </Link>
          <Link href="/profile" className={navLinkClass}>
            Profile
          </Link>
          {isAdmin && (
            <Link href="/admin" className={navLinkClass}>
              Admin
            </Link>
          )}
        </>
      )}
      {isReady &&
        (token ? (
          <button
            type="button"
            onClick={logout}
            className={`${navLinkClass} cursor-pointer border-0 bg-transparent p-0`}
          >
            Log out
          </button>
        ) : (
          <>
            <Link href="/login" className={navLinkClass}>
              Log in
            </Link>
            <Link href="/signup" className="btn-primary text-sm">
              Sign up
            </Link>
          </>
        ))}
    </nav>
  );
}
