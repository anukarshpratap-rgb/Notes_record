const express = require('express');
const cors = require('cors'); 
const notesRouter = require('./routes/notes'); 
const authRouter = require('./routes/auth');

const app = express();
const port = 3000;

app.use(express.json()); 
app.use(cors());         
app.use('/notes', notesRouter);
app.use('/auth', authRouter);


// Fallback route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Note API! Auth routes: /auth/signup, /auth/signin. Note routes: /notes (requires token).');
});


app.listen(port, () => {
    console.log(`\nServer is running at http://localhost:${port}`);
    console.log('Authentication routes available at /auth');
    console.log('Note routes available at /notes (requires JWT token)');
});




