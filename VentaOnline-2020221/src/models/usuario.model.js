const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsuarioSchema = Schema({
    usuario:String,
    email: String,
    password: String,
    rol: String,
    empresa:String
});

module.exports = mongoose.model('Usuarios', UsuarioSchema);