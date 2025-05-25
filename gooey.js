///////////////////////////////////////////////////////
//                  GOOEY EDITS                     //
//////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////
//                  END GOOEY EDITS                 //
//////////////////////////////////////////////////////
