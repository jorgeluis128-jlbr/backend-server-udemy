var jwt = require('jsonwebtoken');

// Archivo de cosntantes
var config = require('../config/config');

// ================================================
// Verificación de token
// ================================================

exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, config.SEED, (err, decoded) => {
        if (err)
            return res.status(401).json({
                ok: false,
                mensaje: 'Acceso no permitido al recurso solicitado',
                errors: err
            });
        req.usuario = decoded.usuario;
        next();
        /* res.status(200).json({
            ok: true,
            decoded: decoded
        }); */
    });
};