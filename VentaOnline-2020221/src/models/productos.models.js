const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductosSchema = Schema({
    nombre: String,
    sabores: [],
    provedores: [{
        idProveedor: { type: Schema.Types.ObjectId, ref: 'Proveedores'}
    }],
    cantidad: Number,
    precio: Number
})

module.exports = mongoose.model('Productos', ProductosSchema)