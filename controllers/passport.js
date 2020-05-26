const  passport = require('passport'),
       User = require('../model/user'),
       FacebookTokenStrategy = require('passport-facebook-token'),
 accessToken = "";

module.exports = function() {

    passport.use(new FacebookTokenStrategy({
        clientID: "",
        clientSecret: "",
    fbGraphVersion: 'v3.0'
      }, async function(accessToken, refreshToken, profile, done) {
                const facebookUser =  await User.findOne({facebook_id: profile.id});
          // check if user is already loggedin 
          if(facebookUser){
              return console.log('user is already logged in');
          }
           console.log(facebookUser)
          //return done(error, facebookUser);
        // User.findOrCreate({facebookId: profile.id}, function (error, user) {
        //   return done(error, user);
        // });
      }
    ));
    // passport.use( new facebookTokenStrategy({
    //     clientID: "711410179207385",
    //     clientSecret: "d932bbf9f0ffe77d5c682c1963f3d179",
    //     fbGraphVersion: 'v3.0'
    // }, async(accessToken, refreshToken,profile, done) => {
    //     try {
    //       // find user 
    //       const facebookUser = await User.findOne({facebook_id: profile.id});
    //       // check if user is already loggedin 
    //       if(facebookUser){
    //           return console.log('user is already logged in');
    //       }
    
    
    //       const email = profile.email[0].value; 
    //       const {id:facebook_id, displayName: fullname} = profile;
    
    //       const user = await User.create({email, facebook_id, fullname});
    
    //       console.log(user)
    //     } catch (error) {
    //         done(error, false, error.message)
    //     }
    // }));
}