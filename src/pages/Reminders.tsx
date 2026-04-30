import { useState, useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import { formatINR } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { MessageSquare, BellRing, Phone, Send, Clock, CheckCircle2, History, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ReminderDialog } from "@/components/dialogs/ReminderDialog";

const Reminders = () => {
  const { customers, reminderLogs, manualSendReminder } = useStore();
  const needsNudge = customers.filter(c => c.status === 'overdue' || (c.status === 'pending' && c.totalDue > 5000));
  const [reminderFor, setReminderFor] = useState<any>(null);

  useEffect(() => {
    const handleAutoReminder = (e: any) => {
      const log = e.detail;
      toast.success(`Automated ${log.mode} sent to ${log.customerName}`);
    };
    window.addEventListener('auto-reminder-sent', handleAutoReminder);
    return () => window.removeEventListener('auto-reminder-sent', handleAutoReminder);
  }, []);

  const handleSendReminder = (customer: any) => {
    setReminderFor(customer);
  };

  const confirmSend = (mode: 'whatsapp' | 'email') => {
    if (reminderFor) {
      manualSendReminder(reminderFor.id, mode);
      toast.success(`${mode === 'whatsapp' ? 'WhatsApp' : 'Email'} reminder sent!`);
      setReminderFor(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight mb-1">Smart Reminders</h1>
          <p className="text-muted-foreground font-medium">Nudge customers gently — track every message.</p>
        </div>
        <Button className="bg-saffron hover:bg-saffron/90 text-white gap-2 rounded-xl h-12 px-6 shadow-glow-saffron">
          <Send className="size-4" /> Send to top 5
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card/30 border border-border/50 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Pending Customers</p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-display font-bold text-saffron">{needsNudge.length}</h3>
            <BellRing className="size-5 text-saffron/40" />
          </div>
        </div>
        <div className="bg-card/30 border border-border/50 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Sent Today</p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-display font-bold text-cardamom">5</h3>
            <Clock className="size-5 text-cardamom/40" />
          </div>
        </div>
        <div className="bg-card/30 border border-border/50 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Total Sent</p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-display font-bold text-primary">5</h3>
            <Send className="size-5 text-primary/40" />
          </div>
        </div>
        <div className="bg-card/30 border border-border/50 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Active Channels</p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-display font-bold text-foreground">2</h3>
            <MessageSquare className="size-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Needs a nudge <span className="bg-saffron/20 text-saffron text-xs px-2 py-0.5 rounded-full">{needsNudge.length}</span>
            </h2>
          </div>
          <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-elegant">
            <div className="max-h-[500px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {needsNudge.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-raised/40 border border-border/40 hover:border-saffron/30 transition-smooth">
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-2xl bg-gradient-to-br flex items-center justify-center font-display font-bold text-white shrink-0 ${c.avatarColor}`}>
                      {c.initials}
                    </div>
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-display font-semibold text-saffron text-sm">₹{formatINR(c.totalDue)}</span>
                    <Button 
                      onClick={() => handleSendReminder(c)}
                      className="bg-cardamom hover:bg-cardamom/90 text-white rounded-xl gap-2 h-10 px-4"
                    >
                      <MessageSquare className="size-4" /> Remind
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Reminder History <Clock className="size-4 text-muted-foreground" />
            </h2>
          </div>
          <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-elegant">
            <div className="max-h-[500px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {reminderLogs.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">No history yet</div>
              ) : (
                reminderLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-surface-raised/40 border border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{log.customerName}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">via {log.mode} • {log.date}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cardamom/10 text-cardamom text-[10px] font-bold">
                        <CheckCircle2 className="size-2.5" /> Delivered
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {log.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {reminderFor && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 shadow-elegant-lg rounded-3xl p-8 w-full max-w-md animate-in fade-in zoom-in-95">
            <h3 className="text-2xl font-semibold mb-2">Send Reminder</h3>
            <p className="text-muted-foreground mb-8">Send a gentle nudge to {reminderFor.name}.</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => confirmSend('whatsapp')}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-border/50 hover:border-cardamom/50 hover:bg-cardamom/5 transition-all group"
              >
                <div className="size-12 rounded-xl bg-cardamom/10 flex items-center justify-center text-cardamom group-hover:scale-110 transition-transform">
                  <MessageSquare className="size-6" />
                </div>
                <span className="font-medium text-sm">WhatsApp</span>
              </button>
              <button 
                onClick={() => confirmSend('email')}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-border/50 hover:border-saffron/50 hover:bg-saffron/5 transition-all group"
              >
                <div className="size-12 rounded-xl bg-saffron/10 flex items-center justify-center text-saffron group-hover:scale-110 transition-transform">
                  <Send className="size-6" />
                </div>
                <span className="font-medium text-sm">Email</span>
              </button>
            </div>
            <Button onClick={() => setReminderFor(null)} variant="ghost" className="w-full mt-6 rounded-xl h-12">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;
