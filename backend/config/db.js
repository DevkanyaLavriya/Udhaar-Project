const sql = require('mssql');
require('dotenv').config();

// Standard SQL Server Configuration
const config = {
    user: process.env.DB_USER || 'Indus',
    password: process.env.DB_PASSWORD || 'Param@99811',
    server: process.env.DB_SERVER || 'DESKTOP-UH64HR3\\SQLEXPRESS',
    database: process.env.DB_NAME || 'SmartUdhaar',
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true', // true for Azure, false for local
        trustServerCertificate: true, // true for local dev
        enableArithAbort: true
    }
};

// Connect to 'master' to ensure database exists
const masterConfig = { ...config, database: 'master' };

const poolPromise = new sql.ConnectionPool(masterConfig)
  .connect()
  .then(async masterPool => {
    console.log('Connected to SQL Server (Master)');
    
    // Check if DB exists, if not create it
    const checkDb = await masterPool.request().query(`SELECT name FROM sys.databases WHERE name = N'${config.database}'`);
    if (checkDb.recordset.length === 0) {
        console.log(`Database '${config.database}' not found. Creating...`);
        await masterPool.request().query(`CREATE DATABASE ${config.database}`);
        console.log(`Database '${config.database}' created successfully.`);
    }
    
    await masterPool.close();

    // Now connect to the actual database
    const appPool = await new sql.ConnectionPool(config).connect();
    console.log(`Connected to Database: ${config.database}`);
    
    await initializeDatabase(appPool);
    return appPool;
  })
  .catch(err => {
      console.log('Database Connection Failed!', err);
      return null;
  });

async function initializeDatabase(pool) {
    try {
        console.log('Initializing Database Schema...');
        
        // Users Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' and xtype='U')
            CREATE TABLE Users (
                id INT IDENTITY(1,1) PRIMARY KEY,
                phone VARCHAR(20) NOT NULL UNIQUE,
                shopName NVARCHAR(255) NOT NULL
            )
        `);

        // Customers Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Customers' and xtype='U')
            CREATE TABLE Customers (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                address NVARCHAR(MAX),
                initials VARCHAR(10),
                totalDue DECIMAL(18,2) DEFAULT 0,
                lastTransactionTime DATETIME DEFAULT GETDATE(),
                status VARCHAR(50),
                avatarColor VARCHAR(255),
                userId INT
            )
        `);

        // Transactions Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Transactions' and xtype='U')
            CREATE TABLE Transactions (
                id INT IDENTITY(1,1) PRIMARY KEY,
                customerId INT NOT NULL,
                customerName NVARCHAR(255),
                type VARCHAR(50) NOT NULL,
                amount DECIMAL(18,2) NOT NULL,
                note NVARCHAR(MAX),
                date DATETIME DEFAULT GETDATE(),
                userId INT
            )
        `);

        // ReminderSettings Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ReminderSettings' and xtype='U')
            CREATE TABLE ReminderSettings (
                id INT PRIMARY KEY DEFAULT 1,
                startAfterDays INT DEFAULT 3,
                frequencyDays INT DEFAULT 2,
                maxCount INT DEFAULT 5,
                viaWhatsApp BIT DEFAULT 1,
                viaEmail BIT DEFAULT 0,
                customerFilter VARCHAR(50) DEFAULT 'overdue',
                autoEnabled BIT DEFAULT 0,
                whatsappTemplate NVARCHAR(MAX) DEFAULT 'Hi {Name}, aapka ₹{Amount} pending hai. Kripya jaldi payment karein. - {ShopName}',
                emailSubject NVARCHAR(255) DEFAULT 'Payment Reminder: {ShopName}',
                emailTemplate NVARCHAR(MAX) DEFAULT 'Dear {Name}, an amount of ₹{Amount} is pending.',
                userId INT
            )
        `);

        // ReminderLogs Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ReminderLogs' and xtype='U')
            CREATE TABLE ReminderLogs (
                id INT IDENTITY(1,1) PRIMARY KEY,
                customerId INT NOT NULL,
                customerName NVARCHAR(255),
                date DATETIME DEFAULT GETDATE(),
                mode VARCHAR(50),
                status VARCHAR(50),
                message NVARCHAR(MAX),
                userId INT
            )
        `);

        // Seed initial data if empty
        const checkCust = await pool.request().query('SELECT COUNT(*) as count FROM Customers');
        if (checkCust.recordset[0].count === 0) {
            console.log('Seeding initial data...');
            // Insert default user if missing
            await pool.request().query(`
                IF NOT EXISTS (SELECT 1 FROM Users WHERE phone = '9876543210')
                INSERT INTO Users (phone, shopName) VALUES ('9876543210', 'Verma Traders')
            `);
            
            // Insert default settings if missing
            await pool.request().query(`
                IF NOT EXISTS (SELECT 1 FROM ReminderSettings WHERE id = 1)
                INSERT INTO ReminderSettings (id, userId) VALUES (1, 1)
            `);
        }

        console.log('Database Schema Initialized Successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

module.exports = {
  sql, poolPromise
};
