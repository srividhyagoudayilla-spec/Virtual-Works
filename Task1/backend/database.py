import sqlite3
import os

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "notes.db")

def get_db_connection():
    """Establish a connection to the SQLite database and return it with dict-like row access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database table for storing notes if it doesn't already exist."""
    os.makedirs(DB_DIR, exist_ok=True)
    with get_db_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                color TEXT DEFAULT 'default',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

def get_notes():
    """Fetch all notes from the database, ordered from newest to oldest."""
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT * FROM notes ORDER BY created_at DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def add_note(title: str, content: str, color: str = "default"):
    """Insert a new note into the database and return the newly created note."""
    with get_db_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO notes (title, content, color) VALUES (?, ?, ?)",
            (title, content, color)
        )
        conn.commit()
        note_id = cursor.lastrowid
        
        # Fetch the complete created row to return
        row = conn.execute("SELECT * FROM notes WHERE id = ?", (note_id,)).fetchone()
        return dict(row)

def delete_note(note_id: int) -> bool:
    """Delete a note by its ID. Returns True if a row was deleted, False otherwise."""
    with get_db_connection() as conn:
        cursor = conn.execute("DELETE FROM notes WHERE id = ?", (note_id,))
        conn.commit()
        return cursor.rowcount > 0
