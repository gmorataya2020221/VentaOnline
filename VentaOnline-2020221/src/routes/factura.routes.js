const express = require('express');
const facturaCotroller = require('../controllers/factura.controller');
const md_autenticacion = require('../middlewares/autenticacion');

const api = express.Router();
api.get('/factura',md_autenticacion.Auth,facturaCotroller.CarritoAFactura)
api.get('/facturasExistentes',md_autenticacion.Auth,facturaCotroller.VerFacturasUser)
api.get('/ProductosMasVendidos',facturaCotroller.ProductosMasVendidos)
api.get('/ProductosMasVendidos',facturaCotroller.ProductosMasVendidos)
api.get('/ProductosDeUnaFactura/:idFactura',md_autenticacion.Auth,facturaCotroller.ProductosFactura)
api.get('/ProductosAgotados',md_autenticacion.Auth,facturaCotroller.ProductosAgotados)
api.post('/ProductoPorNombre',facturaCotroller.BusquedaNombreProducto)
api.post('/ProductosPorCategoria',facturaCotroller.ProductosPorCategoria)

module.exports = api;