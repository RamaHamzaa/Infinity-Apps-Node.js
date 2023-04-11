var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var productRouter=require('./routes/product');
var marketRouter=require('./routes/market');
var sectionRouter=require('./routes/section');
var soldRouter=require('./routes/sold');
var demandRouter=require("./routes/demand");
var categorizeRouter=require('./routes/categorize');
var logy=require('./routes/accountSetting');

var app = express();

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  console.log('addr: ' + add);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(cors({
    "origin": "*",
    "optionsSuccessStatus": 200,
    "credentials": true,
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "maxAgeSeconds": 3600
}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
   "Origin, X-Requested-With, Content-Type, Accept"
   );
  next();
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/product',productRouter);
app.use('/market',marketRouter);
app.use('/section',sectionRouter);
app.use('/sold',soldRouter);
app.use('/demand',demandRouter);
app.use('/categorize',categorizeRouter);
app.use('/account',logy)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
