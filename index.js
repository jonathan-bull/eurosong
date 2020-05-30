var path = require('path');
var express = require('express');
var session = require('express-session');
var sassMiddleware = require('node-sass-middleware');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var app = express();

var routes = require('./app/routes');

app.set('views', __dirname + '/app/views');
app.set('view engine', 'ejs');

//session & cookie
var sessionStore = new session.MemoryStore({reapInterval: 86400 * 10});
var sessionMiddleware = session({
    store: sessionStore,
    secret: 'englebert',
    resave: false,
    saveUninitialized: true
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(sessionMiddleware);
app.use(sassMiddleware({
    src: '/app/scss',
    dest: '/public/css',
    root: __dirname,
    debug: true,
    outputStyle: 'compressed',
    prefix: '/css'
}));
app.use(flash());
app.use(express.static('public'));
app.use(express.static('semantic/dist'));
app.use('/', routes);

var sockets = require('./app/sockets')(app, sessionMiddleware);
sockets.listen(3000);