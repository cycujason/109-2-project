var express = require('express');
var router = express.Router();
var Auth = require('../lib/auth');


router.get('/', (req, res) => {
    res.render('indexT');
});

/*
router.get('/test', (req, res) => {
    res.render('dashboardT',{user:"test",allnotes:[]});
});
router.get('/test1', (req, res) => {
    res.render('indexT');
});
*/

module.exports = router;