const express = require('express');
const router = express.Router();
const passport = require('passport');
const {isLoggedIn, isNotLoggedIn} = require('../lib/auth');

router.get('/signin', isNotLoggedIn, (req,res)=>{
    res.render('./auth/signin.hbs');
});

router.post('/signin', isNotLoggedIn, (req,res,next)=>{
    var acceso = ''
    switch (req.user.rol) {
        case 'nomina':
            acceso = '/nomina';
            break;
        case 'imss':
            acceso = '/imss';
            break;
        case 'Ejecutivo':
            acceso = '/ejecutivo';
            break;
    };
    passport.authenticate('local.signin', {
        successRedirect: acceso,
        failureRedirect: '/signin',
        failureFlash: true
    })(req,res,next);
});

router.get('/profile', isLoggedIn, (req,res) => {
    res.render('profile.hbs');
});

router.get('/logout', (req,res) => {
    req.logOut();
    res.redirect('/signin')
});

module.exports = router;