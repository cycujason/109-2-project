var express = require('express');
var router = express.Router();
var Auth = require('../lib/auth');
let { PythonShell } = require('python-shell');
const { query } = require('express');
const { pool } = require('../config');
const { resolveInclude } = require('ejs');


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
  
  pool.query(`SELECT note_paragraph FROM note_content WHERE note_id=$1`,['8fbedf9f-5de1-4522-90b1-bf1222ddce84'],(err,result)=>{
   var textContent = result.rows[0].note_paragraph;
   let options = {
    mode:'text',
    encoding:'utf-8',
    pythonPath:'C:\\Users\\kikoflame\\anaconda3\\envs\\grad_project\\python.exe',
    args:
      [
        textContent,
      ]
    }
  
    PythonShell.run('./public/py/wordAnalysis.py', options, (err, data) => {
      if (err) res.send(err)
      const parsedString = JSON.parse(data);
      //console.log(`name: ${parsedString.Name}, from: ${parsedString.From}`)
      //console.log(parsedString.text);
      takeData = Object.values(parsedString);
      res.send(takeData);
      //console.log(data)
      //res.send(data)
      //res.json(parsedString);
    })
  })
  

}//pythonprocess



module.exports = router;