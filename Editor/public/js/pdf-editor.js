/*
 * GodxShadow live PDF editor
 * Client-side editor for text/image overlays and visual content covering.
 * Existing PDF operators are preserved; see the in-app visual-redaction notice.
 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const state = {
    file: null,
    pdfBytes: null,
    pdf: null,
    pageIndex: 0,
    pageCount: 0,
    pageScale: 1,
    zoom: 1,
    pageWidth: 0,
    pageHeight: 0,
    viewX: 0,
    viewY: 0,
    objects: [],
    selectedId: null,
    mode: 'select',
    textBlocks: [],
    pageAnnotations: [],
    formValues: {},
    pendingImage: null,
    signatureHasInk: false,
    history: [],
    historyIndex: -1,
    historyTimer: null,
    renderToken: 0,
    pointer: null,
    toolbarBound: false
  };

  const standardFonts = {
    Helvetica: {
      regular: 'Helvetica', bold: 'HelveticaBold', italic: 'HelveticaOblique', boldItalic: 'HelveticaBoldOblique'
    },
    TimesRoman: {
      regular: 'TimesRoman', bold: 'TimesRomanBold', italic: 'TimesRomanItalic', boldItalic: 'TimesRomanBoldItalic'
    },
    Courier: {
      regular: 'Courier', bold: 'CourierBold', italic: 'CourierOblique', boldItalic: 'CourierBoldOblique'
    }
  };

  function mountToolbar(container) {
    if (!container) return;
    container.innerHTML = `
      <section class="pdf-editor-toolbar" id="pdfEditorToolbar" aria-label="PDF editing tools">
        <div class="pdf-editor-toolbar-top">
          <div class="pdf-editor-file-meta">
            <span class="pdf-editor-live-dot"></span>
            <div>
              <div class="pdf-editor-overline">LIVE PDF WORKSPACE · LOCAL ONLY</div>
              <div class="pdf-editor-file-name" id="pdfEditorFileName">Choose a PDF to start editing</div>
            </div>
          </div>
          <div class="pdf-editor-actions">
            <button type="button" class="pdf-editor-btn" data-pdf-action="open"><span class="pdf-css-icon pdf-icon-file" aria-hidden="true"></span>Open PDF</button>
            <button type="button" class="pdf-editor-btn" data-pdf-action="find-replace"><span class="pdf-css-icon pdf-icon-search" aria-hidden="true"></span>Find &amp; Replace</button>
            <button type="button" class="pdf-editor-btn" data-pdf-action="rotate-page"><span class="pdf-css-icon pdf-icon-rotate" aria-hidden="true"></span>Rotate page</button>
            <button type="button" class="pdf-editor-btn" data-pdf-action="delete-page"><span class="pdf-css-icon pdf-icon-trash" aria-hidden="true"></span>Delete page</button>
            <button type="button" class="pdf-editor-btn" data-pdf-action="rotate-object"><span class="pdf-css-icon pdf-icon-rotate" aria-hidden="true"></span>Rotate item</button>
            <button type="button" class="pdf-editor-btn" data-pdf-action="undo" title="Undo (Ctrl+Z)"><span class="pdf-css-icon pdf-icon-undo" aria-hidden="true"></span>Undo</button>
            <button type="button" class="pdf-editor-btn" data-pdf-action="redo" title="Redo (Ctrl+Y)"><span class="pdf-css-icon pdf-icon-redo" aria-hidden="true"></span>Redo</button>
          </div>
        </div>

        <div class="pdf-editor-modebar" role="toolbar" aria-label="Editing modes">
          <button type="button" class="pdf-editor-mode active" data-pdf-mode="select"><span class="pdf-css-icon pdf-icon-select" aria-hidden="true"></span>Select / move</button>
          <button type="button" class="pdf-editor-mode" data-pdf-mode="editText"><span class="pdf-css-icon pdf-icon-text" aria-hidden="true"></span>Text / replace</button>
          <button type="button" class="pdf-editor-mode" data-pdf-mode="addText"><span class="pdf-css-icon pdf-icon-text" aria-hidden="true"></span>Add text</button>
          <button type="button" class="pdf-editor-mode" data-pdf-mode="addImage"><span class="pdf-css-icon pdf-icon-image" aria-hidden="true"></span>Image</button>
          <button type="button" class="pdf-editor-mode" data-pdf-mode="addSignature"><span class="pdf-css-icon pdf-icon-signature" aria-hidden="true"></span>Sign</button>
          <button type="button" class="pdf-editor-mode" data-pdf-mode="stamp"><span class="pdf-css-icon pdf-icon-stamp" aria-hidden="true"></span>Stamp</button>
          <button type="button" class="pdf-editor-mode" data-pdf-mode="cover"><span class="pdf-css-icon pdf-icon-whiteout" aria-hidden="true"></span>Whiteout</button>
          <button type="button" class="pdf-editor-mode" data-pdf-mode="annotate"><span class="pdf-css-icon pdf-icon-highlight" aria-hidden="true"></span>Annotate</button>
          <button type="button" class="pdf-editor-mode" data-pdf-mode="freehand"><span class="pdf-css-icon pdf-icon-freehand" aria-hidden="true"></span>Freehand</button>
          <button type="button" class="pdf-editor-mode" data-pdf-mode="shape"><span class="pdf-css-icon pdf-icon-shapes" aria-hidden="true"></span>Shapes</button>
          <button type="button" class="pdf-editor-mode" data-pdf-mode="link"><span class="pdf-css-icon pdf-icon-link" aria-hidden="true"></span>Link</button>
          <button type="button" class="pdf-editor-mode" data-pdf-mode="formField"><span class="pdf-css-icon pdf-icon-form" aria-hidden="true"></span>Forms</button>
          <button type="button" class="pdf-editor-mode pdf-editor-delete" data-pdf-action="delete"><span class="pdf-css-icon pdf-icon-trash" aria-hidden="true"></span>Delete selected</button>
        </div>

        <div class="pdf-editor-options">
          <div class="pdf-editor-option-group" id="pdfEditorTextOptions">
            <label class="pdf-editor-field pdf-editor-text-field">
              <span>Text</span>
              <textarea id="pdfEditorText" rows="2" placeholder="Type new text, or click existing text in Replace mode"></textarea>
            </label>
            <label class="pdf-editor-field">
              <span>Font</span>
              <select id="pdfEditorFont">
                <option value="Helvetica">Helvetica / Arial</option>
                <option value="TimesRoman">Times New Roman</option>
                <option value="Courier">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Poppins">Poppins</option>
                <option value="Noto Sans">Noto Sans</option>
              </select>
            </label>
            <label class="pdf-editor-field">
              <span>Style</span>
              <select id="pdfEditorStyle">
                <option value="regular">Regular</option>
                <option value="bold">Bold</option>
                <option value="italic">Italic</option>
                <option value="boldItalic">Bold italic</option>
              </select>
            </label>
            <label class="pdf-editor-field pdf-editor-size-field">
              <span>Size</span>
              <input id="pdfEditorFontSize" type="number" min="4" max="144" step="1" value="18">
            </label>
            <label class="pdf-editor-field pdf-editor-color-field">
              <span>Text colour</span>
              <input id="pdfEditorTextColor" type="color" value="#111111">
            </label>
            <label class="pdf-editor-field pdf-editor-color-field">
              <span>Replacement background</span>
              <input id="pdfEditorTextCoverColor" type="color" value="#ffffff">
            </label>
            <button type="button" class="pdf-editor-btn pdf-editor-btn-primary" data-pdf-action="apply-text">Apply text</button>
            <span class="pdf-editor-disclosure">Standard fonts stay selectable; extra fonts and unsupported scripts may be rasterized to preserve appearance.</span>
          </div>

          <div class="pdf-editor-option-group" id="pdfEditorCoverOptions" hidden>
            <label class="pdf-editor-field pdf-editor-color-field">
              <span>Cover colour</span>
              <input id="pdfEditorCoverColor" type="color" value="#ffffff">
            </label>
            <p class="pdf-editor-disclosure">Covering hides content visually; it does not securely remove the original PDF data.</p>
          </div>

          <div class="pdf-editor-option-group" id="pdfEditorImageOptions" hidden>
            <button type="button" class="pdf-editor-btn" data-pdf-action="choose-image">Choose image…</button>
            <span id="pdfEditorImageName" class="pdf-editor-image-name">Choose JPG, PNG, or WebP, then click the page to place it.</span>
            <button type="button" class="pdf-editor-btn" data-pdf-action="delete-image-area">Delete image area</button>
            <input id="pdfEditorImageInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden>
          </div>

          <div class="pdf-editor-option-group" id="pdfEditorShapeOptions" hidden>
            <label class="pdf-editor-field"><span>Shape</span><select id="pdfEditorShapeType"><option value="rectangle">Rectangle</option><option value="ellipse">Ellipse</option><option value="line">Line</option><option value="arrow">Arrow</option></select></label>
            <label class="pdf-editor-field pdf-editor-color-field"><span>Border</span><input id="pdfEditorShapeBorder" type="color" value="#00a8ff"></label>
            <label class="pdf-editor-field pdf-editor-color-field"><span>Fill</span><input id="pdfEditorShapeFill" type="color" value="#fff0a8"></label>
            <label class="pdf-editor-field"><span>Line width</span><input id="pdfEditorShapeWidth" type="number" min="1" max="16" value="2"></label>
            <label class="pdf-editor-check"><input id="pdfEditorShapeFillEnabled" type="checkbox"><span>Fill shape</span></label>
          </div>

          <div class="pdf-editor-option-group" id="pdfEditorAnnotateOptions" hidden>
            <label class="pdf-editor-field"><span>Markup</span><select id="pdfEditorAnnotateStyle"><option value="highlight">Highlight</option><option value="underline">Underline</option><option value="strike">Strike out</option></select></label>
            <label class="pdf-editor-field pdf-editor-color-field"><span>Markup colour</span><input id="pdfEditorAnnotateColor" type="color" value="#ffe45c"></label>
            <label class="pdf-editor-field"><span>Pen width</span><input id="pdfEditorPenWidth" type="number" min="1" max="16" value="3"></label>
            <span class="pdf-editor-disclosure">Click detected text for highlight, underline or strike; use Freehand to draw a mark.</span>
          </div>

          <div class="pdf-editor-option-group" id="pdfEditorLinkOptions" hidden>
            <label class="pdf-editor-field"><span>Link type</span><select id="pdfEditorLinkType"><option value="url">Website URL</option><option value="email">Email address</option><option value="phone">Phone number</option><option value="page">Page in this PDF</option></select></label>
            <label class="pdf-editor-field pdf-editor-link-value"><span>URL / address</span><input id="pdfEditorLinkValue" type="text" placeholder="https://example.com"></label>
            <label class="pdf-editor-field"><span>Target page</span><input id="pdfEditorLinkPage" type="number" min="1" value="1"></label>
            <span class="pdf-editor-disclosure">Drag on the page to add a link area. Existing link areas can be covered and relinked.</span>
          </div>

          <div class="pdf-editor-option-group" id="pdfEditorFormOptions" hidden>
            <label class="pdf-editor-field"><span>Field type</span><select id="pdfEditorFieldType"><option value="text">Text</option><option value="multiline">Text multiline</option><option value="dropdown">Drop-down list</option><option value="checkbox">Checkbox</option><option value="radio">Radio option</option></select></label>
            <label class="pdf-editor-field"><span>Field name</span><input id="pdfEditorFieldName" type="text" value="new_field"></label>
            <label class="pdf-editor-field pdf-editor-link-value"><span>Default value / radio option</span><input id="pdfEditorFieldValue" type="text" placeholder="Optional"></label>
            <label class="pdf-editor-field"><span>Dropdown / radio options</span><textarea id="pdfEditorFieldOptions" rows="2" placeholder="One option per line"></textarea></label>
            <label class="pdf-editor-field"><span>Max characters</span><input id="pdfEditorFieldMaxLength" type="number" min="0" max="10000" value="0"></label>
            <label class="pdf-editor-check"><input id="pdfEditorRequired" type="checkbox"><span>Required</span></label>
            <label class="pdf-editor-check"><input id="pdfEditorRepeatField" type="checkbox"><span>Repeat on all pages</span></label>
            <button type="button" class="pdf-editor-btn" data-pdf-action="detect-fields">Detect existing fields</button>
          </div>

          <div class="pdf-editor-option-group" id="pdfEditorSignatureOptions" hidden>
            <label class="pdf-editor-field pdf-editor-link-value"><span>Type signature</span><input id="pdfEditorSignatureText" type="text" placeholder="Your name"></label>
            <label class="pdf-editor-field"><span>Handwriting style</span><select id="pdfEditorSignatureStyle"><option value="cursive">Cursive</option><option value="serif">Elegant serif</option><option value="sans">Simple italic</option></select></label>
            <button type="button" class="pdf-editor-btn pdf-editor-btn-primary" data-pdf-action="use-typed-signature">Use typed</button>
            <div class="pdf-editor-signature-draw-wrap"><span>Draw signature</span><canvas id="pdfEditorSignaturePad" width="420" height="100"></canvas><div><button type="button" class="pdf-editor-btn" data-pdf-action="clear-signature">Clear</button><button type="button" class="pdf-editor-btn" data-pdf-action="use-drawn-signature">Use drawing</button></div></div>
            <button type="button" class="pdf-editor-btn" data-pdf-action="upload-signature">Upload signature</button>
            <input id="pdfEditorSignatureInput" type="file" accept="image/png,image/jpeg,image/webp" hidden>
            <span id="pdfEditorSignatureStatus" class="pdf-editor-image-name">Create or upload a signature, then click the page to place it.</span>
          </div>

          <div class="pdf-editor-option-group" id="pdfEditorStampOptions" hidden>
            <label class="pdf-editor-field"><span>Stamp text</span><select id="pdfEditorStampText"><option>APPROVED</option><option>CONFIDENTIAL</option><option>DRAFT</option><option>PAID</option><option>COPY</option><option>REVIEWED</option></select></label>
            <label class="pdf-editor-field pdf-editor-color-field"><span>Stamp colour</span><input id="pdfEditorStampColor" type="color" value="#e53935"></label>
            <span class="pdf-editor-disclosure">Click the page to place the selected stamp. Move or resize it like other items.</span>
          </div>
        </div>

        <div class="pdf-editor-find-panel" id="pdfEditorFindPanel" hidden>
          <label class="pdf-editor-field"><span>Find text</span><input id="pdfEditorFindText" type="text" placeholder="Word or phrase"></label>
          <label class="pdf-editor-field"><span>Replace with</span><input id="pdfEditorReplaceText" type="text" placeholder="Replacement"></label>
          <label class="pdf-editor-check"><input id="pdfEditorCaseSensitive" type="checkbox"><span>Case sensitive</span></label>
          <button type="button" class="pdf-editor-btn pdf-editor-btn-primary" data-pdf-action="replace-all">Replace all</button>
          <button type="button" class="pdf-editor-btn" data-pdf-action="close-find">Close</button>
          <span class="pdf-editor-disclosure">Find/replace matches within PDF text items; scanned text and phrases split across items may not match.</span>
        </div>

        <div class="pdf-editor-pagebar">
          <div class="pdf-editor-page-nav">
            <button type="button" class="pdf-editor-btn pdf-editor-square" data-pdf-action="previous-page" aria-label="Previous page"><span class="pdf-css-icon pdf-icon-chevron-left" aria-hidden="true"></span></button>
            <label class="pdf-editor-page-select-label" for="pdfEditorPageSelect">Page</label>
            <select id="pdfEditorPageSelect" disabled aria-label="Select PDF page"><option>—</option></select>
            <span id="pdfEditorPageCount" class="pdf-editor-page-count">/ —</span>
            <button type="button" class="pdf-editor-btn pdf-editor-square" data-pdf-action="next-page" aria-label="Next page"><span class="pdf-css-icon pdf-icon-chevron-right" aria-hidden="true"></span></button>
          </div>
          <div class="pdf-editor-zoom">
            <button type="button" class="pdf-editor-btn pdf-editor-square" data-pdf-action="zoom-out" aria-label="Zoom out"><span class="pdf-css-icon pdf-icon-minus" aria-hidden="true"></span></button>
            <span id="pdfEditorZoomLabel">Fit</span>
            <button type="button" class="pdf-editor-btn pdf-editor-square" data-pdf-action="zoom-in" aria-label="Zoom in"><span class="pdf-css-icon pdf-icon-plus" aria-hidden="true"></span></button>
            <button type="button" class="pdf-editor-btn" data-pdf-action="fit-page">Fit page</button>
          </div>
          <span id="pdfEditorSelectionLabel" class="pdf-editor-selection-label">Select a tool to begin</span>
        </div>

        <div class="pdf-editor-hint" id="pdfEditorHint">Choose a PDF above. Your file stays in this browser and is not uploaded.</div>
      </section>
    `;
    bindToolbar(container);
    setMode('select');
  }

  function bindToolbar(container) {
    if (!container) return;
    if (container.dataset.pdfEditorBound !== 'true') {
      container.dataset.pdfEditorBound = 'true';
      container.addEventListener('click', (event) => {
      const modeButton = event.target.closest('[data-pdf-mode]');
      if (modeButton) {
        setMode(modeButton.dataset.pdfMode);
        return;
      }
      const actionButton = event.target.closest('[data-pdf-action]');
      if (!actionButton) return;
      const action = actionButton.dataset.pdfAction;
      if (action === 'open') {
        const input = $('fileInput');
        if (input) { input.value = ''; input.click(); }
      } else if (action === 'undo') {
        undo();
      } else if (action === 'redo') {
        redo();
      } else if (action === 'delete') {
        deleteSelected();
      } else if (action === 'apply-text') {
        applyTextControls();
      } else if (action === 'choose-image') {
        const input = $('pdfEditorImageInput');
        if (input) { input.value = ''; input.click(); }
      } else if (action === 'previous-page') {
        setPage(state.pageIndex - 1);
      } else if (action === 'next-page') {
        setPage(state.pageIndex + 1);
      } else if (action === 'zoom-in') {
        setZoom(state.zoom * 1.15);
      } else if (action === 'zoom-out') {
        setZoom(state.zoom / 1.15);
      } else if (action === 'fit-page') {
        setZoom(1);
      } else if (action === 'find-replace') {
        const panel = $('pdfEditorFindPanel');
        if (panel) panel.hidden = !panel.hidden;
        if (panel && !panel.hidden) $('pdfEditorFindText').focus();
      } else if (action === 'close-find') {
        const panel = $('pdfEditorFindPanel');
        if (panel) panel.hidden = true;
      } else if (action === 'replace-all') {
        replaceAllText();
      } else if (action === 'rotate-page') {
        rotateCurrentPage();
      } else if (action === 'rotate-object') {
        rotateSelectedImage();
      } else if (action === 'delete-page') {
        markCurrentPageForDeletion();
      } else if (action === 'delete-image-area') {
        setMode('cover');
      } else if (action === 'detect-fields') {
        const count = state.pageAnnotations.filter((item) => item.fieldName).length;
        showMessage(`Detected ${count} existing form field widget${count === 1 ? '' : 's'} on this page. They are shown over the page for filling.`);
      } else if (action === 'use-typed-signature') {
        createTypedSignature();
      } else if (action === 'clear-signature') {
        clearSignaturePad();
      } else if (action === 'use-drawn-signature') {
        useDrawnSignature();
      } else if (action === 'upload-signature') {
        const input = $('pdfEditorSignatureInput');
        if (input) { input.value = ''; input.click(); }
      }
      });
    }

    const textInput = $('pdfEditorText');
    const fontInput = $('pdfEditorFont');
    const styleInput = $('pdfEditorStyle');
    const sizeInput = $('pdfEditorFontSize');
    const colorInput = $('pdfEditorTextColor');
    const coverInput = $('pdfEditorTextCoverColor');
    [textInput, fontInput, styleInput, sizeInput, colorInput, coverInput].forEach((input) => {
      if (!input) return;
      input.addEventListener(input === textInput ? 'input' : 'change', () => updateSelectedTextFromControls());
    });

    const pageSelect = $('pdfEditorPageSelect');
    if (pageSelect) pageSelect.addEventListener('change', () => setPage(Number(pageSelect.value) - 1));

    const linkInputs = [$('pdfEditorLinkType'), $('pdfEditorLinkValue'), $('pdfEditorLinkPage')];
    linkInputs.forEach((input) => { if (input) input.addEventListener(input.tagName === 'INPUT' ? 'input' : 'change', updateSelectedLinkFromControls); });
    const formInputs = [$('pdfEditorFieldType'), $('pdfEditorFieldName'), $('pdfEditorFieldValue'), $('pdfEditorFieldOptions'), $('pdfEditorFieldMaxLength'), $('pdfEditorRequired'), $('pdfEditorRepeatField')];
    formInputs.forEach((input) => { if (input) input.addEventListener(input.tagName === 'TEXTAREA' || input.type === 'text' ? 'input' : 'change', updateSelectedFormFieldFromControls); });

    const imageInput = $('pdfEditorImageInput');
    if (imageInput) imageInput.addEventListener('change', handleImageSelection);
    const signatureInput = $('pdfEditorSignatureInput');
    if (signatureInput) signatureInput.addEventListener('change', handleSignatureUpload);
    bindSignaturePad();

    if (!state.toolbarBound) {
      state.toolbarBound = true;
      document.addEventListener('keydown', handleKeyboardShortcuts);
    }
  }

  function handleKeyboardShortcuts(event) {
    const modal = $('toolModal');
    if (!modal || !modal.classList.contains('pdf-editor-active')) return;
    const target = event.target;
    const isTyping = target && (target.matches('input, textarea, select') || target.isContentEditable);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !isTyping) {
      event.preventDefault();
      if (event.shiftKey) redo(); else undo();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y' && !isTyping) {
      event.preventDefault();
      redo();
    } else if ((event.key === 'Delete' || event.key === 'Backspace') && !isTyping && state.selectedId) {
      event.preventDefault();
      deleteSelected();
    }
  }

  function setMode(mode) {
    state.mode = mode || 'select';
    document.querySelectorAll('[data-pdf-mode]').forEach((button) => {
      button.classList.toggle('active', button.dataset.pdfMode === state.mode);
    });
    const selected = selectedObject();
    const visible = (id, show) => { const element = $(id); if (element) element.hidden = !show; };
    visible('pdfEditorTextOptions', state.mode === 'addText' || state.mode === 'editText' || (state.mode === 'select' && selected && isTextObject(selected)));
    visible('pdfEditorCoverOptions', state.mode === 'cover');
    visible('pdfEditorImageOptions', state.mode === 'addImage');
    visible('pdfEditorShapeOptions', state.mode === 'shape');
    visible('pdfEditorAnnotateOptions', state.mode === 'annotate' || state.mode === 'freehand');
    visible('pdfEditorLinkOptions', state.mode === 'link' || (state.mode === 'select' && selected && selected.type === 'link'));
    visible('pdfEditorFormOptions', state.mode === 'formField' || (state.mode === 'select' && selected && selected.type === 'formField'));
    visible('pdfEditorSignatureOptions', state.mode === 'addSignature');
    visible('pdfEditorStampOptions', state.mode === 'stamp');
    const stage = $('pdfEditorStage');
    if (stage) stage.dataset.mode = state.mode;

    const hint = $('pdfEditorHint');
    const hints = {
      select: 'Select and move added text, images, signatures, shapes, links or form fields. Use the other tools for PDF content.',
      editText: 'Click detected PDF text to replace it. Scanned text cannot be selected; add new text or use Whiteout instead.',
      addText: 'Set text/font/size/colour, then click the page to add. Select the item to move it.',
      addImage: state.pendingImage ? 'Image ready — click the page to place it. Select an image and drag its lower-right handle to resize.' : 'Choose an image above, then click the page to place it.',
      addSignature: state.pendingImage ? 'Signature ready — click the page to place it; select it to move or resize.' : 'Type, draw, or upload a signature above, then click the page to place it.',
      stamp: 'Choose a stamp above, then click the page to place it.',
      cover: 'Drag over an unwanted image or region to cover it. This hides appearance only; it is not secure redaction.',
      annotate: 'Choose Highlight, Underline or Strike, then click detected text to mark it.',
      freehand: 'Draw directly on the page to add a freehand annotation. Press Undo to remove the last stroke.',
      shape: 'Choose a shape and colours, then drag on the page to draw it.',
      link: 'Drag over a page area to add a website, email, phone or internal-page link. Existing links can be relinked by adding a new link over the same area.',
      formField: 'Choose a field type and click the page to add an interactive field. Existing PDF form fields can be filled directly.'
    };
    if (hint) hint.textContent = hints[state.mode] || '';
    updateSelectionLabel();
    if (stage) {
      stage.querySelectorAll('.pdf-editor-text-hit').forEach((hit) => {
        hit.style.pointerEvents = state.mode === 'editText' || state.mode === 'annotate' ? 'auto' : 'none';
      });
      stage.querySelectorAll('.pdf-editor-existing-link').forEach((hit) => {
        hit.style.pointerEvents = state.mode === 'link' ? 'auto' : 'none';
      });
    }
  }

  async function loadFile(file) {
    if (!file) return;
    if (!(file.type === 'application/pdf' || /\.pdf$/i.test(file.name || ''))) {
      showError('Please choose a PDF file.');
      return;
    }
    resetDocumentState();
    state.file = file;
    state.pdfBytes = await file.arrayBuffer();
    setProgress('Opening PDF locally…', 20);

    try {
      let engine = window.pdfjsLib;
      if (!engine && window.ensurePdfEngine) engine = await window.ensurePdfEngine();
      if (!engine) throw new Error('The PDF preview engine is not available. Refresh the page and try again.');
      if (!engine.GlobalWorkerOptions.workerSrc) engine.GlobalWorkerOptions.workerSrc = './libs/pdf.worker.min.js';
      const loadingTask = engine.getDocument({ data: new Uint8Array(state.pdfBytes.slice(0)) });
      state.pdf = await loadingTask.promise;
      state.pageCount = state.pdf.numPages;
      state.pageIndex = 0;
      state.zoom = 1;
      state.objects = [];
      state.formValues = {};
      state.pageAnnotations = [];
      state.selectedId = null;
      state.history = [{ objects: [], formValues: {} }];
      state.historyIndex = 0;
      state.pendingImage = null;
      state.signatureHasInk = false;

      const modal = $('toolModal');
      if (modal) modal.classList.add('pdf-editor-ready');
      const dropzone = $('dropzone');
      if (dropzone) dropzone.style.display = 'none';
      const fileList = $('fileList');
      if (fileList) fileList.style.display = 'none';
      const fileName = $('pdfEditorFileName');
      if (fileName) fileName.textContent = `${file.name} · ${formatBytes(file.size)} · ${state.pageCount} page${state.pageCount === 1 ? '' : 's'}`;
      const pageSelect = $('pdfEditorPageSelect');
      if (pageSelect) {
        pageSelect.disabled = false;
        pageSelect.innerHTML = Array.from({ length: state.pageCount }, (_, index) => `<option value="${index + 1}">Page ${index + 1}</option>`).join('');
      }
      const pageCount = $('pdfEditorPageCount');
      if (pageCount) pageCount.textContent = `/ ${state.pageCount}`;
      const imageName = $('pdfEditorImageName');
      if (imageName) imageName.textContent = 'Choose JPG, PNG, or WebP, then click the page to place it.';
      hideStatus();
      hideProgress();
      setMode('select');
      await renderPage();
      setProgress('PDF ready to edit', 100);
      hideProgress();
    } catch (error) {
      console.error('PDF editor could not open file:', error);
      resetDocumentState();
      showError(error.message || 'Could not open this PDF. It may be password-protected or damaged.');
    }
  }

  function resetDocumentState() {
    state.renderToken += 1;
    if (state.historyTimer) clearTimeout(state.historyTimer);
    if (state.pdf && typeof state.pdf.destroy === 'function') {
      try { state.pdf.destroy().catch(() => {}); } catch (_) { /* already closed */ }
    }
    state.file = null;
    state.pdfBytes = null;
    state.pdf = null;
    state.pageIndex = 0;
    state.pageCount = 0;
    state.pageScale = 1;
    state.zoom = 1;
    state.pageWidth = 0;
    state.pageHeight = 0;
    state.viewX = 0;
    state.viewY = 0;
    state.objects = [];
    state.selectedId = null;
    state.mode = 'select';
    state.textBlocks = [];
    state.pageAnnotations = [];
    state.formValues = {};
    state.pendingImage = null;
    state.signatureHasInk = false;
    state.history = [];
    state.historyIndex = -1;
    state.pointer = null;
    const preview = $('previewContainer');
    if (preview) preview.innerHTML = '';
    const fileName = $('pdfEditorFileName');
    if (fileName) fileName.textContent = 'Choose a PDF to start editing';
    const pageSelect = $('pdfEditorPageSelect');
    if (pageSelect) {
      pageSelect.disabled = true;
      pageSelect.innerHTML = '<option>—</option>';
    }
    const pageCount = $('pdfEditorPageCount');
    if (pageCount) pageCount.textContent = '/ —';
    const zoomLabel = $('pdfEditorZoomLabel');
    if (zoomLabel) zoomLabel.textContent = 'Fit';
    const hint = $('pdfEditorHint');
    if (hint) hint.textContent = 'Choose a PDF above. Your file stays in this browser and is not uploaded.';
  }

  function reset() {
    resetDocumentState();
    const modal = $('toolModal');
    if (modal) modal.classList.remove('pdf-editor-ready');
    const dropzone = $('dropzone');
    if (dropzone) dropzone.style.display = '';
    const fileList = $('fileList');
    if (fileList) fileList.innerHTML = '';
    const controls = $('toolControls');
    if (controls) controls.innerHTML = '';
  }

  async function renderPage() {
    if (!state.pdf) return;
    const token = ++state.renderToken;
    const engine = window.pdfjsLib;
    const page = await state.pdf.getPage(state.pageIndex + 1);
    const baseViewport = page.getViewport({ scale: 1, rotation: 0 });
    const preview = $('previewContainer');
    if (!preview) return;
    const availableWidth = Math.max(320, preview.clientWidth - 34);
    const fit = Math.min(1.55, availableWidth / baseViewport.width);
    const scale = fit * state.zoom;
    const viewport = page.getViewport({ scale, rotation: 0 });
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const renderViewport = page.getViewport({ scale: scale * dpr, rotation: 0 });
    const view = page.view || [0, 0, baseViewport.width, baseViewport.height];

    state.pageScale = scale;
    state.pageWidth = view[2] - view[0];
    state.pageHeight = view[3] - view[1];
    state.viewX = view[0];
    state.viewY = view[1];
    state.textBlocks = [];

    preview.innerHTML = `
      <div class="pdf-editor-canvas-scroll">
        <div class="pdf-editor-stage" id="pdfEditorStage" data-mode="${state.mode}" style="width:${viewport.width}px;height:${viewport.height}px">
          <canvas id="pdfEditorCanvas" width="${Math.ceil(renderViewport.width)}" height="${Math.ceil(renderViewport.height)}" style="width:${viewport.width}px;height:${viewport.height}px"></canvas>
          <div class="pdf-editor-existing-link-layer" id="pdfEditorExistingLinks" aria-label="Existing PDF links"></div>
          <div class="pdf-editor-text-hit-layer" id="pdfEditorTextHits" aria-label="Existing PDF text"></div>
          <div class="pdf-editor-object-layer" id="pdfEditorObjects"></div>
          <div class="pdf-editor-form-layer" id="pdfEditorFormLayer" aria-label="Fillable PDF form fields"></div>
          <div class="pdf-editor-drawing-layer" id="pdfEditorDrawingLayer"></div>
        </div>
      </div>
      <div class="pdf-editor-canvas-caption">Page ${state.pageIndex + 1} · Click/drag according to the selected tool. Added items can be moved; images can be resized.</div>
    `;
    const stage = $('pdfEditorStage');
    const canvas = $('pdfEditorCanvas');
    const context = canvas.getContext('2d', { alpha: false });
    bindStage(stage);

    try {
      await page.render({ canvasContext: context, viewport: renderViewport, background: '#ffffff' }).promise;
      if (token !== state.renderToken) return;
      const [textContent, annotations] = await Promise.all([
        page.getTextContent(),
        page.getAnnotations({ intent: 'display' }).catch(() => [])
      ]);
      if (token !== state.renderToken) return;
      state.pageAnnotations = annotations || [];
      state.textBlocks = getTextBlocks(textContent, viewport, engine, state.pageIndex, scale, {
        viewX: state.viewX, viewY: state.viewY, pageWidth: state.pageWidth, pageHeight: state.pageHeight
      });
      renderTextHitboxes();
      renderExistingLinkHitboxes(viewport);
      renderExistingFormFields(viewport);
      renderObjects();
      const pageSelect = $('pdfEditorPageSelect');
      if (pageSelect) pageSelect.value = String(state.pageIndex + 1);
      const zoomLabel = $('pdfEditorZoomLabel');
      if (zoomLabel) zoomLabel.textContent = state.zoom === 1 ? 'Fit' : `${Math.round(state.zoom * 100)}%`;
      updateSelectionLabel();
    } catch (error) {
      if (token === state.renderToken) {
        console.error('PDF page rendering failed:', error);
        showError('This page could not be previewed. Try another PDF or a lower zoom level.');
      }
    }
  }

  function getTextBlocks(textContent, viewport, engine, pageIndex = state.pageIndex, scale = state.pageScale, geometry = null) {
    const blocks = [];
    const items = textContent && textContent.items ? textContent.items : [];
    const viewX = geometry ? geometry.viewX : state.viewX;
    const viewY = geometry ? geometry.viewY : state.viewY;
    const pageWidth = geometry ? geometry.pageWidth : state.pageWidth;
    const pageHeight = geometry ? geometry.pageHeight : state.pageHeight;
    for (const item of items) {
      if (!item.str || !item.str.trim() || !item.transform) continue;
      let transform;
      try {
        transform = engine.Util.transform(viewport.transform, item.transform);
      } catch (_) {
        continue;
      }
      const fontPx = Math.max(6, Math.hypot(transform[2], transform[3]));
      const fontPt = Math.max(4, fontPx / scale);
      const widthPx = Math.max(Math.abs((item.width || fontPt) * scale), fontPx * 0.65);
      const heightPx = Math.max(fontPx * 1.25, 9);
      const baselinePx = transform[5];
      const leftPx = transform[4];
      blocks.push({
        id: `source-${pageIndex}-${blocks.length}-${Math.round(leftPx)}-${Math.round(baselinePx)}`,
        pageIndex,
        text: item.str,
        x: viewX + leftPx / scale,
        baseline: viewY + pageHeight - baselinePx / scale,
        width: widthPx / scale,
        height: heightPx / scale,
        fontSize: fontPt,
        screen: {
          left: Math.max(0, leftPx - 2),
          top: Math.max(0, baselinePx - fontPx * 0.96),
          width: widthPx + 4,
          height: heightPx
        },
        fontName: item.fontName || ''
      });
    }
    return blocks;
  }

  function renderTextHitboxes() {
    const layer = $('pdfEditorTextHits');
    if (!layer) return;
    layer.innerHTML = '';
    state.textBlocks.forEach((block, index) => {
      const hit = document.createElement('button');
      hit.type = 'button';
      hit.className = 'pdf-editor-text-hit';
      hit.dataset.textBlock = String(index);
      hit.style.left = `${block.screen.left}px`;
      hit.style.top = `${block.screen.top}px`;
      hit.style.width = `${block.screen.width}px`;
      hit.style.height = `${block.screen.height}px`;
      hit.style.pointerEvents = state.mode === 'editText' || state.mode === 'annotate' ? 'auto' : 'none';
      hit.title = `Replace text: ${block.text.slice(0, 100)}`;
      hit.setAttribute('aria-label', `Replace existing PDF text: ${block.text.slice(0, 70)}`);
      hit.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (state.mode === 'editText') beginTextReplacement(block);
        else if (state.mode === 'annotate') annotateTextBlock(block);
      });
      layer.appendChild(hit);
    });
  }

  function viewportRect(viewport, pdfRect) {
    if (!pdfRect || pdfRect.length < 4) return null;
    const rect = viewport.convertToViewportRectangle(pdfRect);
    return {
      left: Math.min(rect[0], rect[2]),
      top: Math.min(rect[1], rect[3]),
      width: Math.abs(rect[2] - rect[0]),
      height: Math.abs(rect[3] - rect[1])
    };
  }

  function renderExistingLinkHitboxes(viewport) {
    const layer = $('pdfEditorExistingLinks');
    if (!layer) return;
    layer.innerHTML = '';
    state.pageAnnotations.filter((annotation) => (annotation.url || annotation.dest) && annotation.rect).forEach((annotation, index) => {
      const rect = viewportRect(viewport, annotation.rect);
      if (!rect || rect.width < 2 || rect.height < 2) return;
      const hit = document.createElement('button');
      hit.type = 'button';
      hit.className = 'pdf-editor-existing-link';
      hit.style.left = `${rect.left}px`;
      hit.style.top = `${rect.top}px`;
      hit.style.width = `${rect.width}px`;
      hit.style.height = `${rect.height}px`;
      hit.style.pointerEvents = state.mode === 'link' ? 'auto' : 'none';
      hit.title = `Existing link: ${annotation.url || 'internal PDF link'} — click to edit`;
      hit.setAttribute('aria-label', 'Edit existing PDF hyperlink');
      hit.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (state.mode === 'link') beginExistingLinkEdit(annotation, index);
      });
      layer.appendChild(hit);
    });
  }

  function beginExistingLinkEdit(annotation, index) {
    const id = `link-${state.pageIndex}-${index}`;
    let object = state.objects.find((item) => item.id === id);
    if (!object) {
      const rect = annotation.rect;
      object = {
        id, type: 'link', pageIndex: state.pageIndex,
        x: Math.min(rect[0], rect[2]), y: Math.min(rect[1], rect[3]),
        width: Math.abs(rect[2] - rect[0]), height: Math.abs(rect[3] - rect[1]),
        targetType: annotation.url ? 'url' : 'page',
        url: annotation.url || '', targetPage: 1,
        sourceLinkId: id
      };
      if (annotation.url) {
        try { object.url = new URL(annotation.url).href; } catch (_) { object.url = annotation.url; }
      }
      addObject(object, 'Existing link selected. Change its target above and save to overlay the new destination.');
    }
    selectObject(object.id);
    setMode('link');
  }

  function renderExistingFormFields(viewport) {
    const layer = $('pdfEditorFormLayer');
    if (!layer) return;
    layer.innerHTML = '';
    state.pageAnnotations.filter((annotation) => annotation.fieldName && annotation.rect).forEach((annotation, index) => {
      const rect = viewportRect(viewport, annotation.rect);
      if (!rect || rect.width < 4 || rect.height < 4) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'pdf-editor-existing-form-field';
      wrapper.style.left = `${rect.left}px`;
      wrapper.style.top = `${rect.top}px`;
      wrapper.style.width = `${Math.max(rect.width, 16)}px`;
      wrapper.style.height = `${Math.max(rect.height, 16)}px`;
      wrapper.title = `Form field: ${annotation.fieldName}`;
      const fieldType = annotation.fieldType || 'Tx';
      let input;
      if (fieldType === 'Btn' && annotation.radioButton) {
        input = document.createElement('input');
        input.type = 'radio';
        input.name = `existing-${annotation.fieldName}`;
        input.value = annotation.buttonValue || `option-${index + 1}`;
        input.checked = String(state.formValues[annotation.fieldName] ?? annotation.fieldValue ?? '') === input.value;
      } else if (fieldType === 'Btn') {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = state.formValues[annotation.fieldName] !== undefined
          ? Boolean(state.formValues[annotation.fieldName])
          : !['', 'Off', '0', 'false'].includes(String(annotation.fieldValue || ''));
      } else if (fieldType === 'Ch' && Array.isArray(annotation.options) && annotation.options.length) {
        input = document.createElement('select');
        annotation.options.forEach((option) => {
          const item = document.createElement('option');
          item.value = option.exportValue || option.displayValue || String(option);
          item.textContent = option.displayValue || option.exportValue || String(option);
          input.appendChild(item);
        });
        input.value = String(state.formValues[annotation.fieldName] ?? annotation.fieldValue ?? '');
      } else if (annotation.multiLine) {
        input = document.createElement('textarea');
        input.value = String(state.formValues[annotation.fieldName] ?? annotation.fieldValue ?? '');
      } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = String(state.formValues[annotation.fieldName] ?? annotation.fieldValue ?? '');
      }
      input.className = 'pdf-editor-existing-form-control';
      input.setAttribute('aria-label', annotation.fieldName);
      const update = () => {
        let value = input.type === 'checkbox' ? input.checked : input.value;
        if (input.type === 'radio' && !input.checked) return;
        state.formValues[annotation.fieldName] = value;
        scheduleHistory();
      };
      input.addEventListener('input', update);
      input.addEventListener('change', update);
      wrapper.appendChild(input);
      layer.appendChild(wrapper);
    });
  }

  function bindStage(stage) {
    if (!stage) return;
    stage.addEventListener('click', handleStageClick);
    stage.addEventListener('pointerdown', handleStagePointerDown);
    stage.addEventListener('pointermove', handleStagePointerMove);
    stage.addEventListener('pointerup', handleStagePointerUp);
    stage.addEventListener('pointercancel', handleStagePointerUp);
    const objectLayer = $('pdfEditorObjects');
    if (objectLayer) objectLayer.addEventListener('pointerdown', handleObjectPointerDown);
  }

  function handleStageClick(event) {
    if (event.target.closest('.pdf-editor-object') || event.target.closest('.pdf-editor-text-hit') || event.target.closest('.pdf-editor-existing-form-field')) return;
    if (!['addText', 'addImage', 'addSignature', 'stamp', 'formField'].includes(state.mode)) return;
    const stage = $('pdfEditorStage');
    const rect = stage.getBoundingClientRect();
    const localX = clamp(event.clientX - rect.left, 0, rect.width);
    const localY = clamp(event.clientY - rect.top, 0, rect.height);
    const x = state.viewX + localX / state.pageScale;
    const yTop = state.viewY + state.pageHeight - localY / state.pageScale;

    if (state.mode === 'addText') {
      const controls = readTextControls();
      const text = controls.text.trim() || 'Your text';
      const height = Math.max(controls.fontSize * 1.25, controls.fontSize * 1.2 * text.split('\n').length);
      const width = Math.max(measureTextWidthPt(text, controls), controls.fontSize * 1.8);
      const object = {
        id: createId(), type: 'text', pageIndex: state.pageIndex,
        x, y: yTop - height, width, height,
        text, fontFamily: controls.fontFamily, fontStyle: controls.fontStyle,
        fontSize: controls.fontSize, color: controls.color,
        baselineOffset: controls.fontSize * 0.22
      };
      addObject(object, 'Text added. Select it to move or edit its font and colour.');
      selectObject(object.id);
      setMode('select');
    } else if (state.mode === 'addImage' || state.mode === 'addSignature') {
      if (!state.pendingImage) {
        showError(state.mode === 'addSignature' ? 'Create or upload a signature first.' : 'Choose an image first, then click the PDF page to place it.');
        return;
      }
      const image = state.pendingImage;
      const width = Math.min(state.pageWidth * 0.34, state.mode === 'addSignature' ? 210 : 190, state.pageHeight * image.aspectRatio);
      const height = width / image.aspectRatio;
      const object = {
        id: createId(), type: state.mode === 'addSignature' ? 'signature' : 'image', pageIndex: state.pageIndex,
        x: clamp(x, state.viewX, state.viewX + state.pageWidth - width),
        y: clamp(yTop - height, state.viewY, state.viewY + state.pageHeight - height),
        width, height, aspectRatio: image.aspectRatio,
        dataUrl: image.dataUrl, bytes: image.bytes,
        mime: image.mime, name: image.name
      };
      addObject(object, state.mode === 'addSignature' ? 'Signature added. Select it to move or resize.' : 'Image added. Select it to move or resize.');
      selectObject(object.id);
      setMode('select');
    } else if (state.mode === 'stamp') {
      const stampText = $('pdfEditorStampText') ? $('pdfEditorStampText').value : 'APPROVED';
      const color = $('pdfEditorStampColor') ? $('pdfEditorStampColor').value : '#e53935';
      const object = {
        id: createId(), type: 'stamp', pageIndex: state.pageIndex,
        x, y: yTop - 42, width: 170, height: 42,
        text: stampText, color, fontFamily: 'Helvetica', fontStyle: 'bold', fontSize: 18, baselineOffset: 15
      };
      addObject(object, `${stampText} stamp added.`);
      selectObject(object.id);
      setMode('select');
    } else if (state.mode === 'formField') {
      const type = $('pdfEditorFieldType') ? $('pdfEditorFieldType').value : 'text';
      const width = type === 'checkbox' || type === 'radio' ? 22 : 180;
      const height = type === 'checkbox' || type === 'radio' ? 22 : type === 'multiline' ? 70 : 28;
      const nameInput = $('pdfEditorFieldName');
      const fieldName = (nameInput && nameInput.value.trim()) || `field_${state.objects.filter((item) => item.type === 'formField').length + 1}`;
      const fieldValue = $('pdfEditorFieldValue') ? $('pdfEditorFieldValue').value : '';
      const options = $('pdfEditorFieldOptions') ? $('pdfEditorFieldOptions').value.split('\n').map((item) => item.trim()).filter(Boolean) : [];
      const radioNumber = state.objects.filter((item) => item.type === 'formField' && item.fieldType === 'radio' && item.fieldName === fieldName).length + 1;
      const object = {
        id: createId(), type: 'formField', fieldType: type, fieldName, fieldValue,
        options,
        maxLength: clamp(Number($('pdfEditorFieldMaxLength')?.value || 0), 0, 10000),
        required: !!($('pdfEditorRequired') && $('pdfEditorRequired').checked),
        repeatAllPages: !!($('pdfEditorRepeatField') && $('pdfEditorRepeatField').checked),
        pageIndex: state.pageIndex, x, y: yTop - height, width, height,
        option: type === 'radio' ? (fieldValue || options[radioNumber - 1] || `Option ${radioNumber}`) : (fieldValue || options[0] || 'Option 1')
      };
      addObject(object, `${type} form field added. Name: ${fieldName}.`);
      selectObject(object.id);
      setMode('select');
    }
  }

  function handleStagePointerDown(event) {
    const mode = state.mode;
    if (!['cover', 'shape', 'link', 'freehand'].includes(mode)) return;
    if (event.target.closest('.pdf-editor-object') || event.target.closest('.pdf-editor-existing-form-field') || event.target.closest('.pdf-editor-existing-link')) return;
    const stage = $('pdfEditorStage');
    const rect = stage.getBoundingClientRect();
    const x = clamp(event.clientX - rect.left, 0, rect.width);
    const y = clamp(event.clientY - rect.top, 0, rect.height);
    state.pointer = {
      kind: mode === 'freehand' ? 'freehand' : 'draw', toolMode: mode,
      pointerId: event.pointerId, startX: x, startY: y, endX: x, endY: y,
      points: mode === 'freehand' ? [{ x, y }] : []
    };
    const drawingLayer = $('pdfEditorDrawingLayer');
    if (drawingLayer) {
      if (mode === 'freehand') drawingLayer.innerHTML = '<svg class="pdf-editor-drawing-svg"></svg>';
      else drawingLayer.innerHTML = `<div class="pdf-editor-drawing-rect ${mode === 'shape' ? 'preview-shape' : mode === 'link' ? 'preview-link' : ''}"></div>`;
      updateDrawingRect();
    }
    if (stage.setPointerCapture) {
      try { stage.setPointerCapture(event.pointerId); } catch (_) { /* optional */ }
    }
    event.preventDefault();
  }

  function handleStagePointerMove(event) {
    if (!state.pointer || state.pointer.pointerId !== event.pointerId) return;
    const stage = $('pdfEditorStage');
    if (state.pointer.kind === 'draw' || state.pointer.kind === 'freehand') {
      const rect = stage.getBoundingClientRect();
      state.pointer.endX = clamp(event.clientX - rect.left, 0, rect.width);
      state.pointer.endY = clamp(event.clientY - rect.top, 0, rect.height);
      if (state.pointer.kind === 'freehand') {
        const last = state.pointer.points[state.pointer.points.length - 1];
        if (!last || Math.hypot(state.pointer.endX - last.x, state.pointer.endY - last.y) >= 2) {
          state.pointer.points.push({ x: state.pointer.endX, y: state.pointer.endY });
        }
        updateFreehandPreview();
      } else updateDrawingRect();
    } else {
      state.pointer.endX = event.clientX;
      state.pointer.endY = event.clientY;
      updateDraggedObject();
    }
  }

  function handleStagePointerUp(event) {
    if (!state.pointer || state.pointer.pointerId !== event.pointerId) return;
    const pointer = state.pointer;
    state.pointer = null;
    if (pointer.kind === 'draw') {
      const left = Math.min(pointer.startX, pointer.endX);
      const top = Math.min(pointer.startY, pointer.endY);
      const widthPx = Math.abs(pointer.endX - pointer.startX);
      const heightPx = Math.abs(pointer.endY - pointer.startY);
      const drawingLayer = $('pdfEditorDrawingLayer');
      if (drawingLayer) drawingLayer.innerHTML = '';
      if (widthPx > 5 && (heightPx > 5 || (pointer.toolMode === 'shape' && ['line', 'arrow'].includes($('pdfEditorShapeType')?.value)))) {
        const geometry = {
          x: state.viewX + left / state.pageScale,
          y: state.viewY + state.pageHeight - (top + heightPx) / state.pageScale,
          width: Math.max(widthPx / state.pageScale, 1),
          height: Math.max(heightPx / state.pageScale, 1),
          pageIndex: state.pageIndex,
          id: createId()
        };
        if (pointer.toolMode === 'cover') {
          const color = $('pdfEditorCoverColor') ? $('pdfEditorCoverColor').value : '#ffffff';
          addObject({ ...geometry, type: 'cover', color }, 'Whiteout added. It hides content visually; it is not secure redaction.');
        } else if (pointer.toolMode === 'shape') {
          const shapeType = $('pdfEditorShapeType') ? $('pdfEditorShapeType').value : 'rectangle';
          const object = {
            ...geometry, type: 'shape', shapeType,
            borderColor: $('pdfEditorShapeBorder') ? $('pdfEditorShapeBorder').value : '#00a8ff',
            fillColor: $('pdfEditorShapeFill') ? $('pdfEditorShapeFill').value : '#fff0a8',
            fillEnabled: !!($('pdfEditorShapeFillEnabled') && $('pdfEditorShapeFillEnabled').checked),
            lineWidth: clamp(Number($('pdfEditorShapeWidth')?.value || 2), 1, 16)
          };
          addObject(object, `${shapeType} shape added.`);
        } else if (pointer.toolMode === 'link') {
          const targetType = $('pdfEditorLinkType') ? $('pdfEditorLinkType').value : 'url';
          const object = {
            ...geometry, type: 'link', targetType,
            url: $('pdfEditorLinkValue') ? $('pdfEditorLinkValue').value.trim() : '',
            targetPage: clamp(Number($('pdfEditorLinkPage')?.value || 1), 1, state.pageCount),
            pageIndex: state.pageIndex
          };
          addObject(object, 'Link area added. Add its target in the link controls, then save.');
          selectObject(object.id);
          setMode('link');
        }
      }
    } else if (pointer.kind === 'freehand') {
      const drawingLayer = $('pdfEditorDrawingLayer');
      if (drawingLayer) drawingLayer.innerHTML = '';
      if (pointer.points.length > 1) {
        const points = pointer.points.map((point) => ({
          x: state.viewX + point.x / state.pageScale,
          y: state.viewY + state.pageHeight - point.y / state.pageScale
        }));
        const minX = Math.min(...points.map((point) => point.x));
        const maxX = Math.max(...points.map((point) => point.x));
        const minY = Math.min(...points.map((point) => point.y));
        const maxY = Math.max(...points.map((point) => point.y));
        const object = {
          id: createId(), type: 'freehand', pageIndex: state.pageIndex, points,
          x: minX, y: minY, width: Math.max(maxX - minX, 1), height: Math.max(maxY - minY, 1),
          color: $('pdfEditorAnnotateColor') ? $('pdfEditorAnnotateColor').value : '#ffe45c',
          lineWidth: clamp(Number($('pdfEditorPenWidth')?.value || 3), 1, 16)
        };
        addObject(object, 'Freehand annotation added.');
      }
    } else if (pointer.kind === 'move' || pointer.kind === 'resize') {
      if (pointer.changed) pushHistory();
    }
  }

  function handleObjectPointerDown(event) {
    if (state.mode !== 'select') return;
    const handle = event.target.closest('.pdf-editor-resize-handle');
    const objectElement = event.target.closest('[data-object-id]');
    if (!objectElement) return;
    const object = state.objects.find((item) => item.id === objectElement.dataset.objectId);
    if (!object) return;
    event.preventDefault();
    event.stopPropagation();
    selectObject(object.id);
    const stage = $('pdfEditorStage');
    state.pointer = {
      kind: handle && isResizable(object) ? 'resize' : 'move',
      pointerId: event.pointerId,
      id: object.id,
      startX: event.clientX,
      startY: event.clientY,
      originalX: object.x,
      originalY: object.y,
      originalWidth: object.width,
      originalHeight: object.height,
      originalPoints: object.type === 'freehand' ? object.points.map((point) => ({ ...point })) : null,
      changed: false
    };
    if (stage && stage.setPointerCapture) {
      try { stage.setPointerCapture(event.pointerId); } catch (_) { /* optional */ }
    }
  }

  function updateDraggedObject() {
    const pointer = state.pointer;
    if (!pointer) return;
    const object = state.objects.find((item) => item.id === pointer.id);
    if (!object) return;
    const dx = (pointer.endX - pointer.startX) / state.pageScale;
    const dy = (pointer.endY - pointer.startY) / state.pageScale;
    if (pointer.kind === 'move') {
      object.x = pointer.originalX + dx;
      object.y = pointer.originalY - dy;
      if (object.type === 'freehand' && pointer.originalPoints) {
        object.points = pointer.originalPoints.map((point) => ({ x: point.x + dx, y: point.y - dy }));
      }
    } else if (pointer.kind === 'resize') {
      if (object.type === 'image' || object.type === 'signature') {
        const ratio = object.aspectRatio || (pointer.originalWidth / Math.max(pointer.originalHeight, 1));
        const width = Math.max(24, pointer.originalWidth + dx);
        object.width = Math.min(width, state.viewX + state.pageWidth - object.x);
        object.height = object.width / ratio;
        object.y = pointer.originalY + pointer.originalHeight - object.height;
      } else {
        object.width = Math.max(24, pointer.originalWidth + dx);
        object.height = Math.max(18, pointer.originalHeight + dy);
        object.y = pointer.originalY + pointer.originalHeight - object.height;
      }
    }
    pointer.changed = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1;
    updateObjectElement(object);
  }

  function updateDrawingRect() {
    const rect = document.querySelector('.pdf-editor-drawing-rect');
    if (!rect || !state.pointer) return;
    const left = Math.min(state.pointer.startX, state.pointer.endX);
    const top = Math.min(state.pointer.startY, state.pointer.endY);
    rect.style.left = `${left}px`;
    rect.style.top = `${top}px`;
    rect.style.width = `${Math.abs(state.pointer.endX - state.pointer.startX)}px`;
    rect.style.height = `${Math.abs(state.pointer.endY - state.pointer.startY)}px`;
    if (state.pointer.toolMode === 'shape') {
      const fill = $('pdfEditorShapeFillEnabled') && $('pdfEditorShapeFillEnabled').checked;
      rect.style.borderColor = $('pdfEditorShapeBorder') ? $('pdfEditorShapeBorder').value : '#00a8ff';
      rect.style.background = fill && $('pdfEditorShapeFill') ? `${$('pdfEditorShapeFill').value}55` : 'transparent';
      const kind = $('pdfEditorShapeType') ? $('pdfEditorShapeType').value : 'rectangle';
      rect.style.borderRadius = kind === 'ellipse' ? '50%' : '0';
      if (kind === 'line' || kind === 'arrow') rect.style.clipPath = 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)';
    } else if (state.pointer.toolMode === 'link') {
      rect.style.borderColor = '#7c3aed';
      rect.style.background = 'rgba(124, 58, 237, 0.18)';
    }
  }

  function updateFreehandPreview() {
    const svg = document.querySelector('.pdf-editor-drawing-svg');
    if (!svg || !state.pointer) return;
    const stage = $('pdfEditorStage');
    svg.setAttribute('viewBox', `0 0 ${stage.clientWidth} ${stage.clientHeight}`);
    const d = state.pointer.points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
    svg.innerHTML = `<path d="${d}" fill="none" stroke="${$('pdfEditorAnnotateColor') ? $('pdfEditorAnnotateColor').value : '#ffe45c'}" stroke-width="${Math.max(1, Number($('pdfEditorPenWidth')?.value || 3))}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  function beginTextReplacement(block) {
    const blockPageIndex = Number.isInteger(block.pageIndex) ? block.pageIndex : state.pageIndex;
    let object = state.objects.find((item) => item.type === 'replaceText' && item.pageIndex === blockPageIndex && item.sourceTextId === block.id);
    if (!object) {
      const fontFamily = /courier/i.test(block.fontName) ? 'Courier' : /times/i.test(block.fontName) ? 'TimesRoman' : 'Helvetica';
      const fontStyle = /bold/i.test(block.fontName) && /italic|oblique/i.test(block.fontName) ? 'boldItalic'
        : /bold/i.test(block.fontName) ? 'bold'
          : /italic|oblique/i.test(block.fontName) ? 'italic' : 'regular';
      const fontSize = clamp(block.fontSize, 4, 144);
      const coverHeight = Math.max(fontSize * 1.32, block.height);
      const width = Math.max(block.width + fontSize * 0.18, fontSize * 1.8);
      const y = block.baseline - fontSize * 0.32;
      object = {
        id: createId(), type: 'replaceText', pageIndex: blockPageIndex,
        sourceTextId: block.id,
        x: block.x - fontSize * 0.04,
        y,
        width, height: coverHeight,
        coverColor: $('pdfEditorTextCoverColor') ? $('pdfEditorTextCoverColor').value : ($('pdfEditorCoverColor') ? $('pdfEditorCoverColor').value : '#ffffff'),
        coverWidth: width,
        coverHeight,
        text: block.text,
        fontFamily, fontStyle, fontSize,
        color: '#111111', baselineOffset: block.baseline - y
      };
      addObject(object, 'Text selected. Edit it in the text box; the original area is covered in the preview.');
    }
    selectObject(object.id);
    setMode('editText');
  }

  function annotateTextBlock(block) {
    const style = $('pdfEditorAnnotateStyle') ? $('pdfEditorAnnotateStyle').value : 'highlight';
    const size = Math.max(block.fontSize, 6);
    const object = {
      id: createId(), type: 'annotation', pageIndex: block.pageIndex,
      style, color: $('pdfEditorAnnotateColor') ? $('pdfEditorAnnotateColor').value : '#ffe45c',
      x: block.x - 1, y: block.baseline - size * 0.28,
      width: block.width + 3, height: Math.max(block.height, size * 1.18),
      lineWidth: clamp(Number($('pdfEditorPenWidth')?.value || 3), 1, 16)
    };
    addObject(object, `${style} annotation added to the selected text.`);
  }

  async function replaceAllText() {
    if (!state.pdf) { showError('Open a PDF first.'); return; }
    const find = $('pdfEditorFindText') ? $('pdfEditorFindText').value : '';
    const replacement = $('pdfEditorReplaceText') ? $('pdfEditorReplaceText').value : '';
    const caseSensitive = !!($('pdfEditorCaseSensitive') && $('pdfEditorCaseSensitive').checked);
    if (!find) { showError('Enter the text you want to find.'); return; }
    const engine = window.pdfjsLib;
    let added = 0;
    try {
      if (window.showProgress) window.showProgress('Searching PDF text…', 10);
      for (let pageIndex = 0; pageIndex < state.pageCount; pageIndex += 1) {
        const page = await state.pdf.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale: 1, rotation: 0 });
        const view = page.view || [0, 0, viewport.width, viewport.height];
        const geometry = { viewX: view[0], viewY: view[1], pageWidth: view[2] - view[0], pageHeight: view[3] - view[1] };
        const content = await page.getTextContent();
        const blocks = getTextBlocks(content, viewport, engine, pageIndex, 1, geometry);
        for (const block of blocks) {
          const matches = caseSensitive ? block.text.includes(find) : block.text.toLowerCase().includes(find.toLowerCase());
          if (!matches) continue;
          const newText = replaceOccurrences(block.text, find, replacement, caseSensitive);
          const fontSize = clamp(block.fontSize, 4, 144);
          const y = block.baseline - fontSize * 0.32;
          const width = Math.max(block.width + fontSize * 0.18, measureTextWidthPt(newText, { fontSize, fontFamily: 'Helvetica', fontStyle: 'regular' }) + 4);
          const height = Math.max(block.height, fontSize * 1.32);
          state.objects.push({
            id: createId(), type: 'replaceText', pageIndex,
            sourceTextId: `find-${block.id}-${added}`,
            x: block.x - fontSize * 0.04, y, width, height,
            coverColor: $('pdfEditorTextCoverColor') ? $('pdfEditorTextCoverColor').value : ($('pdfEditorCoverColor') ? $('pdfEditorCoverColor').value : '#ffffff'),
            coverWidth: width, coverHeight: height, text: newText,
            fontFamily: /courier/i.test(block.fontName) ? 'Courier' : /times/i.test(block.fontName) ? 'TimesRoman' : 'Helvetica',
            fontStyle: 'regular', fontSize, color: '#111111', baselineOffset: block.baseline - y
          });
          added += 1;
        }
        if (window.showProgress) window.showProgress(`Searching page ${pageIndex + 1} of ${state.pageCount}…`, 10 + Math.round((pageIndex + 1) / state.pageCount * 75));
      }
      if (added) {
        pushHistory();
        renderObjects();
        showMessage(`Prepared ${added} replacement${added === 1 ? '' : 's'}. Review the overlays across pages, then save.`);
        if (window.showStatus) window.showStatus(`Found ${added} matching text item${added === 1 ? '' : 's'} and prepared replacements.`, 'success');
      } else {
        showMessage('No matches were found in selectable PDF text. Scanned text and phrases split between text items are not detected.');
      }
    } catch (error) {
      showError(`Find & Replace failed: ${error.message || 'Could not search this PDF.'}`);
    } finally {
      if (window.hideProgress) window.hideProgress();
    }
  }

  function replaceOccurrences(source, search, replacement, caseSensitive) {
    const text = String(source);
    const needle = caseSensitive ? String(search) : String(search).toLowerCase();
    const haystack = caseSensitive ? text : text.toLowerCase();
    let cursor = 0;
    let output = '';
    while (cursor < text.length) {
      const index = haystack.indexOf(needle, cursor);
      if (index < 0) break;
      output += text.slice(cursor, index) + replacement;
      cursor = index + needle.length;
    }
    return output + text.slice(cursor);
  }

  function updateSelectedLinkFromControls() {
    const object = selectedObject();
    if (!object || object.type !== 'link') return;
    object.targetType = $('pdfEditorLinkType') ? $('pdfEditorLinkType').value : 'url';
    object.url = $('pdfEditorLinkValue') ? $('pdfEditorLinkValue').value.trim() : '';
    object.targetPage = clamp(Number($('pdfEditorLinkPage')?.value || 1), 1, state.pageCount);
    renderObjects();
    scheduleHistory();
  }

  function updateSelectedFormFieldFromControls() {
    const object = selectedObject();
    if (!object || object.type !== 'formField') return;
    object.fieldType = $('pdfEditorFieldType') ? $('pdfEditorFieldType').value : 'text';
    object.fieldName = $('pdfEditorFieldName') ? $('pdfEditorFieldName').value.trim() : object.fieldName;
    object.fieldValue = $('pdfEditorFieldValue') ? $('pdfEditorFieldValue').value : '';
    object.options = $('pdfEditorFieldOptions') ? $('pdfEditorFieldOptions').value.split('\n').map((item) => item.trim()).filter(Boolean) : [];
    object.maxLength = clamp(Number($('pdfEditorFieldMaxLength')?.value || 0), 0, 10000);
    object.required = !!($('pdfEditorRequired') && $('pdfEditorRequired').checked);
    object.repeatAllPages = !!($('pdfEditorRepeatField') && $('pdfEditorRepeatField').checked);
    object.option = object.fieldValue || object.options[0] || 'Option 1';
    renderObjects();
    scheduleHistory();
  }

  function rotateSelectedImage() {
    const object = selectedObject();
    if (!object || !['image', 'signature'].includes(object.type)) {
      showMessage('Select an image or signature first, then rotate it.');
      return;
    }
    object.rotation = ((object.rotation || 0) + 90) % 360;
    pushHistory();
    renderObjects();
    showMessage(`Selected ${object.type} rotated to ${object.rotation}°.`);
  }

  function rotateCurrentPage() {
    if (!state.pdf) { showError('Open a PDF first.'); return; }
    let object = state.objects.find((item) => item.type === 'pageRotation' && item.pageIndex === state.pageIndex);
    if (!object) {
      object = { id: createId(), type: 'pageRotation', pageIndex: state.pageIndex, angle: 90 };
      state.objects.push(object);
    } else {
      object.angle = (object.angle + 90) % 360 || 360;
    }
    pushHistory();
    renderObjects();
    showMessage(`Page ${state.pageIndex + 1} will rotate ${object.angle}° when saved. The workspace preview stays upright.`);
  }

  function markCurrentPageForDeletion() {
    if (!state.pdf) { showError('Open a PDF first.'); return; }
    const marked = state.objects.find((item) => item.type === 'pageDelete' && item.pageIndex === state.pageIndex);
    if (marked) {
      state.objects = state.objects.filter((item) => item.id !== marked.id);
      if (state.selectedId === marked.id) state.selectedId = null;
      pushHistory(); renderObjects();
      showMessage(`Page ${state.pageIndex + 1} is no longer marked for deletion.`);
      return;
    }
    const deleted = new Set(state.objects.filter((item) => item.type === 'pageDelete').map((item) => item.pageIndex));
    if (state.pageCount - deleted.size <= 1) { showError('A PDF must keep at least one page.'); return; }
    state.objects.push({
      id: createId(), type: 'pageDelete', pageIndex: state.pageIndex,
      x: state.viewX, y: state.viewY, width: state.pageWidth, height: state.pageHeight
    });
    pushHistory(); renderObjects();
    showMessage(`Page ${state.pageIndex + 1} marked for deletion. Click the page again to undo, or use Undo.`);
  }

  function addObject(object, message) {
    state.objects.push(object);
    pushHistory();
    renderObjects();
    if (message) showMessage(message);
  }

  function renderObjects() {
    const layer = $('pdfEditorObjects');
    if (!layer) return;
    layer.innerHTML = '';
    state.objects.filter((object) => object.pageIndex === state.pageIndex).forEach((object) => {
      const element = document.createElement('div');
      element.className = `pdf-editor-object pdf-editor-object-${object.type}${object.id === state.selectedId ? ' selected' : ''}`;
      element.dataset.objectId = object.id;
      if (object.type === 'pageDelete') {
        element.style.left = '0px'; element.style.top = '0px';
        element.style.width = `${state.pageWidth * state.pageScale}px`;
        element.style.height = `${state.pageHeight * state.pageScale}px`;
      } else if (object.type === 'pageRotation') {
        element.style.left = '10px'; element.style.top = '10px';
        element.style.width = '270px'; element.style.height = '38px';
      } else {
        element.style.left = `${(object.x - state.viewX) * state.pageScale}px`;
        element.style.top = `${(state.viewY + state.pageHeight - object.y - object.height) * state.pageScale}px`;
        element.style.width = `${object.width * state.pageScale}px`;
        element.style.height = `${object.height * state.pageScale}px`;
      }
      if (object.type === 'cover') {
        element.style.backgroundColor = object.color || '#ffffff';
        element.setAttribute('aria-label', 'Covered region');
      } else if (object.type === 'replaceText') {
        element.style.backgroundColor = object.coverColor || '#ffffff';
        element.appendChild(makeTextOverlay(object));
      } else if (object.type === 'text') {
        element.appendChild(makeTextOverlay(object));
      } else if (object.type === 'image' || object.type === 'signature') {
        const image = document.createElement('img');
        image.src = object.dataUrl;
        image.alt = object.name || (object.type === 'signature' ? 'Signature' : 'Added image');
        image.draggable = false;
        element.appendChild(image);
        if (object.rotation) element.style.transform = `rotate(${object.rotation}deg)`;
        element.style.transformOrigin = 'center center';
      } else if (object.type === 'shape') {
        renderShapePreview(element, object);
      } else if (object.type === 'annotation') {
        element.dataset.annotationStyle = object.style;
        element.style.setProperty('--annotation-color', object.color || '#ffe45c');
      } else if (object.type === 'freehand') {
        renderFreehandPreview(element, object);
      } else if (object.type === 'link') {
        const label = document.createElement('span');
        label.className = 'pdf-editor-link-label';
        label.textContent = object.targetType === 'page' ? `Page ${object.targetPage || 1}` : (object.url || 'Add target');
        element.appendChild(label);
      } else if (object.type === 'formField') {
        element.classList.add(`field-${object.fieldType}`);
        element.style.backgroundColor = 'rgba(255,255,255,0.55)';
        element.style.borderColor = '#2085d8';
        if (object.fieldType === 'checkbox' || object.fieldType === 'radio') {
          const mark = document.createElement('span');
          mark.className = `pdf-editor-field-mark ${object.fieldType}`;
          element.appendChild(mark);
        } else {
          const fieldLabel = document.createElement('span');
          fieldLabel.className = 'pdf-editor-form-preview-label';
          fieldLabel.textContent = `${object.fieldName || 'field'}${object.fieldValue ? `: ${object.fieldValue}` : ''}`;
          element.appendChild(fieldLabel);
        }
      } else if (object.type === 'stamp') {
        element.style.border = `2px solid ${object.color || '#e53935'}`;
        element.appendChild(makeTextOverlay(object));
      } else if (object.type === 'pageDelete') {
        const banner = document.createElement('div');
        banner.className = 'pdf-editor-page-delete-banner';
        banner.textContent = 'PAGE WILL BE DELETED · click item and press Delete to undo';
        element.appendChild(banner);
      } else if (object.type === 'pageRotation') {
        const banner = document.createElement('div');
        banner.className = 'pdf-editor-page-rotation-banner';
        banner.textContent = `Page rotation ${object.angle}° will apply on save`;
        element.appendChild(banner);
      }
      if (object.type === 'pageRotation') element.style.pointerEvents = 'none';
      if (isResizable(object)) {
        const resize = document.createElement('span');
        resize.className = 'pdf-editor-resize-handle';
        resize.title = 'Drag to resize';
        resize.setAttribute('aria-hidden', 'true');
        element.appendChild(resize);
      }
      layer.appendChild(element);
    });
    updateSelectionLabel();
  }

  function isResizable(object) {
    return object && ['image', 'signature', 'formField', 'shape', 'stamp', 'link'].includes(object.type);
  }

  function renderShapePreview(element, object) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    const stroke = object.borderColor || '#00a8ff';
    const fill = object.fillEnabled ? object.fillColor || '#fff0a8' : 'none';
    let shape;
    if (object.shapeType === 'ellipse') {
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      shape.setAttribute('cx', '50'); shape.setAttribute('cy', '50'); shape.setAttribute('rx', '47'); shape.setAttribute('ry', '47');
    } else if (object.shapeType === 'line' || object.shapeType === 'arrow') {
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      shape.setAttribute('x1', '0'); shape.setAttribute('y1', '0'); shape.setAttribute('x2', '100'); shape.setAttribute('y2', '100');
      if (object.shapeType === 'arrow') shape.setAttribute('marker-end', 'url(#pdfEditorArrowHead)');
    } else {
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      shape.setAttribute('x', '2'); shape.setAttribute('y', '2'); shape.setAttribute('width', '96'); shape.setAttribute('height', '96');
    }
    shape.setAttribute('stroke', stroke);
    shape.setAttribute('stroke-width', String(object.lineWidth || 2));
    shape.setAttribute('fill', fill);
    svg.appendChild(shape);
    if (object.shapeType === 'arrow') {
      const head = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      head.setAttribute('d', 'M 76 76 L 98 100 L 67 91');
      head.setAttribute('fill', stroke);
      svg.appendChild(head);
    }
    element.appendChild(svg);
  }

  function renderFreehandPreview(element, object) {
    if (!Array.isArray(object.points) || object.points.length < 2) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${Math.max(object.width, 1) * state.pageScale} ${Math.max(object.height, 1) * state.pageScale}`);
    svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = object.points.map((point, index) => {
      const x = (point.x - object.x) * state.pageScale;
      const y = (object.y + object.height - point.y) * state.pageScale;
      return `${index ? 'L' : 'M'} ${x} ${y}`;
    }).join(' ');
    path.setAttribute('d', d); path.setAttribute('fill', 'none');
    path.setAttribute('stroke', object.color || '#ffe45c'); path.setAttribute('stroke-width', String(object.lineWidth || 3));
    path.setAttribute('stroke-linecap', 'round'); path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path); element.appendChild(svg);
  }

  function makeTextOverlay(object) {
    const text = document.createElement('div');
    text.className = 'pdf-editor-text-overlay';
    text.textContent = object.text || '';
    text.style.fontFamily = cssFontFamily(object.fontFamily);
    text.style.fontSize = `${object.fontSize * state.pageScale}px`;
    text.style.fontWeight = object.fontStyle === 'bold' || object.fontStyle === 'boldItalic' ? '700' : '400';
    text.style.fontStyle = object.fontStyle === 'italic' || object.fontStyle === 'boldItalic' ? 'italic' : 'normal';
    text.style.color = object.color || '#111111';
    text.style.lineHeight = '1.2';
    if (object.type === 'stamp') {
      text.style.display = 'flex';
      text.style.alignItems = 'center';
      text.style.justifyContent = 'center';
      text.style.textTransform = 'uppercase';
      text.style.letterSpacing = '0.08em';
    }
    return text;
  }

  function updateObjectElement(object) {
    const layer = $('pdfEditorObjects');
    if (!layer) return;
    const element = Array.from(layer.querySelectorAll('[data-object-id]')).find((item) => item.dataset.objectId === object.id);
    if (!element) return;
    element.style.left = `${(object.x - state.viewX) * state.pageScale}px`;
    element.style.top = `${(state.viewY + state.pageHeight - object.y - object.height) * state.pageScale}px`;
    element.style.width = `${object.width * state.pageScale}px`;
    element.style.height = `${object.height * state.pageScale}px`;
  }

  function selectObject(id) {
    state.selectedId = id || null;
    const object = selectedObject();
    document.querySelectorAll('.pdf-editor-object').forEach((element) => {
      element.classList.toggle('selected', element.dataset.objectId === state.selectedId);
    });
    if (object && isTextObject(object)) fillTextControls(object);
    if (object && object.type === 'replaceText') {
      const coverColor = $('pdfEditorCoverColor');
      if (coverColor) coverColor.value = object.coverColor || '#ffffff';
    }
    if (object && object.type === 'link') fillLinkControls(object);
    if (object && object.type === 'formField') fillFormControls(object);
    setMode(state.mode);
    updateSelectionLabel();
  }

  function fillLinkControls(object) {
    const type = $('pdfEditorLinkType');
    const value = $('pdfEditorLinkValue');
    const page = $('pdfEditorLinkPage');
    if (type) type.value = object.targetType || 'url';
    if (value) value.value = object.url || '';
    if (page) page.value = String(object.targetPage || 1);
  }

  function fillFormControls(object) {
    const type = $('pdfEditorFieldType');
    const name = $('pdfEditorFieldName');
    const value = $('pdfEditorFieldValue');
    const options = $('pdfEditorFieldOptions');
    const repeat = $('pdfEditorRepeatField');
    const maxLength = $('pdfEditorFieldMaxLength');
    const required = $('pdfEditorRequired');
    if (type) type.value = object.fieldType || 'text';
    if (name) name.value = object.fieldName || '';
    if (value) value.value = object.fieldValue || '';
    if (options) options.value = (object.options || []).join('\n');
    if (repeat) repeat.checked = !!object.repeatAllPages;
    if (maxLength) maxLength.value = String(object.maxLength || 0);
    if (required) required.checked = !!object.required;
  }

  function selectedObject() {
    return state.objects.find((object) => object.id === state.selectedId) || null;
  }

  function isTextObject(object) {
    return object && (object.type === 'text' || object.type === 'replaceText');
  }

  function fillTextControls(object) {
    const text = $('pdfEditorText');
    const font = $('pdfEditorFont');
    const style = $('pdfEditorStyle');
    const size = $('pdfEditorFontSize');
    const color = $('pdfEditorTextColor');
    const coverColor = $('pdfEditorTextCoverColor');
    if (text) text.value = object.text || '';
    if (font) font.value = object.fontFamily || 'Helvetica';
    if (style) style.value = object.fontStyle || 'regular';
    if (size) size.value = String(Math.round(object.fontSize || 18));
    if (color) color.value = object.color || '#111111';
    if (coverColor) coverColor.value = object.coverColor || '#ffffff';
  }

  function readTextControls() {
    return {
      text: $('pdfEditorText') ? $('pdfEditorText').value : '',
      fontFamily: $('pdfEditorFont') ? $('pdfEditorFont').value : 'Helvetica',
      fontStyle: $('pdfEditorStyle') ? $('pdfEditorStyle').value : 'regular',
      fontSize: clamp(Number($('pdfEditorFontSize') ? $('pdfEditorFontSize').value : 18) || 18, 4, 144),
      color: $('pdfEditorTextColor') ? $('pdfEditorTextColor').value : '#111111',
      coverColor: $('pdfEditorTextCoverColor') ? $('pdfEditorTextCoverColor').value : '#ffffff'
    };
  }

  function updateSelectedTextFromControls() {
    const object = selectedObject();
    if (!isTextObject(object)) return;
    const controls = readTextControls();
    object.text = controls.text;
    object.fontFamily = controls.fontFamily;
    object.fontStyle = controls.fontStyle;
    object.fontSize = controls.fontSize;
    object.color = controls.color;
    if (object.type === 'replaceText') object.coverColor = controls.coverColor;
    const lines = (object.text || '').split('\n');
    const measured = measureTextWidthPt(object.text || ' ', controls);
    if (object.type === 'replaceText') {
      object.width = Math.max(object.coverWidth || 0, measured + 4);
      object.coverWidth = object.width;
      object.height = Math.max(object.coverHeight || 0, controls.fontSize * 1.22 * lines.length);
      object.coverHeight = object.height;
      if (object.sourceTextId) object.baselineOffset = clamp(object.baselineOffset || controls.fontSize * 0.6, 0, object.height);
    } else {
      object.width = Math.max(measured + 3, controls.fontSize * 1.6);
      object.height = Math.max(controls.fontSize * 1.25, controls.fontSize * 1.2 * lines.length);
      object.baselineOffset = controls.fontSize * 0.22;
    }
    renderObjects();
    scheduleHistory();
  }

  function applyTextControls() {
    const object = selectedObject();
    if (isTextObject(object)) {
      updateSelectedTextFromControls();
      showMessage('Text updated in the live preview.');
    } else if (state.mode === 'addText') {
      showMessage('Text is ready. Click on the PDF page to place it.');
    } else {
      showMessage('Choose Add text or click existing text in Replace text mode.');
    }
  }

  function beginTextEditingPage() {
    setMode('editText');
  }

  async function handleImageSelection(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      const normalized = await normalizeImage(file);
      state.pendingImage = normalized;
      const imageName = $('pdfEditorImageName');
      if (imageName) imageName.textContent = `${file.name} ready · click the page to place it`;
      setMode('addImage');
      showMessage('Image ready. Click on the page to place it.');
    } catch (error) {
      console.error('Could not load image for PDF:', error);
      showError('Could not load that image. Try a PNG, JPG, or WebP file.');
    }
  }

  async function handleSignatureUpload(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      state.pendingImage = await normalizeImage(file);
      const status = $('pdfEditorSignatureStatus');
      if (status) status.textContent = `${file.name} ready — click the PDF page to place it.`;
      setMode('addSignature');
    } catch (error) {
      showError('Could not load that signature image. Use PNG, JPG, or WebP.');
    }
  }

  function bindSignaturePad() {
    const canvas = $('pdfEditorSignaturePad');
    if (!canvas || canvas.dataset.bound === 'true') return;
    canvas.dataset.bound = 'true';
    const context = canvas.getContext('2d');
    context.lineWidth = 3.2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#111827';
    let drawing = false;
    const point = (event) => {
      const rect = canvas.getBoundingClientRect();
      return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
    };
    canvas.addEventListener('pointerdown', (event) => {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      const p = point(event);
      context.beginPath();
      context.moveTo(p.x, p.y);
      event.preventDefault();
    });
    canvas.addEventListener('pointermove', (event) => {
      if (!drawing) return;
      const p = point(event);
      context.lineTo(p.x, p.y);
      context.stroke();
      state.signatureHasInk = true;
    });
    const finish = () => { drawing = false; };
    canvas.addEventListener('pointerup', finish);
    canvas.addEventListener('pointercancel', finish);
  }

  function clearSignaturePad() {
    const canvas = $('pdfEditorSignaturePad');
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    state.signatureHasInk = false;
  }

  async function blobToImageAsset(blob, name) {
    const normalized = await normalizeImage(blob);
    normalized.name = name || 'signature.png';
    return normalized;
  }

  async function createTypedSignature() {
    const text = $('pdfEditorSignatureText') ? $('pdfEditorSignatureText').value.trim() : '';
    if (!text) { showError('Type your name first.'); return; }
    const canvas = document.createElement('canvas');
    canvas.width = 1100;
    canvas.height = 260;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    const style = $('pdfEditorSignatureStyle') ? $('pdfEditorSignatureStyle').value : 'cursive';
    const family = style === 'serif' ? 'Georgia, serif' : style === 'sans' ? 'Arial, sans-serif' : '"Brush Script MT", "Segoe Script", cursive';
    context.font = `italic 92px ${family}`;
    context.fillStyle = '#111827';
    context.textBaseline = 'middle';
    context.fillText(text, 24, 132, 1040);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) { showError('Could not render the typed signature.'); return; }
    state.pendingImage = await blobToImageAsset(blob, 'Typed signature');
    const status = $('pdfEditorSignatureStatus');
    if (status) status.textContent = 'Typed signature ready — click the PDF page to place it.';
    setMode('addSignature');
  }

  async function useDrawnSignature() {
    const canvas = $('pdfEditorSignaturePad');
    if (!canvas || !state.signatureHasInk) { showError('Draw your signature in the pad first.'); return; }
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) { showError('Could not capture the drawn signature.'); return; }
    state.pendingImage = await blobToImageAsset(blob, 'Drawn signature');
    const status = $('pdfEditorSignatureStatus');
    if (status) status.textContent = 'Drawn signature ready — click the PDF page to place it.';
    setMode('addSignature');
  }

  async function normalizeImage(file) {
    const imageUrl = URL.createObjectURL(file);
    let image;
    try {
      image = await new Promise((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error('Image decode failed'));
        element.src = imageUrl;
      });
    } finally {
      // The decoded image is now in memory; the temporary URL can be released.
      setTimeout(() => URL.revokeObjectURL(imageUrl), 0);
    }
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) throw new Error('Invalid image dimensions');

    let mime = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
    let bytes;
    let dataUrl;
    if (mime === 'image/jpeg' || file.type === 'image/png') {
      bytes = new Uint8Array(await file.arrayBuffer());
      dataUrl = await blobToDataUrl(file);
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Image conversion failed');
      bytes = new Uint8Array(await blob.arrayBuffer());
      dataUrl = await blobToDataUrl(blob);
      mime = 'image/png';
    }
    return { name: file.name || 'Added image', mime, bytes, dataUrl, width, height, aspectRatio: width / height };
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error('Could not read file'));
      reader.readAsDataURL(blob);
    });
  }

  function deleteSelected() {
    if (!state.selectedId) {
      showMessage('Select an added item first. To hide original PDF content, use Cover / erase area.');
      return;
    }
    state.objects = state.objects.filter((object) => object.id !== state.selectedId);
    state.selectedId = null;
    pushHistory();
    renderObjects();
    setMode(state.mode);
    showMessage('Selected added item deleted. Original PDF content is not changed.');
  }

  function setPage(index) {
    if (!state.pdf || !state.pageCount) return;
    const next = clamp(index, 0, state.pageCount - 1);
    if (next === state.pageIndex) return;
    state.pageIndex = next;
    state.selectedId = null;
    setMode(state.mode);
    renderPage();
  }

  function setZoom(zoom) {
    state.zoom = clamp(zoom, 0.5, 2.5);
    if (state.pdf) renderPage();
  }

  function pushHistory() {
    if (state.historyTimer) {
      clearTimeout(state.historyTimer);
      state.historyTimer = null;
    }
    const snapshot = {
      objects: state.objects.map((object) => ({ ...object })),
      formValues: { ...state.formValues }
    };
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(snapshot);
    if (state.history.length > 80) state.history.shift();
    state.historyIndex = state.history.length - 1;
    updateUndoRedoButtons();
  }

  function scheduleHistory() {
    if (state.historyTimer) clearTimeout(state.historyTimer);
    state.historyTimer = setTimeout(() => {
      pushHistory();
      state.historyTimer = null;
    }, 450);
  }

  function restoreHistory(index) {
    if (index < 0 || index >= state.history.length || index === state.historyIndex) return;
    if (state.historyTimer) {
      clearTimeout(state.historyTimer);
      state.historyTimer = null;
    }
    state.historyIndex = index;
    state.objects = state.history[index].objects.map((object) => ({ ...object }));
    state.formValues = { ...state.history[index].formValues };
    if (!state.objects.some((object) => object.id === state.selectedId)) state.selectedId = null;
    setMode(state.mode);
    renderPage();
    updateUndoRedoButtons();
    const selected = selectedObject();
    if (isTextObject(selected)) fillTextControls(selected);
  }

  function undo() {
    if (state.historyIndex > 0) restoreHistory(state.historyIndex - 1);
  }

  function redo() {
    if (state.historyIndex < state.history.length - 1) restoreHistory(state.historyIndex + 1);
  }

  function updateUndoRedoButtons() {
    const undoButton = document.querySelector('[data-pdf-action="undo"]');
    const redoButton = document.querySelector('[data-pdf-action="redo"]');
    if (undoButton) undoButton.disabled = state.historyIndex <= 0;
    if (redoButton) redoButton.disabled = state.historyIndex < 0 || state.historyIndex >= state.history.length - 1;
  }

  async function exportPdf() {
    if (!state.file || !state.pdfBytes) throw new Error('Open a PDF before saving.');
    if (!window.PDFLib || !window.PDFLib.PDFDocument) throw new Error('PDF save library is not available. Refresh the page and try again.');
    if (state.historyTimer) {
      clearTimeout(state.historyTimer);
      state.historyTimer = null;
      pushHistory();
    }
    try {
      if (window.showProgress) window.showProgress('Applying edits to the PDF…', 15);
      const PDFDocument = window.PDFLib.PDFDocument;
      const doc = await PDFDocument.load(state.pdfBytes.slice(0));
      const originalPages = doc.getPages();
      const originalPageCount = originalPages.length;
      const deleted = [...new Set(state.objects.filter((object) => object.type === 'pageDelete').map((object) => object.pageIndex))].sort((a, b) => b - a);
      if (deleted.length >= originalPageCount) throw new Error('At least one page must remain in the PDF.');

      for (const object of state.objects.filter((item) => item.type === 'pageRotation')) {
        const page = originalPages[object.pageIndex];
        if (!page) continue;
        const angle = ((page.getRotation().angle + object.angle) % 360 + 360) % 360;
        page.setRotation(window.PDFLib.degrees(angle));
      }
      deleted.forEach((pageIndex) => doc.removePage(pageIndex));
      const pages = doc.getPages();
      const outputPageIndex = (originalIndex) => originalIndex - deleted.filter((index) => index < originalIndex).length;
      const fontCache = new Map();
      const pageObjects = state.objects.filter((object) => !['pageDelete', 'pageRotation'].includes(object.type) && object.pageIndex >= 0 && object.pageIndex < originalPageCount && !deleted.includes(object.pageIndex));
      let completed = 0;

      applyExistingFormValues(doc);
      await createFormFields(doc, pages, pageObjects, outputPageIndex);
      for (const object of pageObjects) {
        const pageIndex = outputPageIndex(object.pageIndex);
        const page = pages[pageIndex];
        if (!page) continue;
        if (object.type === 'cover') {
          page.drawRectangle({ x: object.x, y: object.y, width: object.width, height: object.height, color: pdfRgb(object.color || '#ffffff') });
        } else if (object.type === 'replaceText') {
          page.drawRectangle({ x: object.x, y: object.y, width: object.width, height: object.height, color: pdfRgb(object.coverColor || '#ffffff') });
          await drawTextObject(doc, page, object, fontCache);
        } else if (object.type === 'text') {
          await drawTextObject(doc, page, object, fontCache);
        } else if (object.type === 'image' || object.type === 'signature') {
          const image = object.mime === 'image/jpeg' ? await doc.embedJpg(object.bytes) : await doc.embedPng(object.bytes);
          page.drawImage(image, { x: object.x, y: object.y, width: object.width, height: object.height, ...(object.rotation ? { rotate: window.PDFLib.degrees(object.rotation) } : {}) });
        } else if (object.type === 'shape') {
          drawShape(page, object);
        } else if (object.type === 'annotation') {
          drawTextAnnotation(page, object);
        } else if (object.type === 'freehand') {
          drawFreehand(page, object);
        } else if (object.type === 'stamp') {
          await drawStamp(doc, page, object, fontCache);
        } else if (object.type === 'link') {
          addLinkAnnotation(doc, page, object, pages, deleted, outputPageIndex);
        }
        completed += 1;
        if (window.showProgress) window.showProgress('Writing edits…', Math.min(85, 25 + Math.round((completed / Math.max(pageObjects.length, 1)) * 60)));
      }

      const bytes = await doc.save({ useObjectStreams: true });
      const baseName = (state.file.name || 'document.pdf').replace(/\.pdf$/i, '');
      const outputName = `${baseName}_edited.pdf`;
      if (window.downloadBlob) window.downloadBlob(bytes, outputName, 'application/pdf');
      else downloadFallback(bytes, outputName);
      const pageNote = deleted.length ? ` ${deleted.length} page${deleted.length === 1 ? '' : 's'} removed.` : '';
      if (window.showStatus) window.showStatus(`Saved ${outputName}. The edited PDF was generated in your browser.${pageNote}`, 'success');
      if (window.hideProgress) window.hideProgress();
    } catch (error) {
      if (window.hideProgress) window.hideProgress();
      console.error('PDF export failed:', error);
      if (window.showStatus) window.showStatus(`Could not save PDF: ${error.message || 'Export failed'}`, 'error');
      throw error;
    }
  }

  function drawShape(page, object) {
    const borderColor = pdfRgb(object.borderColor || '#00a8ff');
    const fillOptions = object.fillEnabled ? { color: pdfRgb(object.fillColor || '#fff0a8'), opacity: 0.35 } : {};
    if (object.shapeType === 'ellipse') {
      page.drawEllipse({
        x: object.x + object.width / 2, y: object.y + object.height / 2,
        xScale: Math.max(1, object.width / 2), yScale: Math.max(1, object.height / 2),
        ...fillOptions, borderColor, borderWidth: object.lineWidth || 2
      });
    } else if (object.shapeType === 'line' || object.shapeType === 'arrow') {
      const start = { x: object.x, y: object.y + object.height };
      const end = { x: object.x + object.width, y: object.y };
      const thickness = object.lineWidth || 2;
      page.drawLine({ start, end, color: borderColor, thickness });
      if (object.shapeType === 'arrow') {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const size = Math.max(7, thickness * 3.2);
        const left = { x: end.x - size * Math.cos(angle - Math.PI / 6), y: end.y - size * Math.sin(angle - Math.PI / 6) };
        const right = { x: end.x - size * Math.cos(angle + Math.PI / 6), y: end.y - size * Math.sin(angle + Math.PI / 6) };
        page.drawLine({ start: end, end: left, color: borderColor, thickness });
        page.drawLine({ start: end, end: right, color: borderColor, thickness });
      }
    } else {
      page.drawRectangle({
        x: object.x, y: object.y, width: object.width, height: object.height,
        ...fillOptions, borderColor, borderWidth: object.lineWidth || 2
      });
    }
  }

  function drawTextAnnotation(page, object) {
    const color = pdfRgb(object.color || '#ffe45c');
    if (object.style === 'highlight') {
      page.drawRectangle({ x: object.x, y: object.y, width: object.width, height: object.height, color, opacity: 0.38 });
    } else {
      const y = object.style === 'underline' ? object.y + 1.5 : object.y + object.height * 0.55;
      page.drawLine({ start: { x: object.x, y }, end: { x: object.x + object.width, y }, color, thickness: object.lineWidth || 2 });
    }
  }

  function drawFreehand(page, object) {
    if (!object.points || object.points.length < 2) return;
    const color = pdfRgb(object.color || '#ffe45c');
    for (let index = 1; index < object.points.length; index += 1) {
      page.drawLine({ start: object.points[index - 1], end: object.points[index], color, thickness: object.lineWidth || 3 });
    }
  }

  async function drawStamp(doc, page, object, fontCache) {
    const color = pdfRgb(object.color || '#e53935');
    page.drawRectangle({ x: object.x, y: object.y, width: object.width, height: object.height, borderColor: color, borderWidth: 2 });
    const fontSize = Math.min(object.fontSize || 18, object.height * 0.48);
    const fontKey = `font:${window.PDFLib.StandardFonts.HelveticaBold}`;
    let font = fontCache.get(fontKey);
    if (!font) {
      font = await doc.embedFont(window.PDFLib.StandardFonts.HelveticaBold);
      fontCache.set(fontKey, font);
    }
    const textWidth = font.widthOfTextAtSize(String(object.text || ''), fontSize);
    const stamp = {
      ...object, x: object.x + Math.max(3, (object.width - textWidth) / 2),
      fontFamily: 'Helvetica', fontStyle: 'bold', fontSize,
      color: object.color || '#e53935', baselineOffset: object.height * 0.36,
      width: Math.max(object.width - 6, textWidth + 4)
    };
    await drawTextObject(doc, page, stamp, fontCache);
  }

  function applyExistingFormValues(doc) {
    const names = Object.keys(state.formValues || {});
    if (!names.length) return;
    const form = doc.getForm();
    for (const name of names) {
      let field;
      try { field = form.getField(name); } catch (_) { continue; }
      const value = state.formValues[name];
      try {
        if (typeof value === 'boolean' && typeof field.check === 'function') value ? field.check() : field.uncheck();
        else if (typeof field.setText === 'function') field.setText(String(value ?? ''));
        else if (typeof field.select === 'function' && value !== '') field.select(String(value));
      } catch (error) {
        console.warn(`Could not update PDF form field "${name}":`, error);
      }
    }
  }

  async function createFormFields(doc, pages, pageObjects, outputPageIndex) {
    const fields = pageObjects.filter((object) => object.type === 'formField');
    if (!fields.length) return;
    const form = doc.getForm();
    const usedNames = new Set(form.getFields().map((field) => field.getName()));
    const radios = new Map();
    const targetPages = (object) => object.repeatAllPages ? pages : [pages[outputPageIndex(object.pageIndex)]].filter(Boolean);
    const appearanceFor = (object) => ({
      x: object.x, y: object.y, width: object.width, height: object.height,
      borderWidth: 1, borderColor: pdfRgb('#2085d8'), backgroundColor: pdfRgb('#ffffff'), textColor: pdfRgb('#111111')
    });
    for (const object of fields) {
      const fieldPages = targetPages(object);
      if (!fieldPages.length) continue;
      const requested = sanitizeFieldName(object.fieldName || 'field');
      const options = object.options && object.options.length ? object.options : ['Option 1', 'Option 2'];
      if (object.fieldType === 'radio') {
        const key = requested;
        if (!radios.has(key)) {
          const name = uniqueFieldName(requested, usedNames);
          radios.set(key, { field: form.createRadioGroup(name), options: new Set(), selection: object.fieldValue || '', required: !!object.required });
        }
        const group = radios.get(key);
        group.required = group.required || !!object.required;
        const option = String(object.option || object.fieldValue || options[group.options.size] || `Option ${group.options.size + 1}`);
        for (const page of fieldPages) group.field.addOptionToPage(option, page, appearanceFor(object));
        group.options.add(option);
        continue;
      }
      const name = uniqueFieldName(requested, usedNames);
      if (object.fieldType === 'checkbox') {
        const field = form.createCheckBox(name);
        if (object.required) field.enableRequired();
        fieldPages.forEach((page) => field.addToPage(page, appearanceFor(object)));
        if (object.fieldValue === true || /^(true|yes|1|on)$/i.test(String(object.fieldValue || ''))) field.check();
      } else if (object.fieldType === 'dropdown') {
        const field = form.createDropdown(name);
        if (object.required) field.enableRequired();
        field.addOptions(options);
        fieldPages.forEach((page) => field.addToPage(page, appearanceFor(object)));
        const value = String(object.fieldValue || options[0] || '');
        if (value && options.includes(value)) field.select(value);
      } else {
        const field = form.createTextField(name);
        if (object.fieldType === 'multiline') field.enableMultiline();
        if (object.maxLength > 0) field.setMaxLength(object.maxLength);
        if (object.required) field.enableRequired();
        if (object.fieldValue) field.setText(String(object.fieldValue));
        fieldPages.forEach((page) => field.addToPage(page, appearanceFor(object)));
      }
    }
    for (const group of radios.values()) {
      if (group.required) group.field.enableRequired();
      if (group.options.size) {
        const desired = group.selection && group.options.has(group.selection) ? group.selection : [...group.options][0];
        try { group.field.select(desired); } catch (_) { /* no default selection needed */ }
      }
    }
  }

  function sanitizeFieldName(value) {
    return String(value || 'field').trim().replace(/[^A-Za-z0-9_.-]+/g, '_').slice(0, 100) || 'field';
  }

  function uniqueFieldName(base, used) {
    let name = base;
    let suffix = 2;
    while (used.has(name)) name = `${base}_${suffix++}`;
    used.add(name);
    return name;
  }

  function addLinkAnnotation(doc, page, object, pages, deleted, outputPageIndex) {
    const targetType = object.targetType || 'url';
    const context = doc.context;
    const { PDFName, PDFDict, PDFArray, PDFNumber, PDFString } = window.PDFLib;
    const annotation = PDFDict.withContext(context);
    annotation.set(PDFName.of('Type'), PDFName.of('Annot'));
    annotation.set(PDFName.of('Subtype'), PDFName.of('Link'));
    const rect = PDFArray.withContext(context);
    [object.x, object.y, object.x + object.width, object.y + object.height].forEach((value) => rect.push(PDFNumber.of(value)));
    annotation.set(PDFName.of('Rect'), rect);
    const border = PDFArray.withContext(context);
    [0, 0, 0].forEach((value) => border.push(PDFNumber.of(value)));
    annotation.set(PDFName.of('Border'), border);
    if (targetType === 'page') {
      let targetOriginal = clamp((Number(object.targetPage) || 1) - 1, 0, deleted.length + pages.length - 1);
      if (deleted.includes(targetOriginal)) {
        const remainingPages = Array.from({ length: pages.length + deleted.length }, (_, index) => index).filter((index) => !deleted.includes(index));
        targetOriginal = remainingPages.find((index) => index >= targetOriginal) ?? remainingPages[0];
      }
      const target = pages[outputPageIndex(targetOriginal)];
      if (!target) throw new Error('Link destination page is not available.');
      const destination = PDFArray.withContext(context);
      destination.push(target.ref);
      destination.push(PDFName.of('Fit'));
      annotation.set(PDFName.of('Dest'), destination);
    } else {
      let address = String(object.url || '').trim();
      if (!address) throw new Error('Enter a target URL, email address, or phone number for each link.');
      if (targetType === 'email' && !/^mailto:/i.test(address)) address = `mailto:${address}`;
      else if (targetType === 'phone' && !/^tel:/i.test(address)) address = `tel:${address}`;
      else if (targetType === 'url' && !/^[a-z][a-z0-9+.-]*:/i.test(address)) address = `https://${address}`;
      const action = PDFDict.withContext(context);
      action.set(PDFName.of('Type'), PDFName.of('Action'));
      action.set(PDFName.of('S'), PDFName.of('URI'));
      action.set(PDFName.of('URI'), PDFString.of(address));
      annotation.set(PDFName.of('A'), action);
    }
    page.node.addAnnot(context.register(annotation));
  }

  async function drawTextObject(doc, page, object, fontCache) {
    if (!standardFonts[object.fontFamily]) {
      const pngBytes = await rasterizeText(object);
      const raster = await doc.embedPng(pngBytes);
      page.drawImage(raster, { x: object.x, y: object.y, width: Math.max(object.width, object.fontSize), height: Math.max(object.height, object.fontSize * 1.2) });
      return;
    }
    const name = standardFonts[object.fontFamily][object.fontStyle] || standardFonts.Helvetica[object.fontStyle] || 'Helvetica';
    const fontKey = `font:${name}`;
    let font = fontCache.get(fontKey);
    if (!font) {
      font = await doc.embedFont(window.PDFLib.StandardFonts[name]);
      fontCache.set(fontKey, font);
    }
    const options = {
      x: object.x,
      y: object.y + (object.baselineOffset || object.fontSize * 0.22),
      size: object.fontSize,
      font,
      color: pdfRgb(object.color || '#111111'),
      lineHeight: object.fontSize * 1.2,
      maxWidth: Math.max(object.width, object.fontSize)
    };
    try {
      page.drawText(object.text || '', options);
    } catch (error) {
      // Standard PDF fonts cannot encode all scripts. Rasterize only the added/replacement text
      // through the browser's shaping engine (useful for Hindi and other Unicode text).
      const pngBytes = await rasterizeText(object);
      const image = await doc.embedPng(pngBytes);
      page.drawImage(image, {
        x: object.x, y: object.y,
        width: Math.max(object.width, object.fontSize), height: Math.max(object.height, object.fontSize * 1.2)
      });
      console.info('Text rendered as a high-resolution image because the selected PDF font cannot encode one or more characters.', error);
    }
  }

  async function rasterizeText(object) {
    const scale = 4;
    const width = Math.max(1, Math.ceil(Math.max(object.width, object.fontSize) * scale));
    const height = Math.max(1, Math.ceil(Math.max(object.height, object.fontSize * 1.2) * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, width, height);
    const family = cssFontFamily(object.fontFamily);
    const weight = object.fontStyle === 'bold' || object.fontStyle === 'boldItalic' ? 'bold ' : '';
    const italic = object.fontStyle === 'italic' || object.fontStyle === 'boldItalic' ? 'italic ' : '';
    const fontPx = object.fontSize * scale;
    context.font = `${italic}${weight}${fontPx}px ${family}`;
    context.fillStyle = object.color || '#111111';
    context.textBaseline = 'alphabetic';
    const lines = String(object.text || '').split('\n');
    lines.forEach((line, index) => context.fillText(line, 0, fontPx * 0.96 + index * fontPx * 1.2, width));
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Could not render Unicode text for export.');
    return new Uint8Array(await blob.arrayBuffer());
  }

  function downloadFallback(bytes, fileName) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function updateSelectionLabel() {
    const label = $('pdfEditorSelectionLabel');
    if (!label) return;
    const object = selectedObject();
    if (object) {
      const names = { text: 'Text selected', replaceText: 'Replacement selected', image: 'Image selected', signature: 'Signature selected', cover: 'Cover selected', shape: 'Shape selected', annotation: 'Annotation selected', freehand: 'Freehand mark selected', link: 'Link selected', formField: 'Form field selected', stamp: 'Stamp selected', pageDelete: 'Page marked for deletion' };
      label.textContent = names[object.type] || 'Item selected';
    } else if (state.pdf) {
      label.textContent = `${state.objects.filter((item) => item.pageIndex === state.pageIndex).length} edit${state.objects.filter((item) => item.pageIndex === state.pageIndex).length === 1 ? '' : 's'} on this page`;
    } else {
      label.textContent = 'Select a tool to begin';
    }
    updateUndoRedoButtons();
  }

  function updatePageCountLabel() {
    const count = $('pdfEditorPageCount');
    if (count) count.textContent = state.pageCount ? `/ ${state.pageCount}` : '/ —';
  }

  function measureTextWidthPt(text, controls) {
    const canvas = measureTextWidthPt.canvas || (measureTextWidthPt.canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    const scale = Math.max(state.pageScale || 1, 0.5);
    const cssSize = controls.fontSize * scale;
    const weight = controls.fontStyle === 'bold' || controls.fontStyle === 'boldItalic' ? '700 ' : '';
    const italic = controls.fontStyle === 'italic' || controls.fontStyle === 'boldItalic' ? 'italic ' : '';
    context.font = `${italic}${weight}${cssSize}px ${cssFontFamily(controls.fontFamily)}`;
    const max = String(text || ' ').split('\n').reduce((value, line) => Math.max(value, context.measureText(line).width), 0);
    return Math.max(12, max / scale + 2);
  }

  function cssFontFamily(family) {
    const cssFamilies = {
      TimesRoman: '"Times New Roman", serif',
      Courier: '"Courier New", monospace',
      Georgia: 'Georgia, serif',
      Verdana: 'Verdana, sans-serif',
      'Trebuchet MS': '"Trebuchet MS", sans-serif',
      Inter: 'Inter, Arial, sans-serif',
      Roboto: 'Roboto, Arial, sans-serif',
      'Open Sans': '"Open Sans", Arial, sans-serif',
      Lato: 'Lato, Arial, sans-serif',
      Poppins: 'Poppins, Arial, sans-serif',
      'Noto Sans': '"Noto Sans", "Noto Sans Devanagari", Arial, sans-serif',
      Helvetica: 'Arial, Helvetica, "Noto Sans Devanagari", sans-serif'
    };
    return cssFamilies[family] || 'Arial, "Noto Sans Devanagari", sans-serif';
  }

  function pdfRgb(hex) {
    const value = /^#[0-9a-f]{6}$/i.test(hex || '') ? hex : '#ffffff';
    return window.PDFLib.rgb(
      parseInt(value.slice(1, 3), 16) / 255,
      parseInt(value.slice(3, 5), 16) / 255,
      parseInt(value.slice(5, 7), 16) / 255
    );
  }

  function createId() {
    return `edit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
  }

  function showMessage(message) {
    const hint = $('pdfEditorHint');
    if (hint) hint.textContent = message;
  }

  function showError(message) {
    if (window.showStatus) window.showStatus(message, 'error');
    else showMessage(message);
  }

  function setProgress(text, percent) {
    if (window.showProgress) window.showProgress(text, percent);
  }

  function hideStatus() {
    if (window.hideStatus) window.hideStatus();
  }

  function hideProgress() {
    if (window.hideProgress) window.hideProgress();
  }

  window.PdfEditor = {
    mountToolbar,
    loadFile,
    exportPdf,
    reset
  };
})();
