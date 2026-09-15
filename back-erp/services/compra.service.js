const db = require('../config/db');

function obtenerDistribuidores(callback) {
    db.query('SELECT * FROM distribuidor', callback);
}

function agregarDistribuidor(datos, callback) {
    const { nombre, contacto, direccion } = datos;
    db.query(
        'INSERT INTO distribuidor (nombre, contacto, direccion) VALUES (?, ?, ?)',
        [nombre, contacto, direccion],
        (error, resultado) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, { id: resultado.insertId, ...datos });
        }
    );
}

// inserta el detalle de la compra, sumando el stock
function insertarDetalleCompra(compraId, detalle, indice, totalAcumulado, callback) {
    if (indice >= detalle.length) {
        callback(null, totalAcumulado);
        return;
    }

    const item = detalle[indice];

    db.query(
        'INSERT INTO detalle_compra (compra_id, producto_id, cantidad, precio_compra) VALUES (?, ?, ?, ?)',
        [compraId, item.producto_id, item.cantidad, item.precio_compra],
        (error) => {
            if (error) {
                callback(error, null);
                return;
            }

            db.query(
                'UPDATE producto SET cantidad = cantidad + ? WHERE id = ?',
                [item.cantidad, item.producto_id],
                (error) => {
                    if (error) {
                        callback(error, null);
                        return;
                    }
                    const nuevoTotal = totalAcumulado + item.cantidad * item.precio_compra;
                    insertarDetalleCompra(compraId, detalle, indice + 1, nuevoTotal, callback);
                }
            );
        }
    );
}

// crea la compra, su detalle, suma el stock y registra el egreso en finanzas
function crearCompra(datos, callback) {
    const { distribuidor_id, administrador_id, detalle } = datos;

    db.beginTransaction((error) => {
        if (error) {
            callback(error, null);
            return;
        }

        db.query(
            'INSERT INTO compra (fecha, distribuidor_id, administrador_id) VALUES (NOW(), ?, ?)',
            [distribuidor_id, administrador_id],
            (error, resultadoCompra) => {
                if (error) {
                    return db.rollback(() => callback(error, null));
                }

                const compraId = resultadoCompra.insertId;

                insertarDetalleCompra(compraId, detalle, 0, 0, (error, totalCompra) => {
                    if (error) {
                        return db.rollback(() => callback(error, null));
                    }

                    db.query(
                        "INSERT INTO movimiento_financiero (tipo_movimiento, monto, fecha, descripcion, compra_id) VALUES ('egreso', ?, NOW(), 'Compra a distribuidor', ?)",
                        [totalCompra, compraId],
                        (error) => {
                            if (error) {
                                return db.rollback(() => callback(error, null));
                            }

                            db.commit((error) => {
                                if (error) {
                                    return db.rollback(() => callback(error, null));
                                }
                                callback(null, { id: compraId, total: totalCompra });
                            });
                        }
                    );
                });
            }
        );
    });
}

function obtenerCompras(callback) {
    db.query(
        `SELECT c.id, c.fecha, d.nombre AS distribuidor, a.nombre AS administrador
         FROM compra c
         LEFT JOIN distribuidor d ON d.id = c.distribuidor_id
         LEFT JOIN administrador a ON a.id = c.administrador_id
         ORDER BY c.fecha DESC`,
        callback
    );
}

module.exports = {
    obtenerDistribuidores,
    agregarDistribuidor,
    crearCompra,
    obtenerCompras
};
