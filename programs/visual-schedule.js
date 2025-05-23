// Visual Schedule program implementation
console.log('visual-schedule.js starting execution');

// Function to open the Visual Schedule configuration modal
function openVisualScheduleModal() {
    console.log('openVisualScheduleModal function called');
    
    const modal = document.getElementById('stimulusModal');
    if (!modal) {
        console.error('Stimulus modal not found');
        return;
    }
    
    // Update modal title to Visual Schedule
    const modalTitle = modal.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = 'Visual Schedule';
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

// Function to render a Visual Schedule program in the content area
function renderVisualScheduleProgram(config, stimulusDisplay) {
    // Show a sequence of activities
    const promptElement = document.querySelector('.prompt-text');
    promptElement.textContent = '"Your schedule today"';
    
    stimulusDisplay.innerHTML = `<div class="schedule-container" style="display: flex; flex-direction: column; gap: 10px;"></div>`;
    const scheduleContainer = stimulusDisplay.querySelector('.schedule-container');
    
    // Create a schedule with all the selected stimuli
    config.stimuli.forEach((stimulus, index) => {
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        scheduleItem.style.display = 'flex';
        scheduleItem.style.alignItems = 'center';
        scheduleItem.style.gap = '10px';
        scheduleItem.style.marginBottom = '15px';
        
        const numberCircle = document.createElement('div');
        numberCircle.textContent = index + 1;
        numberCircle.style.width = '30px';
        numberCircle.style.height = '30px';
        numberCircle.style.borderRadius = '50%';
        numberCircle.style.backgroundColor = '#4caf50';
        numberCircle.style.color = 'white';
        numberCircle.style.display = 'flex';
        numberCircle.style.justifyContent = 'center';
        numberCircle.style.alignItems = 'center';
        
        const img = document.createElement('img');
        img.src = stimulus.src;
        img.alt = stimulus.alt;
        img.style.width = '80px';
        img.style.height = '80px';
        img.style.objectFit = 'contain';
        
        const label = document.createElement('span');
        label.textContent = stimulus.alt;
        label.style.fontSize = '18px';
        
        scheduleItem.appendChild(numberCircle);
        scheduleItem.appendChild(img);
        scheduleItem.appendChild(label);
        
        scheduleContainer.appendChild(scheduleItem);
    });
}

// Make functions available globally
window.openVisualScheduleModal = openVisualScheduleModal;
window.renderVisualScheduleProgram = renderVisualScheduleProgram;

// Initialize event listeners after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get reference to the Visual Schedule program item in the sidebar
    const visualScheduleProgramItem = Array.from(document.querySelectorAll('.program-item'))
        .find(item => item.querySelector('.program-details h3')?.textContent === 'Visual Schedule');
    
    if (visualScheduleProgramItem) {
        // Remove any existing click listeners
        const newVisualScheduleItem = visualScheduleProgramItem.cloneNode(true);
        visualScheduleProgramItem.parentNode.replaceChild(newVisualScheduleItem, visualScheduleProgramItem);
        
        // Add click listener that calls our openVisualScheduleModal function
        newVisualScheduleItem.addEventListener('click', () => {
            openVisualScheduleModal();
        });
    }
    
    console.log('Visual Schedule program initialized');
});

console.log('visual-schedule.js fully loaded');
