const db = require('../config/db');

// calcula el estado del stock segun la cantidad
function calcularEstado(cantidad) {
    if (cantidad <= 0) return { estado: 'Agotado', clase: 'roja' };
    if (cantidad < 10) return { estado: 'Poco stock', clase: 'naranja' };
    return { estado: 'Suficiente', clase: 'verde' };
}

// lista de productos para la pantalla de inventario
function obtenerProductos(callback) {
    db.query('SELECT * FROM producto', (error, rows) => {
        if (error) {
            callback(error, null);
            return;
        }
        const productos = rows.map(p => {
            const { estado, clase } = calcularEstado(p.cantidad);
            return {
                id: p.id,
                producto: p.nombre,
                categoria: p.categoria,
                cantidad: p.cantidad,
                precioUnitario: p.precio,
                estado,
                claseEstado: clase
            };
        });
        callback(null, productos);
    });
}

// lista de productos para la pantalla de compras
function obtenerProductosParaCompra(callback) {
    db.query('SELECT * FROM producto', (error, rows) => {
        if (error) {
            callback(error, null);
            return;
        }
        const productos = rows.map(p => {
            const { estado, clase } = calcularEstado(p.cantidad);
            return {
                id: p.id,
                nombre: p.nombre,
                categoria: p.categoria,
                precio: p.precio,
                estado,
                claseEtiqueta: clase
            };
        });
        callback(null, productos);
    });
}

function agregarProducto(datos, callback) {
    const { nombre, categoria, precio, cantidad } = datos;
    db.query(
        'INSERT INTO producto (nombre, categoria, precio, cantidad, fecha_modificacion, vigencia) VALUES (?, ?, ?, ?, NOW(), 1)',
        [nombre, categoria, precio, cantidad || 0],
        (error, resultado) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, { id: resultado.insertId, ...datos });
        }
    );
}

function editarProducto(id, datos, callback) {
    const { nombre, categoria, precio, cantidad } = datos;
    db.query(
        'UPDATE producto SET nombre = ?, categoria = ?, precio = ?, cantidad = ?, fecha_modificacion = NOW() WHERE id = ?',
        [nombre, categoria, precio, cantidad, id],
        (error) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, { id, ...datos });
        }
    );
}

function eliminarProducto(id, callback) {
    db.query('DELETE FROM producto WHERE id = ?', [id], (error) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, { mensaje: 'Producto eliminado' });
    });
}

module.exports = {
    obtenerProductos,
    obtenerProductosParaCompra,
    agregarProducto,
    editarProducto,
    eliminarProducto
};
