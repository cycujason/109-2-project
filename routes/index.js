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
    pythonPath:'C:\\Users\\kikoflame\\anaconda3\\envs\\grad_project\\python.exe', // if heroku then this config no need to set
    args:
      [
        textContent,
      ]
    }
  
    PythonShell.run('./public/py/wordAnalysis.py', options, (err, data) => {
      if (err) return//res.send(err)
      const parsedString = JSON.parse(data);
      console.log(`first: ${parsedString.key1}, second: ${parsedString.key2}, third: ${parsedString.key3}, fourth: ${parsedString.key4}, fifth: ${parsedString.key5}`)
      //console.log(parsedString.text);
      //takeData = Object.values(parsedString);
      //res.send(takeData);
      console.log(parsedString)
      //res.send(parsedString)
      res.json(parsedString);
    })
  })
  

}//pythonprocess



module.exports = router;