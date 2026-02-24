"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import Link from "next/link";

type Guest = { id: number; name: string; gender: string; age?: number };

export default function MyGuestsPage() {
  const { token, isReady } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("MALE");
  const [age, setAge] = useState("");

  function loadGuests() {
    if (!token) return;
    api<Guest[]>("/users/guests", { token })
      .then(setGuests)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!isReady) return;
    if (!token) {
      setLoading(false);
      return;
    }
    loadGuests();
  }, [token, isReady]);

  function resetForm() {
    setName("");
    setGender("MALE");
    setAge("");
    setEditId(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    try {
      if (editId) {
        await api(`/users/guests/${editId}`, {
          method: "PUT",
          body: JSON.stringify({ name, gender, age: age ? parseInt(age, 10) : undefined }),
          token,
        });
      } else {
        await api("/users/guests", {
          method: "POST",
          body: JSON.stringify({ name, gender, age: age ? parseInt(age, 10) : undefined }),
          token,
        });
      }
      resetForm();
      loadGuests();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function handleDelete(id: number) {
    if (!token || !confirm("Remove this guest?")) return;
    try {
      await api(`/users/guests/${id}`, { method: "DELETE", token });
      loadGuests();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (!isReady) return <p className="text-[rgb(var(--color-ink-muted))]">Loading…</p>;
  if (!token) {
    return (
      <div className="animate-fade-in-up">
        <p className="text-[rgb(var(--color-ink-muted))]">Log in to manage guests.</p>
        <Link href="/login" className="link-accent-underline mt-3 inline-block">Log in</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl text-[rgb(var(--color-ink))]">My guests</h1>
      {error && <p className="mt-3 text-sm text-[rgb(var(--color-accent))]" role="alert">{error}</p>}
      {loading ? (
        <p className="mt-4 text-[rgb(var(--color-ink-muted))]">Loading…</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {guests.map((g) => (
            <li key={g.id} className="card flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <span className="text-[rgb(var(--color-ink))]">
                {g.name} — {g.gender}{g.age != null ? `, ${g.age}` : ""}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditId(g.id);
                    setName(g.name);
                    setGender(g.gender);
                    setAge(g.age != null ? String(g.age) : "");
                    setShowForm(true);
                  }}
                  className="link-accent text-sm"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(g.id)}
                  className="text-sm text-[rgb(var(--color-ink-muted))] hover:text-[rgb(var(--color-ink))]"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {showForm || editId ? (
        <form onSubmit={handleSubmit} className="card mt-6 max-w-md space-y-4 p-5">
          <h2 className="font-semibold text-[rgb(var(--color-ink))]">{editId ? "Edit guest" : "Add guest"}</h2>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-field"
          />
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={1}
            max={120}
            className="input-field"
          />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">
              {editId ? "Update" : "Add"}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-primary mt-6"
        >
          Add guest
        </button>
      )}
    </div>
  );
}
