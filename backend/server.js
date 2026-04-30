require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./config/db_adapter');

const app = express();

app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Initialize DB on startup
db.initialize().catch(err => console.error('DB Init Error:', err));

// Health check
app.get('/', (req, res) => res.send('Backend is running!'));

// --- ROUTES ---

// Get all customers
app.get('/api/customers', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Customers ORDER BY name ASC');
        res.json(result.recordset);
    } catch (err) {
        console.error('[API Error] /api/customers:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add new customer
app.post('/api/customers', async (req, res) => {
    try {
        const { name, phone, address, initials, totalDue, status, avatarColor, userId } = req.body;
        const result = await db.query(`
            INSERT INTO Customers (name, phone, address, initials, totalDue, status, avatarColor, userId) 
            VALUES (@name, @phone, @address, @initials, @totalDue, @status, @avatarColor, @userId);
            SELECT SCOPE_IDENTITY() AS id;
        `, { name, phone, address: address || '', initials: initials || '', totalDue: totalDue || 0, status: status || 'pending', avatarColor: avatarColor || '', userId: userId || 1 });
        
        res.json({ success: true, id: result.recordset[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update existing customer
app.put('/api/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address, initials, totalDue, status, avatarColor, userId } = req.body;
        await db.query(`
            UPDATE Customers SET name=@name, phone=@phone, address=@address, initials=@initials, totalDue=@totalDue, status=@status, avatarColor=@avatarColor, userId=@userId 
            WHERE id=@id
        `, { id, name, phone, address: address || '', initials: initials || '', totalDue: totalDue || 0, status: status || 'pending', avatarColor: avatarColor || '', userId: userId || 1 });
        res.json({ success: true });
    } catch (err) {
        console.error('[API Error] PUT /api/customers:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete customer
app.delete('/api/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM Transactions WHERE customerId = @id', { id });
        await db.query('DELETE FROM ReminderLogs WHERE customerId = @id', { id });
        await db.query('DELETE FROM Customers WHERE id = @id', { id });
        res.json({ success: true });
    } catch (err) {
        console.error('[API Error] DELETE /api/customers:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Transactions ORDER BY [date] DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error('[API Error] /api/transactions:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Add transaction (and update customer balance)
app.post('/api/transactions', async (req, res) => {
    try {
        const { customerId, customerName, type, amount, note, userId } = req.body;
        
        const result = await db.executeInTransaction(async (tx) => {
            // Helper for query within transaction
            const query = async (q, p) => {
                if (db.dbType === 'postgres') {
                    // Manual translation for internal transaction client
                    let pq = q.replace(/@(\w+)/g, (m, k) => `$${Object.keys(p).indexOf(k) + 1}`);
                    pq = pq.replace(/SELECT SCOPE_IDENTITY\(\) AS id/gi, 'RETURNING id');
                    return { recordset: (await tx.query(pq, Object.values(p))).rows };
                } else {
                    const req = tx.request();
                    Object.keys(p).forEach(k => req.input(k, p[k]));
                    return await req.query(q);
                }
            };

            const resInsert = await query(`
                INSERT INTO Transactions (customerId, customerName, type, amount, note, userId) 
                VALUES (@customerId, @customerName, @type, @amount, @note, @userId);
                SELECT SCOPE_IDENTITY() AS id;
            `, { customerId, customerName: customerName || '', type, amount, note: note || '', userId: userId || 1 });
            
            const newId = resInsert.recordset[0].id;

            // Update customer balance
            const balanceChange = type === 'credit' ? amount : -amount;
            await query(`UPDATE Customers SET totalDue = totalDue + @balanceChange WHERE id = @cid`, { balanceChange, cid: customerId });

            // Re-calculate status
            await query(`UPDATE Customers SET status = CASE WHEN totalDue <= 0 THEN 'paid' ELSE 'pending' END WHERE id = @cid`, { cid: customerId });

            return newId;
        });

        res.json({ success: true, id: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get reminder settings
app.get('/api/reminders/settings', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM ReminderSettings WHERE id = 1');
        if (result.recordset.length > 0) {
            const s = result.recordset[0];
            // Ensure boolean conversion for various DB types
            s.viaWhatsApp = !!s.viaWhatsApp;
            s.viaEmail = !!s.viaEmail;
            s.autoEnabled = !!s.autoEnabled;
            res.json(s);
        } else {
            res.json(null);
        }
    } catch (err) {
        console.error('[API Error] /api/reminders/settings:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update reminder settings
app.post('/api/reminders/settings', async (req, res) => {
    try {
        const { startAfterDays, frequencyDays, maxCount, viaWhatsApp, viaEmail, customerFilter, autoEnabled, whatsappTemplate, emailSubject, emailTemplate } = req.body;
        await db.query(`
            UPDATE ReminderSettings SET 
                startAfterDays = @startAfterDays,
                frequencyDays = @frequencyDays,
                maxCount = @maxCount,
                viaWhatsApp = @viaWhatsApp,
                viaEmail = @viaEmail,
                customerFilter = @customerFilter,
                autoEnabled = @autoEnabled,
                whatsappTemplate = @whatsappTemplate,
                emailSubject = @emailSubject,
                emailTemplate = @emailTemplate
            WHERE id = 1
        `, { 
            startAfterDays, frequencyDays, maxCount, 
            viaWhatsApp: viaWhatsApp ? 1 : 0, 
            viaEmail: viaEmail ? 1 : 0, 
            customerFilter, 
            autoEnabled: autoEnabled ? 1 : 0, 
            whatsappTemplate, emailSubject, emailTemplate 
        });
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get reminder logs
app.get('/api/reminders/logs', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM ReminderLogs ORDER BY [id] DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error('[API Error] /api/reminders/logs:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add reminder log
app.post('/api/reminders/logs', async (req, res) => {
    try {
        const { customerId, customerName, mode, status, message, userId } = req.body;
        await db.query(`
            INSERT INTO ReminderLogs (customerId, customerName, mode, status, message, userId) 
            VALUES (@customerId, @customerName, @mode, @status, @message, @userId)
        `, { customerId, customerName, mode, status, message, userId: userId || 1 });
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get shop profile
app.get('/api/profile', async (req, res) => {
    try {
        const result = await db.query('SELECT shopName, phone FROM Users WHERE id = 1');
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.json({ shopName: 'My Shop', phone: '' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update shop profile
app.post('/api/profile', async (req, res) => {
    try {
        const { shopName, phone } = req.body;
        await db.query('UPDATE Users SET shopName = @shopName, phone = @phone WHERE id = 1', { shopName, phone });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- BACKGROUND SCHEDULER ---
cron.schedule('* * * * *', async () => {
    try {
        const settingsRes = await db.query('SELECT * FROM ReminderSettings WHERE id = 1');
        if (settingsRes.recordset.length === 0 || !settingsRes.recordset[0].autoEnabled) return;
        
        const settings = settingsRes.recordset[0];
        const userRes = await db.query('SELECT shopName FROM Users WHERE id = 1');
        const shopName = userRes.recordset.length > 0 ? userRes.recordset[0].shopName : "Our Shop";

        const custRes = await db.query(`SELECT * FROM Customers WHERE totalDue > 0`);
        const customers = custRes.recordset;

        for (const customer of customers) {
            if (settings.customerFilter === 'overdue' && customer.status !== 'overdue') continue;
            if (settings.customerFilter === 'high_due' && customer.totalDue < 5000) continue;

            if (Math.random() > 0.95) { // 5% chance per minute
                let msg = settings.whatsappTemplate
                    .replace(/{Name}/g, customer.name)
                    .replace(/{Amount}/g, customer.totalDue.toString())
                    .replace(/{ShopName}/g, shopName);

                await db.query(`
                    INSERT INTO ReminderLogs (customerId, customerName, mode, status, message, userId) 
                    VALUES (@customerId, @customerName, @mode, @status, @message, @userId)
                `, { 
                    customerId: customer.id, 
                    customerName: customer.name, 
                    mode: settings.viaWhatsApp ? 'whatsapp' : 'email', 
                    status: 'sent', 
                    message: msg, 
                    userId: 1 
                });
                
                console.log(`[Cron] Sent automated reminder to ${customer.name}`);
            }
        }
    } catch (err) {
        console.error('[Cron Error]', err);
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});
