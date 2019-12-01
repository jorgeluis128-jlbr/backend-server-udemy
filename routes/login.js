var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

// Importar el esquema de usuarios
var Usuario = require('../models/usuario');
var config = require('../config/config');

// ================================================
// Servicio del login del usuario
// ================================================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err)
            return res.status(500).json({
                ok: false,
                mensaje: 'Error el buscar usuario',
                errors: err
            });
        if (!usuarioDB)
            return res.status(400).json({
                ok: false,
                mensaje: `Credenciales incorrectas - email`,
                errors: err
            });
        if (!bcrypt.compareSync(body.password, usuarioDB.password))
            return res.status(400).json({
                ok: false,
                mensaje: `Credenciales incorrectas - password`,
                errors: err
            });

        // Crear token
        usuarioDB.password = '*****';
        var token = jwt.sign({ usuario: usuarioDB }, config.SEED, { expiresIn: 14400 }); // 4 hrs

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });
});

module.exports = app;