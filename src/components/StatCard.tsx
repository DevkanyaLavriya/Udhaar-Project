import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  glow?: "saffron" | "turmeric" | "cardamom" | "none";
  index?: number;
}

const glowMap = {
  saffron: "from-saffron/20",
  turmeric: "from-turmeric/20",
  cardamom: "from-cardamom/20",
  none: "from-transparent",
};

const valueColor = {
  saffron: "text-saffron",
  turmeric: "text-turmeric",
  cardamom: "text-cardamom",
  none: "text-foreground",
};

export function StatCard({ label, value, delta, deltaTone = "neutral", icon: Icon, glow = "none", index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] }}
      className="group relative overflow-hidden bg-card border border-border/50 rounded-2xl p-5 hover:bg-surface-hover/50 transition-smooth shadow-elegant"
    >
      <div
        className={cn(
          "absolute -top-12 -right-12 size-40 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-smooth bg-gradient-to-br to-transparent",
          glowMap[glow]
        )}
      />
      <div className="relative flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <div className="size-9 rounded-xl bg-surface-raised border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-smooth">
            <Icon className="size-[16px]" />
          </div>
        )}
      </div>
      <div className="relative">
        <div className={cn("font-display text-3xl font-semibold tabular-nums tracking-tight", valueColor[glow])}>
          {value}
        </div>
        {delta && (
          <div
            className={cn(
              "text-xs mt-1.5 font-medium",
              deltaTone === "positive" && "text-cardamom",
              deltaTone === "negative" && "text-destructive",
              deltaTone === "neutral" && "text-muted-foreground"
            )}
          >
            {delta}
          </div>
        )}
      </div>
    </motion.div>
  );
}
