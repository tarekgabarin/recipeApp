let express = require('express');
let mongoose = require('mongoose');
let path = require('path');
let bodyParser = require('body-parser');
let recipeRouter = require('./routes/recipeRouter');
let userRouter = require('./routes/userRouter');
let bcrypt = require('bcrypt');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let config = require('./config');
let logger = require('morgan');
let cookieParser = require('cookie-parser');

mongoose.connect(config.mongoUrl);

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    // we're connected!
    console.log("Connected correctly to server");
});

const app = express();

const port = 3000;

app.listen(port);



let User = require('./models/user');
app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(cookieParser());



app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));

app.use('/users', userRouter);
app.use('/recipes',recipeRouter);

app.get('/', function(req, res){
  res.send('Hey, this is your database!')
});

app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

app.use((err, req, res, next) =>{
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    })
});




module.exports = app;