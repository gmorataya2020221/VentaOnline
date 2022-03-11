// IMPORTACIONES
const express = require('express');
const productosControlador = require('../controllers/productos.controller');

const md_autenticacion = require('../middlewares/autenticacion');
const md_roles = require('../middlewares/roles');

// RUTAS
const api = express.Router();

api.get('/productos',[md_autenticacion.Auth, md_roles.verAdmin], productosControlador.ObtenerProductos);
api.post('/agregarProductos',[md_autenticacion.Auth, md_roles.verAdmin], productosControlador.AgregarProductos);
api.put('/editarProducto/:idProducto',[md_autenticacion.Auth, md_roles.verAdmin], productosControlador.EditarProductos);
api.delete('/eliminarProducto/:idProducto',[md_autenticacion.Auth, md_roles.verAdmin], productosControlador.EliminarProductos);
api.put('/controlStock/:idProducto',[md_autenticacion.Auth, md_roles.verAdmin], productosControlador.stockProducto);