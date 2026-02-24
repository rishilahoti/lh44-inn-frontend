"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

type Guest = { id: number; name: string; gender: string; age?: number };
type Booking = {
  id: number;
  bookingStatus: string;
  checkInDate: string;
  checkOutDate: string;
  amount?: number;
  roomsCount?: number;
  guests?: Guest[];
};

export default function BookingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { token, isReady } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addGuestName, setAddGuestName] = useState("");
  const [addGuestGender, setAddGuestGender] = useState("MALE");
  const [addGuestAge, setAddGuestAge] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  function loadStatus() {
    if (!token) return;
    api<{ bookingStatus: string }>(`/bookings/${id}/status`, { token })
      .then((r) => setStatus(r.bookingStatus))
      .catch(() => setStatus(null));
  }

  useEffect(() => {
    if (!isReady || !token || !id) {
      setLoading(false);
      return;
    }
    loadStatus();
    api<Booking[]>("/users/myBookings", { token })
      .then((list) => {
        const b = list.find((x) => x.id === parseInt(id, 10));
        setBooking(b ?? null);
      })
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [token, isReady, id]);

  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !addGuestName.trim()) return;
    setActionLoading(true);
    setError("");
    try {
      await api(`/bookings/${id}/addGuests`, {
        method: "POST",
        body: JSON.stringify([{ name: addGuestName.trim(), gender: addGuestGender, age: addGuestAge ? parseInt(addGuestAge, 10) : undefined }]),
        token,
      });
      setAddGuestName("");
      setAddGuestGender("MALE");
      setAddGuestAge("");
      loadStatus();
      setBooking((b) => (b ? { ...b, bookingStatus: "GUESTS_ADDED" } : null));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePay() {
    if (!token) return;
    setActionLoading(true);
    setError("");
    try {
      const res = await api<{ sessionUrl: string }>(`/bookings/${id}/payments`, { method: "POST", token });
      if (res?.sessionUrl) window.location.href = res.sessionUrl;
      else setError("No payment URL");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!token || !confirm("Cancel this booking?")) return;
    setActionLoading(true);
    setError("");
    try {
      await api(`/bookings/${id}/cancel`, { method: "POST", token });
      router.push("/my-bookings");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setActionLoading(false);
    }
  }

  if (!isReady) return <p className="text-[rgb(var(--color-ink-muted))]">Loading…</p>;
  if (!token) {
    return (
      <div className="animate-fade-in-up">
        <p className="text-[rgb(var(--color-ink-muted))]">Log in to view this booking.</p>
        <Link href="/login" className="link-accent-underline mt-3 inline-block">Log in</Link>
      </div>
    );
  }
  if (loading) return <p className="text-[rgb(var(--color-ink-muted))]">Loading…</p>;
  const currentStatus = status ?? booking?.bookingStatus ?? "";
  const canAddGuests = currentStatus === "RESERVED";
  const canPay = currentStatus === "RESERVED" || currentStatus === "GUESTS_ADDED" || currentStatus === "PAYMENTS_PENDING";
  const canCancel = currentStatus === "CONFIRMED";

  return (
    <div className="animate-fade-in">
      <Link href="/my-bookings" className="link-accent-underline text-sm">← My bookings</Link>
      <h1 className="mt-6 font-display text-3xl text-[rgb(var(--color-ink))]">Booking #{id}</h1>
      {booking && (
        <p className="mt-2 text-[rgb(var(--color-ink-muted))]">
          {booking.checkInDate} → {booking.checkOutDate}
          {booking.roomsCount != null && ` · ${booking.roomsCount} room(s)`}
          {booking.amount != null && ` · ₹${booking.amount.toFixed(0)}`}
        </p>
      )}
      <p className="mt-2">
        Status:{" "}
        <span className="rounded-[var(--radius-sm)] bg-[rgb(var(--color-border))] px-2 py-0.5 font-medium text-[rgb(var(--color-ink-muted))]" aria-label={`Status: ${currentStatus || "—"}`}>
          {currentStatus || "—"}
        </span>
      </p>
      {error && <p className="mt-3 text-sm text-[rgb(var(--color-accent))]" role="alert">{error}</p>}
      {canAddGuests && (
        <form onSubmit={handleAddGuest} className="card mt-6 max-w-md space-y-3 p-5">
          <h2 className="font-semibold text-[rgb(var(--color-ink))]">Add guest</h2>
          <input placeholder="Name" value={addGuestName} onChange={(e) => setAddGuestName(e.target.value)} className="input-field" />
          <select value={addGuestGender} onChange={(e) => setAddGuestGender(e.target.value)} className="input-field">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <input type="number" placeholder="Age" value={addGuestAge} onChange={(e) => setAddGuestAge(e.target.value)} className="input-field" />
          <button type="submit" disabled={actionLoading} className="btn-primary">
            Add guest
          </button>
        </form>
      )}
      {canPay && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handlePay}
            disabled={actionLoading}
            className="btn-primary"
          >
            {actionLoading ? "Redirecting…" : "Proceed to payment"}
          </button>
        </div>
      )}
      {canCancel && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={actionLoading}
            className="btn-secondary border-[rgb(var(--color-accent))] text-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent)/0.08)]"
          >
            Cancel booking
          </button>
        </div>
      )}
    </div>
  );
}
