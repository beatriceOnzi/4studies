
const tasksList = document.getElementById("tasks");
const notesArea = document.getElementById("notes");

async function loadData(){
  const res = await fetch("/api/data");
  const data = await res.json();

  tasksList.innerHTML = "";

  data.tasks.forEach(t=>{
    const li = document.createElement("li");
    li.className = "bg-gray-100 p-2 rounded";
    li.textContent = t;
    tasksList.appendChild(li);
  });

  notesArea.value = data.notes;
}

loadData();

async function addTask(){
  const res = await fetch("/api/data");
  const data = await res.json();

  data.tasks.push("Nova Task " + Math.floor(Math.random()*100));

  await fetch("/api/tasks",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ tasks: data.tasks })
  });

  loadData();
}

// autosave
let timeout;

notesArea.addEventListener("input", ()=>{
  clearTimeout(timeout);

  timeout = setTimeout(async ()=>{
    await fetch("/api/notes",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ text: notesArea.value })
    });
  }, 500);
});
