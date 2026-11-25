
/* =====================================
   GIDY SCAN — INDEPENDENT WORKSPACE
===================================== */

document.addEventListener("DOMContentLoaded", () => {

  const $ = id => document.getElementById(id);

  const screen = $("scanScreen");
  const home = $("homeScreen");
  const bottomNav = document.querySelector(".home-bottom-nav");
  const newSheet = $("newSheet");

  const scanCamera = $("scanCamera");
  const scanUpload = $("scanUpload");
  const scanEmpty = $("scanEmpty");
  const previewArea = $("scanPreviewArea");
  const preview = $("scanPreview");
  const status = $("scanStatus");

  const topHeader = document.querySelector(".top");
  const editorLayout = document.querySelector(".layout");
  const footer = document.querySelector(".bottom");

  if (!screen || !preview) {
    console.error("Gidy Scan elements not found.");
    return;
  }

  let currentImage = null;

  function openScan() {

    home.hidden = true;
    screen.style.display = "block";

    if (bottomNav) bottomNav.hidden = true;
    if (topHeader) topHeader.hidden = true;
    if (editorLayout) editorLayout.hidden = true;
    if (footer) footer.hidden = true;

    document.body.classList.remove(
      "home-mode",
      "editor-mode"
    );

    document.body.classList.add("scan-mode");

    window.scrollTo(0, 0);
  }

  function closeScan() {

    screen.style.display = "none";
    home.hidden = false;

    if (bottomNav) bottomNav.hidden = false;
    if (topHeader) topHeader.hidden = false;
    if (editorLayout) editorLayout.hidden = false;
    if (footer) footer.hidden = false;

    document.body.classList.remove("scan-mode");
    document.body.classList.add("home-mode");

    resetScan();
    window.scrollTo(0, 0);
  }

  function loadImage(file) {

    if (!file || !file.type.startsWith("image/")) {
      status.textContent = "Please select a valid image.";
      return;
    }

    if (currentImage) {
      URL.revokeObjectURL(currentImage);
    }

    currentImage = URL.createObjectURL(file);

    preview.src = currentImage;
    scanEmpty.style.display = "none";
    previewArea.style.display = "block";

    status.textContent = "Document image loaded successfully.";
  }

  function resetScan() {

    previewArea.style.display = "none";
    scanEmpty.style.display = "block";

    preview.removeAttribute("src");

    if (currentImage) {
      URL.revokeObjectURL(currentImage);
      currentImage = null;
    }

    if (scanCamera) scanCamera.value = "";
    if (scanUpload) scanUpload.value = "";

    status.textContent = "Ready to scan.";
  }

  function downloadScan() {

    if (!currentImage) return;

    const link = document.createElement("a");

    link.href = currentImage;
    link.download = "Gidy-Scanned-Document.jpg";

    link.click();

    status.textContent = "Image download started.";
  }

  window.openScan = openScan;
  window.closeScan = closeScan;
  window.resetScan = resetScan;
  window.downloadScan = downloadScan;

  scanCamera?.addEventListener("change", event => {
    loadImage(event.target.files[0]);
  });

  scanUpload?.addEventListener("change", event => {
    loadImage(event.target.files[0]);
  });

  console.log("Gidy Scan initialized successfully.");

});
