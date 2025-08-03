// Auto-test script to check if modals work
console.log("Auto-test script starting...");

document.addEventListener('DOMContentLoaded', function() {
  console.log("Auto-test: DOM loaded");
  
  // Test after 3 seconds
  setTimeout(() => {
    console.log("Auto-test: Testing original Sentence Strips modal...");
    
    // Try to open the original modal
    if (window.openSentenceStripsModal) {
      console.log("Auto-test: openSentenceStripsModal function found");
      try {
        window.openSentenceStripsModal();
        console.log("Auto-test: Original modal opened successfully");
      } catch (error) {
        console.error("Auto-test: Error opening original modal:", error);
      }
    } else {
      console.error("Auto-test: openSentenceStripsModal function not found");
    }
  }, 3000);
  
  // Test the test version after 6 seconds
  setTimeout(() => {
    console.log("Auto-test: Testing Sentence Strips Test modal...");
    
    // Close any open modals first
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
    
    // Try to open the test modal
    if (window.openSentenceStripsTestModal) {
      console.log("Auto-test: openSentenceStripsTestModal function found");
      try {
        window.openSentenceStripsTestModal();
        console.log("Auto-test: Test modal opened successfully");
      } catch (error) {
        console.error("Auto-test: Error opening test modal:", error);
      }
    } else {
      console.error("Auto-test: openSentenceStripsTestModal function not found");
    }
  }, 6000);
});
