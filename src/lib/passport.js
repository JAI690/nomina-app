const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signup', new LocalStrategy({
    userNameField: 'user',
    passwordField: 'password',
    passReqToCallback: true
}, async(req,username,password,done) =>{
    const { fullname, rol } = req.body;
    const newUser = {
        user: username,
        password,
        nombre : fullname,
        rol
    };
    newUser.password = await helpers.encryptPassword(password);
    const result = await pool.query('INSERT INTO users SET ?', [newUser]);
    newUser.id = result.insertId;
    return done(null, newUser);
}));

passport.use('local.pwd', new LocalStrategy({
    userNameField: 'user',
    passwordField: 'password',
    passReqToCallback: true
}, async(req,username, newPassword, done) =>{
    const { id } = req.user.id;
    const newUser = {
        password: newPassword,
    };
    newUser.password = await helpers.encryptPassword(newPassword);
    const result = await pool.query('UPDATE users SET ? WHERE id = ?', [newUser, id]);
    //newUser.id = result.insertId;
    return done(null, newUser,req.flash('success', 'Hola'));
}));



passport.use('local.signin', new LocalStrategy({
    userNameField: 'user',
    passwordField: 'password',
    passReqToCallback: true
}, async(req,username,password,done) =>{
    const rows = await pool.query('SELECT * FROM users WHERE user = ?', [username]);
    if(rows.length > 0 ){
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password,user.password);
        if(validPassword){
            done(null, user, req.flash('success', 'Bienvenido ' + user.nombre));
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