// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'los_almeyda_db'
};

console.log('🔧 Configuración DB:', { ...config, password: '****' });

// Wrapper para simular un pool pero creando conexiones frescas cada vez
// Esto soluciona problemas de "Connection lost" en entornos locales inestables
const db = {
    query: async (sql, params) => {
        let connection;
        try {
            connection = await mysql.createConnection(config);
            const [results, fields] = await connection.query(sql, params);
            return [results, fields];
        } catch (error) {
            console.error('❌ Error en db.query:', error.message);
            throw error;
        } finally {
            if (connection) await connection.end();
        }
    },
    execute: async (sql, params) => {
        let connection;
        try {
            connection = await mysql.createConnection(config);
            const [results, fields] = await connection.execute(sql, params);
            return [results, fields];
        } catch (error) {
            console.error('❌ Error en db.execute:', error.message);
            throw error;
        } finally {
            if (connection) await connection.end();
        }
    },
    getConnection: async () => {
        try {
            const connection = await mysql.createConnection(config);
            // Agregar método release para compatibilidad con código que espera un pool
            connection.release = async () => {
                await connection.end();
            };
            return connection;
        } catch (error) {
            console.error('❌ Error en db.getConnection:', error.message);
            throw error;
        }
    }
};

// Export the db wrapper
module.exports = db;
