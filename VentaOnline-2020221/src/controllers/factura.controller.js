const Factura = require('../models/factura.model');
const Producto = require('../models/Producto.model');
const Carrito = require('../models/carrito.model');
const Categorias = require('../models/Categoria.model');
const PDF = require('pdfkit');
const fs = require('fs');

function CarritoAFactura(req,res) {
    var modeloFactura = Factura();

    Carrito.findOne({IdUser:req.user.sub},(err,CarritoEncontrado) => {
        if(err) return res.status(500).send({error:"error en la petición"});
        if(!CarritoEncontrado) return res.status(500).send({error:"Carrito no encontrado"});
        if(CarritoEncontrado.Productos.length != 0){

        modeloFactura.IdUser = CarritoEncontrado.IdUser
        modeloFactura.total = CarritoEncontrado.total

        modeloFactura.save((err, facturaAgregada) => {
            if(err) return res.status(500).send({error:"error en la peticion"})

            for (let i = 0; i < CarritoEncontrado.Productos.length; i++) {
                var _idProd = CarritoEncontrado.Productos[i]._id
                var idProducto = CarritoEncontrado.Productos[i].idProducto
                var cantidad = CarritoEncontrado.Productos[i].cantidad
                var subTotal = CarritoEncontrado.Productos[i].subTotal
                var idFacturaAgregada = facturaAgregada._id
                console.log(facturaAgregada._id)
                
                Factura.findByIdAndUpdate(idFacturaAgregada, { $push: { Productos: { idProducto: idProducto, cantidad: cantidad, subTotal:subTotal} } }, { new: true }, (err, empleadoAgregado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en  la peticion' });
                    if (!empleadoAgregado) return res.status(500).send({ mensaje: 'Error al agregar empleado en empresa' });
                })
                var stockAct = cantidad*-1
                console.log({stockAct: stockAct})
                Producto.findByIdAndUpdate(idProducto,{ $inc : {stock : stockAct} },{new: true},(err,stockEdit) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en  la peticion' });
                    if(!stockEdit) return res.status(500).send({ mensaje: 'Error al editar el stock del producto' });
                    
                })

                Carrito.findOneAndUpdate({ Productos: { $elemMatch: { _id : _idProd } } },
                    { $pull: { Productos: { _id: _idProd } } }, { new: true }, (err, CarritoLimpio) => {
                        console.log(err)
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                        if (!CarritoLimpio) return res.status(500).send({ mensaje: 'Error al eliminar el Proveedor' });
                    })
                    Carrito.findByIdAndUpdate(CarritoEncontrado._id,{total:0}, { new: true }, (err, CarritoLimpio) => {
                            console.log(err)
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                            if (!CarritoLimpio) return res.status(500).send({ mensaje: 'Error al eliminar el Proveedor' });
                
                            console.log({ CarritoLimpio: CarritoLimpio , idproducto: _idProd})
                        })
                }
    
        })
            
        }else{
            return res.status(500).send({message:"no puede generar una factura sin productos"})
        };

        
        

        let tabla = []
        let precio1 = 0; 
        let precio2 = 0; 
        let precio3 = 0; 
        tabla.push(`Nombre del Cliente: ${CarritoEncontrado.IdUser.nombre}` )
            for (let i = 0; i < CarritoEncontrado.Productos.length; i++) {
                precio1 = Number(CarritoEncontrado.Productos[i].cantidad)
                precio2 = Number(CarritoEncontrado.Productos[i].subTotal)
                precio3 = precio2/precio1
                tabla.push(`\n\nProducto #${i+1}: ${CarritoEncontrado.Productos[i].idProducto.nombre}, \nCantidad: ${CarritoEncontrado.Productos[i].cantidad}, \nPrecio unitario: Q.${precio3}.°°, \nSubTotal: ${CarritoEncontrado.Productos[i].subTotal}`)
            }
            tabla.push(`\n\nTotal a pagar: Q.${CarritoEncontrado.total}.°°` )
            var doc = new PDF();
            doc.pipe(fs.createWriteStream('pdf/Factura' + CarritoEncontrado.IdUser.nombre + '.pdf'))
            doc.fillColor('gray').fontSize(24).text("Factura " + CarritoEncontrado.IdUser.nombre, {
                align: "center"
            })

            doc.fillColor('black').fontSize(12).text(tabla,{ column: 3})
           
            doc.end();

            return res.status(200).send({ mensaje: "archivo generado", factura: tabla});
        
    }).populate('IdUser','nombre').populate('Productos.idProducto','nombre')
    
}

function VerFacturasUser(req,res){

    if(req.user.rol == "ADMIN"){
        Factura.find({},{_id:0,__v:0},(err, facturasEncontradas)=>{
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion'})
            if(!facturasEncontradas) return res.status(500).send({ mensaje: 'Error al encontrar facturas'})

            
            let tabla1 = []
                for (let i = 0; i < facturasEncontradas.length; i++) {
                        tabla1.push(`\n\nNombre del Cliente: ${facturasEncontradas[i].IdUser.nombre} ` )
                        tabla1.push(`\nProductos comprados: ${facturasEncontradas[i].Productos}, \nTotal de la factura: Q.${facturasEncontradas[i].total}.°°`)
                        tabla1.push(`\n-----------------------------------------------------------------`)
                        
                           
                }
                
                console.log(tabla1)
                var doc = new PDF();
                doc.pipe(fs.createWriteStream('pdf/FacturasUsuarios.pdf'))
                doc.fillColor('gray').fontSize(24).text("FacturasUsuarios", {
                    align: "center"
                })

                doc.fillColor('black').fontSize(12).text(tabla1,{ column: 1})
            
                doc.end();

                return res.status(200).send({ mensaje: "cree un pdf con para que se vieran de una mejor manera los datos obtenidos ", facturasUsuarios: tabla1});
                //console.log(facturasEncontradas.length,facturasEncontradas)
           
            return res.status(200).send({facturasUsuarios   :tabla1})
        }).populate('IdUser','nombre').populate('Productos.idProducto','nombre')

    }else{
        return res.status(500).send({message: "no puede ver las facturas ya que no es un administrador"})
    }
                        
}

function ProductosFactura(req,res) {
    var idFac = req.params.idFactura
    if(req.user.rol == "ADMIN"){
        Factura.findById(idFac,{__v:0},(err, facturasEncontradas)=>{
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion'})
            if(!facturasEncontradas) return res.status(500).send({ mensaje: 'Error al encontrar facturas'})

            return res.status(200).send({productos   :facturasEncontradas.Productos})
        }).populate('IdUser','nombre').populate('Productos.idProducto','nombre')

    }else{
        return res.status(500).send({message: "no puede ver las facturas ya que no es un administrador"})
    }
}

function ProductosAgotados(req,res) {
    if(req.user.rol == "ADMIN"){
        Producto.find({stock:0},{__v:0},(err, ProductosEncontrados)=>{
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion'})
            if(!ProductosEncontrados) return res.status(500).send({ mensaje: 'Error al encontrar facturas'})

            return res.status(200).send({productos   :ProductosEncontrados})
        }).populate('IDcategoria','nombre')

    }else{
        return res.status(500).send({message: "no puede ver los productos agotados porque no es un administrador"})
    }
}
//cliente y facturas
function ProductosMasVendidos(req,res) {
        // no estoy seguro si era esto lo que pedia, pero qui muestro los productos que se vendieron por lo tanto serian los mas vendidos
        Factura.find({},(err,ProductosMasVendidos) => {

            let tabla = []
            for (let i = 0; i < ProductosMasVendidos.length; i++) {
                tabla.push(`productos: ${ProductosMasVendidos[i].Productos}`)
            }
            
            return res.status(200).send({productosMasVendidos:tabla})

        }).populate('IdUser','nombre').populate('Productos.idProducto','nombre')

    
}
//cliente

function BusquedaNombreProducto(req, res) {
    var parametros = req.body;

    Producto.find({ nombre: { $regex: parametros.nombre, $options: "i" } }, (err, ProductosEncontrados) => {
        if(err) return res.status(500).send({ mensaje: 'Error en  la peticion'});
        if(!ProductosEncontrados) return res.status(500)
            .send({ mensaje: 'Error al obtener los usuarios'})

        return res.status(200).send({ usuarios: ProductosEncontrados })
    }).populate('IDcategoria','nombre')
}

function ProductosPorCategoria(req,res) {
    var parametros = req.body;

    Categorias.findOne({nombre: { $regex: parametros.nombre, $options: "i" } },(err,categoriaEncontrada) => {
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if(!categoriaEncontrada) return res.status(500).send({ mensaje: 'la categoria no existe' })
        console.log(categoriaEncontrada)
        if(categoriaEncontrada){

            Producto.find({IDcategoria:categoriaEncontrada._id },(err,ProductosEncontrados)=>{
                if(err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if(!ProductosEncontrados) return res.status(500).send({ mensaje: 'Error al mostrar los productos' })
                return res.status(200).send({ ProductosCategoria:ProductosEncontrados })  
            })

        }

    })
}






module.exports={
    CarritoAFactura,
    VerFacturasUser,
    ProductosFactura,
    ProductosAgotados,
    ProductosMasVendidos,
    BusquedaNombreProducto,
    ProductosPorCategoria
}