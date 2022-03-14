const express = require('express');
const CarritoControlador = require('../controllers/carrito.controller');
const md_autenticacion = require('../middlewares/autenticacion');

const api = express.Router();

api.put('/agregarProducto',md_autenticacion.Auth,CarritoControlador.añadirProductoAcarrito);
api.delete('/eliminarProducto/:IdProducto',md_autenticacion.Auth,CarritoControlador.eliminarProductoCarrito);
module.exports = api;