const mssql = require('./db'); // The original mssql config
const pg = require('./db_pg');  // The new postgres config
require('dotenv').config();

const dbType = process.env.DB_TYPE || 'mssql';

console.log(`[DB Adapter] Using Database Type: ${dbType}`);

const adapter = {
    dbType,
    
    async initialize() {
        if (dbType === 'postgres') {
            await pg.initializeDatabase();
        } else {
            // mssql initializes itself in db.js, but we can call a setup if needed
        }
    },

    async query(text, params = {}) {
        if (dbType === 'postgres') {
            // Convert @param to $1, $2...
            let pgText = text;
            const pgParams = [];
            let i = 1;
            
            // This is a simple regex-based converter for @param
            // It replaces @name with $1, @phone with $2, etc.
            // and builds the params array in order.
            const keys = Object.keys(params);
            keys.forEach(key => {
                const regex = new RegExp(`@${key}\\b`, 'g');
                if (pgText.match(regex)) {
                    pgText = pgText.replace(regex, `$${i}`);
                    pgParams.push(params[key]);
                    i++;
                }
            });

            // Replace SCOPE_IDENTITY() with RETURNING id
            pgText = pgText.replace(/SELECT SCOPE_IDENTITY\(\) AS id/gi, 'RETURNING id');
            pgText = pgText.replace(/GETDATE\(\)/gi, 'NOW()');
            pgText = pgText.replace(/BIT/gi, 'BOOLEAN');

            const res = await pg.query(pgText, pgParams);
            return { recordset: res.rows };
        } else {
            const pool = await mssql.poolPromise;
            const request = pool.request();
            Object.keys(params).forEach(key => {
                request.input(key, params[key]);
            });
            return await request.query(text);
        }
    },

    async executeInTransaction(callback) {
        if (dbType === 'postgres') {
            const client = await pg.pool.connect();
            try {
                await client.query('BEGIN');
                const result = await callback(client);
                await client.query('COMMIT');
                return result;
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }
        } else {
            const pool = await mssql.poolPromise;
            const transaction = new mssql.sql.Transaction(pool);
            await transaction.begin();
            try {
                const result = await callback(transaction);
                await transaction.commit();
                return result;
            } catch (e) {
                await transaction.rollback();
                throw e;
            }
        }
    }
};

module.exports = adapter;
