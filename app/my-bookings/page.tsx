"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

type BookingDTO = {
  id: number;
  bookingStatus: string;
  checkInDate: string;
  checkOutDate: string;
  amount?: number;
  roomsCount?: number;
};

export default function MyBookingsPage() {
  const { token, isReady } = useAuth();
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isReady) return;
    if (!token) {
      setLoading(false);
      return;
    }
    api<BookingDTO[]>("/users/myBookings", { token })
      .then(setBookings)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [token, isReady]);

  if (!isReady) return <p className="text-[rgb(var(--color-ink-muted))]">Loading…</p>;
  if (!token) {
    return (
      <div className="animate-fade-in-up">
        <p className="text-[rgb(var(--color-ink-muted))]">Log in to see your bookings.</p>
        <Link href="/login" className="link-accent-underline mt-3 inline-block">
          Log in
        </Link>
      </div>
    );
  }
  if (loading) return <p className="text-[rgb(var(--color-ink-muted))]">Loading…</p>;
  if (error) return <p className="text-[rgb(var(--color-accent))]" role="alert">{error}</p>;

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl text-[rgb(var(--color-ink))]">My bookings</h1>
      {bookings.length === 0 ? (
        <p className="mt-6 text-[rgb(var(--color-ink-muted))]">No bookings yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {bookings.map((b) => (
            <li key={b.id} className="card card-hover p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/bookings/${b.id}`}
                    className="link-accent-underline font-medium"
                  >
                    Booking #{b.id}
                  </Link>
                  <span
                    className="ml-2 rounded-[var(--radius-sm)] bg-[rgb(var(--color-border))] px-2 py-0.5 text-sm text-[rgb(var(--color-ink-muted))]"
                    aria-label={`Status: ${b.bookingStatus}`}
                  >
                    {b.bookingStatus}
                  </span>
                  <p className="mt-2 text-sm text-[rgb(var(--color-ink-muted))]">
                    {b.checkInDate} → {b.checkOutDate}
                    {b.roomsCount != null && ` · ${b.roomsCount} room(s)`}
                    {b.amount != null && ` · ₹${b.amount.toFixed(0)}`}
                  </p>
                </div>
                <Link href={`/bookings/${b.id}`} className="btn-secondary text-sm">
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
