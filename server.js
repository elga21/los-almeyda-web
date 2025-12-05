// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
require('dotenv').config();

// Importa las rutas de la API
const productosRoutes = require('./routes/productos');
const usuariosRoutes = require('./routes/usuarios');
const pedidosRoutes = require('./routes/pedidos');
const categoriasRoutes = require('./routes/categorias');

// Configura los middlewares
app.use(cors());
app.use(bodyParser.json());

// Middleware de logging para ver todas las peticiones
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// =====================================================================================
// RUTAS DE LA API (DEBEN IR ANTES DE SERVIR ARCHIVOS ESTÁTICOS)
// =====================================================================================
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/recetas', require('./routes/recetas')); // Ruta de recetas
app.use('/api/servicios', require('./routes/servicios')); // Ruta de servicios

// =====================================================================================
// SIRVE ARCHIVOS ESTÁTICOS (CSS, JS, HTML, imágenes, etc.)
// =====================================================================================
app.use(express.static(path.join(__dirname, 'public')));

// =====================================================================================
// RUTA RAÍZ - Sirve main.html (página de bienvenida) como página de inicio
// =====================================================================================
app.get('/', (req, res) => {
  // Headers para evitar caché y asegurar que siempre cargue main.html
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

// =====================================================================================
// INICIA EL SERVIDOR
// =====================================================================================
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
  console.log('⏰ Servidor ACTIVO y esperando peticiones...');
  console.log('💡 Presiona Ctrl+C para detener el servidor');
});

// =====================================================================================
// MANEJO DE ERRORES GLOBALES PARA EVITAR QUE EL SERVIDOR SE CIERRE
// =====================================================================================
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  console.log('⚠️ El servidor continúa ejecutándose...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  console.log('⚠️ El servidor continúa ejecutándose...');
});

process.on('SIGINT', () => {
  console.log('\n⚠️ Servidor interrumpido por el usuario');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

console.log('📌 Servidor configurado y listo');
