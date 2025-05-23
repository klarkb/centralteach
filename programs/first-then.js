// First/Then program implementation
console.log('first-then.js starting execution');

// Function to open the First/Then configuration modal
function openFirstThenModal() {
    console.log('openFirstThenModal function called');
    
    const modal = document.getElementById('stimulusModal');
    if (!modal) {
        console.error('Stimulus modal not found');
        return;
    }
    
    // Update modal title to First/Then
    const modalTitle = modal.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = 'First/Then';
    }
    
    // Show the modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Initialize search input for this modal instance
    const searchInput = modal.querySelector('.search-icons input');
    if (searchInput) {
        // Clear any previous value
        searchInput.value = '';
        // Add or refresh the event listener
        searchInput.addEventListener('input', (e) => {
            window.filterIconsBySearch(e.target.value, modal);
        });
        // Set focus on search field for immediate use
        setTimeout(() => searchInput.focus(), 100);
    }
}

// Function to render a First/Then program in the content area
function renderFirstThenProgram(config, stimulusDisplay) {
    // Show two items - first one, then the other
    const promptElement = document.querySelector('.prompt-text');
    promptElement.textContent = '"First work, then play"';
    
    // Get the first two stimuli
    const firstStimulus = config.stimuli[0] || { src: 'assets/Everyday/book.png', alt: 'Work' };
    const thenStimulus = config.stimuli[1] || { src: 'assets/Emotions/happy.png', alt: 'Play' };
    
    stimulusDisplay.innerHTML = `
        <div class="first-then-container" style="display: flex; gap: 30px; align-items: center;">
            <div class="first-container" style="text-align: center;">
                <h3>First</h3>
                <img src="${firstStimulus.src}" alt="${firstStimulus.alt}" style="width: 150px; height: 150px; object-fit: contain;">
            </div>
            <div style="font-size: 24px;">→</div>
            <div class="then-container" style="text-align: center;">
                <h3>Then</h3>
                <img src="${thenStimulus.src}" alt="${thenStimulus.alt}" style="width: 150px; height: 150px; object-fit: contain;">
            </div>
        </div>
    `;
}

// Make functions available globally
window.openFirstThenModal = openFirstThenModal;
window.renderFirstThenProgram = renderFirstThenProgram;

// Initialize event listeners after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get reference to the First/Then program item in the sidebar
    const firstThenProgramItem = Array.from(document.querySelectorAll('.program-item'))
        .find(item => item.querySelector('.program-details h3')?.textContent === 'First/Then');
    
    if (firstThenProgramItem) {
        // Remove any existing click listeners
        const newFirstThenItem = firstThenProgramItem.cloneNode(true);
        firstThenProgramItem.parentNode.replaceChild(newFirstThenItem, firstThenProgramItem);
        
        // Add click listener that calls our openFirstThenModal function
        newFirstThenItem.addEventListener('click', () => {
            openFirstThenModal();
        });
    }
    
    console.log('First/Then program initialized');
});

console.log('first-then.js fully loaded');
