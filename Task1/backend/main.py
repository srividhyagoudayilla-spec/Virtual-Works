from contextlib import asynccontextmanager
import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator
import backend.database as database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database table on application startup
    database.init_db()
    yield

app = FastAPI(
    title="Single Page Notes API",
    description="Backend API for managing notes, saved in an SQLite database.",
    version="1.0.0",
    lifespan=lifespan
)

# Input data validation schemas
class NoteCreate(BaseModel):
    title: str = Field(..., max_length=100, description="The title of the note. Must be non-empty.")
    content: str = Field(..., description="The main content text of the note. Must be non-empty.")
    color: str = Field("default", max_length=20, description="Visual theme color/tag name for the note card.")

    @field_validator('title', 'content')
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Field cannot be empty or consist solely of whitespace.")
        return stripped

@app.get("/api/notes")
def read_notes():
    """Retrieve all notes, ordered newest to oldest."""
    try:
        return database.get_notes()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notes: {str(e)}")

@app.post("/api/notes", status_code=201)
def create_note(note: NoteCreate):
    """Create a new note in the database."""
    try:
        new_note = database.add_note(note.title, note.content, note.color)
        return new_note
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save note: {str(e)}")

@app.delete("/api/notes/{note_id}")
def delete_note(note_id: int):
    """Delete a note by its unique identifier."""
    try:
        success = database.delete_note(note_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Note with ID {note_id} not found.")
        return {"success": True, "message": f"Note {note_id} deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete note: {str(e)}")

# Mount the static frontend files
# Make sure frontend directory exists (it will be created soon)
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
os.makedirs(FRONTEND_DIR, exist_ok=True)

# Mount frontend at root. This must remain at the end so it doesn't shadow api endpoints.
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
