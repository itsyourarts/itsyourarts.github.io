const API = ""; // Same domain pe Vercel functions chalege

function el(id) { return document.getElementById(id); }

function showToast(text, type = "success") {
  const t = el("toast");
  t.textContent = text;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.classList.remove("show"); }, 3000);
}

// File list lao
async function listFiles() {
  try {
    const res = await fetch(`${API}/api/list`);
    if (!res.ok) throw new Error("List nahi aa paayi");
    const data = await res.json();
    renderFiles(data.blobs || []);
  } catch (e) {
    showToast(e.message, "error");
  }
}

function renderFiles(blobs) {
  const grid = el("filesGrid");
  const empty = el("emptyState");
  const count = el("fileCount");
  grid.innerHTML = "";
  count.textContent = blobs.length;

  if (!blobs || blobs.length === 0) {
    empty.style.display = "block";
    grid.style.display = "none";
    return;
  }

  empty.style.display = "none";
  grid.style.display = "grid";

  for (const b of blobs) {
    const name = b.pathname.split("/").pop();
    const sizeKB = (b.size / 1024).toFixed(2) + " KB";
    const ext = name.split(".").pop().toLowerCase();
    const icon = getFileIcon(ext);

    const item = document.createElement("div");
    item.className = "file-item";
    item.innerHTML = `
      <div class="file-icon">${icon}</div>
      <div class="file-info">
        <div class="file-name" title="${escapeHtml(name)}">${escapeHtml(name)}</div>
        <div class="file-size">${sizeKB}</div>
      </div>
      <div class="file-actions">
        <a href="${b.url}" class="btn btn-small btn-success" target="_blank">Download</a>
        <button class="btn btn-small btn-danger" onclick="deleteFile('${escapeHtml(b.url)}')">Delete</button>
      </div>
    `;
    grid.appendChild(item);
  }
}

function getFileIcon(ext) {
  const map = {
    pdf: "📄", doc: "📘", docx: "📘",
    xls: "📗", xlsx: "📗",
    ppt: "📙", pptx: "📙",
    jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", webp: "🖼️",
    mp4: "🎥", mov: "🎥", avi: "🎥",
    mp3: "🎵", wav: "🎵",
    zip: "🗜️", rar: "🗜️", "7z": "🗜️",
    txt: "📝", md: "📝",
    html: "🌐", css: "🎨", js: "📜", py: "🐍", json: "📋",
    apk: "📱", exe: "⚙️",
  };
  return map[ext] || "📎";
}

// Upload karo
async function uploadFiles() {
  const input = el("fileInput");
  const files = input.files;
  if (!files.length) {
    showToast("Pehle file select karo.", "error");
    return;
  }

  const progressBox = el("progressBox");
  const progressFill = el("progressFill");
  const progressText = el("progressText");
  progressBox.style.display = "block";

  let completed = 0;
  const total = files.length;

  for (let file of files) {
    try {
      const base64 = await readFileAsBase64(file);
      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          base64: base64
        })
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Upload fail: ${err}`);
      }

      completed++;
      const pct = Math.round((completed / total) * 100);
      progressFill.style.width = pct + "%";
      progressText.textContent = pct + "%";
    } catch (e) {
      showToast(`${file.name}: ${e.message}`, "error");
    }
  }

  input.value = "";
  setTimeout(() => { progressBox.style.display = "none"; progressFill.style.width = "0%"; }, 800);
  await listFiles();
  showToast(`${total} file upload ho gayi.`, "success");
}

// Drag & drop support
const dropZone = el("dropZone");
const fileInput = el("fileInput");

dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  if (e.dataTransfer.files.length) {
    fileInput.files = e.dataTransfer.files;
  }
});

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
  });
}

// Delete karo
async function deleteFile(url) {
  if (!confirm("File delete karna chahte ho?")) return;
  try {
    const res = await fetch(`${API}/api/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url })
    });
    if (!res.ok) throw new Error("Delete fail");
    await listFiles();
    showToast("File delete ho gayi.", "success");
  } catch (e) {
    showToast("Delete fail: " + e.message, "error");
  }
}

function escapeHtml(t) {
  return t.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// Start
listFiles();
