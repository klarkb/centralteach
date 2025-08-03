// Program utilities shared among all program modules
console.log('program-utils.js starting execution');

// Initialize empty render and handler objects that will be populated by program modules
window.programTypeRenderers = {};
window.programTypeNextHandlers = {};

// Function to register program modules - will be called by each program script
window.registerProgramModule = function(type, renderFn, nextHandlerFn = null) {
    console.log(`Registering program module: ${type}`);
    window.programTypeRenderers[type] = renderFn;
    window.programTypeNextHandlers[type] = nextHandlerFn;
}

// Default registrations - these will be overwritten by actual modules
window.registerProgramModule('Tacting / Rec. ID', null);
window.registerProgramModule('Sight Words', null);
window.registerProgramModule('First/Then', null);
window.registerProgramModule('Visual Schedule', null);
window.registerProgramModule('Safety', null);
window.registerProgramModule('Sentence Strips', null);
window.registerProgramModule('Sentence Strips', null);

// Global space key handler to prevent duplicates
let globalSpaceKeyHandler = null;
let lastSpaceKeyTime = 0;
const SPACE_KEY_DEBOUNCE_DELAY = 300; // 300ms debounce to prevent rapid-fire events

// Function to render bottom controls consistently for all program types
function renderBottomControls(config, tabId) {
    // Clean up any existing controls first
    document.querySelectorAll('.program-controls').forEach(el => {
        // Clean up associated space key handler if it exists
        if (el._spaceKeyHandler) {
            document.removeEventListener('keydown', el._spaceKeyHandler);
        }
        el.remove();
    });
    
    // Clean up global space key handler
    if (globalSpaceKeyHandler) {
        document.removeEventListener('keydown', globalSpaceKeyHandler);
        globalSpaceKeyHandler = null;
    }
    
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
        } else if (config.type === 'First/Then' && window.openFirstThenEditModal) {
            console.log('Opening First/Then edit modal for tab:', tabId);
            window.openFirstThenEditModal(tabId);
        } else if (config.type === 'Sentence Strips' && window.openSentenceStripsEditModal) {
            console.log('Opening Sentence Strips edit modal for tab:', tabId);
            window.openSentenceStripsEditModal(tabId);
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
    } else if (config.type === 'First/Then' || config.type === 'Sentence Strips') {
        // First/Then and Sentence Strips programs are static displays - hide next button
        nextButton.style.display = 'none';
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
    globalSpaceKeyHandler = (e) => {
        // Only trigger if Space is pressed and we're not in an input field or modal
        if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
            // Check if we're in a modal (don't trigger space in modals)
            const activeModal = document.querySelector('.modal[style*="display: block"], .modal[style*="display:block"]');
            if (activeModal) {
                return; // Don't trigger space key in modals
            }
            
            // Debounce to prevent rapid-fire events
            const currentTime = Date.now();
            if (currentTime - lastSpaceKeyTime < SPACE_KEY_DEBOUNCE_DELAY) {
                return; // Too soon since last space key press
            }
            lastSpaceKeyTime = currentTime;
            
            e.preventDefault(); // Prevent page scrolling
            
            // Only trigger if the next button is visible and not disabled
            if (nextButton && nextButton.style.display !== 'none' && !nextButton.disabled) {
                // Add visual feedback for space key press
                nextButton.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    if (nextButton) {
                        nextButton.style.transform = '';
                    }
                }, 150);
                
                nextButton.click();
            }
        }
    };
    
    // Add the new space key listener
    document.addEventListener('keydown', globalSpaceKeyHandler);
    
    // Store the handler reference for cleanup
    controlsContainer._spaceKeyHandler = globalSpaceKeyHandler;
    
    console.log(`Controls rendered for ${config.type} program with tabId: ${tabId}`);
}

// Function to clean up all program controls and event listeners
function cleanupProgramControls() {
    // Remove all program controls
    document.querySelectorAll('.program-controls').forEach(el => {
        // Clean up associated space key handler if it exists
        if (el._spaceKeyHandler) {
            document.removeEventListener('keydown', el._spaceKeyHandler);
        }
        el.remove();
    });
    
    // Clean up global space key handler
    if (globalSpaceKeyHandler) {
        document.removeEventListener('keydown', globalSpaceKeyHandler);
        globalSpaceKeyHandler = null;
    }
    
    // Reset debounce timer
    lastSpaceKeyTime = 0;
}

// Function to filter icons by search term - maintain grid layout
function filterIconsBySearch(searchTerm, container = document) {
    const searchNormalized = searchTerm.toLowerCase().trim();
    
    // Handle both category-based grids and flat icon grids
    const categories = container.querySelectorAll('.category-container');
    const iconGrid = container.querySelector('.icon-grid');
    
    if (categories.length > 0) {
        // Handle category-based layout
        categories.forEach(category => {
            const header = category.previousElementSibling;
            if (!header) return;

            const icons = category.querySelectorAll('.icon-item');
            let hasVisibleIcons = false;

            // Ensure the category container maintains its grid layout with auto-fill for consistent spacing
            category.style.display = 'grid';
            category.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
            category.style.gap = '10px';
            category.style.padding = '10px';

            icons.forEach(icon => {
                const img = icon.querySelector('img');
                const altText = img ? img.alt.toLowerCase() : '';
                const isMatch = altText.includes(searchNormalized);
                
                // Keep icons in grid layout - use grid-column properties to prevent stretching
                if (isMatch || !searchTerm) {
                    icon.style.display = 'flex';
                    icon.style.gridColumn = 'auto';
                    hasVisibleIcons = true;
                } else {
                    icon.style.display = 'none';
                }
            });

            // Show/hide category header and container based on if any icons are visible
            header.style.display = hasVisibleIcons ? 'block' : 'none';
            category.style.display = hasVisibleIcons ? 'grid' : 'none';
        });
    } else if (iconGrid) {
        // Handle flat icon grid layout (like in modals)
        const icons = iconGrid.querySelectorAll('.icon-item');
        
        // Ensure the icon grid maintains consistent layout with auto-fill
        iconGrid.style.display = 'grid';
        iconGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(110px, 1fr))';
        iconGrid.style.gap = '18px';
        iconGrid.style.padding = '10px 0 0 0';
        
        icons.forEach(icon => {
            const img = icon.querySelector('img');
            const altText = img ? img.alt.toLowerCase() : '';
            const isMatch = altText.includes(searchNormalized);
            
            // Use grid-column properties to maintain consistent spacing
            if (isMatch || !searchTerm) {
                icon.style.display = 'flex';
                icon.style.gridColumn = 'auto';
            } else {
                icon.style.display = 'none';
            }
        });
    }
}

// Make utility functions available globally
window.renderBottomControls = renderBottomControls;
window.cleanupProgramControls = cleanupProgramControls;
window.filterIconsBySearch = filterIconsBySearch;

console.log('program-utils.js fully loaded');
