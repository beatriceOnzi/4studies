const form = document.querySelector('#notes_form');

let timeoutId;

async function new_note() {
    const response = await fetch('/notes/new');
    const data = await response.json();
    create_new_note(data)
}

async function textarea_edited(noteElement, id) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
        saveNote(noteElement, id);
    }, 1000);
}

async function saveNote(noteElement, id) {
    const note = noteElement.value.trim();

    const response = await fetch(`/notes/save/${id}`, {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            note
        })
    });

}

async function delete_note(noteElement, id) {
    if (!id) return;

    const response = await fetch(`/notes/delete/${id}`, {

        method: 'DELETE',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            id
        })
    });

    noteElement.parentElement.remove()
}

function create_new_note(data){
    const id = data.id;
    const note = data.note;

    const template = document.createElement('template');
    template.innerHTML = `
        <div>
            <input type="button" class="rounded-md text-pink-light text-xl" value="Delete Note" onclick="delete_note(this, ${id})">
            <textarea oninput="textarea_edited(this, ${id})" class="px-2 text-white text-xl font-marck tracking-wide resize-none focus:outline-none focus:border-purple-light rounded-lg h-full w-full bg-blue-medium bg-opacity-50 border-4 border-purple-dark">${note}</textarea>
        </div>;`

    const div = template.content.firstElementChild;

    form.append(div)
}