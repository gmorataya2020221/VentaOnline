const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriaSchema = new Schema({
    nombreCategoria: String
})

module.exports = mongoose.model('Categorias', categoriaSchema);