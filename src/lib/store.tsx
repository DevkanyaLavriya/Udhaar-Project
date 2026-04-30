import React, { createContext, useContext, useState, useEffect } from "react";
import { customers as initialCustomers, transactions as initialTransactions } from "./mock-data";
import { ReminderSettings, ReminderLog, Session, StoreState, Customer, Transaction } from "./types";

export type { ReminderSettings, ReminderLog, Session, StoreState, Customer, Transaction };

export const StoreContext = createContext<StoreState | undefined>(undefined);

const defaultReminderSettings: ReminderSettings = {
  startAfterDays: 3,
  frequencyDays: 2,
  maxCount: 5,
  viaWhatsApp: true,
  viaEmail: false,
  customerFilter: 'overdue',
  autoEnabled: false,
  whatsappTemplate: "Hi {Name}, aapka ₹{Amount} pending hai. Kripya jaldi payment karein. – {ShopName}",
  emailSubject: "Payment Reminder: {ShopName}",
  emailTemplate: "Dear {Name},\n\nThis is a gentle reminder that an amount of ₹{Amount} is pending on your account. Please clear your dues at the earliest.\n\nThank you,\n{ShopName}"
};

// Helper to calculate status based on dues and date
const calculateStatus = (totalDue: number, lastDate: string | Date | null, settings: ReminderSettings) => {
  if (totalDue <= 0) return 'paid';
  if (!lastDate) return 'pending';
  
  const date = typeof lastDate === 'string' ? new Date(lastDate) : lastDate;
  const diffDays = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));
  
  return diffDays >= settings.startAfterDays ? 'overdue' : 'pending';
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const saved = localStorage.getItem("udhaar-session");
    return saved ? JSON.parse(saved) : null;
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reminders, setReminders] = useState<any[]>([]); // old notification badge
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(defaultReminderSettings);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);

  useEffect(() => {
    if (session) {
      localStorage.setItem("udhaar-session", JSON.stringify(session));
    } else {
      localStorage.removeItem("udhaar-session");
    }
  }, [session]);

  // FETCH INITIAL DATA FROM BACKEND
  useEffect(() => {
    import('@/services/api').then(api => {
      import('@/services/api').then(api => {
        Promise.all([
          api.getCustomers(),
          api.getTransactions(),
          api.getReminderSettings(),
          api.getReminderLogs(),
          api.getProfile()
        ]).then(([custData, txnData, settingsData, logsData, profileData]) => {
          const currentSettings = settingsData || reminderSettings;
          
          if (profileData && session) {
            setSession({ ...session, shopName: profileData.shopName, phone: profileData.phone });
          } else if (profileData && !session) {
            setSession({ phone: profileData.phone, shopName: profileData.shopName });
          }
          
          // Enrich customers with auto-calculated status based on latest transaction dates
          const enrichedCustomers = (custData || []).map(cust => {
            const customerTxns = (txnData || []).filter(t => t.customerId === cust.id);
            const latestTxn = customerTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            const status = calculateStatus(cust.totalDue, latestTxn ? latestTxn.date : cust.lastTransactionTime, currentSettings);
            return { ...cust, status };
          });

          setCustomers(enrichedCustomers);
          setTransactions(txnData || []);
          if (settingsData) setReminderSettings(settingsData);
          if (logsData) setReminderLogs(logsData);
        }).catch(err => {
          console.error("Failed to fetch data from backend", err);
          setCustomers([]);
          setTransactions([]);
        });
      });
    });
  }, []);

  // Polling for automated reminder logs from backend (since cron runs on server)
  useEffect(() => {
    const interval = setInterval(() => {
      import('@/services/api').then(api => {
        api.getReminderLogs().then(data => {
          if (data && data.length > 0) {
            setReminderLogs(prev => {
              // If new logs found, trigger toast for the new ones
              if (data.length > prev.length) {
                const newLogs = data.filter(d => !prev.some(p => p.id === d.id));
                newLogs.forEach(log => {
                  window.dispatchEvent(new CustomEvent('auto-reminder-sent', { detail: log }));
                });
                return data;
              }
              return prev;
            });
          }
        }).catch(() => {});
      });
    }, 15000); // Poll every 15s for new logs from server
    return () => clearInterval(interval);
  }, []);

  const login = async (phone: string) => {
    try {
      const api = await import('@/services/api');
      const profile = await api.getProfile();
      setSession({ phone, shopName: profile?.shopName || "Udhaar Shop" });
    } catch (err) {
      setSession({ phone, shopName: "Udhaar Shop" });
    }
  };

  const logout = () => {
    setSession(null);
  };

  const addCustomer = async (customer: Omit<Customer, "id">) => {
    const tempId = `temp-${Date.now()}`;
    const newCustomer: Customer = {
      ...customer,
      id: tempId,
    };
    // Optimistic Update
    setCustomers((prev) => [newCustomer, ...prev]);
    
    try {
      const api = await import('@/services/api');
      const res = await api.addCustomer(customer);
      if (res.success) {
        setCustomers(prev => prev.map(c => c.id === tempId ? { ...c, id: res.id } : c));
      }
    } catch (err) {
      console.error("Failed to add customer to DB", err);
      setCustomers(prev => prev.filter(c => c.id !== tempId));
    }
  };

  const deleteCustomer = async (id: number | string) => {
    // Optimistic Update
    setCustomers((prev) => prev.filter(c => c.id !== id));
    setTransactions((prev) => prev.filter(t => t.customerId !== id));
    setReminderLogs((prev) => prev.filter(l => l.customerId !== id));

    try {
      const api = await import('@/services/api');
      await api.deleteCustomer(id);
    } catch (err) {
      console.error("Failed to delete customer from DB", err);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    const tempId = `temp-t-${Date.now()}`;
    const newTransaction: Transaction = {
      ...transaction,
      id: tempId,
      date: new Date()
    };
    
    // Optimistic Update
    setTransactions((prev) => [newTransaction, ...prev]);
    setCustomers((prev) => prev.map(c => {
      if (c.id === transaction.customerId) {
        const newDue = c.totalDue + (transaction.type === "credit" ? transaction.amount : -transaction.amount);
        const newStatus = calculateStatus(newDue, new Date(), reminderSettings);
        return { ...c, totalDue: newDue, status: newStatus as any, lastTransactionTime: new Date() };
      }
      return c;
    }));

    try {
      const api = await import('@/services/api');
      const res = await api.addTransaction(transaction);
      if (res.success) {
        setTransactions(prev => prev.map(t => t.id === tempId ? { ...t, id: res.id } : t));
      }
    } catch (err) {
      console.error("Failed to add transaction to DB", err);
      setTransactions(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const updateReminderSettings = async (settings: ReminderSettings) => {
    // Optimistic Update
    setReminderSettings(settings);

    try {
      const api = await import('@/services/api');
      await api.updateReminderSettings(settings);
    } catch (err) {
      console.error("Failed to update settings in DB", err);
    }
  };

  const updateProfile = async (shopName: string, phone: string) => {
    if (session) {
      setSession({ ...session, shopName, phone });
    } else {
      setSession({ shopName, phone });
    }

    try {
      const api = await import('@/services/api');
      await api.updateProfile({ shopName, phone });
    } catch (err) {
      console.error("Failed to update profile in DB", err);
    }
  };

  const manualSendReminder = async (customerId: string, mode: 'whatsapp' | 'email') => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    // Dynamic Template Renderer
    const renderTemplate = (template: string, cust: Customer, shopName: string) => {
      return template
        .replace(/{Name}/g, cust.name)
        .replace(/{Amount}/g, cust.totalDue.toString())
        .replace(/{DueDate}/g, "Immediately")
        .replace(/{ShopName}/g, shopName);
    };

    const template = mode === 'whatsapp' ? reminderSettings.whatsappTemplate : reminderSettings.emailTemplate;
    const msg = renderTemplate(template, customer, session?.shopName || "Udhaar Shop");

    const newLog: ReminderLog = {
      id: `rlog-${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      date: new Date().toLocaleString(),
      mode,
      status: 'sent',
      message: msg
    };

    // Optimistic Update
    setReminderLogs(logs => [newLog, ...logs]);
    window.dispatchEvent(new CustomEvent('auto-reminder-sent', { detail: newLog }));

    try {
      const api = await import('@/services/api');
      await api.addReminderLog(newLog);
    } catch (err) {
      console.error("Failed to add reminder log to DB", err);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        session,
        customers,
        transactions,
        reminders,
        reminderSettings,
        reminderLogs,
        login,
        logout,
        addCustomer,
        deleteCustomer,
        addTransaction,
        updateReminderSettings,
        updateProfile,
        manualSendReminder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
