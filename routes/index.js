var express = require('express');
var router = express.Router();
var Auth = require('../lib/auth');
let { PythonShell } = require('python-shell');
const { query } = require('express');


router.get('/', (req, res) => {
    res.render('indexT');
});

/*
router.get('/test', (req, res) => {
    res.render('dashboardT',{user:"test",allnotes:[]});
});

router.get('/test1', (req, res) => {
    res.render('dashboardT',{user:'test', allnotes:[]});
});

*/

router.get('/call/python', pythonProcess);

function pythonProcess(req, res) {
  let options = {
    args:
      [
        req.query.name,
        req.query.from
      ]
  }
  
  PythonShell.run('./public/py/process.py', options, (err, data) => {
    if (err) res.send(err)
    const parsedString = JSON.parse(data);
    console.log(`name: ${parsedString.Name}, from: ${parsedString.From}`)
    res.json(parsedString);
  })
  


}//pythonprocess



module.exports = router;