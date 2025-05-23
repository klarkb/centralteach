// Program utilities shared among all program modules
console.log('program-utils.js starting execution');

// Global object to map program types to their render functions
window.programTypeRenderers = {
    'Tacting / Rec. ID': window.renderTactingProgram,
    'Sight Words': window.renderSightWordsProgram, // Using the function defined in sightwords.js
    'First/Then': window.renderFirstThenProgram,
    'Visual Schedule': window.renderVisualScheduleProgram, 
    'Safety': window.renderSafetyProgram
};

// Global object to map program types to their next button click handlers
window.programTypeNextHandlers = {
    'Tacting / Rec. ID': window.tactingHandleNextClick,
    'Sight Words': null, // Handled by separate modal system
    'First/Then': null,  // No next button functionality for these
    'Visual Schedule': null,
    'Safety': null
};

// Function to render bottom controls consistently for all program types
function renderBottomControls(config, tabId) {
    // Clean up any existing controls first
    document.querySelectorAll('.program-controls').forEach(el => el.remove());
    
    // Create controls container - positioned at bottom center of screen
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'program-controls';
    controlsContainer.style.position = 'fixed';
    controlsContainer.style.bottom = '20px';
    controlsContainer.style.left = '50%';
    controlsContainer.style.transform = 'translateX(-50%)'; // Center horizontally
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'center'; // Center buttons
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.zIndex = '90';
    controlsContainer.style.padding = '0 20px';
    
    // Edit button
    const editButton = document.createElement('button');
    editButton.textContent = '✎ Edit';
    editButton.className = 'edit-button';
    editButton.style.padding = '10px 15px';
    editButton.style.backgroundColor = '#2196F3';
    editButton.style.color = 'white';
    editButton.style.border = 'none';
    editButton.style.borderRadius = '4px';
    editButton.style.marginRight = '10px'; // Space between buttons
    editButton.style.cursor = 'pointer';
    editButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)'; // Add shadow for visibility
    
    // Add appropriate edit handler based on program type
    editButton.addEventListener('click', () => {
        console.log('Edit button clicked for program type:', config.type);
        if (config.type === 'Sight Words' && window.openSightWordsEditModal) {
            console.log('Opening Sight Words edit modal for tab:', tabId);
            window.openSightWordsEditModal(tabId);
        } else if (window.openEditModal) {
            console.log('Opening standard edit modal for tab:', tabId);
            window.openEditModal(tabId);
        }
    });
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next →';
    nextButton.className = 'next-button';
    nextButton.style.padding = '10px 15px';
    nextButton.style.backgroundColor = '#4CAF50'; // Green
    nextButton.style.color = 'white';
    nextButton.style.border = 'none';
    nextButton.style.borderRadius = '4px';
    nextButton.style.cursor = 'pointer';
    nextButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)'; // Add shadow for visibility
    
    // Handle program-specific next button functionality
    if (window.programTypeNextHandlers[config.type]) {
        nextButton.addEventListener('click', () => {
            window.programTypeNextHandlers[config.type](config, window.updateProgramContent);
        });
    } else if (config.type === 'Sight Words') {
        // Sight Words uses custom rendering logic
        const words = config.words || [];
        nextButton.addEventListener('click', () => {
            config.currentIndex = (config.currentIndex + 1) % words.length;
            window.updateProgramContent();
        });
    } else {
        // Hide next button for programs that don't need it
        nextButton.style.display = 'none';
    }
    
    // Add buttons to container
    controlsContainer.appendChild(editButton);
    controlsContainer.appendChild(nextButton);
    
    // Add controls to document body instead of the stimulus display
    document.body.appendChild(controlsContainer);
    
    // Add keyboard support for Space key to trigger Next button
    const handleSpaceKey = (e) => {
        // Only trigger if Space is pressed and we're not in an input field
        if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
            e.preventDefault(); // Prevent page scrolling
            
            // Only trigger if the next button is visible and not disabled
            if (nextButton.style.display !== 'none' && !nextButton.disabled) {
                nextButton.click();
            }
        }
    };
    
    // Remove any existing space key listeners to avoid duplicates
    document.removeEventListener('keydown', handleSpaceKey);
    // Add the new space key listener
    document.addEventListener('keydown', handleSpaceKey);
    
    // Store the handler on the controls container so we can clean it up later
    controlsContainer._spaceKeyHandler = handleSpaceKey;
    
    console.log(`Controls rendered for ${config.type} program with tabId: ${tabId}`);
}

// Function to filter icons by search term - maintain grid layout
function filterIconsBySearch(searchTerm, container = document) {
    const searchNormalized = searchTerm.toLowerCase().trim();
    const categories = container.querySelectorAll('.category-container');

    categories.forEach(category => {
        const header = category.previousElementSibling;
        if (!header) return;

        const icons = category.querySelectorAll('.icon-item');
        let hasVisibleIcons = false;

        // Ensure the category container maintains its grid layout
        category.style.display = 'grid';
        category.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
        category.style.gap = '10px';
        category.style.padding = '10px';

        icons.forEach(icon => {
            const img = icon.querySelector('img');
            const altText = img ? img.alt.toLowerCase() : '';
            const isMatch = altText.includes(searchNormalized);
            
            // Keep icons in grid layout by using grid-column-start: auto
            icon.style.display = isMatch || !searchTerm ? 'flex' : 'none';
            icon.style.gridColumnStart = 'auto';
            if (isMatch || !searchTerm) {
                hasVisibleIcons = true;
            }
        });

        // Show/hide category header and container based on if any icons are visible
        header.style.display = hasVisibleIcons ? 'block' : 'none';
        category.style.display = hasVisibleIcons ? 'grid' : 'none';
    });
}

// Make utility functions available globally
window.renderBottomControls = renderBottomControls;
window.filterIconsBySearch = filterIconsBySearch;

console.log('program-utils.js fully loaded');
