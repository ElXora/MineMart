import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { formatPrice, getProduct } from "@/lib/products";
import { ArrowLeft, Package, QrCode, X } from "lucide-react";

export const Route = createFileRoute("/products/$id")({
  component: ProductPage,
  errorComponent: () => (
    <Layout><div className="p-20 text-center">Failed to load product.</div></Layout>
  ),
  notFoundComponent: () => (
    <Layout><div className="p-20 text-center">Product not found.</div></Layout>
  ),
});

function ProductPage() {
  const { id } = Route.useParams();
  const [showQR, setShowQR] = useState(false);
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const p = await getProduct(id);
      if (!p) throw notFound();
      return p;
    },
  });

  if (isLoading) return <Layout><div className="p-20 text-center text-muted-foreground">Loading…</div></Layout>;
  if (!product) return null;

  const isPaid = !product.is_free && product.price_cents > 0;

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link to="/browse" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to browse
        </Link>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
            {product.image_url ? (
              <img src={product.image_url} alt={product.title} className="aspect-square w-full object-cover" />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground">
                <Package className="h-16 w-16" />
              </div>
            )}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-primary">{product.category}</div>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{product.title}</h1>
            <div className={`mt-3 text-2xl font-bold ${isPaid ? "text-primary" : "text-gold"}`}>
              {formatPrice(product.price_cents, product.is_free)}
            </div>
            <p className="mt-6 whitespace-pre-wrap text-muted-foreground">{product.description || "No description provided."}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {isPaid ? (
                <Button variant="hero" size="lg" onClick={() => setShowQR(true)}>
                  <QrCode className="h-4 w-4" /> Buy — scan QR to pay
                </Button>
              ) : (
                <Button variant="gold" size="lg">Download for free</Button>
              )}
              <Button variant="outline" size="lg">Add to wishlist</Button>
            </div>
          </div>
        </div>
      </div>

      {showQR && isPaid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-glow">
            <button
              onClick={() => setShowQR(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted"
              aria-label="Close"
            ><X className="h-5 w-5" /></button>
            <h3 className="text-center text-lg font-semibold">Scan to pay</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Complete your purchase of <b>{product.title}</b> — {formatPrice(product.price_cents, false)}
            </p>
            <div className="mt-6 flex items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-4">
              {product.qr_code_url ? (
                <img src={product.qr_code_url} alt="Payment QR" className="h-64 w-64 object-contain" />
              ) : (
                <div className="flex h-64 w-64 flex-col items-center justify-center gap-2 text-neutral-500">
                  <QrCode className="h-16 w-16" />
                  <p className="text-center text-xs">Admin hasn't uploaded a QR yet.</p>
                </div>
              )}
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              After paying, contact support with your transaction ID to receive download access.
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
