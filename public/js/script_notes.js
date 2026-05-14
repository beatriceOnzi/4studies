const form = document.querySelector('#notes_form');
const notes = document.querySelector('#notes_textarea');

let timeoutId;

form.addEventListener('keydown', () => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
        saveNote(notes);
    }, 1000);
});

async function saveNote(notesElement) {
    const notes = notesElement.value.trim();
    if (!notes) return;

    const response = await fetch('/notes/save', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            notes
        })
    });

}