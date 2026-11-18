
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
    newSheet.setAttribute("aria-hidden", "false");
    newSheet.style.display = "flex";
    document.body.classList.add("sheet-open");
  }

  // CLOSE CREATION MENU
  function closeCreationMenu() {
    if (!newSheet) return;

    newSheet.classList.remove("open");
    newSheet.setAttribute("aria-hidden", "true");
    newSheet.style.display = "";
    document.body.classList.remove("sheet-open");
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
  const templateScreen = $("#templateScreen");
  const aiGeneratorScreen = $("#aiGeneratorScreen");
  const backTemplates = $("#backTemplates");

  // Open AI Slides from dashboard or creation menu
  $$('[data-open="slides"]').forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();

      closeCreationMenu();

      templateScreen?.classList.add("open");
      templateScreen?.setAttribute("aria-hidden", "false");

      aiGeneratorScreen?.classList.remove("open");
    });
  });


  // OPEN SLIDES FROM THE PLUS CREATION MENU
  $$('[data-create="Slides"]').forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();

      closeCreationMenu();

      templateScreen?.classList.add("open");
      templateScreen?.setAttribute("aria-hidden", "false");

      aiGeneratorScreen?.classList.remove("open");
    });
  });

  // Return from templates to Home
  backTemplates?.addEventListener("click", () => {
    templateScreen?.classList.remove("open");
    templateScreen?.setAttribute("aria-hidden", "true");
  });

  // OPEN AI GENERATOR
  function openAIGenerator(templateName) {
    const templateSelect = $("#aiSlideTemplate");

    if (templateSelect && templateName) {
      templateSelect.value = templateName;
    }

    templateScreen?.classList.remove("open");
    templateScreen?.setAttribute("aria-hidden", "true");

    aiGeneratorScreen?.classList.add("open");
  }
 

  // OPEN THE EXISTING PRESENTATION EDITOR
  function openPresentationEditor(templateName) {

    const templateSelect = $("#template");
    const newDeckButton = $("#newDeck");
    const applyTemplateButton = $("#applyTemplate");

    if (templateName && templateSelect) {
      templateSelect.value = templateName;
    }

    templateScreen?.classList.remove("open");
    templateScreen?.setAttribute("aria-hidden", "true");

    aiGeneratorScreen?.classList.remove("open");

    // Create a new presentation using existing editor logic
    newDeckButton?.click();

    // Apply the selected presentation design
    if (templateName && applyTemplateButton) {
      applyTemplateButton.click();
    }

    document.body.classList.remove("home-mode");
    document.body.classList.add("editor-mode");
  }

  // BLANK PRESENTATION
  $("#blankTemplate")?.addEventListener("click", () => {
    openPresentationEditor("mint-pro");
  });

  // SELECT A PRESENTATION TEMPLATE
  $$("[data-template]").forEach(button => {
    button.addEventListener("click", () => {
      openPresentationEditor(button.dataset.template);
    });
  });

  
  // BACK FROM AI GENERATOR TO TEMPLATES
  $("#backAIGenerator")?.addEventListener("click", () => {
    aiGeneratorScreen?.classList.remove("open");

    templateScreen?.classList.add("open");
    templateScreen?.setAttribute("aria-hidden", "false");
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

  
  // PLUS BUTTON
  newButton?.addEventListener("click", event => {
    event.preventDefault();
    openCreationMenu();
  });

  // CLOSE BUTTON
  $("#closeNew")?.addEventListener("click", closeCreationMenu);

  // CLOSE WHEN BACKDROP IS TAPPED
  newSheet?.addEventListener("click", event => {
    if (event.target === newSheet) {
      closeCreationMenu();
    }
  });

  // ESCAPE KEY CLOSES MENU
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
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
