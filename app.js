const express = require('express');
const app = express();  
const ejs = require('ejs');
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
var userRouter = require('./routes/users');
var indexRouter = require('./routes/index');

app.use('/', indexRouter);
app.use('/users', userRouter);



module.exports= app;

