import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, listProducts } from "@/lib/products";
import { Input } from "@/components/ui/input";

const search = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/browse")({
  validateSearch: (s) => search.parse(s),
  component: Browse,
});

function Browse() {
  const { category, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", category, q],
    queryFn: () => listProducts({ category, search: q }),
  });

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold">Browse the marketplace</h1>
        <p className="mt-2 text-muted-foreground">Discover premium Minecraft content from creators worldwide.</p>

        <div className="mt-6">
          <Input
            placeholder="Search products…"
            defaultValue={q ?? ""}
            onChange={(e) => navigate({ search: { category, q: e.target.value || undefined } })}
            className="max-w-md"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/browse"
            search={{ q }}
            className={`rounded-full border px-4 py-1.5 text-sm ${!category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card/60 hover:border-primary/50"}`}
          >All</Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/browse"
              search={{ category: c, q }}
              className={`rounded-full border px-4 py-1.5 text-sm ${category === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card/60 hover:border-primary/50"}`}
            >{c}</Link>
          ))}
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-20">Loading…</div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-14 text-center text-muted-foreground">
              No products match your filters.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
