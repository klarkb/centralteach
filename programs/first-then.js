// First/Then program implementation
console.log('first-then.js starting execution');

// Track First/Then program state
let firstThenState = {
    firstIcon: null,
    thenIcon: null,
    currentStep: 'first' // 'first' or 'then'
};

// Function to open the First/Then configuration modal
function openFirstThenModal() {
    console.log('openFirstThenModal function called');
    
    // Reset state for new program
    firstThenState = {
        firstIcon: null,
        thenIcon: null,
        currentStep: 'first'
    };
    
    const modal = document.getElementById('stimulusModal');
    if (!modal) {
        console.error('Stimulus modal not found');
        return;
    }
    
    // Update modal title and styling for First/Then
    const modalTitle = modal.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = 'First/Then Setup';
    }
    
    // Add first-then specific UI modifications
    setupFirstThenModalUI(modal);
    
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
    
    // Set up First/Then specific functionality
    setupFirstThenInteractions(modal);
}

// Function to setup First/Then specific modal UI
function setupFirstThenModalUI(modal) {
    // Add CSS class for First/Then specific styling
    modal.classList.add('first-then-modal');
    
    // Remove field size selector since First/Then is always 2 items and doesn't need it
    const fieldSizeSelector = modal.querySelector('.field-size-selector');
    if (fieldSizeSelector) {
        fieldSizeSelector.remove(); // Remove completely instead of just hiding
    }
    
    // Hide target selection button since First/Then doesn't use targets
    const selectTargetBtn = modal.querySelector('.select-target-btn');
    if (selectTargetBtn) {
        selectTargetBtn.style.display = 'none';
    }
    
    // Create First/Then selection indicator
    let statusIndicator = modal.querySelector('.first-then-status');
    if (!statusIndicator) {
        statusIndicator = document.createElement('div');
        statusIndicator.className = 'first-then-status';
        
        // Insert after title input container
        const titleContainer = modal.querySelector('.title-input-container');
        titleContainer.parentNode.insertBefore(statusIndicator, titleContainer.nextSibling);
    }
    
    updateFirstThenStatus(modal);
    
    // Create selected icons preview
    let previewContainer = modal.querySelector('.first-then-preview');
    if (!previewContainer) {
        previewContainer = document.createElement('div');
        previewContainer.className = 'first-then-preview';
        
        // Insert before search icons
        const searchIcons = modal.querySelector('.search-icons');
        searchIcons.parentNode.insertBefore(previewContainer, searchIcons);
    }
    
    updateFirstThenPreview(modal);
}

// Function to update the status indicator
function updateFirstThenStatus(modal) {
    const statusIndicator = modal.querySelector('.first-then-status');
    if (!statusIndicator) return;
    
    if (!firstThenState.firstIcon) {
        statusIndicator.textContent = 'Step 1: Select the FIRST activity';
        statusIndicator.style.background = 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)';
    } else if (!firstThenState.thenIcon) {
        statusIndicator.textContent = 'Step 2: Select the THEN activity';
        statusIndicator.style.background = 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)';
    } else {
        statusIndicator.textContent = '✓ Both activities selected!';
        statusIndicator.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
    }
}

// Function to update the preview display
function updateFirstThenPreview(modal) {
    const previewContainer = modal.querySelector('.first-then-preview');
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    // First slot
    const firstSlot = document.createElement('div');
    firstSlot.className = `first-then-slot first-slot ${firstThenState.firstIcon ? 'filled' : ''}`;
    
    if (firstThenState.firstIcon) {
        firstSlot.innerHTML = `
            <h4>First</h4>
            <img src="${firstThenState.firstIcon.src}" alt="${firstThenState.firstIcon.alt}">
            <span>${firstThenState.firstIcon.alt}</span>
        `;
    } else {
        firstSlot.innerHTML = `
            <h4>First</h4>
            <div class="placeholder">?</div>
            <span>Select activity</span>
        `;
    }
    
    // Arrow
    const arrow = document.createElement('div');
    arrow.className = 'first-then-arrow';
    arrow.textContent = '→';
    
    // Then slot
    const thenSlot = document.createElement('div');
    thenSlot.className = `first-then-slot then-slot ${firstThenState.thenIcon ? 'filled' : ''}`;
    
    if (firstThenState.thenIcon) {
        thenSlot.innerHTML = `
            <h4>Then</h4>
            <img src="${firstThenState.thenIcon.src}" alt="${firstThenState.thenIcon.alt}">
            <span>${firstThenState.thenIcon.alt}</span>
        `;
    } else {
        thenSlot.innerHTML = `
            <h4>Then</h4>
            <div class="placeholder">?</div>
            <span>Select activity</span>
        `;
    }
    
    previewContainer.appendChild(firstSlot);
    previewContainer.appendChild(arrow);
    previewContainer.appendChild(thenSlot);
}

// Function to setup First/Then specific interactions
function setupFirstThenInteractions(modal) {
    // Set up icon selection for First/Then
    const iconItems = modal.querySelectorAll('.icon-item');
    
    iconItems.forEach(item => {
        // Remove any existing listeners by cloning
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        // Add First/Then specific click handler
        newItem.addEventListener('click', () => {
            const img = newItem.querySelector('img');
            const iconData = {
                src: img.src,
                alt: img.alt
            };
            
            // Handle selection based on current step
            if (!firstThenState.firstIcon) {
                // Select as First
                firstThenState.firstIcon = iconData;
                firstThenState.currentStep = 'then';
                console.log('Selected FIRST:', iconData.alt);
            } else if (!firstThenState.thenIcon) {
                // Select as Then (only if it's different from First)
                if (iconData.src !== firstThenState.firstIcon.src) {
                    firstThenState.thenIcon = iconData;
                    console.log('Selected THEN:', iconData.alt);
                } else {
                    return; // Skip selecting same icon
                }
            } else {
                // Both slots filled - allow user to replace
                if (iconData.src === firstThenState.firstIcon.src) {
                    // Clicking on First icon - clear it
                    firstThenState.firstIcon = null;
                    firstThenState.currentStep = 'first';
                    console.log('Cleared FIRST selection');
                } else if (iconData.src === firstThenState.thenIcon.src) {
                    // Clicking on Then icon - clear it
                    firstThenState.thenIcon = null;
                    firstThenState.currentStep = 'then';
                    console.log('Cleared THEN selection');
                } else {
                    // Replace the current step
                    if (firstThenState.currentStep === 'first' || !firstThenState.thenIcon) {
                        firstThenState.firstIcon = iconData;
                        firstThenState.currentStep = 'then';
                        console.log('Replaced FIRST:', iconData.alt);
                    } else {
                        firstThenState.thenIcon = iconData;
                        console.log('Replaced THEN:', iconData.alt);
                    }
                }
            }
            
            updateFirstThenStatus(modal);
            updateFirstThenPreview(modal);
            updateIconHighlights(modal);
        });
    });
    
    // Set up Done button for First/Then
    setupFirstThenDoneButton(modal);
    
    updateIconHighlights(modal);
}

// Function to update icon highlights
function updateIconHighlights(modal) {
    const iconItems = modal.querySelectorAll('.icon-item');
    
    iconItems.forEach(item => {
        const img = item.querySelector('img');
        item.classList.remove('selected', 'first-selected', 'then-selected');
        
        if (firstThenState.firstIcon && img.src === firstThenState.firstIcon.src) {
            item.classList.add('first-selected');
        } else if (firstThenState.thenIcon && img.src === firstThenState.thenIcon.src) {
            item.classList.add('then-selected');
        }
    });
}

// Function to setup Done button for First/Then
function setupFirstThenDoneButton(modal) {
    const doneButton = modal.querySelector('.done-btn');
    if (!doneButton) return;
    
    // Clone to remove existing listeners
    const newDoneButton = doneButton.cloneNode(true);
    doneButton.parentNode.replaceChild(newDoneButton, doneButton);
    
    newDoneButton.addEventListener('click', () => {
        // Get program title
        const programTitleInput = modal.querySelector('#programTitleInput');
        const tabCount = document.querySelectorAll('.tab[data-program="First/Then"]').length + 1;
        const defaultTabName = `First/Then ${tabCount}`;
        const newTabName = programTitleInput.value.trim() || defaultTabName;
        
        // Create tab ID
        const tabId = newTabName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
        
        // Create new tab
        const programTabs = document.querySelector('.program-tabs');
        const newTab = document.createElement('div');
        newTab.className = 'tab';
        newTab.setAttribute('data-program', 'First/Then');
        newTab.setAttribute('id', tabId);
        newTab.innerHTML = `${newTabName}<span class="close-tab">×</span>`;
        
        // Store program configuration
        window.programConfigs = window.programConfigs || {};
        window.programConfigs[tabId] = {
            type: 'First/Then',
            firstIcon: firstThenState.firstIcon,
            thenIcon: firstThenState.thenIcon,
            title: newTabName
        };
        
        // Add tab to tabs bar
        programTabs.appendChild(newTab);
        
        // Set up tab click handler
        newTab.addEventListener('click', function() {
            if (window.activateTab) {
                window.activateTab(newTab);
            }
        });
        
        // Set up close button
        const closeBtn = newTab.querySelector('.close-tab');
        closeBtn.addEventListener('click', e => {
            e.stopPropagation();
            
            // Check if this was the active tab before removing
            const wasActive = newTab.classList.contains('active');
            
            if (window.programConfigs) {
                delete window.programConfigs[tabId];
            }
            newTab.remove();
            
            // If this was the active tab, immediately clear content and activate next tab or show empty message
            if (wasActive) {
                // Immediately clear the stimulus display to prevent stale content
                const stimulusDisplay = document.querySelector('.stimulus-display');
                if (stimulusDisplay) {
                    stimulusDisplay.innerHTML = '';
                }
                
                // Clean up any existing program controls
                if (window.cleanupProgramControls) {
                    window.cleanupProgramControls();
                }
                
                const firstAvailableTab = document.querySelector('.tab');
                if (firstAvailableTab && window.activateTab) {
                    window.activateTab(firstAvailableTab);
                } else {
                    // No tabs left, update content to show empty message
                    if (window.updateProgramContent) {
                        window.updateProgramContent();
                    }
                }
            }
            
            if (window.updateProgramStars) {
                window.updateProgramStars();
            }
        });
        
        // Activate the new tab
        if (window.activateTab) {
            window.activateTab(newTab);
        }
        
        // Close modal with success feedback
        newDoneButton.classList.add('button-success');
        setTimeout(() => {
            // Use the main closeModal function to ensure filters are reset
            if (window.closeModal) {
                window.closeModal();
            } else {
                // Fallback if closeModal is not available
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            
            // Reset state
            firstThenState = {
                firstIcon: null,
                thenIcon: null,
                currentStep: 'first'
            };
            
            // Clean up modal UI
            const statusIndicator = modal.querySelector('.first-then-status');
            if (statusIndicator) statusIndicator.remove();
            
            const previewContainer = modal.querySelector('.first-then-preview');
            if (previewContainer) previewContainer.remove();
            
            // Re-create the field size selector for other program types
            if (!modal.querySelector('.field-size-selector')) {
                const fieldSizeSelector = document.createElement('div');
                fieldSizeSelector.className = 'field-size-selector';
                fieldSizeSelector.innerHTML = '<span>Field Size: </span><input type="number" min="1" max="6" value="2" />';
                
                // Insert it after the title input container
                const titleContainer = modal.querySelector('.title-input-container');
                if (titleContainer) {
                    titleContainer.parentNode.insertBefore(fieldSizeSelector, titleContainer.nextSibling);
                }
            }
            
            const selectTargetBtn = modal.querySelector('.select-target-btn');
            if (selectTargetBtn) selectTargetBtn.style.display = '';
            
            // Clear title input
            programTitleInput.value = '';
            
            // Remove highlights
            modal.querySelectorAll('.icon-item').forEach(item => {
                item.classList.remove('first-selected', 'then-selected');
            });
        }, 600);
    });
}

// Function to open edit modal for First/Then programs
function openFirstThenEditModal(tabId) {
    const config = window.programConfigs[tabId];
    if (!config || config.type !== 'First/Then') return;
    
    // Set up state for editing
    firstThenState = {
        firstIcon: config.firstIcon || null,
        thenIcon: config.thenIcon || null,
        currentStep: 'first'
    };
    
    // Open the modal in edit mode
    const modal = document.getElementById('stimulusModal');
    if (!modal) {
        console.error('Stimulus modal not found');
        return;
    }
    
    // Update modal title for editing
    const modalTitle = modal.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = 'Edit First/Then';
    }
    
    // Set the program title
    const programTitleInput = modal.querySelector('#programTitleInput');
    if (programTitleInput) {
        programTitleInput.value = config.title || '';
    }
    
    // Set up the modal UI
    setupFirstThenModalUI(modal);
    
    // Show the modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Set up interactions
    setupFirstThenInteractions(modal);
    
    // Override the done button for editing
    setupFirstThenEditDoneButton(modal, tabId);
    
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

// Function to setup Done button for editing First/Then
function setupFirstThenEditDoneButton(modal, tabId) {
    const doneButton = modal.querySelector('.done-btn');
    if (!doneButton) return;
    
    // Clone to remove existing listeners
    const newDoneButton = doneButton.cloneNode(true);
    doneButton.parentNode.replaceChild(newDoneButton, doneButton);
    
    newDoneButton.addEventListener('click', () => {
        // Get updated title
        const programTitleInput = modal.querySelector('#programTitleInput');
        const newTitle = programTitleInput.value.trim();
        
        // Update the configuration
        const config = window.programConfigs[tabId];
        config.firstIcon = firstThenState.firstIcon;
        config.thenIcon = firstThenState.thenIcon;
        
        // Update tab title if changed
        if (newTitle && newTitle !== config.title) {
            config.title = newTitle;
            const tab = document.getElementById(tabId);
            if (tab) {
                tab.innerHTML = `${newTitle}<span class="close-tab">×</span>`;
                
                // Reattach close handler
                const closeBtn = tab.querySelector('.close-tab');
                closeBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    delete window.programConfigs[tabId];
                    tab.remove();
                    if (window.updateProgramStars) {
                        window.updateProgramStars();
                    }
                });
            }
        }
        
        // Close modal with success feedback
        newDoneButton.classList.add('button-success');
        setTimeout(() => {
            // Use the main closeModal function to ensure filters are reset
            if (window.closeModal) {
                window.closeModal();
            } else {
                // Fallback if closeModal is not available
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            
            // Reset state
            firstThenState = {
                firstIcon: null,
                thenIcon: null,
                currentStep: 'first'
            };
            
            // Clean up modal UI
            const statusIndicator = modal.querySelector('.first-then-status');
            if (statusIndicator) statusIndicator.remove();
            
            const previewContainer = modal.querySelector('.first-then-preview');
            if (previewContainer) previewContainer.remove();
            
            // Re-create the field size selector for other program types
            if (!modal.querySelector('.field-size-selector')) {
                const fieldSizeSelector = document.createElement('div');
                fieldSizeSelector.className = 'field-size-selector';
                fieldSizeSelector.innerHTML = '<span>Field Size: </span><input type="number" min="1" max="6" value="2" />';
                
                // Insert it after the title input container
                const titleContainer = modal.querySelector('.title-input-container');
                if (titleContainer) {
                    titleContainer.parentNode.insertBefore(fieldSizeSelector, titleContainer.nextSibling);
                }
            }
            
            const selectTargetBtn = modal.querySelector('.select-target-btn');
            if (selectTargetBtn) selectTargetBtn.style.display = '';
            
            // Clear title input
            programTitleInput.value = '';
            
            // Remove highlights
            modal.querySelectorAll('.icon-item').forEach(item => {
                item.classList.remove('first-selected', 'then-selected');
            });
            
            // Update display
            if (window.updateProgramContent) {
                window.updateProgramContent();
            }
        }, 600);
    });
}

// Function to render a First/Then program in the content area
function renderFirstThenProgram(config, stimulusDisplay) {
    // Hide prompt text for First/Then programs
    const promptElement = document.querySelector('.prompt-text');
    if (promptElement) {
        promptElement.style.display = 'none';
    }
    
    // Create the First/Then display with responsive design
    stimulusDisplay.innerHTML = `
        <div class="first-then-display-container" style="
            display: flex; 
            flex-direction: column;
            align-items: center; 
            justify-content: center;
            padding: 20px;
            gap: 30px;
            height: 100%;
            box-sizing: border-box;
        ">
            <div class="first-then-cards-wrapper" style="
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 40px;
                width: 100%;
                max-width: 800px;
                flex-wrap: wrap;
            ">
                <div class="first-container" style="
                    text-align: center; 
                    padding: 30px; 
                    background: white;
                    border: 4px solid #FF6B6B;
                    border-radius: 20px;
                    color: #FF6B6B;
                    box-shadow: 0 8px 30px rgba(255, 107, 107, 0.15);
                    min-width: 200px;
                    max-width: 280px;
                    flex: 1;
                ">
                    <h2 style="margin: 0 0 20px 0; font-size: clamp(24px, 4vw, 32px); font-weight: 700; color: #FF6B6B;">First</h2>
                    <div style="
                        background: #f8f9fa; 
                        border-radius: 16px; 
                        padding: 20px; 
                        margin-bottom: 15px;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                        border: 2px solid #e9ecef;
                    ">
                        <img src="${config.firstIcon?.src || 'assets/Everyday/book.png'}" 
                             alt="${config.firstIcon?.alt || 'First Activity'}" 
                             style="width: clamp(120px, 20vw, 160px); height: clamp(120px, 20vw, 160px); object-fit: contain;">
                    </div>
                    <p style="margin: 0; font-size: clamp(14px, 3vw, 18px); font-weight: 600; color: #333; word-wrap: break-word;">${config.firstIcon?.alt || 'First Activity'}</p>
                </div>
                
                <div class="arrow-container" style="
                    font-size: clamp(40px, 8vw, 64px); 
                    color: #667eea; 
                    text-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
                    animation: pulse 2s infinite;
                    font-weight: bold;
                    flex-shrink: 0;
                    order: 1;
                ">→</div>
                
                <div class="then-container" style="
                    text-align: center; 
                    padding: 30px; 
                    background: white;
                    border: 4px solid #4ECDC4;
                    border-radius: 20px;
                    color: #4ECDC4;
                    box-shadow: 0 8px 30px rgba(78, 205, 196, 0.15);
                    min-width: 200px;
                    max-width: 280px;
                    flex: 1;
                    order: 2;
                ">
                    <h2 style="margin: 0 0 20px 0; font-size: clamp(24px, 4vw, 32px); font-weight: 700; color: #4ECDC4;">Then</h2>
                    <div style="
                        background: #f8f9fa; 
                        border-radius: 16px; 
                        padding: 20px; 
                        margin-bottom: 15px;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                        border: 2px solid #e9ecef;
                    ">
                        <img src="${config.thenIcon?.src || 'assets/Emotions/happy.png'}" 
                             alt="${config.thenIcon?.alt || 'Then Activity'}" 
                             style="width: clamp(120px, 20vw, 160px); height: clamp(120px, 20vw, 160px); object-fit: contain;">
                    </div>
                    <p style="margin: 0; font-size: clamp(14px, 3vw, 18px); font-weight: 600; color: #333; word-wrap: break-word;">${config.thenIcon?.alt || 'Then Activity'}</p>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.15); opacity: 1; }
            }
            
            /* Mobile responsive styles for First/Then display */
            @media (max-width: 768px) {
                .first-then-cards-wrapper {
                    flex-direction: column !important;
                    gap: 20px !important;
                }
                
                .arrow-container {
                    transform: rotate(90deg) !important;
                    order: 1 !important;
                }
                
                .first-container {
                    order: 0 !important;
                    max-width: 100% !important;
                    min-width: 250px !important;
                }
                
                .then-container {
                    order: 2 !important;
                    max-width: 100% !important;
                    min-width: 250px !important;
                }
            }
            
            @media (max-width: 480px) {
                .first-then-display-container {
                    padding: 15px !important;
                    gap: 20px !important;
                }
                
                .first-container, .then-container {
                    padding: 20px !important;
                    min-width: 200px !important;
                }
            }
        </style>
    `;
}

// Make functions available globally
window.openFirstThenModal = openFirstThenModal;
window.renderFirstThenProgram = renderFirstThenProgram;

// Register this program module
if (window.registerProgramModule) {
    window.registerProgramModule('First/Then', renderFirstThenProgram, null);
} else {
    console.error('Program registration system not available');
}

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
