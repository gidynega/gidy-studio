/* =====================================================================
   GIDY STUDIO — CORE PRESENTATION ENGINE (V13 PRO)
   Slide Editor · Canvas Objects · Tables/Charts · AI · Export · Vault
   ===================================================================== */
(() => {
  "use strict";

  const PROJECT_KEY = "gidyStudioProject";
  const DECK_TITLE_KEY = "gidyStudioDeckTitle";
  const ASPECT_KEY = "gidyStudioAspect";

  const themes = {
    mint: { bg: "#f1f6f1", ink: "#173c35", accent: "#39836f", body: "#526b64", shape: "#b9e5d7" },
    midnight: { bg: "#111b35", ink: "#f3f5ff", accent: "#22d3ee", body: "#c2cbe0", shape: "#364b79" },
    sunset: { bg: "#fff1e7", ink: "#63351f", accent: "#d76b42", body: "#825b49", shape: "#f6c49f" },
    violet: { bg: "#f1edff", ink: "#35245f", accent: "#8b5cf6", body: "#655a85", shape: "#d1c4ff" }
  };

  const templates = {
    "mint-pro": { theme: "mint", layout: "split", eyebrow: "PROFESSIONAL PRESENTATION" },
    "dark-tech": { theme: "midnight", layout: "split", eyebrow: "FUTURE TECHNOLOGY" },
    "sunset-story": { theme: "sunset", layout: "title", eyebrow: "A STORY TO SHARE" },
    "violet-academic": { theme: "violet", layout: "standard", eyebrow: "LEARNING & RESEARCH" },
    "minimal-quote": { theme: "violet", layout: "quote", eyebrow: "KEY MESSAGE" }
  };

  const $ = id => document.getElementById(id);

  let slides = [
    {
      eyebrow: "GIDY STUDIO",
      title: "Welcome to Gidy Studio",
      body: "Create, animate, and present studio-grade slides on mobile or desktop.",
      theme: "midnight",
      layout: "title",
      transition: "fade",
      animation: "rise",
      elements: []
    }
  ];

  let current = 0;
  let undoStack = [];
  let redoStack = [];
  let transitionPending = false;
  let selectedCanvasKey = null;
  let copiedSlide = null;
  let zoomPercent = 100;
  let autosaveTimer = null;

  function msg(text) {
    const el = $("status");
    if (el) el.textContent = text;
  }

  function setAutosaveBadge(label, isSaving = false) {
    const badge = $("autosaveBadge");
    if (!badge) return;
    badge.textContent = label;
    badge.style.opacity = isSaving ? "0.75" : "1";
  }

  function snapshot() {
    return JSON.stringify({ slides, current });
  }

  function recordUndo() {
    const snap = snapshot();
    undoStack.push(snap);
    if (undoStack.length > 60) undoStack.shift();
    redoStack = [];
    updateHistoryButtons();
    scheduleAutosave();
  }

  function updateHistoryButtons() {
    if ($("undo")) $("undo").disabled = !undoStack.length;
    if ($("redo")) $("redo").disabled = !redoStack.length;
  }

  function restoreSnapshot(snap) {
    const data = JSON.parse(snap);
    slides = Array.isArray(data.slides) && data.slides.length ? data.slides : slides;
    current = Math.max(0, Math.min(Number(data.current) || 0, slides.length - 1));
    selectedCanvasKey = null;
    render();
    updateHistoryButtons();
  }

  function undo() {
    if (!undoStack.length) return;
    redoStack.push(snapshot());
    restoreSnapshot(undoStack.pop());
    msg("Last change undone.");
  }

  function redo() {
    if (!redoStack.length) return;
    undoStack.push(snapshot());
    restoreSnapshot(redoStack.pop());
    msg("Change restored.");
  }

  function saveProjectNow(showFeedback = true) {
    try {
      const payload = {
        version: 13,
        savedAt: new Date().toISOString(),
        slides
      };
      localStorage.setItem(PROJECT_KEY, JSON.stringify(payload));
      setAutosaveBadge("Saved", false);
      if (window.GidyLibrary?.saveCurrentToLibrary) {
        window.GidyLibrary.saveCurrentToLibrary();
      }
      if (showFeedback) msg("Project saved on this device.");
      return true;
    } catch (err) {
      setAutosaveBadge("Storage Full", false);
      if (showFeedback) msg("Could not save locally. Media/images may exceed browser storage.");
      return false;
    }
  }

  function scheduleAutosave() {
    setAutosaveBadge("Saving...", true);
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      saveProjectNow(false);
    }, 650);
  }

  /* ---------- CANVAS OBJECTS, TABLES, CHARTS & DIAGRAMS ---------- */
  function createChartMarkup(chartType) {
    if (chartType === "pie") {
      return `
        <div class="slide-chart-box">
          <div class="slide-chart-title">Key Metrics Breakdown</div>
          <div class="slide-bar-group">
            <div class="slide-bar-col"><div class="slide-bar-fill" style="height:85%"></div><span>85%</span></div>
            <div class="slide-bar-col"><div class="slide-bar-fill" style="height:64%"></div><span>64%</span></div>
            <div class="slide-bar-col"><div class="slide-bar-fill" style="height:92%"></div><span>92%</span></div>
          </div>
        </div>
      `;
    }
    if (chartType === "process") {
      return `
        <div class="slide-process-diagram">
          <div class="process-node"><b>01. Plan</b><span>Define goal</span></div>
          <div class="process-node"><b>02. Build</b><span>Structure slides</span></div>
          <div class="process-node"><b>03. Deliver</b><span>Present &amp; share</span></div>
        </div>
      `;
    }
    return `
      <div class="slide-chart-box">
        <div class="slide-chart-title">Performance Comparison</div>
        <div class="slide-bar-group">
          <div class="slide-bar-col"><div class="slide-bar-fill" style="height:52%"></div><span>Phase 1</span></div>
          <div class="slide-bar-col"><div class="slide-bar-fill" style="height:76%"></div><span>Phase 2</span></div>
          <div class="slide-bar-col"><div class="slide-bar-fill" style="height:94%"></div><span>Phase 3</span></div>
          <div class="slide-bar-col"><div class="slide-bar-fill" style="height:88%"></div><span>Phase 4</span></div>
        </div>
      </div>
    `;
  }

  function createTableMarkup(rows, cols) {
    const rCount = Math.max(2, Math.min(8, Number(rows) || 3));
    const cCount = Math.max(2, Math.min(6, Number(cols) || 3));
    let html = '<table class="slide-table"><thead><tr>';
    for (let c = 0; c < cCount; c++) {
      html += `<th contenteditable="true">Column ${c + 1}</th>`;
    }
    html += "</tr></thead><tbody>";
    for (let r = 1; r < rCount; r++) {
      html += "<tr>";
      for (let c = 0; c < cCount; c++) {
        html += `<td contenteditable="true">Item ${r}.${c + 1}</td>`;
      }
      html += "</tr>";
    }
    html += "</tbody></table>";
    return html;
  }

  function addCanvasElement(type, extraOptions = {}) {
    recordUndo();
    const id = "obj_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
    const isRich = type === "table" || type === "chart";
    const item = {
      id,
      type,
      text: type === "text" ? "Double-click to edit text" : type === "icon" ? "★" : "",
      chartType: extraOptions.chartType || "bar",
      tableHtml: type === "table" ? createTableMarkup(extraOptions.rows, extraOptions.cols) : "",
      x: isRich ? 14 : 14,
      y: isRich ? 24 : 20,
      w: type === "table" ? 68 : type === "chart" ? 56 : type === "text" ? 36 : 20,
      h: type === "table" ? 42 : type === "chart" ? 44 : type === "text" ? 16 : 20,
      fill: type === "circle" ? "#22d3ee" : type === "rect" ? "#8b5cf6" : "#22d3ee",
      borderColor: "#38bdf8",
      borderWidth: 0,
      shadow: false,
      rotation: 0,
      font: $("objectFont")?.value || "Inter, system-ui, sans-serif"
    };

    const s = slides[current];
    s.elements = s.elements || [];
    s.elements.push(item);
    s.objects = s.objects || {};
    s.objects[id] = { x: item.x, y: item.y, w: item.w, h: item.h };
    selectedCanvasKey = id;
    render();
    msg(`Inserted ${type}. Drag to move or drag the corner handle to resize.`);
  }

  function renderExtraElements() {
    const p = $("slidePreview");
    if (!p) return;
    p.querySelectorAll('[data-extra-object="1"]').forEach(n => n.remove());

    const s = slides[current];
    (s.elements || []).forEach((o, i) => {
      const n = document.createElement("div");
      n.dataset.extraObject = "1";
      n.dataset.canvasKey = o.id;
      n.className = "canvas-object extra-object" + (o.id === selectedCanvasKey ? " is-selected" : "");

      const isTextLike = o.type === "text" || o.type === "icon" || o.type === "arrow";
      const isRich = o.type === "table" || o.type === "chart";
      const bgVal = isRich || isTextLike ? "transparent" : (o.fill || "#8b5cf6");
      const radiusVal = o.type === "circle" ? "50%" : isRich ? "10px" : "4px";
      const clipVal = o.type === "triangle" ? "polygon(50% 0, 0 100%, 100% 100%)" : "none";
      const colorVal = isTextLike ? (o.fill || "#22d3ee") : "#0b1120";
      const borderVal = o.borderWidth ? `${o.borderWidth}px solid ${o.borderColor || "#38bdf8"}` : (o.type === "text" ? "1px dashed rgba(148,173,214,0.45)" : "none");
      const shadowVal = o.shadow ? "0 12px 28px rgba(0, 0, 0, 0.45)" : "none";
      const rotVal = Number(o.rotation) || 0;

      n.style.cssText = [
        "position:absolute",
        `left:${o.x}%`,
        `top:${o.y}%`,
        `width:${o.w}%`,
        `height:${o.h}%`,
        `background:${bgVal}`,
        `border-radius:${radiusVal}`,
        `clip-path:${clipVal}`,
        `border:${borderVal}`,
        `box-shadow:${shadowVal}`,
        `transform:rotate(${rotVal}deg)`,
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "padding:6px",
        "box-sizing:border-box",
        `color:${colorVal}`,
        "font-weight:700",
        `font-family:${JSON.stringify(o.font || "Arial")}`,
        `font-size:${o.type === "icon" ? "clamp(18px,3.5vw,42px)" : "clamp(11px,2vw,26px)"}`,
        "white-space:pre-wrap",
        "overflow:hidden",
        `z-index:${10 + i}`
      ].join(";");

      if (o.type === "table") {
        n.innerHTML = o.tableHtml || createTableMarkup(3, 3);
        n.addEventListener("input", () => {
          o.tableHtml = n.innerHTML;
          scheduleAutosave();
        });
      } else if (o.type === "chart") {
        n.innerHTML = createChartMarkup(o.chartType || "bar");
      } else {
        n.textContent = o.text || (o.type === "arrow" ? "➜" : "");
        if (o.type === "text" || o.type === "icon") {
          n.contentEditable = "true";
          n.addEventListener("input", () => {
            o.text = n.textContent;
            scheduleAutosave();
          });
        }
      }

      p.appendChild(n);

      if (o.id === selectedCanvasKey) {
        if ($("objectColor") && /^#[0-9a-fA-F]{6}$/.test(o.fill || "")) {
          $("objectColor").value = o.fill;
        }
        if ($("objectRotation")) {
          $("objectRotation").value = String(rotVal);
          if ($("rotationValue")) $("rotationValue").textContent = `${rotVal}°`;
        }
        if ($("objectBorderWidth")) {
          $("objectBorderWidth").value = String(Number(o.borderWidth) || 0);
        }
        if ($("objectShadow")) {
          $("objectShadow").checked = Boolean(o.shadow);
        }
        const h = document.createElement("span");
        h.className = "resize-handle";
        h.setAttribute("data-html2canvas-ignore", "true");
        n.appendChild(h);
      }
    });
  }

  function applyCanvasTransforms() {
    const p = $("slidePreview");
    const s = slides[current];
    if (!p || !s) return;

    const nodes = {
      eyebrow: p.querySelector(".eyebrow"),
      title: p.querySelector("h3"),
      body: p.querySelector("p"),
      image: p.querySelector(".slide-image")
    };

    Object.entries(nodes).forEach(([key, node]) => {
      if (!node) return;
      node.classList.add("canvas-object");
      node.dataset.canvasKey = key;
      const pos = s.objects && s.objects[key];
      if (pos) {
        node.style.position = "absolute";
        node.style.left = pos.x + "%";
        node.style.top = pos.y + "%";
        node.style.width = pos.w + "%";
        node.style.height = pos.h + "%";
        node.style.maxWidth = "none";
        node.style.maxHeight = "none";
        node.style.margin = "0";
        node.style.boxSizing = "border-box";
      } else {
        node.style.position = "";
        node.style.left = "";
        node.style.top = "";
        node.style.width = "";
        node.style.height = "";
        node.style.maxWidth = "";
        node.style.maxHeight = "";
        node.style.margin = "";
      }
    });
  }

  function ensureObjectPosition(key, node) {
    const s = slides[current];
    if (!s.objects) s.objects = {};
    if (s.objects[key]) return s.objects[key];
    const pr = $("slidePreview").getBoundingClientRect();
    const r = node.getBoundingClientRect();
    const pos = {
      x: Math.max(0, ((r.left - pr.left) / pr.width) * 100),
      y: Math.max(0, ((r.top - pr.top) / pr.height) * 100),
      w: Math.min(100, (r.width / pr.width) * 100),
      h: Math.min(100, (r.height / pr.height) * 100)
    };
    s.objects[key] = pos;
    return pos;
  }

  let activeCanvasPointer = null;

  function drawAlignmentGuides(cx, cy) {
    const p = $("slidePreview");
    if (!p) return;
    p.querySelectorAll(".alignment-guide").forEach(n => n.remove());
    if (Math.abs(cx - 50) < 2) {
      const g = document.createElement("i");
      g.className = "alignment-guide vertical";
      g.setAttribute("data-html2canvas-ignore", "true");
      p.appendChild(g);
    }
    if (Math.abs(cy - 50) < 2) {
      const g = document.createElement("i");
      g.className = "alignment-guide horizontal";
      g.setAttribute("data-html2canvas-ignore", "true");
      p.appendChild(g);
    }
  }

  function snapValue(v) {
    return $("snapGrid")?.checked ? Math.round(v / 5) * 5 : v;
  }

  function bindCanvasPointerEvents() {
    const preview = $("slidePreview");
    if (!preview) return;

    preview.addEventListener("pointerdown", e => {
      const handle = e.target.closest(".resize-handle");
      const node = e.target.closest(".canvas-object");
      if (!node) return;
      const key = node.dataset.canvasKey;
      if (!key) return;

      selectedCanvasKey = key;
      const pr = preview.getBoundingClientRect();
      const pos = ensureObjectPosition(key, node);
      recordUndo();

      document.querySelectorAll(".canvas-object").forEach(n => n.classList.remove("is-selected"));
      node.classList.add("is-selected");

      if (!node.querySelector(".resize-handle")) {
        const h = document.createElement("span");
        h.className = "resize-handle";
        h.setAttribute("aria-label", "Resize object");
        h.setAttribute("data-html2canvas-ignore", "true");
        node.appendChild(h);
      }

      activeCanvasPointer = {
        id: e.pointerId,
        key,
        node,
        startX: e.clientX,
        startY: e.clientY,
        start: { ...pos },
        mode: handle ? "resize" : "move",
        width: pr.width,
        height: pr.height
      };
      node.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    preview.addEventListener("pointermove", e => {
      const a = activeCanvasPointer;
      if (!a || a.id !== e.pointerId) return;
      const dx = ((e.clientX - a.startX) / a.width) * 100;
      const dy = ((e.clientY - a.startY) / a.height) * 100;
      const p = slides[current].objects[a.key];
      if (!p) return;

      if (a.mode === "resize") {
        p.w = Math.max(6, Math.min(100 - a.start.x, a.start.w + dx));
        p.h = Math.max(5, Math.min(100 - a.start.y, a.start.h + dy));
      } else {
        let nx = Math.max(0, Math.min(100 - a.start.w, a.start.x + dx));
        let ny = Math.max(0, Math.min(100 - a.start.h, a.start.y + dy));
        nx = snapValue(nx);
        ny = snapValue(ny);
        if (Math.abs(nx + a.start.w / 2 - 50) < 1.5) nx = 50 - a.start.w / 2;
        if (Math.abs(ny + a.start.h / 2 - 50) < 1.5) ny = 50 - a.start.h / 2;
        p.x = Math.max(0, Math.min(100 - a.start.w, nx));
        p.y = Math.max(0, Math.min(100 - a.start.h, ny));
      }

      drawAlignmentGuides(p.x + a.start.w / 2, p.y + a.start.h / 2);
      a.node.style.left = p.x + "%";
      a.node.style.top = p.y + "%";
      a.node.style.width = p.w + "%";
      a.node.style.height = p.h + "%";

      const extra = (slides[current].elements || []).find(o => o.id === a.key);
      if (extra) {
        extra.x = p.x;
        extra.y = p.y;
        extra.w = p.w;
        extra.h = p.h;
      }
    });

    const finishPointer = e => {
      if (activeCanvasPointer && (!e || activeCanvasPointer.id === e.pointerId)) {
        activeCanvasPointer = null;
        preview.querySelectorAll(".alignment-guide").forEach(n => n.remove());
        scheduleAutosave();
      }
    };

    preview.addEventListener("pointerup", finishPointer);
    preview.addEventListener("pointercancel", finishPointer);
  }

  /* ---------- ASPECT RATIO & ZOOM ---------- */
  function applyAspectAndZoom() {
    const p = $("slidePreview");
    if (!p) return;
    const aspect = $("slideAspect")?.value || localStorage.getItem(ASPECT_KEY) || "16:9";
    if ($("slideAspect")) $("slideAspect").value = aspect;
    localStorage.setItem(ASPECT_KEY, aspect);

    p.classList.remove("aspect-16-9", "aspect-4-3", "aspect-9-16");
    if (aspect === "4:3") p.classList.add("aspect-4-3");
    else if (aspect === "9:16") p.classList.add("aspect-9-16");
    else p.classList.add("aspect-16-9");

    const scale = zoomPercent / 100;
    p.style.transform = scale === 1 ? "" : `scale(${scale})`;
    if ($("zoomLevel")) $("zoomLevel").textContent = `${zoomPercent}%`;
  }

  /* ---------- RENDER ENGINE ---------- */
  function formatBodyText(raw, s) {
    const text = String(raw || "");
    if (s.listStyle === "bullets") {
      return text
        .split(/\r?\n/)
        .map(line => line.trim() ? (line.trim().startsWith("•") ? line.trim() : `• ${line.trim()}`) : "")
        .filter(Boolean)
        .join("\n");
    }
    if (s.listStyle === "numbered") {
      let idx = 1;
      return text
        .split(/\r?\n/)
        .map(line => line.trim() ? `${idx++}. ${line.trim().replace(/^\d+\.\s*/, "")}` : "")
        .filter(Boolean)
        .join("\n");
    }
    return text;
  }

  function render() {
    const p = $("slidePreview");
    if (!p) return;
    const s = slides[current] || slides[0];
    const th = themes[s.theme] || themes.mint;

    p.classList.toggle("grid-visible", $("showGrid")?.checked !== false);
    p.classList.remove("transition-fade", "transition-push", "transition-zoom", "transition-flip");
    p.style.setProperty("--trans-dur", `${s.transitionDuration || 0.55}s`);
    p.style.setProperty("--anim-dur", "0.7s");
    p.style.setProperty("--anim-delay", `${s.animationDelay || 0}s`);

    if (transitionPending) {
      const effect = s.transition || "fade";
      if (effect !== "none") p.classList.add("transition-" + effect);
      transitionPending = false;
    }

    p.querySelectorAll(".canvas-object").forEach(n => {
      n.classList.remove("is-selected");
      const h = n.querySelector(".resize-handle");
      if (h) h.remove();
    });

    p.classList.remove("anim-fade", "anim-rise", "anim-zoom", "anim-slide", "anim-bounce");
    if (s.animation && s.animation !== "none") p.classList.add("anim-" + s.animation);

    p.classList.remove("layout-standard", "layout-title", "layout-split", "layout-image-focus", "layout-quote");
    p.classList.add("layout-" + (s.layout || "standard"));

    p.classList.remove("bg-navy-cyber", "bg-nebula-purple", "bg-obsidian-gold", "bg-emerald-wave");
    if (s.backgroundImage) {
      p.style.background = `linear-gradient(rgba(0,0,0,0.28),rgba(0,0,0,0.28)),url(${JSON.stringify(s.backgroundImage)}) center/cover no-repeat`;
    } else if (s.bgGradient && s.bgGradient !== "theme") {
      p.style.background = "";
      p.classList.add("bg-" + s.bgGradient);
    } else if (s.bgColor) {
      p.style.background = s.bgColor;
    } else {
      p.style.background = th.bg;
    }

    const isDarkCustomBg = Boolean(s.bgGradient && s.bgGradient !== "theme") || Boolean(s.backgroundImage);
    p.style.color = isDarkCustomBg ? "#f8fafc" : th.ink;

    const eyebrowEl = p.querySelector(".eyebrow");
    const titleEl = p.querySelector("h3");
    const bodyEl = p.querySelector("p");

    if (eyebrowEl) {
      eyebrowEl.textContent = s.eyebrow || "";
      eyebrowEl.style.color = isDarkCustomBg ? "#22d3ee" : th.accent;
    }

    if (titleEl) {
      titleEl.textContent = s.title || "";
      titleEl.style.fontSize = (s.titleSize || 44) + "px";
      titleEl.style.fontWeight = s.titleBold === false ? "500" : "800";
      titleEl.style.fontStyle = s.titleItalic ? "italic" : "normal";
      titleEl.style.textDecoration = s.titleUnderline ? "underline" : "none";
      titleEl.style.color = s.titleColor || (isDarkCustomBg ? "#ffffff" : th.ink);
    }

    if (bodyEl) {
      bodyEl.textContent = formatBodyText(s.body, s);
      bodyEl.style.fontSize = (s.bodySize || 20) + "px";
      bodyEl.style.lineHeight = String(s.lineSpacing || 1.45);
      bodyEl.style.color = isDarkCustomBg ? "#e2e8f0" : th.body;
    }

    p.classList.remove("text-left", "text-center", "text-right");
    p.classList.add("text-" + (s.textAlign || (s.layout === "title" || s.layout === "quote" ? "center" : "left")));

    const img = p.querySelector(".slide-image");
    if (img) {
      if (s.image) {
        img.src = s.image;
        img.classList.add("visible");
      } else {
        img.removeAttribute("src");
        img.classList.remove("visible");
      }
    }

    const shapeEl = p.querySelector(".shape");
    if (shapeEl) shapeEl.style.background = th.shape;

    const pageEl = p.querySelector(".page");
    if (pageEl) pageEl.textContent = String(current + 1).padStart(2, "0");

    const mediaBox = $("slideMedia");
    if (mediaBox) {
      mediaBox.innerHTML = "";
      mediaBox.style.display = "none";
      mediaBox.classList.remove("audio-only");
      if (s.media && typeof s.media.data === "string" && s.media.data.startsWith("data:")) {
        const player = document.createElement(s.media.kind === "audio" ? "audio" : "video");
        player.src = s.media.data;
        player.controls = true;
        player.preload = "metadata";
        if (s.media.kind === "video") {
          player.playsInline = true;
          player.setAttribute("playsinline", "");
        }
        mediaBox.appendChild(player);
        if (s.media.kind === "audio") mediaBox.classList.add("audio-only");
        if (s.mediaCaption) {
          const cap = document.createElement("div");
          cap.className = "media-caption";
          cap.textContent = s.mediaCaption;
          mediaBox.appendChild(cap);
        }
        mediaBox.style.display = "grid";
      }
 if ($("presenterNotesText")) {
      $("presenterNotesText").textContent = s.speakerNotes || "No speaker notes for this slide.";
    }

    applyCanvasTransforms();
    renderExtraElements();
    applyAspectAndZoom();

    // Sync inspector inputs
    if ($("eyebrow")) $("eyebrow").value = s.eyebrow || "";
    if ($("title")) $("title").value = s.title || "";
    if ($("body")) $("body").value = s.body || "";
    if ($("speakerNotes")) $("speakerNotes").value = s.speakerNotes || "";
    if ($("theme")) $("theme").value = s.theme || "mint";
    if ($("layout")) $("layout").value = s.layout || "standard";
    if ($("bgGradient")) $("bgGradient").value = s.bgGradient || "theme";
    if ($("bgColor") && /^#[0-9a-fA-F]{6}$/.test(s.bgColor || "")) $("bgColor").value = s.bgColor;
    if ($("titleSize")) $("titleSize").value = s.titleSize || 44;
    if ($("bodySize")) $("bodySize").value = s.bodySize || 20;
    if ($("lineSpacing")) $("lineSpacing").value = String(s.lineSpacing || 1.45);
    if ($("titleColor")) $("titleColor").value = s.titleColor || th.ink;
    if ($("textAlign")) $("textAlign").value = s.textAlign || (s.layout === "title" || s.layout === "quote" ? "center" : "left");
    if ($("titleBold")) $("titleBold").checked = s.titleBold !== false;
    if ($("titleItalic")) $("titleItalic").checked = Boolean(s.titleItalic);
    if ($("titleUnderline")) $("titleUnderline").checked = Boolean(s.titleUnderline);
    if ($("removeImage")) $("removeImage").disabled = !s.image;
    if ($("mediaCaption")) $("mediaCaption").value = s.mediaCaption || "";
    if ($("removeMedia")) $("removeMedia").disabled = !s.media;
    if ($("slideAnimation")) $("slideAnimation").value = s.animation || "fade";
    if ($("slideTransition")) $("slideTransition").value = s.transition || "fade";
    if ($("transitionDuration")) $("transitionDuration").value = String(s.transitionDuration || 0.55);
    if ($("animationDelay")) $("animationDelay").value = String(s.animationDelay || 0);
    if ($("slideCount")) $("slideCount").textContent = `Slide ${current + 1} of ${slides.length}`;

    const listEl = $("slideList");
    if (listEl) {
      listEl.innerHTML = "";
      slides.forEach((x, i) => {
        const b = document.createElement("button");
        b.className = "slide-item" + (i === current ? " active" : "");
        b.innerHTML = `<div class="thumb">${i + 1}</div><span></span>`;
        b.querySelector("span").textContent = x.title || "Untitled slide";
        b.onclick = () => goToSlide(i);
        listEl.appendChild(b);
      });
    }
  }

  function renderListOnly() {
    const listEl = $("slideList");
    if (!listEl) return;
    [...listEl.children].forEach((b, i) => {
      const span = b.querySelector("span");
      if (span && slides[i]) span.textContent = slides[i].title || "Untitled slide";
    });
  }

  function goToSlide(index) {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    if (next === current) return;
    current = next;
    selectedCanvasKey = null;
    transitionPending = true;
    render();
  }
 /* ---------- BIND CONTROLS ---------- */
  const liveFieldIds = [
    "eyebrow", "title", "body", "theme", "layout",
    "titleSize", "bodySize", "titleColor", "textAlign",
    "titleBold", "titleItalic", "titleUnderline", "lineSpacing"
  ];

  liveFieldIds.forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener("input", () => {
      recordUndo();
      const s = slides[current];
      s.eyebrow = $("eyebrow")?.value ?? s.eyebrow;
      s.title = $("title")?.value ?? s.title;
      s.body = $("body")?.value ?? s.body;
      s.theme = $("theme")?.value ?? s.theme;
      s.layout = $("layout")?.value ?? s.layout;
      s.titleSize = Number($("titleSize")?.value || 44);
      s.bodySize = Number($("bodySize")?.value || 20);
      s.lineSpacing = Number($("lineSpacing")?.value || 1.45);
      s.titleColor = $("titleColor")?.value || undefined;
      s.textAlign = $("textAlign")?.value || "left";
      s.titleBold = $("titleBold")?.checked !== false;
      s.titleItalic = Boolean($("titleItalic")?.checked);
      s.titleUnderline = Boolean($("titleUnderline")?.checked);
      render();
    });
  });

  if ($("toggleBullets")) {
    $("toggleBullets").onclick = () => {
      recordUndo();
      const s = slides[current];
      s.listStyle = s.listStyle === "bullets" ? "none" : "bullets";
      render();
      msg(s.listStyle === "bullets" ? "Bullet formatting enabled." : "Bullet formatting removed.");
    };
  }

  if ($("toggleNumbering")) {
    $("toggleNumbering").onclick = () => {
      recordUndo();
      const s = slides[current];
      s.listStyle = s.listStyle === "numbered" ? "none" : "numbered";
      render();
      msg(s.listStyle === "numbered" ? "Numbered list formatting enabled." : "Numbered list removed.");
    };
  }

  if ($("bgGradient")) {
    $("bgGradient").onchange = () => {
      recordUndo();
      slides[current].bgGradient = $("bgGradient").value;
      delete slides[current].bgColor;
      render();
      msg("Slide background gradient updated.");
    };
  }

  if ($("bgColor")) {
    $("bgColor").oninput = () => {
      recordUndo();
      slides[current].bgColor = $("bgColor").value;
      slides[current].bgGradient = "theme";
      render();
    };
  }

  if ($("applyBgAll")) {
    $("applyBgAll").onclick = () => {
      recordUndo();
      const src = slides[current];
      slides = slides.map(sl => ({
        ...sl,
        theme: src.theme,
        bgGradient: src.bgGradient || "theme",
        bgColor: src.bgColor
      }));
      render();
      msg("Background styling applied to all slides.");
    };
  }
// Insert elements
  if ($("addText")) $("addText").onclick = () => addCanvasElement("text");
  if ($("addRect")) $("addRect").onclick = () => addCanvasElement("rect");
  if ($("addCircle")) $("addCircle").onclick = () => addCanvasElement("circle");
  if ($("addTriangle")) $("addTriangle").onclick = () => addCanvasElement("triangle");
  if ($("addArrow")) $("addArrow").onclick = () => addCanvasElement("arrow");
  if ($("addIcon")) $("addIcon").onclick = () => addCanvasElement("icon");
  if ($("addTable")) {
    $("addTable").onclick = () => addCanvasElement("table", {
      rows: $("tableRows")?.value || 3,
      cols: $("tableCols")?.value || 3
    });
  }
  if ($("addChart")) {
    $("addChart").onclick = () => {
      const cType = $("chartType")?.value || "bar";
      addCanvasElement(cType === "process" ? "process" : "chart", { chartType: cType });
    };
  }

  // Object styling & arrangement
  if ($("objectFont")) {
    $("objectFont").onchange = () => {
      const o = (slides[current].elements || []).find(x => x.id === selectedCanvasKey);
      if (!o) {
        msg("Select a text box, icon, or shape first.");
        return;
      }
      recordUndo();
      o.font = $("objectFont").value;
      render();
      msg("Font updated.");
    };
  }

  if ($("objectColor")) {
    $("objectColor").addEventListener("input", () => {
      if (!selectedCanvasKey) return;
      const obj = (slides[current].elements || []).find(o => o.id === selectedCanvasKey);
      if (!obj) return;
      obj.fill = $("objectColor").value;
      renderExtraElements();
      scheduleAutosave();
    });
  }

  if ($("objectRotation")) {
    $("objectRotation").addEventListener("input", () => {
      const deg = Number($("objectRotation").value) || 0;
      if ($("rotationValue")) $("rotationValue").textContent = `${deg}°`;
      if (!selectedCanvasKey) return;
      const obj = (slides[current].elements || []).find(o => o.id === selectedCanvasKey);
      if (!obj) return;
      obj.rotation = deg;
      renderExtraElements();
      scheduleAutosave();
    });
  }

  if ($("objectBorderWidth")) {
    $("objectBorderWidth").onchange = () => {
      if (!selectedCanvasKey) return;
      const obj = (slides[current].elements || []).find(o => o.id === selectedCanvasKey);
      if (!obj) return;
      recordUndo();
      obj.borderWidth = Number($("objectBorderWidth").value) || 0;
      obj.borderColor = $("objectBorderColor")?.value || "#38bdf8";
      render();
    };
  }
 if ($("objectBorderColor")) {
    $("objectBorderColor").oninput = () => {
      if (!selectedCanvasKey) return;
      const obj = (slides[current].elements || []).find(o => o.id === selectedCanvasKey);
      if (!obj) return;
      obj.borderColor = $("objectBorderColor").value;
      if (!obj.borderWidth) obj.borderWidth = 2;
      renderExtraElements();
      scheduleAutosave();
    };
  }

  if ($("objectShadow")) {
    $("objectShadow").onchange = () => {
      if (!selectedCanvasKey) return;
      const obj = (slides[current].elements || []).find(o => o.id === selectedCanvasKey);
      if (!obj) return;
      recordUndo();
      obj.shadow = $("objectShadow").checked;
      render();
    };
  }

  document.querySelectorAll("[data-align]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!selectedCanvasKey) {
        msg("Tap a slide element first to align it.");
        return;
      }
      const s = slides[current];
      s.objects = s.objects || {};
      const box = s.objects[selectedCanvasKey];
      if (!box) return;
      recordUndo();
      const dir = btn.dataset.align;
      if (dir === "left") box.x = 4;
      else if (dir === "center") box.x = Math.max(0, (100 - box.w) / 2);
      else if (dir === "right") box.x = Math.max(0, 96 - box.w);
      else if (dir === "top") box.y = 6;
      else if (dir === "middle") box.y = Math.max(0, (100 - box.h) / 2);
      else if (dir === "bottom") box.y = Math.max(0, 92 - box.h);

      const extra = (s.elements || []).find(o => o.id === selectedCanvasKey);
      if (extra) {
        extra.x = box.x;
        extra.y = box.y;
      }
      render();
      msg(`Aligned element (${dir}).`);
    });
  });

  if ($("duplicateObject")) {
    $("duplicateObject").onclick = () => {
      if (!selectedCanvasKey) {
        msg("Select an element to duplicate.");
        return;
      }
      const s = slides[current];
      const src = (s.elements || []).find(o => o.id === selectedCanvasKey);
      if (!src) return;
      recordUndo();
      const copy = JSON.parse(JSON.stringify(src));
      copy.id = "obj_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      copy.x = Math.min(80, (Number(copy.x) || 10) + 5);
      copy.y = Math.min(80, (Number(copy.y) || 10) + 5);
      s.elements.push(copy);
      s.objects = s.objects || {};
      s.objects[copy.id] = { x: copy.x, y: copy.y, w: copy.w, h: copy.h };
      selectedCanvasKey = copy.id;
      render();
      msg("Element duplicated.");
    };
  }

  if ($("deleteObject")) {
    $("deleteObject").onclick = () => {
      if (!selectedCanvasKey) {
        msg("Select an object first.");
        return;
      }
      recordUndo();
      const s = slides[current];
      s.elements = (s.elements || []).filter(o => o.id !== selectedCanvasKey);
      if (s.objects) delete s.objects[selectedCanvasKey];
      selectedCanvasKey = null;
      render();
      msg("Selected object deleted.");
    };
  }
if ($("layerUp")) {
    $("layerUp").onclick = () => {
      const a = slides[current].elements || [];
      const i = a.findIndex(o => o.id === selectedCanvasKey);
      if (i < 0 || i === a.length - 1) return;
      recordUndo();
      [a[i], a[i + 1]] = [a[i + 1], a[i]];
      render();
    };
  }

  if ($("layerDown")) {
    $("layerDown").onclick = () => {
      const a = slides[current].elements || [];
      const i = a.findIndex(o => o.id === selectedCanvasKey);
      if (i <= 0) return;
      recordUndo();
      [a[i], a[i - 1]] = [a[i - 1], a[i]];
      render();
    };
  }

  if ($("showGrid")) {
    $("showGrid").addEventListener("change", () => {
      $("slidePreview")?.classList.toggle("grid-visible", $("showGrid").checked);
    });
  }

  // Animations & transitions
  if ($("slideAnimation")) {
    $("slideAnimation").onchange = () => {
      recordUndo();
      slides[current].animation = $("slideAnimation").value;
      render();
      msg("Object animation updated.");
    };
  }

  if ($("slideTransition")) {
    $("slideTransition").onchange = () => {
      recordUndo();
      slides[current].transition = $("slideTransition").value;
      render();
      msg("Slide transition updated.");
    };
  }

  if ($("transitionDuration")) {
    $("transitionDuration").onchange = () => {
      recordUndo();
      slides[current].transitionDuration = Number($("transitionDuration").value) || 0.55;
      render();
    };
  }

  if ($("animationDelay")) {
    $("animationDelay").onchange = () => {
      recordUndo();
      slides[current].animationDelay = Number($("animationDelay").value) || 0;
      render();
    };
  }

  if ($("applyTransitionAll")) {
    $("applyTransitionAll").onclick = () => {
      recordUndo();
      const tr = slides[current].transition || "fade";
      const dur = slides[current].transitionDuration || 0.55;
      slides = slides.map(sl => ({ ...sl, transition: tr, transitionDuration: dur }));
      render();
      msg("Transition applied to all slides.");
    };
  }

  if ($("animate")) {
    $("animate").onclick = () => {
      const p = $("slidePreview");
      if (!p) return;
      const a = slides[current].animation || "fade";
      p.classList.remove("anim-fade", "anim-rise", "anim-zoom", "anim-slide", "anim-bounce");
      void p.offsetWidth;
      if (a !== "none") p.classList.add("anim-" + a);
      msg(`Previewing animation: ${a}.`);
    };
  }

  // Notes, media, background & images
  if ($("speakerNotes")) {
    $("speakerNotes").addEventListener("input", () => {
      slides[current].speakerNotes = $("speakerNotes").value;
      if ($("presenterNotesText")) {
        $("presenterNotesText").textContent = slides[current].speakerNotes || "No speaker notes for this slide.";
      }
      scheduleAutosave();
    });
  }

  if ($("toggleNotesDrawer")) {
    $("toggleNotesDrawer").onclick = () => {
      const bar = $("presenterNotesBar");
      if (!bar) return;
      bar.hidden = !bar.hidden;
    };
  }

  if ($("mediaCaption")) {
    $("mediaCaption").addEventListener("input", () => {
      slides[current].mediaCaption = $("mediaCaption").value;
      const cap = $("slideMedia")?.querySelector(".media-caption");
      if (cap) cap.textContent = $("mediaCaption").value;
      scheduleAutosave();
    });
  }
function loadSlideMedia(file, kind) {
    if (!file) return;
    if (kind === "video" && !["video/mp4", "video/webm"].includes(file.type)) {
      msg("Choose an MP4 or WebM video.");
      return;
    }
    if (kind === "audio" && !["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-wav"].includes(file.type)) {
      msg("Choose an MP3, WAV, OGG, or M4A audio file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      msg("Choose a media file smaller than 3 MB for reliable mobile storage.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      recordUndo();
      slides[current].media = { kind, data: reader.result, name: file.name };
      render();
      msg(`${kind} added to slide.`);
    };
    reader.onerror = () => msg("Could not read media file.");
    reader.readAsDataURL(file);
  }

  if ($("videoUpload")) {
    $("videoUpload").onchange = e => {
      loadSlideMedia(e.target.files?.[0], "video");
      e.target.value = "";
    };
  }
  if ($("audioUpload")) {
    $("audioUpload").onchange = e => {
      loadSlideMedia(e.target.files?.[0], "audio");
      e.target.value = "";
    };
  }
  if ($("removeMedia")) {
    $("removeMedia").onclick = () => {
      if (!slides[current].media) return;
      recordUndo();
      delete slides[current].media;
      delete slides[current].mediaCaption;
      render();
      msg("Slide media removed.");
    };
  }

  if ($("backgroundUpload")) {
    $("backgroundUpload").onchange = e => {
      const f = e.target.files?.[0];
      if (!f) return;
      if (!f.type.startsWith("image/") || f.size > 5 * 1024 * 1024) {
        msg("Choose an image smaller than 5 MB.");
        e.target.value = "";
        return;
      }
      const r = new FileReader();
      r.onload = () => {
        recordUndo();
        slides[current].backgroundImage = r.result;
        render();
        msg("Background image added.");
      };
      r.readAsDataURL(f);
    };
  }
  if ($("removeBackground")) {
    $("removeBackground").onclick = () => {
      recordUndo();
      delete slides[current].backgroundImage;
      render();
      msg("Background image removed.");
    };
  }

  if ($("imageUpload")) {
    $("imageUpload").onchange = e => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        msg("Please choose an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        msg("Please choose an image smaller than 5 MB.");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        recordUndo();
        slides[current].image = reader.result;
        render();
        msg("Slide image inserted.");
      };
      reader.onerror = () => msg("Could not read image.");
      reader.readAsDataURL(file);
    };
  }
  if ($("removeImage")) {
    $("removeImage").onclick = () => {
      recordUndo();
      delete slides[current].image;
      render();
      msg("Slide image removed.");
    };
  }

  if ($("applyTemplate")) {
    $("applyTemplate").onclick = () => {
      const t = templates[$("template")?.value];
      if (!t) return;
      recordUndo();
      slides = slides.map((s, i) => ({
        ...s,
        theme: t.theme,
        layout: t.layout,
        bgGradient: "theme",
        eyebrow: i === 0 ? t.eyebrow : (s.eyebrow || t.eyebrow)
      }));
      render();
      msg("Template applied across presentation.");
    };
  }
// Slide management
  if ($("addSlide")) {
    $("addSlide").onclick = () => {
      recordUndo();
      slides.push({
        eyebrow: "NEW SECTION",
        title: "Your new slide",
        body: "Add key points, explanations, or visuals here.",
        theme: slides[current].theme || "midnight",
        layout: "standard",
        transition: slides[current].transition || "fade",
        animation: slides[current].animation || "fade",
        elements: []
      });
      current = slides.length - 1;
      selectedCanvasKey = null;
      render();
      msg("New slide added.");
    };
  }

  if ($("deleteSlide")) {
    $("deleteSlide").onclick = () => {
      if (slides.length === 1) {
        msg("A presentation must have at least one slide.");
        return;
      }
      recordUndo();
      slides.splice(current, 1);
      current = Math.max(0, current - 1);
      selectedCanvasKey = null;
      render();
      msg("Slide deleted.");
    };
  }

  if ($("duplicate")) {
    $("duplicate").onclick = () => {
      recordUndo();
      const copy = JSON.parse(JSON.stringify(slides[current]));
      slides.splice(current + 1, 0, copy);
      current++;
      render();
      msg("Slide duplicated.");
    };
  }

  if ($("copySlide")) {
    $("copySlide").onclick = () => {
      copiedSlide = JSON.parse(JSON.stringify(slides[current]));
      msg(`Copied Slide ${current + 1} to clipboard.`);
    };
  }

  if ($("pasteSlide")) {
    $("pasteSlide").onclick = () => {
      if (!copiedSlide) {
        msg("Copy a slide first using ⧉.");
        return;
      }
      recordUndo();
      slides.splice(current + 1, 0, JSON.parse(JSON.stringify(copiedSlide)));
      current++;
      render();
      msg("Slide pasted.");
    };
  }

  if ($("moveSlideUp")) {
    $("moveSlideUp").onclick = () => {
      if (current <= 0) return;
      recordUndo();
      [slides[current - 1], slides[current]] = [slides[current], slides[current - 1]];
      current--;
      render();
      msg("Moved slide earlier.");
    };
  }

  if ($("moveSlideDown")) {
    $("moveSlideDown").onclick = () => {
      if (current >= slides.length - 1) return;
      recordUndo();
      [slides[current + 1], slides[current]] = [slides[current], slides[current + 1]];
      current++;
      render();
      msg("Moved slide later.");
    };
  }

  if ($("slideAspect")) $("slideAspect").onchange = applyAspectAndZoom;
  if ($("zoomIn")) $("zoomIn").onclick = () => { zoomPercent = Math.min(130, zoomPercent + 10); applyAspectAndZoom(); };
  if ($("zoomOut")) $("zoomOut").onclick = () => { zoomPercent = Math.max(70, zoomPercent - 10); applyAspectAndZoom(); };

  if ($("prev")) $("prev").onclick = () => goToSlide(current - 1);
  if ($("next")) $("next").onclick = () => goToSlide(current + 1);

  function setPresentMode(on) {
    document.body.classList.toggle("presenting", on);
    if ($("present")) $("present").style.display = on ? "none" : "";
    if ($("exitPresent")) $("exitPresent").style.display = on ? "" : "none";
    msg(on ? "Slideshow active. Use ← / → keys or buttons; press Esc to exit." : "Returned to editor.");
  }

  if ($("present")) $("present").onclick = () => setPresentMode(true);
  if ($("exitPresent")) $("exitPresent").onclick = () => setPresentMode(false);

  document.addEventListener("keydown", e => {
    if (document.body.classList.contains("presenting")) {
      if (e.key === "Escape") { setPresentMode(false); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); goToSlide(current + 1); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); goToSlide(current - 1); return; }
    }
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const k = e.key.toLowerCase();
    if (k === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
    else if (k === "y" || (k === "z" && e.shiftKey)) { e.preventDefault(); redo(); }
  });

  if ($("undo")) $("undo").onclick = undo;
  if ($("redo")) $("redo").onclick = redo;
  if ($("save")) $("save").onclick = () => saveProjectNow(true);

  if ($("activeDeckTitle")) {
    const savedTitle = localStorage.getItem(DECK_TITLE_KEY);
    if (savedTitle) $("activeDeckTitle").textContent = savedTitle;
    $("activeDeckTitle").addEventListener("input", () => {
      const t = ($("activeDeckTitle").textContent || "").trim() || "Untitled Presentation";
      localStorage.setItem(DECK_TITLE_KEY, t);
      scheduleAutosave();
    });
  }
if ($("newDeck")) {
    $("newDeck").onclick = () => {
      recordUndo();
      slides = [{
        eyebrow: "GIDY STUDIO",
        title: "Untitled presentation",
        body: "Start crafting your presentation.",
        theme: "midnight",
        layout: "title",
        transition: "fade",
        animation: "rise",
        elements: []
      }];
      current = 0;
      selectedCanvasKey = null;
      render();
      msg("New presentation ready.");
    };
  }

  if ($("backup")) {
    $("backup").onclick = () => {
      try {
        const deckName = ($("activeDeckTitle")?.textContent || "Gidy-Studio-Presentation").trim();
        const data = { app: "Gidy Studio", version: 13, title: deckName, exportedAt: new Date().toISOString(), slides };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${deckName.replace(/[^a-z0-9-_]+/gi, "_")}-Backup.json`;
        a.click();
        URL.revokeObjectURL(url);
        msg("JSON backup downloaded.");
      } catch (e) {
        msg("Backup failed: " + e.message);
      }
    };
  }

  if ($("importProject") && $("importFile")) {
    $("importProject").onclick = () => $("importFile").click();
    $("importFile").onchange = e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          const incoming = Array.isArray(data) ? data : data.slides;
          if (!Array.isArray(incoming) || !incoming.length || incoming.length > 200) {
            throw new Error("Invalid slide deck JSON.");
          }
          const clean = incoming.map(s => {
            if (!s || typeof s !== "object") throw new Error("Invalid slide entry.");
            return {
              speakerNotes: String(s.speakerNotes || "").slice(0, 20000),
              mediaCaption: String(s.mediaCaption || "").slice(0, 160),
              ...(s.media && ["audio", "video"].includes(s.media.kind) && typeof s.media.data === "string" && s.media.data.startsWith("data:") && s.media.data.length < 5 * 1024 * 1024
                ? { media: { kind: s.media.kind, data: s.media.data, name: String(s.media.name || "media").slice(0, 180) } }
                : {}),
              transition: ["fade", "push", "zoom", "flip", "none"].includes(s.transition) ? s.transition : "fade",
              transitionDuration: Number(s.transitionDuration) || 0.55,
              animationDelay: Number(s.animationDelay) || 0,
              bgGradient: s.bgGradient || "theme",
              bgColor: /^#[0-9a-fA-F]{6}$/.test(s.bgColor || "") ? s.bgColor : undefined,
              listStyle: ["none", "bullets", "numbered"].includes(s.listStyle) ? s.listStyle : "none",
              elements: Array.isArray(s.elements) ? s.elements.slice(0, 100) : [],
              eyebrow: String(s.eyebrow || "").slice(0, 120),
              title: String(s.title || "Untitled slide").slice(0, 300),
              body: String(s.body || "").slice(0, 10000),
              theme: themes[s.theme] ? s.theme : "midnight",
              layout: ["standard", "title", "split", "image-focus", "quote"].includes(s.layout) ? s.layout : "standard",
              animation: ["fade", "rise", "zoom", "slide", "bounce", "none"].includes(s.animation) ? s.animation : "fade",
              backgroundImage: typeof s.backgroundImage === "string" && s.backgroundImage.startsWith("data:image/") && s.backgroundImage.length < 8 * 1024 * 1024 ? s.backgroundImage : undefined,
              titleSize: Number.isFinite(Number(s.titleSize)) ? Math.max(20, Math.min(64, Number(s.titleSize))) : 44,
              bodySize: Number.isFinite(Number(s.bodySize)) ? Math.max(12, Math.min(32, Number(s.bodySize))) : 20,
              lineSpacing: Number(s.lineSpacing) || 1.45,
              titleColor: /^#[0-9a-fA-F]{6}$/.test(s.titleColor || "") ? s.titleColor : undefined,
              textAlign: ["left", "center", "right"].includes(s.textAlign) ? s.textAlign : undefined,
              titleBold: s.titleBold !== false,
              titleItalic: Boolean(s.titleItalic),
              titleUnderline: Boolean(s.titleUnderline),
              ...(s.objects && typeof s.objects === "object" ? { objects: s.objects } : {}),
              ...(typeof s.image === "string" && s.image.startsWith("data:image/") && s.image.length < 8 * 1024 * 1024 ? { image: s.image } : {})
            };
          });
          recordUndo();
          slides = clean;
          current = 0;
          if (data.title && $("activeDeckTitle")) {
            $("activeDeckTitle").textContent = String(data.title).slice(0, 120);
            localStorage.setItem(DECK_TITLE_KEY, $("activeDeckTitle").textContent);
          }
          render();
          saveProjectNow(false);
          msg("Presentation imported and saved.");
        } catch (err) {
          msg("Import failed: " + err.message);
        } finally {
          $("importFile").value = "";
        }
      };
      reader.readAsText(file);
    };
  }
/* ---------- AI OUTLINE & SMART SLIDE ACTIONS ---------- */
  function buildTopicDeck(topic, count = 5, styleMode = "educational", templateKey = "dark-tech") {
    const tpl = templates[templateKey] || templates["dark-tech"];
    const baseSections = styleMode === "business"
      ? [
          ["EXECUTIVE SUMMARY", topic, `Vision, problem statement, and strategic value of ${topic}.`],
          ["MARKET OPPORTUNITY", "Problem & Opportunity", `Why ${topic} matters now and who benefits most.`],
          ["SOLUTION ARCHITECTURE", "Our Approach", `Core capabilities, workflow, and differentiation for ${topic}.`],
          ["IMPACT & METRICS", "Traction & Outcomes", `Key milestones, measurable impact, and growth drivers.`],
          ["NEXT STEPS", "Roadmap & Action Plan", `Immediate priorities, timeline, and call to action.`]
        ]
      : styleMode === "summary"
      ? [
          ["QUICK OVERVIEW", topic, `High-yield summary of ${topic} for fast review.`],
          ["CORE POINTS", "Essential Principles", `Crucial definitions and rules for ${topic}.`],
          ["COMMON PITFALLS", "What to Watch Out For", `Frequent mistakes or edge cases in ${topic}.`],
          ["PRACTICE CHECK", "Self-Test Summary", `Key questions to verify mastery of ${topic}.`],
          ["FINAL RECAP", "One-Minute Takeaway", `Bottom-line summary of ${topic}.`]
        ]
      : [
          ["OVERVIEW", topic, `Introduction, scope, and clinical/academic significance of ${topic}.`],
          ["DEFINITIONS & ETIOLOGY", "Foundations & Causes", `Key definitions, underlying mechanisms, and risk factors of ${topic}.`],
          ["PATHOPHYSIOLOGY & PROCESS", "How It Works", `Step-by-step progression and key processes in ${topic}.`],
          ["FEATURES & DIAGNOSIS", "Identification & Assessment", `Main characteristics, findings, and evaluation criteria for ${topic}.`],
          ["MANAGEMENT & SUMMARY", "Intervention & Key Takeaways", `Core strategies, prevention, and summary of ${topic}.`]
        ];

    const themeCycle = ["midnight", "violet", "mint", "sunset"];
    const layoutCycle = ["title", "split", "standard", "image-focus", "quote"];
    const generated = [];

    for (let i = 0; i < count; i++) {
      const sec = baseSections[i % baseSections.length];
      const suffix = i >= baseSections.length ? ` (Part ${Math.floor(i / baseSections.length) + 1})` : "";
      generated.push({
        eyebrow: sec[0],
        title: `${sec[1]}${suffix}`,
        body: sec[2],
        speakerNotes: `Speaker note for slide ${i + 1}: expand on ${sec[1]} with concrete examples.`,
        theme: i === 0 ? tpl.theme : themeCycle[i % themeCycle.length],
        layout: i === 0 ? "title" : layoutCycle[i % layoutCycle.length],
        transition: "fade",
        animation: i % 2 === 0 ? "rise" : "fade",
        elements: []
      });
    }
    return generated;
  }

  if ($("generate")) {
    $("generate").onclick = () => {
      const topic = ($("prompt")?.value || "").trim();
      if (!topic) {
        msg("Enter a presentation topic first.");
        return;
      }
      recordUndo();
      slides = buildTopicDeck(topic, 5, "educational", $("template")?.value || "dark-tech");
      current = 0;
      render();
      msg("Generated a 5-slide structured outline. Customize each slide as needed.");
    };
  }

 
// =====================================
// GIDY STUDIO — HYBRID AI SLIDE GENERATOR
// Local generation + optional secure AI API
// =====================================

function buildDetailedLocalDeck(topic, count, style, templateKey) {
  const medical = /disease|medicine|pharmacy|clinical|drug|health|anatomy|physiology|pharmacology|therapy|patient|diagnosis/i.test(topic);

  const business = style === "business";

  const sections = business
    ? [
        ["INTRODUCTION", "Overview", `Introduce ${topic}, its purpose and importance.`],
        ["PROBLEM", "The Challenge", `Explain the main problems, needs and opportunities related to ${topic}.`],
        ["ANALYSIS", "Key Findings", `Present the major factors, evidence and considerations concerning ${topic}.`],
        ["SOLUTION", "Proposed Strategy", `Describe practical approaches and solutions for ${topic}.`],
        ["IMPLEMENTATION", "Action Plan", `Explain the implementation steps, resources and responsibilities.`],
        ["EVALUATION", "Measuring Success", `Identify indicators, expected outcomes and evaluation methods.`],
        ["CONCLUSION", "Recommendations", `Summarize the most important recommendations about ${topic}.`]
      ]
    : medical
    ? [
        ["INTRODUCTION", "Overview and Definition", `Define ${topic}, introduce its classification and explain its clinical significance.`],
        ["ETIOLOGY", "Causes and Risk Factors", `Discuss the causes, predisposing factors and risk factors associated with ${topic}.`],
        ["PATHOPHYSIOLOGY", "Mechanism of Disease", `Explain the biological mechanisms and step-by-step pathophysiological processes involved in ${topic}.`],
        ["MANIFESTATIONS", "Signs and Symptoms", `Describe common clinical manifestations, characteristic symptoms and important physical findings.`],
        ["DIAGNOSIS", "Clinical Assessment", `Discuss history taking, physical examination, laboratory investigations and diagnostic criteria.`],
        ["MANAGEMENT", "Treatment Goals", `Explain the therapeutic goals, prevention strategies and overall management approach.`],
        ["PHARMACOTHERAPY", "Drug Treatment", `Discuss relevant drug classes, mechanisms of action, indications and treatment selection for ${topic}.`],
        ["SAFETY", "Contraindications and Adverse Effects", `Explain important precautions, contraindications, adverse drug effects and safety considerations.`],
        ["MONITORING", "Follow-up and Complications", `Discuss treatment monitoring, response assessment, complications and prevention.`],
        ["SUMMARY", "Key Takeaways", `Review the most important clinical and practical points about ${topic}.`]
      ]
    : [
        ["INTRODUCTION", "Understanding the Topic", `Define ${topic}, explain its background and describe why it matters.`],
        ["FOUNDATIONS", "Core Concepts", `Introduce the essential principles, terminology and foundations of ${topic}.`],
        ["COMPONENTS", "Main Elements", `Describe the major components, characteristics and important features of ${topic}.`],
        ["PROCESS", "How It Works", `Explain the processes, mechanisms and relationships involved in ${topic}.`],
        ["APPLICATIONS", "Practical Applications", `Show how ${topic} is applied in real situations, with relevant examples.`],
        ["ANALYSIS", "Benefits and Challenges", `Evaluate the advantages, limitations and common challenges associated with ${topic}.`],
        ["EXAMPLES", "Illustrative Examples", `Present practical examples and explain what they demonstrate about ${topic}.`],
        ["STRATEGIES", "Best Practices", `Describe effective strategies, recommendations and approaches for ${topic}.`],
        ["REVIEW", "Knowledge Check", `Provide important review questions and concepts to remember about ${topic}.`],
        ["CONCLUSION", "Summary and Takeaways", `Summarize the central ideas, conclusions and key lessons about ${topic}.`]
      ];

  const themes = ["midnight", "violet", "mint", "sunset"];
  const layouts = ["title", "split", "standard", "image-focus", "quote"];

  return Array.from({ length: count }, (_, i) => {
    const section = sections[i % sections.length];
    const repeat = Math.floor(i / sections.length);

    return {
      eyebrow: section[0],
      title: section[1] + (repeat ? ` — Part ${repeat + 1}` : ""),
      body: section[2] + (medical
        ? "\n\nInclude relevant clinical examples, important terminology and practical considerations."
        : "\n\nInclude clear explanations, relevant examples and practical takeaways."),
      speakerNotes:
        `Presenter notes: Explain ${section[1].toLowerCase()} in relation to ${topic}. Expand on the key concepts and give an appropriate example.`,
      theme: themes[i % themes.length],
      layout: i === 0 ? "title" : layouts[i % layouts.length],
      transition: "fade",
      animation: i % 2 === 0 ? "rise" : "fade",
      elements: []
    };
  });
}

function validateGeneratedSlides(data, expectedCount) {
  const list = Array.isArray(data) ? data : data?.slides;

  if (!Array.isArray(list) || list.length !== expectedCount) {
    throw new Error("AI returned an invalid slide structure.");
  }

  return list.map((slide, i) => {
    if (!slide || typeof slide.title !== "string" ||
        typeof slide.body !== "string") {
      throw new Error(`Slide ${i + 1} is incomplete.`);
    }

    return {
      eyebrow: String(slide.eyebrow || "PRESENTATION").slice(0, 100),
      title: slide.title.slice(0, 200),
      body: slide.body.slice(0, 6000),
      speakerNotes: String(slide.speakerNotes || ""),
      theme: "midnight",
      layout: i === 0 ? "title" : "standard",
      transition: "fade",
      animation: "rise",
      elements: []
    };
  });
}

if ($("generateAISlides")) {
  $("generateAISlides").onclick = async () => {
    const topic = ($("aiSlideTopic")?.value || "").trim();
    const status = $("aiGeneratorStatus");
    const button = $("generateAISlides");

    if (!topic) {
      status.textContent = "Please enter a presentation topic first.";
      return;
    }

    const count = Number($("aiSlideCount")?.value || 10);
    const style = $("aiAudienceStyle")?.value || "educational";
    const template = $("aiSlideTemplate")?.value || "mint-pro";

    button.disabled = true;
    status.textContent = "Preparing your presentation...";

    let generatedSlides;
    let generationMode = "Local";

    try {
      // Optional secure AI backend.
      const apiUrl = window.GIDY_AI_API_URL;

      if (apiUrl) {
        try {
          status.textContent = "Generating with AI...";

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              task: "generate_presentation",
              topic,
              slideCount: count,
              style
            })
          });

          if (!response.ok) {
            throw new Error("AI service unavailable.");
          }

          const result = await response.json();
          generatedSlides = validateGeneratedSlides(result, count);
          generationMode = "AI";
        } catch (error) {
          console.warn("AI generation unavailable:", error);
          status.textContent = "AI unavailable. Using local generation...";
        }
      }

      // Free local fallback.
      if (!generatedSlides) {
        generatedSlides = buildDetailedLocalDeck(
          topic,
          count,
          style,
          template
        );
      }

      recordUndo();

      slides = generatedSlides;
      current = 0;

      const title = topic.split(/[-—\n]/)[0]
        .trim().slice(0, 60) || "AI Presentation";

      localStorage.setItem(DECK_TITLE_KEY, title);

      if ($("activeDeckTitle")) {
        $("activeDeckTitle").textContent = title;
      }

      saveProjectNow(false);

      document.getElementById("aiGeneratorScreen")
        ?.classList.remove("open");

      document.body.classList.remove("home-mode");
      document.body.classList.add("editor-mode");

      render();

      status.textContent = "";

      msg(`${generationMode} presentation created: ${slides.length} slides.`);
    } catch (error) {
      console.error(error);
      status.textContent = "Generation failed: " + error.message;
    } finally {
      button.disabled = false;
    }
  };
}


  if ($("aiImproveText")) {
    $("aiImproveText").onclick = () => {
      const s = slides[current];
      recordUndo();
      s.body = (s.body || "").trim()
        .replace(/\s+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2");
      if (s.body && !/[.!?]$/.test(s.body)) s.body += ".";
      render();
      msg("Polished slide body text.");
    };
  }

  if ($("aiSummarizeSlide")) {
    $("aiSummarizeSlide").onclick = () => {
      const s = slides[current];
      recordUndo();
      const parts = (s.body || "")
        .split(/[.!?;\n]+/)
        .map(x => x.trim())
        .filter(Boolean);
      s.listStyle = "bullets";
      s.body = parts.length ? parts.slice(0, 4).join("\n") : "Key point 1\nKey point 2\nKey point 3";
      render();
      msg("Summarized slide into concise bullet points.");
    };
  }

  if ($("aiSuggestLayout")) {
    $("aiSuggestLayout").onclick = () => {
      const s = slides[current];
      recordUndo();
      if (s.image) s.layout = "split";
      else if ((s.body || "").length < 75) s.layout = "quote";
      else s.layout = "standard";
      render();
      msg(`Suggested "${s.layout}" layout for this slide.`);
    };
  }

  if ($("aiStudyQuiz")) {
    $("aiStudyQuiz").onclick = () => {
      recordUndo();
      const topic = slides[current]?.title || "this topic";
      slides.splice(current + 1, 0, {
        eyebrow: "ACTIVE RECALL CHECK",
        title: `Review Question: ${topic}`,
        body: `1. What is the core mechanism or main idea of ${topic}?\n2. Name two key features or applications.\n3. How would you explain it in one sentence?`,
        speakerNotes: "Pause 30 seconds for audience or student response before revealing key points.",
        theme: slides[current].theme || "midnight",
        layout: "standard",
        transition: "fade",
        animation: "rise",
        elements: []
      });
      current++;
      render();
      msg("Added an active-recall review slide.");
    };
  }
/* ---------- EXPORTS (PPTX, PDF, PNG, SHARE) ---------- */
  function pptObjectBox(s, key, fallback) {
    const o = s.objects && s.objects[key];
    if (!o) return fallback;
    return {
      x: Math.max(0, Math.min(12.4, (Number(o.x) / 100) * 12.4)),
      y: Math.max(0, Math.min(6.9, (Number(o.y) / 100) * 6.9)),
      w: Math.max(0.3, Math.min(12.4 - (Number(o.x) / 100) * 12.4, (Number(o.w) / 100) * 12.4)),
      h: Math.max(0.2, Math.min(6.9 - (Number(o.y) / 100) * 6.9, (Number(o.h) / 100) * 6.9))
    };
  }

  if ($("exportPpt")) {
    $("exportPpt").onclick = async () => {
      if (!window.PptxGenJS) {
        msg("PowerPoint library did not load. Check connection and reload.");
        return;
      }
      try {
        const pptx = new window.PptxGenJS();
        pptx.layout = "LAYOUT_WIDE";
        pptx.author = "Gidy Studio";
        pptx.title = ($("activeDeckTitle")?.textContent || "Gidy Studio Presentation").trim();

        slides.forEach((s, i) => {
          const t = themes[s.theme] || themes.mint;
          const sl = pptx.addSlide();
          sl.background = { color: t.bg.replace("#", "") };
          if (s.backgroundImage) {
            sl.addImage({ data: s.backgroundImage, x: 0, y: 0, w: 13.333, h: 7.5 });
          }
          if (s.speakerNotes) sl.addNotes(s.speakerNotes);

          const layout = s.layout || "standard";
          let titleBox = { x: 0.7, y: 1.55, w: 11.3, h: 1.8, align: "left" };
          let bodyBox = { x: 0.75, y: 3.65, w: 10.8, h: 2.1, align: "left" };
          let imgBox = { x: 8.0, y: 2.0, w: 3.6, h: 3.4 };

          if (layout === "title" || layout === "quote") {
            titleBox = { x: 1.1, y: 2.0, w: 10.5, h: 1.8, align: "center" };
            bodyBox = { x: 1.5, y: 4.0, w: 9.5, h: 1.4, align: "center" };
          } else if (layout === "split") {
            titleBox = { x: 0.7, y: 2.0, w: 5.2, h: 1.7, align: "left" };
            bodyBox = { x: 0.75, y: 4.0, w: 5.1, h: 1.6, align: "left" };
            imgBox = { x: 6.5, y: 1.8, w: 5.0, h: 4.5 };
          } else if (layout === "image-focus") {
            titleBox = { x: 1.0, y: 1.15, w: 10.3, h: 1.0, align: "center" };
            bodyBox = { x: 1.2, y: 2.1, w: 9.9, h: 0.8, align: "center" };
            imgBox = { x: 2.8, y: 3.0, w: 6.5, h: 3.2 };
          }

          titleBox = pptObjectBox(s, "title", titleBox);
          bodyBox = pptObjectBox(s, "body", bodyBox);
          const eyebrowBox = pptObjectBox(s, "eyebrow", { x: 0.7, y: 0.55, w: 11, h: 0.35 });

          sl.addText(s.eyebrow || "", { ...eyebrowBox, fontFace: "Aptos", fontSize: 13, bold: true, color: t.accent.replace("#", ""), charSpacing: 2 });
          sl.addText(s.title || "", {
            ...titleBox,
            fontFace: "Aptos Display",
            align: s.textAlign || titleBox.align,
            fontSize: Math.max(16, Math.min(54, (s.titleSize || 44) * 0.72)),
            bold: s.titleBold !== false,
            italic: Boolean(s.titleItalic) || layout === "quote",
            underline: Boolean(s.titleUnderline),
            color: (s.titleColor || t.ink).replace("#", ""),
            fit: "shrink"
          });
          sl.addText(formatBodyText(s.body, s), {
            ...bodyBox,
            align: s.textAlign || bodyBox.align,
            fontFace: "Aptos",
            fontSize: Math.max(10, Math.min(28, (s.bodySize || 20) * 0.72)),
            color: t.body.replace("#", ""),
            fit: "shrink"
          });

          if (s.image) {
            imgBox = pptObjectBox(s, "image", imgBox);
            sl.addImage({ data: s.image, ...imgBox, sizingCrop: true });
          }

          (s.elements || []).forEach(o => {
            const b = {
              x: (Number(o.x) / 100) * 12.4,
              y: (Number(o.y) / 100) * 6.9,
              w: (Number(o.w) / 100) * 12.4,
              h: (Number(o.h) / 100) * 6.9
            };
            if (["text", "icon", "arrow"].includes(o.type)) {
              sl.addText(o.text || (o.type === "arrow" ? "➜" : ""), {
                ...b,
                fontFace: o.font || "Aptos",
                fontSize: o.type === "icon" ? 28 : 18,
                color: (o.fill || "#22d3ee").replace("#", ""),
                fit: "shrink",
                bold: true
              });
            } else if (["rect", "circle", "triangle"].includes(o.type)) {
              const st = o.type === "circle" ? pptx.ShapeType.ellipse : o.type === "triangle" ? pptx.ShapeType.triangle : pptx.ShapeType.rect;
              sl.addShape(st, {
                ...b,
                fill: { color: (o.fill || "#8b5cf6").replace("#", "") },
                line: { color: (o.fill || "#8b5cf6").replace("#", "") }
              });
            }
          });

          sl.addText(String(i + 1).padStart(2, "0"), { x: 11.8, y: 6.65, w: 0.7, h: 0.3, fontSize: 10, color: t.body.replace("#", ""), align: "right" });
        });

        await pptx.writeFile({ fileName: "Gidy-Studio-Presentation.pptx" });
        msg("PPTX exported successfully.");
      } catch (e) {
        msg("PPTX export failed: " + e.message);
      }
    };
  }

  if ($("exportPdf")) {
    $("exportPdf").onclick = async () => {
      if (!window.html2canvas || !window.jspdf) {
        msg("PDF libraries did not load. Check connection and reload.");
        return;
      }
      try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
        const p = $("slidePreview");
        const old = current;
        for (let i = 0; i < slides.length; i++) {
          current = i;
          render();
          const canvas = await window.html2canvas(p, { scale: 2, backgroundColor: null });
          if (i) pdf.addPage();
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 841.89, 595.28);
        }
        current = old;
        render();
        pdf.save("Gidy-Studio-Presentation.pdf");
        msg("PDF exported successfully.");
      } catch (e) {
        msg("PDF export failed: " + e.message);
      }
    };
  }

  if ($("exportImage")) {
    $("exportImage").onclick = async () => {
      if (!window.html2canvas || !$("slidePreview")) {
        msg("Image exporter unavailable right now.");
        return;
      }
      try {
        const canvas = await window.html2canvas($("slidePreview"), { scale: 2, backgroundColor: null });
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `Gidy-Slide-${String(current + 1).padStart(2, "0")}.png`;
        a.click();
        msg(`Slide ${current + 1} exported as PNG.`);
      } catch (e) {
        msg("PNG export failed: " + e.message);
      }
    };
  }
if ($("shareDeck")) {
    $("shareDeck").onclick = async () => {
      const title = ($("activeDeckTitle")?.textContent || "Gidy Studio Presentation").trim();
      const summary = `${title} — ${slides.length} slide${slides.length === 1 ? "" : "s"} created with Gidy Studio.`;
      if (navigator.share) {
        try {
          await navigator.share({ title, text: summary, url: location.href });
          msg("Shared presentation link/summary.");
          return;
        } catch {
          // User cancelled or share unsupported
        }
      }
      try {
        await navigator.clipboard?.writeText(`${summary} ${location.href}`);
        msg("Presentation summary & link copied to clipboard.");
      } catch {
        msg("Use Backup or Export PPTX to share your presentation file.");
      }
    };
  }

  /* ---------- INITIAL RESTORE & BOOT ---------- */
  try {
    const stored = JSON.parse(localStorage.getItem(PROJECT_KEY) || "null");
    const recovered = Array.isArray(stored) ? stored : stored?.slides;
    if (Array.isArray(recovered) && recovered.length) {
      slides = recovered.map(s => ({
        ...s,
        speakerNotes: String(s.speakerNotes || ""),
        transition: ["fade", "push", "zoom", "flip", "none"].includes(s.transition) ? s.transition : "fade",
        elements: Array.isArray(s.elements) ? s.elements : [],
        theme: themes[s.theme] ? s.theme : "midnight",
        layout: ["standard", "title", "split", "image-focus", "quote"].includes(s.layout) ? s.layout : "standard"
      }));
      current = 0;
    }
  } catch (e) {
    console.warn("Saved project could not be restored", e);
  }

  bindCanvasPointerEvents();
  render();
  updateHistoryButtons();
  setAutosaveBadge("Saved", false);
})();


/* =====================================
   GIDY SCAN — JAVASCRIPT
   Independent Full-Screen Workspace
===================================== */

document.addEventListener("DOMContentLoaded", () => {

  const scanScreen = document.getElementById("scanScreen");
  const cameraInput = document.getElementById("scanCamera");
  const uploadInput = document.getElementById("scanUpload");
  const previewArea = document.getElementById("scanPreviewArea");
  const preview = document.getElementById("scanPreview");
  const emptyState = document.getElementById("scanEmpty");
  const status = document.getElementById("scanStatus");

  const homeScreen = document.getElementById("homeScreen");
  const bottomNav = document.querySelector(".home-bottom-nav");
  const newSheet = document.getElementById("newSheet");

  let scanImageURL = null;

  // OPEN SCAN WORKSPACE
  function openScan() {

    if (!scanScreen || !homeScreen) return;

    homeScreen.style.display = "none";

    if (bottomNav) {
      bottomNav.style.display = "none";
    }

    if (newSheet) {
      newSheet.style.display = "none";
      newSheet.setAttribute("aria-hidden", "true");
    }

    scanScreen.style.display = "block";
    scanScreen.hidden = false;

    window.scrollTo(0, 0);
  }

  // RETURN TO HOME
  function closeScan() {

    if (!scanScreen || !homeScreen) return;

    scanScreen.style.display = "none";

    homeScreen.style.display = "";

    if (bottomNav) {
      bottomNav.style.display = "";
    }

    if (newSheet) {
      newSheet.style.display = "";
    }

    window.scrollTo(0, 0);
  }

  // LOAD IMAGE
  function loadScan(file) {

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      status.textContent = "Please select a valid image.";
      return;
    }

    if (scanImageURL) {
      URL.revokeObjectURL(scanImageURL);
    }

    scanImageURL = URL.createObjectURL(file);

    preview.src = scanImageURL;

    emptyState.style.display = "none";
    previewArea.style.display = "block";

    status.textContent = "Document loaded successfully.";
  }

  // RESET / RETAKE
  function resetScan() {

    if (scanImageURL) {
      URL.revokeObjectURL(scanImageURL);
    }

    scanImageURL = null;

    preview.src = "";

    cameraInput.value = "";
    uploadInput.value = "";

    previewArea.style.display = "none";
    emptyState.style.display = "block";

    status.textContent = "Ready to scan.";
  }

  // DOWNLOAD SCANNED IMAGE
  function downloadScan() {

    if (!scanImageURL) {
      status.textContent = "Please scan a document first.";
      return;
    }

    const link = document.createElement("a");

    link.href = scanImageURL;
    link.download = "Gidy-Scanned-Document.jpg";

    document.body.appendChild(link);
    link.click();
    link.remove();

    status.textContent = "Download started.";
  }

  // CAMERA INPUT
  cameraInput.addEventListener("change", event => {
    loadScan(event.target.files[0]);
  });

  // IMAGE UPLOAD INPUT
  uploadInput.addEventListener("change", event => {
    loadScan(event.target.files[0]);
  });

  // CONNECT BUTTONS
  window.openScan = openScan;
  window.closeScan = closeScan;
  window.resetScan = resetScan;
  window.downloadScan = downloadScan;

});
