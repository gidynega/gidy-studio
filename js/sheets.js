
/* ==========================================
   GIDY SHEETS — SPREADSHEET EDITOR
   Independent workspace and local storage
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const $ = selector => document.querySelector(selector);

  const screen = $("#sheetsScreen");
  const grid = $("#sheetsGrid");
  const status = $("#sheetsStatus");
  const formula = $("#sheetsFormula");
  const address = $("#sheetsCellAddress");

  if (!screen || !grid) return;

  const STORAGE_KEY = "gidy_sheets_v1";

  let activeCell = null;
  let sheets = [];
  let activeId = null;

  function showStatus(message) {
    if (status) status.textContent = message;
  }

  function createId() {
    return Date.now().toString(36);
  }

  function getCells() {
    return [...grid.querySelectorAll("tbody td")];
  }

  function getAddress(cell) {
    const row = cell.parentElement;
    const rowIndex = [...row.parentElement.children].indexOf(row) + 1;
    const columnIndex = [...row.children].indexOf(cell);
    return String.fromCharCode(64 + columnIndex) + rowIndex;
  }

  function updateFormulaBar(cell) {
    activeCell = cell;
    address.value = getAddress(cell);
    formula.value = cell.dataset.formula || cell.textContent;
  }

  function saveCurrent() {
    if (!activeId) return;

    const sheet = sheets.find(item => item.id === activeId);
    if (!sheet) return;

    sheet.html = grid.innerHTML;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
      showStatus("Spreadsheet saved on this device.");
    } catch (error) {
      showStatus("Unable to save spreadsheet.");
    }
  }

  function loadSheet(sheet) {
    activeId = sheet.id;
    grid.innerHTML = sheet.html;
    attachCells();
    showStatus("Spreadsheet opened.");
  }

  function createSheet() {
    const sheet = {
      id: createId(),
      html: grid.innerHTML
    };

    sheets.unshift(sheet);
    activeId = sheet.id;
    saveCurrent();
  }

  function attachCells() {
    getCells().forEach(cell => {
      cell.contentEditable = "true";

      cell.addEventListener("focus", () => {
        updateFormulaBar(cell);
      });

      cell.addEventListener("input", () => {
        delete cell.dataset.formula;
        showStatus("Unsaved changes...");
      });
    });
  }

  function columnName(index) {
    let name = "";

    while (index > 0) {
      let remainder = (index - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      index = Math.floor((index - 1) / 26);
    }

    return name;
  }

  function addRow() {
    const tbody = grid.querySelector("tbody");
    const columns = grid.querySelector("thead tr").children.length - 1;
    const row = document.createElement("tr");

    const number = document.createElement("th");
    number.textContent = tbody.children.length + 1;
    row.appendChild(number);

    for (let i = 0; i < columns; i++) {
      row.insertCell().contentEditable = "true";
    }

    tbody.appendChild(row);
    attachCells();
    showStatus("Row added.");
  }

  function addColumn() {
    const head = grid.querySelector("thead tr");
    const index = head.children.length;
    const heading = document.createElement("th");

    heading.textContent = columnName(index);
    head.appendChild(heading);

    grid.querySelectorAll("tbody tr").forEach(row => {
      row.insertCell().contentEditable = "true";
    });

    attachCells();
    showStatus("Column added.");
  }

  function deleteRow() {
    const tbody = grid.querySelector("tbody");

    if (tbody.children.length <= 1) return;

    const row = activeCell
      ? activeCell.parentElement
      : tbody.lastElementChild;

    if (row && row.parentElement === tbody) {
      row.remove();
    }

    [...tbody.children].forEach((row, index) => {
      row.firstElementChild.textContent = index + 1;
    });

    activeCell = null;
    showStatus("Row deleted.");
  }

  function deleteColumn() {
    const head = grid.querySelector("thead tr");

    if (head.children.length <= 2) return;

    const index = activeCell
      ? [...activeCell.parentElement.children].indexOf(activeCell)
      : head.children.length - 1;

    if (index <= 0) return;

    head.children[index].remove();

    grid.querySelectorAll("tbody tr").forEach(row => {
      row.children[index]?.remove();
    });

    activeCell = null;
    showStatus("Column deleted.");
  }

  function calculate(expression) {
    const match = expression.match(
      /^=SUM\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\)$/i
    );

    if (match) {
      const start = match[1].toUpperCase();
      const end = match[2].toUpperCase();

      const startColumn = start.match(/[A-Z]+/)[0];
      const endColumn = end.match(/[A-Z]+/)[0];

      const startRow = Number(start.match(/[0-9]+/)[0]);
      const endRow = Number(end.match(/[0-9]+/)[0]);

      const columnNumber = name => {
        let value = 0;
        for (const char of name) {
          value = value * 26 + char.charCodeAt(0) - 64;
        }
        return value;
      };

      if (startColumn !== endColumn) {
        return "Invalid range";
      }

      const column = columnNumber(startColumn);
      let total = 0;

      for (let r = startRow; r <= endRow; r++) {
        const row = grid.querySelectorAll("tbody tr")[r - 1];
        const cell = row?.children[column];

        total += Number(cell?.textContent || 0) || 0;
      }

      return total;
    }

    return expression;
  }

  $("#sheetsApply")?.addEventListener("click", () => {
    if (!activeCell) {
      showStatus("Select a cell first.");
      return;
    }

    const value = formula.value.trim();

    if (value.startsWith("=")) {
      activeCell.dataset.formula = value;
      activeCell.textContent = calculate(value);
    } else {
      delete activeCell.dataset.formula;
      activeCell.textContent = value;
    }

    showStatus("Cell updated.");
  });

  $("#sheetsAddRow")?.addEventListener("click", addRow);
  $("#sheetsAddColumn")?.addEventListener("click", addColumn);
  $("#sheetsDeleteRow")?.addEventListener("click", deleteRow);
  $("#sheetsDeleteColumn")?.addEventListener("click", deleteColumn);

  $("#sheetsBold")?.addEventListener("click", () => {
    if (!activeCell) return;
    activeCell.style.fontWeight =
      activeCell.style.fontWeight === "bold" ? "normal" : "bold";
  });

  $("#sheetsCellColor")?.addEventListener("input", event => {
    if (activeCell) {
      activeCell.style.backgroundColor = event.target.value;
    }
  });

  $("#sheetsSave")?.addEventListener("click", saveCurrent);

  $("#sheetsExport")?.addEventListener("click", () => {
    const blob = new Blob(
      [
        "<html><head><meta charset='UTF-8'></head><body>" +
        grid.outerHTML +
        "</body></html>"
      ],
      { type: "text/html" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Gidy-Sheets.html";
    link.click();

    URL.revokeObjectURL(url);
    showStatus("Spreadsheet exported.");
  });

  $("#sheetsBackHome")?.addEventListener("click", () => {
    saveCurrent();
    document.body.classList.remove("sheets-mode");
    document.body.classList.add("home-mode");
  });

  try {
    sheets = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    sheets = [];
  }

  attachCells();

  if (sheets.length) {
    loadSheet(sheets[0]);
  } else {
    createSheet();
  }

});
