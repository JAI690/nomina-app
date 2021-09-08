const express = require('express');

const router = express.Router();

//Conexión a la base de datos
const pool = require('../database');

router.get('/', async(req,res) => {
    const operaciones = await pool.query('SELECT * FROM operacion LEFT JOIN trabajador ON operacion.trabajadorId=trabajador.id');
    res.render("../views/nomina/index.hbs", {operaciones});
});

module.exports = router;