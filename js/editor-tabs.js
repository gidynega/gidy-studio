/* =====================================
   GIDY STUDIO — EDITOR TAB & DRAWER CONTROLLER
   Supports desktop panels + mobile expandable drawer
===================================== */

document.addEventListener("DOMContentLoaded", () => {

  const editorTabs = document.querySelectorAll(
    ".editor-tab[data-editor-tab]"
  );

  const editorPanels = document.querySelectorAll(
    ".editor-tab-content[data-editor-panel]"
  );

  const propertiesPanel = document.getElementById("editorProperties");
  const drawerHeader = propertiesPanel
    ? propertiesPanel.querySelector(":scope > h2")
    : null;

  if (!editorTabs.length || !editorPanels.length) return;

  function isMobileViewport() {
    return window.matchMedia("(max-width: 720px)").matches;
  }

  function setDrawerCollapsed(collapsed) {
    if (!propertiesPanel) return;
    propertiesPanel.classList.toggle("drawer-collapsed", Boolean(collapsed));
  }

  function activateEditorTab(tabName, options = {}) {
    const targetPanel = Array.from(editorPanels).find(
      panel => panel.dataset.editorPanel === tabName
    );

    if (!targetPanel) return;

    const alreadyActive =
      targetPanel.classList.contains("active") && !targetPanel.hidden;

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

    if (isMobileViewport() && propertiesPanel) {
      if (options.toggleIfActive && alreadyActive) {
        setDrawerCollapsed(!propertiesPanel.classList.contains("drawer-collapsed"));
      } else {
        setDrawerCollapsed(false);
      }
    }
  }

  editorTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      activateEditorTab(tab.dataset.editorTab, { toggleIfActive: true });
    });
  });

  if (drawerHeader) {
    drawerHeader.addEventListener("click", () => {
      if (!isMobileViewport() || !propertiesPanel) return;
      setDrawerCollapsed(!propertiesPanel.classList.contains("drawer-collapsed"));
    });
  }

  window.addEventListener("resize", () => {
    if (!isMobileViewport()) {
      setDrawerCollapsed(false);
    }
  });

  window.GidyEditorTabs = {
    activate: tabName => activateEditorTab(tabName, { toggleIfActive: false }),
    setCollapsed: setDrawerCollapsed
  };

  activateEditorTab("design", { toggleIfActive: false });

});
