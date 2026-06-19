const Notes = require("../models/Notes");

async function get_notes() {
    const notes = await Notes.findOne()
    return notes
}

async function create_notes() {
  return await Notes.create({})
}

async function save_notes(new_notes) {
    let notes = await get_notes()
    if (!notes){
        await create_notes()
        notes = await get_notes()
    }
    notes.note = new_notes;
    return await notes.save()
    
}

module.exports = {
    get_notes,
    save_notes,
    create_notes
}