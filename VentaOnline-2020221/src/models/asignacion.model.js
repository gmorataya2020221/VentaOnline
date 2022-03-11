const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const asignacionSchema = new Schema({
    idCategoria: { type: Schema.Types.ObjectId, ref:'Categorias' },
    idProducto: { type: Schema.Types.ObjectId, ref: 'Productos'}
});

module.exports = mongoose.model('Asignaciones', asignacionSchema);