import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { User, Phone, MapPin, Check } from "lucide-react";

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCustomerDialog({ open, onOpenChange }: AddCustomerDialogProps) {
  const { addCustomer } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = [
    "from-cardamom to-cardamom/60",
    "from-saffron to-turmeric",
    "from-turmeric to-saffron",
    "from-destructive to-saffron",
    "from-saffron to-destructive",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Please enter name and phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      const avatarColor = colors[Math.floor(Math.random() * colors.length)];
      const due = parseFloat(openingBalance) || 0;

      await addCustomer({
        name,
        phone: phone.startsWith("+91") ? phone : `+91 ${phone}`,
        address,
        initials,
        totalDue: due,
        lastTransaction: due > 0 ? "Opening balance" : "Just now",
        status: due > 0 ? "pending" : "paid",
        avatarColor,
      });

      toast.success("Customer added successfully!");
      onOpenChange(false);
      setName("");
      setPhone("");
      setAddress("");
      setOpeningBalance("");
    } catch (error) {
      toast.error("Failed to add customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/50 p-6 rounded-[32px]">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-semibold">Add New Customer</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Create a new khata profile for your customer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Customer Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User className="size-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-raised border-border/50 border rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth font-medium"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Phone Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Phone className="size-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface-raised border-border/50 border rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth font-medium"
                  placeholder="98765 43210"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Address (optional)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <MapPin className="size-4" />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-surface-raised border-border/50 border rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth font-medium"
                  placeholder="e.g. Karol Bagh, Delhi"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Opening Balance (₹)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-display font-bold">
                  ₹
                </div>
                <input
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full bg-surface-raised border-border/50 border rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth font-medium tabular-nums"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
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
              className="flex-1 rounded-2xl h-12 bg-saffron hover:bg-saffron/90 text-white font-semibold shadow-glow-saffron"
            >
              {isSubmitting ? "Adding..." : "Add Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
