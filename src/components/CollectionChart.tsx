import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { weeklyData } from "@/lib/mock-data";

interface CollectionChartProps {
  data: any[];
}

export function CollectionChart({ data }: CollectionChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="creditFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--saffron))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--saffron))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="paymentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--cardamom))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--cardamom))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
              boxShadow: "var(--shadow-md)",
            }}
            formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
          />
          <Area type="monotone" dataKey="credit" stroke="hsl(var(--saffron))" strokeWidth={2.5} fill="url(#creditFill)" />
          <Area type="monotone" dataKey="payment" stroke="hsl(var(--cardamom))" strokeWidth={2.5} fill="url(#paymentFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
