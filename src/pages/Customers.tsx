import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Plus, Phone, MessageCircle, LayoutGrid, List, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useStore } from "@/hooks/useStore";
import { formatINR } from "@/lib/mock-data";
import { CustomerStatus } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Customer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddCustomerDialog } from "@/components/dialogs/AddCustomerDialog";
import { ReminderDialog } from "@/components/dialogs/ReminderDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const filters: { id: "all" | CustomerStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "overdue", label: "Overdue" },
  { id: "pending", label: "Pending" },
  { id: "paid", label: "Cleared" },
];

const Customers = () => {
  const { customers, deleteCustomer } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | CustomerStatus>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [addOpen, setAddOpen] = useState(false);
  const [reminderFor, setReminderFor] = useState<Customer | null>(null);
  const [deleteFor, setDeleteFor] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchQuery = !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query);
      const matchStatus = filter === "all" || c.status === filter;
      return matchQuery && matchStatus;
    });
  }, [query, filter, customers]);

  const handleDelete = () => {
    if (!deleteFor) return;
    deleteCustomer(deleteFor.id);
    toast.success(`${deleteFor.name} removed from your khata`);
    setDeleteFor(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your khata customers, dues, and reminders.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow-saffron rounded-xl gap-2 self-start sm:self-auto">
          <Plus className="size-4" /> Add Customer
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/40 transition-smooth"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <div className="flex p-1 rounded-xl bg-surface-raised border border-border/50">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-smooth whitespace-nowrap",
                  filter === f.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex p-1 rounded-xl bg-surface-raised border border-border/50">
            <button onClick={() => setView("grid")} className={cn("p-1.5 rounded-lg transition-smooth", view === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")} aria-label="Grid view">
              <LayoutGrid className="size-4" />
            </button>
            <button onClick={() => setView("list")} className={cn("p-1.5 rounded-lg transition-smooth", view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")} aria-label="List view">
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bg-card border border-border/50 rounded-2xl p-12 text-center">
          <div className="size-16 rounded-2xl bg-surface-raised mx-auto flex items-center justify-center mb-4">
            <Filter className="size-6 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-1">No customers found</h3>
          <p className="text-sm text-muted-foreground mb-4">{query || filter !== "all" ? "Try adjusting your search or filter." : "Start by adding your first customer."}</p>
          {!query && filter === "all" && (
            <Button onClick={() => setAddOpen(true)} className="rounded-xl bg-gradient-primary text-primary-foreground gap-2"><Plus className="size-4" /> Add Customer</Button>
          )}
        </div>
      )}

      {view === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="group block bg-card border border-border/50 rounded-2xl p-5 hover:border-saffron/40 hover:shadow-elegant-lg transition-smooth">
                <Link to={`/customers/${c.id}`} className="block">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={cn("size-14 rounded-2xl bg-gradient-to-br flex items-center justify-center font-display font-bold text-white text-lg shrink-0", c.avatarColor)}>
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.phone}</div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{c.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <StatusBadge status={c.status} />
                    <span className="text-xs text-muted-foreground font-medium">
                      {c.lastTransactionTime ? format(new Date(c.lastTransactionTime), "dd MMM, hh:mm a") : "No entries"}
                    </span>
                  </div>
                </Link>
                <div className="flex items-end justify-between pt-4 border-t border-border/50">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Total Due</div>
                    <div className={cn("font-display text-xl font-semibold tabular-nums", c.totalDue > 0 ? "text-saffron" : "text-cardamom")}>₹{formatINR(c.totalDue)}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <a href={`tel:${c.phone}`} onClick={(e) => e.stopPropagation()} className="size-8 rounded-lg bg-surface-raised hover:bg-surface-hover flex items-center justify-center text-muted-foreground hover:text-cardamom transition-smooth" aria-label="Call">
                      <Phone className="size-4" />
                    </a>
                    <button onClick={() => setReminderFor(c)} className="size-8 rounded-lg bg-surface-raised hover:bg-surface-hover flex items-center justify-center text-muted-foreground hover:text-saffron transition-smooth" aria-label="Remind">
                      <MessageCircle className="size-4" />
                    </button>
                    <button onClick={() => setDeleteFor(c)} className="size-8 rounded-lg bg-surface-raised hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-smooth" aria-label="Delete">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {view === "list" && filtered.length > 0 && (
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-elegant">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground border-b border-border/50 bg-surface-raised/40">
            <div className="col-span-4">Customer</div>
            <div className="col-span-3">Phone</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Total Due</div>
            <div className="col-span-1"></div>
          </div>
          {filtered.map((c) => (
            <div key={c.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 items-center border-b border-border/50 last:border-0 hover:bg-surface-hover/60 transition-smooth">
              <Link to={`/customers/${c.id}`} className="col-span-4 flex items-center gap-3 min-w-0">
                <div className={cn("size-10 rounded-xl bg-gradient-to-br flex items-center justify-center font-display font-bold text-white text-sm shrink-0", c.avatarColor)}>{c.initials}</div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground truncate md:hidden">{c.phone}</div>
                </div>
              </Link>
              <div className="col-span-3 text-sm text-muted-foreground hidden md:block truncate">{c.phone}</div>
              <div className="col-span-2"><StatusBadge status={c.status} /></div>
              <div className="col-span-2 md:text-right">
                <span className={cn("font-display font-semibold tabular-nums", c.totalDue > 0 ? "text-saffron" : "text-cardamom")}>₹{formatINR(c.totalDue)}</span>
              </div>
              <div className="col-span-1 hidden md:flex justify-end gap-1">
                <button onClick={() => setReminderFor(c)} className="size-8 rounded-lg hover:bg-surface-hover flex items-center justify-center text-muted-foreground hover:text-saffron transition-smooth" aria-label="Remind">
                  <MessageCircle className="size-4" />
                </button>
                <button onClick={() => setDeleteFor(c)} className="size-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-smooth" aria-label="Delete">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddCustomerDialog open={addOpen} onOpenChange={setAddOpen} />
      <ReminderDialog open={!!reminderFor} onOpenChange={(v) => !v && setReminderFor(null)} customer={reminderFor} />

      <AlertDialog open={!!deleteFor} onOpenChange={(v) => !v && setDeleteFor(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteFor?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the customer and all their {deleteFor ? "transactions" : ""}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Customers;
