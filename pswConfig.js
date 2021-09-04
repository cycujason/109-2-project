const LocalStrategy = require('passport-local').Strategy;
const { pool } = require('./config');
const bcrypt = require('bcrypt');

function initialize(passport) {
  console.log('Initialized');

  const authenticateUser = (name, password, done) => {
    pool.query(
      `SELECT * FROM login_module WHERE user_name = $1`,
      [name],
      (err, results) => {
        if (err) {
          throw err;
        } // if
        
        const data = results.rows;
        if (results.rows.length > 0) {
          const user = results.rows[0];
          bcrypt.compare(password, data[0].user_password, (err, isMatch) => {
            if (err) {
              console.log("err from pswConfig.js: " + err);
            } // if

            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: '密碼不正確!' });
            } // else
          }); // bcrypt
        } else {
          return done(null, false, { message: '您尚未註冊!' });
        } // else
      }
    ); // pool.query()
  };

  // set strategies
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'name',
        passwordField: 'password',
      },
      authenticateUser
    )
  );

  // serializeUser(): set which user data to be stored into Session
  passport.serializeUser((user, done) => done(null, user.id));

  // deserializeUser(): to get user data from Session
  passport.deserializeUser((id, done) => {
    pool.query(`SELECT * FROM login_module WHERE id = $1`, [id], (err, results) => {
      if (err) {
        return done(err);
      } // if
      // console.log(`ID is ${results.rows[0].id}`);
      return done(null, results.rows[0]);
    }); // pool.query()
  }); // passport.deserializeUser()
}

module.exports = initialize;