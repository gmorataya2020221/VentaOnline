const Usuario = require('../models/usuario.model');
const Producto = require('../models/productos.models');

const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');


function Registrar(req, res) {
    var parametros = req.body;
    var modeloUsuario = new Usuario();

    if(parametros.nombre && parametros.apellido && parametros.email
        && parametros.password) {
            Usuario.find({ email : parametros.email }, (err, usuarioEncontrados) => {
                if ( usuarioEncontrados.length > 0 ){ 
                    return res.status(500)
                        .send({ mensaje: "Este correo ya se encuentra utilizado" })
                } else {
                    modeloUsuario.nombre = parametros.nombre;
                    modeloUsuario.apellido = parametros.apellido;
                    modeloUsuario.email = parametros.email;
                    modeloUsuario.rol = 'USUARIO';
                    modeloUsuario.imagen = null;
                    modeloUsuario.totalCarrito = 0;

                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        modeloUsuario.password = passwordEncriptada;

                        modeloUsuario.save((err, usuarioGuardado)=>{
                            if(err) return res.status(500)
                                .send({ mensaje : 'Error en la peticion' })
                            if(!usuarioGuardado) return res.status(500)
                                .send({ mensaje: 'Error al guardar el Usuario' })
    
                            return res.status(200).send({ usuario: usuarioGuardado})
                        })
                    })                    
                }
            })
    } else {
        return res.status(404)
            .send({ mensaje : 'Debe ingresar los parametros obligatorios'})
    }

}

function Login(req, res) {
    var parametros = req.body;
    // BUSCAMOS EL CORREO
    Usuario.findOne({ email : parametros.email }, (err, usuarioEncontrado) => {
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
        if (usuarioEncontrado){
            // COMPARAMOS CONTRASENA SIN ENCRIPTAR CON LA ENCRIPTADA
            bcrypt.compare(parametros.password, usuarioEncontrado.password, 
                (err, verificacionPassword) => {//TRUE OR FALSE
                    if (verificacionPassword) {
                        return res.status(200)
                            .send({ token: jwt.crearToken(usuarioEncontrado) })
                    } else {
                        return res.status(500)
                            .send({ mensaje: 'La contrasena no coincide.'})
                    }
                })
        } else {
            return res.status(500)
                .send({ mensaje: 'El usuario, no se ha podido identificar'})
        }
    })
}

function editarUsuario(req, res) {
    var idUser = req.params.idUsuario;
    var parametros = req.body;

    // BORRAR LA PROPIEDAD DE PASSWORD EN EL BODY
    delete parametros.password

    if( req.user.sub !== idUser ) {
        return res.status(500).send({ mensaje: 'No tiene los permisos para editar este Usuario.' });
    }

    Usuario.findByIdAndUpdate(req.user.sub, parametros, {new: true}, (err, usuarioEditado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en  la peticion'});
        if(!usuarioEditado) return res.status(500).send({mensaje: 'Error al editar el Usuario'});

        return res.status(200).send({ usuario: usuarioEditado });
    })
}

// Agregar PRODUCTOS A CARRITO
function agregarProductoCarrito(req, res){
   const parametros = req.body;
   
   Producto.findOne({ nombre : parametros.nombreProducto }, (err, productoEncontrado)=>{
       if(err) return res.status(500).send({ mensaje: 'Error en  la peticion producto'});
       if(!productoEncontrado) return res.status(500).send({ mensaje: 'Erorr al buscar el producto'});

       Usuario.findByIdAndUpdate(req.user.sub, { $push: { carrito: { nombreProducto : parametros.nombreProducto, 
        cantidadComprada : parametros.cantidad, precioUnitario : productoEncontrado.precio } } }, {new : true},
        (err, productoAgregadoCarrito)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en  la peticion del carrito'})
            if(!productoAgregadoCarrito) return res.status(500).send({ mensaje: 'Error al agregar el producto al carrito'});

            let totalCarritoLocal = 0;
            for(let i = 0; i < productoAgregadoCarrito.carrito.length; i++){
                totalCarritoLocal += productoAgregadoCarrito.carrito[i].precioUnitario;
            }

            Usuario.findByIdAndUpdate(req.user.sub, { totalCarrito: totalCarritoLocal }, {new : true},
                (err, totalActualizado)=>{
                    if(err) return res.status(500).send({ mensaje: 'Error en  la peticion total Carrito'});
                    if(!totalActualizado) return res.status(500).send({ mensaje: 'Error al actualizar el total del carrito'});

                    return res.status(200).send({ usuario: totalActualizado})
                })
        })
   })

}

function obtenerUsuario(req, res) {
    Usuario.findById(req.user.sub, (err, usuarioEncontrado)=>{
        let tabla = []
        for(let i = 0; i < usuarioEncontrado.carrito.length; i++){
            // tabla.push(usuarioEncontrado.carrito[i].nombreProducto + ' ' + usuarioEncontrado.carrito[i].precioUnitario)
            tabla.push(`${usuarioEncontrado.carrito[i].nombreProducto} Q.${usuarioEncontrado.carrito[i].precioUnitario}.00`)
        }

        return res.status(200).send({datosImpresos: tabla})
    })
}




// BUSQUEDAS

function BusquedaNombre(req, res) {
    var nomUser = req.params.nombreUsuario;

    Usuario.find({ nombre: nomUser }, (err, usuariosEncontrados) => {
        if(err) return res.status(500).send({ mensaje: 'Error en  la peticion'});
        if(!usuariosEncontrados) return res.status(500)
            .send({ mensaje: 'Error al obtener los usuarios'})

        return res.status(200).send({ usuarios: usuariosEncontrados })
    })
}

function BusquedaNombreRegex(req, res) {
    var nomUser = req.params.nombreUsuario;

    Usuario.find({ nombre: { $regex: nomUser, $options: "i" } }, (err, usuariosEncontrados) => {
        if(err) return res.status(500).send({ mensaje: 'Error en  la peticion'});
        if(!usuariosEncontrados) return res.status(500)
            .send({ mensaje: 'Error al obtener los usuarios'})

        return res.status(200).send({ usuarios: usuariosEncontrados })
    })
}

function BusquedaNombreRegexBody(req, res) {
    var parametros = req.body;

    Usuario.find({ nombre: { $regex: parametros.nombre, $options: "i" } }, (err, usuariosEncontrados) => {
        if(err) return res.status(500).send({ mensaje: 'Error en  la peticion'});
        if(!usuariosEncontrados) return res.status(500)
            .send({ mensaje: 'Error al obtener los usuarios'})

        return res.status(200).send({ usuarios: usuariosEncontrados })
    })
}

function BusquedaNombreOApellido(req, res) {
    var parametros = req.body;

    Usuario.find({ $or: [
        { nombre: { $regex: parametros.nombre, $options: "i" } },
        { apellido: { $regex: parametros.apellido, $options: "i" } }
    ] }, (err, usuariosEncontrados) => {
        if(err) return res.status(500).send({ mensaje: 'Error en  la peticion'});
        if(!usuariosEncontrados) return res.status(500)
            .send({ mensaje: 'Error al obtener los usuarios'})

        return res.status(200).send({ usuarios: usuariosEncontrados })
    })
}

function BusquedaNombreYApellido(req, res) {
    var parametros = req.body;

    Usuario.find({ nombre: parametros.nombre, apellido: parametros.apellido }, 
        { nombre: 1 }, (err, usuariosEncontrados) => {
            if(err) return res.status(500).send({ mensaje: 'Error en  la peticion'});
            if(!usuariosEncontrados) return res.status(500)
                .send({ mensaje: 'Error al obtener los usuarios'})

            return res.status(200).send({ usuarios: usuariosEncontrados })
    })
}

module.exports = {
    Registrar,
    Login,
    editarUsuario,
    BusquedaNombre,
    BusquedaNombreRegex,
    BusquedaNombreRegexBody,
    BusquedaNombreOApellido,
    BusquedaNombreYApellido,
    agregarProductoCarrito,
    obtenerUsuario
}