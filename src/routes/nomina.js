const express = require('express');
const router = express.Router();
const {isLoggedIn, isAdmin, isNomina} = require('../lib/auth');

//Conexión a la base de datos
const pool = require('../database');

router.get('/', isLoggedIn,isNomina, async(req,res) => {
    const empresas = await pool.query('SELECT * FROM empresa');
    const operaciones = await pool.query('SELECT * FROM operacion LEFT JOIN trabajador ON operacion.trabajadorId=trabajador.id JOIN empresa ON trabajador.empresaId = empresa.id WHERE pagado = 0');

    res.render("../views/nomina/index.hbs", {operaciones, empresas});
});

router.post('/pagar', async(req,res) => {
    const {estatusPago, fecha} = req.body;


    await pool.query('UPDATE operacion set pagado = 1, fechaPago = ? WHERE operacionId = ?', [fecha,estatusPago]);

    res.redirect('/nomina');

});

module.exports = router;