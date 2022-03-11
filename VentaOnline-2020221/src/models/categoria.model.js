const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriaSchema = new Schema({
    nombreCategoria: String,
    idUsuario: { type: Schema.Types.ObjectId, ref: 'Productos' }
})

module.exports = mongoose.model('Categorias', categoriaSchema);