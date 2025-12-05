const db = require('./config/db');

async function debugProducts() {
    try {
        console.log('🔍 Probando consulta de productos...');

        const query = `
            SELECT
                p.id_producto,
                p.nombre,
                p.descripcion,
                p.precio,
                p.stock,
                p.imagen_url,
                p.unidad,
                c.nombre_categoria AS categoria_nombre,
                p.fecha_creacion
            FROM
                PRODUCTOS p
            JOIN
                CATEGORIAS c ON p.id_categoria = c.id_categoria
            ORDER BY p.nombre ASC;
        `;

        const [products] = await db.query(query);
        console.log('✅ Consulta exitosa. Productos encontrados:', products.length);
        console.log(products);

    } catch (error) {
        console.error('❌ Error en la consulta:', error);
    } finally {
        process.exit();
    }
}

debugProducts();
