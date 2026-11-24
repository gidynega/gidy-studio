
/* ==========================================
   GIDY PDF — INDEPENDENT PDF WORKSPACE
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

  // ----------------------------------------
  // OPEN PDF WORKSPACE
  // ----------------------------------------

  function openPDFWorkspace() {

    const closeNew = $("#closeNew");
    if (closeNew) closeNew.click();

    document.body.classList.add("pdf-mode");

    screen.hidden = false;

    window.scrollTo(0, 0);
  }

  // ----------------------------------------
  // RETURN HOME
  // ----------------------------------------

  function backHome() {

    closePDF();

    screen.hidden = true;

    document.body.classList.remove("pdf-mode");
    document.body.classList.add("home-mode");

    window.scrollTo(0, 0);
  }

  // ----------------------------------------
  // OPEN FILE PICKER
  // ----------------------------------------

  function choosePDF() {
    fileInput?.click();
  }

  $("#pdfOpenFile")?.addEventListener("click", choosePDF);
  $("#pdfChooseFile")?.addEventListener("click", choosePDF);

  // ----------------------------------------
  // DISPLAY SELECTED PDF
  // ----------------------------------------

  fileInput?.addEventListener("change", event => {

    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      status.textContent = "Please select a valid PDF file.";
      return;
    }

    if (currentURL) {
      URL.revokeObjectURL(currentURL);
    }

    currentFile = file;
    generatedBlob = null;

    currentURL = URL.createObjectURL(file);

    viewer.src = currentURL;
    viewer.hidden = false;

    emptyState.hidden = true;

    documentName.textContent = file.name;
    status.textContent = "PDF opened successfully.";

    downloadButton.disabled = false;

  });

  // ----------------------------------------
  // CLOSE PDF
  // ----------------------------------------

  function closePDF() {

    if (currentURL) {
      URL.revokeObjectURL(currentURL);
      currentURL = null;
    }

    viewer.removeAttribute("src");
    viewer.hidden = true;

    emptyState.hidden = false;

    documentName.textContent = "PDF Viewer";
    status.textContent = "No document opened";

    currentFile = null;
    generatedBlob = null;

    downloadButton.disabled = true;

    if (fileInput) fileInput.value = "";
  }

  $("#pdfCloseFile")?.addEventListener("click", closePDF);
  $("#pdfBackHome")?.addEventListener("click", backHome);

  // ----------------------------------------
  // DOWNLOAD PDF
  // ----------------------------------------

  downloadButton?.addEventListener("click", () => {

    let blob = generatedBlob;
    let filename = generatedName;

    if (!blob && currentFile) {
      blob = currentFile;
      filename = currentFile.name;
    }

    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

  });

  // ----------------------------------------
  // GET jsPDF LIBRARY
  // ----------------------------------------

  function getPDFLibrary() {

    if (window.jspdf && window.jspdf.jsPDF) {
      return window.jspdf.jsPDF;
    }

    alert("PDF library is not available. Please check your internet connection and reload Gidy Studio.");

    return null;
  }

  // ----------------------------------------
  // CREATE PDF FROM TEXT
  // ----------------------------------------

  $("#pdfCreateFromText")?.addEventListener("click", () => {

    const jsPDF = getPDFLibrary();

    if (!jsPDF) return;

    const title = titleInput.value.trim() || "Untitled document";
    const content = textContent.value.trim();

    if (!content) {
      createStatus.textContent = "Please enter some document content first.";
      return;
    }

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

    pdf.save(generatedName);

    createStatus.textContent = "Your PDF has been created and downloaded.";

  });

  // ----------------------------------------
  // IMAGES TO PDF
  // ----------------------------------------

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

        const pageWidth = orientation === "landscape" ? 297 : 210;
        const pageHeight = orientation === "landscape" ? 210 : 297;

        const margin = 10;

        const scale = Math.min(
          (pageWidth - margin * 2) / image.width,
          (pageHeight - margin * 2) / image.height
        );

        const width = image.width * scale;
        const height = image.height * scale;

        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;

        const format = file.type === "image/png" ? "PNG" : "JPEG";

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

      pdf.save(generatedName);

      status.textContent = "Images successfully converted into PDF.";

    } catch (error) {

      alert("Could not convert the selected images. Please try again.");

    }

    imageInput.value = "";

  });

  // ----------------------------------------
  // PDF TOOL BUTTONS
  // ----------------------------------------

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
        titleInput.scrollIntoView({ behavior: "smooth" });
        titleInput.focus();
      }

      if (tool === "print") {

        if (!currentURL) {
          alert("Open a PDF document before printing.");
          return;
        }

        viewer.contentWindow.print();

      }

    });

  });

  // ----------------------------------------
  // CONNECT THE + BUTTON PDF OPTION
  // ----------------------------------------

  document.addEventListener("click", event => {

    const button = event.target.closest('[data-tool="PDF"]');

    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    openPDFWorkspace();

  }, true);

  // ----------------------------------------
  // PUBLIC WORKSPACE ACCESS
  // ----------------------------------------

  window.openGidyPDF = openPDFWorkspace;

});
