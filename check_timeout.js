const db = require('./config/db');

async function checkTimeout() {
    try {
        const [rows] = await db.query("SHOW VARIABLES LIKE '%timeout%'");
        console.log('⏱️ Variables de Timeout:', rows);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit();
    }
}

checkTimeout();
