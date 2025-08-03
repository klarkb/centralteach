// Math Program
// Practice basic addition and subtraction problems

(function() {
    let showingAnswer = false;

    // Generate math problems based on configuration
    function generateMathProblems(config) {
        const problems = [];
        const { minNumber, maxNumber, problemCount, includeAddition, includeSubtraction } = config;
        
        const operations = [];
        if (includeAddition) operations.push('+');
        if (includeSubtraction) operations.push('-');
        
        if (operations.length === 0) {
            operations.push('+'); // Default to addition if nothing selected
        }

        for (let i = 0; i < problemCount; i++) {
            const operation = operations[Math.floor(Math.random() * operations.length)];
            let num1, num2, answer;
            
            if (operation === '+') {
                num1 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
                num2 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
                answer = num1 + num2;
            } else { // subtraction
                // Ensure we don't get negative results
                num1 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
                num2 = Math.floor(Math.random() * (num1 - minNumber + 1)) + minNumber;
                answer = num1 - num2;
            }
            
            problems.push({
                problem: `${num1} ${operation} ${num2}`,
                answer: answer
            });
        }
        
        return problems;
    }

    // Update problems preview
    function updateProblemsPreview() {
        const minNumber = parseInt(document.getElementById('minNumber').value) || 1;
        const maxNumber = parseInt(document.getElementById('maxNumber').value) || 10;
        const problemCount = Math.min(parseInt(document.getElementById('problemCount').value) || 10, 10); // Limit preview to 10
        const includeAddition = document.getElementById('additionCheck').checked;
        const includeSubtraction = document.getElementById('subtractionCheck').checked;

        if (maxNumber < minNumber) {
            document.getElementById('problemsPreview').innerHTML = '<p style="color: red;">Maximum number must be greater than or equal to minimum number.</p>';
            return;
        }

        const config = { minNumber, maxNumber, problemCount, includeAddition, includeSubtraction };
        const problems = generateMathProblems(config);
        
        const previewHTML = problems.slice(0, 10).map(p => 
            `<div class="problem-preview">${p.problem} = ${p.answer}</div>`
        ).join('');
        
        document.getElementById('problemsPreview').innerHTML = previewHTML;
    }

    // Render math problem
    function renderMathProblem(config, container) {
        console.log('Rendering Math program', config);
        
        if (!config || !config.problems || config.problems.length === 0) {
            container.innerHTML = '<div class="empty-program-message">No math problems have been added to this program.</div>';
            return;
        }

        // Clear the container
        container.innerHTML = '';

        const currentIndex = config.currentIndex || 0;
        const problem = config.problems[currentIndex];
        const totalProblems = config.problems.length;
        
        // Create main wrapper
        const mainWrapper = document.createElement('div');
        mainWrapper.className = 'math-problem-main-wrapper';
        mainWrapper.style.display = 'flex';
        mainWrapper.style.flexDirection = 'column';
        mainWrapper.style.justifyContent = 'center';
        mainWrapper.style.alignItems = 'center';
        mainWrapper.style.height = '100%';
        mainWrapper.style.width = '100%';
        mainWrapper.style.padding = '40px 0';

        // Problem counter
        const problemCounter = document.createElement('div');
        problemCounter.className = 'problem-counter';
        problemCounter.textContent = `Problem ${currentIndex + 1} of ${totalProblems}`;
        problemCounter.style.fontSize = '1.2rem';
        problemCounter.style.marginBottom = '20px';
        problemCounter.style.color = '#666';

        // Math problem display
        const problemDisplay = document.createElement('div');
        problemDisplay.className = 'math-problem-display';
        problemDisplay.style.display = 'flex';
        problemDisplay.style.flexDirection = 'column';
        problemDisplay.style.justifyContent = 'center';
        problemDisplay.style.alignItems = 'center';
        problemDisplay.style.marginBottom = '30px';

        // Problem text
        const problemText = document.createElement('div');
        problemText.className = 'problem-text';
        problemText.textContent = `${problem.problem} = ?`;
        problemText.style.fontSize = '4rem';
        problemText.style.fontWeight = 'bold';
        problemText.style.color = '#333';
        problemText.style.textAlign = 'center';
        problemText.style.padding = '20px';
        problemText.style.backgroundColor = '#f8f8f8';
        problemText.style.borderRadius = '10px';
        problemText.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        problemText.style.minWidth = '300px';
        problemText.style.marginBottom = '20px';

        // Answer section
        const answerSection = document.createElement('div');
        answerSection.className = 'answer-section';
        answerSection.style.display = 'flex';
        answerSection.style.flexDirection = 'column';
        answerSection.style.alignItems = 'center';

        // Answer display (initially hidden)
        const answerDisplay = document.createElement('div');
        answerDisplay.className = 'answer-display';
        answerDisplay.id = 'answerDisplay';
        answerDisplay.textContent = problem.answer;
        answerDisplay.style.fontSize = '3rem';
        answerDisplay.style.fontWeight = 'bold';
        answerDisplay.style.color = '#4CAF50';
        answerDisplay.style.backgroundColor = '#e8f5e8';
        answerDisplay.style.padding = '15px 30px';
        answerDisplay.style.borderRadius = '10px';
        answerDisplay.style.marginBottom = '15px';
        answerDisplay.style.display = showingAnswer ? 'block' : 'none';

        // Show Answer button
        const showAnswerBtn = document.createElement('button');
        showAnswerBtn.className = 'show-answer-btn';
        showAnswerBtn.id = 'showAnswerBtn';
        showAnswerBtn.textContent = 'Show Answer';
        showAnswerBtn.style.fontSize = '1.5rem';
        showAnswerBtn.style.padding = '10px 20px';
        showAnswerBtn.style.backgroundColor = '#2196F3';
        showAnswerBtn.style.color = 'white';
        showAnswerBtn.style.border = 'none';
        showAnswerBtn.style.borderRadius = '5px';
        showAnswerBtn.style.cursor = 'pointer';
        showAnswerBtn.style.display = showingAnswer ? 'none' : 'block';

        // Add click event to show answer button
        showAnswerBtn.addEventListener('click', () => {
            showingAnswer = true;
            answerDisplay.style.display = 'block';
            showAnswerBtn.style.display = 'none';
        });

        // Assemble the components
        answerSection.appendChild(answerDisplay);
        answerSection.appendChild(showAnswerBtn);
        problemDisplay.appendChild(problemText);
        problemDisplay.appendChild(answerSection);
        mainWrapper.appendChild(problemCounter);
        mainWrapper.appendChild(problemDisplay);

        // Add to container
        container.appendChild(mainWrapper);
    }

    // Math next problem handler
    function handleMathNext(config, updateCallback) {
        console.log('Math: handleMathNext called with config:', config);
        if (config.problems && config.problems.length > 0) {
            config.currentIndex = (config.currentIndex + 1) % config.problems.length;
            showingAnswer = false; // Reset answer display for next problem
            console.log('Math: Updated to problem index:', config.currentIndex);
            updateCallback();
        }
    }

    // Register the Math program module - using the correct API pattern
    console.log('Math: Registering Math program module...');
    window.registerProgramModule('Math', renderMathProblem, handleMathNext);
    console.log('Math: Registration complete');

    // Make the render function available globally for direct access
    window.renderMathProgram = renderMathProblem;

    // Modal event listeners
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Math program: DOMContentLoaded event fired');
        
        // Set up click handler for the Math program item in the sidebar
        const mathProgramItem = Array.from(document.querySelectorAll('.program-item'))
            .find(item => item.querySelector('.program-details h3')?.textContent === 'Math');
        
        console.log('Math program: Looking for Math program item...', mathProgramItem);
        
        if (mathProgramItem) {
            console.log('Math program: Found Math program item, setting up click handler');
            // Remove any existing click listeners
            const newMathItem = mathProgramItem.cloneNode(true);
            mathProgramItem.parentNode.replaceChild(newMathItem, mathProgramItem);
            
            // Add click listener that opens our Math modal
            newMathItem.addEventListener('click', () => {
                console.log('Math program item clicked! Opening modal...');
                const modal = document.getElementById('mathModal');
                console.log('Math modal element:', modal);
                if (modal) {
                    modal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                    
                    // Generate initial preview
                    updateProblemsPreview();
                    console.log('Math modal opened successfully');
                } else {
                    console.error('Math modal not found');
                }
            });
        } else {
            console.error('Math program item not found in sidebar');
            
            // Debug: List all program items
            console.log('Available program items:');
            document.querySelectorAll('.program-item').forEach((item, index) => {
                const h3 = item.querySelector('.program-details h3');
                console.log(`Program item ${index}: "${h3?.textContent}"`);
            });
        }

        // Close modal
        document.getElementById('closeMathModal').addEventListener('click', function() {
            document.getElementById('mathModal').style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // Generate problems button
        document.getElementById('generateProblemsBtn').addEventListener('click', updateProblemsPreview);

        // Auto-update preview when settings change
        ['minNumber', 'maxNumber', 'problemCount', 'additionCheck', 'subtractionCheck'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', updateProblemsPreview);
                if (element.type !== 'checkbox') {
                    element.addEventListener('input', updateProblemsPreview);
                }
            }
        });

        // Done button
        document.getElementById('doneMathBtn').addEventListener('click', function() {
            const title = document.getElementById('mathTitleInput').value.trim();
            const minNumber = parseInt(document.getElementById('minNumber').value) || 1;
            const maxNumber = parseInt(document.getElementById('maxNumber').value) || 10;
            const problemCount = parseInt(document.getElementById('problemCount').value) || 10;
            const includeAddition = document.getElementById('additionCheck').checked;
            const includeSubtraction = document.getElementById('subtractionCheck').checked;

            if (maxNumber < minNumber) {
                alert('Maximum number must be greater than or equal to minimum number.');
                return;
            }

            if (!includeAddition && !includeSubtraction) {
                alert('Please select at least one operation (addition or subtraction).');
                return;
            }

            // Generate problems
            const config = { minNumber, maxNumber, problemCount, includeAddition, includeSubtraction };
            const problems = generateMathProblems(config);

            // Create tab
            const programName = 'Math';
            const programTabs = document.querySelector('.program-tabs');
            const count = document.querySelectorAll(`.tab[data-program="${programName}"]`).length + 1;
            const defaultName = `${programName} ${count}`;
            const tabTitle = title || defaultName;
            const tabId = tabTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

            const newTab = document.createElement('div');
            newTab.className = 'tab';
            newTab.setAttribute('data-program', programName);
            newTab.id = tabId;
            newTab.innerHTML = `${tabTitle}<span class="close-tab">×</span>`;

            // Store configuration in global programConfigs object
            window.programConfigs = window.programConfigs || {};
            window.programConfigs[tabId] = {
                type: programName,
                title: tabTitle,
                problems: problems,
                currentIndex: 0,
                settings: {
                    minNumber,
                    maxNumber,
                    includeAddition,
                    includeSubtraction
                }
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
                    delete window.programConfigs[tabId];
                }
                
                // Check if this was the active tab before removing
                const wasActive = newTab.classList.contains('active');
                newTab.remove();
                
                // If this was the active tab, activate another tab or show empty message
                if (wasActive) {
                    const remainingTabs = document.querySelectorAll('.tab');
                    if (remainingTabs.length > 0) {
                        window.activateTab(remainingTabs[remainingTabs.length - 1]);
                    } else {
                        // Clear content when no tabs remain
                        const stimulusDisplay = document.querySelector('.stimulus-display');
                        if (stimulusDisplay) {
                            stimulusDisplay.innerHTML = '<div class="no-programs">No active programs</div>';
                        }
                    }
                }
            });

            // Activate the new tab
            if (window.activateTab) {
                window.activateTab(newTab);
            }

            // Reset state
            showingAnswer = false;

            // Close modal
            document.getElementById('mathModal').style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // Close modal when clicking outside
        document.getElementById('mathModal').addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
})();

console.log('math.js fully loaded');
