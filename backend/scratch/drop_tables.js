const sql = require('mssql');
require('dotenv').config({ path: '../.env' });

const config = {
    user: process.env.DB_USER || 'Indus',
    password: process.env.DB_PASSWORD || 'Param@99811',
    server: process.env.DB_SERVER || 'DESKTOP-UH64HR3\\SQLEXPRESS',
    database: process.env.DB_NAME || 'SmartUdhaar',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function dropTables() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to SQL Server. Dropping old tables...');
        
        await pool.request().query('DROP TABLE IF EXISTS ReminderLogs');
        await pool.request().query('DROP TABLE IF EXISTS Transactions');
        await pool.request().query('DROP TABLE IF EXISTS ReminderSettings');
        await pool.request().query('DROP TABLE IF EXISTS Customers');
        await pool.request().query('DROP TABLE IF EXISTS Users');
        
        console.log('Tables dropped successfully.');
        await pool.close();
    } catch (err) {
        console.error('Error dropping tables:', err);
    }
}

dropTables();
