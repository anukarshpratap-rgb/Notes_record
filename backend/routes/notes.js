// --- Note Routes (routes/notes.js) ---
const express = require('express');
const router = express.Router();
// Node's built-in file system module and path utilities
const fs = require('fs');
const path = require('path');

// Define the exact path to the JSON file (now named notes.json)
const DATA_FILE = path.join(__dirname, '../data/notes.json');

// --- Helper Functions for File System Persistence ---

// Function to read the notes array from the JSON file
const readNotes = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        // JSON.parse converts the text read from the file into a JavaScript array
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist or is empty, return an empty array
        return [];
    }
};

// Function to write the notes array back to the JSON file
const writeNotes = (notes) => {
    // JSON.stringify converts the JavaScript array into text that can be saved in the file
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), 'utf8');
};

// --- API Endpoints (Using async/await structure) ---

// A. READ (GET /notes)
router.get('/', async (req, res) => {
    try {
        console.log('GET /notes requested');
        // We call the synchronous helper function here
        const notes = readNotes(); 
        res.json(notes);
    } catch (error) {
        // If anything goes wrong, catch the error and send a 500 server error response
        console.error('Error reading notes:', error);
        res.status(500).json({ error: 'Failed to retrieve notes.' });
    }
});

// B. CREATE (POST /notes)
router.post('/', async (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required.' });
        }

        const notes = readNotes();
        // Find the highest ID and add 1
        const maxId = notes.reduce((max, note) => Math.max(max, note.id), 0);
        const newId = maxId + 1;

        const newNote = {
            id: newId,
            title: title,
            content: content
        };

        notes.push(newNote);
        writeNotes(notes); // Save the updated array to the file

        console.log('POST /notes: New note added with ID', newId);
        res.status(201).json(newNote);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Failed to create note.' });
    }
});

// C. UPDATE (PUT /notes/:id)
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, content } = req.body; 

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required.' });
        }
        
        let notes = readNotes();
        const noteIndex = notes.findIndex(note => note.id === id);

        if (noteIndex === -1) {
            return res.status(404).json({ error: 'Note not found.' });
        }

        // Update the note data
        notes[noteIndex].title = title;
        notes[noteIndex].content = content;
        
        writeNotes(notes); // Save the changes
        
        console.log('PUT /notes/:id Updated note with ID', id);
        res.json(notes[noteIndex]);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note.' });
    }
});

// D. DELETE (DELETE /notes/:id)
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        let notes = readNotes();
        const initialLength = notes.length;
        
        // Filter out the note to be deleted
        notes = notes.filter(note => note.id !== id);

        if (notes.length === initialLength) {
            return res.status(404).json({ error: 'Note not found.' });
        }

        writeNotes(notes); // Save the result

        console.log('DELETE /notes/:id Deleted note with ID', id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note.' });
    }
});

module.exports = router;
