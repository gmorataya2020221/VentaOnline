const mongoose = require('mongoose');
const app = require('./app');
const Admin = require('./src/controllers/admin.controller');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/VentaOnline', { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log("Se encuentra conectado a la base de datos.");

    app.listen(3000, function (req, res) {
        console.log("Hola IN6BV, esta corriendo en el puerto 3000!");
       Admin.RegistrarAdmin();
    })

}).catch(error => console.log(error));