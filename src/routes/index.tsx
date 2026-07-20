import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { CATEGORIES, listProducts } from "@/lib/products";
import { Search, Sparkles, ShieldCheck, Zap } from "lucide-react";
import logo from "@/assets/minemart-logo.png";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const featured = products.slice(0, 8);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <img src={logo.url} alt="MineMart" className="mx-auto h-20 w-auto sm:h-24" />
            <h1 className="mt-8 text-4xl font-bold leading-tight sm:text-6xl">
              The <span className="text-gradient-primary">premium</span> marketplace for Minecraft.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Plugins, setups, builds, resource packs and services — hand-picked from top creators.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/browse"><Button size="lg" variant="hero">Browse marketplace</Button></Link>
              <Link to="/auth"><Button size="lg" variant="outline">Sign in</Button></Link>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = (new FormData(e.currentTarget).get("q") as string) || "";
                window.location.href = `/browse?q=${encodeURIComponent(q)}`;
              }}
              className="mx-auto mt-10 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 backdrop-blur"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <input name="q" placeholder="Search plugins, setups, builds…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              <Button type="submit" variant="hero" size="sm">Search</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Hand-picked quality", body: "Every listing is reviewed for polish and performance." },
            { icon: ShieldCheck, title: "Secure checkout", body: "Payments and downloads with buyer protection." },
            { icon: Zap, title: "Instant delivery", body: "Get your files and access the moment you buy." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Explore categories</h2>
          <Link to="/browse" className="text-sm text-primary hover:underline">See all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/browse"
              search={{ category: c }}
              className="group rounded-xl border border-border/60 bg-card/60 p-4 text-center transition hover:border-primary/50 hover:bg-card"
            >
              <div className="text-sm font-medium">{c}</div>
              <div className="mt-1 text-[11px] text-muted-foreground group-hover:text-primary">Browse →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Featured products</h2>
          <Link to="/browse" className="text-sm text-primary hover:underline">See all →</Link>
        </div>
        {featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-14 text-center text-muted-foreground">
            No products yet. Admins can add the first ones from the Admin panel.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </Layout>
  );
}
