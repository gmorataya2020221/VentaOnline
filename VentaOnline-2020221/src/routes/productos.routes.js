// IMPORTACIONES
const express = require('express');
const productoControlador = require('../controllers/productos.controller');

const md_autenticacion = require('../middlewares/autenticacion');
const md_roles = require('../middlewares/roles');

// RUTAS
const api = express.Router();

// PROVEEDOR
api.post('/agregarProveedor',[md_autenticacion.Auth, md_roles.verAdmin], productoControlador.agregarProveedor);;
api.put('/agregarProveedorAProducto/:idProducto/:idProveedor',[md_autenticacion.Auth, md_roles.verAdmin], productoControlador.agregarProvedorProducto);
api.get('/buscarProductoXProveedor/:idProveedor',[md_autenticacion.Auth, md_roles.verAdmin], productoControlador.buscarProductoXProveedor);
api.put('/editarProveedorProducto/:idProveedor',[md_autenticacion.Auth, md_roles.verAdmin], productoControlador.editarProveedorProducto);
api.put('/eliminarProveedorProducto/:idProveedor',[md_autenticacion.Auth, md_roles.verAdmin], productoControlador.eliminarProveedorProducto);
api.put('/controlStock/:idProducto',md_autenticacion.Auth, productoControlador.stockProducto);
api.get('/productos', productoControlador.ObtenerProductos);
module.exports = api;