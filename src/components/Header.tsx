import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/minemart-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo.url} alt="MineMart" className="h-9 w-auto" />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">Home</Link>
          <Link to="/browse" className="text-sm text-muted-foreground hover:text-foreground transition">Browse</Link>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1 text-sm text-primary hover:opacity-80">
              <ShieldCheck className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard" className="hidden sm:flex">
                <Button variant="ghost" size="sm"><UserIcon className="h-4 w-4 mr-1" /> {user.email?.split("@")[0]}</Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth"><Button size="sm" variant="hero">Sign in</Button></Link>
          )}
        </div>
      </div>
    </header>
  );
}
