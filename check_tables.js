const db = require('./config/db');

async function checkTables() {
    try {
        console.log('🔍 Verificando conexión y tablas...');
        const [rows] = await db.query('SHOW TABLES');
        console.log('✅ Tablas encontradas:', rows);

        if (rows.length === 0) {
            console.error('❌ No se encontraron tablas. Parece que el script SQL no se ejecutó correctamente.');
        } else {
            console.log('👍 La base de datos parece tener tablas.');
        }
    } catch (error) {
        console.error('❌ Error al conectar o consultar la BD:', error);
    } finally {
        process.exit();
    }
}

checkTables();
