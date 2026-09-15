const express = require('express');
const router = express.Router();
const compraService = require('../services/compra.service');
const productoService = require('../services/producto.service');

// productos que se muestran en la pantalla de compras
router.get('/productos', (req, res) => {
    productoService.obtenerProductosParaCompra((error, productos) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar productos' });
        }
        res.json(productos);
    });
});

router.get('/distribuidores', (req, res) => {
    compraService.obtenerDistribuidores((error, distribuidores) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar distribuidores' });
        }
        res.json(distribuidores);
    });
});

router.post('/distribuidores', (req, res) => {
    compraService.agregarDistribuidor(req.body, (error, distribuidor) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al agregar distribuidor' });
        }
        res.status(201).json(distribuidor);
    });
});

router.get('/', (req, res) => {
    compraService.obtenerCompras((error, compras) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar compras' });
        }
        res.json(compras);
    });
});

router.post('/', (req, res) => {
    compraService.crearCompra(req.body, (error, compra) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al registrar compra' });
        }
        res.status(201).json(compra);
    });
});

module.exports = router;
