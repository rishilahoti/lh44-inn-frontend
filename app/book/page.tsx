"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

function NewBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, isReady } = useAuth();
  const hotelId = searchParams.get("hotelId") ?? "";
  const roomId = searchParams.get("roomId") ?? "";
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomsCount, setRoomsCount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (!checkIn) setCheckIn(today);
    if (!checkOut) setCheckOut(today);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      router.push(`/login?redirect=/book?hotelId=${hotelId}&roomId=${roomId}`);
      return;
    }
    if (!hotelId || !roomId || !checkIn || !checkOut) {
      setError("Please fill hotel, room, and dates.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const booking = await api<{ id: number }>("/bookings/init", {
        method: "POST",
        body: JSON.stringify({
          hotelId: parseInt(hotelId, 10),
          roomId: parseInt(roomId, 10),
          checkInDate: checkIn,
          checkOutDate: checkOut,
          roomsCount: parseInt(roomsCount, 10) || 1,
        }),
        token,
      });
      router.push(`/bookings/${booking.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  if (!isReady) return <p className="text-[rgb(var(--color-ink-muted))]">Loading…</p>;
  if (!token) {
    return (
      <div className="animate-fade-in-up">
        <p className="text-[rgb(var(--color-ink-muted))]">Log in to book.</p>
        <Link href={`/login?redirect=/book?hotelId=${hotelId}&roomId=${roomId}`} className="link-accent-underline mt-3 inline-block">Log in</Link>
      </div>
    );
  }
  if (!hotelId || !roomId) {
    return (
      <div className="animate-fade-in-up">
        <p className="text-[rgb(var(--color-ink-muted))]">Select a room from a hotel to book.</p>
        <Link href="/hotels" className="link-accent-underline mt-3 inline-block">Search hotels</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link href={`/hotels/${hotelId}`} className="link-accent-underline text-sm">← Back to hotel</Link>
      <h1 className="mt-6 font-display text-3xl text-[rgb(var(--color-ink))]">New booking</h1>
      <form onSubmit={handleSubmit} className="card mt-6 max-w-md space-y-5 p-6">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-ink-muted))]">Check-in</label>
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required className="input-field mt-1.5" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-ink-muted))]">Check-out</label>
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required className="input-field mt-1.5" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-ink-muted))]">Number of rooms</label>
          <input type="number" min={1} value={roomsCount} onChange={(e) => setRoomsCount(e.target.value)} className="input-field mt-1.5" />
        </div>
        {error && <p className="text-sm text-[rgb(var(--color-accent))]" role="alert">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating…" : "Create booking"}
        </button>
      </form>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<p className="text-[rgb(var(--color-ink-muted))]">Loading…</p>}>
      <NewBookingContent />
    </Suspense>
  );
}
