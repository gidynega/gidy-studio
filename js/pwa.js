/* =====================================
   GIDY STUDIO - PWA SUPPORT
   Installation and service worker setup
===================================== */
(() => {
  "use strict";

  const installButton = document.getElementById("installApp");
  let deferredPrompt = null;

  // Register the service worker after the page has loaded.
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      if (location.protocol !== "https:" && location.hostname !== "localhost") return;
      try {
        const registration = await navigator.serviceWorker.register("./service-worker.js");
        console.log("Gidy Studio service worker registered:", registration.scope);
      } catch (error) {
        console.error("Gidy Studio service worker registration failed:", error);
      }
    });
  }

  // Show the install button only when the browser supports the install prompt.
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (installButton) installButton.style.display = "inline-block";
  });

  if (installButton) {
    installButton.addEventListener("click", async () => {
      if (!deferredPrompt) {
        alert("To install Gidy Studio, open your browser menu and choose Install app or Add to Home screen.");
        return;
      }

      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installButton.style.display = "none";
    });
  }

  window.addEventListener("appinstalled", () => {
    if (installButton) installButton.style.display = "none";
    deferredPrompt = null;
  });
})();
