//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// CONNECT MONGODB
mongoose.connect("mongodb://127.0.0.1:27017/studies");

const DataSchema = new mongoose.Schema({
  notes: String,
  tasks: [String]
});

const Data = mongoose.model("Data", DataSchema);

// INIT DATA
async function getData(){
  let data = await Data.findOne();
  if(!data){
    data = await Data.create({ notes:"", tasks:[] });
  }
  return data;
}

// ROUTES

app.get("/api/data", async (req,res)=>{
  const data = await getData();
  res.json(data);
});

app.post("/api/tasks", async (req,res)=>{
  const data = await getData();
  data.tasks = req.body.tasks;
  await data.save();
  res.sendStatus(200);
});

app.post("/api/notes", async (req,res)=>{
  const data = await getData();
  data.notes = req.body.text;
  await data.save();
  res.sendStatus(200);
});

app.listen(3000, ()=>{
  console.log("Running on http://localhost:3000");
});
