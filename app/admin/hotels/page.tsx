"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

type Hotel = { id: number; name?: string; city?: string; active?: boolean };

export default function AdminHotelsPage() {
  const { token, isReady, isAdmin, rolesChecked } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (!isReady || !token || (rolesChecked && !isAdmin)) {
      setLoading(false);
      return;
    }
    api<Hotel[]>("/admin/hotels", { token })
      .then(setHotels)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [token, isReady, isAdmin, rolesChecked]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    try {
      const created = await api<Hotel>("/admin/hotels", {
        method: "POST",
        body: JSON.stringify({ name, city }),
        token,
      });
      setHotels((h) => [...h, created]);
      setName("");
      setCity("");
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    }
  }

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
  if (rolesChecked && !isAdmin) {
    return (
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl text-[rgb(var(--color-ink))]">Admin</h1>
        <p className="mt-4 text-[rgb(var(--color-ink-muted))]">Admin access is required. This area is for hotel managers only.</p>
        <div className="mt-4 flex gap-4">
          <Link href="/" className="link-accent-underline inline-block">Back to home</Link>
          <Link href="/admin/signup?redirect=%2Fadmin" className="link-accent-underline inline-block">Create manager account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl text-[rgb(var(--color-ink))]">My hotels</h1>
      <Link href="/admin" className="link-accent-underline mt-2 inline-block text-sm">← Admin</Link>
      {error && <p className="mt-3 text-sm text-[rgb(var(--color-accent))]" role="alert">{error}</p>}
      {loading ? (
        <p className="mt-4 text-[rgb(var(--color-ink-muted))]">Loading…</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {hotels.map((h) => (
            <li key={h.id} className="card flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <Link href={`/admin/hotels/${h.id}`} className="link-accent-underline font-medium">
                {h.name ?? `Hotel ${h.id}`}
              </Link>
              <span className="text-sm text-[rgb(var(--color-ink-muted))]">{h.city}</span>
              <span className={`rounded-[var(--radius-sm)] px-2 py-0.5 text-sm ${h.active ? "bg-[rgb(var(--color-accent)/0.12)] text-[rgb(var(--color-accent-hover))]" : "bg-[rgb(var(--color-border))] text-[rgb(var(--color-ink-muted))]"}`}>
                {h.active ? "Active" : "Inactive"}
              </span>
            </li>
          ))}
        </ul>
      )}
      {showForm ? (
        <form onSubmit={handleCreate} className="card mt-6 max-w-md space-y-4 p-5">
          <h2 className="font-semibold text-[rgb(var(--color-ink))]">Create hotel</h2>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="input-field" />
          <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="input-field" />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setShowForm(true)} className="btn-primary mt-6">
          Add hotel
        </button>
      )}
    </div>
  );
}
