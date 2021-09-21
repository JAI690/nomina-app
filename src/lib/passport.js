const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signin', new LocalStrategy({
    userNameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async(req,username,password,done) =>{
    const rows = await pool.query('SELECT * FROM users WHERE user = ?', [username]);
    if(rows.length > 0 ){
        const user = rows[0];
        if(password === user.password){
            done(null, user, req.flash('success', 'Bienvenido ' + user.username));
        }else {
            done(null, false, req.flash('message', 'Contraseña invalida'));
        }
    } else{
        return done(null, false, req.flash('message', 'Usuario invalido'));
    }
}));

passport.serializeUser((user,done)=>{
    done(null, user.id)
});

passport.deserializeUser(async (id,done) => {
    const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
});