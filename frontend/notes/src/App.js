import React, { useState, useEffect } from "react";
import axios from "axios";
import { saveNoteOffline, getOfflineNotes, clearOfflineNotes } from "./db";
import "./App.css";

function App() {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        loadNotes();
        window.addEventListener("online", syncOfflineNotes);  // Listen for online event
        return () => window.removeEventListener("online", syncOfflineNotes);  // Cleanup listener
    }, []);

    // Load notes either from MongoDB or IndexedDB
    const loadNotes = async () => {
        console.log("Loading notes...");  // Log when loading notes
        if (navigator.onLine) {
            try {
                const response = await axios.get("http://localhost:5001/notes");  // Fetch from MongoDB
                console.log("Loaded notes from MongoDB:", response.data);
                setNotes(response.data);
            } catch (error) {
                console.error("Error fetching notes from MongoDB:", error);
            }
        } else {
            const offlineNotes = await getOfflineNotes();  // Load from IndexedDB if offline
            console.log("Loaded offline notes:", offlineNotes);
            setNotes(offlineNotes);
        }
    };

    // Save a note and decide whether to save offline or online
    const saveNote = async (note) => {
        console.log("Saving note:", note);  // Log the note to be saved
        if (navigator.onLine) {
            try {
                const response = await axios.post("http://localhost:5001/notes", note);  // Save to MongoDB
                console.log("Note saved to MongoDB:", response.data);
                setNotes((prevNotes) => [...prevNotes, response.data]);
            } catch (error) {
                console.error("Error saving note to MongoDB:", error);
            }
        } else {
            await saveNoteOffline(note);  // Save note to IndexedDB
            setNotes((prevNotes) => [...prevNotes, note]);  // Display note immediately in the UI
            console.log("Saved note offline.");
        }
    };

    // Sync offline notes to MongoDB when the app goes online
    const syncOfflineNotes = async () => {
        console.log("Syncing offline notes...");
        const offlineNotes = await getOfflineNotes();
        for (const note of offlineNotes) {
            try {
                const response = await axios.post("http://localhost:5001/notes", note);  // Sync with MongoDB
                console.log("Synced note:", note);
                await clearOfflineNotes();  // Optionally clear offline notes after syncing
            } catch (error) {
                console.error("Sync failed for note:", note, error);
            }
        }
    };

    // Add note function
    const addNote = async () => {
        const newNote = { title, content };
        console.log("Adding note:", newNote);  // Log note before saving
        await saveNote(newNote);
    };

    return (
        <div>
            <h1>Offline Notes App</h1>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button onClick={addNote}>Save Note</button>
            <ul>
                {notes.map((note, index) => (
                    <li key={index}>
                        <strong>{note.title}</strong>: {note.content}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
