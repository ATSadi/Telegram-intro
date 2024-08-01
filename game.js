document.addEventListener('DOMContentLoaded', function () {
    // Elements for the game
    const gameArea = document.getElementById('game-area');
    const timerElement = document.getElementById('timer');
    const scoreElement = document.getElementById('score');
    const messageDisplay = document.createElement('div');
    messageDisplay.style.position = 'absolute';
    messageDisplay.style.top = '50%';
    messageDisplay.style.left = '50%';
    messageDisplay.style.transform = 'translate(-50%, -50%)';
    messageDisplay.style.color = 'white';
    messageDisplay.style.fontSize = '24px';
    messageDisplay.style.display = 'none';
    gameArea.appendChild(messageDisplay);

    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameOverButton = document.getElementById('game-over-button');
    const earnedSadsElement = document.getElementById('earned-sads');

    let timeLeft = 60;
    let score = 0;
    let gameInterval;
    let freeze = false;

    const userId = localStorage.getItem('userId'); // Retrieve user ID from local storage

    // Initially show the start screen and hide the game over screen
    startScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none';

    // Start the game when the start button is clicked
    startButton.addEventListener('click', startGame);

    // Navigate back to the home page when the game over button is clicked
    gameOverButton.addEventListener('click', function () {
        gameOverScreen.style.display = 'none';
        window.location.href = 'index.html';
    });

    // Start the game
    function startGame() {
        timeLeft = 60;
        score = 0;
        updateTimer();
        updateScore(0);
        startScreen.style.display = 'none';
        gameInterval = setInterval(updateGame, 1000); // Game loop interval
    }

    // Update the game state
    function updateGame() {
        updateTimer();
        const randomType = Math.random();
        const objectType = determineObjectType(randomType);
        const object = createFallingObject(objectType);
        const speedMultiplier = objectType === 'time-adder' ? 2 : 1; // Speed for time adders
        dropFallingObject(object, speedMultiplier);
    }

    // End the game
    async function endGame() {
        clearInterval(gameInterval);
        earnedSadsElement.textContent = `Earned: ${score} SADS`;
        try {
            const response = await fetch('http://localhost:3000/update-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, score })
            });
            const data = await response.json();
            console.log('Backend response:', data);
            updateBalance(); // Update balance on UI
        } catch (error) {
            console.error('Error updating score:', error);
        }
        gameOverScreen.style.display = 'flex';
    }

    // Determine the type of object based on random value
    function determineObjectType(randomType) {
        if (randomType < 0.8) return 'ball';
        else if (randomType < 0.9) return 'bomb';
        else return 'time-adder';
    }

    // Update the timer
    function updateTimer() {
        if (!freeze && timeLeft > 0) {
            timeLeft--;
            timerElement.textContent = `Time: ${timeLeft}`;
            if (timeLeft === 0) endGame();
        }
    }

    // Update the score
    function updateScore(points) {
        score += points;
        scoreElement.textContent = `Score: ${score}`;
    }

    // Create a falling object
    function createFallingObject(type) {
        const object = document.createElement('div');
        object.classList.add('falling-object', type);
        object.style.left = Math.random() * (gameArea.offsetWidth - 30) + 'px';
        object.style.top = '-30px';
        object.addEventListener('click', (event) => {
            handleObjectClick(event, type, object);
        });
        gameArea.appendChild(object);
        return object;
    }

    // Handle the object click event
    function handleObjectClick(event, type, object) {
        event.stopPropagation();
        if (type === 'ball') updateScore(1);
        else if (type === 'bomb') {
            updateScore(-20);
            displayMessage('-20 SADS');
        } else if (type === 'time-adder') {
            timeLeft += 20;
            displayMessage('+20 Seconds');
        } else if (type === 'freezer') {
            freeze = true;
            setTimeout(() => { freeze = false; }, 3000);
        }
        gameArea.removeChild(object);
    }

    // Display a message temporarily
    function displayMessage(text) {
        messageDisplay.textContent = text;
        messageDisplay.style.display = 'block';
        setTimeout(() => { messageDisplay.style.display = 'none'; }, 500);
    }

    // Drop a falling object
    function dropFallingObject(object, speedMultiplier) {
        const fallInterval = setInterval(() => {
            if (!freeze && object) {
                object.style.top = object.offsetTop + 7 * speedMultiplier + 'px';
                if (object.offsetTop > gameArea.offsetHeight) {
                    clearInterval(fallInterval);
                    gameArea.removeChild(object);
                }
            }
        }, 40);
    }

    // Fetch and update the user's balance
    async function updateBalance() {
        try {
            const response = await fetch(`http://localhost:3000/user/${userId}`);
            const data = await response.json();
            scoreElement.textContent = `Score: ${data.score}`;
        } catch (error) {
            console.error('Failed to fetch updated score:', error);
        }
    }
});
