var express = require('express');
var router = express.Router();
var Auth = require('../lib/auth');
var session = require('express-session');
var flash = require('express-flash');
var { pool } = require('../config');
var bcrypt = require('bcrypt');
require('dotenv').config();
var passport = require('passport');
var initializePassport = require('../pswConfig');
initializePassport(passport);
var { v4: uuidv4 } = require('uuid');



router.use(
    session({
      secret: 'secret',
      resave: 'false,',
      saveUninitialized: false,
    })
);

router.use(flash());

router.use(passport.initialize());
router.use(passport.session());


router.get('/dashboard', Auth.checkNotAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user.user_name });
});


router.get('/login', Auth.checkAuthenticated, (req, res) => {
    res.render('login');
});

router.post('/login',passport.authenticate('local', {
      successRedirect: '/users/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true,
    })
);



router.get('/logout', (req, res) => {
    req.logout();
    res.render('index', { message: 'You have logged out successfully!' });
});



router.get('/register', Auth.checkAuthenticated, (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    let { name, password, password_confirm } = req.body;
    let errors = [];
  
    console.log({
      name,
      password,
      password_confirm,
    });
  
    if (!name || !password || !password_confirm) {
      errors.push({ message: 'Please enter all field correctly!' });
    } // if
  
    if (password.length < 6) {
      errors.push({ message: 'Password must be 6 characters long!' });
    } // if
  
    if (password.length > 20) {
      errors.push({ message: 'Password is at least 20 characters long!' });
    } // if
  
    if (password !== password_confirm) {
      errors.push({ message: 'Passwords do not match!' });
    } // if
  
    if (errors.length > 0) {
      res.render('register', { errors, name, password, password_confirm });
    } else {
      hashedPassword = await bcrypt.hash(password, 10);
  //   console.log("hashedPassword from app.js: " + hashedPassword);
      pool.query(
        `SELECT user_name FROM login_module
          WHERE user_name = $1`,
        [name],
        (err, results) => {
          if (err) {
            console.log("err from app.js: " + err);
          } // if

        console.log("results.rows from app.js 1: " + results.command);
        console.log("results.rows from app.js 1: " + results.rowCount);
        console.log("results.rows from app.js 1: " + results.oid);
        console.log("results.rows from app.js 1: " + results.rows);
        console.log("results.rows from app.js 1: " + results.fields);
        console.log("results.rows from app.js 1: " + results._parsers);
        console.log("results.rows from app.js 1: " + results._types);
        console.log("results.rows from app.js 1: " + results.RowCtor);
        console.log("results.rows from app.js 1: " + results.rowAsArray);
        
          if (results.rows.length > 0) { // registered before
      //      console.log("results.rows.length: " + results.rows.length); 
            errors.push({ message: 'You are already registered!' });
            return res.render('register', { errors, name, password, password_confirm });
          } else { // the first time register
            pool.query(
              `INSERT INTO login_module (user_name, user_password)
              VALUES ($1, $2)`,
              [name, hashedPassword],
              (err, results) => {
                if (err) {
                  throw err;
                }
             //   console.log("results.rows from app.js 2: " + results.rows[0]);
                req.flash('success_msg', 'You are successfuly registered!');
                res.redirect('/users/login');
              }
            ); // pool.query()
          } // else
        }
      ); // pool.query()
    } // else
});
//Auth.checkNotAuthenticated,



router.get('/edit', (req, res) => {
  res.redirect(`/users/edit/${uuidv4()}`);
});


router.get('/edit/:id',Auth.checkNotAuthenticated, (req, res) => {
  console.log("open doc uuid: " + req.params.id);
  res.render('testpage' ,{ textid:req.params.id ,user:req.user.user_name});
});

router.get('/guest', (req, res) => {
  res.redirect(`/users/guest/${uuidv4()}`);
});


router.get('/guest/:id', (req, res) => {
  console.log("open doc uuid: " + req.params.id);
  res.render('testpage' ,{ textid:req.params.id ,user:'guest'});
});


module.exports = router;