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

// Obtener todas las recetas
router.get('/', async (req, res) => {
    try {
        const [recetas] = await db.query('SELECT * FROM RECETAS ORDER BY fecha_creacion DESC');
        res.json(recetas);
    } catch (error) {
        console.error('Error al obtener recetas:', error);
        res.status(500).json({ message: 'Error al obtener recetas.' });
    }
});

// Obtener una receta por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [receta] = await db.query('SELECT * FROM RECETAS WHERE id_receta = ?', [id]);
        if (receta.length === 0) {
            return res.status(404).json({ message: 'Receta no encontrada.' });
        }
        res.json(receta[0]);
    } catch (error) {
        console.error('Error al obtener receta:', error);
        res.status(500).json({ message: 'Error al obtener receta.' });
    }
});

// Crear una nueva receta (Admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { titulo, descripcion, ingredientes, instrucciones, imagen_url } = req.body;

    if (!titulo || !ingredientes || !instrucciones) {
        return res.status(400).json({ message: 'Título, ingredientes e instrucciones son obligatorios.' });
    }

    try {
        const query = 'INSERT INTO RECETAS (titulo, descripcion, ingredientes, instrucciones, imagen_url) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [titulo, descripcion, ingredientes, instrucciones, imagen_url]);
        res.status(201).json({ message: 'Receta creada exitosamente.', id_receta: result.insertId });
    } catch (error) {
        console.error('Error al crear receta:', error);
        res.status(500).json({ message: 'Error al crear receta.' });
    }
});

// Actualizar una receta (Admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, ingredientes, instrucciones, imagen_url } = req.body;

    try {
        const query = 'UPDATE RECETAS SET titulo = ?, descripcion = ?, ingredientes = ?, instrucciones = ?, imagen_url = ? WHERE id_receta = ?';
        const [result] = await db.query(query, [titulo, descripcion, ingredientes, instrucciones, imagen_url, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Receta no encontrada.' });
        }
        res.json({ message: 'Receta actualizada exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar receta:', error);
        res.status(500).json({ message: 'Error al actualizar receta.' });
    }
});

// Eliminar una receta (Admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM RECETAS WHERE id_receta = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Receta no encontrada.' });
        }
        res.json({ message: 'Receta eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar receta:', error);
        res.status(500).json({ message: 'Error al eliminar receta.' });
    }
});

module.exports = router;
