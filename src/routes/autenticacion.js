const express = require('express');
const router = express.Router();
const passport = require('passport');
const {isLoggedIn, isNotLoggedIn, isImss, isAdmin} = require('../lib/auth');



router.get('/signup', (req,res)=>{
    res.render('./auth/signup.hbs');
});

router.post('/signup', passport.authenticate('local.signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

router.get('/signin', isNotLoggedIn, (req,res)=>{
    res.render('./auth/signin.hbs');
});


router.post('/signin', isNotLoggedIn, (req,res,next)=>{
    passport.authenticate('local.signin', {
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true
    })(req,res,next);
});

router.get('/profile', isLoggedIn, (req,res) => {
    switch (req.user.rol) {
        case 'Imss':
            res.redirect('/imss');
            break;
        case 'Nomina':
            res.redirect('/nomina');
            break;
        case 'Ejecutivo':
            res.redirect('/ejecutivo');
            break;
        case 'admin':
            res.redirect('/imss');
            break;
    } 
    
});



router.get('/logout', (req,res) => {
    req.logOut();
    res.redirect('/signin')
});

module.exports = router;