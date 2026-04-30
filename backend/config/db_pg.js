const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('Initializing PostgreSQL Database Schema...');
    
    // Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) NOT NULL UNIQUE,
        shopName VARCHAR(255) NOT NULL
      )
    `);

    // Customers Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT,
        initials VARCHAR(10),
        totalDue DECIMAL(18,2) DEFAULT 0,
        lastTransactionTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50),
        avatarColor VARCHAR(255),
        userId INT
      )
    `);

    // Transactions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Transactions (
        id SERIAL PRIMARY KEY,
        customerId INT NOT NULL,
        customerName VARCHAR(255),
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(18,2) NOT NULL,
        note TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        userId INT
      )
    `);

    // ReminderSettings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ReminderSettings (
        id INT PRIMARY KEY DEFAULT 1,
        startAfterDays INT DEFAULT 3,
        frequencyDays INT DEFAULT 2,
        maxCount INT DEFAULT 5,
        viaWhatsApp BOOLEAN DEFAULT TRUE,
        viaEmail BOOLEAN DEFAULT FALSE,
        customerFilter VARCHAR(50) DEFAULT 'overdue',
        autoEnabled BOOLEAN DEFAULT FALSE,
        whatsappTemplate TEXT DEFAULT 'Hi {Name}, aapka ₹{Amount} pending hai. Kripya jaldi payment karein. - {ShopName}',
        emailSubject VARCHAR(255) DEFAULT 'Payment Reminder: {ShopName}',
        emailTemplate TEXT DEFAULT 'Dear {Name}, an amount of ₹{Amount} is pending.',
        userId INT
      )
    `);

    // ReminderLogs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ReminderLogs (
        id SERIAL PRIMARY KEY,
        customerId INT NOT NULL,
        customerName VARCHAR(255),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mode VARCHAR(50),
        status VARCHAR(50),
        message TEXT,
        userId INT
      )
    `);

    // Seed initial data
    const res = await client.query('SELECT COUNT(*) FROM Customers');
    if (parseInt(res.rows[0].count) === 0) {
      console.log('Seeding initial data (PostgreSQL)...');
      await client.query(`
        INSERT INTO Users (phone, shopName) 
        VALUES ('9876543210', 'Verma Traders')
        ON CONFLICT (phone) DO NOTHING
      `);
      await client.query(`
        INSERT INTO ReminderSettings (id, userId) 
        VALUES (1, 1)
        ON CONFLICT (id) DO NOTHING
      `);
    }

    console.log('PostgreSQL Database Initialized Successfully');
  } catch (err) {
    console.error('Error initializing PostgreSQL database:', err);
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  initializeDatabase,
  query: (text, params) => pool.query(text, params),
};
