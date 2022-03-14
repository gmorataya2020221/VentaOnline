const Productos = require('../models/productos.models');
const Proveedor = require('../models/proveedor.model');


function ObtenerProductos (req, res) {
    Productos.find({}, (err, productosEncontrados) => {
        let tabla = []
            for (let i = 0; i < productosEncontrados.length; i++) {
                tabla.push(`Nombre: ${productosEncontrados[i].nombre}, 
                Disponibles: ${productosEncontrados[i].stock},
                Precio Unitario: ${productosEncontrados[i].precioCU},
                Categoria: ${productosEncontrados[i].IDcategoria.nombre}`)
            }
        return res.status(200).send({ productos: tabla })
    }).populate('IDcategoria','nombre')
}

// AGREGAR PRODUCTOS
function AgregarProductos (req, res) {
    var parametros = req.body;
    var modeloProductos = new Productos();
    
    if( parametros.nombre && parametros.cantidad && parametros.precio ){
        modeloProductos.nombre = parametros.nombre;
        modeloProductos.sabores = [];
        modeloProductos.cantidad = parametros.cantidad;
        modeloProductos.precio = parametros.precio;

        modeloProductos.save((err, productoGuardado)=>{

            return res.send({ productos: productoGuardado});
        });
    } else {
        return res.send({ mensaje: "Debe enviar los parametros obligatorios."})
    }


}

function EditarProductos(req, res) {
    var idProd = req.params.idProducto;
    var parametros = req.body;

    Productos.findByIdAndUpdate(idProd, parametros, { new : true } ,(err, productoEditado)=>{
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(!productoEditado) return res.status(404)
            .send({ mensaje: 'Error al Editar el Producto' });

        return res.status(200).send({ productos: productoEditado});
    })
}

function EliminarProductos(req, res) {
    var idProd = req.params.idProducto;

    Productos.findByIdAndDelete(idProd, (err, productoEliminado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(!productoEliminado) return res.status(500)
            .send({ mensaje: 'Error al eliminar el producto' })

        return res.status(200).send({ producto: productoEliminado });
    })
}

// Incrementar stock productos
function stockProducto(req, res) {
    const productoId = req.params.idProducto;
    const parametros = req.body;

    Productos.findByIdAndUpdate(productoId, { $inc : {cantidad : parametros.cantidad} }, {new : true},
        (err, stockModificado)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
            if(!stockModificado) return res.status(500).send({mensaje: 'Error incrementar la cantidad del producto'});

            return res.status(200).send({ producto: stockModificado })
        })


}



function agregarProveedor(req, res) {
    const parametros = req.body;
    const modeloProveedor = new Proveedor();

    if(parametros.nombreProveedor && parametros.direccion){

        modeloProveedor.nombreProveedor = parametros.nombreProveedor;
        modeloProveedor.direccion = parametros.direccion;

        modeloProveedor.save((err, proveedorGuardado) => {
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
            if(!proveedorGuardado) return res.status(500).send({ mensaje: 'Error al guardar el proveedor'});

            return res.status(200).send({ proveedor: proveedorGuardado})
        })

    } else {
        return res.status(404).send({ mensaje: 'Debe enviar los parametros Obligatorios'});
    }


}

function agregarProvedorProducto(req, res) {
    var productoId = req.params.idProducto;
    var proveedorId = req.params.idProveedor;

    Productos.findByIdAndUpdate(productoId, { $push: {  provedores : { idProveedor: proveedorId } } }, {new : true}, 
        (err, proveedorAgregado) => {
            if(err) return res.status(500).send({ mensaje: 'Error en  la peticion'});
            if(!proveedorAgregado) return res.status(500).send({ mensaje: 'Error al agregar el proveedor al producto'});

            return res.status(200).send({ product: proveedorAgregado });
        })
}

function editarProveedorProducto(req, res) {
    const proveedorId = req.params.idProveedor;
    const parametros = req.body;

    Productos.findOneAndUpdate({ provedores: { $elemMatch: { _id: proveedorId } } }, 
        { "provedores.$.idProveedor" : parametros.proveedor }, {new : true}, (err, proveedorActualizado)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
            if(!proveedorActualizado) return res.status(500).send({ mensaje: 'Error al editar el proveedor'});

            return res.status(200).send({ producto: proveedorActualizado })
        })
}

function eliminarProveedorProducto(req, res){
    const proveedorId = req.params.idProveedor;

    Productos.findOneAndUpdate({ provedores : { $elemMatch : { _id: proveedorId } } }, 
        { $pull : { provedores : { _id : proveedorId } } }, {new : true}, (err, proveedorEliminado)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
            if(!proveedorEliminado) return res.status(500).send({ mensaje: 'Error al eliminar el Proveedor'});

            return res.status(200).send({producto : proveedorEliminado})
        })
}


function buscarProductoXProveedor(req, res) {
    const proveedorId = req.params.idProveedor;

    Productos.find({ provedores : { $elemMatch: { _id: proveedorId } } }, (err, productosEncontrados)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en  la peticion'});
        if(!productosEncontrados) return res.status(500).send({ mensaje: 'Error al obtener los productos por proveedor'});

        return res.status(200).send({ productos: productosEncontrados })
    })
    
}

module.exports = {
    ObtenerProductos,
    AgregarProductos,
    EditarProductos,
    EliminarProductos,
    agregarProveedor,
    agregarProvedorProducto,
    buscarProductoXProveedor,
    stockProducto,
    editarProveedorProducto,
    eliminarProveedorProducto
}