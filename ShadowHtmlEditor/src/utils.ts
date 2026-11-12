import type { EditorTab, Project } from './data';

export const STORAGE_KEY = 'shadowhtml.projects.v1';
export const SETTINGS_KEY = 'shadowhtml.settings.v1';

export function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character] as string));
}

function safeInline(value: string, tag: 'script' | 'style') {
  const matcher = tag === 'script' ? /<\/script/gi : /<\/style/gi;
  const replacement = tag === 'script' ? '<\\/script' : '<\\/style';
  return value.replace(matcher, replacement);
}

export function buildDocument(project: Pick<Project, 'name' | 'html' | 'css' | 'javascript'>, includeBridge = true) {
  const bridge = includeBridge ? `
(function () {
  var marker = '__shadowHtmlEditor';
  function printable(value) {
    if (value instanceof Error) return value.stack || value.message;
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value, function (key, item) { return item instanceof Node ? '[DOM ' + item.nodeName + ']' : item; }); }
    catch (_) { return String(value); }
  }
  ['log', 'info', 'warn', 'error', 'debug', 'table'].forEach(function (method) {
    var original = console[method] ? console[method].bind(console) : function () {};
    console[method] = function () {
      var args = Array.prototype.slice.call(arguments).map(printable);
      try { parent.postMessage({ marker: marker, type: 'console', level: method, args: args, time: Date.now() }, '*'); } catch (_) {}
      original.apply(console, arguments);
    };
  });
  window.addEventListener('error', function (event) {
    try { parent.postMessage({ marker: marker, type: 'error', message: event.message || 'Unknown runtime error', line: event.lineno, column: event.colno, time: Date.now() }, '*'); } catch (_) {}
  });
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
    try { parent.postMessage({ marker: marker, type: 'error', message: 'Unhandled promise rejection: ' + reason, time: Date.now() }, '*'); } catch (_) {}
  });
})();` : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light dark" />
<title>${escapeHtml(project.name)}</title>
<style>${safeInline(project.css, 'style')}</style>
</head>
<body>
${project.html}
${includeBridge ? `<script>${safeInline(bridge, 'script')}<${'/'}script>` : ''}
<script>${safeInline(project.javascript, 'script')}<${'/'}script>
</body>
</html>`;
}

export function encodeShare(project: Project) {
  const compact = JSON.stringify({ n: project.name, h: project.html, c: project.css, j: project.javascript });
  const bytes = new TextEncoder().encode(compact);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeShare(value: string): Partial<Project> | null {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof parsed.h !== 'string' || typeof parsed.c !== 'string' || typeof parsed.j !== 'string') return null;
    return { name: typeof parsed.n === 'string' ? parsed.n : 'Shared project', html: parsed.h, css: parsed.c, javascript: parsed.j };
  } catch {
    return null;
  }
}

export function formatRelativeTime(timestamp: number) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 45) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)} days ago`;
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(timestamp));
}

export function getCode(project: Project, tab: EditorTab) {
  return tab === 'html' ? project.html : tab === 'css' ? project.css : project.javascript;
}

export function applyCode(project: Project, tab: EditorTab, value: string): Project {
  return { ...project, [tab === 'javascript' ? 'javascript' : tab]: value, updatedAt: Date.now() };
}

export function downloadText(filename: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

export async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const successful = document.execCommand('copy');
  textarea.remove();
  if (!successful) throw new Error('Clipboard access is unavailable in this browser.');
}

export async function formatSnippet(code: string, tab: EditorTab) {
  const prettier = await import('prettier/standalone');
  if (tab === 'html') {
    const plugin = await import('prettier/plugins/html');
    return prettier.format(code, { parser: 'html', plugins: [plugin], tabWidth: 2, printWidth: 88 });
  }
  if (tab === 'css') {
    const plugin = await import('prettier/plugins/postcss');
    return prettier.format(code, { parser: 'css', plugins: [plugin], tabWidth: 2, printWidth: 88 });
  }
  const plugin = await import('prettier/plugins/babel');
  return prettier.format(code, { parser: 'babel', plugins: [plugin], tabWidth: 2, printWidth: 88, semi: true, singleQuote: true });
}

export function projectFromImport(text: string, fileName: string, id = makeId()): Project {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const timestamp = Date.now();
  const base: Project = { id, name: fileName.replace(/\.[^.]+$/, '') || 'Imported project', html: '', css: '', javascript: '', createdAt: timestamp, updatedAt: timestamp };
  if (extension === 'json') {
    const data = JSON.parse(text);
    const candidate = data.project || data;
    return {
      ...base,
      name: typeof candidate.name === 'string' ? candidate.name : base.name,
      html: typeof candidate.html === 'string' ? candidate.html : '',
      css: typeof candidate.css === 'string' ? candidate.css : '',
      javascript: typeof candidate.javascript === 'string' ? candidate.javascript : (typeof candidate.js === 'string' ? candidate.js : ''),
    };
  }
  if (extension === 'css') return { ...base, css: text };
  if (extension === 'js' || extension === 'mjs') return { ...base, javascript: text };
  const documentFile = new DOMParser().parseFromString(text, 'text/html');
  const styles = Array.from(documentFile.querySelectorAll('style')).map((style) => style.textContent || '').filter(Boolean).join('\n\n');
  const scripts = Array.from(documentFile.querySelectorAll('script:not([src])')).map((script) => script.textContent || '').filter(Boolean).join('\n\n');
  documentFile.querySelectorAll('style, script').forEach((node) => node.remove());
  const body = documentFile.body?.innerHTML.trim() || text;
  return { ...base, html: body || text, css: styles, javascript: scripts };
}
