const express = require("express");
const handlebars = require('express-handlebars')
const path = require("path")
const sequelize = require("./database.js");
const Goals = require("./models/Goals");

sequelize.sync();
module.exports = sequelize;

const app = express();

//config
    //body parser
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    //template engine
    app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }));
    app.set("view engine", "handlebars");
    app.set("views", path.join(__dirname, "views"));

    app.use(express.static(path.join(__dirname, "public")));

// routes

app.get("/", async (req, res) => {
  res.render("home", { pagina: 1});
})

app.get("/tempo", async (req, res) => {
  res.render("home", { pagina1: 1});
})

app.get("/notes", async (req, res) => {
  res.render("home", { pagina2: 1});
})

// app.get("/api/data", async (req,res)=>{
//   const data = await getData();
//   res.json(data);
// });

// app.post("/api/tasks", async (req,res)=>{
//   const data = await getData();
//   data.tasks = req.body.tasks;
//   await data.save();
//   res.sendStatus(200);
// });

// app.post("/api/notes", async (req,res)=>{
//   const data = await getData();
//   data.notes = req.body.text;
//   await data.save();
//   res.sendStatus(200);
// });

app.listen(3000, ()=>{
  console.log("Running on http://localhost:3000");
});
