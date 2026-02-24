"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

type Room = { id: number; type: string; basePrice: number; totalCount?: number; capacity?: number };
type Inventory = { id: number; date: string; bookedCount: number; reservedCount: number; totalCount: number; price: number; closed: boolean };

export default function AdminRoomDetailPage() {
  const params = useParams();
  const hotelId = params.id as string;
  const roomId = params.roomId as string;
  const router = useRouter();
  const { token, isReady } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editType, setEditType] = useState("");
  const [editBasePrice, setEditBasePrice] = useState("");
  const [editTotalCount, setEditTotalCount] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [invStart, setInvStart] = useState("");
  const [invEnd, setInvEnd] = useState("");
  const [invClosed, setInvClosed] = useState(false);
  const [invSurge, setInvSurge] = useState("1");
  const [patching, setPatching] = useState(false);

  useEffect(() => {
    if (!isReady || !token || !roomId) return;
    api<Room>(`/admin/hotels/${hotelId}/rooms/${roomId}`, { token })
      .then((r) => {
        setRoom(r);
        setEditType(r.type ?? "");
        setEditBasePrice(String(r.basePrice ?? ""));
        setEditTotalCount(String(r.totalCount ?? 1));
        setEditCapacity(String(r.capacity ?? 1));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [token, isReady, hotelId, roomId]);

  useEffect(() => {
    if (!token || !roomId) return;
    api<Inventory[]>(`/admin/inventory/rooms/${roomId}`, { token })
      .then(setInventory)
      .catch(() => setInventory([]));
  }, [token, roomId]);

  async function handleUpdateRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    try {
      const updated = await api<Room>(`/admin/hotels/${hotelId}/rooms/${roomId}`, {
        method: "PUT",
        body: JSON.stringify({
          type: editType,
          basePrice: parseFloat(editBasePrice) || 0,
          totalCount: parseInt(editTotalCount, 10) || 1,
          capacity: parseInt(editCapacity, 10) || 1,
        }),
        token,
      });
      setRoom(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function handleUpdateInventory(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !invStart || !invEnd) return;
    setPatching(true);
    setError("");
    try {
      await api(`/admin/inventory/rooms/${roomId}`, {
        method: "PATCH",
        body: JSON.stringify({
          startDate: invStart,
          endDate: invEnd,
          closed: invClosed,
          surgeFactor: parseFloat(invSurge) || 1,
        }),
        token,
      });
      const list = await api<Inventory[]>(`/admin/inventory/rooms/${roomId}`, { token });
      setInventory(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setPatching(false);
    }
  }

  async function handleDelete() {
    if (!token || !confirm("Delete this room?")) return;
    try {
      await api(`/admin/hotels/${hotelId}/rooms/${roomId}`, { method: "DELETE", token });
      router.push(`/admin/hotels/${hotelId}/rooms`);
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
  if (!room) return <p className="text-[rgb(var(--color-accent))]" role="alert">{error || "Room not found"}</p>;

  return (
    <div className="animate-fade-in">
      <Link href={`/admin/hotels/${hotelId}/rooms`} className="link-accent-underline text-sm">← Rooms</Link>
      <h1 className="mt-6 font-display text-3xl text-[rgb(var(--color-ink))]">{room.type}</h1>
      {error && <p className="mt-3 text-sm text-[rgb(var(--color-accent))]" role="alert">{error}</p>}
      <form onSubmit={handleUpdateRoom} className="card mt-6 max-w-md space-y-3 p-5">
        <input value={editType} onChange={(e) => setEditType(e.target.value)} placeholder="Type" className="input-field" />
        <input type="number" value={editBasePrice} onChange={(e) => setEditBasePrice(e.target.value)} placeholder="Base price" className="input-field" />
        <input type="number" value={editTotalCount} onChange={(e) => setEditTotalCount(e.target.value)} placeholder="Total count" className="input-field" />
        <input type="number" value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} placeholder="Capacity" className="input-field" />
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">Save room</button>
          <button type="button" onClick={handleDelete} className="btn-secondary border-[rgb(var(--color-accent))] text-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent)/0.08)]">Delete room</button>
        </div>
      </form>
      <section className="card mt-8 p-5">
        <h2 className="font-semibold text-[rgb(var(--color-ink))]">Inventory (date range update)</h2>
        <form onSubmit={handleUpdateInventory} className="mt-3 flex flex-wrap items-end gap-3">
          <input type="date" value={invStart} onChange={(e) => setInvStart(e.target.value)} className="input-field w-auto" />
          <input type="date" value={invEnd} onChange={(e) => setInvEnd(e.target.value)} className="input-field w-auto" />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[rgb(var(--color-ink-muted))]">
            <input type="checkbox" checked={invClosed} onChange={(e) => setInvClosed(e.target.checked)} className="rounded border-[rgb(var(--color-border-strong))]" />
            Closed
          </label>
          <input type="number" step={0.01} value={invSurge} onChange={(e) => setInvSurge(e.target.value)} placeholder="Surge factor" className="input-field w-24" />
          <button type="submit" disabled={patching} className="btn-primary">Update</button>
        </form>
      </section>
      <div className="mt-6 overflow-x-auto">
        <h2 className="font-semibold text-[rgb(var(--color-ink))]">Inventory list (sample)</h2>
        <table className="mt-2 min-w-full text-sm text-[rgb(var(--color-ink-muted))]">
          <thead>
            <tr className="border-b border-[rgb(var(--color-border))]">
              <th className="py-2 text-left font-medium text-[rgb(var(--color-ink))]">Date</th>
              <th className="py-2 text-left font-medium text-[rgb(var(--color-ink))]">Booked</th>
              <th className="py-2 text-left font-medium text-[rgb(var(--color-ink))]">Reserved</th>
              <th className="py-2 text-left font-medium text-[rgb(var(--color-ink))]">Total</th>
              <th className="py-2 text-left font-medium text-[rgb(var(--color-ink))]">Price</th>
              <th className="py-2 text-left font-medium text-[rgb(var(--color-ink))]">Closed</th>
            </tr>
          </thead>
          <tbody>
            {inventory.slice(0, 30).map((i) => (
              <tr key={i.id} className="border-b border-[rgb(var(--color-border))]">
                <td className="py-2">{i.date}</td>
                <td>{i.bookedCount}</td>
                <td>{i.reservedCount}</td>
                <td>{i.totalCount}</td>
                <td>₹{Number(i.price).toFixed(0)}</td>
                <td>{i.closed ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {inventory.length > 30 && <p className="mt-2 text-[rgb(var(--color-ink-subtle))]">Showing first 30 of {inventory.length}</p>}
      </div>
    </div>
  );
}
