import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { LayoutDashboard, Package, UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate({ to: "/auth" }); return; }
      supabase.from("user_roles").select("role").eq("user_id", data.session.user.id).eq("role", "admin").maybeSingle()
        .then(({ data: r }) => { setIsAdmin(!!r); setChecked(true); });
    });
  }, [navigate]);

  if (!checked) return <Layout><div className="p-20 text-center text-muted-foreground">Loading…</div></Layout>;
  if (!isAdmin) return <Layout><div className="p-20 text-center">Access denied. Admins only.</div></Layout>;

  const nav = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/admins", label: "Admins", icon: UserPlus },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage MineMart</p>
        </div>
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <aside className="space-y-1">
            {nav.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-card hover:text-foreground"}`}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
          </aside>
          <div><Outlet /></div>
        </div>
      </div>
    </Layout>
  );
}
