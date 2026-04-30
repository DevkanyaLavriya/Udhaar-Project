import { useState } from "react";
import { useStore, ReminderSettings } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Bot, MessageSquare, Mail } from "lucide-react";
import { TemplateEditor } from "./TemplateEditor";

export function ReminderSettingsPanel() {
  const { reminderSettings, updateReminderSettings } = useStore();
  const [localSettings, setLocalSettings] = useState<ReminderSettings>(reminderSettings);

  const handleSave = () => {
    const hasVars = (t: string) => t.includes("{Name}") || t.includes("{Amount}");
    if (!hasVars(localSettings.whatsappTemplate) || !hasVars(localSettings.emailTemplate)) {
      toast.error("Templates must contain {Name} or {Amount}");
      return;
    }
    
    updateReminderSettings(localSettings);
    toast.success("Reminder Settings Saved", { description: "Automated simulator rules updated." });
  };

  const variables = ["Name", "Amount", "DueDate", "ShopName"];

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border/50">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Bot className="size-5 text-saffron" /> Auto-Simulator
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Configure when the background simulator sends messages.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={localSettings.autoEnabled}
              onChange={(e) => setLocalSettings({...localSettings, autoEnabled: e.target.checked})}
            />
            <div className="w-11 h-6 bg-surface-raised rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-saffron shadow-glow-saffron"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold mb-2 block">Start After (Days)</label>
            <input 
              type="number" 
              value={localSettings.startAfterDays}
              onChange={(e) => setLocalSettings({...localSettings, startAfterDays: Number(e.target.value)})}
              className="w-full h-11 px-4 bg-surface-raised rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth"
            />
            <p className="text-xs text-muted-foreground mt-1">Days since last transaction</p>
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Frequency (Days)</label>
            <input 
              type="number" 
              value={localSettings.frequencyDays}
              onChange={(e) => setLocalSettings({...localSettings, frequencyDays: Number(e.target.value)})}
              className="w-full h-11 px-4 bg-surface-raised rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth"
            />
            <p className="text-xs text-muted-foreground mt-1">How often to repeat reminder</p>
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Customer Target</label>
            <select 
              value={localSettings.customerFilter}
              onChange={(e) => setLocalSettings({...localSettings, customerFilter: e.target.value as any})}
              className="w-full h-11 px-4 bg-surface-raised rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth"
            >
              <option value="all">All Pending Customers</option>
              <option value="high_due">High Due (₹5000+)</option>
              <option value="overdue">Overdue Status Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
            <MessageSquare className="size-5 text-[#25D366]" /> WhatsApp Template
          </h2>
          <TemplateEditor 
            label="Message Body"
            value={localSettings.whatsappTemplate}
            onChange={(val) => setLocalSettings({...localSettings, whatsappTemplate: val})}
            variables={variables}
          />
        </div>

        <div className="border-t border-border/50 pt-8">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
            <Mail className="size-5 text-blue-500" /> Email Template
          </h2>
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Subject Line</label>
            <input 
              type="text" 
              value={localSettings.emailSubject}
              onChange={(e) => setLocalSettings({...localSettings, emailSubject: e.target.value})}
              className="w-full h-11 px-4 bg-surface-raised rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth"
            />
          </div>
          <TemplateEditor 
            label="Email Body"
            value={localSettings.emailTemplate}
            onChange={(val) => setLocalSettings({...localSettings, emailTemplate: val})}
            variables={variables}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow-saffron rounded-xl gap-2 w-full sm:w-auto px-8">
          <Save className="size-4" /> Save Master Settings
        </Button>
      </div>
    </div>
  );
}
