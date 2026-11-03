/**
 * ShadowTrace — Main Interactive UI Controller
 * Powers all 6 tools: Redirect Tracer, Bulk Checker, DNS Lookup,
 * Domain WHOIS/RDAP, Create Tiny URL (+ SVG QR), and HTTP Status Codes.
 */

import {
  detectServerEngine,
  traceUrl,
  performDnsLookup,
  performDomainCheck,
  createShortUrl
} from './engines.js';
import { HTTP_STATUS_CODES, getStatusCodeInfo } from './status-codes.js';
import { generateQrSvg } from './qr.js';
import { createRosePetalField } from './rose-petals.js';

const STORAGE_KEYS = {
  theme: 'shadowtrace_theme_v2',
  recentTraces: 'shadowtrace_recent_traces_v1',
  shortLinks: 'shadowtrace_short_links_v1',
  customWorker: 'shadowtrace_worker_url'
};

let lastTraceData = null;
let lastBulkResults = [];
let activeStatusCategory = 'all';

function escapeHtml(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 2600);
}

async function copyText(text, label = 'Copied to clipboard!') {
  try {
    await navigator.clipboard.writeText(text);
    showToast(label);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast(label);
  }
}

function statusClassFor(code) {
  const n = Number(code);
  if (n >= 100 && n < 200) return 'status-1xx';
  if (n >= 200 && n < 300) return 'status-2xx';
  if (n >= 300 && n < 400) return 'status-3xx';
  if (n >= 400 && n < 500) return 'status-4xx';
  return 'status-5xx';
}

function formatIsoDate(iso) {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

/* =========================================================================
   THEME MANAGEMENT (Night Neon Glass + Day Crystal Neon Glass Switcher)
   ========================================================================= */
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
  applyTheme(saved);

  const toggleBtn = document.getElementById('themeToggleBtn');
  const flipTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEYS.theme, next);
    showToast(next === 'dark' ? '🌙 Night Neon Glass Mode On' : '☀️ Day Crystal Glass Mode On');
  };

  toggleBtn.addEventListener('click', flipTheme);

  // Keyboard shortcut: Alt + T
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 't') {
      e.preventDefault();
      flipTheme();
    }
  });
}

function applyTheme(theme) {
  const normalized = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', normalized);
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-checked', normalized === 'dark' ? 'true' : 'false');
    toggleBtn.classList.toggle('mode-day', normalized === 'light');
    toggleBtn.classList.toggle('mode-night', normalized === 'dark');
  }
}

/* =========================================================================
   TAB NAVIGATION & URL HASH ROUTING (Works on GitHub Pages Subpaths!)
   ========================================================================= */
function switchTab(tabId, updateHash = true) {
  const validTabs = ['tracer', 'bulk', 'dns', 'domain', 'shortener', 'status-codes', 'docs'];
  const target = validTabs.includes(tabId) ? tabId : 'tracer';

  document.querySelectorAll('.nav-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === target);
  });
  document.querySelectorAll('.tool-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `panel-${target}`);
  });

  if (updateHash) {
    history.replaceState(null, '', `#${target}`);
  }
}

function initNavigation() {
  document.querySelectorAll('.nav-tab').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(link.dataset.navLink);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
  document.getElementById('brandHomeLink').addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('tracer');
  });
}

/* =========================================================================
   ENGINE DETECTION & STATUS INDICATOR
   ========================================================================= */
async function initEngineBadge() {
  const myUaOpt = document.getElementById('myBrowserUaOption');
  if (myUaOpt) {
    const shortUa = navigator.userAgent.slice(0, 62) + (navigator.userAgent.length > 62 ? '...' : '');
    myUaOpt.textContent = `My User-Agent — ${shortUa}`;
  }

  const savedWorker = localStorage.getItem(STORAGE_KEYS.customWorker) || '';
  if (savedWorker) {
    document.getElementById('customWorkerInput').value = savedWorker;
  }

  const hasServer = await detectServerEngine();
  updateEnginePillUI(hasServer);

  document.getElementById('engineStatusBtn').addEventListener('click', () => {
    switchTab('tracer');
    const advPanel = document.getElementById('advPanel');
    advPanel.classList.add('open');
    document.getElementById('engineSelect').focus();
  });
}

function updateEnginePillUI(hasServer, forcedMode = null) {
  const dot = document.getElementById('engineStatusDot');
  const label = document.getElementById('engineStatusLabel');
  if (forcedMode === 'browser' || (!hasServer && !forcedMode)) {
    dot.classList.remove('server');
    label.textContent = 'GitHub Pages Static Engine';
  } else if (forcedMode === 'custom') {
    dot.classList.add('server');
    label.textContent = 'Edge Worker Engine';
  } else {
    dot.classList.add('server');
    label.textContent = 'Deep Server Engine';
  }
}

/* =========================================================================
   STATUS CODE MODAL & CHEAT SHEET EXPLORER
   ========================================================================= */
function openStatusModal(code) {
  const info = getStatusCodeInfo(code);
  const modal = document.getElementById('statusModal');
  const badge = document.getElementById('statusModalBadge');
  badge.className = `status-badge ${statusClassFor(info.code)}`;
  badge.textContent = info.code || 'ERR';
  document.getElementById('statusModalTitle').textContent = info.title;
  document.getElementById('statusModalSummary').textContent = info.summary;
  document.getElementById('statusModalSeo').textContent = info.seoImpact;
  document.getElementById('statusModalTip').textContent = info.troubleshooting;
  modal.classList.add('open');
}

function initStatusCodesExplorer() {
  const modal = document.getElementById('statusModal');
  document.getElementById('closeStatusModalBtn').addEventListener('click', () => {
    modal.classList.remove('open');
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  const renderGrid = () => {
    const query = document.getElementById('statusSearchInput').value.trim().toLowerCase();
    const filtered = HTTP_STATUS_CODES.filter((item) => {
      const catMatch = activeStatusCategory === 'all' || item.category === activeStatusCategory;
      if (!catMatch) return false;
      if (!query) return true;
      return (
        String(item.code).includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.seoImpact.toLowerCase().includes(query)
      );
    });

    const grid = document.getElementById('statusCodesGrid');
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="surface-card" style="grid-column:1/-1;text-align:center;color:var(--text-secondary);">No HTTP status codes matched "${escapeHtml(query)}".</div>`;
      return;
    }

    grid.innerHTML = filtered
      .map(
        (c) => `
      <article class="info-card" style="display:flex;flex-direction:column;gap:0.55rem;cursor:pointer;" data-open-code="${c.code}">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
          <span class="status-badge ${statusClassFor(c.code)}">${c.code}</span>
          <span class="meta-pill">${escapeHtml(c.category.toUpperCase())}</span>
        </div>
        <h3 style="margin:0.1rem 0 0;">${escapeHtml(c.title)}</h3>
        <p>${escapeHtml(c.summary)}</p>
        <div style="margin-top:auto;padding-top:0.55rem;border-top:1px solid var(--border-subtle);font-size:0.78rem;color:var(--text-muted);">
          <strong style="color:var(--text-secondary);">SEO:</strong> ${escapeHtml(c.seoImpact)}
        </div>
      </article>`
      )
      .join('');

    grid.querySelectorAll('[data-open-code]').forEach((card) => {
      card.addEventListener('click', () => openStatusModal(card.dataset.openCode));
    });
  };

  document.querySelectorAll('#statusFilterPills .filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#statusFilterPills .filter-pill').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatusCategory = btn.dataset.cat;
      renderGrid();
    });
  });

  document.getElementById('statusSearchInput').addEventListener('input', renderGrid);
  renderGrid();
}

/* =========================================================================
   1. MAIN URL REDIRECT TRACER
   ========================================================================= */
function buildSharePermalink(targetUrl) {
  const base = window.location.href.split('#')[0];
  return `${base}#trace=${encodeURIComponent(targetUrl)}`;
}

function buildMarkdownReport(data) {
  const lines = [
    `### ShadowTrace Redirect Report`,
    `- **Requested URL:** \`${data.requestedUrl}\``,
    `- **Final Destination:** \`${data.finalUrl}\` (HTTP \`${data.finalStatus}\`)`,
    `- **Redirects:** ${data.redirectCount} (${data.totalHops} total hops in ${data.totalDurationMs} ms)`,
    `- **Traced At:** ${formatIsoDate(data.tracedAt)}`,
    ``,
    `| Hop | Status | Type | URL | IP | Time |`,
    `| --- | --- | --- | --- | --- | --- |`
  ];
  for (const h of data.hops) {
    lines.push(
      `| ${h.hop} | ${h.statusCode || 'ERR'} | ${h.redirectType || 'Final'} | \`${h.url}\` | ${h.ip || '-'} | ${h.timings?.totalMs ?? 0}ms |`
    );
  }
  return lines.join('\n');
}

function renderTraceResult(data) {
  lastTraceData = data;
  const container = document.getElementById('traceResultContainer');
  const finalHop = data.hops[data.hops.length - 1] || {};
  const finalTrack = finalHop.tracking || { params: [], cleanUrl: data.finalUrl };
  const shareUrl = buildSharePermalink(data.requestedUrl);

  const httpsLabel = data.upgradedToHttps
    ? '🔒 Upgraded HTTP → HTTPS'
    : data.finalUrl.startsWith('https:')
    ? '🔒 Encrypted HTTPS'
    : '⚠️ Unencrypted HTTP';

  const hopsHtml = data.hops
    .map((h, idx) => {
      const isLast = idx === data.hops.length - 1;
      const badgeClass =
        h.redirectType && /Meta|JavaScript/i.test(h.redirectType)
          ? 'status-meta'
          : statusClassFor(h.statusCode);
      const cookieCount = h.cookies ? h.cookies.length : 0;
      const hasTracker = h.tracking && h.tracking.isAffiliateOrTracker;
      const expandedDefault = idx === 0 || isLast ? 'expanded' : '';

      const connectorHtml = h.nextUrl
        ? `
        <div class="hop-connector">
          <span class="hop-connector-line"></span>
          <span>↳ ${escapeHtml(h.redirectType || 'Redirect')}</span>
        </div>`
        : '';

      const cookiesListHtml =
        cookieCount > 0
          ? `<div style="margin-top:0.75rem;">
              <div class="panel-title-row"><span>Cookies Set on This Hop (${cookieCount})</span></div>
              <div class="code-panel">${h.cookies
                .map(
                  (c) =>
                    `🍪 ${escapeHtml(c.name)} ${c.secure ? '[Secure]' : ''} ${c.httpOnly ? '[HttpOnly]' : ''}\n   ${escapeHtml(c.raw)}`
                )
                .join('\n')}</div>
            </div>`
          : '';

      return `
        <div class="hop-card ${isLast && h.statusCode >= 200 && h.statusCode < 400 ? 'final-hop' : ''} ${expandedDefault}" data-hop-card="${h.hop}">
          <div class="hop-header" data-toggle-hop="${h.hop}">
            <div class="hop-num">${h.hop}</div>
            <div>
              <button type="button" class="status-badge ${badgeClass}" data-status-info="${h.statusCode}" title="Click to learn about HTTP ${h.statusCode}">
                ${h.statusCode || 'ERR'}
              </button>
            </div>
            <div class="hop-url-col">
              <div class="hop-url-line">
                <span class="hop-url-text">${escapeHtml(h.url)}</span>
              </div>
              <div class="hop-pills">
                ${h.ip ? `<span class="meta-pill">IP: ${escapeHtml(h.ip)}</span>` : ''}
                ${h.tls && h.tls.protocol ? `<span class="meta-pill">🔒 ${escapeHtml(h.tls.protocol)}</span>` : ''}
                ${h.securityHeaders && h.securityHeaders.server ? `<span class="meta-pill">Server: ${escapeHtml(h.securityHeaders.server)}</span>` : ''}
                <span class="meta-pill">⏱ ${h.timings?.totalMs ?? 0} ms</span>
                ${cookieCount > 0 ? `<span class="meta-pill cookie" title="Sets ${cookieCount} cookie(s)">🍪 ${cookieCount} Cookie${cookieCount > 1 ? 's' : ''}</span>` : ''}
                ${hasTracker ? `<span class="meta-pill tracker">🎯 ${escapeHtml(h.tracking.network || `${h.tracking.params.length} Tracker Param(s)`)}</span>` : ''}
                ${h.pageTitle ? `<span class="meta-pill">📄 ${escapeHtml(h.pageTitle.slice(0, 52))}</span>` : ''}
              </div>
            </div>
            <div class="hop-right-col">
              <button type="button" class="mini-btn" data-copy-url="${escapeHtml(h.url)}" title="Copy URL without visiting">Copy URL</button>
              <a href="${escapeHtml(h.url)}" target="_blank" rel="nofollow noopener noreferrer" class="mini-btn" title="Open URL in new tab (use caution)" onclick="event.stopPropagation()">↗</a>
            </div>
          </div>

          <div class="hop-details">
            <div class="details-grid">
              <div>
                <div class="panel-title-row">
                  <span>Raw HTTP Response Headers</span>
                  <button type="button" class="mini-btn" data-copy-headers="${idx}">Copy Headers</button>
                </div>
                <div class="code-panel">${escapeHtml(h.rawResponseHeaders || 'No headers captured')}</div>
              </div>
              <div>
                <div class="panel-title-row"><span>Connection, Timing &amp; Security Metadata</span></div>
                <div class="kv-list">
                  <div class="kv-item"><span>Primary IP</span><strong>${escapeHtml(h.ip || 'Resolved by Edge')}</strong></div>
                  <div class="kv-item"><span>Scheme / Port</span><strong>${escapeHtml(h.scheme || 'HTTP')} : ${escapeHtml(h.port || '-')}</strong></div>
                  <div class="kv-item"><span>DNS / Connect</span><strong>${h.timings?.dnsMs ?? 0}ms / ${h.timings?.connectMs ?? 0}ms</strong></div>
                  <div class="kv-item"><span>TTFB / Total</span><strong>${h.timings?.ttfbMs ?? 0}ms / ${h.timings?.totalMs ?? 0}ms</strong></div>
                  <div class="kv-item"><span>HSTS Policy</span><strong>${escapeHtml(h.securityHeaders?.hsts ? 'Enabled' : 'Not Set')}</strong></div>
                  <div class="kv-item"><span>TLS Issuer</span><strong>${escapeHtml(h.tls?.issuer || (h.scheme === 'HTTPS' ? 'Verified TLS' : 'None'))}</strong></div>
                </div>
                ${cookiesListHtml}
              </div>
            </div>
          </div>
        </div>
        ${connectorHtml}
      `;
    })
    .join('');

  const isHealthyEnd =
    !data.loopDetected &&
    !data.maxHopsReached &&
    data.finalStatus >= 200 &&
    data.finalStatus < 400;

  const bannerMessage = data.loopDetected
    ? '⚠️ Redirect Loop Detected — This URL redirects back to an earlier hop in an infinite cycle!'
    : data.maxHopsReached
    ? '⚠️ Maximum Redirect Hops Reached — Chain exceeded safety limit.'
    : data.finalStatus >= 400 || data.finalStatus === 0
    ? `⚠️ Trace Ended with Error (${data.finalStatus || 'Connection Failed'}) — Broken destination or WAF block.`
    : '✓ Trace Complete — Final Destination Reached';

  const cleanUrlCardHtml =
    finalTrack.params && finalTrack.params.length > 0 && finalTrack.cleanUrl !== data.finalUrl
      ? `
      <div class="clean-url-box">
        <div>
          <div style="font-weight:700;font-size:0.86rem;color:var(--status-meta-fg);">
            🧹 Tracking / Affiliate Parameters Detected (${finalTrack.params.map((p) => escapeHtml(p.key)).join(', ')})
          </div>
          <div style="font-family:var(--font-mono);font-size:0.8rem;color:var(--text-primary);word-break:break-all;margin-top:0.2rem;">
            Clean URL: ${escapeHtml(finalTrack.cleanUrl)}
          </div>
        </div>
        <button type="button" class="secondary-btn" id="copyCleanUrlBtn">Copy Clean URL</button>
      </div>`
      : '';

  container.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Final HTTP Status</div>
        <div class="kpi-value">
          <span class="status-badge ${statusClassFor(data.finalStatus)}" data-status-info="${data.finalStatus}">
            ${data.finalStatus || 'ERR'}
          </span>
          <span style="font-size:0.9rem;font-weight:600;">${escapeHtml(getStatusCodeInfo(data.finalStatus).title)}</span>
        </div>
        <div class="kpi-sub">${escapeHtml(httpsLabel)}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Redirect Chain</div>
        <div class="kpi-value">${data.redirectCount} Redirect${data.redirectCount === 1 ? '' : 's'}</div>
        <div class="kpi-sub">${data.totalHops} total hop${data.totalHops === 1 ? '' : 's'} inspected</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Total Trace Time</div>
        <div class="kpi-value">${data.totalDurationMs} ms</div>
        <div class="kpi-sub">${escapeHtml(data.engine)}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Privacy &amp; Attribution</div>
        <div class="kpi-value">🍪 ${data.cookiesTotal || 0} &nbsp;·&nbsp; 🎯 ${data.affiliateHopsCount || 0}</div>
        <div class="kpi-sub">Cookies set · Tracker hops</div>
      </div>
    </div>

    <div class="trace-meta-bar">
      <div>
        <strong>Date Traced:</strong> ${escapeHtml(formatIsoDate(data.tracedAt))} &nbsp;|&nbsp;
        <strong>User-Agent:</strong> <code>${escapeHtml(data.userAgent.slice(0, 75))}${data.userAgent.length > 75 ? '...' : ''}</code>
      </div>
      <div style="display:flex;gap:0.45rem;">
        <button type="button" class="mini-btn" id="expandAllHopsBtn">Expand All</button>
        <button type="button" class="mini-btn" id="collapseAllHopsBtn">Collapse All</button>
        <button type="button" class="mini-btn" id="copyMarkdownReportBtn">Copy Markdown</button>
        <button type="button" class="mini-btn" id="downloadJsonReportBtn">Export JSON</button>
      </div>
    </div>

    <div class="hops-list">
      ${hopsHtml}
    </div>

    <div class="trace-complete-banner ${isHealthyEnd ? '' : 'warn'}">
      <span>${escapeHtml(bannerMessage)}</span>
      <span style="font-family:var(--font-mono);font-size:0.8rem;">Final: ${escapeHtml(data.finalUrl)}</span>
    </div>

    ${cleanUrlCardHtml}

    <div class="share-trace-card">
      <div>
        <div style="font-weight:700;font-size:0.88rem;margin-bottom:0.2rem;">🔗 Shareable Permalink of This Trace</div>
        <div class="share-url-mono">${escapeHtml(shareUrl)}</div>
      </div>
      <button type="button" class="secondary-btn" id="copyShareTraceBtn">Copy Trace Link</button>
    </div>

    <div class="disclaimer-box">
      <strong>NOTICE:</strong> Results may vary depending on the selected User-Agent and whether the remote server uses geo-routing or bot filtering (such as HTTP 403 challenges).
      <strong>Safety Warning:</strong> ShadowTrace reveals the destination path of links without executing third-party page scripts in your browser, but does not certify destination safety — exercise caution before opening unfamiliar links.
    </div>
  `;

  // Attach interactive listeners inside rendered trace
  container.querySelectorAll('[data-toggle-hop]').forEach((hdr) => {
    hdr.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      hdr.closest('.hop-card').classList.toggle('expanded');
    });
  });

  container.querySelectorAll('[data-status-info]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openStatusModal(btn.dataset.statusInfo);
    });
  });

  container.querySelectorAll('[data-copy-url]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyText(btn.dataset.copyUrl, 'Hop URL copied!');
    });
  });

  container.querySelectorAll('[data-copy-headers]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.copyHeaders);
      copyText(data.hops[idx]?.rawResponseHeaders || '', 'HTTP headers copied!');
    });
  });

  document.getElementById('expandAllHopsBtn').addEventListener('click', () => {
    container.querySelectorAll('.hop-card').forEach((c) => c.classList.add('expanded'));
  });
  document.getElementById('collapseAllHopsBtn').addEventListener('click', () => {
    container.querySelectorAll('.hop-card').forEach((c) => c.classList.remove('expanded'));
  });

  document.getElementById('copyShareTraceBtn').addEventListener('click', () => {
    copyText(shareUrl, 'Shareable trace permalink copied!');
  });

  document.getElementById('copyMarkdownReportBtn').addEventListener('click', () => {
    copyText(buildMarkdownReport(data), 'Markdown trace report copied!');
  });

  document.getElementById('downloadJsonReportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowtrace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const cleanBtn = document.getElementById('copyCleanUrlBtn');
  if (cleanBtn) {
    cleanBtn.addEventListener('click', () => {
      copyText(finalTrack.cleanUrl, 'Clean tracker-free URL copied!');
    });
  }
}

function saveToRecentTraces(data) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.recentTraces) || '[]');
    const entry = {
      requestedUrl: data.requestedUrl,
      finalUrl: data.finalUrl,
      finalStatus: data.finalStatus,
      redirectCount: data.redirectCount,
      tracedAt: data.tracedAt
    };
    const deduped = [entry, ...existing.filter((x) => x.requestedUrl !== entry.requestedUrl)].slice(0, 8);
    localStorage.setItem(STORAGE_KEYS.recentTraces, JSON.stringify(deduped));
    renderRecentTraces();
  } catch {
    // ignore storage quota errors
  }
}

function renderRecentTraces() {
  const section = document.getElementById('recentTracesSection');
  const tbody = document.getElementById('recentTracesBody');
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(STORAGE_KEYS.recentTraces) || '[]');
  } catch {
    list = [];
  }

  if (!list.length) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  tbody.innerHTML = list
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.requestedUrl)}</td>
        <td>${item.redirectCount} hop${item.redirectCount === 1 ? '' : 's'}</td>
        <td><span class="status-badge ${statusClassFor(item.finalStatus)}">${item.finalStatus || 'ERR'}</span></td>
        <td>${escapeHtml(item.finalUrl)}</td>
        <td><button type="button" class="mini-btn" data-retrace="${escapeHtml(item.requestedUrl)}">Re-Trace</button></td>
      </tr>`
    )
    .join('');

  tbody.querySelectorAll('[data-retrace]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('traceUrlInput').value = btn.dataset.retrace;
      executeMainTrace(btn.dataset.retrace);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

async function executeMainTrace(overrideUrl = null) {
  const input = document.getElementById('traceUrlInput');
  const rawUrl = (overrideUrl !== null ? overrideUrl : input.value).trim();
  const errBox = document.getElementById('traceErrorContainer');
  const submitBtn = document.getElementById('traceSubmitBtn');
  errBox.innerHTML = '';

  if (!rawUrl) {
    errBox.innerHTML = `<div class="error-banner">⚠️ Please provide a URL or shortened link to trace first.</div>`;
    return;
  }

  const uaSel = document.getElementById('uaSelect').value;
  let customUserAgent = '';
  if (uaSel === 'my_ua') {
    customUserAgent = navigator.userAgent;
  } else if (uaSel === 'custom') {
    customUserAgent = document.getElementById('customUaInput').value.trim();
  }

  const enginePreference = document.getElementById('engineSelect').value;
  const customWorkerUrl = document.getElementById('customWorkerInput').value.trim();
  if (customWorkerUrl) {
    localStorage.setItem(STORAGE_KEYS.customWorker, customWorkerUrl);
  }

  const maxHops = Number(document.getElementById('maxHopsSelect').value) || 15;
  const followClientRedirects = document.getElementById('followMetaCheckbox').checked;

  const originalHtml = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner"></span><span>Tracing...</span>`;

  try {
    const data = await traceUrl(rawUrl, {
      uaPreset: uaSel,
      customUserAgent,
      enginePreference,
      customWorkerUrl,
      maxHops,
      followClientRedirects
    });

    updateEnginePillUI(data.engineMode === 'server', data.engineMode === 'browser-static' ? 'browser' : null);
    renderTraceResult(data);
    saveToRecentTraces(data);
    history.replaceState(null, '', `#trace=${encodeURIComponent(data.requestedUrl)}`);
  } catch (err) {
    errBox.innerHTML = `<div class="error-banner">⚠️ ${escapeHtml(err.message || 'Unable to trace URL.')}</div>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHtml;
  }
}

function initMainTracer() {
  document.getElementById('traceForm').addEventListener('submit', (e) => {
    e.preventDefault();
    executeMainTrace();
  });

  document.getElementById('pasteUrlBtn').addEventListener('click', async () => {
    try {
      const txt = await navigator.clipboard.readText();
      if (txt) {
        document.getElementById('traceUrlInput').value = txt.trim();
        document.getElementById('traceUrlInput').focus();
      }
    } catch {
      showToast('Press Ctrl+V / Cmd+V to paste URL');
    }
  });

  document.getElementById('clearUrlBtn').addEventListener('click', () => {
    const inp = document.getElementById('traceUrlInput');
    inp.value = '';
    inp.focus();
  });

  document.querySelectorAll('[data-sample]').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.getElementById('traceUrlInput').value = chip.dataset.sample;
      executeMainTrace(chip.dataset.sample);
    });
  });

  document.getElementById('advToggleBtn').addEventListener('click', () => {
    document.getElementById('advPanel').classList.toggle('open');
  });

  document.getElementById('uaSelect').addEventListener('change', (e) => {
    document.getElementById('customUaWrap').style.display = e.target.value === 'custom' ? 'flex' : 'none';
  });

  document.getElementById('engineSelect').addEventListener('change', (e) => {
    document.getElementById('customWorkerWrap').style.display = e.target.value === 'custom' ? 'flex' : 'none';
  });

  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEYS.recentTraces);
    renderRecentTraces();
  });

  renderRecentTraces();
}

/* =========================================================================
   2. BULK URL REDIRECT CHECKER
   ========================================================================= */
function initBulkChecker() {
  document.getElementById('loadBulkSampleBtn').addEventListener('click', () => {
    document.getElementById('bulkUrlsInput').value = [
      'http://github.com',
      'https://is.gd/SzNOOZ',
      'http://google.com',
      'http://wikipedia.org'
    ].join('\n');
  });

  document.getElementById('bulkForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const lines = document
      .getElementById('bulkUrlsInput')
      .value.split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);

    const out = document.getElementById('bulkResultContainer');
    const btn = document.getElementById('bulkSubmitBtn');
    const csvBtn = document.getElementById('exportBulkCsvBtn');

    if (!lines.length) return;

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span><span>Auditing ${lines.length} URLs...</span>`;
    out.innerHTML = `<div class="surface-card" style="text-align:center;color:var(--text-secondary);">Tracing ${lines.length} URL(s)...</div>`;

    const results = [];
    for (const url of lines) {
      try {
        const r = await traceUrl(url, { enginePreference: document.getElementById('engineSelect').value });
        results.push(r);
      } catch (err) {
        results.push({
          requestedUrl: url,
          finalUrl: '-',
          finalStatus: 0,
          redirectCount: 0,
          totalDurationMs: 0,
          upgradedToHttps: false,
          error: err.message
        });
      }
    }

    lastBulkResults = results;
    csvBtn.style.display = 'inline-flex';
    btn.disabled = false;
    btn.textContent = 'Run Bulk Trace';

    out.innerHTML = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Input URL</th>
              <th>Redirects</th>
              <th>Final Status</th>
              <th>HTTPS</th>
              <th>Final Destination</th>
              <th>Inspect</th>
            </tr>
          </thead>
          <tbody>
            ${results
              .map(
                (r, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${escapeHtml(r.requestedUrl)}</td>
                <td>${r.redirectCount}</td>
                <td><span class="status-badge ${statusClassFor(r.finalStatus)}">${r.finalStatus || 'ERR'}</span></td>
                <td>${r.finalUrl.startsWith('https:') ? '🔒 HTTPS' : '⚠️ HTTP'}</td>
                <td>${escapeHtml(r.error ? r.error : r.finalUrl)}</td>
                <td><button type="button" class="mini-btn" data-inspect-single="${escapeHtml(r.requestedUrl)}">Deep View</button></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    out.querySelectorAll('[data-inspect-single]').forEach((b) => {
      b.addEventListener('click', () => {
        switchTab('tracer');
        document.getElementById('traceUrlInput').value = b.dataset.inspectSingle;
        executeMainTrace(b.dataset.inspectSingle);
      });
    });
  });

  document.getElementById('exportBulkCsvBtn').addEventListener('click', () => {
    if (!lastBulkResults.length) return;
    const header = ['Input URL', 'Redirects', 'Final Status', 'Final URL', 'Duration ms'];
    const rows = lastBulkResults.map((r) => [
      `"${String(r.requestedUrl).replace(/"/g, '""')}"`,
      r.redirectCount,
      r.finalStatus,
      `"${String(r.finalUrl).replace(/"/g, '""')}"`,
      r.totalDurationMs
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowtrace-bulk-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/* =========================================================================
   3. DNS LOOKUP TOOL
   ========================================================================= */
function initDnsTool() {
  const runDns = async () => {
    const domain = document.getElementById('dnsDomainInput').value.trim();
    const recordType = document.getElementById('dnsTypeSelect').value;
    const provider = document.getElementById('dnsProviderSelect').value;
    const out = document.getElementById('dnsResultContainer');
    const btn = document.getElementById('dnsSubmitBtn');

    if (!domain) return;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span>`;

    try {
      const res = await performDnsLookup(domain, recordType, provider);
      const digLines = res.records.map(
        (r) => `${r.name.padEnd(26)} ${String(r.ttl).padEnd(7)} IN  ${r.type.padEnd(6)} ${r.data}`
      );

      out.innerHTML = `
        <div class="trace-meta-bar">
          <div>
            <strong>Domain:</strong> <code>${escapeHtml(res.domain)}</code> &nbsp;|&nbsp;
            <strong>Resolver:</strong> ${provider === 'cloudflare' ? 'Cloudflare 1.1.1.1' : 'Google 8.8.8.8'} &nbsp;|&nbsp;
            <strong>DNSSEC:</strong> ${res.dnssecValidated ? '✅ Validated (AD)' : 'Standard'} &nbsp;|&nbsp;
            <strong>Time:</strong> ${res.elapsedMs} ms
          </div>
          <button type="button" class="mini-btn" id="copyDigBtn">Copy Zone Output</button>
        </div>

        ${
          res.records.length === 0
            ? `<div class="surface-card" style="text-align:center;color:var(--text-secondary);">No <strong>${escapeHtml(recordType)}</strong> records returned for <code>${escapeHtml(res.domain)}</code>.</div>`
            : `
            <div class="data-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Host Name</th>
                    <th>TTL</th>
                    <th>Record Data / Value</th>
                  </tr>
                </thead>
                <tbody>
                  ${res.records
                    .map(
                      (r) => `
                    <tr>
                      <td><span class="status-badge status-1xx">${escapeHtml(r.type)}</span></td>
                      <td>${escapeHtml(r.name)}</td>
                      <td>${r.ttl}s</td>
                      <td>${escapeHtml(r.data)}</td>
                    </tr>`
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
            <div style="margin-top:1rem;">
              <div class="panel-title-row"><span>dig-Style Raw Output</span></div>
              <div class="code-panel">${escapeHtml(digLines.join('\n'))}</div>
            </div>`
        }
      `;

      const copyDig = document.getElementById('copyDigBtn');
      if (copyDig) {
        copyDig.addEventListener('click', () => copyText(digLines.join('\n'), 'DNS records copied!'));
      }
    } catch (err) {
      out.innerHTML = `<div class="error-banner">⚠️ ${escapeHtml(err.message)}</div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Check DNS';
    }
  };

  document.getElementById('dnsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    runDns();
  });

  document.querySelectorAll('[data-dns-sample]').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.getElementById('dnsDomainInput').value = chip.dataset.dnsSample;
      document.getElementById('dnsTypeSelect').value = chip.dataset.dnsType;
      runDns();
    });
  });
}

/* =========================================================================
   4. DOMAIN WHOIS / RDAP EXPIRY CHECKER
   ========================================================================= */
function initDomainTool() {
  const runDomain = async () => {
    const raw = document.getElementById('domainCheckInput').value.trim();
    const out = document.getElementById('domainResultContainer');
    const btn = document.getElementById('domainSubmitBtn');
    if (!raw) return;

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span><span>Querying Registry...</span>`;

    try {
      const res = await performDomainCheck(raw);
      if (!res.registered) {
        out.innerHTML = `
          <div class="trace-complete-banner">
            <span>✨ Domain Appears Available: <code>${escapeHtml(res.domain)}</code> is not registered in public RDAP/DNS!</span>
          </div>`;
        return;
      }

      const days = res.daysRemaining;
      const pct = days !== null ? Math.max(4, Math.min(100, Math.round((days / 365) * 100))) : 100;
      const expiryBadgeClass =
        days === null ? 'status-1xx' : days <= 0 ? 'status-5xx' : days <= 30 ? 'status-3xx' : 'status-2xx';
      const expiryText =
        days === null
          ? 'Protected by Registry'
          : days <= 0
          ? `Expired (${Math.abs(days)}d ago)`
          : `${days} Days Remaining`;

      out.innerHTML = `
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Domain Name</div>
            <div class="kpi-value" style="font-family:var(--font-mono)">${escapeHtml(res.domain)}</div>
            <div class="kpi-sub">${escapeHtml(res.dnssec || 'Unsigned')}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Expiration Countdown</div>
            <div class="kpi-value">
              <span class="status-badge ${expiryBadgeClass}">${escapeHtml(expiryText)}</span>
            </div>
            <div class="expiry-meter"><div class="expiry-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Registrar</div>
            <div class="kpi-value" style="font-size:0.95rem;">${escapeHtml(res.registrar)}</div>
            <div class="kpi-sub">${res.ianaId ? `IANA ID: ${escapeHtml(res.ianaId)}` : 'Official Registry Record'}</div>
          </div>
        </div>

        <div class="surface-card">
          <div class="details-grid">
            <div>
              <div class="panel-title-row"><span>Lifecycle Timestamps</span></div>
              <div class="kv-list">
                <div class="kv-item"><span>Registered On</span><strong>${escapeHtml(formatIsoDate(res.createdDate))}</strong></div>
                <div class="kv-item"><span>Expires On</span><strong>${escapeHtml(formatIsoDate(res.expiryDate))}</strong></div>
                <div class="kv-item"><span>Last Updated</span><strong>${escapeHtml(formatIsoDate(res.updatedDate))}</strong></div>
                <div class="kv-item"><span>Primary IPv4</span><strong>${escapeHtml((res.ips || []).join(', ') || 'N/A')}</strong></div>
              </div>
              <div style="margin-top:0.85rem;">
                <div class="panel-title-row"><span>EPP Domain Status Flags</span></div>
                <div class="hop-pills">
                  ${(res.statusFlags || []).map((s) => `<span class="meta-pill">${escapeHtml(s)}</span>`).join('')}
                </div>
              </div>
            </div>

            <div>
              <div class="panel-title-row"><span>Authoritative Nameservers (${(res.nameservers || []).length})</span></div>
              <div class="code-panel">${escapeHtml((res.nameservers || []).join('\n') || 'None listed')}</div>
              <div style="margin-top:0.75rem;display:flex;justify-content:flex-end;">
                <button type="button" class="mini-btn" id="toggleRawRdapBtn">Toggle Raw RDAP JSON</button>
              </div>
            </div>
          </div>
          <div id="rawRdapBlock" style="display:none;margin-top:0.9rem;">
            <div class="code-panel">${escapeHtml(JSON.stringify(res.rawRdap, null, 2))}</div>
          </div>
        </div>
      `;

      document.getElementById('toggleRawRdapBtn').addEventListener('click', () => {
        const blk = document.getElementById('rawRdapBlock');
        blk.style.display = blk.style.display === 'none' ? 'block' : 'none';
      });
    } catch (err) {
      out.innerHTML = `<div class="error-banner">⚠️ ${escapeHtml(err.message)}</div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Check WHOIS / RDAP';
    }
  };

  document.getElementById('domainForm').addEventListener('submit', (e) => {
    e.preventDefault();
    runDomain();
  });

  document.querySelectorAll('[data-domain-sample]').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.getElementById('domainCheckInput').value = chip.dataset.domainSample;
      runDomain();
    });
  });
}

/* =========================================================================
   5. CREATE TINY URL + OFFLINE VECTOR QR GENERATOR
   ========================================================================= */
function renderShortHistory() {
  const sec = document.getElementById('shortHistorySection');
  const tbody = document.getElementById('shortHistoryBody');
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(STORAGE_KEYS.shortLinks) || '[]');
  } catch {
    list = [];
  }

  if (!list.length) {
    sec.style.display = 'none';
    return;
  }

  sec.style.display = 'block';
  tbody.innerHTML = list
    .map(
      (item) => `
      <tr>
        <td><a href="${escapeHtml(item.shortUrl)}" target="_blank" rel="noopener">${escapeHtml(item.shortUrl)}</a></td>
        <td>${escapeHtml(item.longUrl)}</td>
        <td style="display:flex;gap:0.4rem;">
          <button type="button" class="mini-btn" data-copy-short="${escapeHtml(item.shortUrl)}">Copy</button>
          <button type="button" class="mini-btn" data-trace-short="${escapeHtml(item.shortUrl)}">Trace Hop</button>
        </td>
      </tr>`
    )
    .join('');

  tbody.querySelectorAll('[data-copy-short]').forEach((b) => {
    b.addEventListener('click', () => copyText(b.dataset.copyShort, 'Short URL copied!'));
  });
  tbody.querySelectorAll('[data-trace-short]').forEach((b) => {
    b.addEventListener('click', () => {
      switchTab('tracer');
      document.getElementById('traceUrlInput').value = b.dataset.traceShort;
      executeMainTrace(b.dataset.traceShort);
    });
  });
}

function initShortenerTool() {
  const providerSelect = document.getElementById('shortProviderSelect');
  const aliasInput = document.getElementById('customAliasInput');
  const aliasHint = document.getElementById('aliasSupportHint');
  const updateAliasAvailability = () => {
    const supported = ['isgd', 'vgd', 'spoome'].includes(providerSelect.value);
    aliasInput.disabled = !supported;
    if (!supported) aliasInput.value = '';
    aliasInput.placeholder = supported ? 'e.g. my_project_2026' : 'Not available for this service';
    aliasHint.textContent = supported ? 'Optional: set a custom ending.' : 'This provider generates the link automatically; custom alias is unavailable.';
  };
  providerSelect.addEventListener('change', updateAliasAvailability);
  updateAliasAvailability();
  document.getElementById('shortenForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const longUrl = document.getElementById('longUrlInput').value.trim();
    const provider = document.getElementById('shortProviderSelect').value;
    const alias = document.getElementById('customAliasInput').value.trim();
    const out = document.getElementById('shortenResultContainer');
    const btn = document.getElementById('shortenSubmitBtn');

    if (!longUrl) return;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span><span>Shortening...</span>`;

    try {
      const res = await createShortUrl(longUrl, provider, alias);
      let qrSvg = '';
      try {
        qrSvg = generateQrSvg(res.shortUrl);
      } catch {
        qrSvg = '';
      }

      // Persist in localStorage
      const prev = JSON.parse(localStorage.getItem(STORAGE_KEYS.shortLinks) || '[]');
      const next = [res, ...prev.filter((x) => x.shortUrl !== res.shortUrl)].slice(0, 8);
      localStorage.setItem(STORAGE_KEYS.shortLinks, JSON.stringify(next));
      renderShortHistory();

      out.innerHTML = `
        <div class="surface-card shortener-result-grid">
          <div>
            <span class="status-badge status-2xx" style="margin-bottom:0.55rem;">✓ Shortened via ${escapeHtml(res.provider)}</span>
            <div style="font-family:var(--font-mono);font-size:1.35rem;font-weight:800;word-break:break-all;margin:0.25rem 0 0.5rem;">
              <a href="${escapeHtml(res.shortUrl)}" target="_blank" rel="noopener">${escapeHtml(res.shortUrl)}</a>
            </div>
            <div style="font-size:0.82rem;color:var(--text-secondary);word-break:break-all;margin-bottom:1rem;">
              Destination: ${escapeHtml(res.longUrl)}
            </div>
            <div style="display:flex;gap:0.55rem;flex-wrap:wrap;">
              <button type="button" class="primary-btn" id="copyCreatedShortBtn" style="padding:0.65rem 1.15rem;font-size:0.88rem;">Copy Short URL</button>
              <button type="button" class="secondary-btn" id="traceCreatedShortBtn">Trace Redirect Path</button>
              ${qrSvg ? `<button type="button" class="secondary-btn" id="downloadQrSvgBtn">Download QR (.svg)</button>` : ''}
            </div>
          </div>
          ${
            qrSvg
              ? `<div class="qr-preview-box">
                  ${qrSvg}
                  <div style="font-size:0.7rem;color:#334155;font-weight:700;margin-top:0.35rem;">Scan Short URL</div>
                </div>`
              : ''
          }
        </div>
      `;

      document.getElementById('copyCreatedShortBtn').addEventListener('click', () => {
        copyText(res.shortUrl, 'Short URL copied!');
      });

      document.getElementById('traceCreatedShortBtn').addEventListener('click', () => {
        switchTab('tracer');
        document.getElementById('traceUrlInput').value = res.shortUrl;
        executeMainTrace(res.shortUrl);
      });

      const dlQr = document.getElementById('downloadQrSvgBtn');
      if (dlQr && qrSvg) {
        dlQr.addEventListener('click', () => {
          const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
          const u = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = u;
          a.download = 'shadowtrace-qr.svg';
          a.click();
          URL.revokeObjectURL(u);
        });
      }
    } catch (err) {
      out.innerHTML = `<div class="error-banner">⚠️ ${escapeHtml(err.message)}</div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Shorten URL';
    }
  });

  document.getElementById('clearShortHistoryBtn').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEYS.shortLinks);
    renderShortHistory();
  });

  renderShortHistory();
}

/* =========================================================================
   🌹 PHOTOREALISTIC 60FPS 3D VELVET ROSE PETALS & CRYSTAL GLASS ABOUT BOX
   ========================================================================= */
let aboutBoxPetalsCtrl = null;

function initRosePetals() {
  const bgCanvas = document.getElementById('rosePetalsCanvas');
  if (!bgCanvas) return;
  const isMobile = window.innerWidth < 700;
  createRosePetalField(bgCanvas, {
    density: isMobile ? 22 : 34,
    minSize: 16,
    maxSize: 34,
    speedScale: 1.0,
    autoStart: true,
    fixedViewport: true
  });
}

function initAboutCreator() {
  const sectionToggleBtn = document.getElementById('aboutSectionToggleBtn');
  const headerAboutBtn = document.getElementById('headerAboutBtn');
  const footerAboutLink = document.getElementById('footerAboutLink');
  const aboutModal = document.getElementById('aboutModal');
  const aboutBoxCanvas = document.getElementById('aboutBoxPetalsCanvas');
  const closeAboutModalBtn = document.getElementById('closeAboutModalBtn');

  if (aboutBoxCanvas) {
    aboutBoxPetalsCtrl = createRosePetalField(aboutBoxCanvas, {
      density: 16,
      minSize: 14,
      maxSize: 27,
      speedScale: 0.92,
      autoStart: false,
      fixedViewport: false
    });
  }

  const openAboutModal = () => {
    if (!aboutModal) return;
    aboutModal.classList.add('open');
    if (aboutBoxPetalsCtrl) {
      // Wait 1 frame so modal card dimensions are measured accurately
      requestAnimationFrame(() => {
        aboutBoxPetalsCtrl.resize();
        aboutBoxPetalsCtrl.start();
        aboutBoxPetalsCtrl.burst(12);
      });
    }
  };

  const closeAboutModal = () => {
    if (!aboutModal) return;
    aboutModal.classList.remove('open');
    if (aboutBoxPetalsCtrl) {
      aboutBoxPetalsCtrl.stop();
    }
  };

  if (sectionToggleBtn) {
    sectionToggleBtn.addEventListener('click', openAboutModal);
  }

  if (headerAboutBtn) {
    headerAboutBtn.addEventListener('click', openAboutModal);
  }

  if (footerAboutLink) {
    footerAboutLink.addEventListener('click', (e) => {
      e.preventDefault();
      openAboutModal();
    });
  }

  if (closeAboutModalBtn) {
    closeAboutModalBtn.addEventListener('click', closeAboutModal);
  }

  if (aboutModal) {
    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) closeAboutModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAboutModal();
  });
}

/* =========================================================================
   INITIALIZE APPLICATION & DEEP-LINK HASH HANDLER
   ========================================================================= */
function handleInitialRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return;

  if (hash === 'about') {
    const aboutModal = document.getElementById('aboutModal');
    if (aboutModal) {
      aboutModal.classList.add('open');
      if (aboutBoxPetalsCtrl) {
        requestAnimationFrame(() => {
          aboutBoxPetalsCtrl.resize();
          aboutBoxPetalsCtrl.start();
          aboutBoxPetalsCtrl.burst(12);
        });
      }
    }
    return;
  }

  if (hash.startsWith('trace=')) {
    const targetUrl = decodeURIComponent(hash.slice(6));
    switchTab('tracer', false);
    if (targetUrl) {
      document.getElementById('traceUrlInput').value = targetUrl;
      executeMainTrace(targetUrl);
    }
    return;
  }

  switchTab(hash, false);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRosePetals();
  initNavigation();
  initAboutCreator();
  initEngineBadge();
  initStatusCodesExplorer();
  initMainTracer();
  initBulkChecker();
  initDnsTool();
  initDomainTool();
  initShortenerTool();
  handleInitialRoute();
});
