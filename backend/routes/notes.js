const express = require('express');
const router = express.Router();
//for file and path utility
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

//path to json file for data storing
const DATA_FILE = path.join(__dirname, '../data/notes.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.userId = decoded.userId;
    next();
  });
};

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
router.get('/', verifyToken, async (req, res) => {
    try {
        console.log('GET /notes requested by user', req.userId);
        const notes = readNotes(); 
        const userNotes = notes.filter(note => note.userId === req.userId);
        res.json(userNotes);
    } catch (error) {
        console.error('Error reading notes:', error);
        res.status(500).json({ error: 'Failed to retrieve notes.' });
    }
});

//create
// router.post('/', async (req, res) => {
//     try {
//         const { title, content } = req.body;
//         if (!title || !content) {
//             return res.status(400).json({ error: 'Title and content are required.' });
//         }

//         const notes = readNotes();
//         const maxId = notes.reduce((max, note) => Math.max(max, note.id), 0);
//         const newId = maxId + 1;

//         const newNote = {
//             id: newId,
//             title: title,
//             content: content
//         };

//         notes.push(newNote);
//         writeNotes(notes); // Save the updated array to the file

//         console.log('POST /notes: New note added with ID', newId);
//         res.status(201).json(newNote);
//     } catch (error) {
//         console.error('Error creating note:', error);
//         res.status(500).json({ error: 'Failed to create note.' });
//     }
// });


router.post('/', verifyToken, async (req, res) => {
    try {
        let data = req.body;

        // If single object is sent, convert to array
        if (!Array.isArray(data)) data = [data];

        const notes = readNotes();
        let maxId = notes.reduce((max, note) => Math.max(max, note.id), 0);

        const newNotes = data.map(note => {
            if (!note.title || !note.content) {
                throw new Error("Title and content are required for every note.");
            }

            maxId += 1;

            return {
                id: maxId,
                userId: req.userId,
                title: note.title,
                content: note.content
            };
        });

        notes.push(...newNotes);
        writeNotes(notes);

        console.log(`POST /notes: Added ${newNotes.length} note(s) for user ${req.userId}.`);
        res.status(201).json(newNotes);

    } catch (error) {
        console.error('Error creating notes:', error.message);
        res.status(500).json({ error: error.message || 'Failed to create notes.' });
    }
});

//update
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, content } = req.body; 

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required.' });
        }
        
        let notes = readNotes();
        const noteIndex = notes.findIndex(note => note.id === id && note.userId === req.userId);

        if (noteIndex === -1) {
            return res.status(404).json({ error: 'Note not found.' });
        }

        // Update the note data
        notes[noteIndex].title = title;
        notes[noteIndex].content = content;
        
        writeNotes(notes);
        
        console.log('PUT /notes/:id Updated note with ID', id, 'for user', req.userId);
        res.json(notes[noteIndex]);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note.' });
    }
});

//delete
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        let notes = readNotes();
        const initialLength = notes.length;
        
        // Filter out the note to be deleted (only if it belongs to current user)
        notes = notes.filter(note => !(note.id === id && note.userId === req.userId));

        if (notes.length === initialLength) {
            return res.status(404).json({ error: 'Note not found.' });
        }

        writeNotes(notes);

        console.log('DELETE /notes/:id Deleted note with ID', id, 'for user', req.userId);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note.' });
    }
});

module.exports = router;
