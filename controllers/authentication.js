const User = require("../model/user"),
  Payment = require("../model/payment"),
  jwt = require("jsonwebtoken"),
  crypto = require("crypto"),
  randn = require("randn"),
  rest = require("restler"),
  Client = require("node-rest-client").Client,
  Config = require("../config/database");
  //Helper = require("../helpers/helper");

/**
 * USER REGISTRATION
 */
exports.register = (req, res, next) => {
  let frm = req.body;
  fullname = frm.fullname;
  phonenumber = frm.phonenumber;
  password = frm.password;
  email = frm.email;

  if (!fullname) {
    res.json({
      success: false,
      statusCode: "NAME-REQUIRED",
      response: `Fullname is required`
    });
  }

  if (!phonenumber) {
    res.json({
      success: false,
      statusCode: "PHONE-REQUIRED",
      response: `Phone number required`
    });
  }

  if (!password) {
    res.json({
      success: false,
      statusCode: "PASSWORD-REQUIRED",
      response: `Password is required`
    });
  }

  if (!email) {
    res.json({
      success: false,
      statusCode: "EMAIL-REQUIRED",
      response: `Email required`
    });
  }

  let obj = new User({
    fullname: fullname,
    phonenumber: phonenumber,
    password: password,
    email: email,
    verificationCode: randn(5)
  });

  obj.save((err, savedObject) => {
    if (err) {
      //  console.log(err);

      //  res.json(err);
      if (err.errors) {
        if (err.errors.email) {
          res.json({ success: false, response: err.errors.email.message });
        }
        if (err.errors.phonenumber) {
          res.json({
            success: false,
            response: err.errors.phonenumber.message
          });
        }
        if (err.errors.password) {
          res.json({ success: false, response: err.errors.password.message });
        }
      } else if (err.code == "11000") {
        res.json({
          success: false,
          response: `Email or phonenumber already exist.`
        });
      } else {
        res.json({
          success: false,
          response: `Error processing request, please try again.`
        });
      }
    } else {
      msg =
        "Hi, this is your verification code for PocaWallet " +
        savedObject.verificationCode;
      to = phonenumber;
      companyName = "PocaWallet";
      //  Helper.SendVerificationMessage(msg,to,companyName);

      res.json({
        success: true,
        statusCode: "REGISTERED-SUCCESS",
        response: `Account successfully created`,
        user: savedObject
      });
    }
  });
};

/***
 * VERIFIES USER WITH MOMO PROMPT AS OTP
 */

exports.verifyToken = (req, res, next) => {
  //? /verifyToken/:token

  if(!req.params.token){
    res.json({success:false, statusCode:`TOKEN-REQ`, response:`Please provide your verification token`});
  }


  User.findOne({verificationCode: req.params.token //,verificationCodeApproved: false
    // $and: [
    //   { verificationCode: req.params.token },
    //   { verificationCodeApproved: false }
    // ]
  }).exec((err, theUserFound) => {
    if (err) return next(err);

    if (!theUserFound) {
      res.json({
        success: false,
        statusCode: "USER-NOT-FOUND",
        response: `User not found`
      });
    } else {
      //activate token, send OTP of 1ghc to momo name and number
      //SEND SMS AND SET VER.CODE TO TRUE AFTER MOMO CONFIRMED
      //?momo args
      username = theUserFound.fullname;
      phonenumber = theUserFound.phonenumber;

      //FIXME if the momo is accepted u then set the user verification to true
      theUserFound.verificationCodeApproved = true;
      theUserFound.verificationCode = "";
      args =    Helper.sendMomoPromptArgs(username,phonenumber); //momo args

      theUserFound.save((err, mm) => {
        // msg = `Hooraay!!! Your PocaWallet Account has been activated. Enjoy your stay with us.`;
        // to = theUserFound.phonenumber;

       // send momo money
        client = new Client();
        let baseUrl = "https://api.hubtel.com/v1/merchantaccount/merchants/HM2408170009/receive/mobilemoney";

        client.post(baseUrl,args,(hubtel, response)=> {

            let pay = new Payment({
                user: theUserFound._id,
                TransactionId: hubtel.Data.TransactionId,
                ClientReference: hubtel.Data.ClientReference
            });

            pay.save();
           console.log(hubtel);

        });

        //  Helper.SendVerificationMessage(msg,to,companyName);
        res.json({
          success: true,
          statusCode: "ACCOUNT-VERIFIED",
          response: `Your account is verified`,
          user: mm
        });
      });
    }
  });
};

/****
 * LOGIN USER AFTER SIGNUP
 */

exports.login = (req, res, next) => {
  let frm = req.body;
  phonenumber = frm.phonenumber;
  //email = frm.email;
  password = frm.password;

  if(!phonenumber ){ //|| !  email
    res.json({success:false, statusCode:`EMAIL/PHONENUMBER-REQ`, response:`You must login with either your phonenumber or email and password`})
  }

  if(!password){
    res.json({success:false, statusCode:`PASS-REQ`, response:`Please provide your password`})
  }

  User.findOne({ phonenumber: phonenumber
   // $or: [{ phonenumber: phonenumber }, { email: email }]
  }).exec((err, theUserFound) => {
    if (err) return next(err);
    if (!theUserFound) {
      res.json({
        success: false,
        statusCode: "USER-NOT-FOUND",
        response: `User not registered on PocaWallet`
      });
    }
    
    //FIXME  uncommment this case sake of user 
    else if (theUserFound.verificationCodeApproved == false) {
      res.json({
        success: false,
        statusCode: "VERIFY-ACCOUNT",
        response: `Your account is not verified yet`
      });
    } else {
      theUserFound.comparePassword(password, (err, passwordMatch) => {
        if (err) return next(err);

        if (!passwordMatch) {
          res.json({
            success: false,
            statusCode: "PASSWORD-MISMATCH",
            response: `Password mismatch, please check and try again`
          });
        }

        if (passwordMatch) {
          //stick user to jwt
          const token = jwt.sign({ userId: theUserFound.id }, Config.secret, {
            expiresIn: "24h"
          });
          res.json({
            success: true,
            response: `Login successful`,
            token: token,
            payload: { phonenumber: theUserFound.phonenumber }
          });
        }
      });
    }
  });
};

/****
 * RESET PASSWORD
 */

exports.resetPassword = (req, res, next) => {

  if(!req.body.email){
    res.json({success:false, statusCode:`EMAIL-REQ`, response:`Please provide your email`});
  }
  User.findOne({ email: req.body.email }).exec((err, existingUser) => {
    if (err) return next(err);

    if (!existingUser) {
      res.json({
        success: false,
        statusCode: "USER-NOT-FOUND",
        response: `User not found`
      });
    }

    crypto.randomBytes(48, (err, buffer) => {
      const resetToken = buffer.toString("hex");
      if (err) return next(err);
      existingUser.password.resetPasswordToken = resetToken;
      existingUser.password.resetTokenExpires = Date.now + 3600000; //! 1hr

      existingUser.save(err => {
        if (err) return next(err);

        const message = {
          subject: "Reset Password",
          text:
            `${"You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
              "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
              "http://"}${req.headers.host}/reset-password/${resetToken}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        //mailgun.send( existingUser.email, message);
        res.json({
          success: true,
          statusCode: "EMAIL-SENT",
          response: `An email has been sent to you, please follow the instructions and reset your password`
        });
      });
    });
  });
};

/***
 * USER PROFILE
 */
exports.profile = (req, res, next) => {
  User.findById({ _id: req.decoded.userId }).exec((err, user) => {
    if (err) return next(err);
    if (!user) {
      res.json({
        success: false,
        statusCode: "USER-NOT-FOUND",
        response: `User not found`
      });
    } else {
      res.json({ success: true, statusCode: "LOGIN-SUCCESS", response: user });
    }
  });
};
