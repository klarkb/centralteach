// Safety program implementation
console.log('safety.js starting execution');

// Function to open the Safety configuration modal
function openSafetyModal() {
    console.log('openSafetyModal function called');
    
    const modal = document.getElementById('stimulusModal');
    if (!modal) {
        console.error('Stimulus modal not found');
        return;
    }
    
    // Cleanup any First/Then specific UI and classes
    modal.classList.remove('first-then-modal');
    const firstThenStatus = modal.querySelector('.first-then-status');
    if (firstThenStatus) firstThenStatus.remove();
    
    const firstThenPreview = modal.querySelector('.first-then-preview');
    if (firstThenPreview) firstThenPreview.remove();
    
    // Remove any First/Then specific classes
    modal.querySelectorAll('.icon-item.first-selected, .icon-item.then-selected').forEach(item => {
        item.classList.remove('first-selected', 'then-selected');
    });
    
    // Update modal title to Safety
    const modalTitle = modal.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = 'Safety';
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

// Function to render a Safety program in the content area
function renderSafetyProgram(config, stimulusDisplay) {
    // Placeholder implementation for safety program
    // This will be implemented in the future
    const promptElement = document.querySelector('.prompt-text');
    promptElement.textContent = 'Safety Awareness';
    
    stimulusDisplay.innerHTML = '<div style="text-align: center; padding: 20px;"><h3>Safety program will be implemented soon</h3></div>';
}

// Make functions available globally
window.openSafetyModal = openSafetyModal;
window.renderSafetyProgram = renderSafetyProgram;

// Register this program module
if (window.registerProgramModule) {
    window.registerProgramModule('Safety', renderSafetyProgram, null);
} else {
    console.error('Program registration system not available');
}

// Initialize event listeners after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get reference to the Safety program item in the sidebar
    const safetyProgramItem = Array.from(document.querySelectorAll('.program-item'))
        .find(item => item.querySelector('.program-details h3')?.textContent === 'Safety');
    
    if (safetyProgramItem) {
        // Remove any existing click listeners
        const newSafetyItem = safetyProgramItem.cloneNode(true);
        safetyProgramItem.parentNode.replaceChild(newSafetyItem, safetyProgramItem);
        
        // Add click listener that calls our openSafetyModal function
        newSafetyItem.addEventListener('click', () => {
            openSafetyModal();
        });
    }
    
    console.log('Safety program initialized');
});

console.log('safety.js fully loaded');
