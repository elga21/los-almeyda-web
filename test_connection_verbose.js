require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('🔍 Probando conexión a la Base de Datos...');
    console.log('----------------------------------------');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log('----------------------------------------');

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('✅ ¡Conexión Exitosa!');

        const [rows] = await connection.execute('SHOW TABLES');
        console.log('📊 Tablas en la base de datos:');
        if (rows.length > 0) {
            rows.forEach(row => {
                console.log(` - ${Object.values(row)[0]}`);
            });
        } else {
            console.log('⚠️ No se encontraron tablas. La base de datos está vacía.');
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Error de Conexión:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Pista: Parece que el servidor MySQL no está corriendo o el puerto es incorrecto.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 Pista: Usuario o contraseña incorrectos.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('💡 Pista: La base de datos no existe.');
        }
    }
}

testConnection();
