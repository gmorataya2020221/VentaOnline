const express = require('express');
const controladorCategoria = require('../controllers/categorias.controller');

// MIDDLEWARES
const md_autenticacion = require('../middlewares/autenticacion');
const md_roles = require('../middlewares/roles');

const api = express.Router();

api.post('/agregarCategoria',[md_autenticacion.Auth, md_roles.verAdmin], controladorCategoria.agregarCategoria);
api.post('/asignarCategoria',[md_autenticacion.Auth, md_roles.verAdmin], controladorCategoria.asignarCategoria);
api.delete('/eliminarCategoria/:idCategoria',[md_autenticacion.Auth, md_roles.verAdmin], controladorCategoria.eliminarCategoriaADefault);
api.put('/editarUsuario/:idCategoria',[md_autenticacion.Auth, md_roles.verAdmin], controladorCategoria.editarCategoria);

module.exports = api;