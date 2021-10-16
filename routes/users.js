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

router.get('/MainDashboard',Auth.checkNotAuthenticated, (req, res) => {
  const user = req.user.user_name;
  const id = parseInt(req.user.id,10);
  pool.query(`select classification from user_classify where id = $1`,[id],(err,results)=>{
    res.render('dashboard',{user:user, id:id, allclassify:results.rows,keyword:undefined});
  })
  
});


router.get('/dashboard/:Uclass', Auth.checkNotAuthenticated, (req, res) => {
    const user = req.user.user_name;
    const Uclass = req.params.Uclass;
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
      res.render('dashboardT', { user: user, allnotes : results.rows ,limit:showSelect,nav:range, keyword:'undefined',Uclass:Uclass});
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
      res.render('dashboardT', { user: user, allnotes : results.rows ,limit:showSelect,nav:range, keyword:key, all_key:keyword,Uclass:Uclass});
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
      res.render('dashboardT', { user: user, allnotes : results.rows ,limit:showSelect,nav:range, keyword:key, all_key:keyword,Uclass:Uclass});
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
      res.render('dashboardT', { user: user, allnotes : results.rows ,limit:showSelect,nav:range, keyword:key, all_key:keyword,Uclass:Uclass});
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
      res.render('dashboardT', { user: user, allnotes : results.rows ,limit:showSelect,nav:range, keyword:key, all_key:keyword,Uclass:Uclass});
      });//not consider the query fail
    }//else title search


    
});




router.get('/note_delete_page', Auth.checkNotAuthenticated, (req, res) => {
  const user = req.user.user_name;
  pool.query(`select note_title,note_id,created_at from note_content
  where create_user=$1 and multi_user = false`,[user],(err,results)=>{
    res.render('note_delete_page', { user: user, allnotes : results.rows });
  });//not consider the query fail 
  
});


// use for deleting a note in single mode
router.get('/note_delete/:id', Auth.checkNotAuthenticated, (req, res) => {
  const note = req.params.id;

  pool.query(`delete from note_content
  where note_id = $1`,[note],(err,results)=>{
    // res.render('note_delete_page', { user: user, allnotes : results.rows });
  });// delete one note

  const user = req.user.user_name;
  pool.query(`select note_title,note_id,created_at from note_content
  where create_user=$1 and multi_user = false`,[user],(err,results)=>{
    res.render('dashboardT', { user: user, allnotes : results.rows, keyword:'',limit:false });
  });//not consider the query fail 
});




router.get('/login', Auth.checkAuthenticated, (req, res) => {
    res.render('loginT');
});



router.post('/login',passport.authenticate('local', {
      successRedirect: '/users/MainDashboard',
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


router.get('/:Uclass/edit', (req, res) => {
  res.redirect(`/:Uclass/users/edit/${uuidv4()}`);
});


router.get('/edit/:id',Auth.checkNotAuthenticated, (req, res) => {
  console.log("open doc uuid: " + req.params.id);
  res.render('testpage' ,{ textid:req.params.id ,user:req.user.user_name,multiuser:'false',group_name:undefined});
});

router.get('/:group_name/edit_multi', (req, res) => {
  let group_name = req.params.group_name;
  res.redirect(`/users/`+group_name+`/edit_multi/${uuidv4()}`);
});


router.get('/:group_name/edit_multi/:id',Auth.checkNotAuthenticated, (req, res) => {
  console.log("open doc uuid: " + req.params.id);
  let group_name = req.params.group_name;
  res.render('testpage' ,{ textid:req.params.id ,user:req.user.user_name,multiuser:'true',group_name:group_name});
});


router.get('/setting_page', Auth.checkNotAuthenticated, (req, res) => {
  res.render('setting_page');
});

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
  
  /*
  if (errorlog == 0)
    alert('密碼已更新!請重新登入');
  else if (errorlog == 1)
    alert('密碼確認時發生錯誤!');
  else if (errorlog == 2)
    alert('原密碼輸入錯誤!');

  */

  req.logout();
  res.render('indexT', { message: 'You have logged out successfully!' });
}); // router


router.get('/group_page_choose', Auth.checkNotAuthenticated, (req, res) => {
  const user = req.user.user_name;
  //console.log(user);
  pool.query(`select group_name from login_module
  where user_name=$1`,[user],(err,results)=>{
    res.render('group_page', { user: user, allgroups: results.rows ,Alert:false});
  });//not consider the query fail 
});


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
    } else {
      console.log("Search group not found!");
      pool.query(`select group_name from login_module
       where user_name=$1`,[user],(err,results)=>{
        res.render('group_page', { user: user, allgroups: results.rows, Alert:true });
      });//not consider the query fail 
    } // else
  });
  /*
  var found = false ;
  for ( var i = 0 ; i < temp.group_name.length ; i++ ) {
      if (search_group == temp.group_name[i] ) {
        found = true ;
        break ;
      } // if

  } // for

  if ( found == true ) {
    pool.query(`select * from group_module
    where group_name = &1`, [user], (err, results)=>{
      res.render('dashboardT_multi', { user: user, allnotes : results.rows });
    });
  } else {
    console.log("Search group not found!");
  } // else
  */
});


router.post('/new_group', async (req, res) => {
  const user = req.user.user_name;
  let { new_group } = req.body;

  pool.query(`insert into group_module
  values ($1, $2, $3)`,[new_group, null, null], (err, results)=>{
    pool.query(`UPDATE login_module
    SET group_name = array_append(group_name, $1)
    where user_name = $2`,[new_group, user], (err, results)=>{
      const name = req.body.new_group;
      pool.query(`select * from group_module
      where group_name = $1`, [name], (err, results)=>{
      res.render('dashboardT_multi', { user: user, allnotes : results.rows });
      });
      
    });
      
  });
  /*
  pool.query(`UPDATE login_module
  SET group_name = array_append(group_name, $1)
  where user_name = $2`,[new_group, user], (err, results)=>{
      ;
  });

  const name = req.params.id;
  pool.query(`select * from group_module
  where group_name = $1`, [name], (err, results)=>{
    res.render('dashboardT_multi', { user: user, allnotes : results.rows });
  });
  */
});


router.get('/group_page/:id', Auth.checkNotAuthenticated, (req, res) => {
  const name = req.params.id;
  const user = req.user.user_name;
  pool.query(`select * from group_module
  where group_name = $1`, [name], (err, results)=>{
    console.log("rows: " + results.rows[0].group_name) ;
    res.render('dashboardT_multi', { user: user, allnotes : results.rows, group_name:results.rows[0].group_name });
  });
});


router.get('/pict_editor', Auth.checkNotAuthenticated, (req, res) => {
  res.render('pict_editorT');
});


module.exports = router;