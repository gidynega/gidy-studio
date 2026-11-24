
/* ==========================================
   GIDY SHEETS — SPREADSHEET EDITOR
   Independent workspace and local storage
========================================== */

document.addEventListener("DOMContentLoaded", () => {

  // SELECTORS
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  // WORKSPACE ELEMENTS
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

  // STATUS MESSAGE
  function showStatus(message) {
    if (status) status.textContent = message;
  }

  // CREATE UNIQUE ID
  function createId() {
    return Date.now().toString(36);
  }

  // GET ALL CELLS
  function getCells() {
    return [...grid.querySelectorAll("tbody td")];
  }

  // GET CELL ADDRESS
  function getAddress(cell) {
    const row = cell.parentElement;
    const rowIndex =
      [...row.parentElement.children].indexOf(row) + 1;

    const columnIndex =
      [...row.children].indexOf(cell);

    return columnName(columnIndex) + rowIndex;
  }

  // UPDATE FORMULA BAR
  function updateFormulaBar(cell) {
    activeCell = cell;

    if (address) {
      address.value = getAddress(cell);
    }

    if (formula) {
      formula.value =
        cell.dataset.formula || cell.textContent;
    }
  }

  // SAVE CURRENT SPREADSHEET
  function saveCurrent() {
    if (!activeId) return;

    const sheet = sheets.find(item => item.id === activeId);

    if (!sheet) return;

    sheet.html = grid.innerHTML;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(sheets)
      );

      showStatus("Spreadsheet saved on this device.");
    } catch (error) {
      showStatus("Unable to save spreadsheet.");
    }
  }

  // LOAD SPREADSHEET
  function loadSheet(sheet) {
    activeId = sheet.id;
    grid.innerHTML = sheet.html;

    activeCell = null;

    attachCells();

    showStatus("Spreadsheet opened.");
  }

  // CREATE NEW SPREADSHEET
  function createSheet() {
    const sheet = {
      id: createId(),
      html: grid.innerHTML
    };

    sheets.unshift(sheet);
    activeId = sheet.id;

    saveCurrent();
  }

  // CONNECT CELL EVENTS
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

  // COLUMN LETTERS: A, B, C ... AA, AB
  function columnName(index) {
    let name = "";

    while (index > 0) {
      const remainder = (index - 1) % 26;

      name =
        String.fromCharCode(65 + remainder) + name;

      index = Math.floor((index - 1) / 26);
    }

    return name;
  }

  // ADD ROW
  function addRow() {
    const tbody = grid.querySelector("tbody");

    const columns =
      grid.querySelector("thead tr").children.length - 1;

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

  // ADD COLUMN
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

  // DELETE ROW
  function deleteRow() {
    const tbody = grid.querySelector("tbody");

    if (tbody.children.length <= 1) {
      showStatus("At least one row is required.");
      return;
    }

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

  // DELETE COLUMN
  function deleteColumn() {
    const head = grid.querySelector("thead tr");

    if (head.children.length <= 2) {
      showStatus("At least one column is required.");
      return;
    }

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

  // CALCULATE SUM FORMULA
  function calculate(expression) {
    const match = expression.match(
      /^=SUM\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\)$/i
    );

    if (!match) {
      return expression;
    }

    const start = match[1].toUpperCase();
    const end = match[2].toUpperCase();

    const startColumn = start.match(/[A-Z]+/)[0];
    const endColumn = end.match(/[A-Z]+/)[0];

    const startRow = Number(start.match(/[0-9]+/)[0]);
    const endRow = Number(end.match(/[0-9]+/)[0]);

    if (startColumn !== endColumn || startRow > endRow) {
      return "Invalid range";
    }

    const columnNumber = name => {
      let value = 0;

      for (const char of name) {
        value =
          value * 26 + char.charCodeAt(0) - 64;
      }

      return value;
    };

    const column = columnNumber(startColumn);

    let total = 0;

    for (let r = startRow; r <= endRow; r++) {
      const row =
        grid.querySelectorAll("tbody tr")[r - 1];

      const cell = row?.children[column];

      total += Number(cell?.textContent || 0) || 0;
    }

    return total;
  }

  // APPLY CELL VALUE OR FORMULA
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

  // ROW AND COLUMN BUTTONS
  $("#sheetsAddRow")?.addEventListener("click", addRow);

  $("#sheetsAddColumn")?.addEventListener(
    "click",
    addColumn
  );

  $("#sheetsDeleteRow")?.addEventListener(
    "click",
    deleteRow
  );

  $("#sheetsDeleteColumn")?.addEventListener(
    "click",
    deleteColumn
  );

  // BOLD CELL
  $("#sheetsBold")?.addEventListener("click", () => {

    if (!activeCell) {
      showStatus("Select a cell first.");
      return;
    }

    activeCell.style.fontWeight =
      activeCell.style.fontWeight === "bold"
        ? "normal"
        : "bold";

    showStatus("Cell formatting updated.");
  });

  // CELL BACKGROUND COLOR
  $("#sheetsCellColor")?.addEventListener(
    "input",
    event => {

      if (activeCell) {
        activeCell.style.backgroundColor =
          event.target.value;

        showStatus("Cell color updated.");
      }

    }
  );

  // SAVE BUTTON
  $("#sheetsSave")?.addEventListener(
    "click",
    saveCurrent
  );

  // EXPORT SPREADSHEET
  $("#sheetsExport")?.addEventListener("click", () => {

    saveCurrent();

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

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showStatus("Spreadsheet exported.");
  });

  // OPEN SHEETS WORKSPACE
  function openSheets() {

    $("#newSheet")?.classList.remove("open");

    // Hide other workspaces
    $("#homeScreen")?.setAttribute("hidden", "");
    $("#docsScreen")?.setAttribute("hidden", "");

    // Show Sheets
    screen.hidden = false;

    // Update page mode
    document.body.classList.remove(
      "home-mode",
      "docs-mode"
    );

    document.body.classList.add("sheets-mode");

    showStatus("Gidy Sheets is ready.");
  }

  // OPEN FROM + CREATION MENU
  $$('[data-create="Sheets"]').forEach(button => {

    button.addEventListener("click", event => {
      event.preventDefault();
      openSheets();
    });

  });

  // RETURN TO HOME
  $("#sheetsBackHome")?.addEventListener("click", () => {

    saveCurrent();

    // Hide Sheets
    screen.hidden = true;

    // Restore Home
    $("#homeScreen")?.removeAttribute("hidden");

    // Update page mode
    document.body.classList.remove("sheets-mode");

    document.body.classList.add("home-mode");

  });

  // LOAD SAVED SPREADSHEETS
  try {

    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    sheets = Array.isArray(saved) ? saved : [];

  } catch (error) {

    sheets = [];

  }

  // INITIALIZE SPREADSHEET
  attachCells();

  if (sheets.length > 0) {
    loadSheet(sheets[0]);
  } else {
    createSheet();
  }

});
