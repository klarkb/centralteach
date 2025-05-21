// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Program selection
    const programItems = document.querySelectorAll('.program-item');
    const programTabs = document.querySelector('.program-tabs');
    const closeTabButtons = document.querySelectorAll('.close-tab');
    
    // Modal elements
    const modal = document.getElementById('stimulusModal');
    const openModalButtons = document.querySelectorAll('.program-item');
    const closeModalButton = document.querySelector('.close-modal');
    const doneButton = document.querySelector('.done-btn');
    
    // Create a global reference to the New Target Modal
    let activeNewTargetModal = null;
    const iconItems = document.querySelectorAll('.icon-item');
    const selectTargetButton = document.querySelector('.select-target-btn');
    
    // State management
    let activeProgram = null;
    let selectedStimuli = [];
    let targetStimulus = null;
    let fieldSize = 2;
    
    // Store program configurations
    const programConfigs = {};
    
    // Available image assets and categories
    let availableImages = [];
    let categories = {};
    
    // Directly attach click handlers for program items
    programItems.forEach(item => {
        item.addEventListener('click', () => {
            activeProgram = item.querySelector('.program-details h3').textContent;
            if (activeProgram === 'Sight Words') {
                // Open sight words configuration modal using the global function
                console.log('Attempting to open Sight Words modal');
                if (window.openSightWordsModal) {
                    console.log('openSightWordsModal function found, calling it');
                    window.openSightWordsModal();
                } else {
                    console.error('openSightWordsModal function not found!');
                }
            } else {
                openModal(activeProgram);
            }
        });
    });

    // Sight Words functionality is handled in sightwords.js
    // We need to make several functions available globally
    window.activateTab = activateTab;
    window.updateProgramStars = updateProgramStars;
    window.programConfigs = programConfigs;
    window.updateProgramContent = updateProgramContent;
    window.openSightWordsEditModal = openSightWordsEditModal;

    // Function to populate the icon grid with categorized stimuli
    function populateIconGrid(categories) {
        // no-op: grid is now statically inlined in HTML
    }
    
    // Helper function to create icon items
    function createIconItem(src, alt) {
        const iconItem = document.createElement('div');
        iconItem.className = 'icon-item';
        
        // Create the image element
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        
        // Handle image load errors gracefully
        img.onerror = () => {
            console.warn(`Image failed to load: ${src}. Using fallback.`);
            // Try to determine which category this is from to use a specific fallback
            let fallbackSrc = 'assets/Food/apple.png';
            if (src.includes('Animal')) fallbackSrc = 'assets/Animals/cat.png';
            else if (src.includes('Food')) fallbackSrc = 'assets/Food/apple.png';
            else if (src.includes('Cloth')) fallbackSrc = 'assets/Clothing/hat.png';
            
            img.src = fallbackSrc;
            // Keep the original alt text but note it's a fallback
            img.alt = `${alt} (Fallback)`;
        };
        
        iconItem.appendChild(img);
        
        // Add click event for selection when not in target selection mode
        iconItem.addEventListener('click', () => {
            if (!document.body.classList.contains('selecting-target')) {
                iconItem.classList.toggle('selected');
                
                if (iconItem.classList.contains('selected')) {
                    // Get the current src and alt after potential fallback occurred
                    selectedStimuli.push({ src: img.src, alt: img.alt });
                    console.log('Selected stimulus:', img.alt, img.src);
                } else {
                    selectedStimuli = selectedStimuli.filter(stimulus => stimulus.src !== img.src);
                    
                    // If this was the target and it's been deselected, clear target
                    if (targetStimulus && targetStimulus.src === img.src) {
                        targetStimulus = null;
                        iconItem.classList.remove('target');
                    }
                }
            }
        });
        
        return iconItem;
    }
    
    // Initialize original hardcoded icon items before they get replaced
    document.querySelectorAll('.icon-item').forEach(item => {
        const img = item.querySelector('img');
        
        // Set up click handler for selection
        item.addEventListener('click', () => {
            if (!document.body.classList.contains('selecting-target')) {
                item.classList.toggle('selected');
                
                const imgSrc = img.src;
                const imgAlt = img.alt;
                
                if (item.classList.contains('selected')) {
                    selectedStimuli.push({ src: imgSrc, alt: imgAlt });
                    console.log(`Selected: ${imgAlt} (${imgSrc})`);
                } else {
                    selectedStimuli = selectedStimuli.filter(stimulus => stimulus.src !== imgSrc);
                    
                    // If this was the target and it's been deselected, clear target
                    if (targetStimulus && targetStimulus.src === imgSrc) {
                        targetStimulus = null;
                        item.classList.remove('target');
                    }
                }
            }
        });
    });
    
    // Function to update star indicators based on which programs are in the queue
    function updateProgramStars() {
        programItems.forEach(item => {
            const programName = item.querySelector('.program-details h3').textContent;
            // Check if this program type exists in any tab
            const programInQueue = Array.from(document.querySelectorAll('.tab')).some(tab => {
                const tabProgramType = tab.getAttribute('data-program');
                return programName.includes(tabProgramType);
            });
            
            // Update the starred status based on whether it's in the queue
            if (programInQueue) {
                item.classList.add('starred');
            } else {
                item.classList.remove('starred');
            }
        });
    }
    
    // Since we now have the setupProgramItemHandlers() function, 
    // we don't need this section anymore
    
    // Call initially to set up the correct stars
    updateProgramStars();
    
    // Modal functionality
    function openModal(programType) {
        // Update modal title based on program type
        const modalTitle = modal.querySelector('.modal-header h2');
        if (modalTitle && programType) {
            // Remove "Programs" suffix if present
            let displayName = programType;
            if (displayName.endsWith('Programs')) {
                displayName = displayName.replace('Programs', '');
            }
            modalTitle.textContent = displayName;
        }
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
        
        // Initialize search input for this modal instance
        const searchInput = modal.querySelector('.search-icons input');
        if (searchInput) {
            // Clear any previous value
            searchInput.value = '';
            // Add or refresh the event listener
            searchInput.addEventListener('input', (e) => {
                filterIconsBySearch(e.target.value, modal);
            });
            // Set focus on search field for immediate use
            setTimeout(() => searchInput.focus(), 100);
        }
    }
    
    // After DOMContentLoaded, grab the title input
    const programTitleInput = document.getElementById('programTitleInput');
    
    function closeModal() {
        // Close the standard stimulus modal
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Also close the sight words modal if open
        const sightWordsModal = document.getElementById('sightWordsModal');
        if (sightWordsModal) {
            sightWordsModal.style.display = 'none';
        }
        
        // Reset target selection mode if active
        if (document.body.classList.contains('selecting-target')) {
            document.body.classList.remove('selecting-target');
            selectTargetButton.textContent = "Select Target Stimulus";
            selectTargetButton.style.backgroundColor = "#f44336";
        }
        
        // Clear search term
        const searchInput = document.querySelector('.search-icons input');
        if (searchInput) {
            searchInput.value = '';
            filterIconsBySearch(''); // Reset filtering to show all items
        }
        
        // Reset selections
        selectedStimuli = [];
        targetStimulus = null;
        
        // Remove selected and target classes from all items
        document.querySelectorAll('.icon-item.selected, .icon-item.target').forEach(item => {
            item.classList.remove('selected');
            item.classList.remove('target');
        });
        
        // Also clean up any edit modals that might be open
        document.querySelectorAll('[id^="editModal-"]').forEach(el => {
            document.body.removeChild(el);
        });
        
        // Clear title input
        programTitleInput.value = '';
    }
    
    closeModalButton.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // We'll handle icon selection in the populateIconGrid function instead
    // since we're now dynamically creating the icon elements
    
    // Select target stimulus
    selectTargetButton.addEventListener('click', () => {
        // Change button appearance to indicate "selection mode"
        selectTargetButton.textContent = "Click an item to set as target";
        selectTargetButton.style.backgroundColor = "#4CAF50";
        document.body.classList.add('selecting-target');
        
        // Clear any existing target selections
        document.querySelectorAll('.icon-item.target').forEach(item => {
            item.classList.remove('target');
        });
        
        // Create one-time event listener for the document
        const selectTargetHandler = (e) => {
            // Find the clicked icon-item (if any)
            const iconItem = e.target.closest('.icon-item');
            if (!iconItem) return;
            
            // Remove selection mode
            document.body.classList.remove('selecting-target');
            document.removeEventListener('click', selectTargetHandler);
            
            // Reset button appearance
            selectTargetButton.textContent = "Select Target Stimulus";
            selectTargetButton.style.backgroundColor = "#f44336";
            
            // Clear any existing target
            document.querySelectorAll('.icon-item.target').forEach(item => {
                item.classList.remove('target');
            });
            
            // Set new target
            iconItem.classList.add('target');
            targetStimulus = {
                src: iconItem.querySelector('img').src,
                alt: iconItem.querySelector('img').alt
            };
            
            // Also select this item if it wasn't already selected
            if (!iconItem.classList.contains('selected')) {
                iconItem.classList.add('selected');
                selectedStimuli.push({ 
                    src: targetStimulus.src, 
                    alt: targetStimulus.alt 
                });
            }
            
            console.log('Target set:', targetStimulus.alt);
            
            // Prevent event bubbling
            e.stopPropagation();
        };
        
        // Add the one-time document click listener
        document.addEventListener('click', selectTargetHandler);
    });
    
    // Sight Words functionality is now in sightwords.js
    // End of target selection code
    
    // Update field size
    const fieldSizeInput = document.querySelector('.field-size-selector input');
    fieldSizeInput.addEventListener('change', (e) => {
        fieldSize = parseInt(e.target.value);
        if (fieldSize < 1) fieldSize = 1;
        if (fieldSize > 6) fieldSize = 6;
        e.target.value = fieldSize;
    });
    
    // Complete program configuration and add to tabs
    doneButton.addEventListener('click', () => {
        if (selectedStimuli.length === 0) {
            alert('Please select at least one stimulus');
            return;
        }
        
        // Check if target stimulus is selected
        if (!targetStimulus && selectedStimuli.length > 1 && 
            (activeProgram.includes('Receptive ID') || activeProgram.includes('Tacting'))) {
            alert('Please select a target stimulus');
            return;
        }            
        // If no target is selected but only one stimulus, use it as target
        if (!targetStimulus && selectedStimuli.length === 1) {
            targetStimulus = selectedStimuli[0];
        }
        
        console.log('Creating program with stimuli:', selectedStimuli.length, 'target:', targetStimulus?.alt);
        
        // Create a new tab
        let programName = activeProgram;
        if (programName.endsWith('Programs')) {
            programName = programName.replace('Programs', '');
        }
        programName = programName.trim();

        // Determine default tab name
        const tabCount = document.querySelectorAll(`.tab[data-program="${programName}"]`).length + 1;
        const defaultTabName = `${programName} ${tabCount}`;
        // Use title field for custom name
        const newTabName = programTitleInput.value.trim() || defaultTabName;
        // Slugify for ID
        function slugify(text) {
            return text.toLowerCase().trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '');
        }
        const tabId = slugify(newTabName);
        
        const newTab = document.createElement('div');
        newTab.className = 'tab';
        newTab.setAttribute('data-program', programName);
        newTab.setAttribute('id', tabId);
        newTab.innerHTML = `${newTabName}<span class="close-tab">×</span>`;
        
        // Store program configuration
        programConfigs[tabId] = {
            type: programName,
            stimuli: [...selectedStimuli],
            target: targetStimulus,
            fieldSize: fieldSize,
            currentIndex: 0,
            randomized: false
        };
        
        // Debug log to confirm program configuration was stored
        console.log('Stored program configuration:', {
            tabId,
            type: programName,
            stimuliCount: selectedStimuli.length,
            target: targetStimulus ? targetStimulus.alt : 'none'
        });
        
        // Add the tab to the tab bar
        programTabs.appendChild(newTab);
        
        // Activate the new tab
        activateTab(newTab);
        
        // Set up the tab's close button
        const newCloseButton = newTab.querySelector('.close-tab');
        newCloseButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // Clean up program configuration
            delete programConfigs[tabId];
            newTab.remove();
            
            // If this was the active tab, activate the first available tab
            if (newTab.classList.contains('active')) {
                const firstAvailableTab = document.querySelector('.tab');
                if (firstAvailableTab) {
                    activateTab(firstAvailableTab);
                }
            }
            
            // Update program stars since a program was removed from queue
            updateProgramStars();
        });
        
        // Make the tab clickable to activate it
        newTab.addEventListener('click', () => {
            activateTab(newTab);
        });
        
        // Close the modal
        closeModal();
    });
    
    // Tab functionality
    function activateTab(tab) {
        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('active');
        });
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Update the main content area based on the active tab
        updateProgramContent();
    }
    
    // Set up initial tab functionality
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            activateTab(tab);
        });
    });
    
    closeTabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const tab = button.parentElement;
            tab.remove();
            
            // If this was the active tab, activate the first available tab
            if (tab.classList.contains('active')) {
                const firstAvailableTab = document.querySelector('.tab');
                if (firstAvailableTab) {
                    activateTab(firstAvailableTab);
                }
            }
        });
    });
    
    // Cleanup function to remove bottom controls
    function cleanupBottomControls() {
        document.querySelectorAll('.bottom-controls, .program-controls').forEach(el => {
            el.remove();
        });
    }

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
            if (config.type === 'Sight Words') {
                console.log('Opening Sight Words edit modal for tab:', tabId);
                openSightWordsEditModal(tabId);
            } else {
                console.log('Opening standard edit modal for tab:', tabId);
                openEditModal(tabId);
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
        
        // Handle Sight Words navigation
        if (config.type === 'Sight Words') {
            const words = config.words || [];
            
            nextButton.addEventListener('click', () => {
                config.currentIndex = (config.currentIndex + 1) % words.length;
                updateProgramContent();
            });
        } 
        // Handle Tacting/Receptive ID navigation
        else if (config.type === 'Tacting' || config.type === 'Receptive ID') {
            const stimuli = config.stimuli || [];
            
            nextButton.addEventListener('click', () => {
                // For Tacting, we want to randomize the display each time but keep showing the same target
                if (config.type === 'Tacting') {
                    console.log('Next button clicked for Tacting - refreshing display');
                    // We'll always randomize the Tacting display in updateProgramContent now
                    updateProgramContent();
                } else {
                    // For Receptive ID, just cycle through the stimuli as before
                    config.currentIndex = (config.currentIndex + 1) % stimuli.length;
                    updateProgramContent();
                }
            });
        }
        
        // Add buttons to container
        controlsContainer.appendChild(editButton);
        controlsContainer.appendChild(nextButton);
        
        // Add controls to document body instead of the stimulus display
        document.body.appendChild(controlsContainer);
        
        console.log(`Controls rendered for ${config.type} program with tabId: ${tabId}`);
    }
    
    // Update the main content area based on the active tab
    function updateProgramContent() {
        // Clean up any existing controls first
        cleanupBottomControls();
        
        const activeTab = document.querySelector('.tab.active');
        const emptyMessage = document.getElementById('empty-program-message');
        const programDisplay = document.getElementById('program-display');
        
        // If no active tab exists, show the empty message
        if (!activeTab) {
            if (emptyMessage) emptyMessage.style.display = 'block';
            if (programDisplay) programDisplay.style.display = 'none';
            return;
        }
        
        // Hide the empty message and show program content
        if (emptyMessage) emptyMessage.style.display = 'none';
        if (programDisplay) programDisplay.style.display = 'block';
        
        const tabId = activeTab.id;
        let config = programConfigs[tabId];
        
        if (!config) {
            console.log('No configuration found for tab:', tabId);
            
            // For pre-existing tabs that don't have configurations
            const programName = activeTab.getAttribute('data-program') || activeTab.textContent.split('×')[0].trim();
            
            // Show the empty message instead of placeholder content
            if (emptyMessage) emptyMessage.style.display = 'block';
            if (programDisplay) programDisplay.style.display = 'none';
            return;
        }
        
        // Fix stimulus paths before displaying
        if (window.centralDebug && window.centralDebug.fixStimulusPaths) {
            config = window.centralDebug.fixStimulusPaths(config);
        }
        
        // Update based on the program type
        const programType = config.type;
        const stimulusDisplay = document.querySelector('.stimulus-display');
        console.log('updateProgramContent: tab', tabId, 'config', config);
        console.log('Rendering programType:', programType);
        
        if (programType === 'Tacting') {
            // Tacting: show a grid of target + distractors equal to fieldSize
            const stimuli = config.stimuli || [];
            const target = config.target || stimuli[0] || { src: 'assets/Food/apple.png', alt: 'Default' };
            const total = Math.max(1, config.fieldSize);
            
            // Filter out target for distractors
            let distractors = stimuli.filter(s => s.src !== target.src);
            
            // Always shuffle distractors to randomize display
            distractors.sort(() => Math.random() - 0.5);
            
            // Select required number of distractors
            const needed = Math.max(0, total - 1);
            const selectedDistractors = distractors.slice(0, needed);
            
            // Combine and shuffle all items, but always include the target
            let displayStimuli = [...selectedDistractors, target];
            
            // Randomize the position of all stimuli including the target
            displayStimuli.sort(() => Math.random() - 0.5);

            // Hide any prompt text for Tacting
            const promptEl = document.querySelector('.prompt-text');
            if (promptEl) promptEl.style.display = 'none';

            // Render grid
            stimulusDisplay.innerHTML = '';
            const grid = document.createElement('div');
            grid.className = 'receptive-grid';
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = `repeat(${total}, 1fr)`;
            grid.style.gap = '10px';
            grid.style.width = '100%';
            displayStimuli.forEach(item => {
                const img = document.createElement('img');
                img.src = item.src;
                img.alt = item.alt;
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.objectFit = 'contain';
                grid.appendChild(img);
            });
            stimulusDisplay.appendChild(grid);

            // Add static bottom controls
            renderBottomControls(config, tabId);
        } else if (programType === 'Receptive ID') {
            // Receptive ID: show a mix of distractors + target equal to fieldSize
            const stimuli = config.stimuli || [];
            const target = config.target || stimuli[0] || { src: 'assets/Food/apple.png', alt: 'Default' };
            const total = Math.max(1, config.fieldSize);
            // filter out target for distractors
            let distractors = stimuli.filter(s => s.src !== target.src);
            // shuffle if randomized
            if (config.randomized) distractors.sort(() => Math.random() - 0.5);
            // select needed distractors
            const needed = total - 1;
            const selectedDistractors = distractors.slice(0, needed);
            // combine and shuffle for display
            let displayStimuli = [...selectedDistractors, target];
            if (config.randomized) displayStimuli.sort(() => Math.random() - 0.5);

            // clear previous content
            stimulusDisplay.innerHTML = '';
            document.querySelector('.prompt-text').textContent = '';

            // render grid
            const grid = document.createElement('div');
            grid.className = 'receptive-grid';
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = `repeat(${total}, 1fr)`;
            grid.style.gap = '10px';
            grid.style.width = '100%';
            displayStimuli.forEach(item => {
                const img = document.createElement('img');
                img.src = item.src;
                img.alt = item.alt;
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.objectFit = 'contain';
                grid.appendChild(img);
            });
            stimulusDisplay.appendChild(grid);

            // Add static bottom controls
            renderBottomControls(config, tabId);
        } else if (programType === 'First/Then') {
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
            
        } else if (programType === 'Visual Schedule') {
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
        } else if (programType === 'Sight Words') {
            const words = config.words || [];
            if (!words.length) {
                stimulusDisplay.innerHTML = '<div class="error-message">No words to display.</div>';
            } else {
                const idx = config.currentIndex % words.length;
                stimulusDisplay.innerHTML = `<div class="sight-word-display" style="font-size:48px;text-align:center;">${words[idx]}</div>`;
                
                // Add navigation controls using the unified function
                renderBottomControls(config, tabId);
            }
        } else {
            console.warn('Unknown program type:', programType);
            stimulusDisplay.innerHTML = `<div class="error-message">Unknown program type: ${programType}</div>`;
        }
    }
    
    // Function to filter icons by search term
    function filterIconsBySearch(searchTerm, container = document) {
        const searchNormalized = searchTerm.toLowerCase().trim();
        const categories = container.querySelectorAll('.category-container');

        categories.forEach(category => {
            const header = category.previousElementSibling;
            if (!header) return;

            const icons = category.querySelectorAll('.icon-item');
            let hasVisibleIcons = false;

            icons.forEach(icon => {
                const img = icon.querySelector('img');
                const altText = img ? img.alt.toLowerCase() : '';
                const isMatch = altText.includes(searchNormalized);
                
                icon.style.display = isMatch || !searchTerm ? 'flex' : 'none';
                if (isMatch || !searchTerm) {
                    hasVisibleIcons = true;
                }
            });

            // Show/hide category header based on if any icons are visible
            header.style.display = hasVisibleIcons ? 'block' : 'none';
            category.style.display = hasVisibleIcons ? 'grid' : 'none';
        });
    }

    // Add navigation controls for advancing through stimuli
    function addNavControls(container, config, tabId) {
        // Status indicator for image loading
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'status-indicator';
        statusIndicator.style.marginBottom = '15px';
        statusIndicator.style.padding = '5px 10px';
        statusIndicator.style.fontSize = '14px';
        statusIndicator.style.borderRadius = '3px';
        statusIndicator.style.textAlign = 'center';
        
        // Check if current image loads successfully
        if (config.stimuli && config.stimuli.length > 0) {
            const currentIdx = config.currentIndex % config.stimuli.length;
            const stimulus = config.target || config.stimuli[currentIdx];
            
            if (stimulus && stimulus.src) {
                statusIndicator.textContent = `Loading image: ${stimulus.alt}`;
                statusIndicator.style.backgroundColor = '#fff3cd';
                statusIndicator.style.color = '#856404';
                
                const imageCheck = new Image();
                imageCheck.onload = () => {
                    statusIndicator.textContent = `Image loaded successfully: ${stimulus.alt}`;
                    statusIndicator.style.backgroundColor = '#d4edda';
                    statusIndicator.style.color = '#155724';
                    setTimeout(() => {
                        statusIndicator.style.display = 'none';
                    }, 2000);
                };
                
                imageCheck.onerror = () => {
                    statusIndicator.textContent = `Error loading image: ${stimulus.alt}. Using fallback.`;
                    statusIndicator.style.backgroundColor = '#f8d7da';
                    statusIndicator.style.color = '#721c24';
                    
                    // Try to fix the path
                    if (window.centralDebug && window.centralDebug.validateImagePath) {
                        stimulus.src = window.centralDebug.validateImagePath(stimulus.src);
                        updateProgramContent();
                    }
                };
                
                imageCheck.src = stimulus.src;
            }
        }
        
        // Add status indicator to container
        container.appendChild(statusIndicator);
    }
    
    // Add specific controls for Receptive ID programs
    function addReceptiveControls(container, config, tabId) {
        // We'll use the general renderBottomControls function instead
        // which now properly places controls at the bottom right
        renderBottomControls(config, tabId);
    }
    
    // Create modal for selecting a new target stimulus
    function createNewTargetModal(config, tabId) {
        // Use existing modal implementation to allow selection of a new target
        if (activeNewTargetModal) document.body.removeChild(activeNewTargetModal);
        
        // Populate and reuse the existing stimulusModal for new target
        const originalModal = document.getElementById('stimulusModal');
        const galleryModal = originalModal.cloneNode(true);
        galleryModal.id = `newTarget-${tabId}`;
        galleryModal.style.display = 'block';
        document.body.appendChild(galleryModal);
        
        // Override doneBtn behavior to set new target only
        const done = galleryModal.querySelector('.done-btn');
        done.textContent = 'Set Target';
        done.onclick = () => {
            // Get selected stimulus from gallery
            const selected = galleryModal.querySelector('.icon-item.selected');
            if (!selected) return alert('Select a stimulus to set as new target');
            const imgEl = selected.querySelector('img');
            config.target = { src: imgEl.src, alt: imgEl.alt };
            document.body.removeChild(galleryModal);
            activeNewTargetModal = null;
            updateProgramContent();
        };
        
        // Re-init icon selection logic within the cloned modal
        galleryModal.querySelectorAll('.icon-item').forEach(item => {
            item.addEventListener('click', () => {
                galleryModal.querySelectorAll('.icon-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });
        
        // Set up search functionality for the new target modal
        const searchInput = galleryModal.querySelector('.search-icons input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                filterIconsBySearch(e.target.value, galleryModal);
            });
        }
        
        activeNewTargetModal = galleryModal;
    }
    
    // Function to open edit modal for an existing program
    function openEditModal(tabId) {
        console.log('openEditModal called for tabId:', tabId);
        const config = programConfigs[tabId];
        if (!config) {
            console.error('No config found for tabId:', tabId);
            return;
        }
        
        // Create a clone of the original modal
        const originalModal = document.getElementById('stimulusModal');
        if (!originalModal) {
            console.error('Original stimulus modal not found');
            return;
        }
        
        const editModal = originalModal.cloneNode(true);
        editModal.id = 'editModal-' + tabId;
        editModal.setAttribute('data-program-type', config.type); // Add program type as data attribute 
        editModal.style.display = 'block'; // Make sure it's visible
        
        // Update the modal title
        const modalTitle = editModal.querySelector('.modal-header h2');
        modalTitle.textContent = 'Edit ' + config.type;
        
        // Add close button handler
        const closeButton = editModal.querySelector('.close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                document.body.removeChild(editModal);
                document.body.style.overflow = 'auto';
            });
        }
        
        // Set up search functionality for the edit modal
        const searchInput = editModal.querySelector('.search-icons input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                filterIconsBySearch(e.target.value, editModal);
            });
        }
        
        // Set the field size
        const fieldSizeInput = editModal.querySelector('.field-size-selector input');
        fieldSizeInput.value = config.fieldSize;
        
        // Pre-fill title input with current tab name
        const titleInput = editModal.querySelector('#programTitleInput');
        const existingTab = document.getElementById(tabId);
        titleInput.value = existingTab.textContent.replace('×','').trim();
        
        // Function to update the modal with current selections
        function updateSelections() {
            // Clear previous selections
            editModal.querySelectorAll('.icon-item').forEach(item => {
                item.classList.remove('selected', 'target');
            });
            
            // Mark selected stimuli and target
            config.stimuli.forEach(stimulus => {
                editModal.querySelectorAll('.icon-item img').forEach(img => {
                    if (img.src === stimulus.src) {
                        img.parentElement.classList.add('selected');
                        
                        // Mark as target if applicable
                        if (config.target && config.target.src === stimulus.src) {
                            img.parentElement.classList.add('target');
                        }
                    }
                });
            });
        }
        
        // Update initial selections
        document.body.appendChild(editModal);
        updateSelections();
        
        // Handle icon selection
        editModal.querySelectorAll('.icon-item').forEach(item => {
            item.addEventListener('click', () => {
                if (!document.body.classList.contains('selecting-target')) {
                    item.classList.toggle('selected');
                }
            });
        });
        
        // Set up target selection button
        const selectTargetBtn = editModal.querySelector('.select-target-btn');
        selectTargetBtn.addEventListener('click', () => {
            document.body.classList.add('selecting-target');
            selectTargetBtn.textContent = 'Click an item to set as target';
            selectTargetBtn.style.backgroundColor = '#4CAF50';
            
            const targetHandler = (e) => {
                const iconItem = e.target.closest('.icon-item');
                if (!iconItem) return;
                
                // Clear previous targets
                editModal.querySelectorAll('.icon-item.target').forEach(el => {
                    el.classList.remove('target');
                });
                
                // Set new target
                iconItem.classList.add('target');
                iconItem.classList.add('selected'); // Also select it
                
                // Reset button
                selectTargetBtn.textContent = 'Select Target Stimulus';
                selectTargetBtn.style.backgroundColor = '#f44336';
                document.body.classList.remove('selecting-target');
                
                // Cleanup
                document.removeEventListener('click', targetHandler);
            };
            
            // One-time click handler
            setTimeout(() => {
                document.addEventListener('click', targetHandler, {once: true});
            }, 0);
        });
        
        // Done button
        const doneBtn = editModal.querySelector('.done-btn');
        doneBtn.addEventListener('click', () => {
            // Get selected items
            const selectedItems = [];
            let targetItem = null;
            
            editModal.querySelectorAll('.icon-item').forEach(item => {
                if (item.classList.contains('selected')) {
                    const img = item.querySelector('img');
                    const stimulus = {
                        src: img.src,
                        alt: img.alt
                    };
                    selectedItems.push(stimulus);
                    
                    if (item.classList.contains('target')) {
                        targetItem = stimulus;
                    }
                }
            });
            
            // Validate selections
            if (selectedItems.length === 0) {
                alert('Please select at least one stimulus');
                return;
            }
            
            if (!targetItem && selectedItems.length > 1 && 
                (config.type === 'Receptive ID' || config.type === 'Tacting')) {
                alert('Please select a target stimulus');
                return;
            }
            
            // If only one item is selected, use it as target
            if (!targetItem && selectedItems.length === 1) {
                targetItem = selectedItems[0];
            }
            
            // Update configuration
            config.stimuli = selectedItems;
            config.target = targetItem;
            config.fieldSize = parseInt(fieldSizeInput.value) || 2;
            
            // Close modal and refresh view
            document.body.removeChild(editModal);
            updateProgramContent();
            
            // Update tab name based on modal input
            const newName = titleInput.value.trim();
            if (newName) {
                const tabEl = document.getElementById(tabId);
                tabEl.innerHTML = `${newName}<span class="close-tab">×</span>`;
                // Reattach close handler
                const closeBtn = tabEl.querySelector('.close-tab');
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    delete programConfigs[tabId];
                    tabEl.remove();
                    if (tabEl.classList.contains('active')) {
                        const firstAvailableTab = document.querySelector('.tab');
                        if (firstAvailableTab) {
                            activateTab(firstAvailableTab);
                        }
                    }
                });
            }
        });
    }
    
    // Function to open edit modal for Sight Words programs
    function openSightWordsEditModal(tabId) {
        const config = programConfigs[tabId];
        if (!config) return;
        if (config.type !== 'Sight Words') return;

        // Create a modal for editing the sight words
        const editModal = document.createElement('div');
        editModal.className = 'modal';
        editModal.id = 'editModal-' + tabId;
        editModal.setAttribute('data-program-type', 'Sight Words'); // Add program type as data attribute
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
        
        // Create word management container (similar to the original modal)
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
        controlsContainer.style.justifyContent = 'flex-end'; // Right-align
        controlsContainer.style.marginTop = '20px';
        
        const saveButton = document.createElement('button');
        saveButton.className = 'done-btn';
        saveButton.textContent = 'Save Changes';
        saveButton.style.backgroundColor = '#4CAF50'; // Green color for consistency
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
                wordBubbleContainer.className = 'word-bubble-container';
                
                const wordBubble = document.createElement('div');
                wordBubble.className = 'saved-word-bubble';
                wordBubble.textContent = word;
                wordBubble.addEventListener('click', () => {
                    // Add word to selection
                    if (!editSelectedSightWords.includes(word)) {
                        editSelectedSightWords.push(word);
                        updateEditSelectedWordsList();
                    }
                });
                
                const removeButton = document.createElement('button');
                removeButton.className = 'remove-bank-word-btn';
                removeButton.innerHTML = '&#215;'; // × symbol
                removeButton.title = 'Remove from word bank';
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering the word selection
                    // Remove from history
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
                
                const wordText = document.createElement('span');
                wordText.className = 'selected-word-text';
                wordText.textContent = word;
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-word-btn';
                removeBtn.textContent = '×';
                removeBtn.addEventListener('click', () => {
                    editSelectedSightWords.splice(idx, 1);
                    updateEditSelectedWordsList();
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
        
        // Save changes
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
                    delete programConfigs[newId];
                    tab.remove();
                    updateProgramStars();
                });
                
                // Update program configs
                programConfigs[newId] = config;
                delete programConfigs[tabId];
                
                // Update tabId for content update
                tabId = newId;
            }
            
            // Close modal
            document.body.removeChild(editModal);
            document.body.style.overflow = 'auto';
            
            // Update display
            updateProgramContent();
        });
    }
    
    // Function to open edit modal for Sight Words programs
    function openSightWordsEditModal(tabId) {
        const config = programConfigs[tabId];
        if (!config) return;
        if (config.type !== 'Sight Words') return;

        // Create a modal for editing the sight words
        const editModal = document.createElement('div');
        editModal.className = 'modal';
        editModal.id = 'editModal-' + tabId;
        editModal.setAttribute('data-program-type', 'Sight Words'); // Add program type as data attribute
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
        
        // Create word management container (similar to the original modal)
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
        controlsContainer.style.justifyContent = 'flex-end'; // Right-align
        controlsContainer.style.marginTop = '20px';
        
        const saveButton = document.createElement('button');
        saveButton.className = 'done-btn';
        saveButton.textContent = 'Save Changes';
        saveButton.style.backgroundColor = '#4CAF50'; // Green color for consistency
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
                wordBubbleContainer.className = 'word-bubble-container';
                
                const wordBubble = document.createElement('div');
                wordBubble.className = 'saved-word-bubble';
                wordBubble.textContent = word;
                wordBubble.addEventListener('click', () => {
                    // Add word to selection
                    if (!editSelectedSightWords.includes(word)) {
                        editSelectedSightWords.push(word);
                        updateEditSelectedWordsList();
                    }
                });
                
                const removeButton = document.createElement('button');
                removeButton.className = 'remove-bank-word-btn';
                removeButton.innerHTML = '&#215;'; // × symbol
                removeButton.title = 'Remove from word bank';
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering the word selection
                    // Remove from history
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
                
                const wordText = document.createElement('span');
                wordText.className = 'selected-word-text';
                wordText.textContent = word;
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-word-btn';
                removeBtn.textContent = '×';
                removeBtn.addEventListener('click', () => {
                    editSelectedSightWords.splice(idx, 1);
                    updateEditSelectedWordsList();
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
        
        // Save changes
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
                    delete programConfigs[newId];
                    tab.remove();
                    updateProgramStars();
                });
                
                // Update program configs
                programConfigs[newId] = config;
                delete programConfigs[tabId];
                
                // Update tabId for content update
                tabId = newId;
            }
            
            // Close modal
            document.body.removeChild(editModal);
            document.body.style.overflow = 'auto';
            
            // Update display
            updateProgramContent();
        });
    }
    
    // Function to open the Sight Words configuration modal
    window.openSightWordsModal = function() {
        const sightWordsModal = document.getElementById('sightWordsModal');
        if (!sightWordsModal) return;
        
        // Reset modal content
        sightWordsModal.querySelector('.modal-body').innerHTML = '';
        
        // Get the current program config
        const config = programConfigs[Object.keys(programConfigs).find(key => key.includes('sight-words'))];
        if (!config) return;
        
        // Clone the word bank and selected words for editing
        const wordBankClone = JSON.parse(JSON.stringify(config.words));
        const selectedWordsClone = JSON.parse(JSON.stringify(config.words.filter(w => w.selected)));
        
        // Function to render the sight words editor
        function renderSightWordsEditor() {
            const modalBody = sightWordsModal.querySelector('.modal-body');
            modalBody.innerHTML = '';
            
            // Title input
            const titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.className = 'program-title-input';
            titleInput.placeholder = 'Enter program title';
            titleInput.value = config.title || '';
            modalBody.appendChild(titleInput);
            
            // Word bank section
            const wordBankSection = document.createElement('div');
            wordBankSection.className = 'word-bank-section';
            wordBankSection.innerHTML = '<h3>Word Bank</h3>';
            
            const wordBankList = document.createElement('div');
            wordBankList.className = 'word-bank-list';
            wordBankSection.appendChild(wordBankList);
            
            // Render each word in the bank
            wordBankClone.forEach((word, index) => {
                const wordItem = document.createElement('div');
                wordItem.className = 'word-item';
                wordItem.textContent = word.alt || word.src;
                wordItem.draggable = true;
                wordItem.dataset.index = index;
                
                // Drag and drop functionality
                wordItem.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', index);
                    setTimeout(() => {
                        wordItem.classList.add('dragging');
                    }, 0);
                });
                
                wordItem.addEventListener('dragend', () => {
                    wordItem.classList.remove('dragging');
                });
                
                wordBankList.appendChild(wordItem);
            });
            
            modalBody.appendChild(wordBankSection);
            
            // Selected words section
            const selectedWordsSection = document.createElement('div');
            selectedWordsSection.className = 'selected-words-section';
            selectedWordsSection.innerHTML = '<h3>Selected Words</h3>';
            
            const selectedWordsList = document.createElement('div');
            selectedWordsList.className = 'selected-words-list';
            selectedWordsSection.appendChild(selectedWordsList);
            
            // Render selected words
            selectedWordsClone.forEach((word, index) => {
                const wordItem = document.createElement('div');
                wordItem.className = 'word-item selected';
                wordItem.textContent = word.alt || word.src;
                wordItem.dataset.index = index;
                
                // Allow removal of selected words
                wordItem.addEventListener('click', () => {
                    wordItem.remove();
                    // Also remove from the original array
                    const wordIndex = wordBankClone.findIndex(w => w.src === word.src);
                    if (wordIndex !== -1) {
                        wordBankClone[wordIndex].selected = false;
                    }
                });
                
                selectedWordsList.appendChild(wordItem);
            });
            
            modalBody.appendChild(selectedWordsSection);
        }
        
        renderSightWordsEditor();
        
        // Open the modal
        sightWordsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Close modal handler
        sightWordsModal.querySelector('.close-modal').addEventListener('click', () => {
            sightWordsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
});
