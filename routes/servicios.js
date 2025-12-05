// routes/servicios.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('./usuarios');

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
    if (req.userRol !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
};

// Obtener todos los servicios
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM SERVICIOS ORDER BY nombre ASC';
        const [servicios] = await db.query(query);
        res.status(200).json(servicios);
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        res.status(500).json({ message: 'Error al obtener servicios.', error: error.message });
    }
});

// Obtener un servicio por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT * FROM SERVICIOS WHERE id_servicio = ?';
        const [servicio] = await db.query(query, [id]);
        if (servicio.length === 0) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }
        res.status(200).json(servicio[0]);
    } catch (error) {
        console.error('Error al obtener servicio por ID:', error);
        res.status(500).json({ message: 'Error al obtener servicio.', error: error.message });
    }
});

// Crear un nuevo servicio (solo administradores)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { nombre, descripcion, precio, imagen_url } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({ message: 'Nombre y precio son obligatorios.' });
    }

    try {
        const query = 'INSERT INTO SERVICIOS (nombre, descripcion, precio, imagen_url) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(query, [nombre, descripcion, precio, imagen_url || null]);
        res.status(201).json({ message: 'Servicio registrado exitosamente.', id_servicio: result.insertId });
    } catch (error) {
        console.error('Error al registrar servicio:', error);
        res.status(500).json({ message: 'Error al registrar el servicio.', error: error.message });
    }
});

// Actualizar un servicio (solo administradores)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, imagen_url } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({ message: 'Nombre y precio son obligatorios.' });
    }

    try {
        const query = 'UPDATE SERVICIOS SET nombre = ?, descripcion = ?, precio = ?, imagen_url = ? WHERE id_servicio = ?';
        const [result] = await db.query(query, [nombre, descripcion, precio, imagen_url || null, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Servicio no encontrado para actualizar.' });
        }
        res.status(200).json({ message: 'Servicio actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        res.status(500).json({ message: 'Error al actualizar el servicio.', error: error.message });
    }
});

// Eliminar un servicio (solo administradores)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM SERVICIOS WHERE id_servicio = ?';
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Servicio no encontrado para eliminar.' });
        }
        res.status(200).json({ message: 'Servicio eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        res.status(500).json({ message: 'Error al eliminar el servicio.', error: error.message });
    }
});

module.exports = router;
