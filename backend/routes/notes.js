const express = require('express');
const router = express.Router();
//for file and path utility
const fs = require('fs');
const path = require('path');

//path to json file for data storing
const DATA_FILE = path.join(__dirname, '../data/notes.json');

// Function to read the notes array from the JSON file
const readNotes = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Function to write the notes array back to the JSON file
const writeNotes = (notes) => {
    //JavaScript array to text(json.stringify)
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), 'utf8');
};

//read
router.get('/', async (req, res) => {
    try {
        console.log('GET /notes requested');
        const notes = readNotes(); 
        res.json(notes);
    } catch (error) {
        console.error('Error reading notes:', error);
        res.status(500).json({ error: 'Failed to retrieve notes.' });
    }
});

//create
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

//update
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
        
        writeNotes(notes);
        
        console.log('PUT /notes/:id Updated note with ID', id);
        res.json(notes[noteIndex]);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note.' });
    }
});

//delete
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

        writeNotes(notes);

        console.log('DELETE /notes/:id Deleted note with ID', id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note.' });
    }
});

module.exports = router;
