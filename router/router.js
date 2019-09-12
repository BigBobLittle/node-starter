const express = require("express"),
RequireJwt = require("../helpers/requireJwt"),
Authentication = require("../controllers/authentication");


module.exports = app => {
  const authRoutes = express.Router(), //actual routes itself
    apiHandle = express.Router(); //for route prefix
   
 
    //authentication routes
  apiHandle.use("/auth", authRoutes);
  authRoutes.post("/register", Authentication.register);
  authRoutes.post("/verifyToken/:token", Authentication.verifyToken);
  authRoutes.post("/login", Authentication.login);
  authRoutes.get("/reset-password", Authentication.resetPassword);
  authRoutes.post("/profile", RequireJwt, Authentication.profile);

  
  
  app.use("/poca/v1", apiHandle);
};
