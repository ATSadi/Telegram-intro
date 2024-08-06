const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Use CORS middleware
app.use(express.json()); // Middleware to parse JSON requests

// Disable 'x-powered-by' header
app.disable('x-powered-by');

// Set security headers
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    next();
});

// Connect to MySQL database
const db = mysql.createConnection({
    host: 'teleintrodatabase-ahnafsoad-3b27.e.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_hjwB7kf7OS2XQTPbln',
    database: 'defaultdb',
    port: 16361,
    ssl: {
        ca: fs.readFileSync('certs/ca.pem')
    }
});

db.connect(err => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

// Create users table if it doesn't exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    userId VARCHAR(255) PRIMARY KEY,
    score INT DEFAULT 0
)`;
db.query(createTableQuery, (err, results) => {
    if (err) {
        console.error('Failed to create users table', err);
    } else {
        console.log('Users table ready');
    }
});

// Endpoint to get user score
app.get('/user/:userId', (req, res) => {
    const userId = req.params.userId;
    db.query('SELECT score FROM users WHERE userId = ?', [userId], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Failed to retrieve user score' });
        } else {
            res.json({ score: results[0] ? results[0].score : 0 });
        }
    });
});

// Endpoint to update user score
app.post('/update-score', (req, res) => {
    const { userId, score } = req.body;
    console.log('Received score update request:', { userId, score });

    const getUserScoreQuery = 'SELECT score FROM users WHERE userId = ?';
    const updateUserScoreQuery = 'UPDATE users SET score = ? WHERE userId = ?';

    db.query(getUserScoreQuery, [userId], (err, results) => {
        if (err) {
            console.error('Failed to retrieve user score:', err);
            res.status(500).json({ error: 'Failed to retrieve user score' });
            return;
        }

        const currentScore = results[0] ? results[0].score : 0;
        const newScore = currentScore + score;

        console.log(`Current Score: ${currentScore}, New Score: ${newScore}`);

        db.query(updateUserScoreQuery, [newScore, userId], (err, results) => {
            if (err) {
                console.error('Failed to update score:', err);
                res.status(500).json({ error: 'Failed to update score' });
            } else {
                console.log(`Score updated successfully for user ${userId}: ${newScore}`);
                res.json({ message: 'Score updated successfully' });
            }
        });
    });
});

// Endpoint to create user and generate invite link
app.post('/create-user', (req, res) => {
    const { userId } = req.body;
    const inviteLink = `https://teleintro.netlify.app/?token=${userId}`;
    const query = `INSERT INTO users (userId, score) VALUES (?, 0) ON DUPLICATE KEY UPDATE userId=userId`;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Failed to create user:', err);
            res.status(500).json({ error: 'Failed to create user' });
        } else {
            res.json({ link: inviteLink });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
