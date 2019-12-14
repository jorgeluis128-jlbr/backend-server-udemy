var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipo de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es valido',
            error: { message: 'Sólo se aceptan los tipos: ' + tiposValidos.join(', ') }
        });
    }

    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: 'No se seleccionó ningún archivo',
            error: { message: 'Es necesario seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extesionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos
    var extensionValida = ['jpg', 'jpeg', 'png', 'gif'];
    if (extensionValida.indexOf(extesionArchivo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'La formato del archivo no es valido',
            error: { message: 'Sólo se aceptan archivos con extensión: ' + extensionValida.join(', ') }
        });
    }

    // Nombre del archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extesionArchivo}`;

    // Mover el archivo del remporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                error: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar usuario',
                    error: err
                });
            }
            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = '*****';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar medico',
                    error: err
                });
            }
            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                });
            }

            if (medico.img != null) {
                var pathViejo = './uploads/medicos/' + medico.img;
                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar la imagen del medico',
                        error: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar hospital',
                    error: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }
};

module.exports = app;