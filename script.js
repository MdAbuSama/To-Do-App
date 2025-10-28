document.addEventListener('DOMContentLoaded', () => {
            const noteForm = document.getElementById('note-form');
            const noteTitleInput = document.getElementById('note-title');
            const noteContentInput = document.getElementById('note-content');
            const notesContainer = document.getElementById('notes-container');

            const BIN_URL = "https://api.jsonbin.io/v3/b/68e4ffe443b1c97be95d6ac5";
            const API_KEY = "$2a$10$s1q8gCZeUMlje86yaeTVd.oR/pmniEkYOfqd4EMQ47eqBSy9/MO06";

            let notes = [];

            const getNotes = async() => {
                try {
                    const response = await fetch(`${BIN_URL}/latest`);
                    const data = await response.json();
                    notes = data.record.notes || [];
                    renderNotes();
                } catch (error) {
                    console.error("Error fetching notes:", error);
                }
            };

            const saveNotes = async() => {
                try {
                    await fetch(BIN_URL, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Master-Key': '$2a$10$CjzmyVb.FtGz5tv8.HWiwe/DapG8cFscDxf0jU1WkDELV90MLHHem'
                        },
                        body: JSON.stringify({
                            notes
                        })
                    });
                } catch (error) {
                    console.error("Error saving notes:", error);
                }
            };

            const renderNotes = () => {
                notesContainer.innerHTML = '';

                const groupedNotes = notes.reduce((acc, note) => {
                    const month = new Date(note.createdAt).toLocaleString('default', {
                        month: 'long',
                        year: 'numeric'
                    });
                    if (!acc[month]) {
                        acc[month] = [];
                    }
                    acc[month].push(note);
                    return acc;
                }, {});

                for (const month in groupedNotes) {
                    const monthHeader = document.createElement('h2');
                    monthHeader.classList.add('month-header');
                    monthHeader.textContent = month;
                    notesContainer.appendChild(monthHeader);

                    const notesGrid = document.createElement('div');
                    notesGrid.classList.add('notes-grid');
                    notesContainer.appendChild(notesGrid);

                    groupedNotes[month].forEach(note => {
                        const noteEl = document.createElement('div');
                        noteEl.classList.add('note');
                        noteEl.innerHTML = `
                            <div class="note-title">${note.title}</div>
                            <div class="note-content">${note.content}</div>
                            <div class="note-footer">
                                <span class="note-date">${new Date(note.createdAt).toLocaleDateString()}</span>
                                <button class="delete-btn" data-id="${note.id}">Delete</button>
                            </div>
                        `;
                        notesGrid.appendChild(noteEl);
                    });
                }
            };

            noteForm.addEventListener('submit', async(e) => {
                e.preventDefault();
                const title = noteTitleInput.value.trim();
                const content = noteContentInput.value.trim();
                if (title || content) {
                    notes.push({
                        id: Date.now().toString(),
                        title,
                        content,
                        createdAt: new Date().toISOString()
                    });
                    await saveNotes();
                    renderNotes();
                    noteTitleInput.value = '';
                    noteContentInput.value = '';
                }
            });

            notesContainer.addEventListener('click', async(e) => {
                if (e.target.classList.contains('delete-btn')) {
                    const id = e.target.dataset.id;
                    notes = notes.filter(note => note.id !== id);
                    await saveNotes();
                    renderNotes();
                }
            });

            getNotes();
        });