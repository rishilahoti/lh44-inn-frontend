"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

type RoomDTO = {
  id: number;
  type: string;
  basePrice: number;
  totalCount?: number;
  capacity?: number;
};
type HotelInfo = {
  hotel: { id: number; name?: string; city?: string; active?: boolean };
  rooms: RoomDTO[];
};

export default function HotelDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { token } = useAuth();
  const [info, setInfo] = useState<HotelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api<HotelInfo>(`/hotels/${id}/info`, { token })
      .then(setInfo)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <p className="text-[rgb(var(--color-ink-muted))]">Loading…</p>;
  if (error) return <p className="text-[rgb(var(--color-accent))]" role="alert">{error}</p>;
  if (!info) return null;

  const { hotel, rooms } = info;

  return (
    <div className="animate-fade-in">
      <Link href="/hotels" className="link-accent-underline text-sm">
        ← Back to search
      </Link>
      <h1 className="mt-6 font-display text-3xl text-[rgb(var(--color-ink))] sm:text-4xl">
        {hotel.name ?? `Hotel ${hotel.id}`}
      </h1>
      {hotel.city && (
        <p className="mt-1 text-[rgb(var(--color-ink-muted))]">{hotel.city}</p>
      )}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[rgb(var(--color-ink))]">Rooms</h2>
        <ul className="mt-4 space-y-3">
          {rooms.length === 0 ? (
            <li className="text-[rgb(var(--color-ink-subtle))]">No rooms listed.</li>
          ) : (
            rooms.map((room) => (
              <li key={room.id} className="card card-hover flex flex-wrap items-center justify-between gap-4 p-5">
                <span className="text-[rgb(var(--color-ink))]">
                  <span className="font-medium">{room.type}</span>
                  <span className="ml-2 text-[rgb(var(--color-accent))]">
                    ₹{room.basePrice?.toFixed(0)} / night
                  </span>
                  {room.capacity != null && (
                    <span className="ml-2 text-[rgb(var(--color-ink-muted))]">
                      · up to {room.capacity} guests
                    </span>
                  )}
                </span>
                <Link
                  href={`/book?hotelId=${hotel.id}&roomId=${room.id}`}
                  className="btn-primary text-sm"
                >
                  Book
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
