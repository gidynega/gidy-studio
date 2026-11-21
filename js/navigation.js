/* =================================
   GIDY STUDIO — HOME NAVIGATION & LIBRARY
   Home • Files • AI Studio • Templates • Workspace
================================= */

document.addEventListener("DOMContentLoaded", () => {

  const app = document.querySelector(".app");
  const homeScreen = document.getElementById("homeScreen");

  if (!app || !homeScreen) return;

  const PROJECT_KEY = "gidyStudioProject";
  const FILES_KEY = "gidyStudioFiles";
  const ACTIVE_FILE_KEY = "gidyStudioActiveFileId";
  const DECK_TITLE_KEY = "gidyStudioDeckTitle";

  const pageNames = ["Files", "Scan", "Discover", "Me"];
  const pageLabels = {
    Files: "All Presentations & Files",
    Scan: "AI Slide Studio & Quick Create",
    Discover: "Templates & Study Decks",
    Me: "Workspace & Local Vault"
  };
  const pages = {};

  pageNames.forEach(name => {
    const page = document.createElement("section");
    page.className = "app-page";
    page.id = name.toLowerCase() + "Page";
    page.style.display = "none";
    page.style.minHeight = "100vh";
    page.style.padding = "22px 18px 115px";
    page.style.maxWidth = "1040px";
    page.style.margin = "0 auto";
    page.innerHTML = `
      <h1 style="font-size:25px;margin:6px 0 18px">${pageLabels[name] || name}</h1>
      <div class="page-content"></div>
    `;
    app.appendChild(page);
    pages[name] = page;
  });

  if (!document.getElementById("gidyNavStyles")) {
    const style = document.createElement("style");
    style.id = "gidyNavStyles";
    style.textContent = `
      .app-page { color: #f5f7ff; }
      .app-page.active { display: block !important; }
      .file-library-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 13px 6px;
        border-bottom: 1px solid rgba(148, 173, 214, 0.15);
      }
      .file-library-icon {
        width: 42px;
        height: 42px;
        flex-shrink: 0;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(139, 92, 246, 0.24));
        color: #22d3ee;
        font-size: 18px;
        font-weight: 800;
        border: 1px solid rgba(34, 211, 238, 0.28);
      }
      .file-library-info { flex: 1; min-width: 0; }
      .file-library-info b,
      .file-library-info small {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .file-library-info b { font-size: 13px; }
      .file-library-info small { color: #98a8c4; font-size: 11px; margin-top: 3px; }
      .file-library-actions { display: flex; gap: 5px; flex-wrap: wrap; }
      .file-library-actions button { padding: 7px 9px; min-height: 34px; font-size: 11px; border-radius: 9px; }
      .library-search {
        width: 100%;
        margin: 8px 0 14px;
        padding: 11px 14px;
        border-radius: 12px;
        background: #0e1628;
        border: 1px solid rgba(148, 173, 214, 0.2);
        color: #f5f7ff;
      }
      .library-empty {
        padding: 34px 16px;
        text-align: center;
        color: #98a8c4;
        background: #10182b;
        border: 1px solid rgba(148, 173, 214, 0.16);
        border-radius: 16px;
      }
      .library-tabs { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 14px; }
      .library-tabs button { white-space: nowrap; font-size: 12px; padding: 8px 14px; border-radius: 999px; }
      .library-tabs button.active {
        background: linear-gradient(120deg, #06b6d4, #7c3aed);
        color: #ffffff;
        border-color: transparent;
        font-weight: 700;
      }
      .page-card {
        background: #10182b;
        border: 1px solid rgba(148, 173, 214, 0.16);
        padding: 18px;
        border-radius: 16px;
        margin-bottom: 12px;
      }
      .page-card h2 { margin: 0 0 8px; font-size: 17px; color: #f5f7ff; }
      .page-card p { color: #98a8c4; font-size: 13px; margin: 0 0 14px; }
      .page-card-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    `;
    document.head.appendChild(style);
  }

  function safeParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function getFiles() {
    const list = safeParse(localStorage.getItem(FILES_KEY), []);
    return Array.isArray(list) ? list : [];
  }

  function storeFiles(files) {
    try {
      localStorage.setItem(FILES_KEY, JSON.stringify(files));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }

  function getCurrentProject() {
    return safeParse(localStorage.getItem(PROJECT_KEY), null);
  }

  function getProjectTitle(project) {
    const savedTitle = localStorage.getItem(DECK_TITLE_KEY);
    if (savedTitle && savedTitle.trim()) return savedTitle.trim();
    const firstSlide = project?.slides?.[0];
    return firstSlide?.title ||
           firstSlide?.heading ||
           "Untitled presentation";
  }

  function openProjectInEditor(projectData, fileId = null) {
    if (projectData) {
      localStorage.setItem(PROJECT_KEY, JSON.stringify(projectData));
    }
    if (fileId) {
      localStorage.setItem(ACTIVE_FILE_KEY, fileId);
    }
    document.body.classList.remove("home-mode");
    document.body.classList.add("editor-mode");
    location.reload();
  }

  function saveCurrentToLibrary() {
    const project = getCurrentProject();
    if (!project || !Array.isArray(project.slides)) return;

    const files = getFiles();
    let activeId = localStorage.getItem(ACTIVE_FILE_KEY);
    let file = files.find(item => item.id === activeId);

    if (!file) {
      activeId = "file-" + Date.now();
      file = {
        id: activeId,
        name: getProjectTitle(project),
        starred: false,
        folder: "general",
        created: new Date().toISOString()
      };
      files.unshift(file);
    }

    file.name = getProjectTitle(project);
    file.project = project;
    file.slideCount = project.slides.length;
    file.updated = new Date().toISOString();

    localStorage.setItem(ACTIVE_FILE_KEY, activeId);
    storeFiles(files);
    renderFiles();
    renderHomeFiles();
  }

  let currentFilter = "Recent";

  function renderFiles() {
    const files = getFiles();
    const container = pages.Files.querySelector(".page-content");
    if (!container) return;

    container.innerHTML = `
      <input class="library-search" id="librarySearch"
        placeholder="Search saved presentations...">

      <div class="library-tabs">
        <button data-filter="Recent" class="${currentFilter === "Recent" ? "active" : ""}">Recent</button>
        <button data-filter="My Files" class="${currentFilter === "My Files" ? "active" : ""}">My Files</button>
        <button data-filter="Starred" class="${currentFilter === "Starred" ? "active" : ""}">Starred</button>
        <button data-filter="Shared" class="${currentFilter === "Shared" ? "active" : ""}">Shared</button>
      </div>

      <div id="libraryList"></div>
    `;

    const search = container.querySelector("#librarySearch");
    const list = container.querySelector("#libraryList");

    function display() {
      const term = (search.value || "").toLowerCase().trim();

      let filtered = files.filter(file =>
        (file.name || "Untitled presentation").toLowerCase().includes(term)
      );

      if (currentFilter === "Starred") {
        filtered = filtered.filter(file => file.starred);
      } else if (currentFilter === "Recent") {
        filtered.sort((a, b) =>
          new Date(b.updated || b.created || 0) -
          new Date(a.updated || a.created || 0)
        );
      } else if (currentFilter === "Shared") {
        filtered = [];
      }

      list.innerHTML = "";

      if (!filtered.length) {
        list.innerHTML = `
          <div class="library-empty">
            <div style="font-size:32px;margin-bottom:6px">📁</div>
            <h3>No files in this view</h3>
            <p>Create or save a presentation to see it here.</p>
          </div>
        `;
        return;
      }

      filtered.forEach(file => {
        const row = document.createElement("div");
        row.className = "file-library-row";

        const icon = document.createElement("div");
        icon.className = "file-library-icon";
        icon.textContent = "P";

        const info = document.createElement("div");
        info.className = "file-library-info";

        const title = document.createElement("b");
        title.textContent = file.name || "Untitled presentation";

        const slidesLen = file.project?.slides?.length || file.slideCount || 1;
        const date = document.createElement("small");
        date.textContent = `${slidesLen} slide${slidesLen === 1 ? "" : "s"} · ${
          new Date(file.updated || file.created || Date.now()).toLocaleDateString()
        }`;

        info.append(title, date);

        const actions = document.createElement("div");
        actions.className = "file-library-actions";

        const open = document.createElement("button");
        open.className = "primary";
        open.textContent = "Open";
        open.addEventListener("click", () => {
          openProjectInEditor(file.project, file.id);
        });

        const star = document.createElement("button");
        star.textContent = file.starred ? "★" : "☆";
        star.title = "Star presentation";
        star.addEventListener("click", () => {
          file.starred = !file.starred;
          storeFiles(files);
          renderFiles();
        });

        const rename = document.createElement("button");
        rename.textContent = "Rename";
        rename.addEventListener("click", () => {
          const newName = prompt("Enter presentation name:", file.name);
          if (!newName || !newName.trim()) return;
          file.name = newName.trim();
          if (localStorage.getItem(ACTIVE_FILE_KEY) === file.id) {
            localStorage.setItem(DECK_TITLE_KEY, file.name);
          }
          storeFiles(files);
          renderFiles();
          renderHomeFiles();
        });

        const remove = document.createElement("button");
        remove.className = "danger";
        remove.textContent = "Delete";
        remove.addEventListener("click", () => {
          if (!confirm("Delete this presentation permanently?")) return;
          const remaining = files.filter(item => item.id !== file.id);
          storeFiles(remaining);
          if (localStorage.getItem(ACTIVE_FILE_KEY) === file.id) {
            localStorage.removeItem(ACTIVE_FILE_KEY);
          }
          renderFiles();
          renderHomeFiles();
        });

        actions.append(open, star, rename, remove);
        row.append(icon, info, actions);
        list.appendChild(row);
      });
    }

    search.addEventListener("input", display);

    container.querySelectorAll("[data-filter]").forEach(button => {
      button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        container.querySelectorAll("[data-filter]").forEach(item =>
          item.classList.toggle("active", item === button)
        );
        display();
      });
    });

    display();
  }

  function renderHomeFiles() {
    const container = document.getElementById("homeFileList");
    if (!container) return;

    const files = getFiles().slice(0, 6);
    container.innerHTML = "";

    if (!files.length) {
      container.innerHTML =
        '<div class="home-empty-note">Your presentations appear here automatically as you create and edit them.</div>';
      return;
    }

    files.forEach(file => {
      const button = document.createElement("button");
      button.className = "home-file";

      const icon = document.createElement("span");
      icon.className = "file-type slides-type";
      icon.textContent = "P";

      const details = document.createElement("span");
      details.className = "file-details";

      const name = document.createElement("b");
      name.textContent = file.name || "Untitled presentation";

      const slidesLen = file.project?.slides?.length || file.slideCount || 1;
      const date = document.createElement("small");
      date.textContent = `${slidesLen} slides · Saved on this device`;

      details.append(name, date);
      button.append(icon, details);

      button.addEventListener("click", () => {
        openProjectInEditor(file.project, file.id);
      });

      container.appendChild(button);
    });
  }

  pages.Scan.querySelector(".page-content").innerHTML = `
    <div class="page-card">
      <h2>✦ AI Slide Studio</h2>
      <p>Generate structured lecture, research, or pitch decks from any topic or pasted study notes.</p>
      <div class="page-card-actions">
        <button class="primary" id="navOpenAI">Open AI Slide Generator</button>
        <button id="navOpenBlank">Start Blank Presentation</button>
      </div>
    </div>
  `;

  pages.Discover.querySelector(".page-content").innerHTML = `
    <div class="page-card">
      <h2>❖ Professional Templates</h2>
      <p>Browse curated themes for Education, Science &amp; Research, Class Lessons, and Business Pitches.</p>
      <div class="page-card-actions">
        <button class="primary" id="navOpenTemplates">Browse All Templates</button>
      </div>
    </div>
  `;

  function renderMePage() {
    const count = getFiles().length;
    pages.Me.querySelector(".page-content").innerHTML = `
      <div class="page-card">
        <h2>👤 Gidy Studio Creator Vault</h2>
        <p>Stored locally in browser storage: <b>${count}</b> saved presentation${count === 1 ? "" : "s"}. Works offline with JSON backup &amp; PPTX/PDF/PNG export.</p>
        <div class="page-card-actions">
          <button class="primary" id="navGoFiles">Manage Saved Files</button>
          <button id="navTriggerBackup">Download JSON Backup</button>
        </div>
      </div>
    `;

    document.getElementById("navGoFiles")?.addEventListener("click", () => showPage("Files"));
    document.getElementById("navTriggerBackup")?.addEventListener("click", () => {
      document.getElementById("backup")?.click();
    });
  }

  pages.Scan.querySelector("#navOpenAI")?.addEventListener("click", () => {
    document.getElementById("aiGeneratorScreen")?.classList.add("open");
  });
  pages.Scan.querySelector("#navOpenBlank")?.addEventListener("click", () => {
    localStorage.removeItem(ACTIVE_FILE_KEY);
    localStorage.removeItem(DECK_TITLE_KEY);
    document.body.classList.remove("home-mode");
    document.body.classList.add("editor-mode");
    document.getElementById("newDeck")?.click();
  });
  pages.Discover.querySelector("#navOpenTemplates")?.addEventListener("click", () => {
    const ts = document.getElementById("templateScreen");
    if (ts) {
      ts.classList.add("open");
      ts.setAttribute("aria-hidden", "false");
    }
  });

  function showPage(name) {
    document.body.classList.remove("editor-mode");
    document.body.classList.add("home-mode");

    homeScreen.style.display = name === "Home" ? "block" : "none";

    Object.entries(pages).forEach(([pageName, page]) => {
      const active = pageName === name;
      page.style.display = active ? "block" : "none";
      page.classList.toggle("active", active);
    });

    document.querySelectorAll("[data-nav]").forEach(button => {
      const selected = button.dataset.nav === name;
      button.classList.toggle("selected", selected);
      button.classList.toggle("active", selected);
    });

    if (name === "Files") renderFiles();
    if (name === "Me") renderMePage();
    renderHomeFiles();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll("[data-nav]").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.nav);
    });
  });

  const saveButton = document.getElementById("save");
  if (saveButton) {
    saveButton.addEventListener("click", () => {
      setTimeout(saveCurrentToLibrary, 120);
    });
  }

  const newDeckButton = document.getElementById("newDeck");
  if (newDeckButton) {
    newDeckButton.addEventListener("click", () => {
      localStorage.removeItem(ACTIVE_FILE_KEY);
      localStorage.removeItem(DECK_TITLE_KEY);
    });
  }

  window.GidyLibrary = {
    getFiles,
    storeFiles,
    saveCurrentToLibrary,
    renderHomeFiles,
    renderFiles,
    showPage
  };

  showPage("Home");

});
