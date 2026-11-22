/* =====================================
   GIDY STUDIO — HOME WORKSPACE & ACTIONS
   Templates • AI Studio • File Manager • Sheets
===================================== */

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, parent = document) => parent.querySelector(selector); const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  const home = $("#homeScreen");
  if (!home) return;

  const PROJECT_KEY = "gidyStudioProject";
  const FILES_KEY = "gidyStudioFiles";
  const ACTIVE_FILE_KEY = "gidyStudioActiveFileId";
  const DECK_TITLE_KEY = "gidyStudioDeckTitle";

  const newButton = $("#openNew");
  const newSheet = $("#newSheet");
  const fileList = $("#homeFileList");
  const templateScreen = $("#templateScreen");
  const aiGeneratorScreen = $("#aiGeneratorScreen");
  const actionSheet = $("#projectActionSheet");

  let selectedProjectId = null;
  let sortMode = "newest"; // "newest" | "az"
  let activeTabFilter = "device";

  function safeParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function getFiles() {
    if (window.GidyLibrary?.getFiles) return window.GidyLibrary.getFiles();
    const list = safeParse(localStorage.getItem(FILES_KEY), []);
    return Array.isArray(list) ? list : [];
  }

  function storeFiles(files) {
    if (window.GidyLibrary?.storeFiles) {
      window.GidyLibrary.storeFiles(files);
      return;
    }
    try {
      localStorage.setItem(FILES_KEY, JSON.stringify(files));
    } catch {
      // Ignore storage quota issues
    }
  }

  /* ---------- BOTTOM SHEET CONTROLS ---------- */
  function openCreationMenu() {
    if (!newSheet) return;
    newSheet.classList.add("open");
    newSheet.setAttribute("aria-hidden", "false");
    newSheet.style.display = "flex";
    document.body.classList.add("sheet-open");
  }

  function closeCreationMenu() {
    if (!newSheet) return;
    newSheet.classList.remove("open");
    newSheet.setAttribute("aria-hidden", "true");
    newSheet.style.display = "";
    document.body.classList.remove("sheet-open");
  }

  function openProjectActionSheet(file) {
    if (!actionSheet || !file) return;
    selectedProjectId = file.id;
    const titleEl = $("#projectActionTitle");
    if (titleEl) titleEl.textContent = file.name || "Presentation Options";

    const starBtn = $("#actionStarProject"); if (starBtn) { starBtn.textContent = file.starred ? "★ Remove from Starred" : "☆ Add to Starred"; }      actionSheet.classList.add("open"); actionSheet.setAttribute("aria-hidden", "false"); actionSheet.style.display = "flex"; }    function closeProjectActionSheet() { if (!actionSheet) return; actionSheet.classList.remove("open"); actionSheet.setAttribute("aria-hidden", "true"); actionSheet.style.display = ""; selectedProjectId = null; }    /* ---------- NAVIGATION HELPERS ---------- */ function switchToEditor() { closeCreationMenu(); closeProjectActionSheet(); templateScreen?.classList.remove("open"); templateScreen?.setAttribute("aria-hidden", "true"); aiGeneratorScreen?.classList.remove("open");      $$(".app-page").forEach(p => {
      p.style.display = "none";
      p.classList.remove("active");
    });

    document.body.classList.remove("home-mode");
    document.body.classList.add("editor-mode");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openPresentationEditor(templateName, customTitle) {
    const templateSelect = $("#template");
    const newDeckButton = $("#newDeck");
    const applyTemplateButton = $("#applyTemplate");

    localStorage.removeItem(ACTIVE_FILE_KEY);
    if (customTitle) {
      localStorage.setItem(DECK_TITLE_KEY, customTitle);
    } else {
      localStorage.removeItem(DECK_TITLE_KEY);
    }

    if (templateName && templateSelect) {
      templateSelect.value = templateName;
    }

    switchToEditor();

    newDeckButton?.click();

    if (templateName && applyTemplateButton) {
      applyTemplateButton.click();
    }

    const deckHeading = $("#activeDeckTitle");
    if (deckHeading && customTitle) {
      deckHeading.textContent = customTitle;
    }
  }

  function openAIGenerator(presetStyle, placeholderHint) {
    closeCreationMenu();
    templateScreen?.classList.remove("open");
    templateScreen?.setAttribute("aria-hidden", "true");

    const audienceSelect = $("#aiAudienceStyle");
    const topicBox = $("#aiSlideTopic"); if (audienceSelect && presetStyle) { audienceSelect.value = presetStyle; } if (topicBox && placeholderHint) { topicBox.placeholder = placeholderHint; }      aiGeneratorScreen?.classList.add("open"); }    /* ---------- LAUNCHERS & QUICK TOOLS ---------- */ $$('[data-open="slides"]').forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      openAIGenerator();
    });
  });

  $("#openTemplatesQuick")?.addEventListener("click", () => { closeCreationMenu(); templateScreen?.classList.add("open"); templateScreen?.setAttribute("aria-hidden", "false"); });    $$('[data-create="Slides"]').forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      openPresentationEditor("dark-tech", "Untitled Presentation");
    });
  });

  $$('[data-create="Docs"]').forEach(button => { button.addEventListener("click", event => { event.preventDefault(); openPresentationEditor("minimal-quote", "Outline Document"); }); });    $$
('[data-create="Sheets"]').forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      openPresentationEditor("mint-pro", "Data & Charts Deck");
      setTimeout(() => {
        window.GidyEditorTabs?.activate("insert");
        $("#addTable")?.click(); }, 120); }); });    // Safe, non-looping handler for quick tools & creation sheet tool buttons $$("[data-tool]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      const tool = (button.dataset.tool || "").toLowerCase();
      closeCreationMenu();

      if (tool.includes("translate")) {
        openAIGenerator(
          "educational",
          "Paste your slide text here and specify target language (e.g., Translate to Afaan Oromoo, Amharic, or English)..."
        );
      } else if (tool.includes("study")) {
        openAIGenerator(
          "educational",
          "Enter subject & grade/course topic (e.g., Grade 12 Biology — Cellular Respiration & ATP)..."
        );
      } else if (tool.includes("image")) {
        openPresentationEditor("dark-tech", "Image Showcase Deck");
        setTimeout(() => {
          window.GidyEditorTabs?.activate("design");
          $("#imageUpload")?.click();
        }, 120);
      } else if (tool.includes("pdf")) {
        openPresentationEditor("mint-pro", "PDF Export Deck");
      } else {
        templateScreen?.classList.add("open");
        templateScreen?.setAttribute("aria-hidden", "false");
      }
    });
  });

  // Import & Restore buttons on Home
  $("#homeImportBtn")?.addEventListener("click", () => {
    switchToEditor();
    setTimeout(() => $("#importFile")?.click(), 80);
  });

  $("#homeRestoreBackup")?.addEventListener("click", () => {
    switchToEditor();
    setTimeout(() => $("#importFile")?.click(), 80);
  });

  // Back to Home from Editor
  $("#backToHome")?.addEventListener("click", () => {
    $("#save")?.click();
    setTimeout(() => {
      window.GidyLibrary?.showPage("Home");
      renderWorkspaceList();
    }, 120);
  });

  // Template Screen controls
  $("#backTemplates")?.addEventListener("click", () => {
    templateScreen?.classList.remove("open");
    templateScreen?.setAttribute("aria-hidden", "true");
  });

  $("#blankTemplate")?.addEventListener("click", () => { openPresentationEditor("dark-tech", "Blank Presentation"); });    $$("[data-template]").forEach(button => {
    button.addEventListener("click", () => {
      const tpl = button.dataset.template;
      const label = button.querySelector("b")?.textContent || "New Presentation";
      openPresentationEditor(tpl, label);
    });
  });

  $("#backAIGenerator")?.addEventListener("click", () => {
    aiGeneratorScreen?.classList.remove("open");
  });

  // Sheet open/close
  newButton?.addEventListener("click", event => {
    event.preventDefault();
    openCreationMenu();
  });

  $("#closeNew")?.addEventListener("click", closeCreationMenu);
  newSheet?.addEventListener("click", event => {
    if (event.target === newSheet) closeCreationMenu();
  });

  $("#closeProjectActions")?.addEventListener("click", closeProjectActionSheet);
  actionSheet?.addEventListener("click", event => {
    if (event.target === actionSheet) closeProjectActionSheet();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeCreationMenu();
      closeProjectActionSheet();
    }
  });

  /* ---------- WORKSPACE FILE LIST, FILTERS & CONTEXT ACTIONS ---------- */
  function renderWorkspaceList() {
    if (!fileList) return;

    const searchQuery = ($("#homeSearch")?.value || "").toLowerCase().trim();
    const folderVal = $("#folderFilter")?.value || "all";
    let files = [...getFiles()];

    if (activeTabFilter === "starred") {
      files = files.filter(f => Boolean(f.starred));
    } else if (activeTabFilter === "recent") {
      files.sort((a, b) => new Date(b.updated || b.created || 0) - new Date(a.updated || a.created || 0));
    }

    if (folderVal !== "all") {
      files = files.filter(f => (f.folder || "general") === folderVal);
    }

    if (searchQuery) {
      files = files.filter(f => (f.name || "").toLowerCase().includes(searchQuery));
    }

    if (sortMode === "az") {
      files.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      files.sort((a, b) => new Date(b.updated || b.created || 0) - new Date(a.updated || a.created || 0));
    }

    const countEl = $("#fileCount");
    if (countEl) {
      countEl.textContent = `${files.length} presentation${files.length === 1 ? "" : "s"}`;
    }

    fileList.innerHTML = "";

    if (!files.length) {
      if (activeTabFilter === "shared") {
        fileList.innerHTML = `
          <div class="home-empty-note">
            Choose a curated template from <b>Pro Templates</b> above to start a styled presentation.
          </div>
        `;
      } else {
        fileList.innerHTML = `
          <div class="home-empty-note">
            No matching presentations yet. Tap <b>＋ Blank Deck</b> or <b>AI Slide Studio</b> to create one.
          </div>
        `;
      }
      return;
    }

    files.forEach(file => {
      const row = document.createElement("div");
      row.className = "home-file";
      row.role = "button";
      row.tabIndex = 0;

      const slidesCount = file.project?.slides?.length || file.slideCount || 1;
      const folderTag = (file.folder || "general").toUpperCase();
      const starMark = file.starred ? "★ " : "";

      row.innerHTML = `
        <span class="file-type slides-type">P</span>
        <span class="file-details">
          <b>${starMark}${escapeHtml(file.name || "Untitled presentation")}</b>
          <small>${slidesCount} slide${slidesCount === 1 ? "" : "s"} · ${folderTag} · ${new Date(file.updated || file.created || Date.now()).toLocaleDateString()}</small>
        </span>
        <button type="button" class="file-more" aria-label="More options">•••</button>
      `;

      row.addEventListener("click", event => {
        if (event.target.closest(".file-more")) {
          event.stopPropagation();
          openProjectActionSheet(file);
          return;
        }
        if (file.project) {
          localStorage.setItem(PROJECT_KEY, JSON.stringify(file.project));
        }
        localStorage.setItem(ACTIVE_FILE_KEY, file.id);
        localStorage.setItem(DECK_TITLE_KEY, file.name || "Untitled presentation");
        location.reload();
      });

      fileList.appendChild(row);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Context action sheet buttons
  $("#actionOpenProject")?.addEventListener("click", () => {
    const file = getFiles().find(f => f.id === selectedProjectId);
    if (!file) return;
    if (file.project) localStorage.setItem(PROJECT_KEY, JSON.stringify(file.project));
    localStorage.setItem(ACTIVE_FILE_KEY, file.id);
    localStorage.setItem(DECK_TITLE_KEY, file.name || "Untitled presentation");
    location.reload();
  });

  $("#actionRenameProject")?.addEventListener("click", () => {
    const files = getFiles();
    const file = files.find(f => f.id === selectedProjectId);
    if (!file) return;
    const nextName = prompt("Rename presentation:", file.name);
    if (!nextName || !nextName.trim()) return;
    file.name = nextName.trim();
    file.updated = new Date().toISOString();
    if (localStorage.getItem(ACTIVE_FILE_KEY) === file.id) {
      localStorage.setItem(DECK_TITLE_KEY, file.name);
    }
    storeFiles(files);
    closeProjectActionSheet();
    renderWorkspaceList();
  });

  $("#actionDuplicateProject")?.addEventListener("click", () => {
    const files = getFiles();
    const file = files.find(f => f.id === selectedProjectId);
    if (!file) return;
    const copy = JSON.parse(JSON.stringify(file));
    copy.id = "file-" + Date.now();
    copy.name = `${file.name} (Copy)`;
    copy.created = new Date().toISOString();
    copy.updated = new Date().toISOString();
    files.unshift(copy);
    storeFiles(files);
    closeProjectActionSheet();
    renderWorkspaceList();
  });

  $("#actionStarProject")?.addEventListener("click", () => {
    const files = getFiles();
    const file = files.find(f => f.id === selectedProjectId);
    if (!file) return;
    file.starred = !file.starred;
    storeFiles(files);
    closeProjectActionSheet();
    renderWorkspaceList();
  });

   $("#actionFolderProject")?.addEventListener("click", () => {
    const files = getFiles();
    const file = files.find(f => f.id === selectedProjectId);
    if (!file) return;
    const choice = prompt("Enter folder (general, education, business):", file.folder || "general");
    if (!choice) return;
    const normalized = choice.trim().toLowerCase();
    file.folder = ["general", "education", "business"].includes(normalized) ? normalized : "general";
    storeFiles(files);
    closeProjectActionSheet();
    renderWorkspaceList();
  });

  $("#actionExportProject")?.addEventListener("click", () => {
    const file = getFiles().find(f => f.id === selectedProjectId);
    if (!file) return;
    const blob = new Blob([JSON.stringify(file.project || file, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(file.name || "gidy-presentation").replace(/[^a-z0-9-_]+/gi, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    closeProjectActionSheet();
  });

  $("#actionDeleteProject")?.addEventListener("click", () => {
    const files = getFiles();
    const file = files.find(f => f.id === selectedProjectId);
    if (!file) return;
    if (!confirm(`Delete "${file.name}" permanently?`)) return;
    storeFiles(files.filter(f => f.id !== file.id));
    if (localStorage.getItem(ACTIVE_FILE_KEY) === file.id) {
      localStorage.removeItem(ACTIVE_FILE_KEY);
    }
    closeProjectActionSheet();
    renderWorkspaceList();
  });

  // Workspace tabs, folder filter, sort, view mode, search
  $$("#workspaceTabs button[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
      $$("#workspaceTabs button").forEach(tab => tab.classList.remove("active"));
      button.classList.add("active");
      activeTabFilter = button.dataset.filter || "device";
      renderWorkspaceList();
    });
  });

  $("#folderFilter")?.addEventListener("change", renderWorkspaceList);

  $("#sortFiles")?.addEventListener("click", () => {
    sortMode = sortMode === "newest" ? "az" : "newest";
    const sortBtn = $("#sortFiles");
    if (sortBtn) sortBtn.textContent = sortMode === "newest" ? "↕ Recent" : "↕ A–Z";
    renderWorkspaceList();
  });

  const listView = $("#listView");
  const gridView = $("#gridView");

  function setView(view) {
    if (!fileList) return;
    const isGrid = view === "grid";
    fileList.classList.toggle("grid-view", isGrid);
    listView?.classList.toggle("active", !isGrid);
    gridView?.classList.toggle("active", isGrid);
  }

  listView?.addEventListener("click", () => setView("list"));
  gridView?.addEventListener("click", () => setView("grid"));

  $("#homeSearch")?.addEventListener("input", renderWorkspaceList);

  // Initial render
  setTimeout(renderWorkspaceList, 60);
});
/* =====================================
   STANDALONE CLICK RESCUE (GIDY STUDIO)
===================================== */
(() => {
  function showScreen(el, open) {
    if (!el) return;
    el.classList.toggle("open", open);
    el.setAttribute("aria-hidden", String(!open));
    el.style.display = open ? (el.id === "newSheet" || el.id === "projectActionSheet" ? "flex" : "block") : "";
  }

  function enterEditorMode(templateName, titleText) {
    const tplSelect = document.getElementById("template");
    if (templateName && tplSelect) tplSelect.value = templateName;

    if (titleText) {
      localStorage.setItem("gidyStudioDeckTitle", titleText);
      const heading = document.getElementById("activeDeckTitle");
      if (heading) heading.textContent = titleText;
    }

    showScreen(document.getElementById("newSheet"), false);
    showScreen(document.getElementById("templateScreen"), false);
    showScreen(document.getElementById("aiGeneratorScreen"), false);

    document.querySelectorAll(".app-page").forEach(p => {
      p.style.display = "none";
      p.classList.remove("active");
    });

    document.body.classList.remove("home-mode", "sheet-open");
    document.body.classList.add("editor-mode");

    document.getElementById("newDeck")?.click();
    if (templateName) document.getElementById("applyTemplate")?.click();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button, a, [data-nav], [data-open], [data-create], [data-tool], [data-template]");
    if (!btn) return;

    const id = btn.id || "";
    const nav = btn.getAttribute("data-nav");
    const openAttr = btn.getAttribute("data-open");
    const createAttr = btn.getAttribute("data-create");
    const toolAttr = btn.getAttribute("data-tool");
    const tplAttr = btn.getAttribute("data-template");

    if (id === "openNew") {
      e.preventDefault();
      showScreen(document.getElementById("newSheet"), true);
      document.body.classList.add("sheet-open");
      return;
    }

    if (id === "closeNew" || e.target.id === "newSheet") {
      e.preventDefault();
      showScreen(document.getElementById("newSheet"), false);
      document.body.classList.remove("sheet-open");
      return;
    }

    if (id === "openTemplatesQuick" || nav === "Templates") {
      e.preventDefault();
      showScreen(document.getElementById("newSheet"), false);
      showScreen(document.getElementById("templateScreen"), true);
      return;
    }

    if (id === "backTemplates") {
      e.preventDefault();
      showScreen(document.getElementById("templateScreen"), false);
      return;
    }

    if (openAttr === "slides" || nav === "AI Studio" || (toolAttr && toolAttr.toLowerCase().includes("translate")) || (toolAttr && toolAttr.toLowerCase().includes("study"))) {
      e.preventDefault();
      showScreen(document.getElementById("newSheet"), false);
      showScreen(document.getElementById("templateScreen"), false);
      showScreen(document.getElementById("aiGeneratorScreen"), true);
      return;
    }

    if (id === "backAIGenerator") {
      e.preventDefault();
      showScreen(document.getElementById("aiGeneratorScreen"), false);
      return;
    }

    if (createAttr === "Slides" || id === "blankTemplate") {
      e.preventDefault();
      enterEditorMode("dark-tech", "Untitled Presentation");
      return;
    }

    if (tplAttr) {
      e.preventDefault();
      const label = btn.querySelector("b")?.textContent?.trim() || "New Presentation";
      enterEditorMode(tplAttr, label);
      return;
    }

    if (nav === "Workspace") {
      e.preventDefault();
      enterEditorMode();
      return;
    }

    if (nav === "Home") {
      e.preventDefault();
      document.body.classList.remove("editor-mode");
      document.body.classList.add("home-mode");
      const home = document.getElementById("homeScreen");
      if (home) home.style.display = "block";
      document.querySelectorAll(".app-page").forEach(p => {
        p.style.display = "none";
        p.classList.remove("active");
      });
      return;
    }

    if (nav === "Files") {
      e.preventDefault();
      window.GidyLibrary?.showPage?.("Files");
    }
  });
})();
