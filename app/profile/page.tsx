"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import Link from "next/link";

type UserProfile = { id: number; email: string; name?: string; gender?: string; dateOfBirth?: string };

export default function ProfilePage() {
  const { token, isReady } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isReady || !token) {
      setLoading(false);
      return;
    }
    api<UserProfile>("/users/profile", { token })
      .then((p) => {
        setProfile(p);
        setName(p.name ?? "");
        setGender(p.gender ?? "");
        setDateOfBirth(p.dateOfBirth?.slice(0, 10) ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [token, isReady]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      await api("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: name || undefined,
          gender: gender || undefined,
          dateOfBirth: dateOfBirth || undefined,
        }),
        token,
      });
      setProfile((p) => (p ? { ...p, name, gender: gender || undefined, dateOfBirth: dateOfBirth || undefined } : null));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (!isReady) return <p className="text-[rgb(var(--color-ink-muted))]">Loading…</p>;
  if (!token) {
    return (
      <div className="animate-fade-in-up">
        <p className="text-[rgb(var(--color-ink-muted))]">Log in to view your profile.</p>
        <Link href="/login" className="link-accent-underline mt-3 inline-block">Log in</Link>
      </div>
    );
  }
  if (loading) return <p className="text-[rgb(var(--color-ink-muted))]">Loading…</p>;

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl text-[rgb(var(--color-ink))]">My profile</h1>
      <form onSubmit={handleSubmit} className="card mt-6 max-w-md space-y-5 p-6">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-ink-muted))]">Email</label>
          <p className="mt-1 text-[rgb(var(--color-ink))]">{profile?.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-ink-muted))]">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field mt-1.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-ink-muted))]">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="input-field mt-1.5"
          >
            <option value="">—</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-ink-muted))]">Date of birth</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="input-field mt-1.5"
          />
        </div>
        {error && <p className="text-sm text-[rgb(var(--color-accent))]" role="alert">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
