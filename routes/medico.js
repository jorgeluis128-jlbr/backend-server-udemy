var express = require('express');
var mdAutentificacion = require('../middlewares/autentificacion');

var app = express();

// Importar el esquema de usuarios
var Medico = require('../models/medico');

// ================================================
// Consulta todos los medicos
// ================================================
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({}, 'nombre img usuario hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err)
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                });
            });
});
// ================================================
// Servicio para crear medicos
// ================================================
app.post('/', mdAutentificacion.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    medico.save((err, medicopGuardado) => {
        if (err)
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar el medico',
                errors: err
            });
        res.status(201).json({
            ok: true,
            medico: medicopGuardado
        });
    });
});
// ================================================
// Servicio para actualizar el registro del medico
// ================================================
app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `El medico con el id ${id} no existe`,
                errors: { message: 'No existe un medico con ese ID' }
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        medico.save((err, medicoActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoActualizado
            });
        });
    });
});
// ================================================
// Servicios para eliminar el registro de un medico por ID
// ================================================
app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err)
            return res.status(500).json({
                ok: false,
                mensaje: 'Ocurrió un error al tratar de borrar el medico',
                errors: err
            });
        if (!medicoBorrado)
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: { message: `No se encontraron coincidencias con el ID ${id}` }
            });
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;