import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, Search, Bell, Plus } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { AddTransactionDialog } from "./dialogs/AddTransactionDialog";
import { useStore } from "@/lib/store";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [txnOpen, setTxnOpen] = useState(false);
  const { customers } = useStore();
  const navigate = useNavigate();
  const unread = customers.filter(c => c.status === 'overdue' || (c.status === 'pending' && c.totalDue > 5000)).length;

  return (
    <div className="min-h-dvh bg-background text-foreground flex relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 bg-gradient-warm" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-cool" />

      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-screen min-w-0 relative z-10 overflow-hidden">
        <header className="shrink-0 h-16 lg:h-20 border-b border-border/50 bg-background/70 backdrop-blur-xl flex items-center px-4 lg:px-8 gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </Button>

          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search customers, entries..."
              onFocus={() => navigate("/customers")}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-raised/60 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/40 transition-smooth"
            />
          </div>

          <div className="flex-1 sm:hidden" />

          <div className="flex items-center gap-1.5">
            <Button 
              size="sm" 
              onClick={() => setTxnOpen(true)} 
              className="hidden sm:inline-flex bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow-saffron rounded-xl gap-2 transition-smooth hover:scale-[1.02]"
            >
              <Plus className="size-4" /> New Entry
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full relative" aria-label="Notifications" onClick={() => navigate("/reminders")}>
              <Bell className="size-[1.1rem]" />
              {unread > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-saffron shadow-glow-saffron animate-pulse-glow" />}
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden animate-fade-in custom-scrollbar">
          <div className="min-h-full pb-20">
            <Outlet />
          </div>
        </main>
      </div>

      <AddTransactionDialog open={txnOpen} onOpenChange={setTxnOpen} />
    </div>
  );
}
