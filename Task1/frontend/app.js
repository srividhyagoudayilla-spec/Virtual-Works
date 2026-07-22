// DOM Elements
const noteForm = document.getElementById('note-form');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const notesGrid = document.getElementById('notes-grid');
const emptyState = document.getElementById('empty-state');
const notesCountBadge = document.getElementById('notes-count');
const saveNoteBtn = document.getElementById('save-note-btn');

// Fetch notes on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchNotes();
    injectToastStyles();
});

// Fetch all notes from the backend
async function fetchNotes() {
    try {
        const response = await fetch('/api/notes');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const notes = await response.json();
        renderNotes(notes);
    } catch (error) {
        console.error('Failed to fetch notes:', error);
        showToast('Could not load notes from the server.', 'error');
    }
}

// Render the list of notes in the grid
function renderNotes(notes) {
    // Update badge count
    notesCountBadge.textContent = `${notes.length} Note${notes.length === 1 ? '' : 's'}`;

    if (notes.length === 0) {
        notesGrid.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    notesGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    // Clear previous notes
    notesGrid.innerHTML = '';

    notes.forEach(note => {
        const noteCard = document.createElement('article');
        noteCard.className = `note-card theme-${note.color || 'lavender'}`;
        noteCard.id = `note-${note.id}`;

        const formattedDate = formatDate(note.created_at);

        noteCard.innerHTML = `
            <div class="note-card-header">
                <h3 class="note-card-title">${escapeHTML(note.title)}</h3>
                <button 
                    onclick="deleteNote(${note.id})" 
                    class="delete-btn" 
                    aria-label="Delete note: ${escapeHTML(note.title)}"
                    id="delete-btn-${note.id}"
                >
                    ✕
                </button>
            </div>
            <div class="note-card-body">${escapeHTML(note.content)}</div>
            <div class="note-card-footer">
                <span class="note-date">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${formattedDate}
                </span>
                <span class="note-theme-badge">${note.color || 'lavender'}</span>
            </div>
        `;

        notesGrid.appendChild(noteCard);
    });
}

// Submit Form to Create a Note
async function handleFormSubmit(event) {
    event.preventDefault();

    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    
    // Get selected color
    const selectedColorInput = document.querySelector('input[name="note-color"]:checked');
    const color = selectedColorInput ? selectedColorInput.value : 'lavender';

    if (!title || !content) {
        showToast('Title and content are required.', 'error');
        return;
    }

    // Set saving button state
    saveNoteBtn.disabled = true;
    const originalBtnHTML = saveNoteBtn.innerHTML;
    saveNoteBtn.innerHTML = `<span>Saving...</span><span class="btn-icon">⏳</span>`;

    try {
        const response = await fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content, color })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Failed to save note');
        }

        // Clear inputs
        noteTitleInput.value = '';
        noteContentInput.value = '';
        
        // Reset color choice to default (lavender)
        const defaultColorRadio = document.querySelector('input[name="note-color"][value="lavender"]');
        if (defaultColorRadio) defaultColorRadio.checked = true;

        showToast('Note saved successfully!', 'success');
        
        // Refresh notes list
        await fetchNotes();
    } catch (error) {
        console.error('Error saving note:', error);
        showToast(error.message || 'Error occurred while saving note.', 'error');
    } finally {
        // Restore button state
        saveNoteBtn.disabled = false;
        saveNoteBtn.innerHTML = originalBtnHTML;
    }
}

// Delete Note
async function deleteNote(noteId) {
    const card = document.getElementById(`note-${noteId}`);
    if (!card) return;

    // Optional visual confirmation animation (fade and slide up)
    card.style.opacity = '0';
    card.style.transform = 'translateY(-10px) scale(0.95)';
    card.style.transition = 'all 0.3s ease';

    try {
        const response = await fetch(`/api/notes/${noteId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Failed to delete note');
        }

        showToast('Note deleted successfully.', 'success');
        
        // Wait briefly for animation before updating DOM completely
        setTimeout(async () => {
            await fetchNotes();
        }, 200);

    } catch (error) {
        console.error('Error deleting note:', error);
        // Revert card opacity if delete fails
        card.style.opacity = '1';
        card.style.transform = 'none';
        showToast(error.message || 'Failed to delete note.', 'error');
    }
}

// Utility: Format DB timestamp string to readable user-friendly string
function formatDate(dateStr) {
    if (!dateStr) return '';
    
    // SQLite TIMESTAMP is created as 'YYYY-MM-DD HH:MM:SS' in UTC or local depending on configuration.
    // Replace ' ' with 'T' to help Safari / older engines parse it correctly as ISO.
    const isoDateStr = dateStr.replace(' ', 'T');
    const date = new Date(isoDateStr + 'Z'); // Treat as UTC
    
    if (isNaN(date.getTime())) {
        // Fallback if parsing fails
        return dateStr;
    }

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Utility: Escape HTML string to prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Toast Notifications Functionality
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('visible');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Inject CSS styles for Toast Notification
function injectToastStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            background: #1e293b;
            color: #f8fafc;
            font-size: 0.9rem;
            font-weight: 500;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.08);
            transform: translateY(20px) scale(0.95);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 9999;
            pointer-events: none;
        }
        .toast.visible {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        .toast-success {
            border-left: 4px solid var(--color-emerald-primary, #10b981);
        }
        .toast-error {
            border-left: 4px solid var(--color-rose-primary, #ef4444);
        }
    `;
    document.head.appendChild(style);
}
