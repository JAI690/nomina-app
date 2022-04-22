const express = require('express');
const router = express.Router();
const {isLoggedIn, isAdmin, isNomina} = require('../lib/auth');

//Conexión a la base de datos
const pool = require('../database');

router.get('/', isLoggedIn,isNomina, async(req,res) => {
    const tiempoTranscurrido = Date.now();
    const hoy = new Date(tiempoTranscurrido)
    const ayer = new Date(tiempoTranscurrido-(1000*60*60*24))

    const hoyInicio = new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate())
    const hoy2pm = new Date(hoyInicio.getTime()+((1000*60*60)*14));

    const ayerInicio = new Date(ayer.getFullYear(),ayer.getMonth(),ayer.getDate())
    const ayer2pm = new Date(ayerInicio.getTime()+((1000*60*60)*14));


    const empresas = await pool.query('SELECT * FROM empresa');
    const nominas = await pool.query('SELECT nominas.*, empresa.*, users.nombre FROM nominas LEFT JOIN empresa ON nominas.empresaNombre=empresa.id LEFT JOIN users ON empresa.usersId=users.id WHERE createdAt <= ? AND createdAt >= ?', [hoy2pm,ayer2pm]);
    const ids = nominas.map((nomina) => {return(nomina.idnominas)})
    let operaciones = {}

    if(ids.length > 0){
        operaciones = await pool.query('SELECT op.IMSSpago, op.sueldoNeto, n.semananomina, emp.nombreEmpresa, t.nombre, t.apellidoPaterno, t.apellidoMaterno, t.banco, t.cuenta, t.clabe FROM operacion as op LEFT JOIN nominas as n ON op.nominaId = n.idnominas LEFT JOIN trabajador as t ON op.trabajadorId = t.id LEFT JOIN empresa as emp ON n.empresaNombre=emp.id WHERE op.nominaId IN (?)', [ids])
    }   

    res.render("../views/nomina/verNominas.hbs", {empresas,nominas,operaciones});
});

router.get('/nomina/:id', isLoggedIn,isNomina, async(req,res) => {
    const { id } = req.params
    const operaciones = await pool.query('SELECT * FROM operacion LEFT JOIN trabajador ON operacion.trabajadorId=trabajador.id JOIN empresa ON trabajador.empresaId = empresa.id WHERE pagado = 0 AND nominaId = ?', [id]);
    const nomina = await pool.query('SELECT * FROM nominas WHERE idnominas = ?', [id])
    res.render("../views/nomina/index.hbs", {operaciones,nomina});
});

router.post('/pagar', async(req,res) => {
    const {estatusPago, fecha} = req.body;


    await pool.query('UPDATE operacion set pagado = 1, fechaPago = ? WHERE operacionId = ?', [fecha,estatusPago]);

    res.redirect('/nomina');

});

module.exports = router;