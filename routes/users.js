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

/* 
  called by: loginT.ejs
  to: loginT.ejs
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

              req.flash('success_msg', 'You are successfuly registered!');
              res.redirect('/users/login');
            }
          ); // pool.query()
        } // else
      }
    ); // pool.query()
  } // else
});


/*
  render to: loginT.ejs
*/
  router.get('/login', Auth.checkAuthenticated, (req, res) => {
  res.render('loginT');
});


/*
  success: to /users/dashboard
  failure: to /users/login
*/
router.post('/login',passport.authenticate('local', {
  successRedirect: '/users/dashboard',
  failureRedirect: '/users/login',
  failureFlash: true,
}));

/*
  log out: to indexT.ejs (start page)
*/
router.get('/logout', (req, res) => {
  req.logout();
  res.render('indexT', { message: 'You have logged out successfully!' });
});


/* ****************************** single user ****************************** */

/*
  user's main page
  dashboard url with parameters is for searching keywords
  redirect to: dashboardT.ejs
*/
router.get('/dashboard', Auth.checkNotAuthenticated, (req, res) => {
    const user = req.user.user_name;

    var keyword = req.query.keyword;
    const key = keyword;
    if(typeof key !== 'undefined'){
      keyword = key.split(" ");
      const total_length = keyword.length;
      for(i = 0;i<total_length;i++ ){
        if(keyword[i] == ""){
           keyword.splice(i,1);
         }//if
      }//for to split users mutiple keyword
      if(keyword.length!=1) keyword.push('%'+key+"%");
    }//if
    var range = req.query.range;
    var showSelect = true;
    if(typeof range === 'undefined' && typeof keyword === 'undefined' ) showSelect=false;
    if(typeof keyword === 'undefined' ){
      pool.query(`select note_title,note_id,created_at,note_paragraph from note_content
      where create_user=$1 and multi_user = false `,[user],(err,results)=>{
      res.render('dashboardT', { user: user, allnotes : results.rows ,limit:showSelect,nav:range, keyword:'undefined'});
      });//not consider the query fail 
    }//if
    else if( (range === "all" || typeof range === 'undefined') ){ // need concat the search keyword
      var all_condi = "(";
      for(num =0;num<keyword.length;num++){
        var condi = "(note_title like '%"+keyword[num]+"%' OR note_paragraph like '%"+keyword[num]+"%' )";
        all_condi = all_condi+condi;
        if(num+1!=keyword.length) all_condi = all_condi+" OR ";
      }//for concat the query string
      all_condi = all_condi+")";
      pool.query(`select note_title,note_id,created_at,note_paragraph from note_content
      where create_user=$1 and  multi_user = false and `+all_condi,[user],(err,results)=>{
      res.render('dashboardT', { user: user, allnotes : results.rows ,limit:showSelect,nav:range, keyword:key, all_key:keyword});
      });//not consider the query fail
    }//else if
    else if(range === "content"){  // need concat the search keyword
      var all_condi = "(";
      for(num =0;num<keyword.length;num++){
        var condi = "note_paragraph like '%"+keyword[num]+"%'";
        all_condi = all_condi+condi;
        if(num+1!=keyword.length) all_condi = all_condi+" OR ";
      }//for concat the query string
      all_condi = all_condi+")";
      pool.query(`select note_title,note_id,created_at,note_paragraph from note_content
      where create_user=$1  and multi_user = false and `+all_condi,[user],(err,results)=>{
      res.render('dashboardT', { user: user, allnotes : results.rows ,limit:showSelect,nav:range, keyword:key, all_key:keyword});
      });//not consider the query fail
    }//else if
    else if(range === "tags"){  // need concat the search keyword(tag)
      var all_condi = "";
      var user_tags ="";
      for(num =0;num<keyword.length;num++){
        user_tags = user_tags+" elem like '%"+keyword[num]+"%'";
        if(num+1!=keyword.length) {all_condi = all_condi+" OR "; user_tags = user_tags + " OR "}//for
      }//for concat the query string
      all_condi = all_condi+"((    EXISTS (SELECT  FROM   unnest(tags) elem WHERE"+user_tags+")) or (    EXISTS (SELECT  FROM   unnest(user_tags) elem WHERE"+user_tags+")))";
      pool.query(`select note_title,note_id,created_at,note_paragraph from note_content where create_user = $1  and multi_user = false and `+all_condi,
      [user],(err,results)=>{
      res.render('dashboardT', { user: user, allnotes : results.rows ,limit:showSelect,nav:range, keyword:key, all_key:keyword});
      });//not consider the query fail
    }//else if
    else {  // need concat the search keyword (title)
      var all_condi = "(";
      for(num =0;num<keyword.length;num++){
        var condi = "note_title like '%"+keyword[num]+"%'";
        all_condi = all_condi+condi;
        if(num+1!=keyword.length) all_condi = all_condi+" OR ";
      }//for concat the query string
      all_condi = all_condi+")";
      pool.query(`select note_title,note_id,created_at,note_paragraph from note_content
      where create_user=$1  and multi_user = false and `+all_condi,[user],(err,results)=>{
      res.render('dashboardT', { user: user, allnotes : results.rows ,limit:showSelect,nav:range, keyword:key, all_key:keyword});
      });//not consider the query fail
    }//else title search
});

/*
  redirect to: /edit/:id
*/
router.get('/edit', (req, res) => {
  res.redirect(`/users/edit/${uuidv4()}`);
});

/*
  new a note (render to testpage.ejs), the parameter multiuser is false
  press back will return to back page
*/
router.get('/edit/:id',Auth.checkNotAuthenticated, (req, res) => {
  console.log("open doc uuid: " + req.params.id);
  res.render('testpage' ,{ textid:req.params.id ,user:req.user.user_name,multiuser:'false', group_name:null});
});

// /users/group_page_choose is below

/*
  show the same notes as in /users/dashboard
  render to note_delete_page.ejs
*/
router.get('/note_delete_page', Auth.checkNotAuthenticated, (req, res) => {
  const user = req.user.user_name;
  pool.query(`select note_title,note_id,created_at from note_content
  where create_user=$1 and multi_user = false`,[user],(err,results)=>{
    res.render('note_delete_page', { user: user, allnotes : results.rows });
  }); 
  
});

/*
  called from: /users/note_delete_page when the user clicks what to be deleted
  Although it will turn back to user's main page(dashboard), the url is still /users/note_delete/:id.
  (a bug hasn't fixed)
*/
router.get('/note_delete_page/:id', Auth.checkNotAuthenticated, (req, res) => {
  const note = req.params.id;

  pool.query(`delete from note_content
  where note_id = $1`,[note],(err,results)=>{
    ;
  });// delete the specified note

  const user = req.user.user_name;
  pool.query(`select note_title,note_id,created_at from note_content
  where create_user=$1 and multi_user = false`,[user],(err,results)=>{
    res.render('dashboardT', { user: user, allnotes : results.rows, keyword:'',limit:false });
  }); 
});

/*
  render to setting_page.ejs to update password (/users/update_psw)
*/
router.get('/setting_page', Auth.checkNotAuthenticated, (req, res) => {
  res.render('setting_page');
});

/*
  press back to the back page
  
  if update password successfully:
    render to indexT.ejs to login with new password
  else(update password failed):
    render to indexT.ejs without changing to password
    (a bug hasn't fixed)
*/
router.post('/update_psw', async (req, res) => {
  const user = req.user.user_name;
  let { old_password, new_password, password_confirm } = req.body;
  console.log("old: " + old_password);
  console.log("new: " + new_password);

  hashedPassword = await bcrypt.hash(new_password, 10);
  console.log("hash_new: " + hashedPassword);

  var errorlog = 0 ;
  pool.query(
    `SELECT * FROM login_module WHERE user_name = $1`,
    [user],
    (err, results) => {
      if (err) {
        throw err;
      } // if

      if (results.rows.length > 0) {
        bcrypt.compare(old_password, results.rows[0].user_password, (err, isMatch) => {
          if (err) {
            // window.alert("密碼輸入錯誤!");
            res.render('setting_page');
          } // if

          if (isMatch) {
            if (new_password == password_confirm && new_password != "") {

              pool.query(
                `update login_module
                set user_password = $1
                where user_name = $2`,
                [hashedPassword, user],
                (err, results) => {
                  if (err) {
                    throw err;
                  } // if
                }
              ); // pool
    
              console.log("密碼已更新!");
              errorlog = 0;
              
            } else {
              console.log("密碼確認時發生錯誤!");
              errorlog = 1;

              pool.query(`select note_title,note_id,created_at from note_content
              where create_user=$1 and multi_user = false`,[user],(err,results)=>{
                res.render('dashboardT', { user: user, allnotes: results.rows ,keyword:'',limit :false});
              });//not consider the query fail
            } // else

          } else {
            console.log("密碼確認時發生錯誤2!");
            errorlog = 2;

            pool.query(`select note_title,note_id,created_at from note_content
            where create_user=$1 and multi_user = false`,[user],(err,results)=>{
              res.render('dashboardT', { user: user, allnotes: results.rows ,keyword:'',limit:false});
            });//not consider the query fail
          } // else
       }); // bcrypt.compare
      } // if
    }
  ); // pool query
  
  req.logout();
  res.render('indexT', { message: 'You have logged out successfully!' });
}); // router


/* ****************************** multi users ****************************** */

/* 
  render to group_page.ejs
  press back will return to the back page

  there are three ways to the group mode:
    1. /users/search_group
    2. /users/new_group
    3. /users/group_page/:id

  then render to dashboardT_multi.ejs.
*/
router.get('/group_page_choose', Auth.checkNotAuthenticated, (req, res) => {
  const user = req.user.user_name;
  //console.log(user);
  pool.query(`select group_name from login_module
              where user_name=$1`,[user],(err,results)=>{
    res.render('group_page', { user: user, allgroups: results.rows ,Alert:false});
  });//not consider the query fail 
});


/*
  problems!
*/
router.post('/search_group', async (req, res) => {
  const user = req.user.user_name;
  let { search_group } = req.body;

  var temp = "" ;
  pool.query(`select group_name from login_module`, (err, results)=>{
    temp = results.rows ;

    var found = false ;
    for ( var i = 0 ; temp != null && i < temp.length ; i++ ) {
      if (search_group == temp[i].group_name ) {
        found = true ;
        break ;
      } // if
    } // for

    if ( found == true ) {
      pool.query(`select * from group_module
      where group_name = $1`, [req.body.search_group], (err, results)=>{
        res.render('dashboardT_multi', { user: user, allnotes : results.rows });
      });
    } else { // not found
      console.log("Search group not found!");
      pool.query(`select group_name from login_module
       where user_name=$1`,[user],(err,results)=>{
        res.render('group_page', { user: user, allgroups: results.rows, Alert:true });
      });
    } // else
  });
});

/*
  if found an group with the same group name: show the alert window and back to group_page.ejs
  else: update this new group name to login_module(DB) and render to dashboardT_multi.ejs
*/
router.get('/new_group', async (req, res) => {
  const user = req.user.user_name;
  let { new_group } = req.body;

  /*  建新的組：
      1. 我們先看組名有沒有出現
      2. if 有，不加入且跳出Alert視窗
        else, 建立新的組並進入dashboardT_multi
  */
  console.log("group_name: " + new_group);
  pool.query(`select * from login_module
  where EXISTS (SELECT FROM unnest(group_name) elem 
                WHERE elem like $1)`,[new_group], (err, results)=>{
  
    console.log("results.rows: " + results.rows );
    if (results.rows.length > 0) { // 此組名已存在
      console.log("New group name exists!");

      pool.query(`select group_name from login_module
                  where user_name=$1`,[user],(err,results)=>{
        res.render('group_page', { user: user, allgroups: results.rows, Alert:true });
      });

    } 
    else {
      pool.query(`UPDATE login_module
      SET group_name = array_append(group_name, $1)
      where user_name = $2`,[new_group, user], (err, results)=>{
    
        pool.query(`select * from note_content
                    where multi_user is true 
                    and create_user = $1 and group_name = $2`, [user, new_group], (err, results)=>{
          res.render('dashboardT_multi', { user: user, allnotes : results.rows, group_name: new_group });
        }); // basically no any notes

      });
   }
  });
});

/*
  Seems no problems.
*/
router.get('/group_page/:id', Auth.checkNotAuthenticated, (req, res) => {
  const name = req.params.id;
  const user = req.user.user_name;

  pool.query(`select * from note_content
              where multi_user is true 
              and create_user = $1 and group_name = $2`, [user, name], (err, results)=>{
    res.render('dashboardT_multi', { user: user, allnotes : results.rows, group_name: results.rows[0].group_name });
  });

});

/*
  to edit page of multi-users
*/
router.get('/:group_name/edit_multi', (req, res) => {
  let group_name = req.params.group_name;
  res.redirect(`/users/` + group_name + `/edit_multi/${uuidv4()}`);
});

/*

*/
router.get('/:group_name/edit_multi/:id',Auth.checkNotAuthenticated, (req, res) => {
  console.log("open doc uuid: " + req.params.id);
  let group_name = req.params.group_name;
  res.render('testpage' ,{ textid:req.params.id ,user:req.user.user_name,multiuser:'true', group_name:group_name});
});

/*
  error occured!
*/
router.get('/note_delete_page_multi', Auth.checkNotAuthenticated, (req, res) => {
  const user = req.user.user_name;
  const group_name = req.user.group_name;

  console.log("user name: " + user);
  console.log("group_name: " + group_name);

  pool.query(`select note_title,note_id,created_at from note_content
  where multi_user = true and create_user=$1`,[user],(err,results)=>{
    console.log("results.rows: " + results.rows); // 加上了
    res.render('note_delete_page_multi', { user: user, allnotes : results.rows });
  }); 
  
});

/*
  same as above
*/
router.get('/note_delete_page_multi/:id', Auth.checkNotAuthenticated, (req, res) => {
  const note = req.params.id;

  pool.query(`delete from note_content
  where note_id = $1`,[note],(err,results)=>{
    ;
  });// delete the sepcified note

  const user = req.user.user_name;
  const group_name = req.user.group_name;
  pool.query(`select note_title,note_id,created_at from note_content
  where create_user=$1 and multi_user = true and group_name=$2`,[user, group_name],(err,results)=>{
    res.render('note_delete_page_multi', { user: user, allnotes : results.rows });
  }); 
});


/* ****************************** Other functions ****************************** */


router.get('/pict_editor', Auth.checkNotAuthenticated, (req, res) => {
  res.render('pict_editorT');
});


module.exports = router;