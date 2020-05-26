const User = require("../model/user"),
  jwt = require("jsonwebtoken"),
  crypto = require("crypto"),
  randn = require("randn"),
  skipTryCatch = require("@bigboblittle/skiptrycatch").skipTryCatch,
  Config = require("../config/database");

//Helper = require("../helpers/helper");

/**
 * @name register
 * @description USER REGISTRATION
 */
exports.register = async (req, res) => {
  try {
    //get required dataa
    const { fullname, phonenumber, password, email } = req.body;

    //checks to pass valid data
    if (!fullname) {
      res.json({
        success: false,
        statusCode: "NAME-REQUIRED",
        response: `Fullname is required`,
      });
    }

    if (!phonenumber) {
      res.json({
        success: false,
        statusCode: "PHONE-REQUIRED",
        response: `Phone number required`,
      });
    }

    if (!password) {
      res.json({
        success: false,
        statusCode: "PASSWORD-REQUIRED",
        response: `Password is required`,
      });
    }

    if (!email) {
      res.json({
        success: false,
        statusCode: "EMAIL-REQUIRED",
        response: `Email required`,
      });
    }

    //create new user
    const newUser = new User({
      fullname: fullname,
      phonenumber: phonenumber,
      password: password,
      email: email,
      verificationCode: randn(5),
    });

    //save user , send sms message and send response to user
    const dataSaved = await newUser.save();
    if (dataSaved) {
      //prepare and send sms
      //  let msg = `Hi, this is your verification code  ${dataSaved.verificationCode}`;
      //   let to = phonenumber;
      //let companyName = "overide company name here";
      //  Helper.SendMessage(msg,to,companyName);

      res.json({
        success: true,
        statusCode: "REGISTERED-SUCCESS",
        response: `Account successfully created`,
        user: dataSaved,
      });
    }
  } catch (err) {
    if (err.errors) {
      if (err.errors.email) {
        res.json({ success: false, response: err.errors.email.message });
      }
      if (err.errors.phonenumber) {
        res.json({
          success: false,
          response: err.errors.phonenumber.message,
        });
      }
      if (err.errors.password) {
        res.json({ success: false, response: err.errors.password.message });
      }
    } else if (err.code == "11000" || err.code == 11000) {
      res.json({
        success: false,
        response: `Email or phonenumber already exist.`,
      });
    } else {
      res.json({
        success: false,
        response: `Error processing request, please try again.`,
      });
    }
  }
};

/***
 * @name verifyToken
 * @description VERIFIES USER WITH SMS CODE SENT TO PHONE
 * @expects the sms code as :params.token
 */

exports.verifyToken = skipTryCatch(async (req, res) => {
  //require user to input the sms code sent to their phone
  if (!req.params.token) {
    res.json({
      success: false,
      statusCode: `TOKEN-REQ`,
      response: `Please provide your verification token`,
    });
  }

  //use sms code to check if user exist
  let theUserFound = await User.findOne({ verificationCode: req.params.token });

  //response if user does not exist
  if (!theUserFound) {
    res.json({
      success: false,
      statusCode: "USER-NOT-FOUND",
      response: `User not found`,
    });
  }

  //set activation to true if user exist
  theUserFound.verificationCodeApproved = true;
  theUserFound.verificationCode = "";

  //save info and send sms
  const savedInfo = await theUserFound.save({ validateBeforeSave: false });
  if (savedInfo) {
    // msg = `Hooraay!!! Your PocaWallet Account has been activated. Enjoy your stay with us.`;
    // to = theUserFound.phonenumber;

    //  Helper.SendMessage(msg,to,companyName);

    res.json({
      success: true,
      statusCode: "ACCOUNT-VERIFIED",
      response: `Your account is verified`,
      user: savedInfo,
    });
  }
});

/****
 * @name login
 * @description LOGIN USER AFTER SIGNUP
 */
exports.login = skipTryCatch(async (req, res) => {
 
  const {phonenumber, password} = req.body; 
  if (!phonenumber) {
    //|| !  email
    res.json({
      success: false,
      statusCode: `EMAIL/PHONENUMBER-REQ`,
      response: `You must login with either your phonenumber or email and password`,
    });
  }

  if (!password) {
    res.json({
      success: false,
      statusCode: `PASS-REQ`,
      response: `Please provide your password`,
    });
  }

  let theUserFound = await User.findOne({ phonenumber: phonenumber }); // $or: [{ phonenumber: phonenumber }, { email: email }]

  //check if user exist
  if (!theUserFound) {
    res.json({
      success: false,
      statusCode: "USER-NOT-FOUND",
      response: `User not registered on PocaWallet`,
    });
  }

  //assuming user exist but hasnt activated their account
  // u can redirect to verification page or resend them the verification code
  //or comment it out
  if (theUserFound.verificationCodeApproved == false) {
    res.json({
      success: false,
      statusCode: "VERIFY-ACCOUNT",
      response: `Your account is not verified yet`,
    });
  }

  //lets verify the users' password
  const passwordMatch = await theUserFound.comparePasswordASync(
    password,
    theUserFound.password
  );
  if (!passwordMatch) {
    res.json({
      success: false,
      statusCode: "PASSWORD-MISMATCH",
      response: `Password mismatch, please check and try again`,
    });
  }

  //set jwt token when password matches
  if (passwordMatch) {
    //stick user to jwt
    const token = jwt.sign({ id: theUserFound._id }, Config.secret, {
      expiresIn: "24h",
    });
    res.json({
      success: true,
      response: `Login successful`,
      token: token,
      payload: { phonenumber: theUserFound.phonenumber },
    });
  }
});

/****
 * @name changePassword
 * @description SEND TO USERS' EMAIL THE PASSWORD RESET LINK WITH EXPIRATION
 */

exports.forgetPassword = skipTryCatch(async (req, res) => {
  //check if user entered and email address
  if (!req.body.email) {
    res.json({
      success: false,
      statusCode: `EMAIL-REQ`,
      response: `Please provide your email`,
    });
  }
  let existingUser = await User.findOne({ email: req.body.email });

  //email does not exist
  if (!existingUser) {
    res.json({
      success: false,
      statusCode: "USER-NOT-FOUND",
      response: `User not found`,
    });
  }

  //lets generate crypto
  let resetToken = await new Promise((resolve, reject) => {
    crypto.randomBytes(48, (err, buffer) => {
      if (err) {
        reject(err);
      }
      resolve(buffer);
    });
  });

  existingUser.passwordReset.resetPasswordToken = resetToken;
  existingUser.passwordReset.resetTokenExpires = Date.now() + 3600000; //!1hr

  await existingUser.save();

  //prepare email message for end user
  const message = {
    subject: "Reset Password",
    text:
      `${
        "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
        "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
        "http://"
      }${req.headers.host}/reset-password/${resetToken}\n\n` +
      `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  //mailgun.send( existingUser.email, message);

  res.json({
    success: true,
    statusCode: "EMAIL-SENT",
    response: `An email has been sent to you, please follow the instructions and reset your password`,
  });
});

/***
 * @name resetPassword
 * @description RESET USER'S PASSWORD AFTER CLICKING ON LINK FROM EMAIL
 */
exports.resetPassword = skipTryCatch(async (req, res) => {
  //res.json({error: 'route hit'})

  let user = await User.findOne({
    "passwordReset.resetPasswordToken": req.params.resetToken,
    "passwordReset.resetTokenExpires": { $gt: Date.now() },
  });

  //there will be an error if the time for reset is passed or token invalid
  if (!user) {
    res.json({
      success: false,
      statusCode: "ERROR",
      response:
        "Your token has expired. Please attempt to reset your password again.",
    });
  }

  //otherwise change password and clear password reset tokens
  user.password = req.body.passsword;
  user.passwordReset.resetPasswordToken = "";
  user.passwordReset.resetTokenExpires = "";

  let passwordChanged = await user.save();

  // If password change saved successfully, alert user via email
  if (passwordChanged) {
    const message = {
      subject: "Password Changed",
      text:
        "You are receiving this email because you changed your password. \n\n" +
        "If you did not request this change, please contact us immediately.",
    };
    // Otherwise, send user email confirmation of password change via Mailgun
    // mailgun.sendEmail(user.email, message);
    res.json({
      success: true,
      statusCode: "PASSWORD-CHANGED",
      response:
        "Password changed successfully. Please login with your new password.",
    });
  }
});

// login with facebook
exports.loginWithFacebook = skipTryCatch(async (req, res) => {});
