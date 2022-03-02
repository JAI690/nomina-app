const express = require('express');
const router = express.Router();
const {isLoggedIn, isAdmin, isEjecutivo} = require('../lib/auth');
const { v4 } = require('uuid');


//Conexión a la base de datos
const pool = require('../database');

//router.get('/', async(req,res) => {
  //  const trabajadores = await pool.query('SELECT * FROM trabajadores WHERE usersId = ?', [req.user.id] );
    //res.render("../views/ejecutivo/index.hbs", {trabajadores});
//});

router.get('/',isLoggedIn, isEjecutivo, async(req,res) => {
    const id = req.user.id
    let empresas = {}
    let trabajadores = {}
    if(req.user.rol === 'admin'){
        trabajadores = await pool.query('SELECT * FROM trabajador LEFT JOIN empresa ON trabajador.empresaId = empresa.id WHERE estatus = 1');
        empresas = await pool.query('SELECT * FROM empresa ');
    }else{
        trabajadores = await pool.query('SELECT * FROM trabajador LEFT JOIN empresa ON trabajador.empresaId = empresa.id WHERE empresa.usersId = ? AND estatus = 1',[id]);
        empresas = await pool.query('SELECT * FROM empresa WHERE usersId = ?', [id]);
    }
    if(empresas.nombreEmpresa == 'HEB'){
        res.render("../views/ejecutivo/heb.hbs", {trabajadores, empresas: empresas});
    };

    res.render("../views/ejecutivo/index.hbs", {trabajadores, empresas: empresas});
});

router.get('/heb',isLoggedIn, isEjecutivo, async(req,res) => {
    const id = req.user.id
    const empresas = await pool.query('SELECT * FROM empresa ', [id]);
    const trabajadores = await pool.query('SELECT * FROM trabajador WHERE usersId = ? AND estatus = 1',[id]);

    res.render("../views/ejecutivo/heb.hbs", {trabajadores, empresas: empresas});
});
//WHERE usersId = ?

router.get('/nomina', async(req,res) => {
    const id = req.user.id
    const {idEmpresa} = req.query

    console.log(idEmpresa)
    const empresas = await pool.query('SELECT * FROM empresa WHERE nombreEmpresa = ?', [idEmpresa]);
    const trabajadores = await pool.query('SELECT trabajador.*, empresa.nombreEmpresa FROM trabajador LEFT JOIN empresa ON trabajador.empresaId = empresa.id WHERE estatus = 1 AND empresa.nombreEmpresa = ?', [idEmpresa]);
    console.log(trabajadores)

    if(empresas.nombreEmpresa == 'HEB'){
        res.render("../views/ejecutivo/heb.hbs", {trabajadores, empresas: empresas});
    };

    res.render("../views/ejecutivo/crearnomina.hbs", {trabajadores, empresas: empresas});
})

router.post('/', async(req,res) => {
    const { IMSS, compensacion, faltas, rebajes, sueldoBase, esquema, fechaInicio, fechaFin, subsidio, IMSSaportacion, fonacot, infonavit, ISR, nombreEmpresa} = req.body;
    let {id} = req.body
    const uuidNomina = String(v4());
    let listasuperior = [];
    if(esquema==='Semana'){
        totaldias = 7;
    }else{
        totaldias = 15;
    };
    
    //if(cotizador==='Dia'){
      //  totaldias = 7;
    //}else{
      //  totaldias = 15;
    //};
    const tiempoTranscurrido = Date.now();
    const hoy = new Date(tiempoTranscurrido);

    const sueldo = function(dias,salarioreal){
        return(dias*salarioreal);
    }
    

    if(typeof(id)==='string'){
        let lista = [];
        let dias = totaldias-faltas;
        let sueldoNeto = sueldo(dias,sueldoBase) - sueldo(dias,IMSS) + compensacion - rebajes - ISR - fonacot - infonavit + subsidio - IMSSaportacion
        lista.push(uuidNomina)
        lista.push(id);
        lista.push("Completa");
        lista.push(compensacion);
        lista.push(rebajes);
        lista.push(sueldoBase);
        lista.push(dias);
        lista.push(ISR);
        lista.push(IMSS);
        lista.push(infonavit);
        lista.push(fechaInicio);
        lista.push(fechaFin);
        lista.push("0");
        lista.push(subsidio);
        lista.push(fonacot);
        lista.push(IMSSaportacion);
        lista.push(sueldoNeto);
        
        listasuperior.push(lista);

    }else{
    for (let index = 0; index < id.length; index++) {
        let lista = [];

        
        let dias = totaldias-faltas[index];
        lista.push(uuidNomina)
        lista.push(id[index]);
        lista.push("Completa");
        lista.push(compensacion[index]);
        lista.push(rebajes[index]);
        lista.push(sueldoBase[index]);
        lista.push(dias);
        lista.push(ISR[index]);
        lista.push(IMSS[index]);
        lista.push(infonavit[index]);
        lista.push(fechaInicio);
        lista.push(fechaFin);
        lista.push("0");
        lista.push(subsidio[index]);
        lista.push(fonacot[index]);
        lista.push(IMSSaportacion[index]);
        lista.push(sueldo(dias,sueldoBase[index]));
        
        listasuperior.push(lista);
    }}

    const nominas = {
        idnominas:uuidNomina,
        empresaNombre: nombreEmpresa
    }
    console.log(uuidNomina)
    console.log(nombreEmpresa)
    console.log(nominas)
    await pool.query('INSERT INTO operacion (nominaId,trabajadorId, asistencia, complementos, rebajes, sueldoBase, dias, ISR, sueldoBaseIMSS, Infonavit, fechaInicio, fechaFin, pagado, subsidio, fonacot, IMSS, sueldoNeto) VALUES ?', [listasuperior]);
    await pool.query('INSERT INTO nominas set ?', [nominas])
    res.redirect('/ejecutivo/')
});

router.post('/heb', async(req,res) => {
    const { IMSS,id, compensacion, asistencias, personas, rebajes, sueldoBase, esquema, fechaInicio, fechaFin} = req.body;


    const sueldo = function(dias,salarioreal){
        return(dias*salarioreal);
    }

    const tiempoTranscurrido = Date.now();
    const hoy = new Date(tiempoTranscurrido);

    if(id.length===1){
        let lista = [];

        lista.push(id);
        lista.push("Completa");
        lista.push(compensacion);
        lista.push(rebajes);
        lista.push(sueldoBase);
        lista.push(asistencias);
        lista.push(0);
        lista.push(IMSS);
        lista.push(0);
        lista.push(fechaInicio);
        lista.push(fechaFin);
        lista.push("0");
        lista.push(null);
        lista.push(0);
        lista.push(0);
        lista.push(0);
        lista.push(sueldo(personas,sueldoBase));
        listasuperior.push(lista);

    }else{
    for (let index = 0; index < id.length; index++) {
        let lista = [];
        
        lista.push(id[index]);
        lista.push("Completa");
        lista.push(compensacion[index]);
        lista.push(rebajes[index]);
        lista.push(sueldoBase[index]);
        lista.push(asistencias[index]);
        lista.push(0);
        lista.push(IMSS[index]);
        lista.push(0);
        lista.push(fechaInicio);
        lista.push(fechaFin);
        lista.push("0");
        lista.push(null);
        lista.push(0);
        lista.push(0);
        lista.push(0);
        lista.push(sueldo(personas[index],sueldoBase[index]));
        
        listasuperior.push(lista);
    }}

    await pool.query('INSERT INTO operacion (trabajadorId, asistencia, complementos, rebajes, sueldoBase, dias, ISR, sueldoBaseIMSS, Infonavit, fechaInicio, fechaFin, pagado, fechaPago, subsidio, fonacot, IMSS, sueldoNeto) VALUES ?', [listasuperior]);
    res.redirect('/ejecutivo/')
});

router.get('/alta',isLoggedIn, isEjecutivo, async(req,res) => {
    const empresa = await pool.query('SELECT id, nombreEmpresa FROM empresa');
    const patrones = await pool.query('SELECT * FROM patrones');
    res.render('../views/ejecutivo/alta.hbs', {empresa, patrones});
});


router.post('/alta', async(req,res) => {
    const {empresa, nombre,ciudad,puesto,horario,sueldoBase,banco,clabe,cuenta, patron, direccion, sueldoIMSS, fechaIngreso} = req.body;
    const iduser = await pool.query('SELECT usersId FROM empresa WHERE id = ?', [empresa]);
    const newLink = {
        empresaId: empresa,
        nombre,
        patronId: patron,
        ciudad,
        puesto,
        horario,
        sueldoBase,
        banco,
        clabe,
        cuenta,
        sueldoIMSS,
        direccion,
        usersId: iduser[0].usersId,
        estatus: 1,
        fechaIngreso
    };
    await pool.query('INSERT INTO trabajador set ?', [newLink]);
    res.redirect('/ejecutivo');
});



module.exports = router;