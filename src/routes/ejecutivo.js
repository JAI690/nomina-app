const express = require('express');
const router = express.Router();
const {isLoggedIn, isAdmin, isEjecutivo} = require('../lib/auth');
const { v4 } = require('uuid');
const  {getWeek, calcularISR}  = require('../lib/extras')


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
    let inactivos = {}
    if(req.user.rol === 'admin'){
        trabajadores = await pool.query('SELECT trabajador.id, trabajador.nombre,trabajador.ciudad, trabajador.puesto, empresa.nombreEmpresa, empresa.id as empresaId FROM trabajador LEFT JOIN empresa ON trabajador.empresaId = empresa.id WHERE estatus = 1');
        inactivos = await pool.query('SELECT trabajador.id, trabajador.nombre,trabajador.ciudad, trabajador.puesto, empresa.nombreEmpresa, empresa.id as empresaId FROM trabajador LEFT JOIN empresa ON trabajador.empresaId = empresa.id WHERE estatus = 0');
        empresas = await pool.query('SELECT * FROM empresa ');
    }else{
        trabajadores = await pool.query('SELECT trabajador.id, trabajador.nombre,trabajador.ciudad, trabajador.puesto, empresa.nombreEmpresa, empresa.id as empresaId FROM trabajador LEFT JOIN empresa ON trabajador.empresaId = empresa.id WHERE empresa.usersId = ? AND estatus = 1',[id]);
        inactivos = await pool.query('SELECT trabajador.id, trabajador.nombre,trabajador.ciudad, trabajador.puesto, empresa.nombreEmpresa, empresa.id as empresaId FROM trabajador LEFT JOIN empresa ON trabajador.empresaId = empresa.id WHERE empresa.usersId = ? AND estatus = 0',[id]);
        empresas = await pool.query('SELECT * FROM empresa WHERE usersId = ?', [id]);
    }
    if(empresas.nombreEmpresa == 'HEB'){
        res.render("../views/ejecutivo/heb.hbs", {trabajadores, empresas: empresas});
    };
    res.render("../views/ejecutivo/index.hbs", {trabajadores, inactivos, empresas: empresas});
});

router.get('/inactivos',isLoggedIn, isEjecutivo, async(req,res) => {
    const id = req.user.id
    let empresas = {}
    let inactivos = {}
    if(req.user.rol === 'admin'){
        inactivos = await pool.query('SELECT trabajador.id, trabajador.nombre,trabajador.ciudad, trabajador.puesto, empresa.nombreEmpresa, empresa.id as empresaId FROM trabajador LEFT JOIN empresa ON trabajador.empresaId = empresa.id WHERE estatus = 0');
        empresas = await pool.query('SELECT * FROM empresa ');
    }else{
        inactivos = await pool.query('SELECT trabajador.id, trabajador.nombre,trabajador.ciudad, trabajador.puesto, empresa.nombreEmpresa, empresa.id as empresaId FROM trabajador LEFT JOIN empresa ON trabajador.empresaId = empresa.id WHERE empresa.usersId = ? AND estatus = 0',[id]);
        empresas = await pool.query('SELECT * FROM empresa WHERE usersId = ?', [id]);
    }
    if(empresas.nombreEmpresa == 'HEB'){
        res.render("../views/ejecutivo/heb.hbs", {inactivos, empresas: empresas});
    };
    res.render("../views/ejecutivo/inactivos.hbs", {inactivos, empresas: empresas});
});

router.get('/nominas',isLoggedIn, isEjecutivo, async(req,res) => {
    const id = req.user.id
    const nominas = await pool.query('SELECT nominas.*, empresa.*, users.nombre FROM nominas LEFT JOIN empresa ON nominas.empresaNombre=empresa.id LEFT JOIN users ON empresa.usersId=users.id WHERE users.id = ?', id);
    res.render("../views/ejecutivo/verNominas.hbs", {nominas})
});

router.get('/detalleNomina/:id',isLoggedIn, isEjecutivo, async(req,res) => {
    const { id } = req.params
    const operaciones = await pool.query('SELECT * FROM operacion LEFT JOIN trabajador ON operacion.trabajadorId=trabajador.id JOIN empresa ON trabajador.empresaId = empresa.id WHERE pagado = 0 AND nominaId = ?', [id]);
    const nomina = await pool.query('SELECT * FROM nominas WHERE idnominas = ?', [id])
    res.render("../views/ejecutivo/detalleNominas.hbs", {operaciones,nomina})
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

    const empresas = await pool.query('SELECT * FROM empresa WHERE id = ?', [idEmpresa]);
    const trabajadores = await pool.query('SELECT trabajador.*, empresa.nombreEmpresa FROM trabajador LEFT JOIN empresa ON trabajador.empresaId = empresa.id WHERE estatus = 1 AND empresa.id = ?', [idEmpresa]);

    if(empresas.nombreEmpresa == 'HEB'){
        res.render("../views/ejecutivo/heb.hbs", {trabajadores, empresas: empresas});
    };

    res.render("../views/ejecutivo/crearnomina.hbs", {trabajadores, empresas: empresas});
})

router.get('/ejemplo', (req,res) => {
    const isr = calcularISR(7500,'Quincena')
    res.send({isr})
})

///////////////////////////////////////////////////////////////////////////////////
//////                              CREAR NÓMINA                             //////
///////////////////////////////////////////////////////////////////////////////////

router.post('/', async(req,res) => {
    const { IMSS, compensacion, faltas, rebajes, sueldoBase, esquema, fechaInicio, fechaFin, subsidio, fonacot, infonavit, nombreEmpresa} = req.body;
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
        return(Number(dias*salarioreal));
    }
    

    if(typeof(id)==='string'){
        let lista = [];
        let dias = totaldias-faltas;

        //CALCULAR SUELDO IMSS
        let sueldoIMSS = sueldo(dias,IMSS) - fonacot - infonavit;

        //CALCULAR ISR CON BASE AL SUELDO IMSS
        let isr = calcularISR(sueldoIMSS,esquema);

        //CALCULAR SUELDO IMSS NETO
        let sueldoIMSSNeto = sueldoIMSS - isr;

        //CALCULAR SUELDO NETO
        let sueldoBaseTotal = sueldo(dias,sueldoBase)
        let sueldoNeto = sueldoBaseTotal - sueldoIMSS + compensacion - rebajes;

        lista.push(uuidNomina)
        lista.push(id);
        lista.push("Completa");
        lista.push(compensacion);
        lista.push(rebajes);
        lista.push(sueldoBase);
        lista.push(dias);
        lista.push(isr);
        lista.push(IMSS);
        lista.push(infonavit);
        lista.push("0");
        lista.push(fonacot);
        lista.push(sueldoNeto);
        lista.push(sueldoIMSSNeto)
        listasuperior.push(lista);

    }else{
    for (let index = 0; index < id.length; index++) {
        let lista = [];
        let dias = totaldias-faltas[index];

        //CALCULAR SUELDO IMSS
        let sueldoIMSS = sueldo(dias,IMSS[index]) - fonacot[index] - infonavit[index];

        //CALCULAR ISR CON BASE AL SUELDO IMSS
        let isr = calcularISR(sueldoIMSS,esquema);

        //CALCULAR SUELDO IMSS NETO
        let sueldoIMSSNeto = sueldoIMSS - isr;

        //CALCULAR SUELDO NETO
        let sueldoBaseTotal = sueldo(dias,sueldoBase[index])
        let sueldoNeto = sueldoBaseTotal - sueldoIMSS + compensacion[index] - rebajes[index];
 
        lista.push(uuidNomina)
        lista.push(id[index]);
        lista.push("Completa");
        lista.push(compensacion[index]);
        lista.push(rebajes[index]);
        lista.push(sueldoBase[index]);
        lista.push(dias);
        lista.push(isr);
        lista.push(IMSS[index]);
        lista.push(infonavit[index]);
        lista.push("0");
        lista.push(fonacot[index]);
        lista.push(sueldoNeto);
        lista.push(sueldoIMSSNeto)
        listasuperior.push(lista);
    }}

    const semananomina = getWeek(hoy)-1

    const nominas = {
        idnominas:uuidNomina,
        empresaNombre: nombreEmpresa,
        fechaInicio,
        fechaFin,
        createdAt: hoy,
        semananomina
    }

    await pool.query('INSERT INTO operacion (nominaId,trabajadorId, asistencia, complementos, rebajes, sueldoBase, dias, ISR, sueldoBaseIMSS, Infonavit, pagado, fonacot, sueldoNeto, IMSSpago) VALUES ?', [listasuperior]);
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
    const {empresa, nombre, apellidoPaterno, apellidoMaterno, direccion, calle, numeroInterior, numeroExterior, codigoPostal,
        colonia, municipio, estado, puesto, horario, sueldoBase, banco, clabe, cuenta, infonavit, 
        sueldoIMSS, rebajeInfonavit, fonacot, rebajeFonacot, NSS, CURP, RFC, patron, fechaIngreso,  estadoCivil,
        idEmpleado} = req.body;

 const iduser = await pool.query('SELECT usersId FROM empresa WHERE id = ?', [empresa]);
 const newLink = {
     empresaId: empresa,
     nombre,
     apellidoPaterno,
     apellidoMaterno,
     estadoCivil,
     NSS,
     RFC,
     CURP,
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
     fonacot,
     rebajeFonacot,
     estatus: 1,
     direccion,
     calle,
     numeroInterior,
     numeroExterior,
     codigoPostal,
     colonia,
     municipio,
     estado,
     patronId: patron,
     fechaIngreso,
     idEmpleado
 };
 await pool.query('INSERT INTO trabajador set ?', [newLink]);
    res.redirect('/ejecutivo');
});


router.get('/editar/:id', isLoggedIn, isEjecutivo, async(req,res) => {
    const { id } = req.params;
    const ejecutivos = await pool.query('SELECT * FROM users WHERE rol = "Ejecutivo";');
    //const operaciones = await pool.query('SELECT * FROM operacion LEFT JOIN trabajador ON operacion.trabajadorId=trabajador.id JOIN empresa ON trabajador.empresaId = empresa.id');
    const trabajadores = await pool.query('SELECT trabajador.*, empresa.nombreEmpresa, patrones.patron FROM trabajador LEFT JOIN empresa ON trabajador.empresaId=empresa.id LEFT JOIN patrones ON trabajador.patronId=patrones.idpatrones WHERE trabajador.id = ?', [id]);
    const empresas = await pool.query('SELECT id, nombreEmpresa FROM empresa;');
    const patrones = await pool.query('SELECT * FROM patrones');
    res.render("../views/ejecutivo/editar.hbs", {trabajador: trabajadores[0], empresas, patrones});
});

router.post('/inactivo/:id', isLoggedIn, isEjecutivo, async(req,res) => {
    const { id } = req.params;
    await pool.query('UPDATE trabajador set estatus = 0 WHERE id = ?', id);
    res.redirect('/ejecutivo/');
})

router.post('/activo/:id', isLoggedIn, isEjecutivo, async(req,res) => {
    const { id } = req.params;
    await pool.query('UPDATE trabajador set estatus = 1 WHERE id = ?', id);
    res.redirect('/ejecutivo/');
})

router.post('/editar/:id',isLoggedIn, isEjecutivo, async(req,res) => {
    const { id } = req.params;
    const {empresa, nombre, apellidoPaterno, apellidoMaterno, estadoCivil, ciudad, direccion, calle, numeroInterior, numeroExterior, codigoPostal,
        colonia, municipio, estado, puesto, horario, sueldoBase, banco, clabe, cuenta, infonavit, 
        sueldoIMSS, rebajeInfonavit, fonacot, rebajeFonacot, NSS, CURP, RFC, patron, fechaIngreso, 
        idEmpleado} = req.body;

    const iduser = await pool.query('SELECT usersId FROM empresa WHERE id = ?', [empresa]);
    const newLink = {
        empresaId: empresa,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        estadoCivil,
        NSS,
        RFC,
        CURP,
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
        fonacot,
        rebajeFonacot,
        estatus: 1,
        direccion,
        calle,
        numeroInterior,
        numeroExterior,
        codigoPostal,
        colonia,
        municipio,
        estado,
        patronId: patron,
        fechaIngreso,
        idEmpleado
    };
    await pool.query('UPDATE trabajador set ? WHERE id = ?', [newLink, id]);
    res.redirect('/ejecutivo');
});

module.exports = router;