import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { MessageSquare, Mail, Send, CheckCircle2 } from "lucide-react";
import type { Customer } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export function ReminderDialog({ open, onOpenChange, customer }: ReminderDialogProps) {
  const { manualSendReminder, reminderSettings, session } = useStore();
  const [mode, setMode] = useState<'whatsapp' | 'email'>('whatsapp');
  const [isSending, setIsSending] = useState(false);

  if (!customer) return null;

  const handleSend = async () => {
    setIsSending(true);
    try {
      await manualSendReminder(customer.id, mode);
      
      // Simulate real WhatsApp redirect if mode is whatsapp
      if (mode === 'whatsapp') {
        const msg = reminderSettings.whatsappTemplate
          .replace(/{Name}/g, customer.name)
          .replace(/{Amount}/g, customer.totalDue.toString())
          .replace(/{ShopName}/g, session?.shopName || "Our Shop");
        
        const encodedMsg = encodeURIComponent(msg);
        const cleanPhone = customer.phone.replace(/\D/g, "");
        window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, '_blank');
      }

      toast.success(`Reminder sent to ${customer.name} via ${mode === 'whatsapp' ? 'WhatsApp' : 'Email'}`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to send reminder");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/50 p-6 rounded-[32px]">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-semibold">Send Reminder</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Nudge {customer.name} to clear their pending dues.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-surface-raised/50 border border-border/40 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Due</p>
              <p className="text-xl font-display font-bold text-saffron mt-0.5">₹{customer.totalDue.toLocaleString('en-IN')}</p>
            </div>
            <div className={cn("size-10 rounded-xl flex items-center justify-center font-display font-bold text-white", customer.avatarColor)}>
              {customer.initials}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Choose Channel</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('whatsapp')}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-smooth",
                  mode === 'whatsapp' 
                    ? "bg-cardamom/5 border-cardamom text-cardamom shadow-glow-cardamom" 
                    : "bg-surface-raised/40 border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                <div className={cn("size-10 rounded-full flex items-center justify-center", mode === 'whatsapp' ? "bg-cardamom text-white" : "bg-surface-raised")}>
                  <MessageSquare className="size-5" />
                </div>
                <span className="text-sm font-semibold">WhatsApp</span>
              </button>

              <button
                onClick={() => setMode('email')}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-smooth",
                  mode === 'email' 
                    ? "bg-saffron/5 border-saffron text-saffron shadow-glow-saffron" 
                    : "bg-surface-raised/40 border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                <div className={cn("size-10 rounded-full flex items-center justify-center", mode === 'email' ? "bg-saffron text-white" : "bg-surface-raised")}>
                  <Mail className="size-5" />
                </div>
                <span className="text-sm font-semibold">Email</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-raised/30 rounded-2xl p-4 border border-border/40">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Message Preview</p>
            <p className="text-sm text-foreground/80 leading-relaxed italic">
              "Hi {customer.name}, aapka ₹{customer.totalDue} pending hai. Kripya jaldi payment karein. - {session?.shopName || "Our Shop"}"
            </p>
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
              onClick={handleSend}
              disabled={isSending || customer.totalDue <= 0}
              className="flex-1 rounded-2xl h-12 bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-elegant"
            >
              {isSending ? "Sending..." : (
                <span className="flex items-center gap-2">
                  <Send className="size-4" /> Send Now
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
