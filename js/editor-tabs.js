
/* =====================================
   GIDY STUDIO V11
   RIGHT EDITOR TAB CONTROLLER
===================================== */

document.addEventListener("DOMContentLoaded", () => {

  const editorTabs = document.querySelectorAll(
    ".editor-tab[data-editor-tab]"
  );

  const editorPanels = document.querySelectorAll(
    ".editor-tab-content[data-editor-panel]"
  );

  if (!editorTabs.length || !editorPanels.length) return;

  function activateEditorTab(tabName) {

    const targetPanel = Array.from(editorPanels).find(
      panel => panel.dataset.editorPanel === tabName
    );

    if (!targetPanel) return;

    editorTabs.forEach(tab => {
      const active = tab.dataset.editorTab === tabName;

      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    editorPanels.forEach(panel => {
      const active = panel.dataset.editorPanel === tabName;

      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });

  }

  editorTabs.forEach(tab => {

    tab.addEventListener("click", () => {
      activateEditorTab(tab.dataset.editorTab);
    });

  });

  activateEditorTab("design");

});
