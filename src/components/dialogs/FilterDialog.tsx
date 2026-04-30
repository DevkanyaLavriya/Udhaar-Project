import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, User, Hash } from "lucide-react";
import { useState } from "react";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (filters: any) => void;
}

export function FilterDialog({ open, onOpenChange, onApply }: FilterDialogProps) {
  const [amountRange, setAmountRange] = useState("all");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border/50 p-6 rounded-[32px]">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-semibold">Advanced Filters</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Narrow down your transaction history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Amount Range</label>
            <div className="grid grid-cols-2 gap-2">
              {["all", "0-1000", "1000-5000", "5000+"].map((range) => (
                <button
                  key={range}
                  onClick={() => setAmountRange(range)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-smooth ${
                    amountRange === range 
                      ? "bg-saffron/5 border-saffron text-saffron" 
                      : "bg-surface-raised/40 border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {range === "all" ? "Any Amount" : range}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Sort By</label>
            <div className="flex p-1 bg-surface-raised/50 rounded-xl gap-1">
              <button className="flex-1 py-2 bg-card rounded-lg text-xs font-bold shadow-sm">Newest First</button>
              <button className="flex-1 py-2 text-xs font-bold text-muted-foreground">Highest Amount</button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-2xl h-12"
            >
              Reset
            </Button>
            <Button 
              onClick={() => { onApply({ amountRange }); onOpenChange(false); }}
              className="flex-1 rounded-2xl h-12 bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-elegant"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
