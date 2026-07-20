import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate({ to: "/auth" }); return; }
      setUser(data.session.user);
      supabase.from("user_roles").select("role").eq("user_id", data.session.user.id).eq("role", "admin").maybeSingle()
        .then(({ data: r }) => { setIsAdmin(!!r); setLoading(false); });
    });
  }, [navigate]);

  if (loading || !user) return <Layout><div className="p-20 text-center text-muted-foreground">Loading…</div></Layout>;

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold">Your dashboard</h1>
        <p className="mt-2 text-muted-foreground">Signed in as {user.email}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-semibold">Purchases</h3>
            <p className="mt-1 text-sm text-muted-foreground">Your purchase history will appear here.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-semibold">Wishlist</h3>
            <p className="mt-1 text-sm text-muted-foreground">Save products to buy later.</p>
          </div>
          {isAdmin && (
            <div className="rounded-2xl border border-primary/60 bg-card p-6 shadow-glow md:col-span-2">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" /> <span className="font-semibold">Administrator</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Manage products, add QR codes, and grant admin roles.</p>
              <Link to="/admin" className="mt-4 inline-block"><Button variant="hero">Open admin panel</Button></Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
