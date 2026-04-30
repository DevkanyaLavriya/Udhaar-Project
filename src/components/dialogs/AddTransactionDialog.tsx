import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { ArrowUpRight, ArrowDownLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const { customers, addTransaction } = useStore();
  const [type, setType] = useState<"credit" | "payment">("credit");
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !amount) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    const selectedCustomer = customers.find(c => c.id === customerId);
    
    try {
      await addTransaction({
        customerId,
        customerName: selectedCustomer?.name || "",
        type,
        amount: Number(amount),
        note,
        date: "Today",
        timeAgo: "Just now"
      });

      toast.success("Transaction recorded successfully!");
      onOpenChange(false);
      setAmount("");
      setNote("");
    } catch (error) {
      toast.error("Failed to record transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/50 p-6 rounded-3xl">
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">New khata entry</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground mt-1 text-base">
            Pick a type, enter the amount, done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex p-1 bg-surface-raised rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setType("credit")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-medium text-sm",
                type === "credit" 
                  ? "bg-card text-saffron shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowUpRight className="size-4" /> Udhaar
            </button>
            <button
              type="button"
              onClick={() => setType("payment")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-medium text-sm",
                type === "payment" 
                  ? "bg-card text-cardamom shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowDownLeft className="size-4" /> Payment
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-surface-raised border-border/50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth"
                required
              >
                <option value="" disabled>Select customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-raised border-border/50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth"
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-surface-raised border-border/50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth"
                placeholder="What was it for?"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-2xl h-12"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={cn(
                "flex-1 rounded-2xl h-12 text-white font-semibold shadow-glow-saffron transition-all",
                type === "credit" ? "bg-saffron hover:bg-saffron/90" : "bg-cardamom hover:bg-cardamom/90 shadow-glow-cardamom"
              )}
            >
              {isSubmitting ? "Processing..." : type === "credit" ? "Add udhaar" : "Record payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
