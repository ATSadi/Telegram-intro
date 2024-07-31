document.addEventListener('DOMContentLoaded', function () {
    const navItems = document.querySelectorAll('.nav-item');
    const playButton = document.querySelector('.play-button');
    const inviteButton = document.querySelector('.invite-button');
    const overlay = document.getElementById('invitation-overlay');
    const invitationLink = document.getElementById('invitation-link');
    const copyLinkButton = document.getElementById('copy-link');
    const closeOverlayButton = document.getElementById('close-overlay');

    console.log('Play Button:', playButton);
    console.log('Invite Button:', inviteButton);

    // Handle navigation
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

    // Handle the Play Game button
    if (playButton) {
        playButton.addEventListener('click', function () {
            console.log('Play Game button clicked');
            window.location.href = 'game.html'; // Redirects to the game interface
        });
    }

    // Invite Friends button functionality
    if (inviteButton) {
        inviteButton.addEventListener('click', function () {
            console.log('Invite Friends button clicked');
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
    }

    // Handle the copy link button functionality
    if (copyLinkButton) {
        copyLinkButton.addEventListener('click', function () {
            console.log('Copy Link button clicked');
            navigator.clipboard.writeText(invitationLink.textContent)
                .then(() => alert('Link copied!'))
                .catch(err => console.error('Error copying text: ', err));
        });
    }

    // Close the invitation overlay
    if (closeOverlayButton) {
        closeOverlayButton.addEventListener('click', function () {
            console.log('Close Overlay button clicked');
            overlay.style.display = 'none';
        });
    }
});
