// Function to update progress bars
function updateProgressBar(statName, currentValue, maxValue) {
    // Calculate the percentage
    const percentage = (currentValue / maxValue) * 100;
    
    // Find the progress bar container
    const progressContainer = document.querySelector(`.stat-item:has(.${statName}-bar) .progress-container`);
    
    if (progressContainer) {
        // Find the progress bar element
        const progressBar = progressContainer.querySelector(`.${statName}-bar`);
        
        // Find the text element
        const progressText = progressContainer.querySelector('.progress-bar-text');
        
        if (progressBar) {
            // Update the width based on the percentage
            progressBar.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            // Update the text with the stat name and values
            progressText.textContent = `${statName.charAt(0).toUpperCase() + statName.slice(1).replace('-', ' ')}: ${currentValue}/${maxValue}`;
        }
    }
}

// Example usage:
// updateProgressBar('health', 7, 10); // Update health to 7/10
// updateProgressBar('stamina', 5, 10); // Update stamina to 5/10
// updateProgressBar('mana', 8, 10); // Update mana to 8/10

// Function to initialize all progress bars
function initProgressBars() {
    const statItems = document.querySelectorAll('.stat-item');
    
    statItems.forEach(item => {
        // Find the progress bar
        const progressBar = item.querySelector('.progress-bar');
        if (!progressBar) return;
        
        // Get the stat name from the progress bar class
        const classNames = progressBar.className.split(' ');
        const barClassName = classNames.find(className => className.endsWith('-bar'));
        if (!barClassName) return;
        
        const statName = barClassName.replace('-bar', '');
        
        // Get the text element
        const progressText = item.querySelector('.progress-bar-text');
        if (progressText) {
            // Parse current/max values from the text
            const textContent = progressText.textContent;
            const valuesPart = textContent.split(':')[1]?.trim() || '';
            const values = valuesPart.split('/');
            
            if (values.length === 2) {
                const currentValue = parseInt(values[0], 10);
                const maxValue = parseInt(values[1], 10);
                
                // Set initial width
                const percentage = (currentValue / maxValue) * 100;
                progressBar.style.width = `${percentage}%`;
            }
        }
    });
}

// Run initialization when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initProgressBars();
    
    // We can simulate some changes for testing
    // Uncomment these to test dynamic updates
    /*
    setTimeout(() => {
        updateProgressBar('health', 7, 10);
        updateProgressBar('stamina', 5, 10);
        updateProgressBar('mana', 8, 10);
    }, 2000); // Update after 2 seconds
    */
});