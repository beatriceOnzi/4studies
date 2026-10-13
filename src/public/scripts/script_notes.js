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

async function delete_note(noteElement, id) {
    if (!id) return;

    const response = await fetch(`/notes/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });

    if (!response.ok) return;

    document.querySelectorAll(`[data-note_id="${id}"]`)
        .forEach(card => card.parentElement.remove());

    setupLoop();
}

function create_new_note(data) {
    const { id, note, title } = data;

    const template = document.createElement('template');
    template.innerHTML = `
        <div class="flex-[0_0_20rem]">
            <div class="flex flex-col text-white bg-blue-medium backdrop-blur-[2px] border border-white/10 hover:border-purple-light/60 bg-opacity-70 rounded-xl p-3 w-80 h-96 overflow-hidden" data-note_id="${id}">
                <div class="flex items-center justify-between pb-2 mb-3 border-b border-white/10 focus-within:border-purple-light">
                    <input oninput="save_note_title(this, ${id})" type="text"
                        class="w-full min-w-0 font-semibold font-soul text-white text-2xl tracking-widest
                        px-2 mb-1 bg-transparent focus:outline-none">
                    <span class="w-2.5 h-2.5 rounded-full bg-pink-light shadow-[0_0_8px] shadow-pink-light"></span>
                </div>

                <textarea oninput="textarea_edited(this, ${id})"
                    class="flex-1 min-h-0 w-full px-2 text-xl font-marck tracking-wide rounded-lg resize-none focus:outline-none
                    focus:border-purple-light border-blue-medium/80 border-[1px] bg-black/10 focus:bg-black/15"></textarea>

                <button
                    type="button"
                    onclick="delete_note(this, ${id})"
                    class="mt-3 w-full py-1.5 rounded-lg text-pink-light text-xl
                        border border-pink-light/30 bg-transparent
                        transition-all duration-200
                        hover:bg-pink-light/10 hover:border-pink-light active:scale-95">
                    🗑 Delete Note
                </button>
            </div>
        </div>
    `;

    const wrapper = template.content.firstElementChild;

    wrapper.querySelector('input[type=text]').value = title ?? 'New Note';
    wrapper.querySelector('textarea').value = note ?? '';

    const container = document.getElementById('notes_container');
    container.insertBefore(wrapper, document.getElementById('new_note'));

    setupLoop();
}