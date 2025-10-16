const express = require('express');
const cors = require('cors'); 
const notesRouter = require('./routes/notes'); 

const app = express();
const port = 3000;

app.use(express.json()); 
app.use(cors());         
app.use('/notes', notesRouter); 

// Fallback route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Note API! Routes are managed by routes/notes.js.');
});

app.listen(port, () => {
    console.log(`\nServer is running at http://localhost:${port}`);
    console.log('Backend is organized and using file persistence (notes.json).');
});




