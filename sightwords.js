// Sight Words implementation - to be included after script.js
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
        updateSavedWordBank();
    }
    
    updateSelectedWordsList();
}

function updateSavedWordBank() {
    if (!savedWordBankEl) return;
    savedWordBankEl.innerHTML = '';
    sightWordsHistory.forEach(word => {
        const wordBubbleContainer = document.createElement('div');
        wordBubbleContainer.className = 'word-bubble-container';
        
        const wordBubble = document.createElement('div');
        wordBubble.className = 'saved-word-bubble';
        wordBubble.textContent = word;
        wordBubble.addEventListener('click', () => {
            addWordToSelection(word);
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
        updateSavedWordBank();
    }
}

function updateSelectedWordsList() {
    if (!selectedWordListEl) return;
    selectedWordListEl.innerHTML = '';
    selectedSightWords.forEach((word, idx) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'selected-word-item';
        
        const wordText = document.createElement('span');
        wordText.className = 'selected-word-text';
        wordText.textContent = word;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-word-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
            selectedSightWords.splice(idx, 1);
            updateSelectedWordsList();
        });
        
        wordItem.appendChild(wordText);
        wordItem.appendChild(removeBtn);
        selectedWordListEl.appendChild(wordItem);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Make sure DOM is fully loaded
    console.log('DOM fully loaded, initializing Sight Words functionality');
    
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
                newTab.remove();
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
