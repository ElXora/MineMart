import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Package, Users } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: Overview });

function Overview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [{ count: products }, { count: users }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      return { products: products ?? 0, users: users ?? 0 };
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground"><Package className="h-4 w-4" /> Products</div>
          <div className="mt-2 text-3xl font-bold">{stats?.products ?? "–"}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> Users</div>
          <div className="mt-2 text-3xl font-bold">{stats?.users ?? "–"}</div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-semibold">Quick actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/admin/products"><Button variant="hero">Manage products</Button></Link>
          <Link to="/admin/admins"><Button variant="outline">Manage admins</Button></Link>
        </div>
      </div>
    </div>
  );
}
