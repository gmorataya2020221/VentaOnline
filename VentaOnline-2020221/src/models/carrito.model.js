const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CarritoSchema = Schema({
    IdUser:{ type: Schema.Types.ObjectId, ref: 'Usuarios'},
    Productos:[
        {idProducto:{ type: Schema.Types.ObjectId, ref: 'Productos'},
        cantidad: Number,
        subTotal:Number}
    ],
    total:Number 
})

module.exports = mongoose.model('Carritos', CarritoSchema)