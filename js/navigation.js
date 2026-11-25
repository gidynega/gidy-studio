/* =================================
   GIDY STUDIO — HOME NAVIGATION
   Home • Files • Scan • Discover • Me
================================= */

document.addEventListener("DOMContentLoaded", () => {

  const app = document.querySelector(".app");
  const homeScreen = document.getElementById("homeScreen");

  if (!app || !homeScreen) return;

  const PROJECT_KEY = "gidyStudioProject";
  const FILES_KEY = "gidyStudioFiles";
  const ACTIVE_FILE_KEY = "gidyStudioActiveFileId";

  // Create navigation pages
const pageNames = ["Files", "Discover", "Me"];
  const pages = {};

  pageNames.forEach(name => {
    const page = document.createElement("section");
    page.className = "app-page";
    page.id = name.toLowerCase() + "Page";
    page.style.display = "none";
    page.style.minHeight = "100vh";
    page.style.padding = "24px 18px 110px";
    page.style.maxWidth = "980px";
    page.style.margin = "0 auto";
    page.innerHTML = `
      <h1 style="font-size:25px">${name}</h1>
      <div class="page-content"></div>
    `;
    app.appendChild(page);
    pages[name] = page;
  });

  // Navigation page styling
  const style = document.createElement("style");
  style.textContent = `
    .app-page { color:#f5f7ff; }
    .app-page.active { display:block !important; }
    .app-page h1 { margin:8px 0 20px; }
    .file-library-row {
      display:flex; align-items:center; gap:12px;
      padding:14px 5px; border-bottom:1px solid #283550;
    }
    .file-library-icon {
      width:43px;height:45px;border-radius:10px;
      display:grid;place-items:center;
      background:#ff9c4925;color:#ff9c49;font-size:20px;
    }
    .file-library-info { flex:1;min-width:0; }
    .file-library-info b,.file-library-info small {
      display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
    }
    .file-library-info small { color:#9eabc5;font-size:11px;margin-top:4px; }
    .file-library-actions { display:flex;gap:5px; }
    .file-library-actions button { padding:7px;font-size:11px; }
    .library-search { margin:12px 0 18px; }
    .library-empty {
      padding:35px 15px;text-align:center;color:#9eabc5;
      background:#151d32;border-radius:15px;
    }
    .library-tabs { display:flex;gap:8px;overflow-x:auto;margin-bottom:15px; }
    .library-tabs button { white-space:nowrap;font-size:11px; }
    .library-tabs button.active { background:#ff8b45;color:#171827; }
    .page-card {
      background:#151d32;border:1px solid #2b3854;
      padding:17px;border-radius:15px;margin-bottom:12px;
    }
    .page-card p { color:#aab5ce;font-size:13px; }
  `;
  document.head.appendChild(style);

  // File library
  function getFiles() {
    try {
      return JSON.parse(localStorage.getItem(FILES_KEY)) || [];
    } catch {
      return [];
    }
  }

  function storeFiles(files) {
    localStorage.setItem(FILES_KEY, JSON.stringify(files));
  }

  function getCurrentProject() {
    try {
      return JSON.parse(localStorage.getItem(PROJECT_KEY));
    } catch {
      return null;
    }
  }

  function getProjectTitle(project) {
    const firstSlide = project?.slides?.[0];
    return firstSlide?.title ||
           firstSlide?.heading ||
           "Untitled presentation";
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
        created: new Date().toISOString()
      };
      files.unshift(file);
    }

    file.name = getProjectTitle(project);
    file.project = project;
    file.updated = new Date().toISOString();

    localStorage.setItem(ACTIVE_FILE_KEY, activeId);
    storeFiles(files);
    renderFiles();
  }

  // Render file list
  let currentFilter = "Recent";

  function renderFiles() {
    const files = getFiles();
    const container = pages.Files.querySelector(".page-content");

    container.innerHTML = `
      <input class="library-search" id="librarySearch"
        placeholder="Search your files...">

      <div class="library-tabs">
        <button data-filter="Recent" class="active">Recent</button>
        <button data-filter="My Files">My Files</button>
        <button data-filter="Starred">Starred</button>
        <button data-filter="Shared">Shared</button>
      </div>

      <div id="libraryList"></div>
    `;

    const search = container.querySelector("#librarySearch");
    const list = container.querySelector("#libraryList");

    function display() {
      const term = search.value.toLowerCase();

      let filtered = files.filter(file =>
        file.name.toLowerCase().includes(term)
      );

      if (currentFilter === "Starred") {
        filtered = filtered.filter(file => file.starred);
      } else if (currentFilter === "Recent") {
        filtered.sort((a,b) =>
          new Date(b.updated || b.created) -
          new Date(a.updated || a.created)
        );
      }

      // Shared files are not implemented yet.
      if (currentFilter === "Shared") {
        filtered = [];
      }

      list.innerHTML = "";

      if (!filtered.length) {
        list.innerHTML = `
          <div class="library-empty">
            <div style="font-size:35px">📁</div>
            <h3>No files here yet</h3>
            <p>Save a presentation to see it in your library.</p>
          </div>
        `;
        return;
      }

      filtered.forEach(file => {
        const row = document.createElement("div");
        row.className = "file-library-row";

        const icon = document.createElement("div");
        icon.className = "file-library-icon";
        icon.textContent = "▣";

        const info = document.createElement("div");
        info.className = "file-library-info";

        const title = document.createElement("b");
        title.textContent = file.name;

        const date = document.createElement("small");
        date.textContent = "Presentation • " +
          new Date(file.updated || file.created).toLocaleDateString();

        info.append(title, date);

        const actions = document.createElement("div");
        actions.className = "file-library-actions";

        const open = document.createElement("button");
        open.textContent = "Open";
        open.addEventListener("click", () => {
          localStorage.setItem(PROJECT_KEY,
            JSON.stringify(file.project));
          localStorage.setItem(ACTIVE_FILE_KEY, file.id);
          document.body.classList.remove("home-mode");
          document.body.classList.add("editor-mode");
          location.reload();
        });

        const star = document.createElement("button");
        star.textContent = file.starred ? "★" : "☆";
        star.addEventListener("click", () => {
          file.starred = !file.starred;
          storeFiles(files);
          renderFiles();
        });

        const rename = document.createElement("button");
        rename.textContent = "✎";
        rename.addEventListener("click", () => {
          const newName = prompt("Enter the new file name:", file.name);
          if (!newName || !newName.trim()) return;
          file.name = newName.trim();
          storeFiles(files);
          renderFiles();
        });

        const remove = document.createElement("button");
        remove.textContent = "Delete";
        remove.addEventListener("click", () => {
          if (!confirm("Delete this file permanently?")) return;
          storeFiles(files.filter(item => item.id !== file.id));
          renderFiles();
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

  // Home recent files
  function renderHomeFiles() {
    const container = document.getElementById("homeFileList");
    if (!container) return;

    const files = getFiles().slice(0, 5);
    container.innerHTML = "";

    if (!files.length) {
      container.innerHTML =
        '<div class="home-empty-note">Your saved files will appear here.</div>';
      return;
    }

    files.forEach(file => {
      const button = document.createElement("button");
      button.className = "home-file";

      const icon = document.createElement("span");
      icon.className = "file-type slides-type";
      icon.textContent = "▣";

      const details = document.createElement("span");
      details.className = "file-details";

      const name = document.createElement("b");
      name.textContent = file.name;

      const date = document.createElement("small");
      date.textContent = "Presentation";

      details.append(name, date);
      button.append(icon, details);

      button.addEventListener("click", () => {
        localStorage.setItem(PROJECT_KEY,
          JSON.stringify(file.project));
        localStorage.setItem(ACTIVE_FILE_KEY, file.id);
        location.reload();
      });

      container.appendChild(button);
    });
  }

  // Other pages
  pages.Scan.querySelector(".page-content").innerHTML = `
    <div class="page-card">
      <h2>📷 Scan documents</h2>
      <p>Document scanning and image-to-PDF tools will be added here.</p>
    </div>
  `;

  pages.Discover.querySelector(".page-content").innerHTML = `
    <div class="page-card">
      <h2>✨ Discover</h2>
      <p>Explore templates, learning resources, and creative tools.</p>
    </div>
  `;

  pages.Me.querySelector(".page-content").innerHTML = `
    <div class="page-card">
      <h2>👤 Gidy Studio Account</h2>
      <p>Your profile and app settings will appear here.</p>
    </div>
  `;

  // Switch pages
  function showPage(name) {
    document.body.classList.remove("editor-mode");
    document.body.classList.add("home-mode");

    homeScreen.style.display = name === "Home" ? "block" : "none";

    Object.entries(pages).forEach(([pageName, page]) => {
      page.style.display = pageName === name ? "block" : "none";
      page.classList.toggle("active", pageName === name);
    });

    document.querySelectorAll("[data-nav]").forEach(button => {
      const selected = button.dataset.nav === name;
      button.classList.toggle("selected", selected);
      button.classList.toggle("active", selected);
    });

    if (name === "Files") renderFiles();
    renderHomeFiles();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Bottom navigation
  document.querySelectorAll("[data-nav]").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.nav);
    });
  });

  // Capture the existing editor Save button
  const saveButton = document.getElementById("save");

  if (saveButton) {
    saveButton.addEventListener("click", () => {
      setTimeout(saveCurrentToLibrary, 100);
    });
  }

  // Track new deck creation
  const newDeckButton = document.getElementById("newDeck");

  if (newDeckButton) {
    newDeckButton.addEventListener("click", () => {
      localStorage.removeItem(ACTIVE_FILE_KEY);
    });
  }

  // Initial screen
  showPage("Home");

});