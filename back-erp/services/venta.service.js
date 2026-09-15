const db = require('../config/db');

function obtenerResumenVentas(callback) {
    db.query(
        `SELECT COUNT(*) AS ventasHoy,
                COALESCE(SUM(total), 0) AS totalDia,
                COALESCE(SUM(iva), 0) AS ivaAcumulado
         FROM venta
         WHERE DATE(fecha) = CURDATE()`,
        (error, rows) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, rows[0]);
        }
    );
}

function obtenerVentas(clienteId, callback) {
    let sql = `SELECT v.id AS folio,
                COALESCE(v.nombre_cliente, c.nombre, 'Publico general') AS cliente,
                v.total, v.iva,
                CASE WHEN f.id IS NULL THEN 'Pendiente' ELSE 'Facturada' END AS estadoFactura
         FROM venta v
         LEFT JOIN cliente c ON c.id = v.cliente_id
         LEFT JOIN factura f ON f.venta_id = v.id`;

    const parametros = [];
    if (clienteId) {
        sql += ' WHERE v.cliente_id = ?';
        parametros.push(clienteId);
    }
    sql += ' ORDER BY v.fecha DESC';

    db.query(sql, parametros, (error, rows) => {
        if (error) {
            callback(error, null);
            return;
        }
        const ventas = rows.map(v => ({
            folio: v.folio,
            cliente: v.cliente,
            canal: 'Local',
            total: v.total,
            iva: v.iva,
            estadoFactura: v.estadoFactura,
            claseEstado: v.estadoFactura === 'Facturada' ? 'verde' : 'naranja'
        }));
        callback(null, ventas);
    });
}

// inserta el detalle de la venta
function insertarDetalleVenta(ventaId, detalle, indice, callback) {
    if (indice >= detalle.length) {
        callback(null);
        return;
    }

    const item = detalle[indice];

    db.query(
        'INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, ticket) VALUES (?, ?, ?, ?, ?)',
        [ventaId, item.producto_id, item.cantidad, item.precio_unitario, `T-${ventaId}`],
        (error) => {
            if (error) {
                callback(error);
                return;
            }

            db.query(
                'UPDATE producto SET cantidad = cantidad - ? WHERE id = ?',
                [item.cantidad, item.producto_id],
                (error) => {
                    if (error) {
                        callback(error);
                        return;
                    }
                    insertarDetalleVenta(ventaId, detalle, indice + 1, callback);
                }
            );
        }
    );
}

// crea la venta, su detalle, descuenta stock, registra ingreso y factura
function crearVenta(datos, callback) {
    const { cliente_id, nombre_cliente, telefono_cliente, correo_cliente, direccion_entrega, detalle } = datos;

    let subtotal = 0;
    for (const item of detalle) {
        subtotal += item.cantidad * item.precio_unitario;
    }
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    db.beginTransaction((error) => {
        if (error) {
            callback(error, null);
            return;
        }

        db.query(
            `INSERT INTO venta (fecha, total, iva, cliente_id, nombre_cliente, telefono_cliente, correo_cliente, direccion_entrega)
             VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?)`,
            [total, iva, cliente_id || null, nombre_cliente, telefono_cliente, correo_cliente, direccion_entrega],
            (error, resultadoVenta) => {
                if (error) {
                    return db.rollback(() => callback(error, null));
                }

                const ventaId = resultadoVenta.insertId;

                insertarDetalleVenta(ventaId, detalle, 0, (error) => {
                    if (error) {
                        return db.rollback(() => callback(error, null));
                    }

                    db.query(
                        "INSERT INTO movimiento_financiero (tipo_movimiento, monto, fecha, descripcion, venta_id) VALUES ('ingreso', ?, NOW(), 'Venta', ?)",
                        [total, ventaId],
                        (error) => {
                            if (error) {
                                return db.rollback(() => callback(error, null));
                            }

                            // factura XML (pseudo funcional)
                            db.query(
                                "INSERT INTO factura (venta_id, fecha_emision, archivo_xml) VALUES (?, NOW(), ?)",
                                [ventaId, `<factura venta="${ventaId}" total="${total}" iva="${iva}"></factura>`],
                                (error) => {
                                    if (error) {
                                        return db.rollback(() => callback(error, null));
                                    }

                                    db.commit((error) => {
                                        if (error) {
                                            return db.rollback(() => callback(error, null));
                                        }
                                        callback(null, { id: ventaId, total, iva });
                                    });
                                }
                            );
                        }
                    );
                });
            }
        );
    });
}

function obtenerFacturaPorVenta(ventaId, callback) {
    db.query('SELECT * FROM factura WHERE venta_id = ?', [ventaId], (error, rows) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, rows[0] || null);
    });
}

module.exports = {
    obtenerResumenVentas,
    obtenerVentas,
    crearVenta,
    obtenerFacturaPorVenta
};