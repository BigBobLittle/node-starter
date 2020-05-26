const jwt = require('jsonwebtoken');
const Config = require('../config/database');
const User = require('../model/user');

/**
 * @name requireJwt
 * @description MIDDLEWARE TO CHECK IF JWT IS PASSED AS PART OF REQUEST , and then verify it
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const requireJwt = (req,res,next) => {
    const token = req.headers.authorization;
    if(!token){
        res.status(422).json({success:false, response: 'Token failed to load'});
    }else{
        jwt.verify(token, Config.secret, (err, decoded) => {
            if(err) return next( res.status(422).json({success:false, response: 'JWT ERROR'}));
            req.decoded = decoded;
            next();
        });
    }
}

/**
 * @NAME roleAuthorization
 * @description middleware to check a users Role 
 * @param {*} requiredRole 
 */

const roleAuthorization = (requiredRole) => {
   return async(req,res,next) => {
    let user =    await User.findById(req.decoded.id);
    if(!user){
      res.status(422).json({Error: 'No user was found.'});
      return next();
    }

    //if user is found
    if(user.role == requiredRole){
      return next();
    }else{
      return res.status(401).json({Error: 'You are not authorized to view this content.'})
    }
   }
}


  
module.exports = {
  requireJwt,
  roleAuthorization,
  
}