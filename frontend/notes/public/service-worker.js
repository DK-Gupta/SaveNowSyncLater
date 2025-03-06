const DB_NAME = "offline-notes-db";
const STORE_NAME = "notes";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("offline-cache").then((cache) => {
      return cache.addAll(["/", "/index.html", "/styles.css", "/app.js"]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for fetch events (serving cached files)
self.addEventListener("fetch", (event) => {
  if (!navigator.onLine) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Open IndexedDB and save note when offline
async function saveOfflineNote(note) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    },
  });

  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.store.add(note);
  await tx.done;
}

// Sync offline data to MongoDB when online
async function syncOfflineNotes() {
  const db = await openDB(DB_NAME, 1);
  const tx = db.transaction(STORE_NAME, "readonly");
  const notes = await tx.store.getAll();

  if (notes.length > 0) {
    fetch("/api/notes/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notes),
    }).then(() => {
      // Clear IndexedDB after successful sync
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.store.clear();
      return tx.done;
    });
  }
}

// Listen for network changes and sync
self.addEventListener("online", () => {
  syncOfflineNotes();
});
