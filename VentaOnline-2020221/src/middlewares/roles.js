
exports.verAdmin = function(req, res, next) {
    if(req.user.rol !== "ROL_ADMIN") return res.status(403).send({mensaje: "Solo puede acceder el admin"})
    
    next();
}

exports.verUsuario = function(req, res, next) {
    if(req.user.rol !== "USUARIO") return res.status(403).send({mensaje: "Solo puede acceder EL USUARIO"})
    
    next();
}