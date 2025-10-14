// --- Main Server File (server.js) ---

const express = require('express');
const cors = require('cors');
// Import the router logic from the 'routes' folder
const tasksRouter = require('./routes/notes'); 

const app = express();
const port = 3000;

// Middleware Setup
app.use(express.json()); // Allows parsing of JSON request bodies
app.use(cors());         // Allows frontend to connect

// Route Handling: Use the tasksRouter for any requests starting with /tasks
app.use('/tasks', tasksRouter); 

// Fallback route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Task API! Routes are managed by routes/tasks.js.');
});

// Start the server
app.listen(port, () => {
    console.log(`\nServer is running at http://localhost:${port}`);
    console.log('Backend is organized and using file persistence (tasks.json).');
});
