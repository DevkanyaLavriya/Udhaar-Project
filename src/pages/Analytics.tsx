import { useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { formatINR } from "@/lib/mock-data";
import { CollectionChart } from "@/components/CollectionChart";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Activity, Users, 
  Wallet, BarChart3, PieChart, LineChart,
  ArrowUpRight, ArrowDownRight, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

const Analytics = () => {
  const { customers, transactions } = useStore();

  const stats = useMemo(() => {
    const totalUdhaar = customers.reduce((s, c) => s + c.totalDue, 0);
    const totalRecovered = transactions.filter(t => t.type === 'payment').reduce((s, t) => s + t.amount, 0);
    const overdueCount = customers.filter(c => c.status === 'overdue').length;
    const recoveryRate = totalUdhaar > 0 ? Math.round((totalRecovered / (totalUdhaar + totalRecovered)) * 100) : 0;

    return { totalUdhaar, totalRecovered, overdueCount, recoveryRate };
  }, [customers, transactions]);

  const topDebtors = useMemo(() => {
    return [...customers]
      .filter(c => c.totalDue > 0)
      .sort((a, b) => b.totalDue - a.totalDue)
      .slice(0, 5);
  }, [customers]);

  const weeklyCollection = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toDateString(),
        day: days[d.getDay()],
        credit: 0,
        payment: 0,
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

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-1 font-medium">Smart trends across your khata.</p>
        </div>
        <div className="flex p-1 bg-surface-raised/50 rounded-xl gap-1 self-start sm:self-auto">
          <button className="px-3 py-1.5 text-xs font-bold rounded-lg text-muted-foreground hover:text-foreground">7D</button>
          <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-card text-foreground shadow-sm">30D</button>
          <button className="px-3 py-1.5 text-xs font-bold rounded-lg text-muted-foreground hover:text-foreground">90D</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats Cards */}
        <div className="bg-card/40 border border-border/50 rounded-[24px] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Outstanding</span>
            <Wallet className="size-4" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-saffron">₹{formatINR(stats.totalUdhaar)}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold">{customers.length} customers</p>
          </div>
        </div>

        <div className="bg-card/40 border border-border/50 rounded-[24px] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Collected (lifetime)</span>
            <TrendingUp className="size-4" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-cardamom">₹{formatINR(stats.totalRecovered)}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold">All payments received</p>
          </div>
        </div>

        <div className="bg-card/40 border border-border/50 rounded-[24px] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Collection Rate</span>
            <Activity className="size-4" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-turmeric">{stats.recoveryRate}%</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold">Payments + Credit</p>
          </div>
        </div>

        <div className="bg-card/40 border border-border/50 rounded-[24px] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Active Khatas</span>
            <Users className="size-4" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display font-bold">{customers.length}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold">{stats.overdueCount} overdue</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit vs Payment Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card/40 border border-border/50 rounded-[32px] p-6 shadow-elegant"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold">Credit vs Payment</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Last 30 days</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-saffron" /> Udhaar</div>
              <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-cardamom" /> Payment</div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <CollectionChart data={weeklyCollection} />
          </div>
        </motion.div>

        {/* Customer Status Doughnut */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/40 border border-border/50 rounded-[32px] p-6 shadow-elegant flex flex-col"
        >
          <h3 className="text-lg font-semibold">Customer Status</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-8">Khata health breakdown</p>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative size-48">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-surface-raised" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-cardamom" strokeWidth="3.5" strokeDasharray="100" strokeDashoffset="65" strokeLinecap="round" />
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-saffron" strokeWidth="3.5" strokeDasharray="100" strokeDashoffset="85" strokeLinecap="round" />
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-destructive" strokeWidth="3.5" strokeDasharray="100" strokeDashoffset="95" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-display font-bold">10</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-8 w-full">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="size-2 rounded-full bg-cardamom" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cleared</span>
                </div>
                <div className="text-sm font-semibold">3</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="size-2 rounded-full bg-saffron" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pending</span>
                </div>
                <div className="text-sm font-semibold">4</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="size-2 rounded-full bg-destructive" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Overdue</span>
                </div>
                <div className="text-sm font-semibold">3</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card/40 border border-border/50 rounded-[32px] p-6 shadow-elegant"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold">Monthly Trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
            </div>
            <div className="size-10 rounded-xl bg-surface-raised flex items-center justify-center text-muted-foreground">
              <LineChart className="size-5" />
            </div>
          </div>
          <div className="h-[200px] w-full flex items-end gap-2 px-2">
            {[40, 65, 45, 90, 55, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-gradient-to-t from-saffron/20 to-saffron/5 rounded-t-lg transition-all group-hover:from-saffron/40" style={{ height: `${h}%` }} />
                <span className="text-[10px] font-bold text-muted-foreground">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Debtors */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/40 border border-border/50 rounded-[32px] p-6 shadow-elegant"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Top Debtors</h3>
            <AlertTriangle className="size-4 text-saffron" />
          </div>
          <div className="space-y-1">
            {topDebtors.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-hover/50 transition-smooth">
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-bold text-muted-foreground size-5 flex items-center justify-center bg-surface-raised rounded-full">{i + 1}</div>
                  <div className={cn("size-8 rounded-full flex items-center justify-center font-display font-bold text-[10px] text-white", c.avatarColor)}>{c.initials}</div>
                  <div>
                    <div className="text-sm font-semibold">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground font-medium">{c.lastTransaction}</div>
                  </div>
                </div>
                <div className="text-sm font-display font-bold text-saffron">₹{formatINR(c.totalDue)}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
