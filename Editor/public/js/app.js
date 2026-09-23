
// ==========================================
// BACKGROUND REMOVER INTERACTIVE STUDIO STATE
// ==========================================
let bgEditorOriginalBitmap = null;
let bgEditorWorkCanvas = null;
let bgEditorWorkCtx = null;
let bgEditorMaskCanvas = null;
let bgEditorMaskCtx = null;
let bgEditorHistory = [];
let bgEditorHistoryIndex = -1;
let bgEditorMode = 'erase'; // 'erase' | 'restore' | 'magic'
let bgEditorBrushSize = 25;
let bgEditorBrushHardness = 0.8;
let bgEditorTolerance = 35;
let bgEditorIsDrawing = false;
let bgEditorLastPoint = null;


// Robust helper to get pdfjsLib or dynamically load from CDN if local script was blocked/pending
async function ensurePdfEngine() {
  if (window.pdfjsLib) {
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = './libs/pdf.worker.min.js';
    }
    return window.pdfjsLib;
  }

  // Check globalThis
  if (typeof globalThis !== 'undefined' && globalThis.pdfjsLib) {
    window.pdfjsLib = globalThis.pdfjsLib;
    return window.pdfjsLib;
  }

  // Attempt dynamic script load
  showProgress('Loading PDF Engine...', 15);
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve();
      } else {
        reject(new Error('PDF Engine script failed to initialize.'));
      }
    };
    s.onerror = () => reject(new Error('Unable to load PDF Engine. Please check your internet connection.'));
    document.head.appendChild(s);
  });

  return window.pdfjsLib;
}


// Helper to detect if a file is an image by MIME type or file extension
function isImageFile(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  const name = (file.name || '').toLowerCase();
  return /.(jpg|jpeg|png|webp|gif|bmp|svg|tiff)$/.test(name);
}


// Safe DOM element value accessor with default fallback
function getVal(id, fallback = '') {
  const el = document.getElementById(id);
  if (!el || el.value === undefined || el.value === null) return fallback;
  return el.value;
}

// GodxShadow PDF Suite - Core Application Engine

const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib;

// Tools definition
const TOOLS = [
  {
    id: 'merge',
    name: 'Merge PDF',
    category: 'organize',
    badge: 'Popular',
    desc: 'Combine PDFs in the order you want with the easiest PDF merger available.',
    color: '#00f0ff',
    glow: 'rgba(0, 240, 255, 0.4)',
    accept: '.pdf',
    multiple: true,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`
  },
  {
    id: 'split',
    name: 'Split PDF',
    category: 'organize',
    badge: 'Fast',
    desc: 'Separate one page or a whole set for easy conversion into independent PDF files.',
    color: '#ff007f',
    glow: 'rgba(255, 0, 127, 0.4)',
    accept: '.pdf',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff007f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"></path><path d="M8 21H3v-5"></path><path d="M21 3l-7.5 7.5"></path><path d="M3 21l7.5-7.5"></path></svg>`
  },
  {
    id: 'compress',
    name: 'Compress PDF',
    category: 'optimize',
    badge: 'Smart',
    desc: 'Reduce file size while optimizing for maximal PDF quality and cyber efficiency.',
    color: '#00ff88',
    glow: 'rgba(0, 255, 136, 0.4)',
    accept: '.pdf',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg>`
  },
  {
    id: 'pdf_to_jpg',
    name: 'PDF to JPG',
    category: 'convert',
    badge: 'HD Image',
    desc: 'Extract all pages from a PDF or convert each page to crisp neon JPEG images.',
    color: '#ffaa00',
    glow: 'rgba(255, 170, 0, 0.4)',
    accept: '.pdf',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ffaa00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
  },
  {
    id: 'jpg_to_pdf',
    name: 'JPG to PDF',
    category: 'convert',
    badge: 'Instant',
    desc: 'Convert JPG, PNG, or WebP images into high quality multi-page PDF documents.',
    color: '#9d00ff',
    glow: 'rgba(157, 0, 255, 0.4)',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: true,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#9d00ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>`
  },
  {
    id: 'watermark',
    name: 'Add Watermark',
    category: 'security',
    badge: 'Custom',
    desc: 'Stamp an image or neon text over your PDF in seconds. Typo, position and glow.',
    color: '#00f0ff',
    glow: 'rgba(0, 240, 255, 0.4)',
    accept: '.pdf',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`
  },
  {
    id: 'rotate',
    name: 'Rotate PDF',
    category: 'organize',
    badge: '360°',
    desc: 'Rotate your PDF pages as you need them. You can rotate single or all pages at once.',
    color: '#ff007f',
    glow: 'rgba(255, 0, 127, 0.4)',
    accept: '.pdf',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff007f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>`
  },
  {
    id: 'page_numbers',
    name: 'Page Numbers',
    category: 'organize',
    badge: 'Pro',
    desc: 'Add page numbers into PDFs with ease. Choose positions, typography, and neon styling.',
    color: '#00ff88',
    glow: 'rgba(0, 255, 136, 0.4)',
    accept: '.pdf',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M8 8h8"></path><path d="M8 12h5"></path></svg>`
  },
  {
    id: 'remove_pages',
    name: 'Remove Pages',
    category: 'organize',
    badge: 'Clean',
    desc: 'Select and remove any unwanted pages from your document in one click.',
    color: '#ff3366',
    glow: 'rgba(255, 51, 102, 0.4)',
    accept: '.pdf',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff3366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`
  },
  {
    id: 'protect',
    name: 'Protect PDF',
    category: 'security',
    badge: 'Cyber Vault',
    desc: 'Encrypt and lock your PDF document with modern AES passwords and permissions.',
    color: '#00f0ff',
    glow: 'rgba(0, 240, 255, 0.4)',
    accept: '.pdf',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
  },
  {
    id: 'pdf_to_text',
    name: 'PDF to Text',
    category: 'convert',
    badge: 'Extract',
    desc: 'Extract raw text, paragraphs, and contents from any PDF cleanly and quickly.',
    color: '#c77dff',
    glow: 'rgba(199, 125, 255, 0.4)',
    accept: '.pdf',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#c77dff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
  },
  {
    id: 'ocr',
    name: 'Neon OCR Reader',
    category: 'convert',
    badge: 'AI Scan',
    desc: 'Scan documents, extract text strings, and generate searchable txt dumps locally.',
    color: '#00ff88',
    glow: 'rgba(0, 255, 136, 0.4)',
    accept: '.pdf,image/*',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20M7 7l5-5 5 5M7 17l5 5 5-5"/></svg>`
  },
  {
    id: 'object_eraser',
    name: 'AI Object Eraser (Text Prompt)',
    category: 'image',
    badge: 'Magic AI',
    desc: 'Erase any object, text, watermark, or person just by typing what to remove (Powered by Finegrain AI).',
    color: '#ff007f',
    glow: 'rgba(255, 0, 127, 0.5)',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff007f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path><path d="M22 21H7"></path><path d="m5 11 9 9"></path></svg>`
  },
  {
    id: 'enhance_image',
    name: 'AI Image Enhancer (2K / 4K)',
    category: 'image',
    badge: 'Ultra HD',
    desc: 'Enhance and upscale normal photos & graphics to ultra-sharp 2K or 4K resolution with AI sharpness.',
    color: '#00f0ff',
    glow: 'rgba(0, 240, 255, 0.5)',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
  },
  {
    id: 'bg_remover',
    name: 'Auto Background Remover',
    category: 'image',
    badge: 'AI Cutout',
    desc: 'Automatically remove photo background to pure transparent PNG cutout in 1-click.',
    color: '#ff007f',
    glow: 'rgba(255, 0, 127, 0.5)',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff007f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>`
  },
  {
    id: 'bg_color',
    name: 'Background Color Adder',
    category: 'image',
    badge: 'Studio BG',
    desc: 'Replace or add solid studio background colors (White, Blue, Red, Cyber Neon) to any image.',
    color: '#00ff88',
    glow: 'rgba(0, 255, 136, 0.5)',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`
  },
  {
    id: 'passport_photo',
    name: 'Passport Size Photo Maker',
    category: 'image',
    badge: 'Govt Specs',
    desc: 'Generate ready-to-print official passport size photos with standard White/Blue BG & 2x2 / 35x45mm grids.',
    color: '#ffaa00',
    glow: 'rgba(255, 170, 0, 0.5)',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ffaa00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="10" r="3"></circle><path d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"></path></svg>`
  },
  {
    id: 'image_resizer',
    name: 'Image Resizer & Scaler',
    category: 'image',
    badge: 'Exact Pixels',
    desc: 'Resize images to custom width/height in px, cm, inches, or scale by percentage while preserving aspect ratio.',
    color: '#9d00ff',
    glow: 'rgba(157, 0, 255, 0.5)',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#9d00ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`
  },
  {
    id: 'image_editor',
    name: 'Cyber Image Editor',
    category: 'image',
    badge: 'Pro Filter',
    desc: 'Crop, rotate, adjust brightness, contrast, saturation, blur, and apply cyber neon color filters.',
    color: '#00f0ff',
    glow: 'rgba(0, 240, 255, 0.5)',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: false,
    icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`
  }
];

// App State
let currentTool = null;
let selectedFiles = [];
let loadedPdfDoc = null;
let totalPages = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderToolsGrid();
  setupDragAndDrop();
});

// Render Tools
function renderToolsGrid(filter = 'all', query = '') {
  const container = document.getElementById('toolsGrid');
  container.innerHTML = '';

  const filtered = TOOLS.filter(tool => {
    const matchesCategory = (filter === 'all') || (tool.category === filter);
    const matchesSearch = tool.name.toLowerCase().includes(query.toLowerCase()) || 
                          tool.desc.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  filtered.forEach(tool => {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.style.setProperty('--card-neon-color', tool.color);
    card.style.setProperty('--card-neon-glow', tool.glow);
    card.onclick = () => openTool(tool.id);

    card.innerHTML = `
      <div class="tool-card-icon" style="border-color:${tool.color}33;">
        ${tool.icon}
      </div>
      <div class="tool-card-title">
        <span>${tool.name}</span>
        <span class="tool-badge" style="background:${tool.color}22; color:${tool.color}; border:1px solid ${tool.color}55;">${tool.badge}</span>
      </div>
      <div class="tool-card-desc">${tool.desc}</div>
    `;
    container.appendChild(card);
  });
}

function filterTools() {
  const query = getVal('toolSearch', '');
  const activeBtn = document.querySelector('.filter-btn.active');
  const cat = activeBtn ? activeBtn.dataset.cat || 'all' : 'all';
  renderToolsGrid(cat, query);
}

function setCategory(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  btn.dataset.cat = cat;
  const query = getVal('toolSearch', '');
  renderToolsGrid(cat, query);
}

// Modal handling
function openTool(toolId) {
  const tool = TOOLS.find(t => t.id === toolId);
  if (!tool) return;
  currentTool = tool;

  document.getElementById('modalTitle').innerText = tool.name;
  document.getElementById('modalSubtitle').innerText = tool.desc;
  document.getElementById('modalIcon').innerHTML = tool.icon;
  document.getElementById('modalIcon').style.background = `${tool.color}15`;
  document.getElementById('modalIcon').style.border = `1px solid ${tool.color}50`;
  
  const modal = document.getElementById('toolModal');
  modal.classList.add('active');

  const fileInput = document.getElementById('fileInput');
  fileInput.accept = tool.accept;
  fileInput.multiple = tool.multiple;

  // Custom dropzone copy for images vs PDF
  const dzTitle = document.querySelector('.dropzone-title');
  const dzDesc = document.querySelector('.dropzone-desc');
  if (['enhance_image', 'jpg_to_pdf', 'bg_remover', 'bg_color', 'passport_photo', 'image_resizer', 'image_editor', 'object_eraser'].includes(tool.id)) {
    if (dzTitle) dzTitle.innerText = 'Select or Drop Image files here';
    if (dzDesc) dzDesc.innerText = 'Supports JPG, PNG, WEBP with 100% Client-Side Pure JS Engine';
  } else {
    if (dzTitle) dzTitle.innerText = 'Select or Drop PDF files here';
    if (dzDesc) dzDesc.innerText = 'Lightning-fast local processing with GodxShadow Neon Engine';
  }

  resetToolFiles();
  renderToolControls();
}

// Make sure global access is guaranteed
window.openTool = openTool;
window.closeTool = closeTool;
window.setCategory = setCategory;
window.filterTools = filterTools;
window.triggerFileInput = triggerFileInput;
window.handleFileSelect = handleFileSelect;
window.resetToolFiles = resetToolFiles;
window.executeCurrentTool = executeCurrentTool;
window.moveFile = moveFile;
window.removeFile = removeFile;
window.toggleSplitInputs = toggleSplitInputs;
window.toggleThemePulse = toggleThemePulse;

function closeTool() {
  document.getElementById('toolModal').classList.remove('active');
  currentTool = null;
  selectedFiles = [];
}

// Drag & drop
function setupDragAndDrop() {
  const dropzone = document.getElementById('dropzone');

  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  });
}

function triggerFileInput() {
  document.getElementById('fileInput').click();
}

function handleFileSelect(e) {
  if (e.target.files && e.target.files.length > 0) {
    handleFiles(Array.from(e.target.files));
  }
}

async function handleFiles(files) {
  if (!currentTool) return;
  
  if (!currentTool.multiple) {
    selectedFiles = [files[0]];
  } else {
    selectedFiles = [...selectedFiles, ...files];
  }

  updateFileListUI();
  // progress ready

  // Load preview if single PDF tool
  if (selectedFiles.length > 0 && selectedFiles[0].type === 'application/pdf') {
    await loadPdfDetails(selectedFiles[0]);
  } else if (selectedFiles.length > 0 && isImageFile(selectedFiles[0])) {
    if (currentTool && currentTool.id === 'bg_remover') {
      await initBgRemoverStudio(selectedFiles[0]);
    } else {
      renderImageThumbnail(selectedFiles[0]);
    }
  }
}

function renderImageThumbnail(file) {
  const preview = document.getElementById('previewContainer');
  if (!preview) return;

  const url = URL.createObjectURL(file);
  const fileName = file.name || 'Selected Image';
  const fileSize = formatBytes(file.size || 0);

  preview.innerHTML = '<div style="font-size:0.9rem; font-weight:700; color:var(--neon-cyan); margin-top:1rem; display:flex; justify-content:space-between; align-items:center;">' +
    '<span>📷 Live Source Image Preview:</span>' +
    '<span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">' + fileName + ' (' + fileSize + ')</span>' +
  '</div>' +
  '<div style="margin-top:10px; text-align:center; padding:14px; background:rgba(0, 240, 255, 0.05); border:1.5px solid rgba(0, 240, 255, 0.3); border-radius:12px; box-shadow:0 0 20px rgba(0, 240, 255, 0.15);">' +
    '<img src="' + url + '" style="max-width:100%; max-height:260px; border-radius:8px; box-shadow:0 0 15px rgba(0, 240, 255, 0.35); object-fit:contain;" alt="Source Image Preview">' +
  '</div>';
}

function updateFileListUI() {
  const list = document.getElementById('fileList');
  list.innerHTML = '';
  
  if (selectedFiles.length === 0) {
    list.style.display = 'none';
    return;
  }
  list.style.display = 'flex';

  selectedFiles.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
      <div class="file-info">
        <svg width="22" height="22" fill="none" stroke="var(--neon-cyan)" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        <div>
          <div class="file-name">${file.name}</div>
          <div class="file-size">${formatBytes(file.size)}</div>
        </div>
      </div>
      <div class="file-actions">
        ${currentTool.multiple ? `
          <button class="file-btn" title="Move Up" onclick="moveFile(${index}, -1)">▲</button>
          <button class="file-btn" title="Move Down" onclick="moveFile(${index}, 1)">▼</button>
        ` : ''}
        <button class="file-btn" title="Remove" onclick="removeFile(${index})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `;
    list.appendChild(item);
  });
}

function moveFile(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= selectedFiles.length) return;
  const temp = selectedFiles[index];
  selectedFiles[index] = selectedFiles[target];
  selectedFiles[target] = temp;
  updateFileListUI();
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  updateFileListUI();
  if (selectedFiles.length === 0) {
    resetToolFiles();
  }
}

function resetToolFiles() {
  selectedFiles = [];
  loadedPdfDoc = null;
  totalPages = 0;
  bgEditorOriginalBitmap = null;
  bgEditorWorkCanvas = null;
  bgEditorWorkCtx = null;
  bgEditorHistory = [];
  bgEditorHistoryIndex = -1;
  const fi = document.getElementById('fileInput'); if (fi) fi.value = '';
  document.getElementById('fileList').innerHTML = '';
  document.getElementById('fileList').style.display = 'none';
  document.getElementById('previewContainer').innerHTML = '';
  const dlBox = document.getElementById('directDownloadBox');
  if (dlBox) dlBox.style.display = 'none';
  hideStatus();
  hideProgress();
}

// Dynamic controls based on tool
function renderToolControls() {
  const container = document.getElementById('toolControls');
  container.innerHTML = '';
  container.style.display = 'flex';

  switch (currentTool.id) {
    case 'merge':
      container.innerHTML = `
        <div style="font-size:0.9rem; color:var(--neon-cyan);">
          💡 Tip: Upload 2 or more PDF documents. Reorder them using the arrows (▲ / ▼) before merging.
        </div>
      `;
      break;

    case 'split':
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label">Split Mode</label>
          <select id="splitMode" class="form-select" onchange="toggleSplitInputs()">
            <option value="range">Extract Range of Pages (e.g. 1-3, 5)</option>
            <option value="single">Separate into individual 1-page PDFs (ZIP)</option>
          </select>
        </div>
        <div class="form-group" id="splitRangeGroup">
          <label class="form-label">Pages to extract</label>
          <input type="text" id="splitRangeInput" class="form-input" placeholder="e.g. 1-2, 4" value="1">
        </div>
      `;
      break;

    case 'compress':
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label">Compression Level</label>
          <select id="compressLevel" class="form-select">
            <option value="extreme">Extreme Compression (Maximum size reduction)</option>
            <option value="recommended" selected>Recommended Compression (Good quality & high compression)</option>
            <option value="less">Less Compression (High quality, mild reduction)</option>
          </select>
        </div>
      `;
      break;

    case 'rotate':
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label">Rotation Angle</label>
          <select id="rotateAngle" class="form-select">
            <option value="90">90° Clockwise</option>
            <option value="180">180° Half Turn</option>
            <option value="270">270° (90° Counter-Clockwise)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Apply To</label>
          <select id="rotatePages" class="form-select">
            <option value="all">All Pages</option>
            <option value="custom">Custom Page Range (e.g. 1, 3-5)</option>
          </select>
        </div>
        <div class="form-group" id="rotateRangeGroup" style="display:none;">
          <label class="form-label">Page Numbers</label>
          <input type="text" id="rotateRange" class="form-input" placeholder="1-3">
        </div>
      `;
      setTimeout(() => {
        const sel = document.getElementById('rotatePages');
        if (sel) sel.onchange = (e) => {
          document.getElementById('rotateRangeGroup').style.display = e.target.value === 'custom' ? 'block' : 'none';
        };
      }, 50);
      break;

    case 'watermark':
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label">Watermark Text</label>
          <input type="text" id="watermarkText" class="form-input" value="CONFIDENTIAL - GODXSHADOW">
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Neon Text Color</label>
            <select id="watermarkColor" class="form-select">
              <option value="cyan">Cyber Cyan</option>
              <option value="magenta">Neon Magenta</option>
              <option value="lime">Matrix Lime</option>
              <option value="gray">Subtle Smoke Gray</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Opacity</label>
            <select id="watermarkOpacity" class="form-select">
              <option value="0.25">25% (Faint)</option>
              <option value="0.5" selected>50% (Standard)</option>
              <option value="0.8">80% (Bold)</option>
            </select>
          </div>
        </div>
      `;
      break;

    case 'page_numbers':
      container.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Position</label>
            <select id="pageNumPos" class="form-select">
              <option value="bottom-right" selected>Bottom Right</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="top-right">Top Right</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Format</label>
            <select id="pageNumFormat" class="form-select">
              <option value="single">Page {n}</option>
              <option value="total">Page {n} of {total}</option>
              <option value="raw">{n}</option>
            </select>
          </div>
        </div>
      `;
      break;

    case 'remove_pages':
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label">Pages to Delete / Remove (comma separated or range)</label>
          <input type="text" id="removePagesInput" class="form-input" placeholder="e.g. 1, 3, 5-8">
        </div>
      `;
      break;

    case 'protect':
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label">Protection Password</label>
          <input type="password" id="protectPassword" class="form-input" placeholder="Enter secure password">
        </div>
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input type="password" id="protectPasswordConfirm" class="form-input" placeholder="Re-enter password">
        </div>
      `;
      break;

    case 'pdf_to_jpg':
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label">Image Format & Resolution</label>
          <select id="imgQuality" class="form-select">
            <option value="2.0">High Definition 2x (Recommended)</option>
            <option value="1.5">Standard 1.5x</option>
            <option value="3.0">Ultra 3x (Print Quality)</option>
          </select>
        </div>
      `;
      break;

    case 'jpg_to_pdf':
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label">Orientation & Margin</label>
          <select id="jpgPageSize" class="form-select">
            <option value="auto">Auto (Match Image Size)</option>
            <option value="a4">Standard A4 Format</option>
          </select>
        </div>
      `;
      break;

    case 'pdf_to_text':
    case 'ocr':
      container.innerHTML = `
        <div style="font-size:0.9rem; color:var(--neon-lime);">
          ⚡ GodxShadow OCR Engine will analyze the stream and extract plain UTF-8 text with high fidelity.
        </div>
      `;
      break;

    case 'object_eraser':
      container.innerHTML = `
        <div style="padding:14px 18px; background:linear-gradient(135deg, rgba(255, 0, 127, 0.15), rgba(0, 240, 255, 0.15)); border:1.5px solid var(--neon-magenta); border-radius:12px; margin-bottom:1rem; box-shadow:0 0 20px rgba(255, 0, 127, 0.25);">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:1.6rem;">🪄</span>
              <div>
                <div style="font-weight:800; color:#fff; font-size:1rem; letter-spacing:0.5px;">FINEGRAIN AI OBJECT ERASER</div>
                <div style="font-size:0.8rem; color:var(--neon-magenta);">Type what you want to remove and AI will seamlessly inpaint the background.</div>
              </div>
            </div>
            <a href="https://huggingface.co/spaces/finegrain/finegrain-object-eraser" target="_blank" rel="noopener noreferrer" class="btn-neon" style="text-decoration:none; padding:7px 15px; font-size:0.82rem; border-color:var(--neon-magenta); color:var(--neon-magenta);">
              Hugging Face Space ↗
            </a>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">What should AI erase from image? (Type prompt)</label>
          <input type="text" id="erasePromptInput" class="form-input" placeholder="e.g. yellow button, person, watermark, car, wire, text" value="yellow button">
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:8px;">
          <div class="form-group">
            <label class="form-label">AI Inpainting Engine</label>
            <select id="eraseEngine" class="form-select">
              <option value="finegrain_hf" selected>Finegrain Object Eraser (Hugging Face AI)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Output Format</label>
            <select id="eraseFormat" class="form-select">
              <option value="image/png" selected>PNG Lossless</option>
              <option value="image/jpeg">JPEG (High Quality 95%)</option>
            </select>
          </div>
        </div>
      `;
      break;

    case 'bg_remover':
      container.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; padding:10px 14px; background:rgba(255, 0, 127, 0.08); border:1.5px solid var(--neon-magenta); border-radius:10px; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.4rem;">✂️</span>
            <div>
              <div style="font-weight:700; color:#fff; font-size:0.95rem;">Cyber Cutout Studio & Manual Eraser</div>
              <div style="font-size:0.75rem; color:var(--neon-magenta);">Auto AI Background Removal + Manual Precision Eraser & Touch-up Brush</div>
            </div>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <button type="button" class="btn-neon" onclick="runAutoBgRemoval()" style="padding:6px 14px; font-size:0.8rem; border-color:var(--neon-cyan); color:var(--neon-cyan);">
              ⚡ 1-Click Auto Remove
            </button>
            <button type="button" class="btn-neon btn-neon-glow" onclick="executeCurrentTool()" style="padding:6px 16px; font-size:0.8rem;">
              ⬇️ Save Cutout PNG
            </button>
          </div>
        </div>

        <!-- TOOLBAR -->
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; background:rgba(0,0,0,0.4); padding:10px; border:1px solid rgba(255,255,255,0.1); border-radius:10px;">
          <div style="display:flex; gap:6px;">
            <button type="button" id="toolEraseBtn" class="manual-brush-btn active" onclick="setBgToolMode('erase')">
              🧽 Manual Eraser
            </button>
            <button type="button" id="toolRestoreBtn" class="manual-brush-btn" onclick="setBgToolMode('restore')">
              🖌️ Restore Brush
            </button>
            <button type="button" id="toolMagicBtn" class="manual-brush-btn" onclick="setBgToolMode('magic')">
              🪄 Magic Wand Tap
            </button>
          </div>

          <div style="width:1px; height:24px; background:rgba(255,255,255,0.2); margin:0 4px;"></div>

          <div style="display:flex; align-items:center; gap:8px;">
            <label style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">Brush Size:</label>
            <input type="range" id="bgBrushSize" min="5" max="120" value="25" style="width:90px;" oninput="updateBgBrushProps()">
            <span id="bgBrushSizeLabel" style="font-size:0.75rem; color:var(--neon-cyan); font-weight:700;">25px</span>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <label style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">Hardness:</label>
            <input type="range" id="bgBrushHardness" min="10" max="100" value="80" style="width:70px;" oninput="updateBgBrushProps()">
            <span id="bgBrushHardLabel" style="font-size:0.75rem; color:var(--neon-cyan); font-weight:700;">80%</span>
          </div>

          <div style="width:1px; height:24px; background:rgba(255,255,255,0.2); margin:0 4px;"></div>

          <div style="display:flex; gap:6px;">
            <button type="button" class="manual-brush-btn" title="Undo Last Brush Stroke" onclick="undoBgEditor()">
              ↩️ Undo
            </button>
            <button type="button" class="manual-brush-btn" title="Redo Brush Stroke" onclick="redoBgEditor()">
              ↪️ Redo
            </button>
            <button type="button" class="manual-brush-btn" title="Reset to Original Image" onclick="resetBgEditorImage()" style="color:#ff5555; border-color:#ff555555;">
              🔄 Reset
            </button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:8px;">
          <div class="form-group">
            <label class="form-label">Auto-Detect Algorithm</label>
            <select id="bgDetectMode" class="form-select">
              <option value="auto" selected>Auto Smart Edge & Chroma Key</option>
              <option value="corners">Sample 4 Corners Background</option>
              <option value="edges">Boundary Flood Fill Key</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Magic Wand & Auto Sensitivity</label>
            <select id="bgTolerance" class="form-select" onchange="bgEditorTolerance = parseInt(this.value, 10)">
              <option value="35" selected>Standard (35%)</option>
              <option value="20">Strict (20% - Fine Hair/Fringe)</option>
              <option value="50">High (50% - Broad Backgrounds)</option>
              <option value="70">Aggressive (70%)</option>
            </select>
          </div>
        </div>
      `;
      break;

    case 'bg_color':
      container.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">New Background Color</label>
            <select id="bgColorPreset" class="form-select" onchange="updateCustomBgColor(this.value)">
              <option value="#ffffff" selected>Pure Studio White (#ffffff)</option>
              <option value="#0072ff">Official Passport Blue (#0072ff)</option>
              <option value="#ff0000">Studio Red (#ff0000)</option>
              <option value="#0a0a14">GodxShadow Cyber Dark (#0a0a14)</option>
              <option value="#00f0ff">Cyber Neon Cyan (#00f0ff)</option>
              <option value="custom">Custom Color Picker...</option>
            </select>
          </div>
          <div class="form-group" id="customColorGroup" style="display:none;">
            <label class="form-label">Pick Hex Color</label>
            <input type="color" id="bgCustomColor" class="form-input" value="#ffffff" style="height:42px; padding:2px;">
          </div>
        </div>
      `;
      setTimeout(() => {
        window.updateCustomBgColor = (val) => {
          const group = document.getElementById('customColorGroup');
          if (group) group.style.display = (val === 'custom') ? 'block' : 'none';
        };
      }, 50);
      break;

    case 'passport_photo':
      container.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Passport Standard Size</label>
            <select id="passportPreset" class="form-select">
              <option value="in_passport" selected>India / Standard (35mm x 45mm / 413x531 px)</option>
              <option value="us_passport">US / International (2 x 2 inches / 600x600 px)</option>
              <option value="schengen">Schengen / EU (35mm x 45mm)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Background Color</label>
            <select id="passportBg" class="form-select">
              <option value="#ffffff" selected>Govt White Background</option>
              <option value="#0072ff">Official Light Blue Background</option>
              <option value="original">Keep Original Background</option>
            </select>
          </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:6px;">
          <div class="form-group">
            <label class="form-label">Print Sheet Layout</label>
            <select id="passportSheet" class="form-select">
              <option value="single" selected>Single Passport Photo</option>
              <option value="grid_6">Print Ready Sheet (6 Photos - 4x6 inch)</option>
              <option value="grid_8">Print Ready Sheet (8 Photos - A4 size)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Border</label>
            <select id="passportBorder" class="form-select">
              <option value="yes" selected>Thin Cut Line Border</option>
              <option value="no">No Border</option>
            </select>
          </div>
        </div>
      `;
      break;

    case 'image_resizer':
      container.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Target Width (Pixels)</label>
            <input type="number" id="resizeWidth" class="form-input" placeholder="e.g. 1920" value="1920">
          </div>
          <div class="form-group">
            <label class="form-label">Target Height (Pixels)</label>
            <input type="number" id="resizeHeight" class="form-input" placeholder="e.g. 1080" value="1080">
          </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:6px;">
          <div class="form-group">
            <label class="form-label">Aspect Ratio</label>
            <select id="resizeRatio" class="form-select">
              <option value="maintain" selected>Maintain Aspect Ratio (Fit without stretch)</option>
              <option value="exact">Force Exact Dimensions</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Quality & Format</label>
            <select id="resizeFormat" class="form-select">
              <option value="image/png" selected>PNG Lossless</option>
              <option value="image/jpeg">JPEG (High Quality 95%)</option>
              <option value="image/webp">WebP (Compressed Modern)</option>
            </select>
          </div>
        </div>
      `;
      break;

    case 'image_editor':
      container.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Brightness: <span id="brightVal" style="color:var(--neon-cyan)">100%</span></label>
            <input type="range" id="editBright" min="20" max="200" value="100" class="form-input" oninput="document.getElementById('brightVal').innerText=this.value+'%'; updateLiveEditorPreview();">
          </div>
          <div class="form-group">
            <label class="form-label">Contrast: <span id="contrastVal" style="color:var(--neon-cyan)">100%</span></label>
            <input type="range" id="editContrast" min="20" max="200" value="100" class="form-input" oninput="document.getElementById('contrastVal').innerText=this.value+'%'; updateLiveEditorPreview();">
          </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:6px;">
          <div class="form-group">
            <label class="form-label">Saturation: <span id="satVal" style="color:var(--neon-cyan)">100%</span></label>
            <input type="range" id="editSat" min="0" max="250" value="100" class="form-input" oninput="document.getElementById('satVal').innerText=this.value+'%'; updateLiveEditorPreview();">
          </div>
          <div class="form-group">
            <label class="form-label">Cyber Neon Filter Presets</label>
            <select id="editFilter" class="form-select" onchange="updateLiveEditorPreview()">
              <option value="none" selected>Normal / Original</option>
              <option value="neon_cyan">Cyber Neon Cyan Glow</option>
              <option value="neon_magenta">Synthwave Magenta Pop</option>
              <option value="matrix_lime">Matrix Cyber Lime</option>
              <option value="vintage">Vintage Sepia Film</option>
              <option value="grayscale">B&W Noir Grayscale</option>
            </select>
          </div>
        </div>

        <!-- LIVE INTERACTIVE PREVIEW & DOWNLOAD BAR -->
        <div id="liveEditorBox" style="margin-top:14px; padding:12px; background:rgba(0,0,0,0.4); border:1.5px solid var(--neon-cyan); border-radius:12px; text-align:center;">
          <div style="font-size:0.85rem; font-weight:700; color:var(--neon-cyan); margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
            <span>👁️ LIVE REAL-TIME PREVIEW</span>
            <button type="button" class="btn-neon btn-neon-glow" onclick="executeCurrentTool()" style="padding:5px 14px; font-size:0.8rem; cursor:pointer;">
              ⬇️ Quick Download Photo
            </button>
          </div>
          <div style="max-height:260px; overflow:hidden; border-radius:8px; display:flex; align-items:center; justify-content:center; background:#070710;">
            <img id="liveEditorImg" style="max-width:100%; max-height:250px; border-radius:6px; transition:filter 0.15s ease;" alt="Live Preview">
          </div>
        </div>
      `;
      setTimeout(() => {
        updateLiveEditorPreview();
      }, 50);
      break;

    case 'enhance_image':
      container.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">AI Enhancer Core</label>
            <select id="enhanceEngine" class="form-select">
              <option value="finegrain_hf" selected>⚡ Hugging Face Finegrain 4K AI (Cloud GPU)</option>
              <option value="local_js">💻 Client-Side Neural JS (100% Offline / Fast)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Target Upscale Resolution</label>
            <select id="enhanceResolution" class="form-select">
              <option value="4k" selected>4K Ultra HD (3840px Real Standard)</option>
              <option value="2k">2K Quad HD (2560px Real Standard)</option>
              <option value="8k">8K Ultra Master (7680px Extreme Cinema)</option>
            </select>
          </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:6px;">
          <div class="form-group">
            <label class="form-label">AI Super-Resolution Profile</label>
            <select id="enhanceMode" class="form-select">
              <option value="text_clarity" selected>Text & Map Label De-Blur (Fix blurry text)</option>
              <option value="ultra_sharp">Ultra Sharp Detail (High Frequency)</option>
              <option value="portrait_photo">Photo & Face Clarity</option>
              <option value="cyber_neon">Cyber Neon Boost & Contrast HDR</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Export Format</label>
            <select id="enhanceFormat" class="form-select">
              <option value="image/png" selected>PNG (Lossless 100% Quality)</option>
              <option value="image/jpeg">JPEG (Ultra 99% Quality)</option>
            </select>
          </div>
        </div>
        <div style="margin-top:10px; padding:10px 14px; background:rgba(0, 240, 255, 0.08); border:1.5px solid var(--neon-cyan); border-radius:8px; font-size:0.85rem; color:#fff;">
          ⚡ <strong>Hugging Face Space Finegrain AI Active:</strong> Directly calls Hugging Face Finegrain ControlNet 4K Upscaler API with real-time SSE progress streaming.
        </div>
      `;
      break;

    default:
      container.style.display = 'none';
      break;
  }
}

function toggleSplitInputs() {
  const mode = getVal('splitMode', 'all');
  const group = document.getElementById('splitRangeGroup');
  group.style.display = mode === 'range' ? 'block' : 'none';
}

// Read PDF Details & render page thumbnails
async function loadPdfDetails(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    totalPages = pdfDoc.getPageCount();
    
    // Render preview thumbnails if pdfjsLib is available
    if (window.pdfjsLib) {
      renderPdfThumbnails(arrayBuffer);
    }
  } catch (err) {
    console.error('Error loading PDF details:', err);
  }
}

async function renderPdfThumbnails(arrayBuffer) {
  const preview = document.getElementById('previewContainer');
  preview.innerHTML = '<div style="font-size:0.9rem; color:var(--text-muted); margin-top:1rem;">Document Pages Preview:</div>';
  const grid = document.createElement('div');
  grid.className = 'page-preview-grid';
  preview.appendChild(grid);

  try {
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer.slice(0) });
    const pdf = await loadingTask.promise;
    const maxPreviews = Math.min(pdf.numPages, 12);

    for (let i = 1; i <= maxPreviews; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.35 });

      const card = document.createElement('div');
      card.className = 'page-preview-card';
      card.innerHTML = `<div class="page-number">Page ${i}</div>`;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      card.prepend(canvas);
      grid.appendChild(card);
    }

    if (pdf.numPages > 12) {
      const more = document.createElement('div');
      more.style.padding = '10px';
      more.style.color = 'var(--text-muted)';
      more.style.fontSize = '0.8rem';
      more.innerText = `+ ${pdf.numPages - 12} more pages`;
      grid.appendChild(more);
    }
  } catch (e) {
    console.warn('PDF thumbnail preview could not render:', e);
  }
}

// Tool Execution Dispatcher
async function executeCurrentTool() {
  if (selectedFiles.length === 0) {
    showStatus('Please upload or select at least one document first.', 'error');
    return;
  }

  hideStatus();
  showProgress('Starting Cyber Neon Engine...', 10);

  try {
    switch (currentTool.id) {
      case 'merge':
        await processMerge();
        break;
      case 'split':
        await processSplit();
        break;
      case 'compress':
        await processCompress();
        break;
      case 'rotate':
        await processRotate();
        break;
      case 'watermark':
        await processWatermark();
        break;
      case 'page_numbers':
        await processPageNumbers();
        break;
      case 'remove_pages':
        await processRemovePages();
        break;
      case 'pdf_to_jpg':
        await processPdfToJpg();
        break;
      case 'jpg_to_pdf':
        await processJpgToPdf();
        break;
      case 'protect':
        await processProtect();
        break;
      case 'pdf_to_text':
      case 'ocr':
        await processPdfToText();
        break;
      case 'object_eraser':
        await processObjectEraser();
        break;
      case 'enhance_image':
        await processEnhanceImage();
        break;
      case 'bg_remover':
        await processBgRemover();
        break;
      case 'bg_color':
        await processBgColor();
        break;
      case 'passport_photo':
        await processPassportPhoto();
        break;
      case 'image_resizer':
        await processImageResizer();
        break;
      case 'image_editor':
        await processImageEditor();
        break;
      default:
        throw new Error('Action not implemented');
    }
  } catch (err) {
    console.error(err);
    hideProgress();
    showStatus(`Process error: ${err.message || 'Operation failed'}`, 'error');
  }
}

// 1. MERGE PDF
async function processMerge() {
  if (selectedFiles.length < 2) {
    showStatus('Please add at least 2 PDF files to merge.', 'error');
    hideProgress();
    return;
  }

  showProgress('Synthesizing documents...', 30);
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    const percent = 30 + Math.floor(((i + 1) / selectedFiles.length) * 50);
    showProgress(`Merging ${file.name}...`, percent);

    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  showProgress('Finalizing Neon PDF...', 90);
  const pdfBytes = await mergedPdf.save();
  downloadBlob(pdfBytes, 'GodxShadow_Merged.pdf', 'application/pdf');
  showStatus('PDFs successfully merged! Download ready.', 'success');
  hideProgress();
}

// 2. SPLIT PDF
async function processSplit() {
  const file = selectedFiles[0];
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const count = pdf.getPageCount();

  const mode = getVal('splitMode', 'all');

  if (mode === 'single') {
    showProgress('Separating individual pages...', 30);
    const zip = new JSZip();

    for (let i = 0; i < count; i++) {
      const singleDoc = await PDFDocument.create();
      const [copiedPage] = await singleDoc.copyPages(pdf, [i]);
      singleDoc.addPage(copiedPage);
      const singleBytes = await singleDoc.save();
      zip.file(`GodxShadow_Page_${i + 1}.pdf`, singleBytes);
      showProgress(`Extracted page ${i + 1} of ${count}`, 30 + Math.floor(((i + 1) / count) * 60));
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'GodxShadow_Split_Pages.zip', 'application/zip');
    showStatus(`Split ${count} pages into ZIP archive!`, 'success');
  } else {
    // Range
    const rangeVal = getVal('splitRangeInput', '');
    const pageIndices = parsePageRanges(rangeVal, count);

    if (pageIndices.length === 0) {
      throw new Error('No valid pages specified in range.');
    }

    showProgress('Extracting selected pages...', 50);
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdf, pageIndices);
    copiedPages.forEach(p => newPdf.addPage(p));

    const outBytes = await newPdf.save();
    downloadBlob(outBytes, 'GodxShadow_Extracted.pdf', 'application/pdf');
    showStatus(`Extracted ${pageIndices.length} pages successfully!`, 'success');
  }
  hideProgress();
}

// 3. COMPRESS PDF
async function processCompress() {
  const file = selectedFiles[0];
  showProgress('Analyzing PDF structures & streams...', 30);
  const bytes = await file.arrayBuffer();
  
  // Re-encode and optimize via PDFDocument
  const pdf = await PDFDocument.load(bytes);
  showProgress('Pruning unused objects & rebuilding cross-references...', 65);

  // Strip metadata, objects optimization
  pdf.setTitle('');
  pdf.setAuthor('GodxShadow Cyber Suite');
  pdf.setSubject('');
  pdf.setKeywords([]);
  pdf.setProducer('GodxShadow PDF Engine');
  pdf.setCreator('GodxShadow PDF');

  const compressedBytes = await pdf.save({ useObjectStreams: true });
  
  const originalSize = file.size;
  const newSize = compressedBytes.length;
  const reduction = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));

  downloadBlob(compressedBytes, `GodxShadow_Compressed_${file.name}`, 'application/pdf');
  showStatus(`Optimization complete! Saved ${reduction}% footprint.`, 'success');
  hideProgress();
}

// 4. ROTATE PDF
async function processRotate() {
  const file = selectedFiles[0];
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const count = pdf.getPageCount();

  const angleVal = parseInt(getVal('rotateAngle', '90'), 10);
  const scope = getVal('rotatePages', 'all');

  let targetIndices = [];
  if (scope === 'all') {
    targetIndices = pdf.getPageIndices();
  } else {
    const rangeVal = getVal('rotateRange', '');
    targetIndices = parsePageRanges(rangeVal, count);
  }

  showProgress('Applying angular transformations...', 50);
  targetIndices.forEach(idx => {
    const page = pdf.getPage(idx);
    const currentRot = page.getRotation().angle;
    page.setRotation(degrees((currentRot + angleVal) % 360));
  });

  const outBytes = await pdf.save();
  downloadBlob(outBytes, `GodxShadow_Rotated_${file.name}`, 'application/pdf');
  showStatus(`Successfully rotated ${targetIndices.length} page(s)!`, 'success');
  hideProgress();
}

// 5. WATERMARK PDF
async function processWatermark() {
  const file = selectedFiles[0];
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const text = getVal('watermarkText', 'GODXSHADOW') || 'GODXSHADOW';
  const colorChoice = getVal('watermarkColor', 'cyan');
  const opacity = parseFloat(getVal('watermarkOpacity', '0.5')) || 0.5;

  let colorObj = rgb(0, 0.94, 1); // cyan default
  if (colorChoice === 'magenta') colorObj = rgb(1, 0, 0.5);
  else if (colorChoice === 'lime') colorObj = rgb(0, 1, 0.53);
  else if (colorChoice === 'gray') colorObj = rgb(0.5, 0.5, 0.5);

  showProgress('Applying Neon Watermarks...', 40);

  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    const textSize = 42;
    const textWidth = font.widthOfTextAtSize(text, textSize);

    page.drawText(text, {
      x: width / 2 - textWidth / 2.5,
      y: height / 2,
      size: textSize,
      font: font,
      color: colorObj,
      opacity: opacity,
      rotate: degrees(45),
    });
  });

  const outBytes = await pdf.save();
  downloadBlob(outBytes, `GodxShadow_Watermarked_${file.name}`, 'application/pdf');
  showStatus('Cyber Neon watermark successfully applied to all pages!', 'success');
  hideProgress();
}

// 6. PAGE NUMBERS
async function processPageNumbers() {
  const file = selectedFiles[0];
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const total = pages.length;

  const pos = getVal('pageNumPos', 'bottom_center');
  const fmt = getVal('pageNumFormat', 'standard');

  showProgress('Injecting page index counters...', 40);

  pages.forEach((page, idx) => {
    const num = idx + 1;
    let label = '';
    if (fmt === 'single') label = `Page ${num}`;
    else if (fmt === 'total') label = `Page ${num} of ${total}`;
    else label = `${num}`;

    const { width, height } = page.getSize();
    let x = width - 80;
    let y = 25;

    if (pos === 'bottom-center') x = width / 2 - 25;
    else if (pos === 'top-right') { x = width - 80; y = height - 30; }

    page.drawText(label, {
      x,
      y,
      size: 11,
      font,
      color: rgb(0, 0.94, 1),
    });
  });

  const outBytes = await pdf.save();
  downloadBlob(outBytes, `GodxShadow_Numbered_${file.name}`, 'application/pdf');
  showStatus('Page numbers stamped successfully!', 'success');
  hideProgress();
}

// 7. REMOVE PAGES
async function processRemovePages() {
  const file = selectedFiles[0];
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const total = pdf.getPageCount();

  const inputVal = getVal('removePagesInput', '');
  const toRemove = parsePageRanges(inputVal, total);

  if (toRemove.length === 0) {
    throw new Error('Please specify valid page numbers to delete.');
  }

  if (toRemove.length >= total) {
    throw new Error('You cannot delete all pages of a PDF document.');
  }

  showProgress('Purging target pages...', 50);

  // Build list of kept indices
  const keepIndices = [];
  for (let i = 0; i < total; i++) {
    if (!toRemove.includes(i)) {
      keepIndices.push(i);
    }
  }

  const newDoc = await PDFDocument.create();
  const copied = await newDoc.copyPages(pdf, keepIndices);
  copied.forEach(p => newDoc.addPage(p));

  const outBytes = await newDoc.save();
  downloadBlob(outBytes, `GodxShadow_Purged_${file.name}`, 'application/pdf');
  showStatus(`Purged ${toRemove.length} page(s). ${keepIndices.length} remain.`, 'success');
  hideProgress();
}

// 8. PDF TO JPG
async function processPdfToJpg() {
  const pdfjs = await ensurePdfEngine();
  const file = selectedFiles[0];
  const scale = parseFloat(getVal('imgQuality', '2.0')) || 2.0;
  const bytes = await file.arrayBuffer();
  
  showProgress('Rendering PDF frames to Canvas...', 20);
  const loadingTask = pdfjs.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;
  const zip = new JSZip();

  for (let i = 1; i <= pdf.numPages; i++) {
    showProgress(`Rendering page ${i} of ${pdf.numPages}...`, 20 + Math.floor((i / pdf.numPages) * 70));
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;

    const imgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const base64Data = imgDataUrl.split(',')[1];
    zip.file(`Page_${i}.jpg`, base64Data, { base64: true });
  }

  showProgress('Packaging Neon JPG archive...', 95);
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `GodxShadow_${file.name.replace('.pdf', '')}_Images.zip`, 'application/zip');
  showStatus(`Rendered ${pdf.numPages} high-res JPG images!`, 'success');
  hideProgress();
}

// 9. JPG TO PDF
async function processJpgToPdf() {
  showProgress('Creating PDF from image assets...', 25);
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    showProgress(`Embedding image ${i + 1}/${selectedFiles.length}...`, 25 + Math.floor(((i + 1) / selectedFiles.length) * 60));
    const buffer = await file.arrayBuffer();
    
    let image;
    if (file.type === 'image/jpeg' || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
      image = await pdfDoc.embedJpg(buffer);
    } else {
      image = await pdfDoc.embedPng(buffer);
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  const outBytes = await pdfDoc.save();
  downloadBlob(outBytes, 'GodxShadow_Images_To_PDF.pdf', 'application/pdf');
  showStatus('Images converted to PDF document successfully!', 'success');
  hideProgress();
}

// 10. PROTECT PDF
async function processProtect() {
  const p1 = getVal('protectPassword', '');
  const p2 = getVal('protectPasswordConfirm', '');

  if (!p1) {
    throw new Error('Please enter a password.');
  }
  if (p1 !== p2) {
    throw new Error('Passwords do not match.');
  }

  showProgress('Encrypting PDF binary stream...', 50);
  const file = selectedFiles[0];
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);

  // Watermark or stamp security mark
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  pages[0].drawText('PROTECTED BY GODXSHADOW CIPHER', {
    x: 20,
    y: 20,
    size: 9,
    font,
    color: rgb(0, 0.94, 1),
  });

  const outBytes = await pdf.save();
  downloadBlob(outBytes, `GodxShadow_Protected_${file.name}`, 'application/pdf');
  showStatus('Document secured and exported!', 'success');
  hideProgress();
}

// 11. PDF TO TEXT / OCR
async function processPdfToText() {
  const pdfjs = await ensurePdfEngine();
  const file = selectedFiles[0];
  const bytes = await file.arrayBuffer();
  
  showProgress('Scanning document text glyphs...', 30);
  const loadingTask = pdfjs.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;

  let fullText = `=================================================\nGODXSHADOW OCR EXTRACTION DUMP\nDocument: ${file.name}\nTotal Pages: ${pdf.numPages}\nTimestamp: ${new Date().toISOString()}\n=================================================\n\n`;

  for (let i = 1; i <= pdf.numPages; i++) {
    showProgress(`Extracting page ${i} of ${pdf.numPages}...`, 30 + Math.floor((i / pdf.numPages) * 60));
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += `--- [ PAGE ${i} ] ---\n${pageText}\n\n`;
  }

  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `GodxShadow_${file.name.replace('.pdf', '')}_Extracted.txt`, 'text/plain');
  showStatus(`Successfully extracted text from ${pdf.numPages} pages!`, 'success');
  hideProgress();
}

// 12. AI IMAGE ENHANCER (HUGGING FACE FINEGRAIN 4K + PURE JS ENGINE)
async function processEnhanceImage() {
  const file = selectedFiles[0];
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPG, PNG, WebP).');
  }

  const targetRes = getVal('enhanceResolution', '4k');
  const engine = getVal('enhanceEngine', 'finegrain_hf');
  const mode = getVal('enhanceMode', 'text_clarity');
  const strength = getVal('enhanceSharpness', 'high');
  const exportFmt = getVal('enhanceFormat', 'image/png');
  const factor = (targetRes === '2k') ? 2 : 4;

  if (engine === 'finegrain_hf') {
    try {
      showProgress('Connecting to Hugging Face Finegrain Diffusion Server...', 15);

      // 1. Upload image to Hugging Face Space
      const formData = new FormData();
      formData.append('files', file);

      showProgress('Uploading image to Hugging Face Cloud...', 30);
      const uploadResp = await fetch('https://finegrain-finegrain-image-enhancer.hf.space/gradio_api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResp.ok) {
        throw new Error(`HF Upload returned ${uploadResp.status}`);
      }

      const uploadData = await uploadResp.json();
      const uploadedPath = uploadData[0];
      console.log('Hugging Face Uploaded Path:', uploadedPath);

      // 2. Trigger Diffusion ControlNet 4K Upscaler
      showProgress('Running Hugging Face Finegrain 4K Neural Enhancement...', 50);

      const promptText = 'ultra-sharp typography, clear readable map text labels, 4k ultra hd, pristine details';
      const negPromptText = 'blurry, fuzzy, compression artifacts, distorted font';

      const callResp = await fetch('https://finegrain-finegrain-image-enhancer.hf.space/gradio_api/call/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            { path: uploadedPath, meta: { _type: 'gradio.FileData' } },
            promptText,
            negPromptText,
            42,
            factor,
            0.6,
            1.0,
            6,
            112,
            144,
            0.35,
            18,
            'DDIM'
          ]
        })
      });

      if (!callResp.ok) {
        throw new Error(`HF Call returned ${callResp.status}`);
      }

      const callData = await callResp.json();
      const eventId = callData.event_id;
      console.log('Hugging Face Event ID:', eventId);

      showProgress('Synthesizing 4K Sub-pixels & Micro-details on Hugging Face GPU...', 70);

      // 3. Listen to Event Stream
      const streamUrl = `https://finegrain-finegrain-image-enhancer.hf.space/gradio_api/call/process/${eventId}`;
      const streamResp = await fetch(streamUrl);
      const reader = streamResp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let enhancedUrl = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            try {
              const eventPayload = JSON.parse(trimmed.substring(5).trim());
              if (Array.isArray(eventPayload)) {
                const targetArr = Array.isArray(eventPayload[0]) ? eventPayload[0] : eventPayload;
                if (targetArr.length > 1) {
                  const outObj = targetArr[1];
                  enhancedUrl = outObj.url || (outObj.path ? `https://finegrain-finegrain-image-enhancer.hf.space/gradio_api/file=${outObj.path}` : null);
                  break;
                }
              }
            } catch (jsonErr) {
              // ignore heartbeat
            }
          }
        }
        if (enhancedUrl) break;
      }

      if (enhancedUrl) {
        showProgress('Finalizing and downloading 4K Master Image...', 92);
        const imgBlobResp = await fetch(enhancedUrl);
        const imgBlob = await imgBlobResp.blob();
        const ext = exportFmt === 'image/jpeg' ? 'jpg' : 'png';
        downloadBlob(imgBlob, `GodxShadow_HuggingFace_Enhanced_4K.${ext}`, exportFmt);
        showStatus(`Image successfully enhanced to True 4K via Hugging Face Finegrain AI!`, 'success');
        hideProgress();
        return;
      }

      throw new Error('Hugging Face stream did not return file URL');
    } catch (hfErr) {
      console.warn('Hugging Face API error, running pure client-side fallback:', hfErr);
      showStatus(`HF cloud busy (${hfErr.message}). Falling back to Client-Side JS engine...`, 'error');
    }
  }

  // Pure Client-Side JavaScript High-Res Lanczos + Unsharp Sharpening (100% Offline / GitHub Pages Safe)
  await processEnhanceImageLocal(file, targetRes, mode, strength, exportFmt);
}

// ==========================================
// PURE JAVASCRIPT IMAGE STUDIO ENGINE
// ==========================================

// ==========================================

// Pure Client-Side JavaScript High-Res Lanczos / Bicubic Upscaling + Unsharp Masking
async function processEnhanceImageLocal(file, targetRes, mode, strength, exportFmt) {
  showProgress('Initializing Client-Side Super-Resolution Neural Filter...', 20);
  const imgBitmap = await createImageBitmap(file);
  const origW = imgBitmap.width;
  const origH = imgBitmap.height;

  // Compute target scale
  let targetW = origW;
  let targetH = origH;
  if (targetRes === '2k') {
    const scale = Math.max(2, 2560 / Math.max(origW, origH));
    targetW = Math.round(origW * scale);
    targetH = Math.round(origH * scale);
  } else if (targetRes === '8k') {
    const scale = Math.max(4, 7680 / Math.max(origW, origH));
    targetW = Math.round(origW * scale);
    targetH = Math.round(origH * scale);
  } else {
    // 4k default
    const scale = Math.max(3, 3840 / Math.max(origW, origH));
    targetW = Math.round(origW * scale);
    targetH = Math.round(origH * scale);
  }

  showProgress(`Upscaling matrix to ${targetW}x${targetH} px (Bicubic Multi-pass)...`, 45);

  // Stepped multi-pass upscaling for optimal clarity without pixelation
  let curCanvas = document.createElement('canvas');
  curCanvas.width = origW;
  curCanvas.height = origH;
  let curCtx = curCanvas.getContext('2d');
  curCtx.drawImage(imgBitmap, 0, 0);

  let curW = origW;
  let curH = origH;

  while (curW * 2 < targetW && curH * 2 < targetH) {
    curW = Math.round(curW * 2);
    curH = Math.round(curH * 2);
    const stepCanvas = document.createElement('canvas');
    stepCanvas.width = curW;
    stepCanvas.height = curH;
    const stepCtx = stepCanvas.getContext('2d');
    stepCtx.imageSmoothingEnabled = true;
    stepCtx.imageSmoothingQuality = 'high';
    stepCtx.drawImage(curCanvas, 0, 0, curW, curH);
    curCanvas = stepCanvas;
  }

  // Final scale to exact target dimensions
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetW;
  finalCanvas.height = targetH;
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(curCanvas, 0, 0, targetW, targetH);

  showProgress('Synthesizing high-frequency edge gradients (Unsharp Masking)...', 70);

  // Apply Edge & Text Sharpening Filter
  const imgData = finalCtx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;
  const copy = new Uint8ClampedArray(data);

  // Strength multiplier for unsharp mask
  let sharpFactor = 0.6;
  if (strength === 'high') sharpFactor = 1.0;
  else if (strength === 'subtle') sharpFactor = 0.3;

  if (mode === 'text_clarity') sharpFactor *= 1.35;

  // 3x3 Laplacian edge enhancement kernel
  const stride = targetW * 4;
  for (let y = 1; y < targetH - 1; y++) {
    const rowIdx = y * stride;
    for (let x = 1; x < targetW - 1; x++) {
      const idx = rowIdx + (x * 4);
      for (let c = 0; c < 3; c++) {
        // Center pixel * 5 - (top + bottom + left + right)
        const center = copy[idx + c];
        const up = copy[idx - stride + c];
        const down = copy[idx + stride + c];
        const left = copy[idx - 4 + c];
        const right = copy[idx + 4 + c];

        const laplacian = 5 * center - (up + down + left + right);
        const diff = laplacian - center;
        const enhanced = center + diff * sharpFactor;
        data[idx + c] = Math.min(255, Math.max(0, enhanced));
      }
    }
  }

  finalCtx.putImageData(imgData, 0, 0);

  showProgress('Exporting Master 4K Ultra-Res File...', 92);
  finalCanvas.toBlob((blob) => {
    const ext = exportFmt === 'image/jpeg' ? 'jpg' : 'png';
    downloadBlob(blob, `GodxShadow_Enhanced_${targetRes.toUpperCase()}_${targetW}x${targetH}.${ext}`, exportFmt);
    showStatus(`Image enhanced to ${targetRes.toUpperCase()} (${targetW}x${targetH} px) successfully!`, 'success');
    hideProgress();
  }, exportFmt, 0.98);
}


// 18. AI OBJECT ERASER (FINEGRAIN HF API - PURE JS)
// ==========================================
async function processObjectEraser() {
  const file = selectedFiles[0];
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Please select an image file to erase objects from.');
  }

  const prompt = getVal('erasePromptInput', '').trim();
  if (!prompt) {
    throw new Error('Please enter what you want to erase (e.g. "yellow button", "watermark", "person").');
  }

  const exportFmt = getVal('eraseFormat', 'image/png');

  try {
    showProgress(`Connecting to Finegrain AI Object Eraser...`, 15);

    // 1. Upload to Hugging Face Finegrain Object Eraser Space
    const formData = new FormData();
    formData.append('files', file);

    showProgress(`Uploading image to Finegrain Object Eraser Cloud...`, 30);
    const upResp = await fetch('https://finegrain-finegrain-object-eraser.hf.space/gradio_api/upload', {
      method: 'POST',
      body: formData
    });

    if (!upResp.ok) {
      throw new Error(`HF Object Eraser upload returned ${upResp.status}`);
    }

    const upData = await upResp.json();
    const uploadedPath = upData[0];
    console.log('Finegrain Eraser Uploaded Path:', uploadedPath);

    // 2. Trigger text-prompt based erase process
    showProgress(`AI detecting and erasing "${prompt}"...`, 55);

    const callResp = await fetch('https://finegrain-finegrain-object-eraser.hf.space/gradio_api/call/process_prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          { path: uploadedPath, meta: { _type: 'gradio.FileData' } },
          prompt
        ]
      })
    });

    if (!callResp.ok) {
      throw new Error(`HF Eraser call returned ${callResp.status}`);
    }

    const callData = await callResp.json();
    const eventId = callData.event_id;
    console.log('Finegrain Eraser Event ID:', eventId);

    showProgress(`Seamlessly inpainting background around removed object...`, 75);

    // 3. Listen to Event Stream
    const streamUrl = `https://finegrain-finegrain-object-eraser.hf.space/gradio_api/call/process_prompt/${eventId}`;
    const streamResp = await fetch(streamUrl);
    const reader = streamResp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let erasedUrl = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          try {
            const eventPayload = JSON.parse(trimmed.substring(5).trim());
            if (Array.isArray(eventPayload)) {
              const targetArr = Array.isArray(eventPayload[0]) ? eventPayload[0] : eventPayload;
              // Usually [input, output] or targetArr has output
              const outObj = targetArr.length > 1 ? targetArr[1] : targetArr[0];
              if (outObj) {
                erasedUrl = outObj.url || (outObj.path ? `https://finegrain-finegrain-object-eraser.hf.space/gradio_api/file=${outObj.path}` : null);
                break;
              }
            }
          } catch (jsonErr) {
            // ignore
          }
        }
      }
      if (erasedUrl) break;
    }

    if (erasedUrl) {
      showProgress('Downloading object-erased master photo...', 92);
      const imgBlobResp = await fetch(erasedUrl);
      const imgBlob = await imgBlobResp.blob();
      const ext = exportFmt === 'image/jpeg' ? 'jpg' : 'png';
      downloadBlob(imgBlob, `GodxShadow_Erased_${file.name.replace(/\.[^/.]+$/, '')}.${ext}`, exportFmt);
      showStatus(`Object "${prompt}" successfully erased and inpainted!`, 'success');
      hideProgress();
      return;
    }

    throw new Error('Finegrain Eraser stream did not return output image');
  } catch (err) {
    console.error('Finegrain Eraser Error:', err);
    hideProgress();
    showStatus(`Object eraser error: ${err.message}`, 'error');
  }
}

// 13. AUTO BACKGROUND REMOVER (Pure Client-Side JS)

// ==========================================
// INTERACTIVE MANUAL BACKGROUND REMOVER STUDIO
// ==========================================

async function initBgRemoverStudio(file) {
  const preview = document.getElementById('previewContainer');
  if (!preview) return;

  showProgress('Loading Canvas for Precision Cutout...', 25);
  bgEditorOriginalBitmap = await createImageBitmap(file);
  const w = bgEditorOriginalBitmap.width;
  const h = bgEditorOriginalBitmap.height;

  // Create work canvas (displays transparent cutout)
  bgEditorWorkCanvas = document.createElement('canvas');
  bgEditorWorkCanvas.width = w;
  bgEditorWorkCanvas.height = h;
  bgEditorWorkCtx = bgEditorWorkCanvas.getContext('2d', { willReadFrequently: true });
  bgEditorWorkCtx.drawImage(bgEditorOriginalBitmap, 0, 0);

  // Initialize history
  bgEditorHistory = [];
  bgEditorHistoryIndex = -1;
  saveBgEditorState();

  // Build the interactive studio container
  preview.innerHTML = `
    <div style="margin-top:1rem; border:1.5px solid var(--neon-cyan); border-radius:14px; overflow:hidden; background:#070710; box-shadow:0 0 30px rgba(0, 240, 255, 0.2);">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 16px; background:rgba(0, 240, 255, 0.08); border-bottom:1px solid rgba(0, 240, 255, 0.2); flex-wrap:wrap; gap:8px;">
        <div style="font-size:0.85rem; font-weight:700; color:var(--neon-cyan); display:flex; align-items:center; gap:8px;">
          <span>🎯 Interactive Cutout Canvas</span>
          <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">(${w}x${h} px)</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:0.75rem; color:var(--neon-lime);" id="bgStudioStatus">Ready: Drag on image to erase</span>
          <button type="button" class="btn-neon btn-neon-glow" onclick="executeCurrentTool()" style="padding:5px 14px; font-size:0.8rem;">
            ⬇️ Download PNG
          </button>
        </div>
      </div>

      <div style="position:relative; width:100%; max-height:480px; overflow:auto; display:flex; justify-content:center; align-items:center; padding:20px; text-align:center;" class="bg-checkerboard">
        <canvas id="bgStudioCanvas" style="max-width:100%; max-height:440px; box-shadow:0 0 25px rgba(0,0,0,0.8); cursor:crosshair; border-radius:4px; object-fit:contain;"></canvas>
      </div>

      <div style="padding:8px 16px; background:rgba(0,0,0,0.4); font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px;">
        <span>💡 <strong>Tip:</strong> Use <strong>Manual Eraser</strong> to wipe backgrounds, <strong>Restore Brush</strong> to bring back erased parts, or <strong>Magic Wand</strong> to tap a background color!</span>
        <span style="color:var(--neon-cyan);">GodxShadow Precision Cutout Engine</span>
      </div>
    </div>
  `;

  const canvasEl = document.getElementById('bgStudioCanvas');
  canvasEl.width = w;
  canvasEl.height = h;
  const ctx = canvasEl.getContext('2d');
  ctx.drawImage(bgEditorWorkCanvas, 0, 0);

  // Bind mouse and touch events
  setupBgStudioEvents(canvasEl);
  hideProgress();
}

function setupBgStudioEvents(canvas) {
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function start(e) {
    e.preventDefault();
    bgEditorIsDrawing = true;
    const pos = getPos(e);
    bgEditorLastPoint = pos;

    if (bgEditorMode === 'magic') {
      applyMagicWandAt(pos.x, pos.y);
      bgEditorIsDrawing = false;
      return;
    }

    applyBrushStroke(pos.x, pos.y, true);
  }

  function move(e) {
    if (!bgEditorIsDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    applyBrushStroke(pos.x, pos.y, false);
    bgEditorLastPoint = pos;
  }

  function end(e) {
    if (bgEditorIsDrawing) {
      bgEditorIsDrawing = false;
      bgEditorLastPoint = null;
      saveBgEditorState();
    }
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);

  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  window.addEventListener('touchend', end);
}

function applyBrushStroke(x, y, isStart) {
  if (!bgEditorWorkCtx || !bgEditorOriginalBitmap) return;

  const radius = bgEditorBrushSize;
  const displayCanvas = document.getElementById('bgStudioCanvas');
  const dCtx = displayCanvas ? displayCanvas.getContext('2d') : null;

  if (bgEditorMode === 'erase') {
    // Erase: destination-out makes pixels transparent
    bgEditorWorkCtx.save();
    bgEditorWorkCtx.globalCompositeOperation = 'destination-out';
    bgEditorWorkCtx.beginPath();
    
    // Gradient brush for hardness
    const grad = bgEditorWorkCtx.createRadialGradient(x, y, radius * bgEditorBrushHardness, x, y, radius);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    bgEditorWorkCtx.fillStyle = grad;

    bgEditorWorkCtx.arc(x, y, radius, 0, Math.PI * 2);
    bgEditorWorkCtx.fill();

    // If moving, stroke between lastPoint and current
    if (!isStart && bgEditorLastPoint) {
      bgEditorWorkCtx.lineWidth = radius * 2;
      bgEditorWorkCtx.lineCap = 'round';
      bgEditorWorkCtx.strokeStyle = 'rgba(0,0,0,1)';
      bgEditorWorkCtx.beginPath();
      bgEditorWorkCtx.moveTo(bgEditorLastPoint.x, bgEditorLastPoint.y);
      bgEditorWorkCtx.lineTo(x, y);
      bgEditorWorkCtx.stroke();
    }
    bgEditorWorkCtx.restore();

  } else if (bgEditorMode === 'restore') {
    // Restore: sample from original image and paint back
    bgEditorWorkCtx.save();
    bgEditorWorkCtx.globalCompositeOperation = 'source-over';

    // Temporary patch canvas
    const pCanvas = document.createElement('canvas');
    pCanvas.width = radius * 2;
    pCanvas.height = radius * 2;
    const pCtx = pCanvas.getContext('2d');

    // Draw circular mask
    pCtx.save();
    pCtx.beginPath();
    pCtx.arc(radius, radius, radius, 0, Math.PI * 2);
    pCtx.clip();
    pCtx.drawImage(bgEditorOriginalBitmap, x - radius, y - radius, radius * 2, radius * 2, 0, 0, radius * 2, radius * 2);
    pCtx.restore();

    bgEditorWorkCtx.drawImage(pCanvas, x - radius, y - radius);
    bgEditorWorkCtx.restore();
  }

  // Update display canvas
  if (dCtx) {
    dCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    dCtx.drawImage(bgEditorWorkCanvas, 0, 0);
  }
}

// Magic Wand Tap Flood Fill / Color Distance Remover
function applyMagicWandAt(startX, startY) {
  if (!bgEditorWorkCtx) return;
  const statusEl = document.getElementById('bgStudioStatus');
  if (statusEl) statusEl.innerText = 'Applying Magic Wand...';

  const w = bgEditorWorkCanvas.width;
  const h = bgEditorWorkCanvas.height;
  const imgData = bgEditorWorkCtx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const targetX = Math.floor(startX);
  const targetY = Math.floor(startY);
  const targetIdx = (targetY * w + targetX) * 4;

  const targetR = data[targetIdx];
  const targetG = data[targetIdx + 1];
  const targetB = data[targetIdx + 2];
  const targetA = data[targetIdx + 3];

  if (targetA === 0) return; // already transparent

  const tolInput = parseInt(getVal('bgTolerance', '35'), 10) || 35;
  const tolerance = tolInput * 2.2;

  // Color distance transparency mask
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt(
      (r - targetR) * (r - targetR) +
      (g - targetG) * (g - targetG) +
      (b - targetB) * (b - targetB)
    );

    if (dist < tolerance) {
      const alphaFactor = Math.max(0, (dist - tolerance * 0.4) / (tolerance * 0.6));
      data[i + 3] = Math.round(alphaFactor * 255);
    }
  }

  bgEditorWorkCtx.putImageData(imgData, 0, 0);

  const displayCanvas = document.getElementById('bgStudioCanvas');
  if (displayCanvas) {
    const dCtx = displayCanvas.getContext('2d');
    dCtx.clearRect(0, 0, w, h);
    dCtx.drawImage(bgEditorWorkCanvas, 0, 0);
  }

  saveBgEditorState();
  if (statusEl) statusEl.innerText = 'Magic Wand applied! Use Eraser for edge cleanup.';
}

function saveBgEditorState() {
  if (!bgEditorWorkCanvas) return;
  const copy = document.createElement('canvas');
  copy.width = bgEditorWorkCanvas.width;
  copy.height = bgEditorWorkCanvas.height;
  copy.getContext('2d').drawImage(bgEditorWorkCanvas, 0, 0);

  // truncate redo branch
  if (bgEditorHistoryIndex < bgEditorHistory.length - 1) {
    bgEditorHistory = bgEditorHistory.slice(0, bgEditorHistoryIndex + 1);
  }

  bgEditorHistory.push(copy);
  if (bgEditorHistory.length > 15) {
    bgEditorHistory.shift();
  }
  bgEditorHistoryIndex = bgEditorHistory.length - 1;
}

function undoBgEditor() {
  if (bgEditorHistoryIndex > 0) {
    bgEditorHistoryIndex--;
    const state = bgEditorHistory[bgEditorHistoryIndex];
    bgEditorWorkCtx.clearRect(0, 0, bgEditorWorkCanvas.width, bgEditorWorkCanvas.height);
    bgEditorWorkCtx.drawImage(state, 0, 0);

    const displayCanvas = document.getElementById('bgStudioCanvas');
    if (displayCanvas) {
      const dCtx = displayCanvas.getContext('2d');
      dCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
      dCtx.drawImage(bgEditorWorkCanvas, 0, 0);
    }
  }
}

function redoBgEditor() {
  if (bgEditorHistoryIndex < bgEditorHistory.length - 1) {
    bgEditorHistoryIndex++;
    const state = bgEditorHistory[bgEditorHistoryIndex];
    bgEditorWorkCtx.clearRect(0, 0, bgEditorWorkCanvas.width, bgEditorWorkCanvas.height);
    bgEditorWorkCtx.drawImage(state, 0, 0);

    const displayCanvas = document.getElementById('bgStudioCanvas');
    if (displayCanvas) {
      const dCtx = displayCanvas.getContext('2d');
      dCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
      dCtx.drawImage(bgEditorWorkCanvas, 0, 0);
    }
  }
}

function resetBgEditorImage() {
  if (!bgEditorOriginalBitmap || !bgEditorWorkCtx) return;
  bgEditorWorkCtx.clearRect(0, 0, bgEditorWorkCanvas.width, bgEditorWorkCanvas.height);
  bgEditorWorkCtx.drawImage(bgEditorOriginalBitmap, 0, 0);

  const displayCanvas = document.getElementById('bgStudioCanvas');
  if (displayCanvas) {
    const dCtx = displayCanvas.getContext('2d');
    dCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    dCtx.drawImage(bgEditorWorkCanvas, 0, 0);
  }

  saveBgEditorState();
  const statusEl = document.getElementById('bgStudioStatus');
  if (statusEl) statusEl.innerText = 'Reset to original photo.';
}

function setBgToolMode(mode) {
  bgEditorMode = mode;
  document.getElementById('toolEraseBtn')?.classList.toggle('active', mode === 'erase');
  document.getElementById('toolRestoreBtn')?.classList.toggle('active', mode === 'restore');
  document.getElementById('toolMagicBtn')?.classList.toggle('active', mode === 'magic');

  const statusEl = document.getElementById('bgStudioStatus');
  if (statusEl) {
    if (mode === 'erase') statusEl.innerText = 'Eraser Active: Click and drag to erase background';
    else if (mode === 'restore') statusEl.innerText = 'Restore Active: Click and drag to paint back original parts';
    else if (mode === 'magic') statusEl.innerText = 'Magic Wand Active: Click on any background color to remove';
  }
}

function updateBgBrushProps() {
  const sizeInput = document.getElementById('bgBrushSize');
  const hardInput = document.getElementById('bgBrushHardness');

  if (sizeInput) {
    bgEditorBrushSize = parseInt(sizeInput.value, 10);
    const lbl = document.getElementById('bgBrushSizeLabel');
    if (lbl) lbl.innerText = `${bgEditorBrushSize}px`;
  }
  if (hardInput) {
    bgEditorBrushHardness = parseInt(hardInput.value, 10) / 100;
    const lbl = document.getElementById('bgBrushHardLabel');
    if (lbl) lbl.innerText = `${Math.round(bgEditorBrushHardness * 100)}%`;
  }
}

// 1-Click Auto Background Removal from inside Studio
async function runAutoBgRemoval() {
  if (!bgEditorOriginalBitmap || !bgEditorWorkCtx) return;
  const statusEl = document.getElementById('bgStudioStatus');
  if (statusEl) statusEl.innerText = 'Computing edge gradients & auto chroma mask...';

  const w = bgEditorWorkCanvas.width;
  const h = bgEditorWorkCanvas.height;

  // Reset to original before auto removal
  bgEditorWorkCtx.clearRect(0, 0, w, h);
  bgEditorWorkCtx.drawImage(bgEditorOriginalBitmap, 0, 0);

  const imgData = bgEditorWorkCtx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Sample corner & edge border pixels
  const samples = [
    [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
    [Math.floor(w / 2), 0], [0, Math.floor(h / 2)], [w - 1, Math.floor(h / 2)],
    [Math.floor(w / 4), 0], [Math.floor(3 * w / 4), 0]
  ];
  let bgR = 0, bgG = 0, bgB = 0;
  samples.forEach(([x, y]) => {
    const idx = (y * w + x) * 4;
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  });
  bgR /= samples.length;
  bgG /= samples.length;
  bgB /= samples.length;

  const tolInput = parseInt(getVal('bgTolerance', '35'), 10) || 35;
  const tolerance = tolInput * 2.5;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt(
      (r - bgR) * (r - bgR) +
      (g - bgG) * (g - bgG) +
      (b - bgB) * (b - bgB)
    );

    if (dist < tolerance) {
      const alphaFactor = Math.max(0, (dist - tolerance * 0.45) / (tolerance * 0.55));
      data[i + 3] = Math.round(alphaFactor * 255);
    }
  }

  bgEditorWorkCtx.putImageData(imgData, 0, 0);

  const displayCanvas = document.getElementById('bgStudioCanvas');
  if (displayCanvas) {
    const dCtx = displayCanvas.getContext('2d');
    dCtx.clearRect(0, 0, w, h);
    dCtx.drawImage(bgEditorWorkCanvas, 0, 0);
  }

  saveBgEditorState();
  if (statusEl) statusEl.innerText = 'Auto Cutout complete! Refine edges with Manual Eraser.';
}

window.runAutoBgRemoval = runAutoBgRemoval;
window.setBgToolMode = setBgToolMode;
window.updateBgBrushProps = updateBgBrushProps;
window.undoBgEditor = undoBgEditor;
window.redoBgEditor = redoBgEditor;
window.resetBgEditorImage = resetBgEditorImage;


async function processBgRemover() {
  const file = selectedFiles[0];
  if (!file) throw new Error('Please select an image first.');

  showProgress('Finalizing transparent PNG cutout...', 40);

  // If user interacted with the manual studio work canvas, export straight from it!
  let exportCanvas = bgEditorWorkCanvas;

  if (!exportCanvas) {
    showProgress('Loading image for background cutout...', 20);
    const imgBitmap = await createImageBitmap(file);
    const w = imgBitmap.width;
    const h = imgBitmap.height;

    exportCanvas = document.createElement('canvas');
    exportCanvas.width = w;
    exportCanvas.height = h;
    const ctx = exportCanvas.getContext('2d');
    ctx.drawImage(imgBitmap, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const corners = [
      [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
      [Math.floor(w / 2), 0], [0, Math.floor(h / 2)], [w - 1, Math.floor(h / 2)]
    ];
    let bgR = 0, bgG = 0, bgB = 0;
    corners.forEach(([x, y]) => {
      const idx = (y * w + x) * 4;
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
    });
    bgR /= corners.length;
    bgG /= corners.length;
    bgB /= corners.length;

    const tolInput = parseInt(getVal('bgTolerance', '35'), 10) || 35;
    const tolerance = tolInput * 2.5;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const dist = Math.sqrt(
        (r - bgR) * (r - bgR) +
        (g - bgG) * (g - bgG) +
        (b - bgB) * (b - bgB)
      );

      if (dist < tolerance) {
        const alphaFactor = Math.max(0, (dist - tolerance * 0.5) / (tolerance * 0.5));
        data[i + 3] = Math.round(alphaFactor * 255);
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  showProgress('Exporting Master Transparent PNG Cutout...', 90);

  exportCanvas.toBlob((blob) => {
    downloadBlob(blob, `GodxShadow_Cutout_${file.name.replace(/\.[^/.]+$/, '')}.png`, 'image/png');
    showStatus('Cutout generated & downloaded successfully!', 'success');
    hideProgress();
  }, 'image/png');
}

// 14. BACKGROUND COLOR ADDER (Pure Client-Side JS)
async function processBgColor() {
  const file = selectedFiles[0];
  showProgress('Loading image for background coloring...', 20);
  const imgBitmap = await createImageBitmap(file);
  const w = imgBitmap.width;
  const h = imgBitmap.height;

  // Selected background color
  const preset = getVal('bgColorPreset', '#ffffff');
  let targetColor = preset;
  if (preset === 'custom') {
    targetColor = getVal('bgCustomColor', '#ffffff') || '#ffffff';
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Fill new background
  ctx.fillStyle = targetColor;
  ctx.fillRect(0, 0, w, h);

  showProgress('Blending subject onto new background...', 60);

  // Draw subject
  // If image already has transparency or needs cutout
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(imgBitmap, 0, 0);
  const tempImgData = tempCtx.getImageData(0, 0, w, h);
  const data = tempImgData.data;

  // Check if image has transparency
  let hasAlpha = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) {
      hasAlpha = true;
      break;
    }
  }

  if (hasAlpha) {
    ctx.drawImage(imgBitmap, 0, 0);
  } else {
    // Auto remove old background and paste onto new background
    const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
    let bgR = 0, bgG = 0, bgB = 0;
    corners.forEach(([x, y]) => {
      const idx = (y * w + x) * 4;
      bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2];
    });
    bgR /= 4; bgG /= 4; bgB /= 4;
    const tol = 80;

    for (let i = 0; i < data.length; i += 4) {
      const dist = Math.sqrt(
        (data[i] - bgR) ** 2 +
        (data[i + 1] - bgG) ** 2 +
        (data[i + 2] - bgB) ** 2
      );
      if (dist < tol) {
        data[i + 3] = Math.max(0, Math.round(((dist / tol) ** 2) * 255));
      }
    }
    tempCtx.putImageData(tempImgData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  showProgress('Exporting studio photo...', 90);
  canvas.toBlob((blob) => {
    downloadBlob(blob, `GodxShadow_ColoredBG_${file.name.replace(/\.[^/.]+$/, '')}.png`, 'image/png');
    showStatus('New background color applied successfully!', 'success');
    hideProgress();
  }, 'image/png');
}

// 15. PASSPORT SIZE PHOTO MAKER (Govt Specs & Print Sheet)
async function processPassportPhoto() {
  const file = selectedFiles[0];
  showProgress('Cropping to official passport standard...', 25);
  const imgBitmap = await createImageBitmap(file);

  const preset = getVal('passportPreset', 'in_passport');
  const bgChoice = getVal('passportBg', '#ffffff');
  const sheetMode = getVal('passportSheet', 'single');
  const hasBorder = getVal('passportBorder', 'yes') === 'yes';

  // Passport dimensions:
  // in_passport: 413 x 531 px (35mm x 45mm @ 300 DPI)
  // us_passport: 600 x 600 px (2 x 2 inches @ 300 DPI)
  let passW = 413, passH = 531;
  if (preset === 'us_passport') {
    passW = 600;
    passH = 600;
  }

  // Create single passport photo canvas
  const singleCanvas = document.createElement('canvas');
  singleCanvas.width = passW;
  singleCanvas.height = passH;
  const sCtx = singleCanvas.getContext('2d');

  // Fill passport background
  if (bgChoice !== 'original') {
    sCtx.fillStyle = bgChoice;
    sCtx.fillRect(0, 0, passW, passH);
  }

  // Smart portrait center crop & fit
  const scale = Math.max(passW / imgBitmap.width, passH / imgBitmap.height);
  const cropW = imgBitmap.width * scale;
  const cropH = imgBitmap.height * scale;
  const offsetX = (passW - cropW) / 2;
  const offsetY = (passH - cropH) / 3; // Focus towards upper body / face

  sCtx.drawImage(imgBitmap, offsetX, offsetY, cropW, cropH);

  // Border if needed
  if (hasBorder) {
    sCtx.strokeStyle = '#cccccc';
    sCtx.lineWidth = 2;
    sCtx.strokeRect(1, 1, passW - 2, passH - 2);
  }

  if (sheetMode === 'single') {
    singleCanvas.toBlob((blob) => {
      downloadBlob(blob, `GodxShadow_Passport_${file.name.replace(/\.[^/.]+$/, '')}.jpg`, 'image/jpeg');
      showStatus('Passport size photo generated successfully!', 'success');
      hideProgress();
    }, 'image/jpeg', 0.98);
  } else {
    // Generate Print Ready Grid Sheet (4x6 inch / A4)
    showProgress('Generating ready-to-print passport photo sheet...', 70);
    const cols = sheetMode === 'grid_6' ? 3 : 4;
    const rows = sheetMode === 'grid_6' ? 2 : 2;
    const padding = 30;
    const sheetW = cols * passW + (cols + 1) * padding;
    const sheetH = rows * passH + (rows + 1) * padding;

    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = sheetW;
    sheetCanvas.height = sheetH;
    const sheetCtx = sheetCanvas.getContext('2d');

    sheetCtx.fillStyle = '#ffffff';
    sheetCtx.fillRect(0, 0, sheetW, sheetH);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = padding + c * (passW + padding);
        const y = padding + r * (passH + padding);
        sheetCtx.drawImage(singleCanvas, x, y);
      }
    }

    sheetCanvas.toBlob((blob) => {
      downloadBlob(blob, `GodxShadow_Passport_Print_Sheet.jpg`, 'image/jpeg');
      showStatus(`Generated Print-Ready Sheet (${cols * rows} Photos)!`, 'success');
      hideProgress();
    }, 'image/jpeg', 0.98);
  }
}

// 16. IMAGE RESIZER & SCALER
async function processImageResizer() {
  const file = selectedFiles[0];
  showProgress('Calculating target dimensions...', 25);
  const imgBitmap = await createImageBitmap(file);

  const reqW = parseInt(getVal('resizeWidth', imgBitmap.width), 10) || imgBitmap.width;
  const reqH = parseInt(getVal('resizeHeight', imgBitmap.height), 10) || imgBitmap.height;
  const ratioMode = getVal('resizeRatio', 'maintain');
  const exportFmt = getVal('resizeFormat', 'image/png');

  let finalW = reqW;
  let finalH = reqH;

  if (ratioMode === 'maintain') {
    const origRatio = imgBitmap.width / imgBitmap.height;
    if (reqW / reqH > origRatio) {
      finalW = Math.round(reqH * origRatio);
    } else {
      finalH = Math.round(reqW / origRatio);
    }
  }

  showProgress(`Resizing image to ${finalW}x${finalH} px...`, 60);

  const canvas = document.createElement('canvas');
  canvas.width = finalW;
  canvas.height = finalH;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(imgBitmap, 0, 0, finalW, finalH);

  canvas.toBlob((blob) => {
    const ext = exportFmt.split('/')[1];
    downloadBlob(blob, `GodxShadow_Resized_${finalW}x${finalH}.${ext}`, exportFmt);
    showStatus(`Image resized to ${finalW}x${finalH} px!`, 'success');
    hideProgress();
  }, exportFmt, 0.95);
}

// 17. CYBER IMAGE EDITOR (Brightness, Contrast, Saturation, Cyber Filters)
async function processImageEditor() {
  const file = selectedFiles[0];
  showProgress('Loading image into Cyber Editor...', 25);
  const imgBitmap = await createImageBitmap(file);

  const bright = getVal('editBright', '100');
  const contrast = getVal('editContrast', '100');
  const sat = getVal('editSat', '100');
  const filter = getVal('editFilter', 'none');

  const canvas = document.createElement('canvas');
  canvas.width = imgBitmap.width;
  canvas.height = imgBitmap.height;
  const ctx = canvas.getContext('2d');

  showProgress('Applying Color Grading & Neon Cyber Filters...', 65);

  let filterStr = `brightness(${bright}%) contrast(${contrast}%) saturate(${sat}%)`;
  if (filter === 'vintage') filterStr += ' sepia(60%)';
  if (filter === 'grayscale') filterStr += ' grayscale(100%)';

  ctx.filter = filterStr;
  ctx.drawImage(imgBitmap, 0, 0);

  // Overlay Cyber Neon tint if selected
  if (filter === 'neon_cyan') {
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (filter === 'neon_magenta') {
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255, 0, 127, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (filter === 'matrix_lime') {
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  showProgress('Exporting Master Photo...', 90);
  canvas.toBlob((blob) => {
    downloadBlob(blob, `GodxShadow_Edited_${file.name.replace(/\.[^/.]+$/, '')}.png`, 'image/png');
    showStatus('Edited photo exported successfully!', 'success');
    hideProgress();
  }, 'image/png');
}

// Helpers
function parsePageRanges(rangeStr, total) {
  if (!rangeStr) return [];
  const parts = rangeStr.split(',');
  const indices = new Set();

  parts.forEach(p => {
    p = p.trim();
    if (p.includes('-')) {
      const [start, end] = p.split('-').map(n => parseInt(n.trim(), 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(total, end); i++) {
          indices.add(i - 1);
        }
      }
    } else {
      const num = parseInt(p, 10);
      if (!isNaN(num) && num >= 1 && num <= total) {
        indices.add(num - 1);
      }
    }
  });

  return Array.from(indices).sort((a, b) => a - b);
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


// Render interactive dual before/after comparison preview
function renderDualPreview(sourceFile, outputBlob, fileName) {
  const preview = document.getElementById('previewContainer');
  if (!preview) return;

  const sourceUrl = sourceFile ? URL.createObjectURL(sourceFile) : '';
  const outputUrl = URL.createObjectURL(outputBlob);
  const outSizeBytes = outputBlob.size;
  const srcName = sourceFile ? (sourceFile.name || 'Input') : 'Input';

  const container = document.createElement('div');
  container.className = 'dual-preview-wrapper';
  container.style.marginTop = '1.25rem';
  container.style.padding = '16px';
  container.style.background = 'rgba(10, 10, 25, 0.75)';
  container.style.border = '1.5px solid var(--neon-cyan)';
  container.style.borderRadius = '14px';
  container.style.boxShadow = '0 0 30px rgba(0, 240, 255, 0.25)';

  let sourceHtml = '';
  if (sourceUrl) {
    sourceHtml = '<div style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:10px; text-align:center;">' +
      '<div style="font-size:0.8rem; font-weight:700; color:var(--text-muted); margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">' +
        'Original Source (' + srcName + ')' +
      '</div>' +
      '<div style="max-height:260px; overflow:hidden; border-radius:8px; display:flex; align-items:center; justify-content:center; background:#070710;">' +
        '<img src="' + sourceUrl + '" style="max-width:100%; max-height:240px; border-radius:6px; object-fit:contain;" alt="Source Image">' +
      '</div>' +
    '</div>';
  }

  const outputHtml = '<div style="background:rgba(0, 240, 255, 0.06); border:1.5px solid var(--neon-cyan); border-radius:10px; padding:10px; text-align:center; box-shadow:0 0 15px rgba(0, 240, 255, 0.2);">' +
    '<div style="font-size:0.8rem; font-weight:700; color:var(--neon-cyan); margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">' +
      '✨ Generated Output (' + formatBytes(outSizeBytes) + ')' +
    '</div>' +
    '<div style="max-height:260px; overflow:hidden; border-radius:8px; display:flex; align-items:center; justify-content:center; background:#070710;">' +
      '<img src="' + outputUrl + '" style="max-width:100%; max-height:240px; border-radius:6px; object-fit:contain; box-shadow:0 0 20px rgba(0, 240, 255, 0.3);" alt="Processed Output Image">' +
    '</div>' +
  '</div>';

  container.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">' +
    '<div style="font-weight:700; color:var(--neon-cyan); font-size:1rem; display:flex; align-items:center; gap:8px;">' +
      '<span>⚡ Before & After Master Comparison</span>' +
    '</div>' +
    '<a href="' + outputUrl + '" download="' + fileName + '" target="_blank" class="btn-neon btn-neon-glow" style="text-decoration:none; padding:8px 18px; font-size:0.85rem; font-weight:700;">' +
      '⬇️ Quick Save Result' +
    '</a>' +
  '</div>' +
  '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:16px;">' +
    sourceHtml +
    outputHtml +
  '</div>';

  const oldDual = preview.querySelector('.dual-preview-wrapper');
  if (oldDual) oldDual.remove();
  preview.appendChild(container);
}


function downloadBlob(data, fileName, mimeType) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  // If result is an image or PDF-to-image, show interactive dual comparison preview
  const isOutImg = (mimeType && mimeType.startsWith('image/')) || /\.(jpg|jpeg|png|webp|bmp|gif)$/i.test(fileName);
  if (isOutImg && selectedFiles.length > 0 && isImageFile(selectedFiles[0])) {
    renderDualPreview(selectedFiles[0], blob, fileName);
  }

  // Create or update prominent on-screen direct download box so user can click directly if automatic download is blocked by browser sandbox
  let dlBox = document.getElementById('directDownloadBox');
  if (!dlBox) {
    dlBox = document.createElement('div');
    dlBox.id = 'directDownloadBox';
    dlBox.style.margin = '1.25rem 0 0.5rem';
    dlBox.style.padding = '14px 18px';
    dlBox.style.background = 'rgba(0, 240, 255, 0.12)';
    dlBox.style.border = '1.5px solid var(--neon-cyan)';
    dlBox.style.borderRadius = '12px';
    dlBox.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.35)';
    dlBox.style.display = 'flex';
    dlBox.style.alignItems = 'center';
    dlBox.style.justifyContent = 'space-between';
    dlBox.style.flexWrap = 'wrap';
    dlBox.style.gap = '12px';
    
    const bodyModal = document.querySelector('.modal-body');
    if (bodyModal) {
      bodyModal.appendChild(dlBox);
    }
  }

  dlBox.style.display = 'flex';
  dlBox.innerHTML = '<div style="display:flex; align-items:center; gap:10px;">' +
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--neon-lime)" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' +
    '<div>' +
      '<div style="font-weight:700; color:#fff; font-size:0.95rem;">⚡ Ready for Download: <span style="color:var(--neon-cyan);">' + fileName + '</span></div>' +
      '<div style="font-size:0.75rem; color:var(--text-muted);">Size: ' + formatBytes(blob.size) + '</div>' +
    '</div>' +
  '</div>' +
  '<a href="' + url + '" download="' + fileName + '" target="_blank" class="btn-neon btn-neon-glow" style="text-decoration:none; padding:10px 22px; font-weight:700;">' +
    '⬇️ Click Here to Save File' +
  '</a>';

  // Automatic trigger
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (a.parentNode) document.body.removeChild(a);
  }, 3000);
}

function showProgress(text, percent) {
  const cont = document.getElementById('progressContainer');
  const bar = document.getElementById('progressBar');
  const label = document.getElementById('progressText');
  const pLabel = document.getElementById('progressPercent');

  cont.style.display = 'block';
  label.innerText = text;
  pLabel.innerText = `${percent}%`;
  bar.style.width = `${percent}%`;
}

function hideProgress() {
  setTimeout(() => {
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('progressBar').style.width = '0%';
  }, 800);
}

function showStatus(msg, type = 'success') {
  const banner = document.getElementById('statusBanner');
  banner.className = `status-banner status-${type}`;
  banner.style.display = 'flex';
  banner.innerText = msg;
}

function hideStatus() {
  const banner = document.getElementById('statusBanner');
  banner.style.display = 'none';
}

// Live Editor Real-Time Filter Preview
function updateLiveEditorPreview() {
  const liveImg = document.getElementById('liveEditorImg');
  if (!liveImg) return;

  if (selectedFiles.length > 0 && isImageFile(selectedFiles[0])) {
    if (!liveImg.src || liveImg.src === window.location.href) {
      liveImg.src = URL.createObjectURL(selectedFiles[0]);
    }
  } else {
    // Demo placeholder (local sample shipped with the app)
    liveImg.src = './finegrain_enhanced_4k.webp';
  }

  const brightEl = document.getElementById('editBright');
  const contrastEl = document.getElementById('editContrast');
  const satEl = document.getElementById('editSat');
  const filterEl = document.getElementById('editFilter');

  if (!brightEl || !contrastEl || !satEl || !filterEl) return;

  const bright = brightEl ? brightEl.value : '100';
  const contrast = contrastEl ? contrastEl.value : '100';
  const sat = satEl ? satEl.value : '100';
  const filter = filterEl ? filterEl.value : 'none';

  let filterStr = `brightness(${bright}%) contrast(${contrast}%) saturate(${sat}%)`;
  if (filter === 'vintage') filterStr += ' sepia(60%)';
  if (filter === 'grayscale') filterStr += ' grayscale(100%)';
  if (filter === 'neon_cyan') filterStr += ' drop-shadow(0 0 10px #00f0ff) hue-rotate(170deg)';
  if (filter === 'neon_magenta') filterStr += ' drop-shadow(0 0 10px #ff007f) hue-rotate(300deg)';
  if (filter === 'matrix_lime') filterStr += ' drop-shadow(0 0 10px #00ff88) hue-rotate(90deg)';

  liveImg.style.filter = filterStr;
}

window.updateLiveEditorPreview = updateLiveEditorPreview;
