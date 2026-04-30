// Mock data for the Smart Udhaar app
export type CustomerStatus = "paid" | "pending" | "overdue";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  initials: string;
  totalDue: number;
  lastTransaction: string;
  status: CustomerStatus;
  avatarColor: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  type: "credit" | "payment";
  amount: number;
  note: string;
  date: string;
  timeAgo: string;
}

export const customers: Customer[] = [
  { id: "c1", name: "Aggarwal Sweets", phone: "+91 98765 43210", address: "Sadar Bazaar, Delhi", initials: "AS", totalDue: 4500, lastTransaction: "2 mins ago", status: "paid", avatarColor: "from-cardamom to-cardamom/60" },
  { id: "c2", name: "Sharma Provisions", phone: "+91 98123 45678", address: "Karol Bagh, Delhi", initials: "SP", totalDue: 12800, lastTransaction: "1 hour ago", status: "pending", avatarColor: "from-saffron to-turmeric" },
  { id: "c3", name: "Modern Tailors", phone: "+91 99887 76655", address: "Lajpat Nagar, Delhi", initials: "MT", totalDue: 1250, lastTransaction: "3 hours ago", status: "pending", avatarColor: "from-turmeric to-saffron" },
  { id: "c4", name: "Rao Dairy", phone: "+91 90909 09090", address: "Nehru Place, Delhi", initials: "RD", totalDue: 8000, lastTransaction: "Yesterday", status: "pending", avatarColor: "from-cardamom to-saffron" },
  { id: "c5", name: "Verma Hardware", phone: "+91 88776 65544", address: "Chandni Chowk, Delhi", initials: "VH", totalDue: 28200, lastTransaction: "2 days ago", status: "overdue", avatarColor: "from-destructive to-saffron" },
  { id: "c6", name: "Patel Motors", phone: "+91 77665 54433", address: "Connaught Place, Delhi", initials: "PM", totalDue: 62000, lastTransaction: "4 days ago", status: "overdue", avatarColor: "from-saffron to-destructive" },
  { id: "c7", name: "Singh Auto Spares", phone: "+91 99000 11122", address: "Rohini, Delhi", initials: "SA", totalDue: 18500, lastTransaction: "5 days ago", status: "overdue", avatarColor: "from-destructive to-turmeric" },
  { id: "c8", name: "Anjali Desai", phone: "+91 91234 56789", address: "Saket, Delhi", initials: "AD", totalDue: 0, lastTransaction: "1 week ago", status: "paid", avatarColor: "from-cardamom to-turmeric" },
  { id: "c9", name: "Kisan Transport", phone: "+91 90011 22334", address: "Dwarka, Delhi", initials: "KT", totalDue: 8400, lastTransaction: "Today", status: "pending", avatarColor: "from-turmeric to-cardamom" },
  { id: "c10", name: "Gupta Electronics", phone: "+91 80808 70707", address: "Janakpuri, Delhi", initials: "GE", totalDue: 0, lastTransaction: "3 days ago", status: "paid", avatarColor: "from-cardamom to-saffron" },
];

export const transactions: Transaction[] = [
  { id: "t1", customerId: "c1", customerName: "Aggarwal Sweets", type: "payment", amount: 4500, note: "Settled monthly account", date: "Today", timeAgo: "2 mins ago" },
  { id: "t2", customerId: "c2", customerName: "Sharma Provisions", type: "credit", amount: 12800, note: "Refined oil & atta", date: "Today", timeAgo: "1 hour ago" },
  { id: "t3", customerId: "c3", customerName: "Modern Tailors", type: "credit", amount: 1250, note: "Buttons & threads", date: "Today", timeAgo: "3 hours ago" },
  { id: "t4", customerId: "c4", customerName: "Rao Dairy", type: "payment", amount: 8000, note: "Partial payment received", date: "Yesterday", timeAgo: "1 day ago" },
  { id: "t5", customerId: "c5", customerName: "Verma Hardware", type: "credit", amount: 28200, note: "Pipes, fittings, hardware", date: "2 days ago", timeAgo: "2 days ago" },
  { id: "t6", customerId: "c1", customerName: "Aggarwal Sweets", type: "credit", amount: 4500, note: "Sweets supply for festival", date: "3 days ago", timeAgo: "3 days ago" },
  { id: "t7", customerId: "c6", customerName: "Patel Motors", type: "credit", amount: 62000, note: "Spare parts bulk order", date: "4 days ago", timeAgo: "4 days ago" },
];

export const weeklyData = [
  { day: "Mon", credit: 15000, payment: 8000 },
  { day: "Tue", credit: 22000, payment: 14000 },
  { day: "Wed", credit: 18000, payment: 25000 },
  { day: "Thu", credit: 28000, payment: 12000 },
  { day: "Fri", credit: 35000, payment: 30000 },
  { day: "Sat", credit: 42000, payment: 38000 },
  { day: "Sun", credit: 14850, payment: 22000 },
];

export const monthlyData = [
  { month: "Jan", amount: 145000 },
  { month: "Feb", amount: 168000 },
  { month: "Mar", amount: 152000 },
  { month: "Apr", amount: 195000 },
  { month: "May", amount: 220000 },
  { month: "Jun", amount: 248000 },
  { month: "Jul", amount: 285000 },
];

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
