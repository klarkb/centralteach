// DOM Elements
//this is for the seach program
function searchPrograms(text) {
  const programs = document.querySelectorAll(".program-item");

  programs.forEach((program) => {
    const programItems = program.textContent;

    if (programItems.includes(text)) {
      program.style.display = "flex";
    } else {
      program.style.display = "none";
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Program selection
  const programItems = document.querySelectorAll(".program-item");
  const programTabs = document.querySelector(".program-tabs");
  const closeTabButtons = document.querySelectorAll(".close-tab");

  // Modal elements
  const modal = document.getElementById("stimulusModal");
  const openModalButtons = document.querySelectorAll(".program-item");
  const closeModalButton = document.querySelector(".close-modal");
  const doneButton = document.querySelector(".done-btn");

  // Create a global reference to the New Target Modal
  let activeNewTargetModal = null;
  const iconItems = document.querySelectorAll(".icon-item");
  const selectTargetButton = document.querySelector(".select-target-btn");

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

  // Expose functions to be used by program modules
  window.activateTab = activateTab;
  window.updateProgramStars = updateProgramStars;
  window.programConfigs = programConfigs;
  window.updateProgramContent = updateProgramContent;
  window.openEditModal = openEditModal;

  // Function placeholder for grid population - now handled in HTML
  function populateIconGrid(categories) {
    // Intentionally empty - grid is statically defined in HTML
  }

  // Helper function to create icon items
  function createIconItem(src, alt) {
    const iconItem = document.createElement("div");
    iconItem.className = "icon-item";

    // Create the image element
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;

    // Handle image load errors gracefully
    img.onerror = () => {
      console.warn(`Image failed to load: ${src}. Using fallback.`);
      // Try to determine which category this is from to use a specific fallback
      let fallbackSrc = "assets/Food/apple.png";
      if (src.includes("Animal")) fallbackSrc = "assets/Animals/cat.png";
      else if (src.includes("Food")) fallbackSrc = "assets/Food/apple.png";
      else if (src.includes("Cloth")) fallbackSrc = "assets/Clothing/hat.png";

      img.src = fallbackSrc;
      // Keep the original alt text but note it's a fallback
      img.alt = `${alt} (Fallback)`;
    };

    iconItem.appendChild(img);

    // Add click event for selection when not in target selection mode
    iconItem.addEventListener("click", () => {
      if (!document.body.classList.contains("selecting-target")) {
        iconItem.classList.toggle("selected");

        if (iconItem.classList.contains("selected")) {
          // Get the current src and alt after potential fallback occurred
          selectedStimuli.push({ src: img.src, alt: img.alt });
          console.log("Selected stimulus:", img.alt, img.src);
        } else {
          selectedStimuli = selectedStimuli.filter(
            (stimulus) => stimulus.src !== img.src
          );

          // If this was the target and it's been deselected, clear target
          if (targetStimulus && targetStimulus.src === img.src) {
            targetStimulus = null;
            iconItem.classList.remove("target");
          }
        }
      }
    });

    return iconItem;
  }

  // Initialize original hardcoded icon items before they get replaced
  document.querySelectorAll(".icon-item").forEach((item) => {
    const img = item.querySelector("img");

    // Set up click handler for selection
    item.addEventListener("click", () => {
      if (!document.body.classList.contains("selecting-target")) {
        item.classList.toggle("selected");

        const imgSrc = img.src;
        const imgAlt = img.alt;

        if (item.classList.contains("selected")) {
          selectedStimuli.push({ src: imgSrc, alt: imgAlt });
          console.log(`Selected: ${imgAlt} (${imgSrc})`);
        } else {
          selectedStimuli = selectedStimuli.filter(
            (stimulus) => stimulus.src !== imgSrc
          );

          // If this was the target and it's been deselected, clear target
          if (targetStimulus && targetStimulus.src === imgSrc) {
            targetStimulus = null;
            item.classList.remove("target");
          }
        }
      }
    });
  });

  // --- FIX: Ensure icon selection/deselection works after filtering ---
  document.querySelectorAll('.icon-item').forEach((item) => {
    item.onclick = function (e) {
      if (!document.body.classList.contains('selecting-target')) {
        item.classList.toggle('selected');
        const img = item.querySelector('img');
        const imgSrc = img.src;
        const imgAlt = img.alt;
        if (item.classList.contains('selected')) {
          selectedStimuli.push({ src: imgSrc, alt: imgAlt });
        } else {
          selectedStimuli = selectedStimuli.filter((stimulus) => stimulus.src !== imgSrc);
          if (targetStimulus && targetStimulus.src === imgSrc) {
            targetStimulus = null;
            item.classList.remove('target');
          }
        }
      }
    };
  });

  // Function to update star indicators based on which programs are in the queue
  function updateProgramStars() {
    programItems.forEach((item) => {
      const programName = item.querySelector(".program-details h3").textContent;
      // Check if this program type exists in any tab
      const programInQueue = Array.from(document.querySelectorAll(".tab")).some(
        (tab) => {
          const tabProgramType = tab.getAttribute("data-program");
          return programName.includes(tabProgramType);
        }
      );

      // Update the starred status based on whether it's in the queue
      if (programInQueue) {
        item.classList.add("starred");
      } else {
        item.classList.remove("starred");
      }
    });
  }

  // Call initially to set up the correct stars
  updateProgramStars();

  // Modal functionality
  function openModal(programType) {
    // Delegate to program-specific module
    console.log(
      `openModal called for program: ${programType}, delegating to program module`
    );
  }

  // After DOMContentLoaded, grab the title input
  const programTitleInput = document.getElementById("programTitleInput");

  function closeModal() {
    // Reset filters before closing main modal
    resetMainModalFilters();
    
    // Close the standard stimulus modal
    modal.style.display = "none";
    document.body.style.overflow = "auto";

    // Remove First/Then modal class if present
    modal.classList.remove("first-then-modal");

    // Close sight words modal if open
    const sightWordsModal = document.getElementById("sightWordsModal");
    if (sightWordsModal) {
      sightWordsModal.style.display = "none";
    }

    // Reset target selection mode if active
    if (document.body.classList.contains("selecting-target")) {
      document.body.classList.remove("selecting-target");
      selectTargetButton.textContent = "Select Target Stimulus";
      selectTargetButton.style.backgroundColor = "#f44336";
    }

    // Reset selections
    selectedStimuli = [];
    targetStimulus = null;

    // Remove selected and target classes from all items
    document
      .querySelectorAll(".icon-item.selected, .icon-item.target, .icon-item.first-selected, .icon-item.then-selected")
      .forEach((item) => {
        item.classList.remove("selected", "target", "first-selected", "then-selected");
      });

    // Also clean up any edit modals that might be open
    document.querySelectorAll('[id^="editModal-"]').forEach((el) => {
      document.body.removeChild(el);
    });

    // Clear title input
    programTitleInput.value = "";
  }

  // Helper function to reset main modal filters
  function resetMainModalFilters() {
    // Reset search input
    const searchInput = modal.querySelector(".search-icons input");
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Reset category buttons to "All"
    const categoryBar = modal.querySelector('.icon-category-bar');
    if (categoryBar) {
      categoryBar.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
      const allBtn = categoryBar.querySelector('[data-category="all"]');
      if (allBtn) {
        allBtn.classList.add('active');
      }
    }
    
    // Show all icons
    const iconGrid = modal.querySelector('.icon-grid');
    if (iconGrid) {
      iconGrid.querySelectorAll('.icon-item').forEach(item => {
        item.style.display = 'flex';
      });
    }
    
    // Also handle category containers if they exist
    const categoryContainers = modal.querySelectorAll('.category-container');
    categoryContainers.forEach(category => {
      const header = category.previousElementSibling;
      if (header) {
        header.style.display = 'block';
      }
      category.style.display = 'grid';
      category.querySelectorAll('.icon-item').forEach(item => {
        item.style.display = 'flex';
      });
    });
  }

  // Make closeModal available to program modules
  window.closeModal = closeModal;

  closeModalButton.addEventListener("click", closeModal);

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Select target stimulus
  selectTargetButton.addEventListener("click", () => {
    // Change button appearance to indicate "selection mode"
    selectTargetButton.textContent = "Click an item to set as target";
    selectTargetButton.style.backgroundColor = "#4CAF50";
    document.body.classList.add("selecting-target");

    // Clear any existing target selections
    document.querySelectorAll(".icon-item.target").forEach((item) => {
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

      // Reset button appearance
      selectTargetButton.textContent = "Select Target Stimulus";
      selectTargetButton.style.backgroundColor = "#f44336";

      // Clear any existing target
      document.querySelectorAll(".icon-item.target").forEach((item) => {
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

  // Update field size
  const fieldSizeInput = document.querySelector(".field-size-selector input");
  fieldSizeInput.addEventListener("change", (e) => {
    fieldSize = parseInt(e.target.value);
    if (fieldSize < 1) fieldSize = 1;
    if (fieldSize > 6) fieldSize = 6;
    e.target.value = fieldSize;
  });

  // Event listener cleanup for the done button
  if (doneButton) {
    // Remove any existing listeners to avoid conflicts
    const newDoneButton = doneButton.cloneNode(true);
    if (doneButton.parentNode) {
      doneButton.parentNode.replaceChild(newDoneButton, doneButton);
    }
  }

  // Tab functionality
  function activateTab(tab) {
    // Remove active class from all tabs
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.remove("active");
    });

    // Add active class to clicked tab
    tab.classList.add("active");

    // Update the main content area based on the active tab
    updateProgramContent();
  }

  // Set up initial tab functionality
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activateTab(tab);
    });
  });

  closeTabButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const tab = button.parentElement;
      tab.remove();

      // If this was the active tab, activate the first available tab
      if (tab.classList.contains("active")) {
        const firstAvailableTab = document.querySelector(".tab");
        if (firstAvailableTab) {
          activateTab(firstAvailableTab);
        }
      }
    });
  });

  // CATEGORY FILTERING FOR ICON MENU
  const categoryBar = document.querySelector('.icon-category-bar');
  const iconGrid = document.querySelector('.icon-grid');
  // --- Fix icon grid filtering to use display: none for hiding, so grid reflows naturally ---
  if (categoryBar && iconGrid) {
    categoryBar.addEventListener('click', (e) => {
      if (e.target.classList.contains('category-btn')) {
        // Set active button
        categoryBar.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        const cat = e.target.getAttribute('data-category');
        // Show/hide icons using display: none for hiding
        iconGrid.querySelectorAll('.icon-item').forEach(item => {
          if (cat === 'all' || item.getAttribute('data-category') === cat) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      }
    });
  }

  // Cleanup function to remove bottom controls
  function cleanupBottomControls() {
    document
      .querySelectorAll(".bottom-controls, .program-controls")
      .forEach((el) => {
        el.remove();
      });
  }

  // Update the main content area based on the active tab
  function updateProgramContent() {
    // Clean up any existing controls first
    cleanupBottomControls();

    const activeTab = document.querySelector(".tab.active");
    const emptyMessage = document.getElementById("empty-program-message");
    const programDisplay = document.getElementById("program-display");

    // If no active tab exists, show the empty message
    if (!activeTab) {
      if (emptyMessage) emptyMessage.style.display = "block";
      if (programDisplay) programDisplay.style.display = "none";
      return;
    }

    // Hide the empty message and show program content
    if (emptyMessage) emptyMessage.style.display = "none";
    if (programDisplay) programDisplay.style.display = "block";

    const tabId = activeTab.id;
    let config = programConfigs[tabId];

    if (!config) {
      console.log("No configuration found for tab:", tabId);

      // For pre-existing tabs that don't have configurations
      const programName =
        activeTab.getAttribute("data-program") ||
        activeTab.textContent.split("×")[0].trim();

      // Show the empty message instead of placeholder content
      if (emptyMessage) emptyMessage.style.display = "block";
      if (programDisplay) programDisplay.style.display = "none";
      return;
    }

    // Fix stimulus paths before displaying
    if (window.centralDebug && window.centralDebug.fixStimulusPaths) {
      config = window.centralDebug.fixStimulusPaths(config);
    }

    // Update based on the program type
    const programType = config.type;
    const stimulusDisplay = document.querySelector(".stimulus-display");
    console.log("updateProgramContent: tab", tabId, "config", config);

    // Use the appropriate program renderer based on the program type
    if (window.programTypeRenderers[programType]) {
      window.programTypeRenderers[programType](config, stimulusDisplay);

      // Add bottom controls
      window.renderBottomControls(config, tabId);
    } else {
      console.warn("Unknown program type:", programType);
      stimulusDisplay.innerHTML = `<div class="error-message">Unknown program type: ${programType}</div>`;
    }
  }

  // Function to open edit modal for an existing program
  function openEditModal(tabId) {
    console.log("openEditModal called for tabId:", tabId);
    const config = programConfigs[tabId];
    if (!config) {
      console.error("No config found for tabId:", tabId);
      return;
    }

    // Create a clone of the original modal
    const originalModal = document.getElementById("stimulusModal");
    if (!originalModal) {
      console.error("Original stimulus modal not found");
      return;
    }

    const editModal = originalModal.cloneNode(true);
    editModal.id = "editModal-" + tabId;
    editModal.setAttribute("data-program-type", config.type); // Add program type as data attribute
    editModal.style.display = "block"; // Make sure it's visible

    // Update the modal title
    const modalTitle = editModal.querySelector(".modal-header h2");
    modalTitle.textContent = "Edit " + config.type;

    // Add close button handler
    const closeButton = editModal.querySelector(".close-modal");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        // Reset filters before closing
        resetModalFilters(editModal);
        document.body.removeChild(editModal);
        document.body.style.overflow = "auto";
      });
    }

    // Helper function to reset modal filters
    function resetModalFilters(modal) {
      // Reset search input
      const searchInput = modal.querySelector(".search-icons input");
      if (searchInput) {
        searchInput.value = '';
      }
      
      // Reset category buttons to "All"
      const categoryBar = modal.querySelector('.icon-category-bar');
      if (categoryBar) {
        categoryBar.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        const allBtn = categoryBar.querySelector('[data-category="all"]');
        if (allBtn) {
          allBtn.classList.add('active');
        }
      }
      
      // Show all icons
      const iconGrid = modal.querySelector('.icon-grid');
      if (iconGrid) {
        iconGrid.querySelectorAll('.icon-item').forEach(item => {
          item.style.display = 'flex';
        });
      }
      
      // Also handle category containers if they exist
      const categoryContainers = modal.querySelectorAll('.category-container');
      categoryContainers.forEach(category => {
        const header = category.previousElementSibling;
        if (header) {
          header.style.display = 'block';
        }
        category.style.display = 'grid';
        category.querySelectorAll('.icon-item').forEach(item => {
          item.style.display = 'flex';
        });
      });
    }

    // Set up search functionality for the edit modal
    const searchInput = editModal.querySelector(".search-icons input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        window.filterIconsBySearch(e.target.value, editModal);
      });
    }

    // Set up category filter buttons for the edit modal
    const categoryBar = editModal.querySelector('.icon-category-bar');
    const iconGrid = editModal.querySelector('.icon-grid');
    if (categoryBar && iconGrid) {
      categoryBar.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn')) {
          // Set active button
          categoryBar.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
          const cat = e.target.getAttribute('data-category');
          
          // Show/hide icons using display: none for hiding, maintain grid layout
          iconGrid.querySelectorAll('.icon-item').forEach(item => {
            if (cat === 'all' || item.getAttribute('data-category') === cat) {
              item.style.display = 'flex';
            } else {
              item.style.display = 'none';
            }
          });
        }
      });
    }

    // Set the field size
    const fieldSizeInput = editModal.querySelector(
      ".field-size-selector input"
    );
    fieldSizeInput.value = config.fieldSize;

    // Pre-fill title input with current tab name
    const titleInput = editModal.querySelector("#programTitleInput");
    const existingTab = document.getElementById(tabId);
    titleInput.value = existingTab.textContent.replace("×", "").trim();

    // Function to update the modal with current selections
    function updateSelections() {
      // Clear previous selections
      editModal.querySelectorAll(".icon-item").forEach((item) => {
        item.classList.remove("selected", "target");
      });

      // Mark selected stimuli and target
      config.stimuli.forEach((stimulus) => {
        editModal.querySelectorAll(".icon-item img").forEach((img) => {
          if (img.src === stimulus.src) {
            img.parentElement.classList.add("selected");

            // Mark as target if applicable
            if (config.target && config.target.src === stimulus.src) {
              img.parentElement.classList.add("target");
            }
          }
        });
      });
    }

    // Update initial selections
    document.body.appendChild(editModal);
    updateSelections();

    // Handle icon selection
    editModal.querySelectorAll(".icon-item").forEach((item) => {
      item.addEventListener("click", () => {
        if (!document.body.classList.contains("selecting-target")) {
          item.classList.toggle("selected");
        }
      });
    });

    // Set up target selection button
    const selectTargetBtn = editModal.querySelector(".select-target-btn");
    selectTargetBtn.addEventListener("click", () => {
      document.body.classList.add("selecting-target");
      selectTargetBtn.textContent = "Click an item to set as target";
      selectTargetBtn.style.backgroundColor = "#4CAF50";

      const targetHandler = (e) => {
        const iconItem = e.target.closest(".icon-item");
        if (!iconItem) return;

        // Clear previous targets
        editModal.querySelectorAll(".icon-item.target").forEach((el) => {
          el.classList.remove("target");
        });

        // Set new target
        iconItem.classList.add("target");
        iconItem.classList.add("selected"); // Also select it

        // Reset button
        selectTargetBtn.textContent = "Select Target Stimulus";
        selectTargetBtn.style.backgroundColor = "#f44336";
        document.body.classList.remove("selecting-target");

        // Cleanup
        document.removeEventListener("click", targetHandler);
      };

      // One-time click handler
      setTimeout(() => {
        document.addEventListener("click", targetHandler, { once: true });
      }, 0);
    });

    // Done button
    const doneBtn = editModal.querySelector(".done-btn");
    doneBtn.addEventListener("click", () => {
      // Get selected items
      const selectedItems = [];
      let targetItem = null;

      editModal.querySelectorAll(".icon-item").forEach((item) => {
        if (item.classList.contains("selected")) {
          const img = item.querySelector("img");
          const stimulus = {
            src: img.src,
            alt: img.alt,
          };
          selectedItems.push(stimulus);

          if (item.classList.contains("target")) {
            targetItem = stimulus;
          }
        }
      });

      // Validate selections
      if (selectedItems.length === 0) {
        alert("Please select at least one stimulus");
        return;
      }

      // Use single item as target when no target is explicitly selected
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
        const closeBtn = tabEl.querySelector(".close-tab");
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          delete programConfigs[tabId];
          tabEl.remove();
          if (tabEl.classList.contains("active")) {
            const firstAvailableTab = document.querySelector(".tab");
            if (firstAvailableTab) {
              activateTab(firstAvailableTab);
            }
          }
        });
      }
    });
  }
  
  // Sidebar toggle functionality
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const toggleArrow = sidebarToggle.querySelector('.toggle-arrow');
  
  // Initialize sidebar state
  let sidebarCollapsed = false;
  
  // Toggle sidebar function
  function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
    
    if (sidebarCollapsed) {
      sidebar.classList.add('collapsed');
      toggleArrow.innerHTML = '&gt;&gt;'; // Show >> when collapsed (to indicate "open")
    } else {
      sidebar.classList.remove('collapsed');
      toggleArrow.innerHTML = '&lt;&lt;'; // Show << when open (to indicate "close")
    }
    
    // Save state to localStorage
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
  }
  
  // Load saved sidebar state
  const savedState = localStorage.getItem('sidebarCollapsed');
  if (savedState === 'true') {
    sidebarCollapsed = true;
    sidebar.classList.add('collapsed');
    toggleArrow.innerHTML = '&gt;&gt;'; // Show >> when collapsed (to indicate "open")
  } else {
    toggleArrow.innerHTML = '&lt;&lt;'; // Show << when open (to indicate "close")
  }
  
  // Event listeners
  sidebarToggle.addEventListener('click', toggleSidebar);
  
  // Close sidebar when clicking overlay (mobile)
  sidebarOverlay.addEventListener('click', () => {
    if (!sidebarCollapsed) {
      toggleSidebar();
    }
  });
  
  // Handle keyboard shortcut (Ctrl/Cmd + B)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      toggleSidebar();
    }
  });
  
  // Add cleanup when page is being unloaded
  window.addEventListener('beforeunload', () => {
    if (window.cleanupProgramControls) {
      window.cleanupProgramControls();
    }
  });
});
