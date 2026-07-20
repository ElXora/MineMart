import { Link } from "@tanstack/react-router";
import { formatPrice, type Product } from "@/lib/products";
import { Package } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/products/$id"
      params={{ id: product.id }}
      className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package className="h-10 w-10" />
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur">
          {product.category}
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold">{product.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description || "No description"}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className={product.is_free || product.price_cents === 0 ? "text-sm font-semibold text-gold" : "text-sm font-semibold text-primary"}>
            {formatPrice(product.price_cents, product.is_free)}
          </span>
          <span className="text-xs text-muted-foreground group-hover:text-primary">View →</span>
        </div>
      </div>
    </Link>
  );
}
