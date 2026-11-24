
/* ==========================================
   GIDY PDF — ADVANCED PDF WORKSPACE
   Direct PDF Viewer + Printing + PDF History
   Persistent Local Storage using IndexedDB
========================================== */

document.addEventListener("DOMContentLoaded", () => {

  const $ = selector => document.querySelector(selector);

  const screen = $("#pdfScreen");
  const fileInput = $("#pdfFileInput");
  const viewer = $("#pdfViewer");
  const emptyState = $("#pdfEmptyState");
  const status = $("#pdfStatus");
  const documentName = $("#pdfDocumentName");
  const downloadButton = $("#pdfDownload");

  const titleInput = $("#pdfTextTitle");
  const textContent = $("#pdfTextContent");
  const createStatus = $("#pdfCreateStatus");

  if (!screen) return;

  let currentFile = null;
  let currentURL = null;
  let generatedBlob = null;
  let generatedName = "Gidy-document.pdf";

  let historyDB = null;
  let historyReady = false;

  // Keep object URLs alive while documents are open.
  const activeURLs = [];

  // ========================================
  // INDEXEDDB — PDF HISTORY DATABASE
  // ========================================

  function openHistoryDatabase() {

    return new Promise((resolve, reject) => {

      if (!window.indexedDB) {
        reject(new Error("IndexedDB is unavailable."));
        return;
      }

      const request = indexedDB.open("GidyPDFDatabase", 1);

      request.onupgradeneeded = event => {

        const db = event.target.result;

        if (!db.objectStoreNames.contains("documents")) {

          const store = db.createObjectStore("documents", {
            keyPath: "id"
          });

          store.createIndex("date", "date", {
            unique: false
          });

          store.createIndex("type", "type", {
            unique: false
          });

        }

      };

      request.onsuccess = () => {
        historyDB = request.result;
        historyReady = true;
        resolve(historyDB);
      };

      request.onerror = () => {
        reject(request.error);
      };

    });

  }

  function getHistoryStore(mode = "readonly") {

    if (!historyDB) {
      throw new Error("PDF history database is not ready.");
    }

    return historyDB
      .transaction("documents", mode)
      .objectStore("documents");

  }

  // ========================================
  // SAVE PDF TO HISTORY
  // ========================================

  async function saveHistory(file, type) {

    if (!file || !historyReady) return;

    try {

      const record = {
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now() + "-" + Math.random(),

        name: file.name || "Gidy-document.pdf",

        size: file.size,

        type: type,

        date: Date.now(),

        blob: file
      };

      await new Promise((resolve, reject) => {

        const request = getHistoryStore("readwrite")
          .put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);

      });

      await renderHistory();

    } catch (error) {

      console.error("Could not save PDF history:", error);

      if (status) {
        status.textContent =
          "PDF opened, but history could not be saved. Check device storage.";
      }

    }

  }

  // ========================================
  // GET HISTORY
  // ========================================

  async function getHistory() {

    if (!historyReady) return [];

    return new Promise((resolve, reject) => {

      const request = getHistoryStore().getAll();

      request.onsuccess = () => {

        const records = request.result || [];

        records.sort((a, b) => b.date - a.date);

        resolve(records);

      };

      request.onerror = () => reject(request.error);

    });

  }

  // ========================================
  // CREATE HISTORY INTERFACE
  // ========================================

  const historySection = document.createElement("section");

  historySection.id = "pdfHistorySection";

  historySection.innerHTML = `
    <div class="gpdf-history-header">
      <div>
        <h2>📚 PDF History</h2>
        <p>Recently viewed and created documents</p>
      </div>

      <button type="button" id="gpdfClearHistory">
        Clear History
      </button>
    </div>

    <div class="gpdf-history-tabs">
      <button class="active" data-history-filter="all">
        All PDFs
      </button>

      <button data-history-filter="viewed">
        Viewed
      </button>

      <button data-history-filter="worked">
        Created & Converted
      </button>
    </div>

    <div id="gpdfHistoryList">
      <div class="gpdf-history-empty">
        <div>📂</div>
        <p>Your PDF history will appear here.</p>
      </div>
    </div>
  `;

  screen.appendChild(historySection);

  // ========================================
  // HISTORY STYLING
  // ========================================

  const historyStyle = document.createElement("style");

  historyStyle.textContent = `

    #pdfHistorySection {
      margin: 28px 0;
      padding: 20px;
      border: 1px solid #303d5b;
      border-radius: 24px;
      background: #141d33;
      color: #f4f7ff;
    }

    .gpdf-history-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .gpdf-history-header h2 {
      font-size: 23px;
      margin: 0 0 6px;
    }

    .gpdf-history-header p {
      color: #9eacc8;
      margin: 0;
      font-size: 14px;
    }

    .gpdf-history-header button {
      border: 1px solid #354463;
      background: #202c47;
      color: white;
      border-radius: 12px;
      padding: 11px 14px;
      cursor: pointer;
    }

    .gpdf-history-tabs {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      margin-bottom: 18px;
      padding-bottom: 5px;
    }

    .gpdf-history-tabs button {
      white-space: nowrap;
      padding: 11px 15px;
      border: 1px solid #34415e;
      border-radius: 12px;
      background: #1a2540;
      color: #b7c4dc;
      cursor: pointer;
    }

    .gpdf-history-tabs button.active {
      background: linear-gradient(110deg, #7161ed, #08b9c9);
      color: white;
      border-color: transparent;
    }

    .gpdf-history-item {
      padding: 15px;
      border: 1px solid #34415e;
      border-radius: 16px;
      background: #19243d;
      margin-bottom: 12px;
    }

    .gpdf-history-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 13px;
      min-width: 0;
    }

    .gpdf-history-icon {
      font-size: 30px;
    }

    .gpdf-history-details {
      flex: 1;
      min-width: 0;
    }

    .gpdf-history-details strong {
      display: block;
      overflow-wrap: anywhere;
      font-size: 15px;
    }

    .gpdf-history-details small {
      display: block;
      color: #9eacc8;
      margin-top: 5px;
      line-height: 1.5;
    }

    .gpdf-history-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .gpdf-history-actions button {
      flex: 1;
      min-width: 75px;
      padding: 10px;
      border: 0;
      border-radius: 10px;
      background: #273754;
      color: white;
      cursor: pointer;
    }

    .gpdf-history-actions .open-btn {
      background: linear-gradient(110deg, #7161ed, #08b9c9);
    }

    .gpdf-history-actions .delete-btn {
      background: #542c42;
    }

    .gpdf-history-empty {
      text-align: center;
      padding: 35px 10px;
      color: #a8b5cf;
    }

    .gpdf-history-empty div {
      font-size: 45px;
      margin-bottom: 10px;
    }

    #pdfViewer {
      display: none !important;
    }

  `;

  document.head.appendChild(historyStyle);

  let historyFilter = "all";

  // ========================================
  // DISPLAY HISTORY
  // ========================================

  async function renderHistory() {

    const list = $("#gpdfHistoryList");

    if (!list || !historyReady) return;

    try {

      const records = await getHistory();

      const filtered = records.filter(record => {

        return historyFilter === "all" ||
          record.type === historyFilter;

      });

      list.replaceChildren();

      if (!filtered.length) {

        const empty = document.createElement("div");

        empty.className = "gpdf-history-empty";

        empty.innerHTML = `
          <div>📂</div>
          <p>No PDFs in this history section yet.</p>
        `;

        list.appendChild(empty);

        return;

      }

      filtered.forEach(record => {

        const item = document.createElement("article");

        item.className = "gpdf-history-item";

        const info = document.createElement("div");

        info.className = "gpdf-history-info";

        const icon = document.createElement("div");

        icon.className = "gpdf-history-icon";
        icon.textContent = "📕";

        const details = document.createElement("div");

        details.className = "gpdf-history-details";

        const name = document.createElement("strong");

        name.textContent = record.name;

        const meta = document.createElement("small");

        const date = new Date(record.date);

        meta.textContent =
          (record.type === "viewed" ? "Recently viewed" : "Created / Converted") +
          " · " +
          date.toLocaleString() +
          " · " +
          formatSize(record.size);

        details.append(name, meta);

        info.append(icon, details);

        const actions = document.createElement("div");

        actions.className = "gpdf-history-actions";

        const openBtn = makeHistoryButton("Open", "open-btn");

        openBtn.addEventListener("click", () => {
          openHistoryPDF(record.id);
        });

        const downloadBtn = makeHistoryButton("Download", "");

        downloadBtn.addEventListener("click", () => {
          downloadHistoryPDF(record.id);
        });

        const deleteBtn = makeHistoryButton("Remove", "delete-btn");

        deleteBtn.addEventListener("click", () => {
          deleteHistoryPDF(record.id);
        });

        actions.append(openBtn, downloadBtn, deleteBtn);

        item.append(info, actions);

        list.appendChild(item);

      });

    } catch (error) {

      console.error("History display error:", error);

    }

  }

  function makeHistoryButton(label, className) {

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.className = className;

    return button;

  }

  function formatSize(bytes) {

    if (!bytes) return "Unknown size";

    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";

  }

  // ========================================
  // HISTORY FILTERS
  // ========================================

  historySection.addEventListener("click", event => {

    const tab = event.target.closest("[data-history-filter]");

    if (!tab) return;

    historyFilter = tab.dataset.historyFilter;

    historySection
      .querySelectorAll("[data-history-filter]")
      .forEach(button => {
        button.classList.toggle("active", button === tab);
      });

    renderHistory();

  });

  // ========================================
  // OPEN PDF DIRECTLY IN BROWSER
  // ========================================

  function openBlobDirectly(blob) {

    if (!blob) return null;

    const url = URL.createObjectURL(blob);

    activeURLs.push(url);

    const newTab = window.open(url, "_blank");

    if (!newTab) {

      const link = document.createElement("a");

      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";

      document.body.appendChild(link);
      link.click();
      link.remove();

    }

    return newTab;

  }

  // ========================================
  // OPEN PDF WORKSPACE
  // ========================================

  function openPDFWorkspace() {

    const closeNew = $("#closeNew");

    if (closeNew) closeNew.click();

    document.body.classList.add("pdf-mode");

    screen.hidden = false;

    window.scrollTo(0, 0);

    renderHistory();

  }

  // ========================================
  // RETURN HOME
  // ========================================

  function backHome() {

    closePDF();

    screen.hidden = true;

    document.body.classList.remove("pdf-mode");
    document.body.classList.add("home-mode");

    window.scrollTo(0, 0);

  }

  // ========================================
  // FILE PICKER
  // ========================================

  function choosePDF() {

    fileInput?.click();

  }

  $("#pdfOpenFile")?.addEventListener("click", choosePDF);
  $("#pdfChooseFile")?.addEventListener("click", choosePDF);

  // ========================================
  // SELECT AND OPEN PDF
  // ========================================

  fileInput?.addEventListener("change", event => {

    const file = event.target.files[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {

      status.textContent = "Please select a valid PDF file.";

      fileInput.value = "";

      return;

    }

    currentFile = file;
    generatedBlob = null;

    documentName.textContent = file.name;

    status.textContent = "Opening PDF directly...";

    downloadButton.disabled = false;

    // Open the actual PDF in a separate browser tab.
    currentURL = openBlobDirectly(file);

    if (viewer) {
      viewer.removeAttribute("src");
      viewer.hidden = true;
    }

    if (emptyState) {
      emptyState.hidden = false;
    }

    saveHistory(file, "viewed");

    status.textContent = "PDF opened in browser viewer.";

    // Allow the same file to be selected again.
    fileInput.value = "";

  });

  // ========================================
  // OPEN PDF FROM HISTORY
  // ========================================

  async function openHistoryPDF(id) {

    try {

      const record = await getHistoryRecord(id);

      if (!record) {
        alert("PDF document not found.");
        return;
      }

      currentFile = record.blob;
      generatedBlob = null;

      documentName.textContent = record.name;

      downloadButton.disabled = false;

      currentURL = openBlobDirectly(record.blob);

      status.textContent = "PDF opened from history.";

      // Update the viewed date.
      record.date = Date.now();

      await updateHistoryRecord(record);

      await renderHistory();

    } catch (error) {

      alert("Could not open this PDF. It may have been removed.");

    }

  }

  function getHistoryRecord(id) {

    return new Promise((resolve, reject) => {

      const request = getHistoryStore().get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

    });

  }

  function updateHistoryRecord(record) {

    return new Promise((resolve, reject) => {

      const request = getHistoryStore("readwrite").put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);

    });

  }

  // ========================================
  // DOWNLOAD HISTORY PDF
  // ========================================

  async function downloadHistoryPDF(id) {

    try {

      const record = await getHistoryRecord(id);

      if (!record) return;

      downloadBlob(record.blob, record.name);

    } catch (error) {

      alert("Unable to download this document.");

    }

  }

  function downloadBlob(blob, filename) {

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 3000);

  }

  // ========================================
  // REMOVE HISTORY ITEM
  // ========================================

  async function deleteHistoryPDF(id) {

    if (!confirm("Remove this PDF from history and local storage?")) {
      return;
    }

    try {

      await new Promise((resolve, reject) => {

        const request = getHistoryStore("readwrite").delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);

      });

      await renderHistory();

    } catch (error) {

      alert("Could not remove this PDF.");

    }

  }

  // ========================================
  // CLEAR ALL HISTORY
  // ========================================

  $("#gpdfClearHistory")?.addEventListener("click", async () => {

    if (!confirm(
      "Delete all PDF history and all locally stored PDF documents?"
    )) {
      return;
    }

    try {

      await new Promise((resolve, reject) => {

        const request = getHistoryStore("readwrite").clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);

      });

      await renderHistory();

      alert("PDF history cleared successfully.");

    } catch (error) {

      alert("Could not clear PDF history.");

    }

  });

  // ========================================
  // CLOSE PDF
  // ========================================

  function closePDF() {

    // Do not revoke URLs used by external PDF tabs.
    // The browser releases them when the page is closed.

    currentURL = null;

    if (viewer) {
      viewer.removeAttribute("src");
      viewer.hidden = true;
    }

    if (emptyState) {
      emptyState.hidden = false;
    }

    if (documentName) {
      documentName.textContent = "PDF Viewer";
    }

    if (status) {
      status.textContent = "No document opened";
    }

    currentFile = null;
    generatedBlob = null;

    downloadButton.disabled = true;

    if (fileInput) {
      fileInput.value = "";
    }

  }

  $("#pdfCloseFile")?.addEventListener("click", closePDF);

  $("#pdfBackHome")?.addEventListener("click", backHome);

  // ========================================
  // DOWNLOAD CURRENT PDF
  // ========================================

  downloadButton?.addEventListener("click", () => {

    const blob = generatedBlob || currentFile;

    if (!blob) return;

    const filename = generatedBlob
      ? generatedName
      : currentFile.name;

    downloadBlob(blob, filename);

  });

  // ========================================
  // GET jsPDF LIBRARY
  // ========================================

  function getPDFLibrary() {

    if (window.jspdf && window.jspdf.jsPDF) {
      return window.jspdf.jsPDF;
    }

    alert(
      "PDF library is unavailable. Check your internet connection and reload Gidy Studio."
    );

    return null;

  }

  // ========================================
  // CREATE PDF FROM TEXT
  // ========================================

   $("#pdfCreateFromText")?.addEventListener("click", async () => {

    const jsPDF = getPDFLibrary();

    if (!jsPDF) return;

    const title = titleInput.value.trim() || "Untitled document";

    const content = textContent.value.trim();

    if (!content) {

      createStatus.textContent =
        "Please enter some document content first.";

      return;

    }

    try {

      const pdf = new jsPDF();

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);

      pdf.text(title, 15, 22);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);

      const lines = pdf.splitTextToSize(content, 180);

      let y = 35;

      lines.forEach(line => {

        if (y > 275) {
          pdf.addPage();
          y = 20;
        }

        pdf.text(line, 15, y);

        y += 7;

      });

      generatedBlob = pdf.output("blob");

      generatedName =
        title.replace(/[\\/:*?"<>|]/g, "-") + ".pdf";

      currentFile = null;

      downloadButton.disabled = false;

      await saveHistory(
        new File([generatedBlob], generatedName, {
          type: "application/pdf"
        }),
        "worked"
      );

      downloadBlob(generatedBlob, generatedName);

      createStatus.textContent =
        "PDF created, downloaded and saved in PDF History.";

    } catch (error) {

      console.error(error);

      createStatus.textContent = "Could not create PDF.";

    }

  });

  // ========================================
  // IMAGES TO PDF
  // ========================================

  const imageInput = document.createElement("input");

  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageInput.multiple = true;
  imageInput.hidden = true;

  document.body.appendChild(imageInput);

  imageInput.addEventListener("change", async () => {

    const files = [...imageInput.files];

    if (!files.length) return;

    const jsPDF = getPDFLibrary();

    if (!jsPDF) return;

    try {

      let pdf = null;

      for (const file of files) {

        if (!file.type.startsWith("image/")) continue;

        const dataURL = await new Promise((resolve, reject) => {

          const reader = new FileReader();

          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;

          reader.readAsDataURL(file);

        });

        const image = await new Promise((resolve, reject) => {

          const img = new Image();

          img.onload = () => resolve(img);
          img.onerror = reject;

          img.src = dataURL;

        });

        const orientation =
          image.width > image.height ? "landscape" : "portrait";

        if (!pdf) {

          pdf = new jsPDF({
            orientation,
            unit: "mm",
            format: "a4"
          });

        } else {

          pdf.addPage("a4", orientation);

        }

        const pageWidth =
          orientation === "landscape" ? 297 : 210;

        const pageHeight =
          orientation === "landscape" ? 210 : 297;

        const margin = 10;

        const scale = Math.min(
          (pageWidth - margin * 2) / image.width,
          (pageHeight - margin * 2) / image.height
        );

        const width = image.width * scale;
        const height = image.height * scale;

        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;

        const format =
          file.type === "image/png" ? "PNG" : "JPEG";

        pdf.addImage(dataURL, format, x, y, width, height);

      }

      if (!pdf) {

        alert("No supported images were selected.");

        return;

      }

      generatedBlob = pdf.output("blob");

      generatedName = "Gidy-images.pdf";

      currentFile = null;

      downloadButton.disabled = false;

      await saveHistory(
        new File([generatedBlob], generatedName, {
          type: "application/pdf"
        }),
        "worked"
      );

      downloadBlob(generatedBlob, generatedName);

      status.textContent =
        "Images converted and PDF saved in history.";

    } catch (error) {

      console.error(error);

      alert(
        "Could not convert the selected images. Please try again."
      );

    }

    imageInput.value = "";

  });

  // ========================================
  // PRINT PDF
  // ========================================
function printCurrentPDF() {

    const blob = generatedBlob || currentFile;

    if (!blob) {

      alert("Open or create a PDF document before printing.");

      return;

    }

    const printTab = openBlobDirectly(blob);

    if (printTab) {

      // Attempt native browser printing.
      // Mobile browsers may require the user to
      // select Print from their PDF viewer menu.

      setTimeout(() => {

        try {
          printTab.print();
        } catch (error) {
          console.log("Use the browser PDF viewer print menu.");
        }

      }, 1500);

    } else {

      alert(
        "The PDF has been opened. Use the browser menu to select Print."
      );

    }

  }

  // ========================================
  // PDF TOOL BUTTONS
  // ========================================

  document.querySelectorAll("[data-pdf-tool]").forEach(button => {

    button.addEventListener("click", () => {

      const tool = button.dataset.pdfTool;

      if (tool === "view") {
        choosePDF();
      }

      if (tool === "images") {
        imageInput.click();
      }

      if (tool === "text") {

        titleInput.scrollIntoView({
          behavior: "smooth"
        });

        titleInput.focus();

      }

      if (tool === "print") {
        printCurrentPDF();
      }

    });

  });

  // ========================================
  // CONNECT THE + BUTTON PDF OPTION
  // ========================================
document.addEventListener("click", event => {

    const button = event.target.closest('[data-tool="PDF"]');

    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    openPDFWorkspace();

  }, true);

  // ========================================
  // PUBLIC WORKSPACE ACCESS
  // ========================================

  window.openGidyPDF = openPDFWorkspace;

  // ========================================
  // INITIALIZE PDF HISTORY
  // ========================================

  openHistoryDatabase()
    .then(() => renderHistory())
    .catch(error => {

      console.error("PDF history initialization failed:", error);

      const list = $("#gpdfHistoryList");

      if (list) {
        list.textContent =
          "PDF history storage is unavailable on this browser.";
      }

    });

});
