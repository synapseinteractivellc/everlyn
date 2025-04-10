// ui-manager.js

const UIManager = {
    updatePlayerNameDisplay: function(playerName) {
        const playerNameDisplay = document.getElementById('player-name-display');
        if (playerNameDisplay) {
            playerNameDisplay.textContent = playerName;
        } else {
            console.error('Element with id "player-name-display" not found.');
        }
    }
};

export default UIManager;