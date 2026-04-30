import { useMemo, useState } from "react";
import { Users, Wallet, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Plus, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { CollectionChart } from "@/components/CollectionChart";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/mock-data";
import { useStore } from "@/hooks/useStore";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AddCustomerDialog } from "@/components/dialogs/AddCustomerDialog";
import { AddTransactionDialog } from "@/components/dialogs/AddTransactionDialog";
import { ReminderDialog } from "@/components/dialogs/ReminderDialog";
import type { Customer } from "@/lib/mock-data";

const Dashboard = () => {
  const { customers, transactions, session } = useStore();
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addTxnOpen, setAddTxnOpen] = useState(false);
  const [reminderFor, setReminderFor] = useState<Customer | null>(null);

  const stats = useMemo(() => {
    const totalUdhaar = customers.reduce((s, c) => s + c.totalDue, 0);
    const pendingCount = customers.filter((c) => c.status !== "paid").length;
    const overdueAmount = customers.filter((c) => c.status === "overdue").reduce((s, c) => s + c.totalDue, 0);
    const today = new Date().toDateString();
    const todayCollection = transactions
      .filter((t) => t.type === "payment" && (t as any).isoDate && new Date((t as any).isoDate).toDateString() === today)
      .reduce((s, t) => s + t.amount, 0);
    return { totalUdhaar, pendingCount, overdueAmount, todayCollection };
  }, [customers, transactions]);

  const weeklyCollection = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toDateString(),
        day: days[d.getDay()],
        credit: 0,
        payment: 0
      };
    });

    transactions.forEach(t => {
      const tDate = new Date(t.date).toDateString();
      const dayData = last7Days.find(d => d.date === tDate);
      if (dayData) {
        if (t.type === "credit") dayData.credit += t.amount;
        else if (t.type === "payment") dayData.payment += t.amount;
      }
    });

    return last7Days;
  }, [transactions]);

  const recent = transactions.slice(0, 5);
  const priority = [...customers].filter((c) => c.status !== "paid").sort((a, b) => b.totalDue - a.totalDue).slice(0, 4);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const dateLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-hero border border-border/50"
      >
        <div className="absolute -top-24 -right-24 size-64 rounded-full bg-saffron/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-cardamom/15 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{dateLabel}</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
              {greeting}, <span className="text-gradient-primary">{session?.shopName || "Our Shop"}</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Your khata is pulsing — <span className="font-semibold text-foreground">{stats.pendingCount} customer{stats.pendingCount === 1 ? "" : "s"}</span> need attention today.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setAddTxnOpen(true)} className="bg-white text-black hover:bg-white/90 rounded-xl gap-2 shadow-elegant border-none">
              <Plus className="size-4" /> Add Entry
            </Button>
            <Button onClick={() => setAddCustomerOpen(true)} className="bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] rounded-xl gap-2 border-none">
              <Users className="size-4" /> Add Customer
            </Button>
          </div>
        </div>
      </motion.section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Active Customers" value={String(customers.length)} delta={`${customers.filter((c) => c.status !== "paid").length} with dues`} deltaTone="neutral" icon={Users} index={0} />
        <StatCard label="Total Udhaar" value={`₹${formatINR(stats.totalUdhaar)}`} delta={`Across ${customers.filter((c) => c.totalDue > 0).length} accounts`} glow="saffron" icon={Wallet} index={1} />
        <StatCard label="Overdue" value={`₹${formatINR(stats.overdueAmount)}`} delta={`${customers.filter((c) => c.status === "overdue").length} customers`} glow="turmeric" icon={AlertTriangle} index={2} />
        <StatCard label="Today's Collection" value={`₹${formatINR(stats.todayCollection)}`} delta={stats.todayCollection > 0 ? "Live · keep going" : "Record your first today"} glow="cardamom" icon={TrendingUp} index={3} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-5 sm:p-6 shadow-elegant"
        >
          <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-semibold">Collection Velocity</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Credit vs Payment · last 7 days</p>
            </div>
          </div>
          <div className="flex gap-4 mb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-saffron shadow-glow-saffron" />
              <span className="text-muted-foreground">Udhaar (Credit)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-cardamom shadow-glow-cardamom" />
              <span className="text-muted-foreground">Payment</span>
            </div>
          </div>
          <CollectionChart data={weeklyCollection} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border/50 rounded-2xl p-5 sm:p-6 shadow-elegant"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg sm:text-xl font-semibold">Live Ledger</h2>
            <Link to="/transactions" className="text-xs font-semibold text-saffron hover:underline">View All →</Link>
          </div>
          <div className="space-y-1">
            {recent.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">No entries yet — add your first.</div>}
            {recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-xl hover:bg-surface-hover/60 transition-smooth">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("size-9 rounded-full flex items-center justify-center shrink-0 border", t.type === "payment" ? "bg-cardamom/10 text-cardamom border-cardamom/20" : "bg-saffron/10 text-saffron border-saffron/20")}>
                    {t.type === "payment" ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{t.customerName}</div>
                    <div className="text-xs text-muted-foreground truncate">{t.timeAgo}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={cn("font-display font-semibold tabular-nums text-sm", t.type === "payment" ? "text-cardamom" : "text-saffron")}>
                    {t.type === "payment" ? "+" : "−"} ₹{formatINR(t.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-5 sm:p-6 shadow-elegant"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-semibold">Priority Collections</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Customers with the highest dues</p>
            </div>
            <Link to="/customers" className="text-xs font-semibold text-saffron hover:underline">All customers →</Link>
          </div>
          {priority.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">All caught up — no pending dues. 🎉</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {priority.map((c) => (
                <div key={c.id} className="group flex items-center gap-4 p-4 rounded-xl bg-surface-raised/40 border border-border/50 hover:border-saffron/40 hover:bg-surface-raised transition-smooth">
                  <Link to={`/customers/${c.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={cn("size-12 rounded-2xl bg-gradient-to-br flex items-center justify-center font-display font-bold text-white shrink-0", c.avatarColor)}>
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate mb-1">{c.name}</div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={c.status} />
                        <span className="text-xs text-muted-foreground">{c.lastTransaction}</span>
                      </div>
                    </div>
                  </Link>
                  <div className="text-right shrink-0">
                    <div className="font-display font-semibold tabular-nums text-saffron">₹{formatINR(c.totalDue)}</div>
                    <button onClick={() => setReminderFor(c)} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-1">
                      <MessageCircle className="size-3" /> Remind
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border/50 rounded-2xl p-5 sm:p-6 shadow-elegant flex flex-col"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg sm:text-xl font-semibold">Reminder Engine</h2>
            <Link to="/reminders" className="text-xs font-semibold text-saffron hover:underline">Settings →</Link>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-saffron/5 border border-saffron/20">
              <span className="text-sm font-medium text-muted-foreground">Auto-Sent</span>
              <span className="font-display font-semibold text-saffron">
                {/* Need to import useStore at the top if reminderLogs not destructured */}
                {typeof useStore !== 'undefined' ? useStore().reminderLogs.filter(l => l.status === 'sent').length : 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-cardamom/5 border border-cardamom/20">
              <span className="text-sm font-medium text-muted-foreground">Pending Action</span>
              <span className="font-display font-semibold text-cardamom">
                {typeof useStore !== 'undefined' ? useStore().customers.filter(c => c.status === 'overdue' || (c.status === 'pending' && c.totalDue > 5000)).length : 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/20">
              <span className="text-sm font-medium text-muted-foreground">Failed Delivery</span>
              <span className="font-display font-semibold text-destructive">
                {typeof useStore !== 'undefined' ? useStore().reminderLogs.filter(l => l.status === 'failed').length : 0}
              </span>
            </div>
          </div>
        </motion.section>
      </div>

      <AddCustomerDialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen} />
      <AddTransactionDialog open={addTxnOpen} onOpenChange={setAddTxnOpen} />
      <ReminderDialog open={!!reminderFor} onOpenChange={(v) => !v && setReminderFor(null)} customer={reminderFor} />
    </div>
  );
};

export default Dashboard;
