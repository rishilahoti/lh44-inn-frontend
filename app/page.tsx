import Link from "next/link";

export default function HomePage() {
  return (
    <section className="animate-fade-in">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl tracking-tight text-[rgb(var(--color-ink))] sm:text-5xl md:text-6xl">
          Find your next stay
        </h1>
        <p className="mt-4 text-lg text-[rgb(var(--color-ink-muted))] sm:mt-6">
          Search hotels by city and dates. Simple, warm, and ready when you are.
        </p>
        <div className="mt-8 sm:mt-10">
          <Link href="/hotels" className="btn-primary text-base">
            Search hotels
          </Link>
        </div>
      </div>
    </section>
  );
}
