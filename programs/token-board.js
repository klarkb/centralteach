// Token Board program implementation
console.log("token-board.js starting execution");

// Track program state
let currentTokenBoardConfig = null;
let currentTokenBoardEditingTabId = null;
let currentTokenCount = 0;
let selectedIcon = null;
let previewTokenSlots = [];

// Function to open the Token Board configuration modal
function openTokenBoardModal() {
  console.log("Opening token board modal...");
  
  // Reset state for new program
  currentTokenBoardConfig = null;
  currentTokenBoardEditingTabId = null;
  currentTokenCount = 0;
  selectedIcon = null;
  previewTokenSlots = [];

  const modal = document.getElementById("tokenBoardModal");
  if (!modal) {
    console.error("Token Board modal not found");
    return;
  }

  // Clear form fields
  const titleInput = modal.querySelector("#tokenBoardTitleInput");
  if (titleInput) titleInput.value = "";
  
  const fieldSizeInput = modal.querySelector("#tokenBoardFieldSize");
  if (fieldSizeInput) fieldSizeInput.value = "5";
  
  const rewardTextInput = modal.querySelector("#tokenBoardRewardText");
  if (rewardTextInput) rewardTextInput.value = "";

  // Hide reward preview
  const rewardPreview = modal.querySelector("#tokenBoardRewardPreview");
  if (rewardPreview) rewardPreview.style.display = "none";

  // Show the modal
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
  document.body.classList.add("modal-open");
  console.log("Modal opened successfully");

  // Initialize preview after modal is shown
  setTimeout(() => {
    updateTokenBoardPreview();
  }, 10);
  
  // Set up modal event handlers
  setupTokenBoardModalHandlers(modal);
}

// Function to set up modal event handlers
function setupTokenBoardModalHandlers(modal) {
  console.log("Setting up token board modal handlers");
  
  // Get elements
  const doneBtn = modal.querySelector('#doneTokenBoardBtn');
  const closeBtn = modal.querySelector('#closeTokenBoardModal');
  const rewardTextInput = modal.querySelector('#tokenBoardRewardText');
  const fieldSizeInput = modal.querySelector('#tokenBoardFieldSize');
  const iconSearch = modal.querySelector('#tokenBoardIconSearch');
  const previewRewardSection = modal.querySelector('#previewRewardSection');
  const removePreviewImageBtn = modal.querySelector('#removePreviewRewardImage');

  // Clear existing event listeners by cloning elements
  const newDoneBtn = doneBtn.cloneNode(true);
  doneBtn.parentNode.replaceChild(newDoneBtn, doneBtn);
  
  const newCloseBtn = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

  // Done button
  newDoneBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Done button clicked");
    finalizeTokenBoardProgram();
  });

  // Close button
  newCloseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Close button clicked");
    closeTokenBoardModal();
  });

  // Reward text input
  rewardTextInput.addEventListener('input', () => {
    updateTokenBoardPreview();
  });

  // Preview reward section click handler
  if (previewRewardSection) {
    previewRewardSection.addEventListener('click', () => {
      if (selectedIcon) {
        addIconToReward();
      }
    });
  }

  // Remove preview reward image button
  if (removePreviewImageBtn) {
    removePreviewImageBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering the parent click
      removePreviewRewardImage();
    });
  }

  // Field size input
  fieldSizeInput.addEventListener('input', () => {
    updateTokenBoardPreview();
  });

  // Icon search
  if (iconSearch) {
    iconSearch.addEventListener('input', (e) => {
      filterIcons(e.target.value);
    });
  }

  // Set up icon grid and category buttons
  setupIconSelection(modal);
  setupCategoryButtons(modal);

  // Close on outside click
  const outsideClickHandler = (e) => {
    if (e.target === modal && !e.defaultPrevented) {
      console.log("Outside click detected");
      e.preventDefault();
      e.stopPropagation();
      closeTokenBoardModal();
    }
  };
  
  modal.removeEventListener('click', outsideClickHandler);
  modal.addEventListener('click', outsideClickHandler);

  // Prevent clicks inside modal content from bubbling
  const modalContent = modal.querySelector('.modal-content');
  if (modalContent) {
    modalContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}

// Function to set up icon selection
function setupIconSelection(modal) {
  const iconItems = modal.querySelectorAll('#tokenBoardIconGrid .icon-item');
  
  iconItems.forEach(item => {
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);
    
    newItem.addEventListener('click', () => {
      // Clear previous selections
      iconItems.forEach(i => i.classList.remove('active'));
      newItem.classList.add('active');
      
      const img = newItem.querySelector('img');
      selectedIcon = {
        src: img.src,
        alt: img.alt,
        name: newItem.getAttribute('data-name')
      };
      
      // Update visual indicators
      updateClickIndicators();
    });
  });
}

// Function to set up category filtering
function setupCategoryButtons(modal) {
  const categoryBtns = modal.querySelectorAll('.icon-category-bar .category-btn');
  const iconItems = modal.querySelectorAll('#tokenBoardIconGrid .icon-item');
  
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const category = btn.getAttribute('data-category');
      iconItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        item.style.display = (category === 'all' || itemCategory === category) ? 'flex' : 'none';
      });
    });
  });
}

// Function to filter icons based on search
function filterIcons(searchValue) {
  const iconItems = document.querySelectorAll('#tokenBoardIconGrid .icon-item');
  const searchLower = searchValue.toLowerCase();
  
  iconItems.forEach(item => {
    const itemName = item.getAttribute('data-name') || '';
    const itemAlt = item.querySelector('img').alt.toLowerCase();
    const matches = !searchValue || itemName.includes(searchLower) || itemAlt.includes(searchLower);
    item.style.display = matches ? 'flex' : 'none';
  });
}

// Function to add selected icon to reward
function addIconToReward() {
  if (!selectedIcon) return;
  
  const modal = document.getElementById("tokenBoardModal");
  const previewRewardImageContainer = modal.querySelector('#previewRewardImageContainer');
  const previewRewardImg = modal.querySelector('#previewRewardImg');
  
  previewRewardImg.src = selectedIcon.src;
  previewRewardImg.alt = selectedIcon.alt;
  previewRewardImageContainer.style.display = 'block';
  
  clearSelectedIcon();
}

// Function to remove preview reward image
function removePreviewRewardImage() {
  const modal = document.getElementById("tokenBoardModal");
  const previewRewardImageContainer = modal.querySelector('#previewRewardImageContainer');
  const previewRewardImg = modal.querySelector('#previewRewardImg');
  
  // Clear preview
  previewRewardImageContainer.style.display = 'none';
  previewRewardImg.src = '';
  previewRewardImg.alt = '';
  
  updateClickIndicators();
}

// Function to update visual indicators for clickable areas
function updateClickIndicators() {
  const modal = document.getElementById("tokenBoardModal");
  const previewRewardSection = modal.querySelector('#previewRewardSection');
  const tokenSlots = modal.querySelectorAll('.preview-token-slot');
  
  if (selectedIcon) {
    // Show click indicators
    previewRewardSection.classList.add('clickable');
    
    tokenSlots.forEach(slot => {
      slot.classList.add('clickable');
    });
  } else {
    // Hide click indicators
    previewRewardSection.classList.remove('clickable');
    
    tokenSlots.forEach(slot => {
      slot.classList.remove('clickable');
    });
  }
}

// Function to remove a token from a specific slot
function removeTokenFromSlot(slotIndex) {
  const previewTokenGrid = document.querySelector("#previewTokenGrid");
  const tokenSlot = previewTokenGrid.querySelector(`[data-slot="${slotIndex}"]`);
  
  if (tokenSlot) {
    // Reset to default star
    tokenSlot.innerHTML = '⭐';
    
    // Update stored token info
    previewTokenSlots[slotIndex] = { type: 'star' };
  }
}

// Function to clear selected icon
function clearSelectedIcon() {
  selectedIcon = null;
  const iconItems = document.querySelectorAll('#tokenBoardIconGrid .icon-item');
  iconItems.forEach(item => item.classList.remove('active'));
  updateClickIndicators();
}

// Function to update the token board preview
function updateTokenBoardPreview() {
  const modal = document.getElementById("tokenBoardModal");
  const fieldSizeInput = modal.querySelector("#tokenBoardFieldSize");
  const rewardTextInput = modal.querySelector("#tokenBoardRewardText");
  const previewRewardText = modal.querySelector("#previewRewardValue");
  const previewRewardImageContainer = modal.querySelector("#previewRewardImageContainer");
  const previewRewardImg = modal.querySelector("#previewRewardImg");
  const previewTokenGrid = modal.querySelector("#previewTokenGrid");
  
  const fieldSize = parseInt(fieldSizeInput.value) || 5;
  const rewardText = rewardTextInput.value.trim() || "reward";
  
  // Update reward preview text
  previewRewardText.textContent = rewardText;
  
  // Update reward preview image (check if there's an image in the preview)
  if (previewRewardImg.src && previewRewardImg.src !== window.location.href) {
    previewRewardImageContainer.style.display = 'block';
  } else {
    previewRewardImageContainer.style.display = 'none';
  }
  
  // Always rebuild token grid if field size has changed OR if no tokens exist
  const currentSlots = previewTokenGrid.querySelectorAll('.preview-token-slot');
  const currentFieldSize = currentSlots.length;
  
  if (currentFieldSize !== fieldSize || currentFieldSize === 0) {
    // Only preserve existing token configurations from DOM if previewTokenSlots is empty
    // (i.e., we're not in editing mode where previewTokenSlots was already set from config)
    if (previewTokenSlots.length === 0) {
      const existingTokens = [];
      currentSlots.forEach((slot, index) => {
        const img = slot.querySelector('img');
        if (img) {
          existingTokens[index] = {
            type: 'image',
            src: img.src,
            alt: img.alt
          };
        } else {
          existingTokens[index] = { type: 'star' };
        }
      });
      
      // Update previewTokenSlots with preserved data
      previewTokenSlots = existingTokens.slice();
    }
    
    // Ensure previewTokenSlots has the right length
    while (previewTokenSlots.length < fieldSize) {
      previewTokenSlots.push({ type: 'star' });
    }
    
    // Clear and rebuild grid
    previewTokenGrid.innerHTML = '';
    
    // Calculate grid columns based on field size
    const columns = Math.min(fieldSize, 5);
    previewTokenGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    
    for (let i = 0; i < fieldSize; i++) {
      const tokenSlot = document.createElement('div');
      tokenSlot.className = 'preview-token-slot';
      tokenSlot.setAttribute('data-slot', i);
      
      // Restore existing token or use default star
      const existingToken = previewTokenSlots[i];
      if (existingToken && existingToken.type === 'image') {
        const tokenImg = document.createElement('img');
        tokenImg.src = existingToken.src;
        tokenImg.alt = existingToken.alt;
        tokenSlot.appendChild(tokenImg);
        
        // Add remove button for image tokens
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-token-btn';
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeTokenFromSlot(i);
        });
        tokenSlot.appendChild(removeBtn);
      } else {
        tokenSlot.innerHTML = '⭐'; // Default star token
        previewTokenSlots[i] = { type: 'star' };
      }
      
      // Add click handler for token customization
      tokenSlot.addEventListener('click', () => {
        if (selectedIcon) {
          tokenSlot.innerHTML = '';
          const tokenImg = document.createElement('img');
          tokenImg.src = selectedIcon.src;
          tokenImg.alt = selectedIcon.alt;
          tokenSlot.appendChild(tokenImg);
          
          // Add remove button for the new image token
          const removeBtn = document.createElement('button');
          removeBtn.className = 'remove-token-btn';
          removeBtn.innerHTML = '×';
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeTokenFromSlot(i);
          });
          tokenSlot.appendChild(removeBtn);
          
          // Store token info
          previewTokenSlots[i] = {
            type: 'image',
            src: selectedIcon.src,
            alt: selectedIcon.alt
          };
          
          clearSelectedIcon();
        }
      });
      
      previewTokenGrid.appendChild(tokenSlot);
    }
  }
  
  // Update click indicators
  updateClickIndicators();
}

// Function to finalize the token board program
function finalizeTokenBoardProgram() {
  console.log("Finalizing token board program...");
  
  const modal = document.getElementById("tokenBoardModal");
  const titleInput = modal.querySelector("#tokenBoardTitleInput");
  const fieldSizeInput = modal.querySelector("#tokenBoardFieldSize");
  const rewardTextInput = modal.querySelector("#tokenBoardRewardText");
  const previewRewardImg = modal.querySelector("#previewRewardImg");
  
  // Create program - generate a sequential number for default names
  let programTitle = titleInput.value.trim();
  if (!programTitle) {
    // Find the next sequential number for "Token Board X"
    const existingConfigs = window.programConfigs || {};
    const existingNumbers = Object.values(existingConfigs)
      .filter(config => config.type === "Token Board" && config.title.match(/^Token Board \d+$/))
      .map(config => parseInt(config.title.match(/\d+$/)[0]))
      .sort((a, b) => a - b);
    
    let nextNumber = 1;
    for (let num of existingNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }
    
    programTitle = `Token Board ${nextNumber}`;
  }
  
  const fieldSize = parseInt(fieldSizeInput.value) || 5;
  const rewardText = rewardTextInput.value.trim();
  
  // Validate reward
  let reward = null;
  if (previewRewardImg.src && previewRewardImg.src !== window.location.href) {
    reward = { 
      type: 'image', 
      src: previewRewardImg.src,
      alt: previewRewardImg.alt,
      text: rewardText || previewRewardImg.alt // Use user text if provided, fallback to alt
    };
  } else {
    if (!rewardText) {
      alert("Please enter a reward text or select an image.");
      return;
    }
    reward = { type: 'text', content: rewardText };
  }
  
  // Get token configuration from preview
  const tokens = previewTokenSlots.slice(0, fieldSize);
  
  const tabId = programTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  const config = {
    type: "Token Board",
    title: programTitle,
    fieldSize: fieldSize,
    reward: reward,
    tokens: tokens, // Store array of token configurations
    currentTokens: 0
  };

  console.log("Created config:", config);

  // Store configuration
  if (!window.programConfigs) window.programConfigs = {};
  window.programConfigs[tabId] = config;

  // Close modal FIRST to avoid any interference
  closeTokenBoardModal();
  
  // Short delay to ensure modal is closed before creating tab
  setTimeout(() => {
    // Create tab and get the DOM element
    const newTab = createTokenBoardTab(tabId, programTitle);
    console.log("Created tab:", newTab);
    
    // Activate the new tab
    if (window.activateTab && newTab) {
      console.log("Activating tab...");
      window.activateTab(newTab); // Pass the DOM element
    } else {
      console.error("Could not activate tab - activateTab function or newTab not found");
    }
    
    // Update program stars
    if (window.updateProgramStars) {
      window.updateProgramStars();
    }
  }, 100);
}

// Function to create a token board tab
function createTokenBoardTab(tabId, title) {
  console.log("Creating token board tab:", tabId, title);
  
  const tab = document.createElement("div");
  tab.className = "tab";
  tab.id = tabId; // Set the ID for updateProgramContent to find
  tab.setAttribute("data-program", "Token Board");
  tab.setAttribute("data-tab-id", tabId);
  tab.innerHTML = `
    <span class="tab-title">${title}</span>
    <span class="close-tab" data-tab-id="${tabId}">×</span>
  `;

  const tabsContainer = document.querySelector(".program-tabs");
  if (!tabsContainer) {
    console.error("Tabs container not found");
    return null;
  }
  
  tabsContainer.appendChild(tab);
  console.log("Tab appended to container");

  // Set up tab click functionality
  tab.addEventListener("click", (e) => {
    if (!e.target.classList.contains("close-tab")) {
      console.log("Tab clicked, activating...");
      if (window.activateTab) {
        window.activateTab(tab); // Pass the DOM element, not the ID
      }
    }
  });

  // Set up close button functionality
  const closeButton = tab.querySelector(".close-tab");
  closeButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Closing tab:", tabId);
    tab.remove();
    delete window.programConfigs[tabId];
    
    if (window.updateProgramStars) window.updateProgramStars();
    
    const remainingTabs = document.querySelectorAll(".tab");
    if (remainingTabs.length === 0) {
      const emptyMessage = document.getElementById("empty-program-message");
      const programDisplay = document.getElementById("program-display");
      if (emptyMessage) emptyMessage.style.display = "block";
      if (programDisplay) programDisplay.style.display = "none";
    } else {
      const firstTab = remainingTabs[0];
      if (window.activateTab) {
        window.activateTab(firstTab); // Pass the DOM element
      }
    }
  });
  
  console.log("Tab created successfully:", tab);
  return tab; // Return the tab element for activation
}

// Function to close the modal
function closeTokenBoardModal() {
  console.log("Closing token board modal...");
  
  const modal = document.getElementById("tokenBoardModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    document.body.classList.remove("modal-open");
    console.log("Modal closed successfully");
    
    // Reset all form fields and preview elements
    const titleInput = modal.querySelector("#tokenBoardTitleInput");
    const fieldSizeInput = modal.querySelector("#tokenBoardFieldSize");
    const rewardTextInput = modal.querySelector("#tokenBoardRewardText");
    const selectedIconDiv = modal.querySelector("#selectedIcon");
    const previewTokenGrid = modal.querySelector("#previewTokenGrid");
    const previewRewardImg = modal.querySelector("#previewRewardImg");
    const previewRewardImageContainer = modal.querySelector("#previewRewardImageContainer");
    const previewRewardText = modal.querySelector("#previewRewardValue");
    
    // Clear form inputs
    if (titleInput) titleInput.value = "";
    if (fieldSizeInput) fieldSizeInput.value = "5";
    if (rewardTextInput) rewardTextInput.value = "";
    
    // Reset selected icon display
    if (selectedIconDiv) {
      selectedIconDiv.innerHTML = '<p>Click an icon from below to customize a token</p>';
    }
    
    // Clear preview elements
    if (previewTokenGrid) {
      previewTokenGrid.innerHTML = '';
    }
    
    if (previewRewardImg) {
      previewRewardImg.src = '';
      previewRewardImg.alt = '';
    }
    
    if (previewRewardImageContainer) {
      previewRewardImageContainer.style.display = 'none';
    }
    
    if (previewRewardText) {
      previewRewardText.textContent = 'reward';
    }
    
    // Remove active classes from icon items
    const iconItems = modal.querySelectorAll('.icon-item');
    iconItems.forEach(item => item.classList.remove('active'));
    
  } else {
    console.error("Modal not found when trying to close");
  }

  // Reset state variables
  currentTokenBoardConfig = null;
  currentTokenBoardEditingTabId = null;
  currentTokenCount = 0;
  selectedIcon = null;
  previewTokenSlots = [];
}

// Function to render a Token Board program in the content area
function renderTokenBoardProgram(config, stimulusDisplay) {
  console.log("Rendering Token Board program with config:", config);
  
  stimulusDisplay.innerHTML = '';
  
  const container = document.createElement('div');
  container.className = 'token-board-program';
  
  // Header with reward text
  const header = document.createElement('div');
  header.className = 'token-board-header';
  
  let rewardText = '';
  if (config.reward.type === 'text') {
    rewardText = config.reward.content;
  } else {
    rewardText = config.reward.text || config.reward.alt || 'reward';
  }
  
  header.innerHTML = `<h2>I am working for ${rewardText}</h2>`;
  
  // Add reward image if applicable
  if (config.reward.type === 'image') {
    const rewardImage = document.createElement('img');
    rewardImage.src = config.reward.src;
    rewardImage.alt = config.reward.alt;
    rewardImage.className = 'reward-image';
    
    // Add completed class if all tokens are filled
    if (config.currentTokens === config.fieldSize) {
      rewardImage.classList.add('completed');
    }
    
    header.appendChild(rewardImage);
  }
  
  container.appendChild(header);
  
  // Token grid
  const tokenGrid = document.createElement('div');
  tokenGrid.className = 'token-grid';
  tokenGrid.style.gridTemplateColumns = `repeat(${Math.min(config.fieldSize, 5)}, 1fr)`;
  
  for (let i = 0; i < config.fieldSize; i++) {
    const tokenSlot = document.createElement('div');
    tokenSlot.className = 'token-slot';
    tokenSlot.setAttribute('data-slot', i);
    
    if (i < (config.currentTokens || 0)) {
      // Add token based on configuration
      const tokenConfig = config.tokens ? config.tokens[i] : { type: 'star' };
      
      if (tokenConfig.type === 'star') {
        tokenSlot.innerHTML = '⭐';
        tokenSlot.classList.add('filled');
      } else {
        const tokenImage = document.createElement('img');
        tokenImage.src = tokenConfig.src;
        tokenImage.alt = tokenConfig.alt;
        tokenImage.className = 'token-image';
        tokenSlot.appendChild(tokenImage);
        tokenSlot.classList.add('filled');
      }
    }
    
    tokenGrid.appendChild(tokenSlot);
  }
  
  container.appendChild(tokenGrid);
  
  // Control buttons
  const controls = document.createElement('div');
  controls.className = 'token-board-controls';
  
  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove Token';
  removeBtn.className = 'token-control-btn remove-btn';
  removeBtn.addEventListener('click', () => removeToken(config));
  
  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Token';
  addBtn.className = 'token-control-btn add-btn';
  addBtn.addEventListener('click', () => addToken(config));
  
  controls.appendChild(removeBtn);
  controls.appendChild(addBtn);
  container.appendChild(controls);
  
  stimulusDisplay.appendChild(container);
  
  // Hide prompt text
  const promptText = document.querySelector(".prompt-text");
  if (promptText) promptText.style.display = "none";
}

// Function to update reward image completion state
function updateRewardImageState(config) {
  const rewardImage = document.querySelector('.reward-image');
  if (rewardImage) {
    if (config.currentTokens === config.fieldSize) {
      rewardImage.classList.add('completed');
    } else {
      rewardImage.classList.remove('completed');
    }
  }
}

// Function to add a token
function addToken(config) {
  if (config.currentTokens < config.fieldSize) {
    const currentSlot = document.querySelector(`[data-slot="${config.currentTokens}"]`);
    
    config.currentTokens++;
    
    // Add animation only to the new token
    if (currentSlot) {
      // Get token configuration for this slot
      const tokenConfig = config.tokens ? config.tokens[config.currentTokens - 1] : { type: 'star' };
      
      if (tokenConfig.type === 'star') {
        currentSlot.innerHTML = '⭐';
        currentSlot.classList.add('filled');
      } else {
        const tokenImage = document.createElement('img');
        tokenImage.src = tokenConfig.src;
        tokenImage.alt = tokenConfig.alt;
        tokenImage.className = 'token-image';
        currentSlot.appendChild(tokenImage);
        currentSlot.classList.add('filled');
      }
      
      // Add specific animation to this slot only
      currentSlot.style.animation = 'tokenAppear 0.5s ease-in-out';
      setTimeout(() => {
        currentSlot.style.animation = '';
      }, 500);
    }
    
    // No congratulations alert - just visual completion indication
    if (config.currentTokens === config.fieldSize) {
      setTimeout(() => {
        // Add a visual celebration effect to the entire board
        const tokenGrid = document.querySelector('.token-grid');
        if (tokenGrid) {
          tokenGrid.style.animation = 'pulse 1s ease-in-out';
          setTimeout(() => {
            tokenGrid.style.animation = '';
          }, 1000);
        }
        
        // Add special celebration animation to the reward image
        const rewardImage = document.querySelector('.reward-image');
        if (rewardImage) {
          // Temporarily add celebration class for one-time effect
          rewardImage.classList.add('celebration-burst');
          setTimeout(() => {
            rewardImage.classList.remove('celebration-burst');
          }, 3000);
        }
      }, 100);
    }
    
    // Update reward image state
    updateRewardImageState(config);
  }
}

// Function to remove a token
function removeToken(config) {
  if (config.currentTokens > 0) {
    const currentSlot = document.querySelector(`[data-slot="${config.currentTokens - 1}"]`);
    
    // Add animation to the token being removed
    if (currentSlot) {
      currentSlot.style.animation = 'tokenDisappear 0.3s ease-in-out';
      setTimeout(() => {
        currentSlot.innerHTML = '';
        currentSlot.classList.remove('filled');
        currentSlot.style.animation = '';
      }, 300);
    }
    
    config.currentTokens--;
    
    // Update reward image state
    updateRewardImageState(config);
  }
}

// Function to handle edit modal for token board
function openTokenBoardEditModal(tabId) {
  const config = window.programConfigs[tabId];
  if (!config) {
    console.error("No config found for tab:", tabId);
    return;
  }
  
  // Set up state for editing
  currentTokenBoardEditingTabId = tabId;
  selectedIcon = null;
  previewTokenSlots = config.tokens ? [...config.tokens] : [];
  
  const modal = document.getElementById("tokenBoardModal");
  if (!modal) {
    console.error("Token Board modal not found");
    return;
  }
  
  // Set the form values
  const titleInput = modal.querySelector("#tokenBoardTitleInput");
  const fieldSizeInput = modal.querySelector("#tokenBoardFieldSize");
  const rewardTextInput = modal.querySelector("#tokenBoardRewardText");
  const previewRewardImageContainer = modal.querySelector("#previewRewardImageContainer");
  const previewRewardImg = modal.querySelector("#previewRewardImg");
  
  if (titleInput) titleInput.value = config.title || '';
  if (fieldSizeInput) fieldSizeInput.value = config.fieldSize || 5;
  
  // Set reward
  if (config.reward.type === 'text') {
    rewardTextInput.value = config.reward.content;
    previewRewardImageContainer.style.display = 'none';
  } else {
    rewardTextInput.value = config.reward.text || config.reward.alt || '';
    previewRewardImg.src = config.reward.src;
    previewRewardImg.alt = config.reward.alt;
    previewRewardImageContainer.style.display = 'block';
  }
  
  // Show modal
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
  document.body.classList.add("modal-open");
  
  // Initialize preview with current config
  updateTokenBoardPreview();
  
  // Set up handlers
  setupTokenBoardModalHandlers(modal);
  
  // Override the done button for editing
  const doneBtn = modal.querySelector('#doneTokenBoardBtn');
  const newDoneBtn = doneBtn.cloneNode(true);
  doneBtn.parentNode.replaceChild(newDoneBtn, doneBtn);
  
  newDoneBtn.addEventListener('click', () => {
    const titleInput = modal.querySelector("#tokenBoardTitleInput");
    const fieldSizeInput = modal.querySelector("#tokenBoardFieldSize");
    const rewardTextInput = modal.querySelector("#tokenBoardRewardText");
    const previewRewardImg = modal.querySelector("#previewRewardImg");
    
    const fieldSize = parseInt(fieldSizeInput.value) || 5;
    const rewardText = rewardTextInput.value.trim();
    
    // Validate reward
    let reward = null;
    if (previewRewardImg.src && previewRewardImg.src !== window.location.href) {
      reward = { 
        type: 'image', 
        src: previewRewardImg.src,
        alt: previewRewardImg.alt,
        text: rewardText || previewRewardImg.alt // Use user text if provided, fallback to alt
      };
    } else {
      if (!rewardText) {
        alert("Please enter a reward text or select an image.");
        return;
      }
      reward = { type: 'text', content: rewardText };
    }
    
    // Update config
    config.title = titleInput.value.trim() || config.title;
    config.fieldSize = fieldSize;
    config.reward = reward;
    config.tokens = previewTokenSlots.slice(0, fieldSize);
    
    // Reset token count if field size changed
    if (config.currentTokens > fieldSize) {
      config.currentTokens = fieldSize;
    }
    
    // Update tab title
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tab) {
      const tabTitle = tab.querySelector('.tab-title');
      if (tabTitle) tabTitle.textContent = config.title;
    }
    
    // Update program content if active
    if (window.updateProgramContent) window.updateProgramContent();
    
    closeTokenBoardModal();
  });
}

// Export functions to window object
window.openTokenBoardModal = openTokenBoardModal;
window.renderTokenBoardProgram = renderTokenBoardProgram;
window.openTokenBoardEditModal = openTokenBoardEditModal;

// Register with the program system
if (window.registerProgramModule) {
  window.registerProgramModule(
    "Token Board",
    renderTokenBoardProgram,
    null
  );
}

// Set up program item click handler when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
  console.log("Token Board: DOMContentLoaded event fired");
  
  // Set up click handler for the Token Board program item in the sidebar
  const tokenBoardProgramItem = Array.from(document.querySelectorAll('.program-item'))
    .find(item => item.querySelector('.program-details h3')?.textContent === 'Token Board');

  console.log('Token Board: Looking for Token Board program item...', tokenBoardProgramItem);

  if (tokenBoardProgramItem) {
    console.log("Token Board: Found token board program item, setting up click handler");
    
    // Remove any existing click listeners
    const newTokenBoardItem = tokenBoardProgramItem.cloneNode(true);
    tokenBoardProgramItem.parentNode.replaceChild(newTokenBoardItem, tokenBoardProgramItem);
    
    // Add click listener that opens our Token Board modal
    newTokenBoardItem.addEventListener('click', () => {
      console.log("Token Board: Program item clicked! Opening modal...");
      const modal = document.getElementById('tokenBoardModal');
      console.log('Token Board: Modal element:', modal);
      if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
        console.log('Token Board: Modal opened successfully');
        setupTokenBoardModalHandlers(modal);
      } else {
        console.error('Token Board: Modal not found');
      }
    });
  } else {
    console.error('Token Board: Program item not found in sidebar');
    
    // Debug: List all program items
    console.log('Available program items:');
    document.querySelectorAll('.program-item').forEach((item, index) => {
      const h3 = item.querySelector('.program-details h3');
      console.log(`Program item ${index}: "${h3?.textContent}"`);
    });
  }
});

console.log("token-board.js fully loaded");
