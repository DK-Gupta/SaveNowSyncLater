const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));  // Allow all origins

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

const NoteSchema = new mongoose.Schema({ title: String, content: String });
const Note = mongoose.model("Note", NoteSchema);

app.get("/notes", async (req, res) => {
    const notes = await Note.find();
    res.json(notes);
});

app.post("/notes", async (req, res) => {
    const newNote = new Note(req.body);
    await newNote.save();
    res.json(newNote);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
