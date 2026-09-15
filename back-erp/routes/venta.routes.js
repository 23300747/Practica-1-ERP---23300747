const express = require('express');
const router = express.Router();
const ventaService = require('../services/venta.service');

router.get('/resumen', (req, res) => {
    ventaService.obtenerResumenVentas((error, resumen) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar resumen de ventas' });
        }
        res.json(resumen);
    });
});

router.get('/', (req, res) => {
    ventaService.obtenerVentas(req.query.cliente_id, (error, ventas) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar ventas' });
        }
        res.json(ventas);
    });
});

router.post('/', (req, res) => {
    ventaService.crearVenta(req.body, (error, venta) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al registrar venta' });
        }
        res.status(201).json(venta);
    });
});

router.get('/:id/factura', (req, res) => {
    ventaService.obtenerFacturaPorVenta(req.params.id, (error, factura) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar factura' });
        }
        res.json(factura);
    });
});

module.exports = router;