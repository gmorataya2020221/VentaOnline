const express = require('express');
const cors = require('cors');
var app = express();

const UsuarioRutas = require('./src/routes/usuario.routes');
const CategoriaRutas = require('./src/routes/categorias.routes');
const ProductoRutas = require('./src/routes/productos.routes');
const FacturatoRutas = require('./src/routes/factura.routes');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());

app.use('/api', UsuarioRutas, CategoriaRutas, ProductoRutas,FacturatoRutas);


module.exports = app;