const express = require("express");
const handlebars = require('express-handlebars')
const mongoose = require("mongoose");
const path = require("path")

const app = express();
//tailwind: npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css --watch

//config
    //body parser
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    //template engine
    app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }));
    app.set("view engine", "handlebars");
    app.set("views", path.join(__dirname, "views"));

    app.use(express.static(path.join(__dirname, "public")));

//conectar mongo
mongoose.connect("mongodb://127.0.0.1:27017/studies");

const DataSchema = new mongoose.Schema({
  notes: String,
  tasks: [String]
});

const Data = mongoose.model("Data", DataSchema);

// ?
async function getData(){
  let data = await Data.findOne();
  if(!data){
    data = await Data.create({ notes:"", tasks:[] });
  }
  return data;
}

// routes

app.get("/", async (req, res) => {
  res.render("home")
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
