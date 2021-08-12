const express = require('express');
const app = express();  
const ejs = require('ejs');
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
let { PythonShell } = require('python-shell');
var userRouter = require('./routes/users');
var indexRouter = require('./routes/index');

app.use('/', indexRouter);
app.use('/users', userRouter);

app.get('/call/python', pythonProcess);

function pythonProcess(req, res) {
  let options = {
    scriptPath: './',
    args:
      [
        req.query.name,
        req.query.from
      ]
  }
  
  PythonShell.run('process.py', options, (err, data) => {
    if (err) res.send(err)
    const parsedString = JSON.parse(data);
    console.log(`name: ${parsedString.Name}, from: ${parsedString.From}`)
    res.json(parsedString);
  })
  


}//pythonprocess

module.exports= app;

