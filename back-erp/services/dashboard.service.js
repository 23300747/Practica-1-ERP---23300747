const db = require('../config/db');

// junta los numeros que se muestran en las tarjetas del dashboard.
function obtenerResumenDashboard(callback) {
    const resultado = {};
    let pendientes = 5;
    let huboError = false;

    function terminarUno(error) {
        if (huboError) return;
        if (error) {
            huboError = true;
            callback(error, null);
            return;
        }
        pendientes -= 1;
        if (pendientes === 0) {
            callback(null, {
                finanzas: { ingresosMes: `$${Number(resultado.finanzas.ingresosMes).toFixed(2)}`, reportes: '---' },
                inventario: { productos: resultado.inventario.totalProductos, stockBajo: resultado.inventario.stockBajo || 0 },
                ventas: { ventasHoy: resultado.ventas.ventasHoy, totalDia: `$${Number(resultado.ventas.totalDia).toFixed(2)}` },
                compras: { proveedores: resultado.compras.proveedores, ordenes: resultado.compras.ordenes },
                rh: { empleados: resultado.rh.empleados, turnosHoy: resultado.rh.turnosHoy }
            });
        }
    }

    db.query(
        `SELECT COALESCE(SUM(CASE WHEN tipo_movimiento = 'ingreso' THEN monto ELSE 0 END), 0) AS ingresosMes
         FROM movimiento_financiero
         WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())`,
        (error, rows) => {
            if (error) return terminarUno(error);
            resultado.finanzas = rows[0];
            terminarUno(null);
        }
    );

    db.query(
        `SELECT COUNT(*) AS totalProductos, SUM(CASE WHEN cantidad < 10 THEN 1 ELSE 0 END) AS stockBajo FROM producto`,
        (error, rows) => {
            if (error) return terminarUno(error);
            resultado.inventario = rows[0];
            terminarUno(null);
        }
    );

    db.query(
        `SELECT COUNT(*) AS ventasHoy, COALESCE(SUM(total), 0) AS totalDia FROM venta WHERE DATE(fecha) = CURDATE()`,
        (error, rows) => {
            if (error) return terminarUno(error);
            resultado.ventas = rows[0];
            terminarUno(null);
        }
    );

    db.query(
        `SELECT (SELECT COUNT(*) FROM distribuidor) AS proveedores, (SELECT COUNT(*) FROM compra) AS ordenes`,
        (error, rows) => {
            if (error) return terminarUno(error);
            resultado.compras = rows[0];
            terminarUno(null);
        }
    );

    db.query(
        `SELECT (SELECT COUNT(*) FROM empleado) AS empleados,
                (SELECT COUNT(*) FROM asistencia WHERE fecha = CURDATE()) AS turnosHoy`,
        (error, rows) => {
            if (error) return terminarUno(error);
            resultado.rh = rows[0];
            terminarUno(null);
        }
    );
}

module.exports = { obtenerResumenDashboard };
