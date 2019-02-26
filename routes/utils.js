const User = require('../Models/User')

const parseCookie = (cookie) => {
  const cookieArr = cookie.split(";");
  let coookieObject = {}
  cookieArr.forEach(cookietype => {
    const key = cookietype.split('=')[0].trim();
    const value = cookietype.split('=')[1].trim();
    coookieObject[`${key}`] = value;
  });

  return coookieObject;
}

function checkRememberMe(req, res, next) {
  const { cookie } = req.headers;
  if (parseCookie(cookie).rememberId){
    const cookieuser = parseCookie(cookie).rememberId.split("22")[1].replace('%','').trim();
    User.findById(cookieuser)
    .then(user => {
      if (user){
        req.login(user, (err) => {
          if (err) { return next(err); }
          return res.redirect('/');
        });
      }
      else{
        return res.clearCookie('rememberId').redirect('/users/login')
      }
    })
  }
  else{
    next();
  }
} 


module.exports = {  parseCookie, checkRememberMe  };
