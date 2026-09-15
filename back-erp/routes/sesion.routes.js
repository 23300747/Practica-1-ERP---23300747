const express = require('express');
const router = express.Router();
const sesionService = require('../services/sesion.service');

function validarCorreo(correo) {
    if (!correo || typeof correo !== 'string' || !correo.trim()) return 'El correo no puede estar vacío';
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(correo.trim())) return 'El correo debe tener formato válido (usuario@dominio.com)';
    if (/[<>;]|\-\-/.test(correo)) return 'Carácter prohibido no permitido';
    return null;
}

// Confirma si las credenciales existen
router.post('/login', (req, res) => {
    const { correo, contrasena } = req.body;
    const errCorreo = validarCorreo(correo);
    if (errCorreo) return res.status(400).json({ mensaje: errCorreo });

    sesionService.iniciarSesion(correo, contrasena, (error, resultado) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al iniciar sesion' });
        }
        res.json(resultado);
    });
});

router.post('/registro', (req, res) => {
    const { nombre, correo, contrasena } = req.body;
    if (!nombre || !nombre.trim()) return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
    const errCorreo = validarCorreo(correo);
    if (errCorreo) return res.status(400).json({ mensaje: errCorreo });
    if (!contrasena || !contrasena.trim()) return res.status(400).json({ mensaje: 'La contraseña es obligatoria' });

    sesionService.registrarCliente(req.body, (error, cliente) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al registrar cliente' });
        }
        res.status(201).json(cliente);
    });
});

module.exports = router;
