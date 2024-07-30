document.addEventListener('DOMContentLoaded', function () {
    const navItems = document.querySelectorAll('.nav-item');
    const playButton = document.querySelector('.play-button');
    const inviteButton = document.querySelector('.invite-button');
    const overlay = document.getElementById('invitation-overlay');
    const invitationLink = document.getElementById('invitation-link');
    const copyLinkButton = document.getElementById('copy-link');
    const closeOverlayButton = document.getElementById('close-overlay');

    // Handle navigation
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            if (this.textContent.trim() === 'HOME') {
                window.location.href = 'index.html';
            } else if (this.textContent.trim() === 'TASKS') {
                window.location.href = 'tasks.html';
            } else if (this.textContent.trim() === 'FRIENDS') {
                window.location.href = 'friends.html';
            }
        });
    });

    // Handle the Play Game button
    playButton.addEventListener('click', function () {
        window.location.href = 'game.html'; // Redirects to the game interface
    });

    // Handle invitation functionality
    inviteButton.addEventListener('click', function () {
        fetch('http://localhost:3000/create-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: 'user1' }) // Replace 'user1' with the actual user ID logic if necessary
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

    // Handle the copy link button functionality
    copyLinkButton.addEventListener('click', function () {
        navigator.clipboard.writeText(invitationLink.textContent)
            .then(() => alert('Link copied!'))
            .catch(err => console.error('Error copying text: ', err));
    });

    // Close the invitation overlay
    closeOverlayButton.addEventListener('click', function () {
        overlay.style.display = 'none';
    });
});
