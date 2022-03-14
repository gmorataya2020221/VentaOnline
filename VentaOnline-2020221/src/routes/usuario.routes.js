const express = require('express');
const controladorUsuario = require('../controllers/usuario.controller');
const md_autenticacion = require('../middlewares/autenticacion');
const md_roles = require('../middlewares/roles');

const api = express.Router();
api.post('/registrar',[md_autenticacion.Auth, md_roles.verUsuario], controladorUsuario.Registrar);
api.post('/login',[md_autenticacion.Auth, md_roles.verUsuario], controladorUsuario.Login);
api.get('/buscarNombre/:nombreUsuario',[md_autenticacion.Auth, md_roles.verUsuario], controladorUsuario.BusquedaNombre);
api.get('/buscarNombreRegex/:nombreUsuario',[md_autenticacion.Auth, md_roles.verUsuario], controladorUsuario.BusquedaNombreRegex);
api.get('/buscarNombreRegexBody',[md_autenticacion.Auth, md_roles.verUsuario], controladorUsuario.BusquedaNombreRegexBody);
api.get('/buscarNombreOApellido',[md_autenticacion.Auth, md_roles.verUsuario], controladorUsuario.BusquedaNombreOApellido);
api.get('/buscarNombreYApellido',[md_autenticacion.Auth, md_roles.verUsuario], controladorUsuario.BusquedaNombreYApellido);
api.put('/editarUsuario/:idUsuario',[md_autenticacion.Auth, md_roles.verUsuario], controladorUsuario.editarUsuario);
api.get('/obtenerUsuario',[md_autenticacion.Auth, md_roles.verUsuario], controladorUsuario.obtenerUsuario);
api.put('/agregarProducto',md_autenticacion.Auth,controladorUsuario.añadirProductoAcarrito);
api.delete('/eliminarProducto/:IdProducto',md_autenticacion.Auth,controladorUsuario.eliminarProductoCarrito);


module.exports = api;