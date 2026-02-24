"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

type Hotel = { id: number; name?: string; city?: string };
type HotelPriceDTO = { hotel: Hotel; price: number };
type PageMetadata = { size: number; number: number; totalElements: number; totalPages: number };
type PageResponse = {
  content: HotelPriceDTO[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  metadata?: PageMetadata;
};

function normalizePage(res: PageResponse): PageResponse {
  if (res.metadata) {
    return {
      content: res.content,
      totalElements: res.metadata.totalElements,
      totalPages: res.metadata.totalPages,
      number: res.metadata.number,
      size: res.metadata.size,
    };
  }
  return res;
}

function HotelsSearchContent() {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [roomsCount, setRoomsCount] = useState(searchParams.get("roomsCount") ?? "1");
  const [size, setSize] = useState(searchParams.get("size") ?? "10");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!city.trim()) {
      setData(null);
      return;
    }
    const params = new URLSearchParams({
      city: city.trim(),
      roomsCount: roomsCount || "1",
      page: String(page),
      size: size || "10",
    });
    setLoading(true);
    setError("");
    api<PageResponse>(`/hotels/search?${params}`, { token })
      .then((res) => setData(normalizePage(res)))
      .catch((err) => setError(err instanceof Error ? err.message : "Search failed"))
      .finally(() => setLoading(false));
  }, [city, roomsCount, page, size, token]);

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl text-[rgb(var(--color-ink))]">Search hotels</h1>
      <form
        className="card mt-6 flex flex-wrap items-end gap-4 p-5 sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
        }}
      >
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-ink-muted))]">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai"
            className="input-field mt-1.5 w-40 min-w-0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-ink-muted))]">Rooms</label>
          <input
            type="number"
            min={1}
            value={roomsCount}
            onChange={(e) => setRoomsCount(e.target.value)}
            className="input-field mt-1.5 w-20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-ink-muted))]">Page size</label>
          <select
            value={size}
            onChange={(e) => {
              setSize(e.target.value);
              setPage(0);
            }}
            className="input-field mt-1.5 w-24"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-[rgb(var(--color-accent))]" role="alert">{error}</p>
      )}
      {loading && (
        <p className="mt-4 text-[rgb(var(--color-ink-muted))]">Loading…</p>
      )}

      {data && !loading && (
        <div className="mt-8">
          <p className="text-sm text-[rgb(var(--color-ink-muted))]">
            {data.totalElements ?? 0} result{(data.totalElements ?? 0) !== 1 ? "s" : ""}
          </p>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.content.map((item, i) => (
              <li
                key={item.hotel.id}
                className={`animate-fade-in-up opacity-0 ${i < 6 ? ["stagger-1", "stagger-2", "stagger-3", "stagger-4", "stagger-5"][i % 5] : ""}`}
                style={{ animationFillMode: "forwards" }}
              >
                <Link
                  href={`/hotels/${item.hotel.id}`}
                  className="card card-hover block p-5 transition-transform hover:-translate-y-0.5"
                >
                  <span className="font-medium text-[rgb(var(--color-ink))]">
                    {item.hotel.name ?? `Hotel ${item.hotel.id}`}
                  </span>
                  {item.hotel.city && (
                    <span className="ml-2 text-[rgb(var(--color-ink-muted))]">— {item.hotel.city}</span>
                  )}
                  <span className="mt-2 block text-[rgb(var(--color-accent))]">
                    ₹{item.price?.toFixed(0) ?? "—"} / night (avg)
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {(data.totalPages ?? 1) > 1 && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-[rgb(var(--color-ink-muted))]">
                Page {(data.number ?? 0) + 1} of {data.totalPages ?? 1}
              </span>
              <button
                type="button"
                disabled={page >= (data.totalPages ?? 1) - 1}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {!city.trim() && !loading && (
        <p className="mt-6 text-[rgb(var(--color-ink-subtle))]">Enter a city to search.</p>
      )}
    </div>
  );
}

export default function HotelsSearchPage() {
  return (
    <Suspense fallback={<p className="text-[rgb(var(--color-ink-muted))]">Loading…</p>}>
      <HotelsSearchContent />
    </Suspense>
  );
}
