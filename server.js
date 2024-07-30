const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

let users = {}; // This will store user data and invitations

// Endpoint to create a new user and generate an invite link
app.post('/create-user', (req, res) => {
    console.log('Received request to create user:', req.body); // Log request body
    const userId = req.body.userId;
    const userToken = Math.random().toString(36).substring(2, 15); // Generate a random token
    users[userId] = { id: userId, token: userToken, rewards: 0 };
    console.log('Generated token:', userToken); // Log generated token
    res.json({ link: `http://localhost:3000/invite?token=${userToken}` });
});

// Endpoint to handle invitation
app.get('/invite', (req, res) => {
    const token = req.query.token;
    console.log('Received invite request with token:', token); // Log token
    let found = false;
    for (let userId in users) {
        if (users[userId].token === token) {
            users[userId].rewards += 200; // Increment rewards
            found = true;
            console.log('Token matched. Rewards updated.');
            break;
        }
    }
    if (found) {
        res.send("Thank you for accepting the invite. Rewards have been assigned.");
    } else {
        console.log('Invalid token:', token);
        res.send("Invalid token.");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});