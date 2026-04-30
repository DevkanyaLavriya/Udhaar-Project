import { useState, useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import { 
  LogOut, Store, Bell, Moon, Download, Shield, 
  User, Phone, MapPin, Building2, Save, Trash2,
  Smartphone, MessageSquare, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

const Settings = () => {
  const { session, logout, reminderSettings, updateReminderSettings, updateProfile } = useStore();
  const [shopName, setShopName] = useState(session?.shopName || "Udhaar Shop");
  const [phone, setPhone] = useState(session?.phone || "");
  const [address, setAddress] = useState("Sadar Bazaar, Delhi");
  const [gstin, setGstin] = useState("22AAAAA0000A1Z5");
  const [localSettings, setLocalSettings] = useState(reminderSettings);

  // Sync state with session when session loads
  useEffect(() => {
    if (session) {
      setShopName(session.shopName);
      setPhone(session.phone);
    }
  }, [session]);

  const handleSaveProfile = async () => {
    await updateProfile(shopName, phone);
    toast.success("Profile updated successfully");
  };

  const handleSavePreferences = async () => {
    await updateReminderSettings(localSettings);
    toast.success("Notification preferences saved");
  };

  const handleResetData = () => {
    toast.warning("This would reset all your data to defaults.");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight mb-1">Settings</h1>
        <p className="text-muted-foreground font-medium">Manage your shop, theme, and notifications.</p>
      </div>

      <div className="grid gap-8">
        {/* Shop Profile */}
        <section className="bg-card/40 border border-border/50 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-3 text-saffron">
            <div className="size-10 rounded-xl bg-saffron/10 flex items-center justify-center">
              <Store className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Shop Profile</h2>
              <p className="text-sm text-muted-foreground">Shown to customers in reminders.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Shop name</label>
              <div className="relative">
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-surface-raised/50 border-border/50 border rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Owner phone</label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface-raised/50 border-border/50 border rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Address</label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-surface-raised/50 border-border/50 border rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">GSTIN (optional)</label>
            <div className="relative">
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full bg-surface-raised/50 border-border/50 border rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} className="bg-saffron hover:bg-saffron/90 text-white gap-2 rounded-xl h-11 px-6 shadow-glow-saffron">
              <Save className="size-4" /> Save profile
            </Button>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-card/40 border border-border/50 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-3 text-turmeric">
            <div className="size-10 rounded-xl bg-turmeric/10 flex items-center justify-center">
              <Moon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground">Pick a theme that suits your shop.</p>
            </div>
          </div>

          <div className="flex p-1 bg-surface-raised/50 rounded-2xl gap-1 max-w-sm">
            <button className="flex-1 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground">Light</button>
            <button className="flex-1 py-2.5 bg-card rounded-xl text-sm font-medium shadow-sm">Dark</button>
            <button className="flex-1 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground">System</button>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-card/40 border border-border/50 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-3 text-cardamom">
            <div className="size-10 rounded-xl bg-cardamom/10 flex items-center justify-center">
              <Bell className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">How and when we ping you.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Push notifications</p>
                <p className="text-sm text-muted-foreground">New entries and replies, in-app</p>
              </div>
              <button 
                onClick={() => setLocalSettings({...localSettings, viaEmail: !localSettings.viaEmail})}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-smooth",
                  localSettings.viaEmail ? "bg-cardamom shadow-glow-cardamom" : "bg-surface-raised"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 rounded-full bg-white transition-smooth transform",
                  localSettings.viaEmail ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">WhatsApp reminders</p>
                <p className="text-sm text-muted-foreground">Send via WhatsApp by default</p>
              </div>
              <button 
                onClick={() => setLocalSettings({...localSettings, viaWhatsApp: !localSettings.viaWhatsApp})}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-smooth",
                  localSettings.viaWhatsApp ? "bg-saffron shadow-glow-saffron" : "bg-surface-raised"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 rounded-full bg-white transition-smooth transform",
                  localSettings.viaWhatsApp ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-muted-foreground">SMS reminders</p>
                <p className="text-sm text-muted-foreground">Use SMS as a fallback channel</p>
              </div>
              <button disabled className="relative inline-flex h-6 w-11 items-center rounded-full bg-surface-raised/50 cursor-not-allowed">
                <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white/50 transition" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Auto reminders</p>
                <p className="text-sm text-muted-foreground">Nudge overdue customers automatically</p>
              </div>
              <button 
                onClick={() => setLocalSettings({...localSettings, autoEnabled: !localSettings.autoEnabled})}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-smooth",
                  localSettings.autoEnabled ? "bg-saffron shadow-glow-saffron" : "bg-surface-raised"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 rounded-full bg-white transition-smooth transform",
                  localSettings.autoEnabled ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSavePreferences}
              className="bg-surface-raised border border-border/50 hover:bg-surface-raised/80 text-foreground gap-2 rounded-xl h-11 px-6"
            >
              <Save className="size-4" /> Save preferences
            </Button>
          </div>
        </section>

        {/* Active Session */}
        <section className="bg-card/40 border border-border/50 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="size-10 rounded-xl bg-surface-raised flex items-center justify-center">
              <Smartphone className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Active Session</h2>
              <p className="text-sm text-muted-foreground">This device is signed in to your account.</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-5 rounded-2xl bg-surface-raised/40 border border-border/40">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-saffron/10 flex items-center justify-center text-saffron">
                <Shield className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">This browser - Desktop</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">Signed in 27 Apr, 2:00 pm</p>
              </div>
            </div>
            <Button onClick={logout} variant="ghost" className="rounded-xl h-10 gap-2 font-medium hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-destructive/5 border border-destructive/20 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-destructive">
            <div className="size-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Trash2 className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Danger zone</h2>
              <p className="text-sm text-destructive/80">Reset 10 customers, 7 transactions, 5 reminders to demo defaults.</p>
            </div>
          </div>

          <Button onClick={handleResetData} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-2 rounded-xl h-11 px-6 bg-transparent">
            <AlertCircle className="size-4" /> Reset all data
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Settings;
