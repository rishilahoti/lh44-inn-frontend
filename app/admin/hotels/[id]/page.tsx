"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

type Hotel = { id: number; name?: string; city?: string; active?: boolean };
type Booking = { id: number; bookingStatus: string; checkInDate: string; checkOutDate: string; amount?: number };
type Report = { bookingCount: number; totalRevenue: number; avgRevenue: number };

export default function AdminHotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { token, isReady } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isReady || !token || !id) return;
    Promise.all([
      api<Hotel>(`/admin/hotels/${id}`, { token }),
      api<Booking[]>(`/admin/hotels/${id}/bookings`, { token }).catch(() => []),
      api<Report>(`/admin/hotels/${id}/reports`, { token }).catch(() => null),
    ])
      .then(([h, b, r]) => {
        setHotel(h);
        setEditName(h.name ?? "");
        setEditCity(h.city ?? "");
        setBookings(b);
        setReport(r);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [token, isReady, id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const updated = await api<Hotel>(`/admin/hotels/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...hotel, name: editName, city: editCity }),
        token,
      });
      setHotel(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate() {
    if (!token) return;
    try {
      await api(`/admin/hotels/${id}/activate`, { method: "PATCH", token });
      setHotel((h) => (h ? { ...h, active: true } : null));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function handleDelete() {
    if (!token || !confirm("Delete this hotel? This cannot be undone.")) return;
    try {
      await api(`/admin/hotels/${id}`, { method: "DELETE", token });
      router.push("/admin/hotels");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (!isReady || !token) {
    return (
      <div className="animate-fade-in-up">
        <p className="text-[rgb(var(--color-ink-muted))]">Log in to access admin.</p>
        <Link href="/login" className="link-accent-underline mt-3 inline-block">Log in</Link>
      </div>
    );
  }
  if (loading) return <p className="text-[rgb(var(--color-ink-muted))]">Loading…</p>;
  if (error && !hotel) return <p className="text-[rgb(var(--color-accent))]" role="alert">{error}</p>;
  if (!hotel) return null;

  return (
    <div className="animate-fade-in">
      <Link href="/admin/hotels" className="link-accent-underline text-sm">← My hotels</Link>
      <h1 className="mt-6 font-display text-3xl text-[rgb(var(--color-ink))]">{hotel.name ?? `Hotel ${id}`}</h1>
      {error && <p className="mt-3 text-sm text-[rgb(var(--color-accent))]" role="alert">{error}</p>}
      <form onSubmit={handleUpdate} className="card mt-6 max-w-md space-y-3 p-5">
        <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" className="input-field" />
        <input value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="City" className="input-field" />
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            Save
          </button>
          {!hotel.active && (
            <button type="button" onClick={handleActivate} className="btn-secondary border-green-600 text-green-700 hover:bg-green-50">
              Activate hotel
            </button>
          )}
          <button type="button" onClick={handleDelete} className="btn-secondary border-[rgb(var(--color-accent))] text-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent)/0.08)]">
            Delete
          </button>
        </div>
      </form>
      <div className="mt-8">
        <Link href={`/admin/hotels/${id}/rooms`} className="link-accent-underline font-medium">
          Manage rooms →
        </Link>
      </div>
      {report != null && (
        <div className="card mt-6 p-5">
          <h2 className="font-semibold text-[rgb(var(--color-ink))]">Report</h2>
          <p className="mt-2 text-[rgb(var(--color-ink-muted))]">Bookings: {report.bookingCount}</p>
          <p className="text-[rgb(var(--color-ink-muted))]">Total revenue: ₹{Number(report.totalRevenue).toFixed(0)}</p>
          <p className="text-[rgb(var(--color-ink-muted))]">Avg revenue: ₹{Number(report.avgRevenue).toFixed(0)}</p>
        </div>
      )}
      <div className="mt-6">
        <h2 className="font-semibold text-[rgb(var(--color-ink))]">Recent bookings</h2>
        {bookings.length === 0 ? (
          <p className="mt-2 text-[rgb(var(--color-ink-subtle))]">No bookings</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-[rgb(var(--color-ink-muted))]">
            {bookings.slice(0, 10).map((b) => (
              <li key={b.id}>
                #{b.id} — {b.bookingStatus} — {b.checkInDate} to {b.checkOutDate}
                {b.amount != null && ` — ₹${b.amount.toFixed(0)}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
