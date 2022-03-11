const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = Schema({
    usuario:String,
    password: String,
    rol:String
});

module.exports = mongoose.model('Admin', AdminSchema);