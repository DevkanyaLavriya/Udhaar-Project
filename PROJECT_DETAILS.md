# SmartUdhaar - Digital Ledger & Reminder System

SmartUdhaar is a modern web application designed for small to medium-sized businesses to manage their customer credits (Udhaar), track transactions, and automate payment reminders.

## 🚀 Project Workflow

### 1. Customer Management
- **Add Customers**: Register new customers with their name, phone number, and address.
- **Monitor Balances**: Each customer has a real-time "Total Due" balance.
- **Status Tracking**: Customers are automatically categorized as **Paid**, **Pending**, or **Overdue** based on their transaction history and due dates.

### 2. Transaction Records
- **Credit (Udhaar)**: Record when a customer takes goods or services on credit. This increases their "Total Due".
- **Debit (Payment)**: Record when a customer pays back. This decreases their "Total Due".
- **Notes**: Each transaction can have a specific note (e.g., "Bought 2kg Sugar") for better tracking.

### 3. Payment Reminders
- **Automated Messaging**: The system can be configured to automatically send reminders via WhatsApp or Email.
- **Custom Templates**: Personalize messages with placeholders like `{Name}`, `{Amount}`, and `{ShopName}`.
- **Frequency Control**: Set how often and after how many days a reminder should be sent.
- **Reminder Logs**: Keep track of every reminder sent to ensure you don't over-message customers.

### 4. Shop Profile
- Customize your shop name and contact details, which will be used in all communications with customers.

---

## 🛠 Tech Stack
- **Frontend**: React.js with TypeScript, Tailwind CSS, and Shadcn UI.
- **Backend**: Node.js with Express.
- **Database**: Microsoft SQL Server (MSSQL).
- **Styling**: Modern, responsive dark-mode UI with Framer Motion animations.

## 📈 Value Proposition for Clients
- **Reduce Bad Debts**: Automated reminders ensure customers pay on time.
- **Save Time**: No more manual bookkeeping or chasing payments over calls.
- **Professionalism**: Send professional WhatsApp/Email alerts with your shop's branding.
- **Data Security**: All transaction history is stored securely in a relational database.
