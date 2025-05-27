// Sight Words implementation
console.log('sightwords.js starting execution');

// Define modal elements at global scope
let sightWordsModal;
let closeSightWordsModal;
let newWordInput;
let savedWordBankEl;
let selectedWordListEl;
let sightWordsTitleInput;
let doneSightWordsBtn;

// Track word state
let sightWordsHistory = []; // Words the user has used before
let selectedSightWords = []; // Words currently selected for this program

// Define the openSightWordsModal function at global scope
function openSightWordsModal() {
    console.log('openSightWordsModal function called');
    
    // Check if we have references to all required elements
    if (!sightWordsModal) {
        console.error('sightWordsModal element not found!');
        sightWordsModal = document.getElementById('sightWordsModal');
        if (!sightWordsModal) {
            console.error('Still could not find sightWordsModal element!');
            return;
        }
    }
    if (!newWordInput) {
        console.error('newWordInput element not found!');
        newWordInput = document.getElementById('newWordInput');
        if (!newWordInput) {
            console.error('Still could not find newWordInput element!');
            return;
        }
    }
    
    // Load word history
    const storedHistory = localStorage.getItem('sightWordsHistory');
    sightWordsHistory = storedHistory ? JSON.parse(storedHistory) : [];
    console.log('Loaded sightWordsHistory:', sightWordsHistory);
    
    // Reset selected words for new program
    selectedSightWords = [];
    
    // Update displays
    updateSavedWordBank();
    updateSelectedWordsList();
    
    // Clear title input
    if (sightWordsTitleInput) {
        sightWordsTitleInput.value = '';
    }
    
    // Show modal
    console.log('Setting modal display to block');
    sightWordsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focus on input
    if (newWordInput) {
        setTimeout(() => newWordInput.focus(), 300);
    }
}

// Make the function available globally immediately
window.openSightWordsModal = openSightWordsModal;
console.log('window.openSightWordsModal set globally:', typeof window.openSightWordsModal);

// Initialize other functions in global scope
function addWordToSelection(word) {
    // Don't add duplicates
    if (selectedSightWords.includes(word)) return;
    
    // Add to selected list
    selectedSightWords.push(word);
    
    // Save to history (if not already there)
    if (!sightWordsHistory.includes(word)) {
        sightWordsHistory.push(word);
        localStorage.setItem('sightWordsHistory', JSON.stringify(sightWordsHistory));
    }
    
    // Always update both displays to reflect the new selection
    updateSavedWordBank();
    updateSelectedWordsList();
}

function updateSavedWordBank() {
    if (!savedWordBankEl) return;
    savedWordBankEl.innerHTML = '';
    sightWordsHistory.forEach(word => {
        const wordBubbleContainer = document.createElement('div');
        wordBubbleContainer.className = 'word-bank-item';
        wordBubbleContainer.title = word; // Add tooltip for longer words
        
        const wordBubble = document.createElement('div');
        wordBubble.className = 'saved-word-bubble';
        wordBubble.textContent = word;
        // Visual indicator if word is already selected
        if (selectedSightWords.includes(word)) {
            wordBubble.classList.add('already-selected');
        }
        wordBubble.addEventListener('click', () => {
            // If word is already selected, deselect it
            if (selectedSightWords.includes(word)) {
                const selectedIndex = selectedSightWords.indexOf(word);
                if (selectedIndex !== -1) {
                    selectedSightWords.splice(selectedIndex, 1);
                    updateSelectedWordsList();
                    updateSavedWordBank(); // Update visual state
                }
            } else {
                // Otherwise, add it to selection
                addWordToSelection(word);
            }
        });
        
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-bank-word-btn';
        removeButton.innerHTML = '&#215;'; // × symbol
        removeButton.title = 'Remove from word bank';
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the word selection
            removeWordFromHistory(word);
        });
        
        wordBubbleContainer.appendChild(wordBubble);
        wordBubbleContainer.appendChild(removeButton);
        savedWordBankEl.appendChild(wordBubbleContainer);
    });
}

function removeWordFromHistory(word) {
    // Remove the word from history
    const index = sightWordsHistory.indexOf(word);
    if (index !== -1) {
        sightWordsHistory.splice(index, 1);
        localStorage.setItem('sightWordsHistory', JSON.stringify(sightWordsHistory));
        
        // Also remove from selected words if present
        const selectedIndex = selectedSightWords.indexOf(word);
        if (selectedIndex !== -1) {
            selectedSightWords.splice(selectedIndex, 1);
            updateSelectedWordsList();
        }
        
        updateSavedWordBank();
    }
}

function updateSelectedWordsList() {
    if (!selectedWordListEl) return;
    selectedWordListEl.innerHTML = '';
    selectedSightWords.forEach((word, idx) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'selected-word-item';
        wordItem.title = word; // Add tooltip for longer words
        
        const wordText = document.createElement('span');
        wordText.className = 'selected-word-text';
        wordText.textContent = word;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-selected-word-btn';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remove word';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            selectedSightWords.splice(idx, 1);
            updateSelectedWordsList();
            // Also update the word bank to reflect changes in selection state
            updateSavedWordBank();
        });
        
        wordItem.appendChild(wordText);
        wordItem.appendChild(removeBtn);
        selectedWordListEl.appendChild(wordItem);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Make sure DOM is fully loaded
    console.log('DOM fully loaded, initializing Sight Words functionality');
    
    // Set up click handler for the Sight Words program item in the sidebar
    const sightWordsProgramItem = Array.from(document.querySelectorAll('.program-item'))
        .find(item => item.querySelector('.program-details h3')?.textContent === 'Sight Words');
    
    if (sightWordsProgramItem) {
        // Remove any existing click listeners
        const newSightWordsItem = sightWordsProgramItem.cloneNode(true);
        sightWordsProgramItem.parentNode.replaceChild(newSightWordsItem, sightWordsProgramItem);
        
        // Add click listener that calls our openSightWordsModal function
        newSightWordsItem.addEventListener('click', () => {
            openSightWordsModal();
        });
    }
    
    // Get references to Sight Words modal elements
    sightWordsModal = document.getElementById('sightWordsModal');
    console.log('sightWordsModal element:', sightWordsModal ? 'found' : 'not found');
    
    closeSightWordsModal = document.getElementById('closeSightWordsModal');
    newWordInput = document.getElementById('newWordInput');
    console.log('newWordInput element:', newWordInput ? 'found' : 'not found');
    savedWordBankEl = document.getElementById('savedWordBank');
    selectedWordListEl = document.getElementById('selectedWordList');
    sightWordsTitleInput = document.getElementById('sightWordsTitleInput');
    doneSightWordsBtn = document.getElementById('doneSightWordsBtn');

    // Close the modal without creating a program
    if (closeSightWordsModal) {
        closeSightWordsModal.addEventListener('click', () => {
            sightWordsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Handle Enter key in the input field
    if (newWordInput) {
        newWordInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const word = newWordInput.value.trim();
                if (word) {
                    addWordToSelection(word);
                    newWordInput.value = '';
                }
            }
        });
    }

    // Create a program from the selected words
    if (doneSightWordsBtn) {
        doneSightWordsBtn.addEventListener('click', () => {
            if (!selectedSightWords.length) {
                alert('Please add at least one word');
                return;
            }
            
            const programName = 'Sight Words';
            const programTabs = document.querySelector('.program-tabs');
            const count = document.querySelectorAll(`.tab[data-program="${programName}"]`).length + 1;
            const defaultName = `${programName} ${count}`;
            const title = sightWordsTitleInput.value.trim() || defaultName;
            const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
            
            const newTab = document.createElement('div');
            newTab.className = 'tab';
            newTab.setAttribute('data-program', programName);
            newTab.id = id;
            newTab.innerHTML = `${title}<span class="close-tab">×</span>`;
            
            // Store configuration in global programConfigs object
            window.programConfigs = window.programConfigs || {};
            window.programConfigs[id] = {
                type: programName,
                words: [...selectedSightWords],
                currentIndex: 0
            };
            
            // Add tab to tab bar
            programTabs.appendChild(newTab);
            
            // Set up click handler
            newTab.addEventListener('click', function() {
                // Call the activateTab function from the main script
                if (window.activateTab) {
                    window.activateTab(newTab);
                }
            });
            
            // Set up close button
            const closeBtn = newTab.querySelector('.close-tab');
            closeBtn.addEventListener('click', e => {
                e.stopPropagation();
                if (window.programConfigs) {
                    delete window.programConfigs[id];
                }
                
                // Check if this was the active tab before removing
                const wasActive = newTab.classList.contains('active');
                newTab.remove();
                
                // If this was the active tab, activate the first available tab
                if (wasActive) {
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
            
            // Close modal
            sightWordsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Reset selected words for next use
            selectedSightWords = [];
            updateSelectedWordsList();
            
            // Reset title input
            sightWordsTitleInput.value = '';
        });
    }
});

// Log when script is loaded
console.log('sightwords.js fully loaded');

// Function to open edit modal for Sight Words programs
function openSightWordsEditModal(tabId) {
    const config = window.programConfigs[tabId];
    if (!config) return;
    if (config.type !== 'Sight Words') return;

    // Create modal
    const editModal = document.createElement('div');
    editModal.className = 'modal';
    editModal.id = 'editModal-' + tabId;
    editModal.setAttribute('data-program-type', 'Sight Words');
    editModal.style.display = 'block';
    editModal.style.zIndex = '100';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.innerHTML = '<h2>Edit Sight Words</h2>';
    
    // Add close button
    const closeButton = document.createElement('span');
    closeButton.className = 'close-modal';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(editModal);
        document.body.style.overflow = 'auto';
    });
    
    modalHeader.appendChild(closeButton);
    
    // Create modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';

    // Add title input
    const titleContainer = document.createElement('div');
    titleContainer.className = 'title-input-container';
    titleContainer.style.marginBottom = '20px';
    
    const titleLabel = document.createElement('label');
    titleLabel.htmlFor = 'editSightWordsTitleInput';
    titleLabel.textContent = 'Title: ';
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = 'editSightWordsTitleInput';
    titleInput.className = 'program-title-input';
    titleInput.value = document.getElementById(tabId).textContent.replace('×', '').trim();
    
    titleContainer.appendChild(titleLabel);
    titleContainer.appendChild(titleInput);

    // Create word management layout
    const wordManagementContainer = document.createElement('div');
    wordManagementContainer.className = 'sight-words-layout';
    
    // Word bank panel (left side)
    const wordBankPanel = document.createElement('div');
    wordBankPanel.className = 'word-bank-panel';
    wordBankPanel.innerHTML = '<h3>Word Bank</h3>';
    
    const savedWordsContainer = document.createElement('div');
    savedWordsContainer.className = 'saved-words-container';
    
    const savedWordBank = document.createElement('div');
    savedWordBank.className = 'saved-words';
    savedWordBank.id = 'editSavedWordBank';
    
    savedWordsContainer.appendChild(savedWordBank);
    wordBankPanel.appendChild(savedWordsContainer);

    // Word input panel (right side)
    const wordInputPanel = document.createElement('div');
    wordInputPanel.className = 'word-input-panel';
    
    // Input section
    const wordInputSection = document.createElement('div');
    wordInputSection.className = 'word-input-section';
    
    const inputLabel = document.createElement('label');
    inputLabel.htmlFor = 'editNewWordInput';
    inputLabel.textContent = 'Add a Sight Word:';
    
    const inputContainer = document.createElement('div');
    inputContainer.className = 'word-input-container';
    
    const wordInput = document.createElement('input');
    wordInput.type = 'text';
    wordInput.id = 'editNewWordInput';
    wordInput.placeholder = 'Type word and press Enter...';
    
    inputContainer.appendChild(wordInput);
    wordInputSection.appendChild(inputLabel);
    wordInputSection.appendChild(inputContainer);

    // Selected words section
    const selectedWordsSection = document.createElement('div');
    selectedWordsSection.className = 'selected-words-section';
    selectedWordsSection.innerHTML = '<h3>Selected Words</h3>';
    
    const selectedWordsContainer = document.createElement('div');
    selectedWordsContainer.className = 'selected-words-container';
    
    const selectedWordList = document.createElement('div');
    selectedWordList.className = 'selected-words';
    selectedWordList.id = 'editSelectedWordList';
    
    selectedWordsContainer.appendChild(selectedWordList);
    selectedWordsSection.appendChild(selectedWordsContainer);
    
    wordInputPanel.appendChild(wordInputSection);
    wordInputPanel.appendChild(selectedWordsSection);
    
    // Combine panels
    wordManagementContainer.appendChild(wordBankPanel);
    wordManagementContainer.appendChild(wordInputPanel);
    
    // Add controls
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'stimulus-controls';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'flex-end';
    controlsContainer.style.marginTop = '20px';
    
    const saveButton = document.createElement('button');
    saveButton.className = 'done-btn';
    saveButton.textContent = 'Save Changes';
    saveButton.style.backgroundColor = '#4CAF50';
    saveButton.style.color = 'white';
    saveButton.style.padding = '10px 20px';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    
    controlsContainer.appendChild(saveButton);
    
    // Assemble modal
    modalBody.appendChild(titleContainer);
    modalBody.appendChild(wordManagementContainer);
    modalBody.appendChild(controlsContainer);
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    
    editModal.appendChild(modalContent);
    document.body.appendChild(editModal);
    document.body.style.overflow = 'hidden';

    // Current words in the program
    const currentWords = [...(config.words || [])];
    
    // Clone the sight words history
    let editSightWordsHistory = [];
    const storedHistory = localStorage.getItem('sightWordsHistory');
    if (storedHistory) {
        editSightWordsHistory = JSON.parse(storedHistory);
    }
    
    // In-memory selected words for this edit session
    let editSelectedSightWords = [...currentWords];
    
    // Function to update the word bank display
    function updateEditSavedWordBank() {
        const editSavedWordBankEl = document.getElementById('editSavedWordBank');
        if (!editSavedWordBankEl) return;
        
        editSavedWordBankEl.innerHTML = '';
        editSightWordsHistory.forEach(word => {
            const wordBubbleContainer = document.createElement('div');
            wordBubbleContainer.className = 'word-bank-item';
            wordBubbleContainer.title = word; // Add tooltip for longer words
            
            const wordBubble = document.createElement('div');
            wordBubble.className = 'saved-word-bubble';
            wordBubble.textContent = word;
            // Visual indicator if word is already selected
            if (editSelectedSightWords.includes(word)) {
                wordBubble.classList.add('already-selected');
            }
            wordBubble.addEventListener('click', () => {
                // If word is already selected, deselect it
                if (editSelectedSightWords.includes(word)) {
                    const selectedIndex = editSelectedSightWords.indexOf(word);
                    if (selectedIndex !== -1) {
                        editSelectedSightWords.splice(selectedIndex, 1);
                        updateEditSelectedWordsList();
                        updateEditSavedWordBank(); // Update visual state
                    }
                } else {
                    // Otherwise, add it to selection
                    editSelectedSightWords.push(word);
                    updateEditSelectedWordsList();
                    updateEditSavedWordBank(); // Update visual state
                }
            });
            
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-bank-word-btn';
            removeButton.innerHTML = '&#215;';
            removeButton.title = 'Remove from word bank';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = editSightWordsHistory.indexOf(word);
                if (index !== -1) {
                    editSightWordsHistory.splice(index, 1);
                    localStorage.setItem('sightWordsHistory', JSON.stringify(editSightWordsHistory));
                    updateEditSavedWordBank();
                }
            });
            
            wordBubbleContainer.appendChild(wordBubble);
            wordBubbleContainer.appendChild(removeButton);
            editSavedWordBankEl.appendChild(wordBubbleContainer);
        });
    }
    
    // Function to update the selected words display
    function updateEditSelectedWordsList() {
        const editSelectedWordListEl = document.getElementById('editSelectedWordList');
        if (!editSelectedWordListEl) return;
        
        editSelectedWordListEl.innerHTML = '';
        editSelectedSightWords.forEach((word, idx) => {
            const wordItem = document.createElement('div');
            wordItem.className = 'selected-word-item';
            wordItem.title = word; // Add tooltip for longer words
            
            const wordText = document.createElement('span');
            wordText.className = 'selected-word-text';
            wordText.textContent = word;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-selected-word-btn';
            removeBtn.textContent = '×';
            removeBtn.title = 'Remove word';
            removeBtn.addEventListener('click', () => {
                editSelectedSightWords.splice(idx, 1);
                updateEditSelectedWordsList();
                // Also update the word bank to reflect changes in selection state
                updateEditSavedWordBank();
            });
            
            wordItem.appendChild(wordText);
            wordItem.appendChild(removeBtn);
            editSelectedWordListEl.appendChild(wordItem);
        });
    }
    
    // Initialize displays
    updateEditSavedWordBank();
    updateEditSelectedWordsList();
    
    // Set up Enter key for new word input
    wordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const word = wordInput.value.trim();
            if (word) {
                // Add to selected words
                if (!editSelectedSightWords.includes(word)) {
                    editSelectedSightWords.push(word);
                }
                
                // Add to history if not already there
                if (!editSightWordsHistory.includes(word)) {
                    editSightWordsHistory.push(word);
                    localStorage.setItem('sightWordsHistory', JSON.stringify(editSightWordsHistory));
                    updateEditSavedWordBank();
                }
                
                updateEditSelectedWordsList();
                wordInput.value = '';
            }
        }
    });
    
    // Save changes handler
    saveButton.addEventListener('click', () => {
        if (editSelectedSightWords.length === 0) {
            alert('Please add at least one word');
            return;
        }
        
        // Update program config
        config.words = [...editSelectedSightWords];
        
        // Reset index if it's out of bounds
        if (config.currentIndex >= config.words.length) {
            config.currentIndex = 0;
        }
        
        // Update tab title if changed
        const newTitle = titleInput.value.trim();
        if (newTitle && newTitle !== document.getElementById(tabId).textContent.replace('×', '').trim()) {
            // Create a new ID based on the new title
            const newId = newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
            
            // Update tab ID and text
            const tab = document.getElementById(tabId);
            tab.id = newId;
            tab.innerHTML = `${newTitle}<span class="close-tab">×</span>`;
            
            // Reattach close handler
            const closeBtn = tab.querySelector('.close-tab');
            closeBtn.addEventListener('click', e => {
                e.stopPropagation();
                delete window.programConfigs[newId];
                
                // Check if this was the active tab before removing
                const wasActive = tab.classList.contains('active');
                tab.remove();
                
                // If this was the active tab, activate the first available tab
                if (wasActive) {
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
            
            // Update program configs
            window.programConfigs[newId] = config;
            delete window.programConfigs[tabId];
            
            // Update tabId for content update
            tabId = newId;
        }
        
        // Close modal
        document.body.removeChild(editModal);
        document.body.style.overflow = 'auto';
        
        // Update display
        if (window.updateProgramContent) {
            window.updateProgramContent();
        }
    });
}

// Function to render the Sight Words program content
function renderSightWordsProgram(config, container) {
    console.log('Rendering Sight Words program', config);
    
    if (!config || !config.words || config.words.length === 0) {
        container.innerHTML = '<div class="empty-program-message">No words have been added to this program.</div>';
        return;
    }
    
    // Clear the container
    container.innerHTML = '';
    
    // Get the current word based on the current index
    const currentIndex = config.currentIndex || 0;
    const currentWord = config.words[currentIndex];
    
    // Create a main wrapper that will contain both the word and indicator
    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'sight-word-main-wrapper';
    mainWrapper.style.display = 'flex';
    mainWrapper.style.flexDirection = 'column';
    mainWrapper.style.justifyContent = 'center';
    mainWrapper.style.alignItems = 'center';
    mainWrapper.style.height = '100%';
    mainWrapper.style.width = '100%';
    mainWrapper.style.padding = '40px 0';
    
    // Create a display for the current word
    const wordDisplay = document.createElement('div');
    wordDisplay.className = 'sight-word-display';
    wordDisplay.style.display = 'flex';
    wordDisplay.style.justifyContent = 'center';
    wordDisplay.style.alignItems = 'center';
    wordDisplay.style.marginBottom = '30px'; // Space between word and indicator
    
    // Create the word element
    const wordElement = document.createElement('div');
    wordElement.className = 'sight-word';
    wordElement.textContent = currentWord;
    wordElement.style.fontSize = '5rem';
    wordElement.style.fontWeight = 'bold';
    wordElement.style.color = '#333';
    wordElement.style.textAlign = 'center';
    wordElement.style.padding = '20px';
    wordElement.style.backgroundColor = '#f8f8f8';
    wordElement.style.borderRadius = '10px';
    wordElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    wordElement.style.minWidth = '200px';
    
    wordDisplay.appendChild(wordElement);
    
    // Add indicator for word position
    const indicator = document.createElement('div');
    indicator.className = 'word-indicator';
    indicator.style.display = 'flex';
    indicator.style.justifyContent = 'center';
    indicator.style.alignItems = 'center';
    
    for (let i = 0; i < config.words.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'indicator-dot';
        dot.style.width = '10px';
        dot.style.height = '10px';
        dot.style.borderRadius = '50%';
        dot.style.backgroundColor = i === currentIndex ? '#4CAF50' : '#ddd';
        dot.style.margin = '0 5px';
        
        indicator.appendChild(dot);
    }
    
    // Add both word display and indicator to the main wrapper
    mainWrapper.appendChild(wordDisplay);
    mainWrapper.appendChild(indicator);
    
    // Add the main wrapper to the container
    container.appendChild(mainWrapper);
}

// Make function available globally
window.renderSightWordsProgram = renderSightWordsProgram;
window.openSightWordsEditModal = openSightWordsEditModal;

// Register this program module
if (window.registerProgramModule) {
    window.registerProgramModule('Sight Words', renderSightWordsProgram, null);
} else {
    console.error('Program registration system not available');
}
