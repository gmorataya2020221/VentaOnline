const Categoria = require('../models/categoria.model');
const Asignacion = require('../models/asignacion.model');

function obtenerCategorias(req,res) {
    
    Categorias.find({},(err,CategoriasGuardadas) => {
        if (err) return res.status(500).send({error: "error en la peticion"})
        if(!CategoriasGuardadas) return res.status(500).send({mensaje: "error al obtener las categorias"})

        let tabla = []
            for (let i = 0; i < CategoriasGuardadas.length; i++) {
                
                tabla.push(`Nombre: ${CategoriasGuardadas[i].nombre}`)
            }


        return res.status(200).send({Categorias: tabla})
    })
}

function agregarCategoria(req, res) {
    const parametros = req.body;
    const modeloCategoria = new Categoria();

    // if( req.user.rol == 'ROL_MAESTRO' )

    if(parametros.nombreCategoria){

        modeloCategoria.nombreCategoria = parametros.nombreCategoria;

        modeloCategoria.save((err, categoriaGuardada) => {
            if(err) return res.status(400).send({ mensaje: 'Erorr en la peticion.' });
            if(!categoriaGuardada) return res.status(400).send({ mensaje: 'Error al agregar la categoria.'});

            return res.status(200).send({ categoria: categoriaGuardada });
        })

    } else {
        return res.status(400).send({ mensaje: 'Debe enviar los parametros obligatorios.' })
    }
}


function asignarCategoria(req, res){
    const parametros = req.body;
    const usuarioLogeado = req.user.sub;

    if( parametros.nombreCategoria ){

        Asignacion.find({ idProducto : usuarioLogeado }).populate('idCategoria').exec((err, asignacionesEncontradas) => {
            if( asignacionesEncontradas.length >= 3 ) return res.status(400)
                .send({ mensaje: 'Ya se asigno al maximo de categorías, que son 3 categorías por producto.'});
            
            for (let i = 0; i < asignacionesEncontradas.length; i++) {
                if( asignacionesEncontradas[i].idCategoria.nombreCategoria == parametros.nombreCategoria) return res.status(400)
                    .send({ mensaje: 'Ya se encuentra asignado a esta categoria.' })
            }

            Categoria.findOne( { nombreCategoria: parametros.nombreCategoria }, (err, categoriaEncontrada) =>{
                if(err) return res.status(400).send({ mensaje: 'Erorr en la peticion de obtener categoria'});
                if(!categoriaEncontrada) return res.status(400).send({ mensaje: 'Error al obtener la categoria'});

                const modeloAsignacion = new Asignacion();
                modeloAsignacion.idCategoria = categoriaEncontrada._id;
                modeloAsignacion.idProducto = usuarioLogeado;

                modeloAsignacion.save((err, asignacionCreada) => {
                    if(err) return res.status(400).send({ mensaje: 'Error en la peticion de agregar asignacion' });
                    if(!asignacionCreada) return res.status(400).send({ mensaje: 'Error al agregar asignacion'});

                    return res.status(200).send({ asignacion: asignacionCreada})
                })
            })


        })

    } else{
        return res.status(400).send({ mensaje: 'Debe enviar los parametros obligatorios.'});
    }
}


function eliminarCategoriaADefault(req, res) {
    const categoriaId = req.params.idCategoria;

    Categoria.findOne({ _id: categoriaId, idProducto: req.user.sub }, (err, categoria)=>{
        if(!categoria){
            return res.status(400).send({ mensaje: 'No puede editar categorias que no fueron creados por su persona'});
        } else {
            Categoria.findOne({ nombreCategoria : 'Por Defecto' }, (err, categoriaEncontrada) => {
                if(!categoriaEncontrada){

                    const modeloCategoria = new Categoria();
                    modeloCategoria.nombreCategoria = 'Por Defecto';

                    modeloCategoria.save((err, categoriaGuardada)=>{
                        if(err) return res.status(400).send({ mensaje: 'Error en la peticion de Guardar categoria'});
                        if(!categoriaGuardada) return res.status(400).send({ mensaje: 'Error al guardar la categoria'});

                        Asignacion.updateMany({ idCategoria: categoriaId }, { idCategoria: categoriaGuardada._id }, 
                            (err, asignacionesEditadas) => {
                                if(err) return res.status(400)
                                    .send({ mensaje: 'Error en la peticion de actualizar asignaciones'});
                                
                                Categoria.findByIdAndDelete(categoriaId, (err, categoriaEliminada)=>{
                                    if(err) return res.status(400).send({ mensaje: "Error en la peticion de eliminar categoria"});
                                    if(!categoriaEliminada) return res.status(400).send({ mensaje: 'Error al eliminar la categoria'});

                                    return res.status(200).send({ 
                                        editado: asignacionesEditadas,
                                        eliminado: categoriaEliminada
                                    })
                                })
                            })
                    })

                } else {

                    Asignacion.updateMany({ idCategoria: categoriaId }, { idCategoria: categoriaEncontrada._id }, 
                        (err, asignacionesActualizadas) => {
                            if(err) return res.status(400).send({ mensaje:"Error en la peticion de actualizar asignaciones"});

                            Categoria.findByIdAndDelete(categoriaId, (err, CategoriaEliminada)=>{
                                if(err) return res.status(400).send({ mensaje: "Error en la peticion de eliminar categoria"});
                                if(!CategoriaEliminada) return res.status(400).send({ mensaje: "Error al eliminar la categoria"});

                                return res.status(200).send({ 
                                    editado: asignacionesActualizadas,
                                    eliminado: CategoriaEliminada
                                })
                            })
                        })

                }
            })
        }
    })


}

function editarCategoria(req, res) {
    var idCat = req.params.idCategoria;
    var parametros = req.body;    

    if ( idCat !== req.user.sub ) return res.status(500)
        .send({ mensaje: 'No puede editar categoría'});

    Usuario.findByIdAndUpdate(req.user.sub, parametros, {new : true},
        (err, categoriaActualizada)=>{
            if(err) return res.status(500)
                .send({ mensaje: 'Error en la peticion' });
            if(!categoriaActualizada) return res.status(500)
                .send({ mensaje: 'Error al editar categoría'});
            
            return res.status(200).send({usuario : categoriaActualizada})
        })
}

module.exports = {
    obtenerCategorias,
    agregarCategoria,
    asignarCategoria,
    eliminarCategoriaADefault,
    editarCategoria
}