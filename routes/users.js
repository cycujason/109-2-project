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
    const user = req.user.user_name;
    var keyword = req.query.keyword;
    const key = keyword;
    var range = req.query.range;
    var showSelect = true;
    if(typeof range === 'undefined' && typeof keyword === 'undefined' ) showSelect=false;
    if(typeof keyword === 'undefined' ){
      pool.query(`select note_title,note_id,created_at from note_content
      where create_user=$1 `,[user],(err,results)=>{
      res.render('dashboardT', { user: user, allnotes : results.rows ,limit:showSelect,nav:range, keyword:'undefined'});
      });//not consider the query fail 
    }//if
    else if( (range === "all" || typeof range === 'undefined') ){
      keyword = '%'+keyword+'%';
      pool.query(`select note_title,note_id,created_at from note_content
      where create_user=$1 and (note_title like $2 OR note_paragraph like $2)`,[user,keyword],(err,results)=>{
      res.render('dashboardT', { user: user, allnotes : results.rows ,limit:showSelect,nav:range, keyword:key});
      });//not consider the query fail
    }//else if
    else if(range === "content"){
      keyword = '%'+keyword+'%';
      pool.query(`select note_title,note_id,created_at from note_content
      where create_user=$1 and note_paragraph like $2`,[user,keyword],(err,results)=>{
      res.render('dashboardT', { user: user, allnotes : results.rows ,limit:showSelect,nav:range, keyword:key});
      });//not consider the query fail
    }//else if
    else {
      keyword = '%'+keyword+'%';
      pool.query(`select note_title,note_id,created_at from note_content
      where create_user=$1 and note_title like $2 `,[user,keyword],(err,results)=>{
      res.render('dashboardT', { user: user, allnotes : results.rows ,limit:showSelect,nav:range, keyword:key});
      });//not consider the query fail
    }//else title search

    
});



router.get('/login', Auth.checkAuthenticated, (req, res) => {
    res.render('loginT');
});

router.post('/login',passport.authenticate('local', {
      successRedirect: '/users/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true,
    })
);



router.get('/logout', (req, res) => {
    req.logout();
    res.render('indexT', { message: 'You have logged out successfully!' });
});



/*
router.get('/register', Auth.checkAuthenticated, (req, res) => {
    res.render('register');
});
*/

router.post('/register', async (req, res) => {
    let { name, password, password_confirm } = req.body;
    let errors = [];
  
    console.log({
      name,
      password,
      password_confirm,
    });
  
    if (!name || !password || !password_confirm) {
      errors.push({ message: '請確定填完所有資料!' });
    } // if
  
    if (password.length < 6) {
      errors.push({ message: '密碼必須大於6個字元!' });
    } // if
  
    if (password.length > 20) {
      errors.push({ message: '密碼請小於20個字元!' });
    } // if
  
    if (password !== password_confirm) {
      errors.push({ message: '密碼確認不符合!' });
    } // if
  
    if (errors.length > 0) {
      res.render('loginT', { errors, name, password, password_confirm });
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
            errors.push({ message: '你已經註冊過了!' });
            return res.render('loginT', { errors, name, password, password_confirm });
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

/*  this area is for my guest test
router.get('/guest', (req, res) => {
  res.redirect(`/users/guest/${uuidv4()}`);
});


router.get('/guest/:id', (req, res) => {
  console.log("open doc uuid: " + req.params.id);
  res.render('testpage' ,{ textid:req.params.id ,user:'guest'});
});
*/


module.exports = router;