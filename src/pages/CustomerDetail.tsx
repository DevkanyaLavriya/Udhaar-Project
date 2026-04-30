import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, MessageCircle, Plus, Check, ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatINR } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { useStore } from "@/lib/store";
import { AddTransactionDialog } from "@/components/dialogs/AddTransactionDialog";
import { ReminderDialog } from "@/components/dialogs/ReminderDialog";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const CustomerDetail = () => {
  const { id } = useParams();
  const { customers, transactions, addTransaction, markCustomerAsPaid, deleteTransaction } = useStore();
  const customer = customers.find((c) => c.id === id);
  const txns = useMemo(() => transactions.filter((t) => t.customerId === id), [transactions, id]);

  const [txnOpen, setTxnOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [defaultType, setDefaultType] = useState<"credit" | "payment">("credit");
  const [quickAmount, setQuickAmount] = useState("");
  const [quickNote, setQuickNote] = useState("");
  const [deleteTxnId, setDeleteTxnId] = useState<string | null>(null);

  const totals = useMemo(() => {
    const credit = txns.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
    const paid = txns.filter((t) => t.type === "payment").reduce((s, t) => s + t.amount, 0);
    return { credit, paid };
  }, [txns]);

  const trendData = useMemo(() => {
    // Build a running balance from oldest to newest, fall back to flat if no txns
    const sorted = [...txns].sort((a, b) => new Date((a as any).isoDate ?? 0).getTime() - new Date((b as any).isoDate ?? 0).getTime());
    if (sorted.length === 0) {
      return Array.from({ length: 7 }, (_, i) => ({ label: `D${i + 1}`, dues: 0 }));
    }
    let running = 0;
    return sorted.map((t, i) => {
      running += t.type === "credit" ? t.amount : -t.amount;
      return { label: `T${i + 1}`, dues: Math.max(0, running) };
    });
  }, [txns]);

  if (!customer) {
    return (
      <div className="p-10 text-center">
        <h1 className="font-display text-2xl mb-2">Customer not found</h1>
        <Link to="/customers" className="text-saffron hover:underline">← Back to customers</Link>
      </div>
    );
  }

  const submitQuick = (type: "credit" | "payment") => {
    const amt = Number(quickAmount.replace(/[^0-9.]/g, ""));
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    addTransaction({ customerId: customer.id, type, amount: amt, note: quickNote });
    toast.success(type === "credit" ? `₹${formatINR(amt)} udhaar added` : `₹${formatINR(amt)} payment recorded`);
    setQuickAmount("");
    setQuickNote("");
  };

  const handleMarkPaid = () => {
    if (customer.totalDue <= 0) { toast("Already settled — nothing to mark."); return; }
    markCustomerAsPaid(customer.id);
    toast.success(`${customer.name} marked as paid`);
  };

  const confirmDeleteTxn = () => {
    if (!deleteTxnId) return;
    deleteTransaction(deleteTxnId);
    toast.success("Entry removed");
    setDeleteTxnId(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-6">
      <Link to="/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
        <ArrowLeft className="size-4" /> Back to customers
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-hero border border-border/50">
        <div className="absolute -top-24 -right-24 size-64 rounded-full bg-saffron/15 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className={cn("size-20 sm:size-24 rounded-3xl bg-gradient-to-br flex items-center justify-center font-display font-bold text-white text-3xl shrink-0 shadow-elegant-lg", customer.avatarColor)}>
            {customer.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">{customer.name}</h1>
              <StatusBadge status={customer.status} />
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 hover:text-foreground"><Phone className="size-3.5" /> {customer.phone}</a>
              <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {customer.address}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleMarkPaid} className="bg-cardamom hover:bg-cardamom/90 text-cardamom-foreground rounded-xl gap-2">
              <Check className="size-4" /> Mark as Paid
            </Button>
            <Button onClick={() => setReminderOpen(true)} variant="outline" className="rounded-xl gap-2">
              <MessageCircle className="size-4" /> Remind
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Due", value: `₹${formatINR(customer.totalDue)}`, color: "text-saffron" },
          { label: "Total Credit", value: `₹${formatINR(totals.credit)}`, color: "text-foreground" },
          { label: "Total Paid", value: `₹${formatINR(totals.paid)}`, color: "text-cardamom" },
          { label: "Transactions", value: String(txns.length), color: "text-foreground" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-elegant">
            <div className="text-xs text-muted-foreground mb-2">{s.label}</div>
            <div className={cn("font-display text-xl sm:text-2xl font-semibold tabular-nums", s.color)}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-5 sm:p-6 shadow-elegant">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Balance Trend</h2>
            <span className="text-xs text-muted-foreground">Running due over time</span>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} formatter={(v: number) => `₹${formatINR(v)}`} />
                <Line type="monotone" dataKey="dues" stroke="hsl(var(--saffron))" strokeWidth={2.5} dot={{ fill: "hsl(var(--saffron))", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 sm:p-6 shadow-elegant">
          <h2 className="font-display text-lg font-semibold mb-4">Quick Add</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Amount</label>
              <input value={quickAmount} onChange={(e) => setQuickAmount(e.target.value)} inputMode="decimal" type="text" placeholder="₹ 0" className="w-full h-11 px-4 rounded-xl bg-surface-raised border border-border focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Note</label>
              <input value={quickNote} onChange={(e) => setQuickNote(e.target.value)} type="text" placeholder="What was it for?" className="w-full h-11 px-4 rounded-xl bg-surface-raised border border-border focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button onClick={() => submitQuick("credit")} className="bg-saffron hover:bg-saffron/90 text-white rounded-xl gap-1.5"><ArrowUpRight className="size-4" />Udhaar</Button>
              <Button onClick={() => submitQuick("payment")} className="bg-cardamom hover:bg-cardamom/90 text-cardamom-foreground rounded-xl gap-1.5"><ArrowDownRight className="size-4" />Payment</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-5 sm:p-6 shadow-elegant">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg sm:text-xl font-semibold">Transaction Timeline</h2>
          <Button onClick={() => { setDefaultType("credit"); setTxnOpen(true); }} variant="outline" size="sm" className="rounded-xl gap-1.5"><Plus className="size-3.5" /> Entry</Button>
        </div>
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
          {txns.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">No transactions yet — add the first entry above.</div>}
          {txns.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative pb-6 last:pb-0 group">
              <div className={cn("absolute -left-6 top-1 size-6 rounded-full flex items-center justify-center border-2 border-background", t.type === "payment" ? "bg-cardamom text-cardamom-foreground" : "bg-saffron text-white")}>
                {t.type === "payment" ? <ArrowDownRight className="size-3" /> : <ArrowUpRight className="size-3" />}
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-sm">{t.note}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.date} · {t.timeAgo}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className={cn("font-display font-semibold tabular-nums", t.type === "payment" ? "text-cardamom" : "text-saffron")}>
                    {t.type === "payment" ? "+" : "−"} ₹{formatINR(t.amount)}
                  </div>
                  <button onClick={() => setDeleteTxnId(t.id)} className="opacity-0 group-hover:opacity-100 size-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-smooth" aria-label="Delete entry">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AddTransactionDialog open={txnOpen} onOpenChange={setTxnOpen} defaultCustomerId={customer.id} defaultType={defaultType} />
      <ReminderDialog open={reminderOpen} onOpenChange={setReminderOpen} customer={customer} />

      <AlertDialog open={!!deleteTxnId} onOpenChange={(v) => !v && setDeleteTxnId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>The balance will be recalculated. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTxn} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerDetail;
