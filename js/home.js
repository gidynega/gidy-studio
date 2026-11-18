
/* =====================================
   GIDY STUDIO — HOME FUNCTIONALITY
===================================== */

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const home = $("#homeScreen");
  if (!home) return;

  const newButton = $("#openNew");
  const newSheet = $("#newSheet");
  const fileList = $("#homeFileList");

  // OPEN CREATION MENU
  function openCreationMenu() {
    if (!newSheet) return;
    newSheet.classList.add("open");
    newSheet.style.display = "flex";
  }

  // CLOSE CREATION MENU
  function closeCreationMenu() {
    if (!newSheet) return;
    newSheet.classList.remove("open");
    newSheet.style.display = "";
  }

  // FIND AN EXISTING TOOL
  function findTool(name) {
    const target = name.toLowerCase();

    return $$("[data-create], [data-tool]", newSheet || document)
      .find(button => {
        const value = (
          button.dataset.create ||
          button.dataset.tool ||
          button.textContent
        ).toLowerCase();

        return value.includes(target);
      });
  }

  // OPEN A TOOL THROUGH ITS EXISTING BUTTON
  function launchTool(name) {
  const tool = findTool(name);

  if (tool) {
    tool.click();
  } else {
    console.warn("Tool not found:", name);
  }
}
  
// AI SLIDES — OPEN TEMPLATE PICKER
const aiSlides = $('[data-open="slides"]');
const templateScreen = $("#templateScreen");
const backTemplates = $("#backTemplates");

aiSlides?.addEventListener("click", event => {
  event.preventDefault();

  closeCreationMenu();

  if (templateScreen) {
    templateScreen.classList.add("open");
    templateScreen.setAttribute("aria-hidden", "false");
  }
});

// BACK TO HOME
backTemplates?.addEventListener("click", () => {
  templateScreen?.classList.remove("open");
  templateScreen?.setAttribute("aria-hidden", "true");
});


  // AI TRANSLATE
  const translate = $('[data-tool="Translate"]');

  translate?.addEventListener("click", event => {
    event.preventDefault();
    launchTool("translate");
  });

  // QUICK TOOLS
  $$(".quick-tools button[data-tool]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();

      const toolName = button.dataset.tool;
      launchTool(toolName);
    });
  });

  // ORANGE PLUS BUTTON
  newButton?.addEventListener("click", event => {
    event.preventDefault();
    openCreationMenu();
  });

  // CLOSE WHEN BACKDROP ITSELF IS TAPPED
  newSheet?.addEventListener("click", event => {
    if (event.target === newSheet) {
      closeCreationMenu();
    }
  });

  // WORKSPACE FILTERS
  const workspaceTabs = $$("#workspaceTabs button[data-filter]");

  workspaceTabs.forEach(button => {
    button.addEventListener("click", () => {
      workspaceTabs.forEach(tab =>
        tab.classList.remove("active")
      );

      button.classList.add("active");

      const filter = button.dataset.filter;

      if (fileList) {
        fileList.dataset.activeFilter = filter;

        $$(".home-file", fileList).forEach(file => {
          const category =
            file.dataset.filter ||
            file.dataset.category ||
            "device";

          file.hidden =
            category !== filter &&
            !(filter === "device" && category === "device");
        });
      }
    });
  });

  // LIST VIEW
  const listView = $("#listView");
  const gridView = $("#gridView");

  function setView(view) {
    if (!fileList) return;

    fileList.dataset.view = view;

    const grid = view === "grid";

    fileList.style.display = grid ? "grid" : "block";
    fileList.style.gridTemplateColumns =
      grid ? "repeat(2, minmax(0, 1fr))" : "";

    $$(".home-file", fileList).forEach(file => {
      file.style.borderRadius = grid ? "12px" : "0";
      file.style.padding = grid ? "14px 8px" : "13px 4px";
      file.style.border = grid
        ? "1px solid #283550"
        : "0";
      file.style.borderBottom = grid
        ? "1px solid #283550"
        : "1px solid #283550";
    });

    listView?.classList.toggle("active", !grid);
    gridView?.classList.toggle("active", grid);
  }

  listView?.addEventListener("click", () => setView("list"));
  gridView?.addEventListener("click", () => setView("grid"));

  // SEARCH HOME FILES
  const searchInput = $(".home-search input");

  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    $$(".home-file", fileList || document).forEach(file => {
      file.hidden = !file.textContent.toLowerCase().includes(query);
    });
  });

  console.log("Gidy Studio Home initialized successfully.");
});
