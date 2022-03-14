const Usuario = require('../models/usuario.model');
const Carrito = require('../models/carrito.model');
const Productos = require('../models/productos.models');
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

function añadirProductoAcarrito(req, res) {
    var idUsuarioLogueado = req.user.sub
    var parametros = req.body;
    if (parametros.nombre && parametros.cantidad) {

        Carrito.findOne({ IdUser: idUsuarioLogueado }, (err, encontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion1' });
            if (!encontrado) return res.status(500).send({ mensaje: 'Error al encontrar el carrito' });

            Carrito.findById(encontrado._id, (err, carrito) => {

                var si = false;
                var id = null;
                for (let i = 0; i < carrito.Productos.length; i++) {
                    if (parametros.nombre == carrito.Productos[i].idProducto.nombre) {
                        si = true
                        id = carrito.Productos[i]._id
                    } else {
                        si = false
                        id = null
                    }
                }
                if (si == true) {


                    Productos.findOne({ nombre: parametros.nombre }, (err, productoEncontrado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion2' });
                        if (!productoEncontrado) return res.status(500).send({ mensaje: 'El producto no existe' });



                        let cantidadsumada= carrito.Productos[0].cantidad
                        let cantidadsumada2= Number(parametros.cantidad)
                        let cantidadSumanda3 = cantidadsumada +cantidadsumada2 
                                if (productoEncontrado.stock >= cantidadSumanda3) {
                                    Carrito.findOneAndUpdate({ Productos: { $elemMatch: { _id: id } } }, { $inc: { "Productos.$.cantidad": parametros.cantidad } }, { new: true }, (err, CantidadActualiada) => {
                                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                                        if (!CantidadActualiada) return res.status(500).send({ mensaje: 'Error al editar el empleado' });
                                        let cantidadsumada= carrito.Productos[0].cantidad+parametros.cantidad
                                        
            
                                            var BsubTotal = Number(CantidadActualiada.Productos[0].cantidad) * productoEncontrado.precioCU
                                            Carrito.findOneAndUpdate({ Productos: { $elemMatch: { _id: id } } }, { "Productos.$.subTotal": BsubTotal }, { new: true }, (err, ProductoAñadido) => {
                                                if (err) return res.status(500).send({ mensaje: 'Error en la peticion3' });
                                                if (!ProductoAñadido) return res.status(500).send({ mensaje: 'Error al editar el carrit2' });
            
                                                let totalCarritoLocal = 0;
                                                for (let i = 0; i < ProductoAñadido.Productos.length; i++) {
                                                    totalCarritoLocal = totalCarritoLocal + ProductoAñadido.Productos[i].subTotal;
            
                                                }
            
                                                Carrito.findByIdAndUpdate(encontrado._id, { total: totalCarritoLocal }, { new: true }, (err, ProductoNuevo) => {
                                                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion4' });
                                                    if (!ProductoNuevo) return res.status(500).send({ mensaje: 'Error al agregar el total' });
            
                                                    return res.status(200).send({ ProductoAñadido: ProductoNuevo })
                                                })
                                            })
            
                                        
            
                                    })

                                } else {
                                return res.status(200).send({ mensaje: "no hay la cantidad suficiente en stock12" })
                            }
                        


                    })

                } else {

                    Productos.findOne({ nombre: parametros.nombre }, (err, productoEncontrado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion2' });
                        if (!productoEncontrado) return res.status(500).send({ mensaje: 'El producto no existe' });

                        if (productoEncontrado.stock >= parametros.cantidad) {

                            var BsubTotal = Number(parametros.cantidad) * productoEncontrado.precioCU
                            Carrito.findOneAndUpdate({ _id: encontrado._id }, { $push: { Productos: { idProducto: productoEncontrado._id, cantidad: parametros.cantidad, subTotal: BsubTotal } } }, { new: true }, (err, ProductoAñadido) => {
                                if (err) return res.status(500).send({ mensaje: 'Error en la peticion3' });
                                if (!ProductoAñadido) return res.status(500).send({ mensaje: 'Error al editar el carrit2' });

                                let totalCarritoLocal = 0;
                                for (let i = 0; i < ProductoAñadido.Productos.length; i++) {
                                    totalCarritoLocal = totalCarritoLocal + ProductoAñadido.Productos[i].subTotal;

                                }

                                Carrito.findByIdAndUpdate(encontrado._id, { total: totalCarritoLocal }, { new: true }, (err, ProductoNuevo) => {
                                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion4' });
                                    if (!ProductoNuevo) return res.status(500).send({ mensaje: 'Error al agregar el total' });

                                    return res.status(200).send({ ProductoAñadido: ProductoNuevo })
                                })
                            })
                        } else {
                            return res.status(200).send({ mensaje: "no hay la cantidad suficiente en stock" })
                        }
                    })

                }
            }).populate('Productos.idProducto', 'nombre')

        })
    } else {
        return res.status(500).send({ mensaje: 'agregue los parametros obligatorios' });
    }
}

function eliminarProductoCarrito(req, res) {

    const IdProducto = req.params.IdProducto;

        Carrito.findOne({ Productos: { $elemMatch: { _id: IdProducto } } }, (err, CarritoEncontrado)=>{
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!CarritoEncontrado) return res.status(500).send({ mensaje: 'Error al encontrar el Producto' });
            if(CarritoEncontrado.IdUser == req.user.sub){
                Carrito.findOneAndUpdate({ Productos: { $elemMatch: { _id: IdProducto } } },
                    { $pull: { Productos: { _id: IdProducto } } }, { new: true } , (err, ProductoEliminado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                        if (!ProductoEliminado) return res.status(500).send({ mensaje: 'Error al eliminar el Proveedor' });
            
                        return res.status(200).send({ ProductoEliminado: ProductoEliminado.Productos })
                    })
            }else{
                return res.status(200).send({mensaje: "no puede eliminar productos de este carrito"})
            }
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
    añadirProductoAcarrito,
    eliminarProductoCarrito,
    obtenerUsuario
}