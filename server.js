const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

// Create users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT UNIQUE NOT NULL,
    score INTEGER DEFAULT 0
)`);

// Endpoint to get user score
app.get('/user/:userId', (req, res) => {
    const userId = req.params.userId;
    db.get('SELECT score FROM users WHERE userId = ?', [userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Failed to retrieve user score' });
        } else {
            res.json({ score: row ? row.score : 0 });
        }
    });
});

// Endpoint to update user score
app.post('/update-score', (req, res) => {
    const { userId, score } = req.body;
    console.log('Received score update request:', { userId, score });

    db.run(
        'INSERT INTO users (userId, score) VALUES (?, ?) ON CONFLICT(userId) DO UPDATE SET score = score + ?',
        [userId, score, score],
        (err) => {
            if (err) {
                console.error('Failed to update score:', err);
                res.status(500).json({ error: 'Failed to update score' });
            } else {
                console.log('Score updated successfully for user:', userId);
                res.json({ message: 'Score updated successfully' });
            }
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
