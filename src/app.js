const express = require("express");
const handlebars = require('express-handlebars');
const path = require("path");

const notes_routes = require("./routes/notes");
const clock_routes = require("./routes/clock");
const time_routes = require("./routes/time");

const app = express();

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// template engine
app.engine("handlebars", handlebars.engine({ 
  defaultLayout: "main",
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// routes
app.use('/notes', notes_routes);
app.use('', clock_routes);
app.use('', time_routes);

module.exports = app;