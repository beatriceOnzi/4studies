const Notes = require("../models/Notes");

async function get_notes() {
    let notes = await Notes.findAll()
    return notes
}

async function get_note_by_id(id) {
    console.log("aaa", id)
    let note = await Notes.findByPk(id)
    return note
}

async function create_note() {
  return await Notes.create({})
}

async function save_note(new_note, id) {
    let note = await get_note_by_id(id);
    if (!note){
        await create_notes();
        note = await get_notes();
    }
    note.note = new_note;
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
    create_note
}