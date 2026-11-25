
/* ==========================================
   GIDY RESUME — CV EDITOR
   Live preview, local saving and PDF export
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  const screen = $("resumeScreen");
  if (!screen) return;

  const home = $("homeScreen");
  const bottomNav = document.querySelector(".home-bottom-nav");
  const topBar = document.querySelector(".top");
  const layout = document.querySelector(".layout");
  const footer = document.querySelector(".bottom");

  const fields = [
    "resumeProjectName",
    "resumeName",
    "resumeTitle",
    "resumeEmail",
    "resumePhone",
    "resumeLocation",
    "resumeWebsite",
    "resumeSummary",
    "resumeExperience",
    "resumeEducation",
    "resumeSkills",
    "resumeProjects",
    "resumeAdditional"
  ];

  const storageKey = "gidy_resume_projects";

  function getData() {
    const data = {};

    fields.forEach(id => {
      data[id] = $(id)?.value || "";
    });

    return data;
  }

  function updatePreview() {
    const data = getData();

    $("previewName").textContent =
      data.resumeName || "Your Name";

    $("previewTitle").textContent =
      data.resumeTitle || "Your Professional Title";

    const contact = [
      data.resumeEmail,
      data.resumePhone,
      data.resumeLocation
    ].filter(Boolean);

    $("previewContact").textContent =
      contact.join("  ·  ") || "Email · Phone · Location";

    $("previewWebsite").textContent =
      data.resumeWebsite;

    const sections = [
      ["resumeSummary", "previewSummary", "previewSummaryBlock"],
      ["resumeExperience", "previewExperience", "previewExperienceBlock"],
      ["resumeEducation", "previewEducation", "previewEducationBlock"],
      ["resumeSkills", "previewSkills", "previewSkillsBlock"],
      ["resumeProjects", "previewProjects", "previewProjectsBlock"],
      ["resumeAdditional", "previewAdditional", "previewAdditionalBlock"]
    ];

    sections.forEach(([inputId, previewId, blockId]) => {
      const value = data[inputId];
      $(previewId).textContent = value || "Your information will appear here.";
      $(blockId).hidden = !value.trim();
    });
  }

  // LIVE PREVIEW
  fields.forEach(id => {
    $(id)?.addEventListener("input", updatePreview);
  });

  // OPEN RESUME WORKSPACE
  function openResume() {
    if (home) home.hidden = true;
    if (bottomNav) bottomNav.hidden = true;
    if (topBar) topBar.hidden = true;
    if (layout) layout.hidden = true;
    if (footer) footer.hidden = true;

    screen.hidden = false;

    document.body.classList.remove("home-mode", "editor-mode");
    document.body.classList.add("resume-mode");

    updatePreview();
    window.scrollTo(0, 0);
  }

  // OPEN FROM EXISTING PLUS MENU
  document.querySelectorAll('[data-tool="Resume"]').forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();

      document.getElementById("closeNew")?.click();
      openResume();
    });
  });

  // RETURN HOME
  $("resumeBackHome")?.addEventListener("click", () => {
    screen.hidden = true;

    if (home) home.hidden = false;
    if (bottomNav) bottomNav.hidden = false;
    if (topBar) topBar.hidden = false;
    if (layout) layout.hidden = false;
    if (footer) footer.hidden = false;

    document.body.classList.remove("resume-mode");
    document.body.classList.add("home-mode");

    window.scrollTo(0, 0);
  });

  // SAVE CV PROJECT
  $("resumeSave")?.addEventListener("click", () => {
    try {
      const data = getData();
      const name = data.resumeProjectName.trim() || "My CV";

      const projects = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
      );

      const existingIndex = projects.findIndex(
        project => project.name === name
      );

      const project = {
        name,
        data,
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        projects[existingIndex] = project;
      } else {
        projects.push(project);
      }

      localStorage.setItem(storageKey, JSON.stringify(projects));

      $("resumeStatus").textContent =
        "✓ Your CV project has been saved on this device.";
    } catch (error) {
      console.error("Resume save error:", error);

      $("resumeStatus").textContent =
        "Could not save. Please check your device storage.";
    }
  });

  // EXPORT CV AS PDF
  $("resumeExport")?.addEventListener("click", () => {
    updatePreview();

    const oldTitle = document.title;
    const name = $("resumeName")?.value.trim() || "My-CV";

    document.title = name.replace(/[^\w-]+/g, "-");

    window.print();

    setTimeout(() => {
      document.title = oldTitle;
    }, 1000);
  });

  updatePreview();

  console.log("Gidy Resume initialized successfully.");
});
