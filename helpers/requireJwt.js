const jwt = require('jsonwebtoken');
const Config = require('../config/database');
const requireJwt = (req,res,next) => {
    const token = req.headers.authorization;
    if(!token){
        res.json({success:false, response: 'Token failed to load'});
    }else{
        jwt.verify(token, Config.secret, (err, decoded) => {
            if(err) return next(err);
            req.decoded = decoded;
            next();
        });
    }
}

//= =======================================
// Authorization Middleware
//= =======================================

// Role authorization check
exports.roleAuthorization = function (requiredRole) {
    return function (req, res, next) {
      const user = req.user;
  
      User.findById(user._id, (err, foundUser) => {
        if (err) {
          res.status(422).json({ error: 'No user was found.' });
          return next(err);
        }
  
        // If user is found, check role.
        if (getRole(foundUser.role) >= getRole(requiredRole)) {
          return next();
        }
  
        return res.status(401).json({ error: 'You are not authorized to view this content.' });
      });
    };
  };
  
module.exports = requireJwt;