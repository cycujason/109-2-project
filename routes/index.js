var express = require('express');
var router = express.Router();
var Auth = require('../lib/auth');


router.get('/', (req, res) => {
    res.render('index');
});


module.exports = router;