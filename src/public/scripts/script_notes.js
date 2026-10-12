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

async function save_note_title(element, id){
    if (!id) return;

    const title = element.value;

    const response = await fetch(`/notes/save_title/${id}`, {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            title
        })
    });

}

function create_new_note(data) {
    const { id, note, title } = data;

    const template = document.createElement('template');

    template.innerHTML = `
        <div
            class="note text-white bg-blue-medium bg-opacity-50 rounded-lg p-3 w-80 h-96 flex flex-col"
            data-note_id="${id}"
        >
            <h1 class="font-bold font-soul text-white text-xl mb-2">
                ${title ?? 'New Note'}
            </h1>

            <textarea
                oninput="textarea_edited(this, ${id})"
                class="px-2 text-xl font-marck tracking-wide rounded-lg resize-none focus:outline-none focus:border-purple-light border-purple-dark border-2 flex-1 min-h-0 w-full bg-transparent"
            >${note ?? ''}</textarea>

            <input
                onclick="delete_note(this, ${id})"
                type="button"
                class="rounded-md text-pink-light text-xl mt-2 cursor-pointer"
                value="Delete Note"
            >
        </div>
    `;

    const newNote = template.content.firstElementChild;
    const container = document.getElementById('notes_container');
    const newNoteButton = document.getElementById('new_note');

    container.insertBefore(newNote, newNoteButton);
}