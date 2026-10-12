const Notes = require("../models/Notes");

async function get_notes() {
    let notes = await Notes.findAll()
    return notes
}

async function get_note_by_id(id) {
    let note = await Notes.findByPk(id)
    return note
}

async function create_note() {
  return await Notes.create({})
}

async function save_note(new_note, id) {
    let note = await get_note_by_id(id);
    if (!note){
        note = await create_note();
    }
    note.note = new_note;
    return await note.save()
}

async function save_title(new_title, id) {
    let note = await get_note_by_id(id);
    if (!note){
        note = await create_note();
    }
    note.title = new_title;
    return await note.save()
}

async function delete_note(id) {
    let note = await get_note_by_id(id)
    if (!note){
        return
    }
    await note.destroy()
}

module.exports = {
    delete_note,
    get_notes,
    save_note,
    save_title,
    create_note
}