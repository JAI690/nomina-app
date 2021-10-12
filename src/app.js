const express = require('express');
const path = require('path');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const { database } = require('./keys');
const passport = require('passport');
const flash = require('connect-flash');



// Inicialización
const app = express();
require('./lib/passport');

// Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view.engine', '.hbs');

//Middlewares 
app.use(flash());
app.use(session({
    secret: 'sqlsession',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());


// Global variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
   next();
});

// Routes
app.use(require('./routes'));
app.use(require('./routes/autenticacion'));
app.use('/ejecutivo', require('./routes/ejecutivo'));
app.use('/nomina', require('./routes/nomina'));
app.use('/imss', require('./routes/imss'));
app.use('/administrativo', require('./routes/administrativo'));

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(app.get('port'), () => {
    console.log("Server on port", app.get('port'));
})