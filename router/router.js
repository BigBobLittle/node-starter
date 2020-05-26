const express = require("express"),
  passport = require("passport"),
  passportConfig = require("../controllers/passport"),
  RequireJwt = require("../helpers/requireJwt").requireJwt,
  RoleAuthorization = require("../helpers/requireJwt").roleAuthorization,
  UploadMiddleware = require("../helpers/fileupload").Uploader,
  //testUpload = UploadMiddleware().single('picture'),
  UsersInfo = require("../controllers/user"),
  Authentication = require("../controllers/authentication"),
  FileUpload = require("../controllers/fileupload");
passportConfig();
//  multer = require('multer'),
//  uploads = multer({dest: 'uploads/'});

module.exports = (app) => {
  const authRoutes = express.Router(), //actual routes itself
    userInfoRoutes = express.Router(),
    fileUploadRoutes = express.Router(),
    apiHandle = express.Router(); //for route prefix

  //authentication routes
  apiHandle.use("/auth", authRoutes);
  authRoutes.post("/register", Authentication.register);
  authRoutes.post("/verifyToken/:token", Authentication.verifyToken);
  authRoutes.post("/login", Authentication.login);
  authRoutes.get("/forgetPassword", Authentication.forgetPassword);
  authRoutes.get("/reset-password/:resetToken", Authentication.resetPassword);
  authRoutes.post("/facebookLogin", passport.authenticate("facebook-token"));

  //user info routes
  apiHandle.use("/user", userInfoRoutes);
  userInfoRoutes.get("/profile", RequireJwt, RoleAuthorization("SUBSCRIBER"),
    UsersInfo.userProfile
  );
  userInfoRoutes.post("/sendWebPush", UsersInfo.sendWebPushNotifications); // send web push notification in pwa

  //file upload
  apiHandle.use("/upload", fileUploadRoutes);
  fileUploadRoutes.post(
    "/uploadFile",
    UploadMiddleware().single("picture"),
    FileUpload.saveImage
  );

  app.use("/starter/v1", apiHandle);
};
