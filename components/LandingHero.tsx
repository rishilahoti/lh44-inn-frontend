"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { api } from "@/lib/api";
import { useState } from "react";

const sectionVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const revealUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

const HERO_CITY_POOL = ["Mumbai", "Jaipur", "Delhi", "Bengaluru", "Goa", "Udaipur"];
const DEFAULT_SPOTLIGHT = { city: "Jaipur", rooms: 74 };

type SearchItem = { hotel: { id: number } };
type SearchResponse = { content: SearchItem[] };
type HotelInfoResponse = { rooms: Array<{ totalCount?: number }> };

export function LandingHero() {
  const prefersReducedMotion = useReducedMotion();
  const [spotlight, setSpotlight] = useState(DEFAULT_SPOTLIGHT);

  const meshRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const blobARef = useRef<HTMLDivElement>(null);
  const blobBRef = useRef<HTMLDivElement>(null);
  const blobCRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!meshRef.current || !gridRef.current || !ringRef.current || !blobARef.current || !blobBRef.current || !blobCRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(meshRef.current, {
        backgroundPosition: "130% 60%",
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(gridRef.current, {
        backgroundPosition: "180px 120px",
        duration: 24,
        repeat: -1,
        ease: "none",
      });

      gsap.to(ringRef.current, {
        rotate: 360,
        duration: 28,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });

      gsap.to(blobARef.current, {
        x: 38,
        y: -24,
        duration: 7.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(blobBRef.current, {
        x: -30,
        y: 34,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(blobCRef.current, {
        x: 20,
        y: 18,
        duration: 6.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  useEffect(() => {
    let cancelled = false;

    const shuffle = <T,>(items: T[]): T[] => {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const loadSpotlight = async () => {
      for (const city of shuffle(HERO_CITY_POOL)) {
        try {
          const params = new URLSearchParams({
            city,
            roomsCount: "1",
            page: "0",
            size: "12",
          });
          const search = await api<SearchResponse>(`/hotels/search?${params.toString()}`);
          if (!search.content || search.content.length === 0) continue;

          const picked = search.content[Math.floor(Math.random() * search.content.length)];
          const info = await api<HotelInfoResponse>(`/hotels/${picked.hotel.id}/info`);
          const totalRooms = info.rooms.reduce((sum, room) => sum + (room.totalCount ?? 0), 0);
          const safeRooms = totalRooms > 0 ? totalRooms : Math.max(info.rooms.length, 1);

          if (!cancelled) {
            setSpotlight({ city, rooms: safeRooms });
          }
          return;
        } catch {
          // Try the next city; keep current spotlight on failure.
        }
      }
    };

    void loadSpotlight();
    const intervalId = window.setInterval(() => {
      void loadSpotlight();
    }, 45000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="relative min-h-[78vh] overflow-hidden rounded-2xl border border-[rgb(var(--color-border))] px-5 py-14 sm:px-8 sm:py-16">
      <div
        ref={meshRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 6% 8%, rgb(var(--color-paper-elevated)) 0%, transparent 52%), radial-gradient(120% 120% at 92% 16%, rgb(var(--color-accent) / 0.28) 0%, transparent 56%), radial-gradient(150% 150% at 50% 100%, rgb(var(--color-ink-subtle) / 0.18) 0%, transparent 64%)",
          backgroundSize: "180% 180%",
          backgroundPosition: "20% 20%",
        }}
      />

      <div
        ref={gridRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgb(var(--color-border) / 0.45) 0px, rgb(var(--color-border) / 0.45) 1px, transparent 1px, transparent 34px), repeating-linear-gradient(90deg, rgb(var(--color-border) / 0.45) 0px, rgb(var(--color-border) / 0.45) 1px, transparent 1px, transparent 34px)",
          maskImage: "radial-gradient(80% 70% at 55% 40%, black 60%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(80% 70% at 55% 40%, black 60%, transparent 100%)",
        }}
      />

      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none absolute -right-20 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-[rgb(var(--color-accent)/0.35)]"
        style={{
          boxShadow: "0 0 0 18px rgb(var(--color-accent) / 0.05), inset 0 0 0 2px rgb(var(--color-accent) / 0.15)",
        }}
      />

      <div
        ref={blobARef}
        aria-hidden
        className="pointer-events-none absolute left-[12%] top-[18%] h-52 w-52 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(var(--color-accent) / 0.42) 0%, transparent 68%)" }}
      />
      <div
        ref={blobBRef}
        aria-hidden
        className="pointer-events-none absolute right-[20%] top-[55%] h-64 w-64 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(var(--color-ink-subtle) / 0.25) 0%, transparent 68%)" }}
      />
      <div
        ref={blobCRef}
        aria-hidden
        className="pointer-events-none absolute left-[42%] top-[74%] h-44 w-44 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(var(--color-paper-elevated) / 0.9) 0%, transparent 68%)" }}
      />

      <motion.div
        className="relative z-10 mx-auto grid w-full max-w-6xl items-end gap-10 md:grid-cols-[1.12fr_0.88fr]"
        variants={sectionVariant}
        initial="hidden"
        animate="visible"
      >
        <div>
          <motion.p
            variants={revealUp}
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--color-border-strong))] bg-[rgb(var(--color-paper-elevated)/0.78)] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[rgb(var(--color-ink-muted))] backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--color-accent))]" />
            live availability
          </motion.p>

          <motion.h1
            variants={revealUp}
            className="mt-6 max-w-3xl font-display text-5xl leading-[0.92] tracking-tight text-[rgb(var(--color-ink))] sm:text-6xl md:text-7xl"
          >
            Stay somewhere
            <br />
            worth remembering.
          </motion.h1>

          <motion.div
            variants={revealUp}
            className="mt-7 h-px w-28 bg-[rgb(var(--color-accent))]"
          />

          <motion.p
            variants={revealUp}
            className="mt-7 max-w-xl text-base leading-relaxed text-[rgb(var(--color-ink-muted))] sm:text-lg"
          >
            Instant hotel search by city and dates, with a calm booking flow built for late-night plans and last-minute escapes.
          </motion.p>

          <motion.div variants={revealUp} className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/hotels" className="hero-cta inline-block">
              Search hotels
            </Link>
            <Link href="/bookings" className="link-accent-underline text-sm uppercase tracking-[0.18em]">
              View bookings
            </Link>
          </motion.div>
        </div>

        <motion.aside
          variants={revealUp}
          className="relative max-w-md justify-self-start rounded-2xl border border-[rgb(var(--color-border-strong))] bg-[rgb(var(--color-paper-elevated)/0.75)] p-5 backdrop-blur sm:p-6 md:justify-self-end"
          style={{ boxShadow: "0 24px 64px rgb(38 36 33 / 0.12)" }}
        >
          <p className="text-xs uppercase tracking-[0.22em] text-[rgb(var(--color-ink-subtle))]">
            Tonight in {spotlight.city}
          </p>
          <p className="mt-3 font-display text-4xl text-[rgb(var(--color-ink))]">{spotlight.rooms} rooms</p>
          <p className="mt-1 text-sm text-[rgb(var(--color-ink-muted))]">available across premium and boutique stays</p>

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-[rgb(var(--color-border))] bg-white/60 px-3 py-2">
            <motion.span
              className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--color-accent))]"
              animate={prefersReducedMotion ? undefined : { scale: [1, 1.35, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <p className="text-sm text-[rgb(var(--color-ink-muted))]">pricing refresh every minute</p>
          </div>
        </motion.aside>
      </motion.div>
    </section>
  );
}
