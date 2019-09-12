const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  mongoose = require("mongoose"),
  router = require("./router/router");
 

//middle wares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//connect to db
mongoose.connect("FIX-DB-URL-HERE", { useNewUrlParser: true });

router(app);

let listen = app.listen(process.env.PORT || 3000);

module.exports = listen;
