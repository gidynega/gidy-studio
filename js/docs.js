
/* ==========================================
   GIDY DOCS — DOCUMENT EDITOR
   Independent workspace and local storage
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const screen = $("#docsScreen");
  const backButton = $("#docsBackHome");
  const titleInput = $("#docsTitle");
  const paper = $("#docsPaper");
  const status = $("#docsStatus");
  const fileList = $("#docsFileList");

  if (!screen || !paper || !titleInput) return;

  const STORAGE_KEY = "gidy_docs_v1";
  let documents = [];
  let activeId = null;

  // LOAD SAVED DOCUMENTS
  try {
    documents = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    documents = [];
  }

  function createId() {
    return Date.now().toString(36) +
      Math.random().toString(36).slice(2, 7);
  }

  function showStatus(message) {
    if (status) status.textContent = message;
  }

  function saveAll() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
      showStatus("Saved on this device.");
      renderFiles();
      return true;
    } catch (error) {
      showStatus("Could not save. Device storage may be full.");
      return false;
    }
  }

  function saveCurrent() {
    if (!activeId) return;

    const doc = documents.find(item => item.id === activeId);
    if (!doc) return;

    doc.title = titleInput.value.trim() || "Untitled document";
    doc.content = paper.innerHTML;
    doc.updated = new Date().toISOString();

    saveAll();
  }

  function renderFiles() {
    if (!fileList) return;

    fileList.innerHTML = "";

    documents.forEach(doc => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "docs-file-item";

      if (doc.id === activeId) {
        button.classList.add("active");
      }

      button.textContent = "📄 " + doc.title;
      button.addEventListener("click", () => openDocument(doc.id));

      fileList.appendChild(button);
    });
  }

  function openDocument(id) {
    const doc = documents.find(item => item.id === id);
    if (!doc) return;

    activeId = id;
    titleInput.value = doc.title;
    paper.innerHTML = doc.content || "<p></p>";

    renderFiles();
    showStatus("Opened: " + doc.title);
  }

  function createDocument() {
    saveCurrent();

    const doc = {
      id: createId(),
      title: "Untitled document",
      content: "<h1>New document</h1><p>Start writing here...</p>",
      updated: new Date().toISOString()
    };

    documents.unshift(doc);
    activeId = doc.id;

    titleInput.value = doc.title;
    paper.innerHTML = doc.content;

    saveAll();
    showStatus("New document created.");
  }

  // OPEN DOCS WORKSPACE
  function openDocs() {
    $("#newSheet")?.classList.remove("open");

    document.body.classList.remove("home-mode");
    document.body.classList.add("docs-mode");

    if (!activeId) {
      if (documents.length) {
        openDocument(documents[0].id);
      } else {
        createDocument();
      }
    }
  }

  // OPEN FROM THE CREATION MENU
  $$('[data-create="Docs"]').forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      openDocs();
    });
  });

  // RETURN HOME
  backButton?.addEventListener("click", () => {
    saveCurrent();
    document.body.classList.remove("docs-mode");
    document.body.classList.add("home-mode");
  });

  // NEW DOCUMENT
  $("#docsNew")?.addEventListener("click", createDocument);

  // RENAME DOCUMENT
  $("#docsRename")?.addEventListener("click", () => {
    const newName = prompt(
      "Enter the new document name:",
      titleInput.value
    );

    if (newName && newName.trim()) {
      titleInput.value = newName.trim();
      saveCurrent();
    }
  });

  // SAVE BUTTON
  $("#docsSave")?.addEventListener("click", saveCurrent);

  // SAVE TITLE AND CONTENT
  titleInput.addEventListener("input", () => {
    showStatus("Unsaved changes...");
  });

  paper.addEventListener("input", () => {
    showStatus("Unsaved changes...");
  });

  // FORMATTING COMMANDS
  $$("[data-doc-command]").forEach(button => {
    button.addEventListener("mousedown", event => {
      event.preventDefault();
    });

    button.addEventListener("click", () => {
      const command = button.dataset.docCommand;
      paper.focus();
      document.execCommand(command, false, null);
      showStatus("Formatting updated.");
    });
  });

  // BLOCK TYPE
  $("#docsBlockType")?.addEventListener("change", event => {
    paper.focus();
    document.execCommand(
      "formatBlock",
      false,
      event.target.value
    );
  });

  // FONT SIZE
  $("#docsFontSize")?.addEventListener("change", event => {
    paper.focus();
    document.execCommand(
      "fontSize",
      false,
      event.target.value
    );
  });

  // TEXT COLOR
  $("#docsTextColor")?.addEventListener("input", event => {
    paper.focus();
    document.execCommand(
      "foreColor",
      false,
      event.target.value
    );
  });

  // UNDO AND REDO
  $("#docsUndo")?.addEventListener("click", () => {
    paper.focus();
    document.execCommand("undo", false, null);
  });

  $("#docsRedo")?.addEventListener("click", () => {
    paper.focus();
    document.execCommand("redo", false, null);
  });

  // EXPORT DOCUMENT AS HTML
  $("#docsExport")?.addEventListener("click", () => {
    saveCurrent();

    const safeTitle = (titleInput.value || "document")
      .replace(/[\\/:*?"<>|]/g, "-");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle}</title>
<style>
body {
  max-width: 850px;
  margin: 40px auto;
  padding: 25px;
  font-family: Arial, sans-serif;
  line-height: 1.7;
  color: #222;
}
</style>
</head>
<body>
${paper.innerHTML}
</body>
</html>`;

    const blob = new Blob([html], {
      type: "text/html;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = safeTitle + ".html";
    link.click();

    URL.revokeObjectURL(url);
    showStatus("Document exported.");
  });

  // INITIALIZE
  renderFiles();

});
