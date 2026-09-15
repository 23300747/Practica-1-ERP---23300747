const db = require('../config/db');

// checa credenciales
function iniciarSesion(correo, contrasena, callback) {
    db.query(
        'SELECT id, nombre, correo FROM administrador WHERE correo = ? AND contrasena = ?',
        [correo, contrasena],
        (error, admins) => {
            if (error) {
                callback(error, null);
                return;
            }
            if (admins.length > 0) {
                callback(null, { existe: true, rol: 'administrador', usuario: admins[0] });
                return;
            }

            db.query(
                'SELECT id, nombre, correo FROM cliente WHERE correo = ? AND contrasena = ?',
                [correo, contrasena],
                (error, clientes) => {
                    if (error) {
                        callback(error, null);
                        return;
                    }
                    if (clientes.length > 0) {
                        callback(null, { existe: true, rol: 'cliente', usuario: clientes[0] });
                        return;
                    }
                    callback(null, { existe: false });
                }
            );
        }
    );
}

// Nueva cuenta
function registrarCliente(datos, callback) {
    const { nombre, correo, contrasena, telefono, direccion } = datos;
    db.query(
        'INSERT INTO cliente (nombre, correo, contrasena, telefono, direccion) VALUES (?, ?, ?, ?, ?)',
        [nombre, correo, contrasena, telefono, direccion],
        (error, resultado) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, { id: resultado.insertId, nombre, correo });
        }
    );
}

module.exports = { iniciarSesion, registrarCliente };
