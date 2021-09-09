const express = require('express');

const router = express.Router();

//Conexión a la base de datos
const pool = require('../database');

//router.get('/', async(req,res) => {
  //  const trabajadores = await pool.query('SELECT * FROM trabajadores WHERE usersId = ?', [req.user.id] );
    //res.render("../views/ejecutivo/index.hbs", {trabajadores});
//});

router.get('/', async(req,res) => {
    
    const empresas = await pool.query('SELECT * FROM empresa WHERE usersId = 1');
    const trabajadores = await pool.query('SELECT * FROM trabajador WHERE usersId = 1 AND estatus = 1');
    res.render("../views/ejecutivo/index.hbs", {trabajadores, empresas: empresas});
});


router.post('/', async(req,res) => {
    const { id, nombre, compensacion, faltas, rebajes, sueldoBase, esquema, fechaInicio, fechaFin } = req.body;

    let listasuperior = [];
    if(esquema==='2'){
        totaldias = 7;
    }else{
        totaldias = 15;
    };
    console.log(totaldias);
    for (let index = 0; index < nombre.length; index++) {
        let lista = [];
        
        let dias = totaldias-faltas[index];
        lista.push(id[index]);
        lista.push("Completa");
        lista.push(compensacion[index]);
        lista.push(rebajes[index]);
        lista.push(sueldoBase[index]);
        lista.push(dias);
        lista.push("0");
        lista.push("0");
        lista.push("0");
        lista.push(fechaInicio);
        lista.push(fechaFin);
        lista.push("0");
        lista.push(null);
        listasuperior.push(lista);
    }
    await pool.query('INSERT INTO operacion (trabajadorId, asistencia, complementos, rebajes, sueldoBase, dias, ISR, IMSS, Infonavit, fechaInicio, fechaFin, pagado, fechaPago) VALUES ?', [listasuperior]);
    res.redirect('/ejecutivo/')
});



module.exports = router;