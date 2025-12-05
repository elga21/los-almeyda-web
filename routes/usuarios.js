// routes/usuarios.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Importa la conexión a la base de datos
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware para verificar el token JWT (protege rutas)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userRol = decoded.rol;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Token inválido.' });
    }
};

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
    const { nombre_usuario, email, contrasena, rol } = req.body;

    if (!nombre_usuario || !email || !contrasena) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        // Insertar en las columnas correctas de la tabla USUARIOS
        const query = 'INSERT INTO USUARIOS (nombre_usuario, email, password, rol) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(query, [nombre_usuario, email, hashedPassword, rol || 'cliente']);

        res.status(201).json({ message: 'Usuario registrado exitosamente.', userId: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'El correo ya está registrado.' });
        }
        console.error('Error al registrar el usuario en la DB:', err);
        res.status(500).json({ message: 'Error al registrar el usuario.', error: err.message });
    }
});

// Ruta para iniciar sesión (login)
router.post('/login', async (req, res) => {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
        return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
    }

    try {
        const query = 'SELECT id_usuario, nombre_usuario, email, password, rol FROM USUARIOS WHERE email = ?';
        const [results] = await db.query(query, [email]);

        if (results.length === 0) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(contrasena, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            { userId: user.id_usuario, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token,
            user: {
                id_usuario: user.id_usuario,
                nombre_usuario: user.nombre_usuario,
                email: user.email,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error en el servidor.', error: error.message });
    }
});

// Obtener perfil de usuario (autenticado)
router.get('/perfil', verifyToken, async (req, res) => {
    try {
        const query = 'SELECT id_usuario, nombre_usuario, email, telefono, direccion, rol, fecha_registro FROM USUARIOS WHERE id_usuario = ?';
        const [results] = await db.query(query, [req.userId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ message: 'Error al obtener perfil.', error: error.message });
    }
});

// Actualizar perfil de usuario (autenticado)
router.put('/perfil', verifyToken, async (req, res) => {
    const { nombre_usuario, email, telefono, direccion } = req.body;

    if (!nombre_usuario || !email) {
        return res.status(400).json({ message: 'Nombre y email son obligatorios.' });
    }

    try {
        // Primero verificar el email actual del usuario
        const [currentUser] = await db.query('SELECT email FROM USUARIOS WHERE id_usuario = ?', [req.userId]);

        if (currentUser.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Si el email cambió, verificar que no esté en uso por otro usuario
        if (email !== currentUser[0].email) {
            const [existingEmail] = await db.query('SELECT id_usuario FROM USUARIOS WHERE email = ? AND id_usuario != ?', [email, req.userId]);

            if (existingEmail.length > 0) {
                return res.status(400).json({ message: 'El email ya está en uso por otro usuario.' });
            }
        }

        // Actualizar el perfil
        const query = 'UPDATE USUARIOS SET nombre_usuario = ?, email = ?, telefono = ?, direccion = ? WHERE id_usuario = ?';
        const [result] = await db.query(query, [nombre_usuario, email, telefono, direccion, req.userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json({ message: 'Perfil actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ message: 'Error al actualizar perfil.', error: error.message });
    }
});

module.exports = router;
module.exports.verifyToken = verifyToken; // Exporta el middleware para usarlo en otras rutas
