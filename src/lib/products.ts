import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  title: string;
  description: string;
  category: string;
  price_cents: number;
  is_free: boolean;
  image_url: string | null;
  qr_code_url: string | null;
  created_at: string;
};

export const CATEGORIES = [
  "Plugins", "Configs", "Setups", "Builds", "Maps", "Resource Packs",
  "Models", "Discord Services", "Websites", "Hosting", "Graphics", "Other",
] as const;

export function formatPrice(cents: number, isFree: boolean) {
  if (isFree || cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

export async function listProducts(opts: { category?: string; search?: string } = {}) {
  let q = supabase.from("products").select("*").order("created_at", { ascending: false });
  if (opts.category) q = q.eq("category", opts.category);
  if (opts.search) q = q.ilike("title", `%${opts.search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getProduct(id: string) {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function uploadMedia(file: File, prefix: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-media").upload(path, file, {
    contentType: file.type, upsert: false,
  });
  if (error) throw error;
  const { data, error: sErr } = await supabase.storage.from("product-media")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  if (sErr) throw sErr;
  return data.signedUrl;
}
