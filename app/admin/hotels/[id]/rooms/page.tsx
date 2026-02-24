"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

type Room = { id: number; type: string; basePrice: number; totalCount?: number; capacity?: number };

export default function AdminRoomsPage() {
  const params = useParams();
  const hotelId = params.id as string;
  const { token, isReady } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [totalCount, setTotalCount] = useState("1");
  const [capacity, setCapacity] = useState("1");

  useEffect(() => {
    if (!isReady || !token || !hotelId) return;
    api<Room[]>(`/admin/hotels/${hotelId}/rooms`, { token })
      .then(setRooms)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [token, isReady, hotelId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    try {
      const created = await api<Room>(`/admin/hotels/${hotelId}/rooms`, {
        method: "POST",
        body: JSON.stringify({
          type,
          basePrice: parseFloat(basePrice) || 0,
          totalCount: parseInt(totalCount, 10) || 1,
          capacity: parseInt(capacity, 10) || 1,
        }),
        token,
      });
      setRooms((r) => [...r, created]);
      setType("");
      setBasePrice("");
      setTotalCount("1");
      setCapacity("1");
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
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

  return (
    <div className="animate-fade-in">
      <Link href={`/admin/hotels/${hotelId}`} className="link-accent-underline text-sm">← Hotel</Link>
      <h1 className="mt-6 font-display text-3xl text-[rgb(var(--color-ink))]">Rooms</h1>
      {error && <p className="mt-3 text-sm text-[rgb(var(--color-accent))]" role="alert">{error}</p>}
      {loading ? (
        <p className="mt-4 text-[rgb(var(--color-ink-muted))]">Loading…</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rooms.map((r) => (
            <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <Link href={`/admin/hotels/${hotelId}/rooms/${r.id}`} className="link-accent-underline font-medium">
                {r.type}
              </Link>
              <span className="text-sm text-[rgb(var(--color-ink-muted))]">
                ₹{r.basePrice?.toFixed(0)} · {r.totalCount ?? 0} units · {r.capacity ?? 0} guests
              </span>
            </li>
          ))}
        </ul>
      )}
      {showForm ? (
        <form onSubmit={handleCreate} className="card mt-6 max-w-md space-y-4 p-5">
          <h2 className="font-semibold text-[rgb(var(--color-ink))]">Add room</h2>
          <input placeholder="Type (e.g. Deluxe)" value={type} onChange={(e) => setType(e.target.value)} required className="input-field" />
          <input type="number" placeholder="Base price" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} min={0} step={0.01} className="input-field" />
          <input type="number" placeholder="Total count" value={totalCount} onChange={(e) => setTotalCount(e.target.value)} min={1} className="input-field" />
          <input type="number" placeholder="Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} min={1} className="input-field" />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setShowForm(true)} className="btn-primary mt-6">Add room</button>
      )}
    </div>
  );
}
