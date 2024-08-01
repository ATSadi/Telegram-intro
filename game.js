document.addEventListener('DOMContentLoaded', function () {
    const gameArea = document.getElementById('game-area');
    const timerElement = document.getElementById('timer');
    const scoreElement = document.getElementById('score');
    const messageDisplay = document.createElement('div'); // Element to display messages
    messageDisplay.style.position = 'absolute';
    messageDisplay.style.top = '50%';
    messageDisplay.style.left = '50%';
    messageDisplay.style.transform = 'translate(-50%, -50%)';
    messageDisplay.style.color = 'white';
    messageDisplay.style.fontSize = '24px';
    messageDisplay.style.display = 'none';
    gameArea.appendChild(messageDisplay); // Append message display to game area

    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameOverButton = document.getElementById('game-over-button');
    const earnedSadsElement = document.getElementById('earned-sads');

    let timeLeft = 60;
    let score = 0;
    let gameInterval;
    let freeze = false;

    const userId = 'user1'; // Replace with actual user ID logic if necessary

    // Initially show the start screen and hide the game over screen
    startScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none';

    startButton.addEventListener('click', startGame);
    gameOverButton.addEventListener('click', function () {
        gameOverScreen.style.display = 'none';
        window.location.href = 'index.html'; // Navigate back to home
    });

    function startGame() {
        timeLeft = 60;
        score = 0;
        updateTimer();
        updateScore(0);
        startScreen.style.display = 'none';
        gameInterval = setInterval(updateGame, 1000); // Game loop interval
    }

    function updateGame() {
        updateTimer();
        let randomType = Math.random();
        let objectType = determineObjectType(randomType);
        const object = createFallingObject(objectType);
        const speedMultiplier = objectType === 'time-adder' ? 2 : 1; // Speed for time adders
        dropFallingObject(object, speedMultiplier);
    }

    async function endGame() {
        clearInterval(gameInterval);
        earnedSadsElement.textContent = `Earned: ${score} SADS`;

        try {
            console.log('Sending score to backend:', { userId, score });
            const response = await fetch('https://telegram-intro-1.onrender.com/update-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId, score: score })
            });
            const data = await response.json();
            console.log('Backend response:', data);
        } catch (error) {
            console.error('Error updating score:', error);
        }

        gameOverScreen.style.display = 'flex';
    }

    function determineObjectType(randomType) {
        if (randomType < 0.8) { // Increased from 0.5 to 0.8
            return 'ball';
        } else if (randomType < 0.9) {
            return 'bomb';
        } else {
            return 'time-adder';
        }
    }

    function updateTimer() {
        if (!freeze && timeLeft > 0) {
            timeLeft--;
            timerElement.textContent = `Time: ${timeLeft}`;
            if (timeLeft === 0) {
                endGame();
            }
        }
    }

    function updateScore(points) {
        score += points;
        scoreElement.textContent = `Score: ${score}`;
    }

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

    function handleObjectClick(event, type, object) {
        event.stopPropagation();
        if (type === 'ball') {
            updateScore(1);
        } else if (type === 'bomb') {
            updateScore(-20);
            displayMessage('-20 SADS'); // Display message for bomb
        } else if (type === 'time-adder') {
            timeLeft += 20;
            displayMessage('+20 Seconds'); // Display message for time adder
        } else if (type === 'freezer') {
            freeze = true;
            setTimeout(() => { freeze = false; }, 3000);
        }
        gameArea.removeChild(object);
    }

    function displayMessage(text) {
        messageDisplay.textContent = text;
        messageDisplay.style.display = 'block';
        setTimeout(() => { messageDisplay.style.display = 'none'; }, 500); // Hide message after 0.5 seconds
    }

    function dropFallingObject(object, speedMultiplier) {
        const fallInterval = setInterval(() => {
            if (!freeze && object) {
                object.style.top = object.offsetTop + 7 * speedMultiplier + 'px'; // Decreased speed from 10 to 7
                if (object.offsetTop > gameArea.offsetHeight) {
                    clearInterval(fallInterval);
                    gameArea.removeChild(object);
                }
            }
        }, 40); // Slowed down fall speed from 30 to 40
    }
});
