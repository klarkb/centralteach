// Sentence Strips program implementation
console.log("sentence-strips.js starting execution");

// Track program state
let currentSentenceElements = [];
let currentEditingTabId = null;

// Function to open the Sentence Strips configuration modal
function openSentenceStripsModal() {
  console.log("Opening sentence strips modal...");
  
  // Reset state for new program
  currentSentenceElements = [];
  currentEditingTabId = null;

  const modal = document.getElementById("sentenceStripsModal");
  if (!modal) {
    console.error("Sentence Strips modal not found");
    return;
  }

  // Clear title input
  const titleInput = modal.querySelector("#sentenceStripsTitleInput");
  if (titleInput) titleInput.value = "";

  // Show the modal
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
  document.body.classList.add("modal-open");
  console.log("Modal opened successfully");

  // Set up modal event handlers
  setupSentenceStripsModalHandlers(modal);
}

// Function to set up modal event handlers
function setupSentenceStripsModalHandlers(modal) {
  console.log("Setting up sentence strips modal handlers");
  
  // Get elements
  const addTextBtn = modal.querySelector('[data-type="text"]');
  const addImageBtn = modal.querySelector('[data-type="image"]');
  const imageSelectionArea = modal.querySelector('.image-selection-area');
  const doneBtn = modal.querySelector('#doneSentenceStripsBtn');
  const closeBtn = modal.querySelector('#closeSentenceStripsModal');

  // Remove all existing event listeners by cloning and replacing elements
  const newAddTextBtn = addTextBtn.cloneNode(true);
  addTextBtn.parentNode.replaceChild(newAddTextBtn, addTextBtn);
  
  const newAddImageBtn = addImageBtn.cloneNode(true);
  addImageBtn.parentNode.replaceChild(newAddImageBtn, addImageBtn);
  
  const newDoneBtn = doneBtn.cloneNode(true);
  doneBtn.parentNode.replaceChild(newDoneBtn, doneBtn);
  
  const newCloseBtn = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

  // Add Text Element button
  newAddTextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Add text button clicked");
    showTextInputDialog();
  });

  // Add Image Element button  
  newAddImageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Add image button clicked");
    if (imageSelectionArea.style.display === 'none' || !imageSelectionArea.style.display) {
      imageSelectionArea.style.display = 'block';
      newAddImageBtn.classList.add('active');
      setupImageSelection(modal);
    } else {
      imageSelectionArea.style.display = 'none';
      newAddImageBtn.classList.remove('active');
    }
  });

  // Done button
  newDoneBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Done button clicked");
    finalizeSentenceStripsProgram();
  });

  // Close button
  newCloseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Close button clicked");
    closeSentenceStripsModal();
  });

  // Close on outside click
  const outsideClickHandler = (e) => {
    if (e.target === modal) {
      console.log("Outside click detected");
      closeSentenceStripsModal();
    }
  };
  
  // Remove existing outside click handlers and add new one
  modal.removeEventListener('click', outsideClickHandler);
  modal.addEventListener('click', outsideClickHandler);

  // Update display
  updateCurrentSentenceDisplay();
}

// Function to show text input dialog
function showTextInputDialog(existingElement = null, elementIndex = null) {
  const dialog = document.createElement('div');
  dialog.className = 'simple-dialog';
  dialog.innerHTML = `
    <div class="simple-dialog-content">
      <h3>${existingElement ? 'Edit' : 'Add'} Text</h3>
      <input type="text" id="textInput" placeholder="Enter text..." value="${existingElement ? existingElement.content : ''}" />
      <div class="dialog-buttons">
        <button class="cancel-btn">Cancel</button>
        <button class="save-btn">Save</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  const textInput = dialog.querySelector('#textInput');
  const saveBtn = dialog.querySelector('.save-btn');
  const cancelBtn = dialog.querySelector('.cancel-btn');

  textInput.focus();

  saveBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (text) {
      const element = { type: 'text', content: text };
      
      if (existingElement && elementIndex !== null) {
        currentSentenceElements[elementIndex] = element;
      } else {
        currentSentenceElements.push(element);
      }
      
      updateCurrentSentenceDisplay();
    }
    document.body.removeChild(dialog);
  });

  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(dialog);
  });

  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveBtn.click();
  });
}

// Function to set up image selection
function setupImageSelection(modal) {
  const iconItems = modal.querySelectorAll('.image-selection-area .icon-item');
  
  iconItems.forEach(item => {
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);
    
    newItem.addEventListener('click', () => {
      const img = newItem.querySelector('img');
      showImageSubtitleDialog(img.src, img.alt);
    });
  });

  // Set up category filtering
  const categoryBtns = modal.querySelectorAll('.icon-category-bar .category-btn');
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

  // Set up search
  const searchInput = modal.querySelector('.image-selection-area .search-icons input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchValue = e.target.value.toLowerCase();
      iconItems.forEach(item => {
        const itemName = item.getAttribute('data-name') || '';
        const itemAlt = item.querySelector('img').alt.toLowerCase();
        const matches = !searchValue || itemName.includes(searchValue) || itemAlt.includes(searchValue);
        item.style.display = matches ? 'flex' : 'none';
      });
    });
  }
}

// Function to show image subtitle dialog
function showImageSubtitleDialog(imageSrc, imageAlt, existingElement = null, elementIndex = null) {
  const dialog = document.createElement('div');
  dialog.className = 'simple-dialog';
  dialog.innerHTML = `
    <div class="simple-dialog-content">
      <h3>${existingElement ? 'Edit' : 'Add'} Image</h3>
      <div style="text-align: center; margin-bottom: 15px;">
        <img src="${imageSrc}" alt="${imageAlt}" style="width: 60px; height: 60px; object-fit: contain;">
      </div>
      <input type="text" id="subtitleInput" placeholder="Enter subtitle..." value="${existingElement ? existingElement.subtitle : imageAlt}" />
      <div class="dialog-buttons">
        <button class="cancel-btn">Cancel</button>
        <button class="save-btn">Save</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  const subtitleInput = dialog.querySelector('#subtitleInput');
  const saveBtn = dialog.querySelector('.save-btn');
  const cancelBtn = dialog.querySelector('.cancel-btn');

  subtitleInput.focus();

  saveBtn.addEventListener('click', () => {
    const subtitle = subtitleInput.value.trim() || imageAlt;
    const element = { type: 'image', src: imageSrc, alt: imageAlt, subtitle };
    
    if (existingElement && elementIndex !== null) {
      currentSentenceElements[elementIndex] = element;
    } else {
      currentSentenceElements.push(element);
    }
    
    updateCurrentSentenceDisplay();
    
    // Hide image selection area after adding
    const modal = document.getElementById("sentenceStripsModal");
    const imageSelectionArea = modal.querySelector('.image-selection-area');
    const addImageBtn = modal.querySelector('[data-type="image"]');
    imageSelectionArea.style.display = 'none';
    addImageBtn.classList.remove('active');
    
    document.body.removeChild(dialog);
  });

  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(dialog);
  });

  subtitleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveBtn.click();
  });
}

// Function to update current sentence display
function updateCurrentSentenceDisplay() {
  const modal = document.getElementById('sentenceStripsModal');
  if (!modal) return;
  
  const container = modal.querySelector('#sentenceStripElements');
  const placeholder = modal.querySelector('.add-element-placeholder');
  
  if (!container) return;

  container.innerHTML = '';

  if (currentSentenceElements.length === 0) {
    if (placeholder) placeholder.style.display = 'flex';
    return;
  }

  if (placeholder) placeholder.style.display = 'none';

  // Create draggable sentence strip
  const sentenceStrip = document.createElement('div');
  sentenceStrip.className = 'sentence-strip';
  
  currentSentenceElements.forEach((element, index) => {
    const elementDiv = document.createElement('div');
    elementDiv.className = `strip-element ${element.type}-element`;
    elementDiv.draggable = true;
    elementDiv.dataset.index = index;
    
    if (element.type === 'text') {
      elementDiv.innerHTML = `
        <div class="element-text">${element.content}</div>
        <div class="element-controls">
          <button class="edit-btn" onclick="editElement(${index})">✎</button>
          <button class="delete-btn" onclick="deleteElement(${index})">×</button>
        </div>
      `;
    } else if (element.type === 'image') {
      elementDiv.innerHTML = `
        <img src="${element.src}" alt="${element.alt}" class="element-image">
        <div class="element-subtitle">${element.subtitle}</div>
        <div class="element-controls">
          <button class="edit-btn" onclick="editElement(${index})">✎</button>
          <button class="delete-btn" onclick="deleteElement(${index})">×</button>
        </div>
      `;
    }
    
    // Add drag and drop handlers
    elementDiv.addEventListener('dragstart', handleDragStart);
    elementDiv.addEventListener('dragover', handleDragOver);
    elementDiv.addEventListener('drop', handleDrop);
    elementDiv.addEventListener('dragend', handleDragEnd);
    
    sentenceStrip.appendChild(elementDiv);
  });
  
  container.appendChild(sentenceStrip);
}

// Drag and drop handlers
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.style.opacity = '0.5';
}

function handleDragOver(e) {
  e.preventDefault();
  return false;
}

function handleDrop(e) {
  e.preventDefault();
  if (this !== draggedElement) {
    const draggedIndex = parseInt(draggedElement.dataset.index);
    const targetIndex = parseInt(this.dataset.index);
    
    // Reorder elements
    const draggedItem = currentSentenceElements[draggedIndex];
    currentSentenceElements.splice(draggedIndex, 1);
    currentSentenceElements.splice(targetIndex, 0, draggedItem);
    
    updateCurrentSentenceDisplay();
  }
  return false;
}

function handleDragEnd(e) {
  this.style.opacity = '1';
  draggedElement = null;
}

// Global functions for element controls
window.editElement = function(index) {
  const element = currentSentenceElements[index];
  if (element.type === 'text') {
    showTextInputDialog(element, index);
  } else if (element.type === 'image') {
    showImageSubtitleDialog(element.src, element.alt, element, index);
  }
};

window.deleteElement = function(index) {
  currentSentenceElements.splice(index, 1);
  updateCurrentSentenceDisplay();
};

// Function to finalize the sentence strips program
function finalizeSentenceStripsProgram() {
  console.log("Finalizing sentence strips program...");
  
  if (currentSentenceElements.length === 0) {
    alert("Please add at least one element to your sentence.");
    return;
  }

  const modal = document.getElementById("sentenceStripsModal");
  const titleInput = modal.querySelector("#sentenceStripsTitleInput");
  
  // Create program - generate a sequential number for default names
  let programTitle = titleInput.value.trim();
  if (!programTitle) {
    // Find the next sequential number for "Sentence Strips X"
    const existingConfigs = window.programConfigs || {};
    const existingNumbers = Object.values(existingConfigs)
      .filter(config => config.type === "Sentence Strips" && config.title.match(/^Sentence Strips \d+$/))
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
    
    programTitle = `Sentence Strips ${nextNumber}`;
  }
  const tabId = programTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  const config = {
    type: "Sentence Strips",
    title: programTitle,
    sentence: [...currentSentenceElements] // Single sentence instead of array of sentences
  };

  console.log("Created config:", config);

  // Store configuration
  if (!window.programConfigs) window.programConfigs = {};
  window.programConfigs[tabId] = config;

  // Close modal FIRST to avoid any interference
  closeSentenceStripsModal();
  
  // Short delay to ensure modal is closed before creating tab
  setTimeout(() => {
    // Create tab and get the DOM element
    const newTab = createSentenceStripsTab(tabId, programTitle);
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

// Function to create a sentence strips tab
function createSentenceStripsTab(tabId, title) {
  console.log("Creating sentence strips tab:", tabId, title);
  
  const tab = document.createElement("div");
  tab.className = "tab";
  tab.id = tabId; // Set the ID for updateProgramContent to find
  tab.setAttribute("data-program", "Sentence Strips");
  tab.setAttribute("data-tab-id", tabId);
  tab.innerHTML = `
    <span class="tab-title">${title}</span>
    <button class="close-tab" data-tab-id="${tabId}">×</button>
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
function closeSentenceStripsModal() {
  console.log("Closing sentence strips modal...");
  
  const modal = document.getElementById("sentenceStripsModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    document.body.classList.remove("modal-open");
    console.log("Modal closed successfully");
  } else {
    console.error("Modal not found when trying to close");
  }

  // Reset state
  currentSentenceElements = [];
  currentEditingTabId = null;

  // Reset form
  const titleInput = modal?.querySelector("#sentenceStripsTitleInput");
  if (titleInput) titleInput.value = "";

  // Hide image selection area
  const imageSelectionArea = modal?.querySelector('.image-selection-area');
  if (imageSelectionArea) imageSelectionArea.style.display = 'none';

  // Reset element buttons
  const elementButtons = modal?.querySelectorAll('.element-btn');
  if (elementButtons) elementButtons.forEach(btn => btn.classList.remove('active'));
}

// Function to render a Sentence Strips program in the content area
function renderSentenceStripsProgram(config, stimulusDisplay) {
  console.log("Rendering Sentence Strips program with config:", config);
  
  stimulusDisplay.innerHTML = '';
  
  const container = document.createElement('div');
  container.className = 'sentence-strips-program';
  
  // Add the sentence directly without header
  const sentenceContainer = document.createElement('div');
  sentenceContainer.className = 'sentence-container';
  
  const sentenceStrip = document.createElement('div');
  sentenceStrip.className = 'sentence-strip-display';
  
  config.sentence.forEach(element => {
    const elementDiv = document.createElement('div');
    elementDiv.className = `display-element ${element.type}-element`;
    
    if (element.type === 'text') {
      elementDiv.innerHTML = `<div class="display-text">${element.content}</div>`;
    } else if (element.type === 'image') {
      elementDiv.innerHTML = `
        <img src="${element.src}" alt="${element.alt}" class="display-image">
        <div class="display-subtitle">${element.subtitle}</div>
      `;
    }
    
    sentenceStrip.appendChild(elementDiv);
  });
  
  sentenceContainer.appendChild(sentenceStrip);
  container.appendChild(sentenceContainer);
  
  stimulusDisplay.appendChild(container);
  
  // Hide prompt text
  const promptText = document.querySelector(".prompt-text");
  if (promptText) promptText.style.display = "none";
}

// Function to handle edit modal for sentence strips
function openSentenceStripsEditModal(tabId) {
  const config = window.programConfigs[tabId];
  if (!config) {
    console.error("No config found for tab:", tabId);
    return;
  }
  
  // Set up state for editing
  currentEditingTabId = tabId;
  currentSentenceElements = config.sentence ? [...config.sentence] : [];
  
  const modal = document.getElementById("sentenceStripsModal");
  if (!modal) {
    console.error("Sentence Strips modal not found");
    return;
  }
  
  // Set the title
  const titleInput = modal.querySelector("#sentenceStripsTitleInput");
  if (titleInput) titleInput.value = config.title || '';
  
  // Show modal
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
  document.body.classList.add("modal-open");
  
  // Set up handlers
  setupSentenceStripsModalHandlers(modal);
  
  // Override the done button for editing
  const doneBtn = modal.querySelector('#doneSentenceStripsBtn');
  const newDoneBtn = doneBtn.cloneNode(true);
  doneBtn.parentNode.replaceChild(newDoneBtn, doneBtn);
  
  newDoneBtn.addEventListener('click', () => {
    if (currentSentenceElements.length === 0) {
      alert("Please add at least one element to your sentence.");
      return;
    }
    
    // Update config
    config.sentence = [...currentSentenceElements];
    config.title = titleInput.value.trim() || config.title;
    
    // Update tab title
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tab) {
      const tabTitle = tab.querySelector('.tab-title');
      if (tabTitle) tabTitle.textContent = config.title;
    }
    
    // Update program content if active
    if (window.updateProgramContent) window.updateProgramContent();
    
    closeSentenceStripsModal();
  });
}

// Export functions to window object
window.openSentenceStripsModal = openSentenceStripsModal;
window.renderSentenceStripsProgram = renderSentenceStripsProgram;
window.openSentenceStripsEditModal = openSentenceStripsEditModal;

// Register with the program system
if (window.registerProgramModule) {
  window.registerProgramModule(
    "Sentence Strips",
    renderSentenceStripsProgram,
    null
  );
}

// Set up program item click handler when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(() => {
    const sentenceStripsProgramItem = Array.from(
      document.querySelectorAll(".program-item")
    ).find((item) => {
      const h3 = item.querySelector(".program-details h3");
      return h3?.textContent?.trim() === "Sentence Strips";
    });

    if (sentenceStripsProgramItem) {
      const newSentenceStripsItem = sentenceStripsProgramItem.cloneNode(true);
      sentenceStripsProgramItem.parentNode.replaceChild(
        newSentenceStripsItem,
        sentenceStripsProgramItem
      );

      newSentenceStripsItem.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openSentenceStripsModal();
      });
    }
  }, 500);
});

console.log("sentence-strips.js fully loaded");
