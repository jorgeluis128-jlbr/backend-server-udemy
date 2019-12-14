var express = require('express');
var mdAutentificacion = require('../middlewares/autentificacion');

var app = express();

// Importar el esquema de usuarios
var Hospital = require('../models/hospital');

// ================================================
// Obtener todos los hospitales
// ================================================
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({}, 'nombre img usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err)
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            });
});
// ================================================
// Servicio para crear hospitales
// ================================================
app.post('/', mdAutentificacion.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });
    hospital.save((err, hospitalGuardado) => {
        if (err)
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar el hospital',
                errors: err
            });
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

// ================================================
// Servicio para actualizar hospitales
// ================================================
app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${id} no existe`,
                errors: { message: 'No existe un hopsital con ese ID' }
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalActualizado
            });
        });
    });
});
// ================================================
// Servicios para eliminar usuario por ID
// ================================================
app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err)
            return res.status(500).json({
                ok: false,
                mensaje: 'Ocurrió un error al tratar de borrar el hospital',
                errors: err
            });
        if (!hospitalBorrado)
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hopsital con ese ID',
                errors: { message: `No se encontraron coincidencias con el ID ${id}` }
            });
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;