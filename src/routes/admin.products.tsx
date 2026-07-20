import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CATEGORIES, formatPrice, listProducts, uploadMedia } from "@/lib/products";
import { Plus, Trash2, Package } from "lucide-react";

export const Route = createFileRoute("/admin/products")({ component: Products });

function Products() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [price, setPrice] = useState("0");
  const [isFree, setIsFree] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [qr, setQr] = useState<File | null>(null);

  function resetForm() {
    setTitle(""); setDescription(""); setCategory(CATEGORIES[0]); setPrice("0");
    setIsFree(false); setImage(null); setQr(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const paid = !isFree && Number(price) > 0;
      const imageUrl = image ? await uploadMedia(image, "images") : null;
      const qrUrl = paid && qr ? await uploadMedia(qr, "qr") : null;
      const { error } = await supabase.from("products").insert({
        title, description, category,
        price_cents: isFree ? 0 : Math.round(Number(price) * 100),
        is_free: isFree,
        image_url: imageUrl,
        qr_code_url: qrUrl,
      });
      if (error) throw error;
      toast.success("Product added");
      resetForm(); setOpen(false);
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to add product");
    } finally { setBusy(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["products"] }); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products</h2>
        <Button variant="hero" onClick={() => setOpen((o) => !o)}>
          <Plus className="h-4 w-4" /> {open ? "Close" : "Add product"}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Price (USD)</Label>
              <Input type="number" step="0.01" min="0" value={price} disabled={isFree} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
                Free product
              </label>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Product image</Label>
              <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
            </div>
            <div>
              <Label>Payment QR (only for paid products)</Label>
              <Input type="file" accept="image/*" disabled={isFree || Number(price) <= 0} onChange={(e) => setQr(e.target.files?.[0] ?? null)} />
              <p className="mt-1 text-xs text-muted-foreground">Shown to buyers at checkout for paid products.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { resetForm(); setOpen(false); }}>Cancel</Button>
            <Button type="submit" variant="hero" disabled={busy}>{busy ? "Saving…" : "Create product"}</Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        {products.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No products yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">QR</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-border/60">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                        {p.image_url
                          ? <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                          : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><Package className="h-4 w-4" /></div>}
                      </div>
                      <div className="font-medium">{p.title}</div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.category}</td>
                  <td className="p-3">{formatPrice(p.price_cents, p.is_free)}</td>
                  <td className="p-3">{p.qr_code_url ? "✓" : "—"}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => del(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
