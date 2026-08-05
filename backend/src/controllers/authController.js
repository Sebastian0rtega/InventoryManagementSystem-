'use strict';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');

// Registro
exports.register = async (req, res) => {
  try {
    const { email, nombre, password } = req.body;
    if (!email || !nombre || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const trimmedEmail = email.trim();
    const trimmedNombre = nombre.trim();

    if (!trimmedEmail || !trimmedNombre || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos y no deben estar vacíos' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const normalizedEmail = trimmedEmail.toLowerCase();
    const existingUser = await Usuario.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email ya registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await Usuario.create({
      email: normalizedEmail,
      nombre: trimmedNombre,
      password_hash: passwordHash,
      rol_id: 2, // Por defecto, Vendedor
      tienda_id: 1 // Por defecto, Casa Matriz
    });

    const { password_hash, ...userWithoutPassword } = newUser.toJSON();
    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error('Error en registro:', err);
    return res.status(500).json({ error: 'Error en registro' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await Usuario.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.usuario_id, rol: user.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.json({ token });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error en login' });
  }
};

// Usuario autenticado
exports.me = async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.user.id, {
      include: [{ model: Rol, as: 'rol' }]
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { password_hash, ...userWithoutPassword } = user.toJSON();
    return res.json(userWithoutPassword);
  } catch (err) {
    console.error('Error en /me:', err);
    return res.status(500).json({ error: 'Error al obtener usuario autenticado' });
  }
};
