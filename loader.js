/* ================= FORMAT ================= */
const AUTOSAVE_KEY = "elite_offline_editor";

function formatHTML(html) {
  const tab = "  ";
  let result = "";
  let indent = 0;

  html
    .replace(/>\s*</g, ">\n<")
    .split("\n")
    .forEach((line) => {
      line = line.trim();

      if (line.match(/^<\/.+>/)) indent--;

      result += tab.repeat(Math.max(indent, 0)) + line + "\n";

      if (line.match(/^<[^\/!][^>]*[^\/]>$/)) indent++;
    });

  return result.trim();
}

/* ================= CLEAN ================= */

function cleanHTML(html) {
  return formatHTML(
    html
      .replace(/<figure[^>]*>/gi, "")
      .replace(/<\/figure>/gi, "")
      .replace(/&nbsp;/g, " ")
      .trim(),
  );
}

/* ================= UPDATE RIGHT → LEFT ================= */

function updateHTML() {
  const editor = tinymce.get("editor");
  if (!editor) return;

  let html = editor.getContent();

  // ⭐ NO formatting while typing
  document.getElementById("htmlOutput").value = html;
}

/* ================= UPDATE LEFT → RIGHT ================= */

function updateEditor() {
  const html = document.getElementById("htmlOutput").value;

  const editor = tinymce.get("editor");
  if (!editor) return;

  editor.setContent(html);
}

/* ================= TINYMCE ================= */

tinymce.init({
  selector: "#editor",

  base_url: "./tinymce/js/tinymce",
  suffix: ".min",

  height: "100%",
  menubar: true,

  plugins: [
    "advlist",
    "autolink",
    "lists",
    "link",
    "image",
    "table",
    "charmap",
    "anchor",
    "searchreplace",
    "visualblocks",
    "code",
    "fullscreen",
    "preview",
    "insertdatetime",
    "help",
    "wordcount",
  ],

  toolbar: `
    undo redo |
    blocks |
    bold italic underline |
    alignleft aligncenter alignright alignjustify |
    bullist numlist |
    table image link |
    removeformat |
    code fullscreen preview
  `,

  toolbar_mode: "wrap",
  toolbar_sticky: true,
  contextmenu: false,

  forced_root_block: "p",

  invalid_styles: {
    "*": "color font-size font-family background",
  },

  license_key: "gpl",
  branding: false,
  browser_spellcheck: true,
  entity_encoding: "raw",

  setup: function (editor) {
    editor.on("keyup change paste", debounce(updateHTML, 300));

    editor.on("init", () => {
      const saved = localStorage.getItem(AUTOSAVE_KEY);

      if (saved) {
        editor.setContent(saved);
      }

      updateHTML();
    });

    let saveTimer;

    editor.on("change keyup", () => {
      clearTimeout(saveTimer);

      saveTimer = setTimeout(
        autoSave,
        1000, // ⭐ saves after user stops typing
      );
    });
  },
});

/* ================= DEBOUNCE ================= */

function debounce(func, wait) {
  let t;
  return function () {
    clearTimeout(t);
    t = setTimeout(func, wait);
  };
}

/* LEFT SIDE LISTENER */

document
  .getElementById("htmlOutput")
  .addEventListener("input", debounce(updateEditor, 400));

function autoSave() {
  const editor = tinymce.get("editor");
  if (!editor) return;

  const content = editor.getContent();

  localStorage.setItem(AUTOSAVE_KEY, content);
}

/* ================= COPY ================= */

function copyHTML() {
  let html = tinymce.get("editor").getContent();

  // ⭐ Format ONLY on copy
  html = cleanHTML(html);

  navigator.clipboard.writeText(html);

  alert("Clean HTML copied!");
}

/* ================= DIVIDER ================= */

const divider = document.getElementById("divider");
const leftPane = document.querySelector(".html-pane");

/* Restore saved width */

const savedWidth = localStorage.getItem("dividerPosition");

if (savedWidth) {
  leftPane.style.flex = "none";
  leftPane.style.width = savedWidth + "%";
}

let isDragging = false;

divider.addEventListener("mousedown", () => {
  isDragging = true;
  document.body.style.cursor = "col-resize";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const containerWidth = document.querySelector(".container").offsetWidth;

  const newLeftWidth = (e.clientX / containerWidth) * 100;

  if (newLeftWidth < 20 || newLeftWidth > 80) return;

  leftPane.style.flex = "none";
  leftPane.style.width = newLeftWidth + "%";

  localStorage.setItem("dividerPosition", newLeftWidth);
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  document.body.style.cursor = "default";
});
function clearSaved() {
  localStorage.removeItem(AUTOSAVE_KEY);

  alert("Saved data cleared!");
}
