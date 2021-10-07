const express = require('express');
const router = express.Router();
const {isLoggedIn, isAdmin, isEjecutivo} = require('../lib/auth');

//Conexión a la base de datos
const pool = require('../database');

//router.get('/', async(req,res) => {
  //  const trabajadores = await pool.query('SELECT * FROM trabajadores WHERE usersId = ?', [req.user.id] );
    //res.render("../views/ejecutivo/index.hbs", {trabajadores});
//});

router.get('/',isLoggedIn, isEjecutivo, async(req,res) => {
    const id = req.user.id
    const empresas = await pool.query('SELECT * FROM empresa WHERE usersId = ?', [id]);
    const trabajadores = await pool.query('SELECT * FROM trabajador WHERE usersId = ? AND estatus = 1',[id]);
    console.log(empresas);
    console.log(trabajadores);
    res.render("../views/ejecutivo/index.hbs", {trabajadores, empresas: empresas});
});


router.post('/', async(req,res) => {
    const { IMSS,id, compensacion, faltas, rebajes, sueldoBase, esquema, fechaInicio, fechaFin} = req.body;

    let listasuperior = [];
    if(esquema==='2'){
        totaldias = 7;
    }else{
        totaldias = 15;
    };
    const tiempoTranscurrido = Date.now();
    const hoy = new Date(tiempoTranscurrido);
    console.log(id.length);
    if(id.length===1){
        let lista = [];
        
        let dias = totaldias-faltas;
        lista.push(id);
        lista.push("Completa");
        lista.push(compensacion);
        lista.push(rebajes);
        lista.push(sueldoBase);
        lista.push(dias);
        lista.push("0");
        lista.push(IMSS);
        console.log(IMSS);
        lista.push("0");
        lista.push(fechaInicio);
        lista.push(fechaFin);
        lista.push("0");
        lista.push(null);
        listasuperior.push(lista);
        console.log("unico elemento")
    }else{
    for (let index = 0; index < id.length; index++) {
        let lista = [];
        
        let dias = totaldias-faltas[index];
        lista.push(id[index]);
        lista.push("Completa");
        lista.push(compensacion[index]);
        lista.push(rebajes[index]);
        lista.push(sueldoBase[index]);
        lista.push(dias);
        lista.push("0");
        lista.push(IMSS[index]);
        console.log(IMSS);
        lista.push("0");
        lista.push(fechaInicio);
        lista.push(fechaFin);
        lista.push("0");
        lista.push(null);
        listasuperior.push(lista);
    }}
    console.log(listasuperior);
    await pool.query('INSERT INTO operacion (trabajadorId, asistencia, complementos, rebajes, sueldoBase, dias, ISR, sueldoBaseIMSS, Infonavit, fechaInicio, fechaFin, pagado, fechaPago) VALUES ?', [listasuperior]);
    res.redirect('/ejecutivo/')
});

router.get('/alta',isLoggedIn, isEjecutivo, async(req,res) => {
    const empresa = await pool.query('SELECT id, nombreEmpresa FROM empresa');
    res.render('../views/ejecutivo/alta.hbs', {empresa});
});


router.post('/alta', async(req,res) => {
    const {empresa, nombre,ciudad,puesto,horario,sueldoBase,banco,clabe,cuenta} = req.body;
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
        sueldoIMSS: 0,
        usersId: iduser[0].usersId,
        estatus: 1
    };
    await pool.query('INSERT INTO trabajador set ?', [newLink]);
    res.redirect('/ejecutivo');
});



module.exports = router;