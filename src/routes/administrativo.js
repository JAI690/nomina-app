const express = require('express');
const router = express.Router();

const {isLoggedIn, isAdmin, isImss} = require('../lib/auth');

//Conexión a la base de datos
const pool = require('../database');

router.get('/', async(req,res) =>{
    const trabajadores = await pool.query('SELECT *, patrones.patron FROM trabajador LEFT JOIN patrones ON trabajador.patronid = patrones.idpatrones');
    res.render("../views/administrativo/index.hbs", {trabajadores});
});



module.exports = router;