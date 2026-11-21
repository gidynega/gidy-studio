/* =====================================
   GIDY STUDIO - PWA SUPPORT
   Install prompt, updates & offline status
===================================== */
(() => {
  "use strict";

  const installButton = document.getElementById("installApp");
  const offlineBadge = document.getElementById("offlineBadge");
  let deferredPrompt = null;

  function syncConnectionBadge() {
    if (!offlineBadge) return;
    const isOnline = navigator.onLine !== false;
    offlineBadge.textContent = isOnline ? "● Ready" : "○ Offline";
    offlineBadge.classList.toggle("online", isOnline);
    offlineBadge.classList.toggle("offline", !isOnline);
    offlineBadge.title = isOnline
      ? "Online — PWA cached for offline use"
      : "Offline mode — editing & saving locally";
  }

  window.addEventListener("online", syncConnectionBadge);
  window.addEventListener("offline", syncConnectionBadge);
  syncConnectionBadge();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      if (location.protocol !== "https:" && location.hostname !== "localhost") return;
      try {
        const registration = await navigator.serviceWorker.register("./service-worker.js");
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;
          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
              const statusEl = document.getElementById("status");
              if (statusEl) {
                statusEl.textContent = "A new version of Gidy Studio is cached. Reload to apply.";
              }
            }
          });
        });
      } catch (error) {
        console.error("Gidy Studio service worker registration failed:", error);
      }
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (installButton) installButton.style.display = "inline-block";
  });

  if (installButton) {
    installButton.addEventListener("click", async () => {
      if (!deferredPrompt) {
        alert("To install Gidy Studio, open your browser menu and choose 'Install app' or 'Add to Home screen'.");
        return;
      }

      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } finally {
        deferredPrompt = null;
        installButton.style.display = "none";
      }
    });
  }

  window.addEventListener("appinstalled", () => {
    if (installButton) installButton.style.display = "none";
    deferredPrompt = null;
  });
})();
