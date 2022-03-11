const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const provedorSchema = new Schema({
    nombreProveedor: String,
    direccion: String
})

module.exports = mongoose.model('Proveedores', provedorSchema);