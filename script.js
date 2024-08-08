document.addEventListener('DOMContentLoaded', function () {
    const tonConnect = new TonConnect({
        manifestUrl: 'https://teleintro.netlify.app/tonconnect-manifest.json'
    });

    async function connectWallet() {
        try {
            const wallet = await tonConnect.connect();
            console.log('Wallet connected:', wallet);
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    }

    document.getElementById('connect-wallet').addEventListener('click', connectWallet);

    // Existing script content
    const navItems = document.querySelectorAll('.nav-item');
    const playButton = document.querySelector('.play-button');
    const inviteButton = document.querySelector('.invite-button');
    const overlay = document.getElementById('invitation-overlay');
    const invitationLink = document.getElementById('invitation-link');
    const copyLinkButton = document.getElementById('copy-link');
    const closeOverlayButton = document.getElementById('close-overlay');
    const scoreValue = document.getElementById('score-value');

    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }

    console.log('User ID:', userId);
    console.log('Play Button:', playButton);
    console.log('Invite Button:', inviteButton);

    if (scoreValue) {
        fetch(`https://telegram-intro.onrender.com/user/${userId}`)
            .then(response => response.json())
            .then(data => {
                scoreValue.textContent = data.score;
            })
            .catch(error => {
                console.error('Failed to fetch user score:', error);
            });
    }

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            console.log('Navigation item clicked:', this.textContent.trim());
            if (this.textContent.trim() === 'HOME') {
                window.location.href = 'index.html';
            } else if (this.textContent.trim() === 'TASKS') {
                window.location.href = 'tasks.html';
            } else if (this.textContent.trim() === 'FRIENDS') {
                window.location.href = 'friends.html';
            }
        });
    });

    if (playButton) {
        playButton.addEventListener('click', function () {
            console.log('Play Game button clicked');
            window.location.href = 'game.html';
        });
    }

    if (inviteButton) {
        inviteButton.addEventListener('click', function () {
            console.log('Invite Friends button clicked');
            fetch('https://telegram-intro.onrender.com/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userId })
            })
            .then(response => response.json())
            .then(data => {
                overlay.style.display = 'flex';
                invitationLink.textContent = data.link;
            })
            .catch(error => {
                console.error('Failed to generate invite link:', error);
                alert('Failed to generate invite link.');
            });
        });
    }

    if (copyLinkButton) {
        copyLinkButton.addEventListener('click', function () {
            console.log('Copy Link button clicked');
            navigator.clipboard.writeText(invitationLink.textContent)
                .then(() => alert('Link copied!'))
                .catch(err => console.error('Error copying text: ', err));
        });
    }

    if (closeOverlayButton) {
        closeOverlayButton.addEventListener('click', function () {
            console.log('Close Overlay button clicked');
            overlay.style.display = 'none';
        });
    }
});
