import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/admins")({ component: Admins });

type Row = { user_id: string; email: string | null; display_name: string | null };

async function loadAdmins(): Promise<Row[]> {
  const { data: roles, error } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
  if (error) throw error;
  const ids = (roles ?? []).map((r) => r.user_id);
  if (ids.length === 0) return [];
  const { data: profiles } = await supabase.from("profiles").select("id,display_name").in("id", ids);
  return ids.map((id) => {
    const p = profiles?.find((x) => x.id === id);
    return { user_id: id, email: null, display_name: p?.display_name ?? null };
  });
}

function Admins() {
  const qc = useQueryClient();
  const { data: admins = [] } = useQuery({ queryKey: ["admins"], queryFn: loadAdmins });
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      // Look up user by email via profiles (display_name may equal username; we match by profile id we can't get by email client-side)
      // Simpler: use auth.admin via server function is not set up. We use a workaround: the user must have signed up.
      // Try RPC-less approach: find profile by display_name matching email prefix — unreliable.
      // Best: create a server function. For now, ask target user to sign up first and use their user_id.
      // We'll accept a user_id here instead.
      toast.error("Enter the user's UUID (from their profile) below — email-based lookup requires a server function.");
    } finally { setBusy(false); }
  }

  async function grantById(userId: string) {
    setBusy(true);
    try {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) throw error;
      toast.success("Admin granted");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["admins"] });
    } catch (err: any) {
      toast.error(err.message ?? "Failed");
    } finally { setBusy(false); }
  }

  async function revoke(userId: string) {
    if (!confirm("Revoke admin?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    if (error) toast.error(error.message);
    else { toast.success("Revoked"); qc.invalidateQueries({ queryKey: ["admins"] }); }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="h-5 w-5 text-primary" /> Add administrator</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask the person to sign up first, then paste their User ID below. You can find IDs in the Users list in Cloud.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); if (email) grantById(email.trim()); else grant(e); }}
          className="mt-4 flex gap-2"
        >
          <div className="flex-1">
            <Label htmlFor="uid" className="sr-only">User ID</Label>
            <Input id="uid" placeholder="User UUID" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" variant="hero" disabled={busy || !email}>Grant admin</Button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">User</th><th className="p-3">User ID</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No admins.</td></tr>
            ) : admins.map((a) => (
              <tr key={a.user_id} className="border-t border-border/60">
                <td className="p-3 font-medium">{a.display_name ?? "—"}</td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{a.user_id}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => revoke(a.user_id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
