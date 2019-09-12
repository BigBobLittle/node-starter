const mongoose = require("mongoose"),
      bcrypt = require("bcryptjs");

//set validators and regExp for email fired
let emailRequiredField = email => {
  if (!email) return false;
  return email.length < 5 || email.length > 30 ? false : true;
};

let emailRegExp = email => {
  if (!email) return false;
  let regExp = new RegExp( /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  regExp.test(email.toLowerCase());
};

//Email Validators
const emailValidator = [
  {
    validator: emailRequiredField,
    message: `Email field must not be less than 5 characters and more than 30 characters`
  },
  { validator: emailRegExp, message: `Please enter correct email` }
];

//validators for phonenumber
let phonenumberRequired = phone => {
  if (!phone) return false;

  return phone.length < 10 || phone.length > 10 ? false : true;
};

//regExp for phonenumber
let phoneRegExp = phone => {
  if (!phone) return false;
  let regExp = new RegExp(/^[0-9]{10}$/);
  return regExp.test(phone);
};

//phone validators
const phoneValidator = [
  {
    validator: phonenumberRequired,
    message: `Phone number must be exactly 10 characters`
  },
  { validator: phoneRegExp, message: `Phone numbers must only be digits` }
];

//password validations
let passwordRequired = password => {
  if (!password) return false;
  return password.length < 8 ? false : true;
};

let passwordRegExp = password => {
  if (!password) return false;
  let regExp = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
  );
  return regExp.test(password);
};

const passwordValidator = [
  { validator: passwordRequired, message: `Password Field is required` },
  {
    validator: passwordRegExp,
    message: `Password must contain at least one (lowercase, uppercase, digit,  special character) and not less than 8 characters `
  }
];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      validate: emailValidator,
      required: true,
      unique: true,
      lowercase: true
    },
    password: { type: String, validate: passwordValidator, required: true },
    phonenumber: {
      type: String,
      validate: phoneValidator,
      required: true,
      unique: true
    },
    fullname: { type: String, required: true },
    
    verificationCode: String,
    verificationCodeApproved: { type: Boolean, default: false },
    momoOtpConfrimed: { type: Boolean, default: false },
    passwordReset: {
      resetPasswordToken: String,
      resetTokenExpires: Date
    },

   
  },
  {
    timestamps: true
  }
);

//schema methods
userSchema.pre("save", function(next) {
  let user = this;
  if (!user.isModified("password")) return next(); //? user.isNew
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (err, hashed) => {
      if (err) return next(err);
      user.password = hashed;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(userPassword, callback) {
  bcrypt.compare(userPassword, this.password, function(err, matchedPassword) {
    if (err) callback(err);
    callback(null, matchedPassword);
  });
};
module.exports = mongoose.model("User", userSchema);
