(() => {
  const $ = (id) => document.getElementById(id);
  const els = {
    form: $('fetch-form'), input: $('website-url'), urlField: $('url-field'), formError: $('form-error'),
    submit: $('submit-button'), sample: $('try-example'), streamSample: $('try-stream-example'),
    results: $('results'), resultsHeading: $('results-heading'), resultsSubheading: $('results-subheading'),
    address: $('browser-address'), status: $('browser-status'), count: $('result-count'),
    list: $('video-list'), player: $('video-player'), stage: $('preview-stage'), placeholder: $('stage-placeholder'),
    previewStart: $('preview-start'), snapshot: $('page-snapshot'), videoTab: $('video-tab'),
    pageTab: $('page-tab'), qualityControl: $('quality-control'), qualitySelect: $('quality-select'),
    footerTitle: $('preview-footer-title'), footerSubtitle: $('preview-footer-subtitle'),
    previewQuality: $('preview-quality'), download: $('preview-download'),
    playerTools: $('player-tools'), playerQuality: $('player-quality'), playerQualityLabel: $('player-quality-label'),
    fullscreen: $('player-fullscreen'), more: $('player-more'), playerMenu: $('player-menu'),
    menuPip: $('player-menu-pip'), menuFullscreen: $('player-menu-fullscreen'),
    menuFullscreenLabel: $('player-menu-fullscreen-label'), menuDownload: $('player-menu-download'), menuQuality: $('player-menu-quality'),
    tip: $('results-tip'), deeper: $('deep-scan-button'),
    reset: $('reset-button'), sort: $('sort-select'), toast: $('toast'), menu: $('menu-toggle'), nav: $('primary-nav'),
    dialog: $('quality-dialog'), dialogTitle: $('quality-dialog-title'), dialogDescription: $('quality-dialog-description'),
    dialogNote: $('quality-dialog-note'), qualityOptions: $('quality-options'), dialogConfirm: $('quality-dialog-confirm'),
    dialogCancel: $('quality-dialog-cancel'), dialogClose: $('quality-dialog-close'),
  };
  const state = {
    url: '', videos: [], selectedId: null, selectedVariantId: null, previewReady: false,
    filter: 'all', scanning: false, screenshot: null, view: 'video', controller: null,
    sequence: 0, progressTimer: null, toastTimer: null,
    pendingAction: null, pendingVideoId: null, dialogTrigger: null,
  };
  const SAMPLE_MP4 = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  const SAMPLE_HLS = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  const icon = (name, extra = '') => `<svg class="icon ${extra}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const safeId = (id) => encodeURIComponent(id);
  const prettySize = (value) => {
    if (!value || !Number.isFinite(Number(value))) return 'Size unavailable';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = Number(value), i = 0;
    while (size >= 1000 && i < units.length - 1) { size /= 1000; i += 1; }
    return `${size >= 100 || i === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[i]}`;
  };
  // Decimal megabytes match the source's Content-Length: 1 MB = 1,000,000 bytes.
  const qualitySize = (variant) => !variant?.size ? 'Size unavailable'
    : `${variant.sizeEstimated ? '≈ ' : ''}${(Number(variant.size) / 1_000_000).toFixed(1)} MB`;
  const shortHost = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };
  const currentVideo = () => state.videos.find((video) => video.id === state.selectedId);
  const currentVariant = (video = currentVideo()) => video?.variants.find((item) => item.id === state.selectedVariantId) || video?.variants.at(-1);

  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => els.toast.classList.remove('show'), 3800);
  }
  function showFormError(message) {
    els.formError.textContent = message;
    els.formError.hidden = !message;
    els.urlField.classList.toggle('invalid', !!message);
  }
  function normalizeInput(raw) {
    let value = raw.trim();
    if (!value) throw new Error('Please paste a website or video URL first.');
    if (!/^[a-z][a-z\d+.-]*:\/\//i.test(value)) value = `https://${value}`;
    let url;
    try { url = new URL(value); } catch { throw new Error('Please enter a valid website URL.'); }
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS links are supported.');
    return url.toString();
  }
  function showAddress(url) {
    els.address.querySelector('span').textContent = url || 'Waiting for a URL';
    els.address.title = url || '';
  }
  function updateStatus(label, kind) {
    els.status.innerHTML = '<span class="status-dot"></span>' + escapeHtml(label);
    els.status.className = `browser-status ${kind || ''}`.trim();
  }
  function closePlayerMenu() {
    els.playerMenu.hidden = true;
    els.more.setAttribute('aria-expanded', 'false');
  }
  function isFullView() {
    return document.fullscreenElement === els.stage || els.stage.classList.contains('pseudo-fullscreen');
  }
  function updateFullViewButton() {
    const expanded = isFullView();
    els.fullscreen.setAttribute('aria-label', expanded ? 'Exit full view' : 'Full view');
    els.fullscreen.title = expanded ? 'Exit full view' : 'Full view';
    els.fullscreen.innerHTML = icon(expanded ? 'shrink' : 'expand');
    els.menuFullscreenLabel.textContent = expanded ? 'Exit full view' : 'Full view';
    els.menuFullscreen.querySelector('use').setAttribute('href', expanded ? '#i-shrink' : '#i-expand');
  }
  async function exitFullView() {
    if (document.fullscreenElement === els.stage) await document.exitFullscreen().catch(() => {});
    els.stage.classList.remove('pseudo-fullscreen');
    document.body.classList.remove('player-fullview');
    updateFullViewButton();
  }
  async function toggleFullView() {
    closePlayerMenu();
    if (isFullView()) { await exitFullView(); return; }
    try {
      if (!els.stage.requestFullscreen) throw new Error('Fullscreen unavailable');
      await els.stage.requestFullscreen();
    } catch {
      // Embedded previews may disallow the Fullscreen API. Keep a full-window
      // player within the preview frame as a usable fallback.
      els.stage.classList.add('pseudo-fullscreen');
      document.body.classList.add('player-fullview');
    }
    updateFullViewButton();
  }
  async function togglePictureInPicture() {
    closePlayerMenu();
    if (!state.previewReady || els.player.hidden) {
      toast('Preview the video first, then use Picture-in-Picture.');
      return;
    }
    if (isFullView()) await exitFullView();
    if (!document.pictureInPictureEnabled || !els.player.requestPictureInPicture) {
      toast('Picture-in-Picture is not available in this browser.');
      return;
    }
    try {
      if (document.pictureInPictureElement === els.player) await document.exitPictureInPicture();
      else await els.player.requestPictureInPicture();
    } catch { toast('Picture-in-Picture is unavailable in this embedded preview.'); }
  }
  function clearPlayer() {
    if (document.pictureInPictureElement === els.player) document.exitPictureInPicture().catch(() => {});
    els.player.pause();
    els.player.removeAttribute('src');
    els.player.dataset.videoId = '';
    els.player.load();
    els.player.hidden = true;
  }
  function setPlaceholder(title, description, loading = false) {
    clearPlayer();
    closePlayerMenu();
    els.playerTools.hidden = !state.selectedId;
    els.previewQuality.hidden = !state.selectedId;
    els.snapshot.hidden = true;
    els.placeholder.hidden = false;
    const heading = els.placeholder.querySelector('h3');
    const details = els.placeholder.querySelector('p');
    heading.textContent = title;
    heading.hidden = !title;
    details.textContent = description;
    details.hidden = !description;
    const readyToPlay = Boolean(state.selectedId) && !loading && !title && !description;
    els.placeholder.querySelector('.stage-visual').hidden = readyToPlay;
    els.placeholder.classList.toggle('ready-to-play', readyToPlay);
    els.placeholder.querySelector('.progress-track').hidden = !loading;
    els.previewStart.hidden = true;
    els.download.hidden = true;
    els.footerTitle.textContent = title;
    els.footerSubtitle.textContent = description;
  }
  function loadingState(url, deep = false) {
    closeQualityDialog();
    if (isFullView()) exitFullView().catch(() => {});
    state.scanning = true;
    state.videos = [];
    state.selectedId = null;
    state.selectedVariantId = null;
    state.previewReady = false;
    state.screenshot = null;
    state.view = 'video';
    state.filter = 'all';
    document.querySelectorAll('.filter-pill').forEach((pill) => pill.classList.toggle('active', pill.dataset.kind === 'all'));
    els.qualityControl.hidden = true;
    els.videoTab.classList.add('active');
    els.videoTab.setAttribute('aria-pressed', 'true');
    els.pageTab.classList.remove('active');
    els.pageTab.setAttribute('aria-pressed', 'false');
    els.pageTab.hidden = true;
    els.submit.disabled = true;
    els.submit.classList.add('loading');
    els.submit.querySelector('span').textContent = 'Fetching...';
    els.results.hidden = false;
    els.tip.hidden = true;
    els.count.textContent = '0';
    els.resultsHeading.textContent = deep ? 'Taking a closer look...' : 'Finding your videos...';
    els.resultsSubheading.textContent = 'Searching for complete MP4s and HLS/DASH playlists.';
    els.list.innerHTML = `<div class="sidebar-empty">${icon('video')}<span>Scanning for videos...</span></div>`;
    setPlaceholder('Looking for video streams', 'Checking video links, playlists and available qualities. This can take a few seconds.', true);
    showAddress(url);
    updateStatus('Scanning', '');
    const messages = [
      'Connecting to the website...', 'Looking for full video playlists...',
      'Checking available source qualities...', 'Inspecting JavaScript-loaded media...',
      'Finishing stream detection...',
    ];
    let index = 0;
    clearInterval(state.progressTimer);
    state.progressTimer = setInterval(() => {
      if (!state.scanning) return;
      index = Math.min(index + 1, messages.length - 1);
      els.resultsSubheading.textContent = messages[index];
    }, 3700);
    setTimeout(() => els.results.scrollIntoView({ behavior: 'smooth', block: 'start' }), 130);
  }
  function finishLoading() {
    state.scanning = false;
    clearInterval(state.progressTimer);
    els.submit.disabled = false;
    els.submit.classList.remove('loading');
    els.submit.querySelector('span').textContent = 'Fetch Videos';
  }
  function sortedVideos() {
    const copy = state.videos.filter((video) => state.filter === 'all' || video.kind === state.filter);
    if (els.sort.value === 'size') copy.sort((a, b) =>
      (b.size || Math.max(0, ...b.variants.map((item) => item.size || 0)))
      - (a.size || Math.max(0, ...a.variants.map((item) => item.size || 0))));
    if (els.sort.value === 'name') copy.sort((a, b) => a.title.localeCompare(b.title));
    return copy;
  }
  function renderVideos() {
    const entries = sortedVideos();
    if (!entries.length) {
      els.list.innerHTML = `<div class="sidebar-empty">${icon('video')}<span>${state.videos.length ? 'No videos match this format.' : 'No supported public video found.'}</span></div>`;
      return;
    }
    els.list.innerHTML = '';
    for (const video of entries) {
      const variant = video.id === state.selectedId ? currentVariant(video) : video.variants.at(-1);
      const options = video.variants.map((item) => `${item.quality} (${qualitySize(item)})`).join(' · ');
      const sourceNote = `${video.merged ? '<br>Segments are joined into one MP4 with audio.' : ''}${video.variants.length === 1 ? '<br>Only one source quality found; other resolutions are not available.' : ''}`;
      const format = video.merged ? `${video.kind.toUpperCase()} → MP4` : 'MP4';
      const card = document.createElement('div');
      card.className = `video-item${video.id === state.selectedId ? ' selected' : ''}`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Select ${video.title}`);
      card.innerHTML = `<div class="video-badges"><span class="video-badge ${video.merged ? `format-${escapeHtml(video.kind)}` : ''}">${escapeHtml(format)}</span><span class="video-badge quality">${video.variants.length > 1 ? `${video.variants.length} qualities` : escapeHtml(variant.quality)}</span>${variant.size ? `<span class="video-badge size">${variant.sizeEstimated ? '≈ ' : ''}${escapeHtml(prettySize(variant.size))}</span>` : ''}</div><div class="video-card-body"><span class="video-thumb">${icon('play', 'icon-fill')}</span><span class="video-meta"><strong title="${escapeHtml(video.title)}">${escapeHtml(video.title)}</strong><span>${escapeHtml(video.domain || shortHost(video.url))} · ${escapeHtml(video.source)}</span></span></div><div class="video-variant-note"><strong>Available:</strong> ${escapeHtml(options)}${sourceNote}</div><div class="video-card-actions"><button class="video-action play-action" type="button">${icon('eye')} Preview</button>${video.merged ? '' : `<button class="video-action copy-action" type="button">${icon('copy')} Copy link</button>`}<a class="video-action primary download-action" href="/api/download/${safeId(variant.id)}">${icon('download')} Save MP4</a></div>`;
      const select = () => { if (state.selectedId !== video.id) selectVideo(video.id); };
      card.addEventListener('click', (event) => { if (!event.target.closest('a,button')) select(); });
      card.addEventListener('keydown', (event) => { if ((event.key === 'Enter' || event.key === ' ') && event.target === card) { event.preventDefault(); select(); } });
      card.querySelector('.play-action').addEventListener('click', (event) => {
        select(); openQualityDialog('preview', video.id, event.currentTarget);
      });
      card.querySelector('.copy-action')?.addEventListener('click', () => copyUrl(video.url));
      card.querySelector('.download-action').addEventListener('click', (event) => {
        event.preventDefault();
        select(); openQualityDialog('download', video.id, event.currentTarget);
      });
      els.list.append(card);
    }
  }
  function setView(view) {
    if (view === 'page' && !state.screenshot) return;
    state.view = view;
    els.videoTab.classList.toggle('active', view === 'video');
    els.pageTab.classList.toggle('active', view === 'page');
    els.videoTab.setAttribute('aria-pressed', String(view === 'video'));
    els.pageTab.setAttribute('aria-pressed', String(view === 'page'));
    els.playerTools.hidden = view !== 'video' || !state.selectedId;
    if (view === 'page') {
      closePlayerMenu();
      els.player.pause();
      els.player.hidden = true;
      els.placeholder.hidden = true;
      els.snapshot.src = state.screenshot;
      els.snapshot.hidden = false;
    } else if (state.selectedId && state.previewReady) {
      els.snapshot.hidden = true;
      els.placeholder.hidden = true;
      els.player.hidden = false;
    } else {
      els.snapshot.hidden = true;
      els.player.hidden = true;
      els.placeholder.hidden = false;
    }
  }
  function updateSelectedVariant() {
    const video = currentVideo();
    const variant = currentVariant(video);
    if (!video || !variant) return;
    els.qualitySelect.value = variant.id;
    els.playerQualityLabel.textContent = variant.quality;
    els.playerQuality.setAttribute('aria-label', `Choose quality, current ${variant.quality}`);
    state.previewReady = false;
    // The selected quality and MB size are already visible above and below
    // the player. Keep the stage uncluttered until the user presses Play.
    setPlaceholder('', '');
    els.previewStart.hidden = false;
    els.previewStart.innerHTML = `${icon('play', 'icon-fill')} Play video`;
    els.footerTitle.textContent = video.title;
    els.footerSubtitle.textContent = `${variant.quality} · ${qualitySize(variant)} · ${video.domain || shortHost(video.url)}`;
    els.download.href = `/api/download/${safeId(variant.id)}`;
    els.download.hidden = false;
    setView('video');
    renderVideos();
  }
  function selectVideo(id) {
    const video = state.videos.find((item) => item.id === id);
    if (!video) return;
    if (state.selectedId !== id) state.selectedVariantId = video.variants.at(-1).id;
    state.selectedId = id;
    els.qualityControl.hidden = false;
    els.qualitySelect.replaceChildren(...video.variants.map((variant) => new Option(`${variant.quality} · ${qualitySize(variant)}`, variant.id)));
    updateSelectedVariant();
  }
  function selectVariant(id) {
    const video = currentVideo();
    if (!video || !video.variants.some((variant) => variant.id === id)) return;
    state.selectedVariantId = id;
    updateSelectedVariant();
  }
  function playSelected() {
    const variant = currentVariant();
    if (!variant) return;
    if (els.player.dataset.videoId !== variant.id) {
      els.player.src = `/api/video/${safeId(variant.id)}`;
      els.player.dataset.videoId = variant.id;
      els.player.load();
    }
    state.previewReady = true;
    setView('video');
    els.player.play().catch(() => {});
    if (currentVideo()?.merged) toast('Preparing merged preview. Seeking may be limited; the download is one complete MP4.');
  }
  function closeQualityDialog() {
    if (els.dialog.hidden) return;
    els.dialog.hidden = true;
    document.body.classList.remove('picker-open');
    const trigger = state.dialogTrigger;
    state.pendingAction = null;
    state.pendingVideoId = null;
    state.dialogTrigger = null;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    else if (!els.qualityControl.hidden) els.qualitySelect.focus({ preventScroll: true });
  }
  function updateDialogConfirm() {
    const video = state.videos.find((item) => item.id === state.pendingVideoId);
    const chosen = els.qualityOptions.querySelector('input[name="picker-quality"]:checked');
    const variant = video?.variants.find((item) => item.id === chosen?.value);
    if (!variant) { els.dialogConfirm.disabled = true; return; }
    els.dialogConfirm.disabled = false;
    const isDownload = state.pendingAction === 'download';
    els.dialogConfirm.innerHTML = `${icon(isDownload ? 'download' : 'play', isDownload ? '' : 'icon-fill')} ${isDownload ? 'Download' : 'Play'} ${escapeHtml(variant.quality)} · ${escapeHtml(qualitySize(variant))}`;
  }
  function openQualityDialog(action, videoId, trigger) {
    const video = state.videos.find((item) => item.id === videoId);
    if (!video) return;
    if (state.selectedId !== video.id) selectVideo(video.id);
    state.pendingAction = action;
    state.pendingVideoId = video.id;
    state.dialogTrigger = trigger || null;
    els.dialogTitle.textContent = action === 'download' ? 'Choose download quality' : 'Choose preview quality';
    els.dialogDescription.textContent = `${video.title} · ${video.domain || shortHost(video.url)}. Choose one of the actual source qualities.`;
    els.qualityOptions.innerHTML = video.variants.map((variant) => {
      const resolution = variant.width && variant.height ? `${variant.width} × ${variant.height}` : 'Source-provided quality';
      const sizeKind = variant.size ? (variant.sizeEstimated ? 'Estimated size' : 'Exact file size') : 'Size not reported';
      const checked = variant.id === state.selectedVariantId ? ' checked' : '';
      return `<label class="quality-option"><input type="radio" name="picker-quality" value="${escapeHtml(variant.id)}"${checked}><span class="quality-option-main"><strong>${escapeHtml(variant.quality)}</strong><small>${escapeHtml(resolution)}</small></span><span class="quality-option-size">${escapeHtml(qualitySize(variant))}<small>${escapeHtml(sizeKind)}</small></span></label>`;
    }).join('');
    els.dialogNote.textContent = video.variants.length === 1
      ? `This source offers only ${video.variants[0].quality}; unavailable higher resolutions cannot be created without upscaling.`
      : video.variants.some((variant) => variant.sizeEstimated)
        ? '≈ MB is estimated from the source bitrate and duration. The finished MP4 can differ in size.'
        : 'MP4 sizes come from the video host. Unreported stream sizes are marked unavailable.';
    els.dialog.hidden = false;
    document.body.classList.add('picker-open');
    updateDialogConfirm();
    (els.qualityOptions.querySelector('input:checked') || els.dialogClose).focus({ preventScroll: true });
  }
  function confirmQualityChoice() {
    const video = state.videos.find((item) => item.id === state.pendingVideoId);
    const selected = els.qualityOptions.querySelector('input[name="picker-quality"]:checked');
    const variant = video?.variants.find((item) => item.id === selected?.value);
    if (!video || !variant) return;
    const action = state.pendingAction;
    closeQualityDialog();
    if (state.selectedId !== video.id) selectVideo(video.id);
    if (state.selectedVariantId !== variant.id) selectVariant(variant.id);
    if (action === 'preview') {
      playSelected();
    } else if (action === 'download') {
      const link = document.createElement('a');
      link.href = `/api/download/${safeId(variant.id)}`;
      link.hidden = true;
      document.body.append(link);
      link.click();
      link.remove();
      toast(video.merged ? `Preparing one complete ${variant.quality} MP4. Your download will start shortly.` : `${variant.quality} MP4 download started.`);
    }
  }
  async function copyUrl(url) {
    try { await navigator.clipboard.writeText(url); toast('MP4 link copied to clipboard.'); }
    catch {
      const field = document.createElement('textarea');
      field.value = url;
      field.style.position = 'fixed'; field.style.opacity = '0';
      document.body.append(field); field.select();
      const copied = document.execCommand('copy'); field.remove();
      toast(copied ? 'MP4 link copied to clipboard.' : 'Clipboard unavailable in this browser.');
    }
  }
  function showResults(data, deep) {
    state.videos = data.videos || [];
    state.screenshot = data.screenshot || null;
    els.pageTab.hidden = !state.screenshot;
    showAddress(data.pageUrl || state.url);
    els.count.textContent = String(state.videos.length);
    const count = state.videos.length;
    if (count) {
      els.resultsHeading.textContent = `Found ${count} ${count === 1 ? 'video' : 'videos'}`;
      const hasStream = state.videos.some((video) => video.merged);
      const onlyOneQuality = count === 1 && state.videos[0].variants.length === 1;
      els.resultsSubheading.textContent = hasStream
        ? 'Choose a source quality and estimated MB size before preview or download. Chunks become one MP4.'
        : onlyOneQuality
          ? `Only ${state.videos[0].variants[0].quality === 'Source' ? 'one source quality' : state.videos[0].variants[0].quality} is available here; higher qualities cannot be created from it.`
          : `Ready to preview and download from ${shortHost(data.pageUrl || state.url)}.`;
      updateStatus(`${count} found`, 'done');
      selectVideo(state.videos[0].id);
    } else {
      els.resultsHeading.textContent = 'No supported video found';
      els.resultsSubheading.textContent = data.browserUnavailable
        ? 'No direct link found. Browser-assisted scanning is unavailable here.'
        : 'We could not find a complete public MP4, HLS or DASH video at this URL.';
      updateStatus('No video found', 'done');
      setPlaceholder('No complete video detected', 'The page may require a login, use DRM, be live, or load its playlist after a special interaction.');
      renderVideos();
    }
    els.tip.hidden = deep;
    els.deeper.disabled = false;
    els.deeper.textContent = deep ? 'Scan completed' : 'Scan deeper';
    if (!deep) els.deeper.insertAdjacentHTML('beforeend', ` ${icon('arrow')}`);
  }
  function showScanFailure(message) {
    els.resultsHeading.textContent = 'Could not scan this URL';
    els.resultsSubheading.textContent = message;
    updateStatus('Scan failed', 'error');
    els.count.textContent = '0';
    els.list.innerHTML = `<div class="sidebar-empty">${icon('alert')}<span>Nothing to display yet.</span></div>`;
    setPlaceholder('Something went wrong', message);
    els.tip.hidden = true;
    showFormError(message);
    toast(message);
  }
  async function runScan(deep = false) {
    let url;
    try { url = normalizeInput(els.input.value); }
    catch (error) { showFormError(error.message); els.input.focus(); return; }
    showFormError('');
    els.input.value = url;
    state.url = url;
    state.controller?.abort();
    state.controller = new AbortController();
    const thisSequence = ++state.sequence;
    loadingState(url, deep);
    try {
      const response = await fetch('/api/scan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, deep }), signal: state.controller.signal,
      });
      let data;
      try { data = await response.json(); } catch { throw new Error('The server sent an unexpected response.'); }
      if (!response.ok) throw new Error(data.error || 'Unable to scan this webpage.');
      if (state.sequence !== thisSequence) return;
      finishLoading();
      showResults(data, deep);
    } catch (error) {
      if (error.name === 'AbortError' || state.sequence !== thisSequence) return;
      finishLoading();
      showScanFailure(error.message || 'Please try again.');
    }
  }

  els.form.addEventListener('submit', (event) => { event.preventDefault(); if (!state.scanning) runScan(); });
  els.input.addEventListener('input', () => { if (!els.formError.hidden) showFormError(''); });
  els.sample.addEventListener('click', () => { els.input.value = SAMPLE_MP4; runScan(); });
  els.streamSample.addEventListener('click', () => { els.input.value = SAMPLE_HLS; runScan(); });
  els.deeper.addEventListener('click', () => { if (!state.scanning) runScan(true); });
  els.sort.addEventListener('change', renderVideos);
  document.querySelectorAll('.filter-pill').forEach((button) => button.addEventListener('click', () => {
    state.filter = button.dataset.kind || 'all';
    document.querySelectorAll('.filter-pill').forEach((pill) => pill.classList.toggle('active', pill === button));
    renderVideos();
  }));
  els.qualitySelect.addEventListener('change', () => selectVariant(els.qualitySelect.value));
  els.previewStart.addEventListener('click', (event) => openQualityDialog('preview', state.selectedId, event.currentTarget));
  els.previewQuality.addEventListener('click', (event) => openQualityDialog('preview', state.selectedId, event.currentTarget));
  els.playerQuality.addEventListener('click', async () => {
    if (isFullView()) await exitFullView();
    openQualityDialog('preview', state.selectedId, els.previewQuality);
  });
  els.fullscreen.addEventListener('click', toggleFullView);
  els.menuFullscreen.addEventListener('click', toggleFullView);
  els.menuPip.addEventListener('click', togglePictureInPicture);
  els.more.addEventListener('click', () => {
    const open = els.playerMenu.hidden;
    els.playerMenu.hidden = !open;
    els.more.setAttribute('aria-expanded', String(open));
    if (open) els.menuDownload.focus({ preventScroll: true });
  });
  els.menuDownload.addEventListener('click', async () => {
    closePlayerMenu();
    if (isFullView()) await exitFullView();
    openQualityDialog('download', state.selectedId, els.download);
  });
  els.menuQuality.addEventListener('click', async () => {
    closePlayerMenu();
    if (isFullView()) await exitFullView();
    openQualityDialog('preview', state.selectedId, els.previewQuality);
  });
  document.addEventListener('click', (event) => {
    if (!els.playerTools.contains(event.target) && !els.playerMenu.hidden) closePlayerMenu();
  });
  document.addEventListener('fullscreenchange', () => { closePlayerMenu(); updateFullViewButton(); });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !els.dialog.hidden) return;
    if (!els.playerMenu.hidden) { closePlayerMenu(); els.more.focus(); }
    else if (isFullView()) { event.preventDefault(); exitFullView().catch(() => {}); }
  });
  els.videoTab.addEventListener('click', () => setView('video'));
  els.pageTab.addEventListener('click', () => setView('page'));
  els.player.addEventListener('error', () => {
    if (state.selectedId && state.previewReady && !state.scanning) toast('Preview unavailable. Try downloading the complete MP4 instead.');
  });
  els.download.addEventListener('click', (event) => {
    event.preventDefault();
    openQualityDialog('download', state.selectedId, event.currentTarget);
  });
  els.qualityOptions.addEventListener('change', updateDialogConfirm);
  els.dialogConfirm.addEventListener('click', confirmQualityChoice);
  els.dialogCancel.addEventListener('click', closeQualityDialog);
  els.dialogClose.addEventListener('click', closeQualityDialog);
  els.dialog.addEventListener('click', (event) => { if (event.target === els.dialog) closeQualityDialog(); });
  document.addEventListener('keydown', (event) => {
    if (els.dialog.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeQualityDialog(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...els.dialog.querySelectorAll('button:not(:disabled),input:not(:disabled)')];
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  els.reset.addEventListener('click', () => {
    closeQualityDialog();
    closePlayerMenu();
    if (isFullView()) exitFullView().catch(() => {});
    state.controller?.abort();
    state.sequence += 1;
    finishLoading();
    state.videos = [];
    state.selectedId = null;
    state.selectedVariantId = null;
    state.previewReady = false;
    els.qualityControl.hidden = true;
    clearPlayer();
    els.results.hidden = true;
    els.input.value = '';
    showFormError('');
    document.getElementById('url-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => els.input.focus({ preventScroll: true }), 350);
  });
  els.menu.addEventListener('click', () => {
    const expanded = els.menu.getAttribute('aria-expanded') !== 'true';
    els.menu.setAttribute('aria-expanded', String(expanded));
    els.nav.classList.toggle('open', expanded);
  });
  els.nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    els.nav.classList.remove('open');
    els.menu.setAttribute('aria-expanded', 'false');
  }));
})();
