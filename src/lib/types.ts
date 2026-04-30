export type CustomerStatus = "paid" | "pending" | "overdue";

export interface Customer {
  id: number | string;
  name: string;
  phone: string;
  address: string;
  initials: string;
  totalDue: number;
  lastTransactionTime?: string | Date;
  status: CustomerStatus;
  avatarColor: string;
}

export interface Transaction {
  id: number | string;
  customerId: number | string;
  customerName: string;
  type: "credit" | "payment";
  amount: number;
  note: string;
  date: string | Date;
}

export interface ReminderSettings {
  id?: number;
  startAfterDays: number;
  frequencyDays: number;
  maxCount: number;
  viaWhatsApp: boolean;
  viaEmail: boolean;
  customerFilter: 'all' | 'high_due' | 'overdue';
  autoEnabled: boolean;
  whatsappTemplate: string;
  emailSubject: string;
  emailTemplate: string;
  userId?: number;
}

export interface ReminderLog {
  id: number | string;
  customerId: number | string;
  customerName: string;
  date: string | Date;
  mode: 'whatsapp' | 'email';
  status: 'sent' | 'failed';
  message: string;
}

export interface Session {
  id?: number;
  phone: string;
  shopName: string;
}

export interface StoreState {
  session: Session | null;
  customers: Customer[];
  transactions: Transaction[];
  reminders: any[];
  reminderSettings: ReminderSettings;
  reminderLogs: ReminderLog[];
  login: (phone: string) => void;
  logout: () => void;
  addCustomer: (customer: Omit<Customer, "id">) => Promise<any>;
  deleteCustomer: (id: number | string) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<any>;
  updateReminderSettings: (settings: ReminderSettings) => void;
  manualSendReminder: (customerId: number | string, mode: 'whatsapp' | 'email') => void;
}
