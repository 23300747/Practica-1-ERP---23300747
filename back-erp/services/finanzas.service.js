const db = require('../config/db');

// trae todos los movimientos financieros
function obtenerMovimientos(callback) {
    db.query('SELECT * FROM movimiento_financiero ORDER BY fecha DESC', callback);
}

// suma ingresos y egresos del mes actual para el balance general
function obtenerResumenMes(callback) {
    const sql = `
        SELECT
            SUM(CASE WHEN tipo_movimiento = 'ingreso' THEN monto ELSE 0 END) AS ingresos,
            SUM(CASE WHEN tipo_movimiento = 'egreso' THEN monto ELSE 0 END) AS egresos
        FROM movimiento_financiero
        WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())
    `;
    db.query(sql, callback);
}

// inserta un movimiento manual
function registrarMovimiento(movimiento, callback) {
    const { tipo_movimiento, monto, descripcion } = movimiento;
    db.query(
        `INSERT INTO movimiento_financiero (tipo_movimiento, monto, fecha, descripcion)
         VALUES (?, ?, NOW(), ?)`,
        [tipo_movimiento, monto, descripcion],
        callback
    );
}

module.exports = {
    obtenerMovimientos,
    obtenerResumenMes,
    registrarMovimiento
};
