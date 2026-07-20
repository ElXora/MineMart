import { Link } from "@tanstack/react-router";

const links = [
  { title: "Marketplace", items: [{ label: "Browse", to: "/browse" }, { label: "Categories", to: "/browse" }] },
  { title: "Account", items: [{ label: "Sign in", to: "/auth" }, { label: "Dashboard", to: "/dashboard" }] },
  { title: "Company", items: [{ label: "About", to: "/" }, { label: "Contact", to: "/" }] },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <div className="text-lg font-bold text-gradient-primary">MineMart</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Premium Minecraft marketplace — plugins, setups, builds and more from top creators.
          </p>
        </div>
        {links.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
            <ul className="space-y-2">
              {col.items.map((i) => (
                <li key={i.label}>
                  <Link to={i.to} className="text-sm text-muted-foreground hover:text-foreground">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MineMart. All rights reserved.
      </div>
    </footer>
  );
}
