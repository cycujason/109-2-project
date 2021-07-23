const express = require('express');
const app = express();
const { pool } = require('./config');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
require('dotenv').config();
const initializePassport = require('./pswConfig');
initializePassport(passport);
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));


app.use(
  session({
    secret: 'secret',
    resave: 'false,',
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// index.html is the main page
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/users/register', checkAuthenticated, (req, res) => {
  res.render('register');
});
app.get('/users/login', checkAuthenticated, (req, res) => {
  res.render('login');
});

// dashboard: log in successfully
app.get('/users/dashboard', checkNotAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user.name });
});

app.get('/users/edit', checkNotAuthenticated, (req, res) => {
  res.render('testpage', { user: req.user.name });
});

app.get('/pinky', (req, res) => {
  res.render('pinky');
});

// log out will redirect to index.html
app.get('/users/logout', (req, res) => {
  req.logout();
  res.render('index', { message: 'You have logged out successfully!' });
});

// =================================================================================
app.post('/users/register', async (req, res) => {
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

// authenticate ====================================================================
app.post(
  '/users/login',
  passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true,
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/users/dashboard');
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/login');
}

module.exports= app;
/* 
let port = process.env.PORT;
if (port == null || port == '') {
  port = 5000;
}
app.listen(port, function () {
  console.log(`Server has started successfully at ${port}`);
});
*/
