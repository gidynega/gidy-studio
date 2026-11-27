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


  // =====================================
  // GIDY SCAN — INDEPENDENT NAVIGATION
  // =====================================

  function handleScanNavigation(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    closeCreationMenu();

    if (typeof window.openScan === "function") {
      window.openScan();
    } else {
      console.error("Gidy Scan JavaScript is not loaded.");
    }
  }

  // Scan from the New menu
  $$('[data-tool="Scan"]').forEach(button => {
    button.addEventListener("click", handleScanNavigation);
  });

  // Scan from bottom navigation
  $$('[data-nav="Scan"]').forEach(button => {
    button.addEventListener("click", handleScanNavigation);
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

  
  // =====================================
  // GIDY SHEETS — INDEPENDENT NAVIGATION
  // =====================================

  const sheetsScreen = $("#sheetsScreen");
  const docsScreen = $("#docsScreen");
  const sheetsBackHome = $("#sheetsBackHome");
  const homeBottomNav = $(".home-bottom-nav");
  const presentationHeader = $(".top");
  const presentationLayout = $(".layout");
  const presentationFooter = $(".bottom");

  // OPEN SHEETS FROM THE PLUS MENU
  $$('[data-create="Sheets"]').forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();

      closeCreationMenu();

      templateScreen?.classList.remove("open");
      templateScreen?.setAttribute("aria-hidden", "true");

      aiGeneratorScreen?.classList.remove("open");
      docsScreen?.setAttribute("hidden", "");

      home.hidden = true;

      if (homeBottomNav) homeBottomNav.hidden = true;

      if (presentationHeader) presentationHeader.hidden = true;
      if (presentationLayout) presentationLayout.hidden = true;
      if (presentationFooter) presentationFooter.hidden = true;

      if (sheetsScreen) sheetsScreen.hidden = false;

      document.body.classList.remove("home-mode");
      document.body.classList.remove("editor-mode");
      document.body.classList.add("sheets-mode");

      console.log("Gidy Sheets opened.");
    });
  });

  // RETURN FROM SHEETS TO HOME
  sheetsBackHome?.addEventListener("click", () => {
    if (sheetsScreen) sheetsScreen.hidden = true;

    home.hidden = false;

    if (homeBottomNav) homeBottomNav.hidden = false;

    if (presentationHeader) presentationHeader.hidden = false;
    if (presentationLayout) presentationLayout.hidden = false;
    if (presentationFooter) presentationFooter.hidden = false;

    document.body.classList.remove("sheets-mode");
    document.body.classList.remove("editor-mode");
    document.body.classList.add("home-mode");
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


  // =====================================
  // HOME DASHBOARD — FILE MANAGEMENT
  // =====================================

  const workspaceTabs = $$("#workspaceTabs button[data-filter]");
  const listView = $("#listView");
  const gridView = $("#gridView");
  const searchInput = $("#homeSearch");
  const sortButton = $("#sortFiles");

  let activeFilter = "device";
  let activeView = "list";
  let sortMode = "newest";

  function getHomeFiles() {
    try {
      const files = JSON.parse(
        localStorage.getItem("gidyStudioFiles")
      );
      return Array.isArray(files) ? files : [];
    } catch {
      return [];
    }
  }

  function getFileName(element) {
    return element.querySelector(".file-details b")
      ?.textContent.trim() || "";
  }

  function getFileRecord(element, files) {
    const name = getFileName(element);
    return files.find(file => file.name === name);
  }

  function setView(view) {
    activeView = view;

    if (!fileList) return;

    const isGrid = view === "grid";

    fileList.dataset.view = view;
    fileList.style.display = isGrid ? "grid" : "block";
    fileList.style.gridTemplateColumns = isGrid
      ? "repeat(2, minmax(0, 1fr))"
      : "";

    $$(".home-file", fileList).forEach(file => {
      file.style.borderRadius = isGrid ? "12px" : "0";
      file.style.padding = isGrid ? "14px 8px" : "13px 4px";
      file.style.border = isGrid
        ? "1px solid #283550"
        : "0";
      file.style.borderBottom = "1px solid #283550";
    });

    listView?.classList.toggle("active", !isGrid);
    gridView?.classList.toggle("active", isGrid);
  }

  function sortHomeFiles(elements, files) {
    return [...elements].sort((a, b) => {
      const fileA = getFileRecord(a, files);
      const fileB = getFileRecord(b, files);

      if (sortMode === "name") {
        return getFileName(a).localeCompare(getFileName(b));
      }

      const dateA = new Date(
        fileA?.updated || fileA?.created || 0
      ).getTime();

      const dateB = new Date(
        fileB?.updated || fileB?.created || 0
      ).getTime();

      return sortMode === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });
  }

  function applyHomeFilters() {
    if (!fileList) return;

    const files = getHomeFiles();
    const query = (searchInput?.value || "").toLowerCase().trim();

    const elements = $$(".home-file", fileList);
    const emptyNote = $(".home-empty-note", fileList);

    // Shared files are not yet connected to cloud storage.
    const shared = activeFilter === "shared";

    elements.forEach(element => {
      const record = getFileRecord(element, files);
      const name = getFileName(element);

      const matchesSearch = element.textContent
        .toLowerCase()
        .includes(query);

      let matchesFilter = true;

      if (activeFilter === "starred") {
        matchesFilter = !!record?.starred;
      }

      if (shared) {
        matchesFilter = false;
      }

      element.hidden = !matchesSearch || !matchesFilter;
    });

    // Sort visible files.
    const visible = elements.filter(element => !element.hidden);
    const sorted = sortHomeFiles(visible, files);

    sorted.forEach(element => fileList.appendChild(element));

    // Empty-state message.
    let emptyState = $("#homeFilterEmptyState");

    if (!emptyState) {
      emptyState = document.createElement("div");
      emptyState.id = "homeFilterEmptyState";
      emptyState.className = "home-empty-note";
      fileList.appendChild(emptyState);
    }

    emptyState.hidden = visible.length > 0;

    if (shared) {
      emptyState.textContent =
        "Shared files will appear here when cloud sharing is connected.";
    } else if (query) {
      emptyState.textContent = "No matching files found.";
    } else if (activeFilter === "starred") {
      emptyState.textContent =
        "You haven't starred any files yet.";
    } else {
      emptyState.textContent =
        "Your saved files will appear here.";
    }

    if (emptyNote) {
      emptyNote.hidden = true;
    }

    const count = $("#fileCount");

    if (count) {
      const labels = {
        device: "Files on this device",
        recent: "Recent files",
        shared: "Shared files",
        starred: "Starred files"
      };

      count.textContent = labels[activeFilter] +
        " (" + visible.length + ")";
    }

    setView(activeView);
  }

  // WORKSPACE FILTER BUTTONS
  workspaceTabs.forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;

      workspaceTabs.forEach(tab => {
        tab.classList.toggle("active", tab === button);
      });

      applyHomeFilters();
    });
  });

  // LIST VIEW
  listView?.addEventListener("click", () => {
    setView("list");
  });

  // GRID VIEW
  gridView?.addEventListener("click", () => {
    setView("grid");
  });

  // SEARCH
  searchInput?.addEventListener("input", () => {
    applyHomeFilters();
  });

  // SORT FILES
  sortButton?.addEventListener("click", () => {
    const modes = ["newest", "oldest", "name"];

    const currentIndex = modes.indexOf(sortMode);
    sortMode = modes[(currentIndex + 1) % modes.length];

    const labels = {
      newest: "↕ Newest",
      oldest: "↕ Oldest",
      name: "↕ Name A–Z"
    };

    sortButton.textContent = labels[sortMode];

    applyHomeFilters();
  });

  // Initial dashboard state
  applyHomeFilters();

  // =====================================
  // HOME PROFILE SHORTCUT
  // =====================================

  $("#profileButton")?.addEventListener("click", () => {
    const meButton = $('[data-nav="Me"]');
    meButton?.click();
  });

  // =====================================
  // STORAGE & BACKUP INFORMATION
  // =====================================

  const storageButton = $("#notificationsButton");

  storageButton?.addEventListener("click", () => {
    const files = getHomeFiles();

    let panel = $("#homeStoragePanel");

    if (!panel) {
      panel = document.createElement("div");
      panel.id = "homeStoragePanel";

      panel.style.cssText = `
        position:fixed;
        inset:0;
        z-index:99999;
        background:rgba(0,0,0,.78);
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
      `;

      const card = document.createElement("section");

      card.style.cssText = `
        width:100%;
        max-width:420px;
        padding:24px;
        border-radius:22px;
        background:#101a2b;
        color:#f5f7ff;
        border:1px solid #34435f;
      `;

      card.innerHTML = `
        <h2>Storage & Backup</h2>
        <p id="storageFileCount"></p>
        <p>Storage location: This device</p>
        <p>Cloud synchronization: Not connected</p>
        <p style="color:#9eabc5;font-size:13px">
          Your existing projects are stored locally
          in this browser.
        </p>
        <button id="storageOpenFiles">Open Files</button>
        <button id="storageClose">Close</button>
      `;

      panel.appendChild(card);
      document.body.appendChild(panel);

      $("#storageClose", panel).addEventListener("click", () => {
        panel.style.display = "none";
      });

      $("#storageOpenFiles", panel).addEventListener("click", () => {
        panel.style.display = "none";
        $('[data-nav="Files"]')?.click();
      });

      panel.addEventListener("click", event => {
        if (event.target === panel) {
          panel.style.display = "none";
        }
      });
    }

    $("#storageFileCount", panel).textContent =
      "Saved presentation projects: " + files.length;

    panel.style.display = "flex";
  });

  // =====================================
  // HOME DASHBOARD UPGRADE COMPLETE
  // =====================================

  console.log("Gidy Studio Home initialized successfully.");
});