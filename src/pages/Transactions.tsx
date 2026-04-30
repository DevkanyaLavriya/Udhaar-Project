import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Filter, Calendar, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { formatINR } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/useStore";
import { AddTransactionDialog } from "@/components/dialogs/AddTransactionDialog";
import { FilterDialog } from "@/components/dialogs/FilterDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Transaction } from "@/lib/types";

type TxFilter = "all" | "credit" | "payment";

const Transactions = () => {
  const { transactions, deleteTransaction } = useStore();
  const [filter, setFilter] = useState<TxFilter>("all");
  const [thisMonthOnly, setThisMonthOnly] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchType = filter === "all" || t.type === filter;
      if (!thisMonthOnly) return matchType;
      
      const date = (t as any).isoDate ? new Date((t as any).isoDate) : new Date();
      const now = new Date();
      const matchMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      return matchType && matchMonth;
    });
  }, [transactions, filter, thisMonthOnly]);

  const stats = useMemo(() => {
    const credit = filtered.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
    const payment = filtered.filter((t) => t.type === "payment").reduce((s, t) => s + t.amount, 0);
    return { credit, payment };
  }, [filtered]);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteTransaction(deleteId);
    toast.success("Entry removed");
    setDeleteId(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1 font-medium">Every entry in your khata, in one timeline.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setThisMonthOnly(!thisMonthOnly)}
            className={cn("rounded-xl gap-2 transition-smooth", thisMonthOnly && "bg-saffron/10 border-saffron/50 text-saffron shadow-sm")}
          >
            <Calendar className="size-4" /> This Month
          </Button>
          <Button onClick={() => setAddOpen(true)} className="rounded-xl gap-2 bg-gradient-primary text-primary-foreground shadow-glow-saffron">
            <Plus className="size-4" /> Add Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/50 rounded-2xl p-5 shadow-elegant relative overflow-hidden">
          <div className="absolute -top-12 -right-12 size-32 rounded-full bg-saffron/15 blur-2xl" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total Udhaar</div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-saffron tabular-nums">₹{formatINR(stats.credit)}</div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border/50 rounded-2xl p-5 shadow-elegant relative overflow-hidden">
          <div className="absolute -top-12 -right-12 size-32 rounded-full bg-cardamom/15 blur-2xl" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total Payments</div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-cardamom tabular-nums">₹{formatINR(stats.payment)}</div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex p-1 rounded-xl bg-surface-raised border border-border/50">
          {[
            { id: "all" as const, label: "All" },
            { id: "credit" as const, label: "Udhaar" },
            { id: "payment" as const, label: "Payments" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-smooth",
                filter === f.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setFilterOpen(true)}
          className="rounded-xl gap-1.5 ml-auto font-bold text-xs border-border/60"
        >
          <Filter className="size-3.5" /> Filter
        </Button>
      </div>

      <div className="bg-card border border-border/50 rounded-[32px] shadow-elegant overflow-hidden">
        {filtered.length === 0 && (
          <div className="p-20 text-center">
            <div className="size-16 rounded-2xl bg-surface-raised mx-auto flex items-center justify-center mb-4">
              <Filter className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-1">No transactions found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new entry.</p>
          </div>
        )}
        {filtered.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.4) }}
            className="group flex items-center gap-4 p-4 sm:p-5 border-b border-border/50 last:border-0 hover:bg-surface-hover/60 transition-smooth"
          >
            <div className={cn("size-11 rounded-2xl flex items-center justify-center shrink-0 border", t.type === "payment" ? "bg-cardamom/10 text-cardamom border-cardamom/20" : "bg-saffron/10 text-saffron border-saffron/20")}>
              {t.type === "payment" ? <ArrowDownRight className="size-5" /> : <ArrowUpRight className="size-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{t.customerName}</div>
              <div className="text-xs text-muted-foreground truncate font-medium">
                {t.note} · {t.date ? format(new Date(t.date), "dd MMM, hh:mm a") : "Just now"}
              </div>
            </div>
            <div className={cn("font-display font-bold tabular-nums text-right shrink-0", t.type === "payment" ? "text-cardamom" : "text-saffron")}>
              {t.type === "payment" ? "+" : "−"} ₹{formatINR(t.amount)}
            </div>
            <button onClick={() => setDeleteId(t.id)} className="opacity-0 group-hover:opacity-100 size-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-smooth" aria-label="Delete entry">
              <Trash2 className="size-4" />
            </button>
          </motion.div>
        ))}
      </div>

      <AddTransactionDialog open={addOpen} onOpenChange={setAddOpen} />
      <FilterDialog open={filterOpen} onOpenChange={setFilterOpen} onApply={(f) => console.log(f)} />

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="rounded-[32px] border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">The customer balance will be recalculated. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3">
            <AlertDialogCancel className="rounded-2xl h-11 border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-2xl h-11 bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Transactions;
