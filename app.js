const app = require("express")(),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  mongoose = require("mongoose"),
  config = require("./config/database"),
  passport = require("passport"),
  router = require("./router/router");

//middle wares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
passport.initialize();

// expose all routers here. check the router folder for all router endpoints 
router(app);


mongoose.connect(config.database, {
  useNewUrlParser: true,
  useCreateIndex: true,
});

module.exports = app;
