import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Receipt, BarChart3, Settings, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reminders", url: "/reminders", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout, customers } = useStore();

  const shopName = session?.shopName || "Our Shop";
  const shopInitials = shopName.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <>
      <div
        className={cn("fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden transition-opacity", open ? "opacity-100" : "opacity-0 pointer-events-none")}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-dvh w-64 shrink-0",
          "bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border",
          "flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-primary flex items-center justify-center font-display font-bold text-lg text-primary-foreground shadow-glow-saffron">U</div>
          <div>
            <div className="font-display text-lg font-semibold tracking-tight">Udhaar</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Smart Khata</div>
          </div>
        </div>

        <nav className="flex-1 px-4 pt-4 flex flex-col gap-1">
          {items.map((item) => {
            const active = location.pathname === item.url;
            const needsNudgeCount = customers.filter(c => c.status === 'overdue' || (c.status === 'pending' && c.totalDue > 5000)).length;
            const badge = item.url === "/reminders" && needsNudgeCount > 0 ? needsNudgeCount : null;
            return (
              <NavLink
                key={item.url}
                to={item.url}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth",
                  active
                    ? "bg-surface-raised text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover/60"
                )}
              >
                <item.icon className={cn("size-[18px] transition-smooth", active && "text-saffron")} />
                <span className="flex-1">{item.title}</span>
                {badge !== null && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-saffron/15 text-saffron border border-saffron/30">{badge}</span>
                )}
                {active && !badge && <span className="size-1.5 rounded-full bg-cardamom shadow-glow-cardamom animate-pulse-glow" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4">
          <div className="rounded-2xl p-4 bg-surface-raised/60 border border-border/50 flex items-center gap-3">
            <div className="size-10 rounded-full bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground text-sm shrink-0">{shopInitials || "U"}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{shopName}</div>
              <div className="text-xs text-muted-foreground truncate">{session ? `+91 ${session.phone}` : "Pro Plan"}</div>
            </div>
            <button
              className="size-8 rounded-lg hover:bg-surface-hover flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth"
              aria-label="Sign out"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
