const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect('/users/dashboard');
    }
    next();
  }
  
const checkNotAuthenticated = (req, res, next) =>{
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/users/login');
}
module.exports ={
    checkAuthenticated :checkAuthenticated,
    checkNotAuthenticated:checkNotAuthenticated
}