const express = require('express');
const router = express.Router();

const {isLoggedIn, isAdmin, isImss} = require('../lib/auth');

//Conexión a la base de datos
const pool = require('../database');

router.get('/', async(req,res) =>{
    res.render("../views/administrativo/index.hbs");
});



module.exports = router;