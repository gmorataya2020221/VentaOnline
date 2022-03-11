// IMPORTACIONES
const express = require('express');
const productosControlador = require('../controllers/productos.controller');

const md_autenticacion = require('../middlewares/autenticacion');
const md_roles = require('../middlewares/roles');

// RUTAS
const api = express.Router();

// PROVEEDOR
api.post('/agregarProveedor',[md_autenticacion.Auth, md_roles.verAdmin], productosControlador.agregarProveedor);
api.put('/agregarProveedorAProducto/:idProducto/:idProveedor',[md_autenticacion.Auth, md_roles.verAdmin], productosControlador.agregarProvedorProducto)
api.get('/buscarProductoXProveedor/:idProveedor',[md_autenticacion.Auth, md_roles.verAdmin], productosControlador.buscarProductoXProveedor)
api.put('/editarProveedorProducto/:idProveedor',[md_autenticacion.Auth, md_roles.verAdmin], productosControlador.editarProveedorProducto)
api.put('/eliminarProveedorProducto/:idProveedor',[md_autenticacion.Auth, md_roles.verAdmin], productosControlador.eliminarProveedorProducto)

module.exports = api;