
/* =====================================
   GIDY STUDIO - PWA JAVASCRIPT
   Progressive Web App Installation
===================================== */

(() => {
  "use strict";

  // Register the service worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration =
          await navigator.serviceWorker.register("./service-worker.js");

        console.log(
          "Gidy Studio service worker registered:",
          registration.scope
        );
      } catch (error) {
        console.error(
          "Gidy Studio service worker registration failed:",
          error
        );
      }
    });
  }

  // App installation
  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;

    const installButton =
      document.getElementById("installApp");

    if (installButton) {
      installButton.hidden = false;
    }
  });

  window.installGidyStudio = async function () {
    if (!deferredPrompt) {
      alert(
        "To install Gidy Studio, open your browser menu and select Add to Home screen."
      );
      return;
    }

    deferredPrompt.prompt();

    const result = await deferredPrompt.userChoice;

    console.log("Installation result:", result.outcome);

    deferredPrompt = null;

    const installButton =
      document.getElementById("installApp");

    if (installButton) {
      installButton.hidden = true;
    }
  };

  // Detect successful installation
  window.addEventListener("appinstalled", () => {
    console.log("Gidy Studio installed successfully!");

    const installButton =
      document.getElementById("installApp");

    if (installButton) {
      installButton.hidden = true;
    }
  });

})();
