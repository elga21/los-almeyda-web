const db = require('./config/db');

async function checkColumns() {
    try {
        console.log('🔍 Verificando columnas...');

        const [userColumns] = await db.query('SHOW COLUMNS FROM USUARIOS');
        console.log('👤 Columnas USUARIOS:', userColumns.map(c => c.Field));

        const [prodColumns] = await db.query('SHOW COLUMNS FROM PRODUCTOS');
        console.log('📦 Columnas PRODUCTOS:', prodColumns.map(c => c.Field));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit();
    }
}

checkColumns();
