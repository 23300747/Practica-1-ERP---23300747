const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/productos', require('./routes/producto.routes'));
app.use('/api/compras', require('./routes/compra.routes'));
app.use('/api/ventas', require('./routes/venta.routes'));
app.use('/api/empleados', require('./routes/empleado.routes'));
app.use('/api/finanzas', require('./routes/finanza.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/sesion', require('./routes/sesion.routes'));

app.listen(3000, () => {
    console.log('Servidor ejecutandose en http://localhost:3000');
});
