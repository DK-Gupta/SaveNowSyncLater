// db.js - IndexedDB Handling

// Open the IndexedDB database
export function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("offlineNotesDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Create 'notes' object store if it doesn't exist
            if (!db.objectStoreNames.contains("notes")) {
                db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (error) => {
            reject(error);
        };
    });
}

// Save a note offline in IndexedDB
export function saveNoteOffline(note) {
    return openDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction("notes", "readwrite");
            const store = tx.objectStore("notes");
            store.add(note);  // Save the note in IndexedDB
            tx.oncomplete = () => resolve();
            tx.onerror = (error) => reject(error);
        });
    });
}

// Get all offline notes from IndexedDB
export function getOfflineNotes() {
    return openDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction("notes", "readonly");
            const store = tx.objectStore("notes");
            const getAllRequest = store.getAll();  // Fetch all notes from IndexedDB
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = (error) => reject(error);
        });
    });
}

// Clear all offline notes (optional)
export function clearOfflineNotes() {
    return openDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction("notes", "readwrite");
            const store = tx.objectStore("notes");
            store.clear();  // Clear all notes from IndexedDB
            tx.oncomplete = () => resolve();
            tx.onerror = (error) => reject(error);
        });
    });
}
