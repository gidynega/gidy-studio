
/* ==========================================
   GIDY TXT — TEXT EDITOR
   Independent TXT workspace
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  const screen = $("txtScreen");
  if (!screen) return;

  const home = $("homeScreen");
  const newSheet = $("newSheet");

  const editor = $("txtEditor");
  const fileName = $("txtFileName");
  const status = $("txtStatus");
  const wordCount = $("txtWordCount");
  const charCount = $("txtCharCount");
  const fileInput = $("txtFileInput");

  function updateCounts() {
    const text = editor.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    wordCount.textContent = words;
    charCount.textContent = text.length;
  }

  function openWorkspace() {
    document.body.classList.add("txt-mode");
    document.body.classList.remove("home-mode");

    if (home) home.hidden = true;
    if (newSheet) newSheet.hidden = true;

    screen.hidden = false;
  }

  function goHome() {
    document.body.classList.remove("txt-mode");
    document.body.classList.add("home-mode");

    screen.hidden = true;
    if (home) home.hidden = false;
  }

  function newDocument() {
    editor.value = "";
    fileName.value = "Untitled.txt";
    updateCounts();
    status.textContent = "New text document";
  }

  function saveDocument() {
    const name = fileName.value.trim() || "Untitled.txt";
    const blob = new Blob([editor.value], {
      type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = name.endsWith(".txt") ? name : name + ".txt";
    link.click();

    URL.revokeObjectURL(url);
    status.textContent = "TXT file downloaded successfully.";
  }

  function openFile(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      editor.value = reader.result;
      fileName.value = file.name;
      updateCounts();
      status.textContent = "File opened successfully.";
    };

    reader.readAsText(file);
  }

  $("txtBackHome").addEventListener("click", goHome);
  $("txtNew").addEventListener("click", newDocument);
  $("txtSave").addEventListener("click", saveDocument);
  $("txtOpen").addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", event => {
    openFile(event.target.files[0]);
    event.target.value = "";
  });

  editor.addEventListener("input", updateCounts);

  $("txtFind").addEventListener("click", () => {
    const search = prompt("Find text:");
    if (!search) return;

    const index = editor.value.indexOf(search);

    if (index === -1) {
      status.textContent = "Text not found.";
      return;
    }

    editor.focus();
    editor.setSelectionRange(index, index + search.length);
    status.textContent = "Text found.";
  });

  $("txtReplace").addEventListener("click", () => {
    const search = prompt("Find text:");
    if (!search) return;

    const replacement = prompt("Replace with:");
    if (replacement === null) return;

    editor.value = editor.value.replaceAll(search, replacement);
    updateCounts();
    status.textContent = "Text replaced.";
  });

  window.addEventListener("click", event => {
    const button = event.target.closest('[data-tool="TXT"]');
    if (!button) return;

    openWorkspace();
  });

  updateCounts();
});
