// Tacting program implementation
console.log("tacting.js starting execution");

// Track program state
let activeProgram = null;
let selectedStimuli = [];
let targetStimulus = null;
let fieldSize = 2;

// Function to open the Tacting configuration modal
function openTactingModal() {
  console.log("openTactingModal function called");

  // Set the active program type
  activeProgram = "Tacting / Rec. ID";

  // Reset selections
  selectedStimuli = [];
  targetStimulus = null;

  const modal = document.getElementById("stimulusModal");
  if (!modal) {
    console.error("Stimulus modal not found");
    return;
  }
  
  // Clean up any First/Then specific UI and classes
  modal.classList.remove("first-then-modal");
  const firstThenStatus = modal.querySelector('.first-then-status');
  if (firstThenStatus) firstThenStatus.remove();
  
  const firstThenPreview = modal.querySelector('.first-then-preview');
  if (firstThenPreview) firstThenPreview.remove();
  
  // Remove any First/Then specific classes
  modal.querySelectorAll('.icon-item.first-selected, .icon-item.then-selected').forEach(item => {
    item.classList.remove('first-selected', 'then-selected');
  });

  // Update modal title to Tacting / Rec. ID
  const modalTitle = modal.querySelector(".modal-header h2");
  if (modalTitle) {
    modalTitle.textContent = "Tacting / Rec. ID";
  }

  // Show the modal
  modal.style.display = "block";
  document.body.style.overflow = "hidden";

  //this is for icon search
  const search = document.querySelector(".search-icons input");

  search.addEventListener("input", (e) => {
    const searchValue = search.value.toLowerCase().trim();
    const allItems = document.querySelectorAll(".icon-item");
    const allHeaders = document.querySelectorAll(".category-header");

    allHeaders.forEach((header) => (header.style.display = "none"));

    allItems.forEach((item) => {
      const itemName = item.getAttribute("data-name");

      if (itemName && itemName.toLowerCase().includes(searchValue)) {
        item.style.display = "flex";

        const categoryContainer = item.parentElement;
        const categoryHeader = categoryContainer.previousElementSibling;
        if (
          categoryHeader &&
          categoryHeader.classList.contains("category-header")
        ) {
          categoryHeader.style.display = "inline";
        }
      } else {
        item.style.display = "none";
      }
    });
  });

  // Set up icon selection handlers
  setupIconSelectionHandlers(modal);

  // Set up target selection button
  setupTargetSelectionHandler(modal);

  // Set up field size input
  setupFieldSizeHandler(modal);

  // Set up Done button handler
  setupDoneButtonHandler(modal);
}

// Function to set up the Done button handler
function setupDoneButtonHandler(modal) {
  const doneButton = modal.querySelector(".done-btn");
  const programTitleInput = modal.querySelector("#programTitleInput");
  const fieldSizeInput = modal.querySelector(".field-size-selector input");

  // Remove any existing event listeners
  const newDoneButton = doneButton.cloneNode(true);
  doneButton.parentNode.replaceChild(newDoneButton, doneButton);

  // Add new event listener
  newDoneButton.addEventListener("click", () => {
    // Add loading state
    modal.classList.add("loading");

    // Validate selections
    if (selectedStimuli.length === 0) {
      modal.classList.remove("loading");
      showErrorMessage(modal, "Please select at least one stimulus");
      return;
    }

    // Use single item as target when no target is explicitly selected
    if (!targetStimulus && selectedStimuli.length === 1) {
      targetStimulus = selectedStimuli[0];
    }

    fieldSize = parseInt(fieldSizeInput.value) || 2;
    if (fieldSize < 1) fieldSize = 1;
    if (fieldSize > 6) fieldSize = 6;

    console.log(
      "Creating Tacting / Rec. ID program with stimuli:",
      selectedStimuli.length,
      "target:",
      targetStimulus?.alt
    );

    // Create a new tab using the shared functionality
    let programName = activeProgram;

    // Determine default tab name
    const tabCount =
      document.querySelectorAll(`.tab[data-program="${programName}"]`).length +
      1;
    const defaultTabName = `${programName} ${tabCount}`;
    // Use title field for custom name
    const newTabName = programTitleInput.value.trim() || defaultTabName;
    // Slugify for ID
    function slugify(text) {
      return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "");
    }
    const tabId = slugify(newTabName);

    const programTabs = document.querySelector(".program-tabs");
    const newTab = document.createElement("div");
    newTab.className = "tab";
    newTab.setAttribute("data-program", programName);
    newTab.setAttribute("id", tabId);
    newTab.innerHTML = `${newTabName}<span class="close-tab">×</span>`;

    // Store program configuration in the global programConfigs
    window.programConfigs[tabId] = {
      type: programName,
      stimuli: [...selectedStimuli],
      target: targetStimulus,
      fieldSize: fieldSize,
      currentIndex: 0,
      randomized: false,
    };

    // Debug log to confirm program configuration was stored
    console.log("Stored program configuration:", {
      tabId,
      type: programName,
      stimuliCount: selectedStimuli.length,
      target: targetStimulus ? targetStimulus.alt : "none",
    });

    // Add the tab to the tab bar
    programTabs.appendChild(newTab);

    // Activate the new tab
    if (window.activateTab) {
      window.activateTab(newTab);
    }

    // Set up the tab's close button
    const newCloseButton = newTab.querySelector(".close-tab");
    newCloseButton.addEventListener("click", (e) => {
      e.stopPropagation();
      
      // Check if this was the active tab before removing
      const wasActive = newTab.classList.contains('active');
      
      // Clean up program configuration
      delete window.programConfigs[tabId];
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
        
        const firstAvailableTab = document.querySelector(".tab");
        if (firstAvailableTab && window.activateTab) {
          window.activateTab(firstAvailableTab);
        } else {
          // No tabs left, update content to show empty message
          if (window.updateProgramContent) {
            window.updateProgramContent();
          }
        }
      }

      // Update program stars since a program was removed from queue
      if (window.updateProgramStars) {
        window.updateProgramStars();
      }
    });

    // Make the tab clickable to activate it
    newTab.addEventListener("click", () => {
      if (window.activateTab) {
        window.activateTab(newTab);
      }
    });

    // Close the modal with success animation
    newDoneButton.classList.add("button-success");

    setTimeout(() => {
      modal.classList.remove("loading");
      
      // Use the main closeModal function to ensure filters are reset
      if (window.closeModal) {
        window.closeModal();
      } else {
        // Fallback if closeModal is not available
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        
        // Reset selections
        selectedStimuli = [];
        targetStimulus = null;

        // Clear title input
        const programTitleInput = modal.querySelector("#programTitleInput");
        if (programTitleInput) programTitleInput.value = "";

        // Reset field size input
        const fieldSizeInput = modal.querySelector(".field-size-selector input");
        if (fieldSizeInput) fieldSizeInput.value = "2";

        // Reset selections in the UI
        modal
          .querySelectorAll(".icon-item.selected, .icon-item.target")
          .forEach((item) => {
            item.classList.remove("selected", "target");
          });

        // Clear any error messages
        clearErrorMessages(modal);
      }
    }, 800);
  });
}

// Function to set up icon selection handlers
function setupIconSelectionHandlers(modal) {
  // Get all icon items in the modal
  const iconItems = modal.querySelectorAll(".icon-item");

  // Add click handler to each icon item
  iconItems.forEach((item) => {
    // Clone the item to remove any existing listeners
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);

    // Add click event listener
    newItem.addEventListener("click", () => {
      // Check if we're clicking on a target stimulus to deselect it
      if (newItem.classList.contains("target") && !document.body.classList.contains("selecting-target")) {
        // Add click animation
        newItem.style.transform = "scale(0.95)";
        setTimeout(() => {
          newItem.style.transform = "";
        }, 150);

        // Deselect the target
        newItem.classList.remove("target");
        targetStimulus = null;
        console.log("✗ Target deselected");

        // Add deselection feedback
        showSelectionFeedback(newItem, "✗", "#f44336");
        
        return; // Exit early to avoid normal selection logic
      }

      // Only handle selection if not in target selection mode
      if (!document.body.classList.contains("selecting-target")) {
        // Add click animation
        newItem.style.transform = "scale(0.95)";
        setTimeout(() => {
          newItem.style.transform = "";
        }, 150);

        newItem.classList.toggle("selected");

        const img = newItem.querySelector("img");
        const imgSrc = img.src;
        const imgAlt = img.alt;

        if (newItem.classList.contains("selected")) {
          // Add to selected stimuli
          selectedStimuli.push({ src: imgSrc, alt: imgAlt });
          console.log(`✓ Selected: ${imgAlt}`);

          // Add success feedback
          showSelectionFeedback(newItem, "✓", "#4CAF50");
        } else {
          // Remove from selected stimuli
          selectedStimuli = selectedStimuli.filter(
            (stimulus) => stimulus.src !== imgSrc
          );
          console.log(`✗ Deselected: ${imgAlt}`);

          // Add removal feedback
          showSelectionFeedback(newItem, "✗", "#f44336");

          // If this was the target and it's been deselected, clear target
          if (targetStimulus && targetStimulus.src === imgSrc) {
            targetStimulus = null;
            newItem.classList.remove("target");
          }
        }
      }
    });
  });
}

// Function to set up target selection button
function setupTargetSelectionHandler(modal) {
  const selectTargetButton = modal.querySelector(".select-target-btn");
  if (!selectTargetButton) return;

  // Clone the button to remove any existing listeners
  const newSelectTargetButton = selectTargetButton.cloneNode(true);
  selectTargetButton.parentNode.replaceChild(
    newSelectTargetButton,
    selectTargetButton
  );

  // Add click event listener
  newSelectTargetButton.addEventListener("click", () => {
    // Change button appearance to indicate "selection mode"
    newSelectTargetButton.textContent = "🎯 Click an icon to set as target";
    newSelectTargetButton.style.cssText = `
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%) !important;
            color: white !important;
            transform: scale(1.05) !important;
            box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4) !important;
        `;
    document.body.classList.add("selecting-target");

    // Clear any existing target selections
    modal.querySelectorAll(".icon-item.target").forEach((item) => {
      item.classList.remove("target");
    });

    // Create one-time event listener for the document
    const selectTargetHandler = (e) => {
      // Find the clicked icon-item (if any)
      const iconItem = e.target.closest(".icon-item");
      if (!iconItem) return;

      // Remove selection mode
      document.body.classList.remove("selecting-target");
      document.removeEventListener("click", selectTargetHandler);

      // Reset button appearance with success feedback
      newSelectTargetButton.textContent = "✓ Target Selected";
      newSelectTargetButton.style.cssText = `
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%) !important;
                color: white !important;
                transform: scale(1) !important;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3) !important;
            `;

      // Reset to original state after 2 seconds
      setTimeout(() => {
        newSelectTargetButton.textContent = "Select Target Stimulus";
        newSelectTargetButton.style.cssText = `
                    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%) !important;
                    color: white !important;
                    transform: scale(1) !important;
                    box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3) !important;
                `;
      }, 2000);

      // Clear any existing target
      modal.querySelectorAll(".icon-item.target").forEach((item) => {
        item.classList.remove("target");
      });

      // Set new target
      iconItem.classList.add("target");
      targetStimulus = {
        src: iconItem.querySelector("img").src,
        alt: iconItem.querySelector("img").alt,
      };

      // Also select this item if it wasn't already selected
      if (!iconItem.classList.contains("selected")) {
        iconItem.classList.add("selected");
        selectedStimuli.push({
          src: targetStimulus.src,
          alt: targetStimulus.alt,
        });
      }

      console.log("Target set:", targetStimulus.alt);

      // Prevent event bubbling
      e.stopPropagation();
    };

    // Add the one-time document click listener
    document.addEventListener("click", selectTargetHandler);
  });
}

// Function to set up field size input
function setupFieldSizeHandler(modal) {
  const fieldSizeInput = modal.querySelector(".field-size-selector input");
  if (!fieldSizeInput) return;

  // Clone the input to remove any existing listeners
  const newFieldSizeInput = fieldSizeInput.cloneNode(true);
  fieldSizeInput.parentNode.replaceChild(newFieldSizeInput, fieldSizeInput);

  // Add change event listener
  newFieldSizeInput.addEventListener("change", (e) => {
    fieldSize = parseInt(e.target.value);
    if (fieldSize < 1) fieldSize = 1;
    if (fieldSize > 6) fieldSize = 6;
    e.target.value = fieldSize;
  });
}

// Function to render a Tacting program in the content area
function renderTactingProgram(config, stimulusDisplay) {
  // Tacting: show a grid of stimuli (target optional)
  const stimuli = config.stimuli || [];
  const target = config.target; // Don't default to first stimulus anymore
  const total = Math.max(1, config.fieldSize);

  let displayStimuli = [];

  if (target) {
    // Traditional behavior with target stimulus
    // Filter out target for distractors
    let distractors = stimuli.filter((s) => s.src !== target.src);

    // Always shuffle distractors to randomize display
    distractors.sort(() => Math.random() - 0.5);

    // Select required number of distractors
    const needed = Math.max(0, total - 1);
    const selectedDistractors = distractors.slice(0, needed);

    // Combine and shuffle all items, but always include the target
    displayStimuli = [...selectedDistractors, target];
  } else {
    // No target specified - just show random selection from all stimuli
    let shuffledStimuli = [...stimuli];
    shuffledStimuli.sort(() => Math.random() - 0.5);

    // Select up to fieldSize stimuli
    displayStimuli = shuffledStimuli.slice(0, total);
  }

  // Randomize the position of all stimuli
  displayStimuli.sort(() => Math.random() - 0.5);

  // Hide any prompt text for Tacting
  const promptEl = document.querySelector(".prompt-text");
  if (promptEl) promptEl.style.display = "none";

  // Render grid
  stimulusDisplay.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "receptive-grid";
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${total}, 1fr)`;
  grid.style.gap = "10px";
  grid.style.width = "100%";

  displayStimuli.forEach((item) => {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt;
    img.style.width = "100%";
    img.style.height = "auto";
    img.style.objectFit = "contain";
    grid.appendChild(img);
  });

  stimulusDisplay.appendChild(grid);
}

// Add click event handler for the Next button
function handleNextButtonClick(config, updateProgramContent) {
  // For Tacting, we just refresh the display with randomized positions
  updateProgramContent();
}

// Utility function to show error messages
function showErrorMessage(modal, message) {
  // Remove any existing error messages
  clearErrorMessages(modal);

  // Create error message element
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message modal-error";
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
        color: #d32f2f !important;
        padding: 16px 20px !important;
        margin: 16px 0 !important;
        border: 2px solid #ffcdd2 !important;
        border-radius: 12px !important;
        background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%) !important;
        text-align: center !important;
        font-weight: 600 !important;
        font-size: 16px !important;
        animation: errorShake 0.5s ease !important;
        box-shadow: 0 4px 12px rgba(211, 47, 47, 0.2) !important;
    `;

  // Add shake animation
  const style = document.createElement("style");
  style.textContent = `
        @keyframes errorShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
  document.head.appendChild(style);

  // Insert at the top of modal body
  const modalBody = modal.querySelector(".modal-body");
  modalBody.insertBefore(errorDiv, modalBody.firstChild);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (errorDiv && errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 4000);
}

// Utility function to clear error messages
function clearErrorMessages(modal) {
  modal.querySelectorAll(".modal-error").forEach((error) => {
    error.remove();
  });
}

// Make functions available globally
window.openTactingModal = openTactingModal;
window.renderTactingProgram = renderTactingProgram;
window.tactingHandleNextClick = handleNextButtonClick;

// Register this program module
if (window.registerProgramModule) {
  window.registerProgramModule(
    "Tacting / Rec. ID",
    renderTactingProgram,
    handleNextButtonClick
  );
} else {
  console.error("Program registration system not available");
}

// Add a debug function to test modal opening directly
window.testModalOpen = function () {
  console.log("Testing modal open directly...");
  const modal = document.getElementById("stimulusModal");
  if (modal) {
    modal.style.display = "block";
    console.log("Modal display set to block");
  } else {
    console.error("Modal not found!");
  }
};

// Initialize event listeners after DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("tacting.js DOMContentLoaded event fired");

  // Add a delay to ensure all other scripts have loaded
  setTimeout(() => {
    console.log("Setting up Tacting program event listener with delay...");

    // Get reference to the Tacting / Rec. ID program item in the sidebar
    const tactingProgramItem = Array.from(
      document.querySelectorAll(".program-item")
    ).find((item) => {
      const h3 = item.querySelector(".program-details h3");
      console.log("Found program item:", h3?.textContent);
      return h3?.textContent?.trim() === "Tacting / Rec. ID";
    });

    console.log("Found Tacting program item:", tactingProgramItem);

    if (tactingProgramItem) {
      console.log("Attaching click listener to Tacting / Rec. ID program item");

      // Remove any existing click listeners by cloning the element
      const newTactingItem = tactingProgramItem.cloneNode(true);
      tactingProgramItem.parentNode.replaceChild(
        newTactingItem,
        tactingProgramItem
      );

      // Add click listener that calls our openTactingModal function
      newTactingItem.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Tacting / Rec. ID program item clicked! Opening modal...");
        openTactingModal();
      });

      // Test the modal opening function directly
      console.log(
        "Testing modal function availability:",
        typeof openTactingModal
      );
    } else {
      console.error(
        "Could not find Tacting / Rec. ID program item in the sidebar"
      );

      // Debug: List all program items
      document.querySelectorAll(".program-item").forEach((item, index) => {
        const h3 = item.querySelector(".program-details h3");
        console.log(`Program item ${index}: "${h3?.textContent}"`);
      });
    }
  }, 500); // 500ms delay to ensure other scripts have loaded

  // Debug button has been removed
});

console.log("tacting.js fully loaded");
