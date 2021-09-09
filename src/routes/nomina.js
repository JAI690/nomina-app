const express = require('express');

const router = express.Router();

//Conexión a la base de datos
const pool = require('../database');

router.get('/', async(req,res) => {
    const ejecutivos = await pool.query('SELECT * FROM users WHERE rol = "Ejecutivo"');
    const operaciones = await pool.query('SELECT * FROM operacion LEFT JOIN trabajador ON operacion.trabajadorId=trabajador.id JOIN empresa ON trabajador.empresaId = empresa.id WHERE pagado = 0');

    res.render("../views/nomina/index.hbs", {operaciones, ejecutivos});
});

router.post('/pagar', async(req,res) => {
    const {estatusPago} = req.body;

    await pool.query('UPDATE operacion set pagado = 1 WHERE operacionId = ?', [estatusPago]);

    res.redirect('/nomina');

});

module.exports = router;