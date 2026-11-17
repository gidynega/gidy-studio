/* =================================
   GIDY STUDIO — HOME NAVIGATION
================================= */

document.addEventListener("DOMContentLoaded", () => {

  const homeScreen = document.getElementById("homeScreen");

  if (!homeScreen) {
    console.warn("Home screen not found.");
    return;
  }

  // Navigation buttons
  document.querySelectorAll("[data-page]").forEach(button => {

    button.addEventListener("click", () => {

      const pageId = button.dataset.page;

      document.querySelectorAll(".app-page").forEach(page => {
        page.classList.remove("active");
      });

      const targetPage = document.getElementById(pageId);

      if (targetPage) {
        targetPage.classList.add("active");
      }

      document.querySelectorAll("[data-page]").forEach(item => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    });

  });

  // Open Home screen
  document.querySelectorAll('[data-page="homeScreen"]').forEach(button => {
    button.addEventListener("click", () => {
      homeScreen.classList.add("active");
    });
  });

});