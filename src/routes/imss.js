const express = require('express');
const router = express.Router();

const {isLoggedIn, isAdmin, isImss} = require('../lib/auth');

//Conexión a la base de datos
const pool = require('../database');

router.get('/', isLoggedIn, isImss, async(req,res) => {
    const empresas = await pool.query('SELECT * FROM empresa');
    //const operaciones = await pool.query('SELECT * FROM operacion LEFT JOIN trabajador ON operacion.trabajadorId=trabajador.id JOIN empresa ON trabajador.empresaId = empresa.id');
    const trabajadores = await pool.query('SELECT trabajador.*, empresa.nombreEmpresa FROM trabajador LEFT JOIN empresa ON trabajador.empresaId=empresa.id WHERE estatus = 1 AND sueldoIMSS != 0');
    const pendientes = await pool.query('SELECT * FROM trabajador WHERE sueldoIMSS = 0 AND estatus = 1');
    res.render("../views/imss/index.hbs", {empresas, trabajadores, pendientes});
});

router.get('/editar/:id',isLoggedIn, isImss, async(req,res) => {
    const { id } = req.params;
    const ejecutivos = await pool.query('SELECT * FROM users WHERE rol = "Ejecutivo";');
    //const operaciones = await pool.query('SELECT * FROM operacion LEFT JOIN trabajador ON operacion.trabajadorId=trabajador.id JOIN empresa ON trabajador.empresaId = empresa.id');
    const trabajadores = await pool.query('SELECT trabajador.*, empresa.nombreEmpresa FROM trabajador LEFT JOIN empresa ON trabajador.empresaId=empresa.id WHERE trabajador.id = ?', [id]);
    const empresas = await pool.query('SELECT id, nombreEmpresa FROM empresa;');
    res.render("../views/imss/editar.hbs", {trabajador: trabajadores[0], empresas});
});

router.post('/editar/:id',isLoggedIn, isImss, async(req,res) => {
    const { id } = req.params;
    const {empresa, nombre,ciudad,puesto,horario,sueldoBase,banco,clabe,cuenta,infonavit, sueldoIMSS} = req.body;
    const newLink = {
        empresaId: empresa,
        nombre,
        ciudad,
        puesto,
        horario,
        sueldoBase,
        sueldoIMSS,
        banco,
        clabe,
        cuenta,
        infonavit

    };
    await pool.query('UPDATE trabajador set ? WHERE id = ?', [newLink, id]);
    res.redirect('/imss');
});


router.get('/baja/:id', async(req,res) => {
    const { id } = req.params;
    const trabajador = await pool.query('SELECT nombre, id FROM trabajador WHERE id = ?', [id]);
    res.render('../views/imss/baja.hbs', {trabajador: trabajador[0]});
});

router.post('/baja/:id', async(req,res) => {
    const {id} = req.params;
    const {fecha} = req.body;
    const tiempoTranscurrido = Date.now();
    const hoy = new Date(tiempoTranscurrido);
    
    const newLink = {
        estatus: '0',
    };
    const movimiento = {
        tipo: 'baja',
        fecha,
        timestamp: hoy,
        idtrabajador: id
    };

    await pool.query('UPDATE trabajador set ? WHERE id = ?', [newLink, id]);
    await pool.query('INSERT INTO movimientos set ?', [movimiento]);
    res.redirect('/imss');
});


router.get('/addempleado/', async(req,res) => {
    const empresa = await pool.query('SELECT id, nombreEmpresa FROM empresa');
    res.render('../views/imss/addempleado.hbs', {empresa});
});

router.post('/addempleado/', async(req,res) => {
    const {empresa, nombre,ciudad,puesto,horario,sueldoBase,banco,clabe,cuenta,infonavit, sueldoIMSS, rebajeInfonavit} = req.body;
    const iduser = await pool.query('SELECT usersId FROM empresa WHERE id = ?', [empresa]);
    const newLink = {
        empresaId: empresa,
        nombre,
        ciudad,
        puesto,
        horario,
        sueldoBase,
        banco,
        clabe,
        cuenta,
        infonavit,
        rebajeInfonavit,
        sueldoIMSS,
        usersId: iduser[0].usersId,
        estatus: 1
    };
    await pool.query('INSERT INTO trabajador set ?', [newLink]);
    res.redirect('/imss');
});


router.get('/addempresa/', async(req,res) => {
    const empresa = await pool.query('SELECT id, nombreEmpresa FROM empresa');
    const ejecutivo = await pool.query('SELECT id, nombre FROM users WHERE rol = "Ejecutivo"')
    res.render('../views/imss/addempresa.hbs', {empresa, ejecutivo});
});

router.post('/addempresa/', async(req,res) => {
    const {empresa,cotizador, esquema} = req.body;
    const newEmpresa= {
        nombreEmpresa:empresa,
        cotizador,
        esquema
    };
    await pool.query('INSERT INTO empresa set ?', [newEmpresa]);
    res.redirect('/imss');
});

router.get('/editarempresa/:id', async(req,res) => {
    const { id } = req.params;
    const empresa = await pool.query('SELECT * FROM empresa WHERE id = ?', [id]);
    const ejecutivo = await pool.query('SELECT id, nombre FROM users ')
    res.render('../views/imss/editarempresa.hbs', {empresa: empresa[0], ejecutivo});
});

module.exports = router;