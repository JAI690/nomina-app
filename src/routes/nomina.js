const express = require('express');

const router = express.Router();

//Conexión a la base de datos
const pool = require('../database');

router.get('/', async(req,res) => {
    const ejecutivos = await pool.query('SELECT * FROM users WHERE rol = "Ejecutivo"');
    console.log(ejecutivos);
    const operaciones = await pool.query('SELECT * FROM operacion LEFT JOIN trabajador ON operacion.trabajadorId=trabajador.id JOIN empresa ON trabajador.empresaId = empresa.id');
    console.log(operaciones);
    res.render("../views/nomina/index.hbs", {operaciones, ejecutivos});
});

module.exports = router;