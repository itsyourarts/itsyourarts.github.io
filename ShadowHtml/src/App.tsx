import { AnimatePresence, motion } from 'framer-motion';
import Editor, { type OnMount } from '@monaco-editor/react';
import JSZip from 'jszip';
import {
  Activity, ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, Bell, Braces, Check,
  ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Code2, Copy, Download,
  ExternalLink, FileCode2, FileJson2, FilePlus2, FileText, Folder, FolderOpen, Fullscreen,
  Gauge, Github, Globe2, Grid2X2, HardDrive, Keyboard, Laptop2, LayoutDashboard, ListFilter,
  LoaderCircle, LockKeyhole, Menu, MessageSquareText, Minus, Moon, MoreHorizontal, PanelLeft,
  PanelRight, Play, Plus, RefreshCw, Search, Settings2, Share2, Shield, Smartphone, Sparkles,
  Sun, Tablet, TerminalSquare, Trash2, Upload, WandSparkles, X, Zap,
} from 'lucide-react';
import {
  useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { initialProjects, templates, type AppView, type EditorTab, type Project, type ProjectTemplate } from './data';
import {
  applyCode, buildDocument, copyText, decodeShare, downloadText, encodeShare, formatRelativeTime,
  formatSnippet, getCode, makeId, projectFromImport, SETTINGS_KEY, STORAGE_KEY,
} from './utils';

type ToastState = { message: string; kind?: 'success' | 'error' | 'info' } | null;
type ModalType = 'new' | 'rename' | 'delete' | 'reset' | 'clearAll' | 'share' | 'help' | 'about' | null;
type ConsoleEntry = { id: string; level: string; text: string; time: number; line?: number };
type EditorSettings = { fontSize: number; tabSize: number; wordWrap: boolean; minimap: boolean; livePreview: boolean };

const defaultEditorSettings: EditorSettings = { fontSize: 13, tabSize: 2, wordWrap: true, minimap: false, livePreview: true };
const navItems: { id: AppView; label: string; icon: typeof Code2 }[] = [
  { id: 'editor', label: 'Studio', icon: Code2 },
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'templates', label: 'Templates', icon: Grid2X2 },
];

function loadWorkspace() {
  let projects = initialProjects;
  let activeProjectId = initialProjects[0].id;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length) {
        const valid: Project[] = parsed.filter((item): item is Project & { js?: string } => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.html === 'string' && typeof item.css === 'string' && typeof (item.javascript ?? item.js) === 'string')
          .map((item) => ({ ...item, javascript: item.javascript ?? item.js ?? '', createdAt: Number(item.createdAt) || Date.now(), updatedAt: Number(item.updatedAt) || Date.now() }));
        if (valid.length) projects = valid;
      }
    }
    activeProjectId = localStorage.getItem('shadowhtml.activeProject') || projects[0].id;
  } catch {
    projects = initialProjects;
    activeProjectId = initialProjects[0].id;
  }
  try {
    const encoded = new URLSearchParams(window.location.search).get('share');
    if (encoded) {
      const shared = decodeShare(encoded);
      if (shared) {
        const id = `shared-${encoded.slice(0, 14)}`;
        let existing = projects.find((project) => project.id === id);
        if (!existing) {
          existing = { id, name: shared.name || 'Shared project', html: shared.html || '', css: shared.css || '', javascript: shared.javascript || '', createdAt: Date.now(), updatedAt: Date.now() };
          projects = [existing, ...projects];
        }
        activeProjectId = id;
      }
    }
  } catch {
    // A malformed share parameter should never prevent the workspace from opening.
  }
  if (!projects.some((project) => project.id === activeProjectId)) activeProjectId = projects[0]?.id || initialProjects[0].id;
  return { projects, activeProjectId };
}

function loadEditorSettings(): EditorSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
    return { ...defaultEditorSettings, ...(saved || {}) };
  } catch {
    return defaultEditorSettings;
  }
}

function templateProject(template: ProjectTemplate, name?: string): Project {
  const timestamp = Date.now();
  return {
    id: makeId(),
    name: name?.trim() || template.name,
    html: template.html,
    css: template.css,
    javascript: template.javascript,
    createdAt: timestamp,
    updatedAt: timestamp,
    templateId: template.id,
  };
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'shadow-project';
}

function emptyProject(name: string): Project {
  const timestamp = Date.now();
  return {
    id: makeId(),
    name: name.trim() || 'Untitled project',
    html: `<main class="canvas"><div class="eyebrow">A NEW CANVAS</div><h1>Something<br><em>good starts here.</em></h1><p>Write a little code. Make a little magic.</p><button id="hello">Try me <span>↗</span></button><div class="spark">✳</div></main>`,
    css: `*{box-sizing:border-box}body{margin:0;min-height:100vh;background:#0d0b13;color:#f4eff9;font:14px Inter,Arial,sans-serif;display:grid;place-items:center}.canvas{position:relative;overflow:hidden;width:min(680px,92vw);padding:clamp(36px,8vw,86px);border:1px solid #ffffff16;background:radial-gradient(circle at 90% 8%,#44286766,transparent 34%),linear-gradient(145deg,#171321,#0e0c13);border-radius:18px;box-shadow:0 35px 100px #0007}.eyebrow{font:10px monospace;letter-spacing:.18em;color:#a993ff}.canvas h1{font-size:clamp(42px,8vw,76px);line-height:.98;letter-spacing:-.07em;margin:24px 0 18px}.canvas h1 em{font-weight:400;color:#ad8cf8}.canvas p{font-size:14px;color:#9992a3}.canvas button{margin-top:24px;padding:13px 18px;border:0;border-radius:7px;color:#151020;background:#c1a7ff;font-weight:700}.canvas button span{padding-left:18px}.spark{position:absolute;right:9%;top:17%;font-size:68px;color:#bc9dff55}@media(max-width:500px){.canvas{padding:34px 27px}.spark{font-size:42px;right:8%;top:9%}}`,
    javascript: `document.querySelector('#hello').addEventListener('click', function () { this.innerHTML = 'Magic made <span>✦</span>'; console.log('A little magic, indeed.'); });`,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function ModalShell({ children, onClose, wide = false }: { children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.div className={`modal-card${wide ? ' modal-wide' : ''}`} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.18 }} role="dialog" aria-modal="true">
        {children}
      </motion.div>
    </motion.div>
  );
}

function ViewHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="view-heading">
      <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>
      {action && <div className="view-heading-action">{action}</div>}
    </div>
  );
}

function ProjectMark({ project, size = 'normal' }: { project: Project; size?: 'normal' | 'large' }) {
  const color = project.templateId === 'aurora-dashboard' ? 'blue' : project.templateId === 'counter-playground' ? 'orange' : project.templateId === 'portfolio-one' ? 'pink' : 'violet';
  const icon = project.templateId === 'aurora-dashboard' ? <Activity size={size === 'large' ? 23 : 18} /> : project.templateId === 'counter-playground' ? <Zap size={size === 'large' ? 23 : 18} /> : project.templateId === 'portfolio-one' ? <Sparkles size={size === 'large' ? 23 : 18} /> : <Braces size={size === 'large' ? 23 : 18} />;
  return <span className={`project-mark mark-${color} ${size === 'large' ? 'mark-large' : ''}`}>{icon}</span>;
}

function defineShadowTheme(monaco: Parameters<OnMount>[1]) {
  monaco.editor.defineTheme('shadow-dark', {
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'tag', foreground: 'BB9BFF' },
      { token: 'attribute.name', foreground: '79D6F5' },
      { token: 'attribute.value', foreground: 'B7D991' },
      { token: 'string', foreground: 'B7D991' },
      { token: 'keyword', foreground: 'C7A5FF' },
      { token: 'comment', foreground: '716B7B', fontStyle: 'italic' },
      { token: 'number', foreground: 'E9A7CC' },
    ],
    colors: {
      'editor.background': '#0e0d14',
      'editor.foreground': '#e5e0eb',
      'editorLineNumber.foreground': '#55515f',
      'editorLineNumber.activeForeground': '#bba3f8',
      'editorCursor.foreground': '#c4a6ff',
      'editor.selectionBackground': '#8e70bd44',
      'editor.lineHighlightBackground': '#ffffff07',
      'editorGutter.background': '#0e0d14',
      'editorWidget.background': '#191722',
      'editorSuggestWidget.background': '#191722',
      'editorSuggestWidget.border': '#373141',
    },
  });
}

function App() {
  const loaded = useMemo(loadWorkspace, []);
  const [projects, setProjects] = useState<Project[]>(loaded.projects);
  const [activeProjectId, setActiveProjectId] = useState(loaded.activeProjectId);
  const [view, setView] = useState<AppView>('editor');
  const [activeTab, setActiveTab] = useState<EditorTab>('html');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try { return localStorage.getItem('shadowhtml.theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
  });
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(loadEditorSettings);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'editor' | 'preview'>('editor');
  const [editorWidth, setEditorWidth] = useState(49);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewDoc, setPreviewDoc] = useState('');
  const [frameVersion, setFrameVersion] = useState(0);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(Date.now());
  const [toast, setToast] = useState<ToastState>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [modalInput, setModalInput] = useState('');
  const [modalProjectId, setModalProjectId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [topProfileOpen, setTopProfileOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [projectMenuId, setProjectMenuId] = useState<string | null>(null);
  const [workspaceMenuName, setWorkspaceMenuName] = useState('Personal space');
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const runPreviewActionRef = useRef<((notify?: boolean) => void) | null>(null);
  const formatActionRef = useRef<(() => void) | null>(null);
  const activeProject = useMemo(() => projects.find((project) => project.id === activeProjectId) || projects[0], [projects, activeProjectId]);
  const sortedProjects = useMemo(() => [...projects].sort((a, b) => b.updatedAt - a.updatedAt), [projects]);
  const activeTabCode = activeProject ? getCode(activeProject, activeTab) : '';
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((message: string, kind: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, kind });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('shadowhtml.theme', theme); } catch { /* Private browsing can disable storage. */ }
  }, [theme]);

  useEffect(() => {
    setSaving(true);
    const timeout = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        localStorage.setItem('shadowhtml.activeProject', activeProjectId);
        setLastSavedAt(Date.now());
        setSaving(false);
      } catch {
        setSaving(false);
        showToast('Local storage is full. Export a backup to keep your work safe.', 'error');
      }
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [projects, activeProjectId, showToast]);

  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(editorSettings)); } catch { /* Preferences are best effort. */ }
  }, [editorSettings]);

  useEffect(() => {
    if (!activeProject || !editorSettings.livePreview) return;
    const timeout = window.setTimeout(() => {
      setPreviewDoc(buildDocument(activeProject));
      setFrameVersion((version) => version + 1);
      setConsoleEntries([]);
    }, 420);
    return () => window.clearTimeout(timeout);
  }, [activeProject?.html, activeProject?.css, activeProject?.javascript, activeProject?.name, editorSettings.livePreview]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== previewFrameRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || data.marker !== '__shadowHtmlEditor') return;
      if (data.type === 'console') {
        const level = typeof data.level === 'string' ? data.level : 'log';
        const text = Array.isArray(data.args) ? data.args.join(' ') : String(data.args || '');
        setConsoleEntries((entries) => [...entries.slice(-79), { id: makeId(), level, text, time: Number(data.time) || Date.now() }]);
      } else if (data.type === 'error') {
        setConsoleEntries((entries) => [...entries.slice(-79), { id: makeId(), level: 'error', text: String(data.message || 'Runtime error'), time: Number(data.time) || Date.now(), line: Number(data.line) || undefined }]);
        setConsoleOpen(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const modifier = event.metaKey || event.ctrlKey;
      const target = event.target as HTMLElement | null;
      const isTyping = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (modifier && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (modifier && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        openNewProject();
      }
      if (modifier && event.key === 'Enter') {
        event.preventDefault();
        runPreviewActionRef.current?.(true);
      }
      if (modifier && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveNow();
      }
      if (event.key === 'Escape') {
        if (fullscreenPreview) setFullscreenPreview(false);
        if (modal) setModal(null);
        if (mobileSidebarOpen) setMobileSidebarOpen(false);
        if (document.activeElement === searchInputRef.current) searchInputRef.current?.blur();
      }
      if (!isTyping && modifier && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        formatActionRef.current?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  useEffect(() => {
    if (!fullscreenPreview) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = oldOverflow; };
  }, [fullscreenPreview]);

  const updateProject = useCallback((projectId: string, updater: (project: Project) => Project) => {
    setProjects((current) => current.map((project) => project.id === projectId ? updater(project) : project));
  }, []);

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (!activeProject || value === undefined) return;
    updateProject(activeProject.id, (project) => applyCode(project, activeTab, value));
  }, [activeProject, activeTab, updateProject]);

  const renderPreview = useCallback((notify = false) => {
    if (!activeProject) return;
    setConsoleEntries([]);
    setPreviewDoc(buildDocument(activeProject));
    setFrameVersion((version) => version + 1);
    if (notify) showToast('Preview refreshed', 'success');
  }, [activeProject, showToast]);
  runPreviewActionRef.current = renderPreview;

  function saveNow() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      localStorage.setItem('shadowhtml.activeProject', activeProjectId);
      setLastSavedAt(Date.now());
      setSaving(false);
      showToast('All changes saved on this device', 'success');
    } catch {
      showToast('Could not save to this browser. Try exporting a backup.', 'error');
    }
  }

  function createProjectFromTemplate(template: ProjectTemplate, name?: string) {
    const project = templateProject(template, name);
    setProjects((current) => [project, ...current]);
    setActiveProjectId(project.id);
    setActiveTab('html');
    setView('editor');
    setMobilePanel('editor');
    setModal(null);
    setMobileSidebarOpen(false);
    showToast(`“${project.name}” is ready to edit`, 'success');
  }

  function createBlankProject(name?: string) {
    const project = emptyProject(name || 'Untitled project');
    setProjects((current) => [project, ...current]);
    setActiveProjectId(project.id);
    setActiveTab('html');
    setView('editor');
    setMobilePanel('editor');
    setModal(null);
    setMobileSidebarOpen(false);
    showToast('New canvas created', 'success');
  }

  function createFromModal() {
    const template = templates.find((item) => item.id === modalProjectId);
    if (template) createProjectFromTemplate(template, modalInput || undefined);
    else createBlankProject(modalInput || 'Untitled project');
  }

  function openNewProject() {
    setModalInput('');
    setModalProjectId(null);
    setModal('new');
  }

  function openProject(project: Project) {
    setActiveProjectId(project.id);
    setView('editor');
    setActiveTab('html');
    setMobilePanel('editor');
    setMobileSidebarOpen(false);
    setProjectMenuId(null);
  }

  function duplicateProject(project: Project) {
    const copy = { ...project, id: makeId(), name: `${project.name} copy`, createdAt: Date.now(), updatedAt: Date.now() };
    setProjects((current) => [copy, ...current]);
    setActiveProjectId(copy.id);
    setView('editor');
    setProjectMenuId(null);
    setModal(null);
    showToast(`Duplicate created: ${copy.name}`, 'success');
  }

  function openRename(project: Project) {
    setModalProjectId(project.id);
    setModalInput(project.name);
    setModal('rename');
    setProjectMenuId(null);
  }

  function commitRename() {
    const id = modalProjectId;
    if (!id || !modalInput.trim()) return;
    updateProject(id, (project) => ({ ...project, name: modalInput.trim(), updatedAt: Date.now() }));
    setModal(null);
    showToast('Project renamed', 'success');
  }

  function commitDelete() {
    const id = modalProjectId;
    if (!id) return;
    const remaining = projects.filter((project) => project.id !== id);
    if (remaining.length === 0) {
      const blank = emptyProject('Untitled project');
      setProjects([blank]);
      setActiveProjectId(blank.id);
      setView('editor');
    } else {
      setProjects(remaining);
      if (activeProjectId === id) {
        setActiveProjectId(remaining[0].id);
        setView('editor');
      }
    }
    setModal(null);
    setModalProjectId(null);
    showToast('Project deleted', 'info');
  }

  function resetActiveProject() {
    if (!activeProject) return;
    const template = templates.find((item) => item.id === activeProject.templateId);
    const reset = template
      ? { ...activeProject, html: template.html, css: template.css, javascript: template.javascript, updatedAt: Date.now() }
      : { ...emptyProject(activeProject.name), id: activeProject.id, createdAt: activeProject.createdAt };
    updateProject(activeProject.id, () => reset);
    setModal(null);
    setActiveTab('html');
    showToast('Project restored to its original state', 'success');
  }

  async function formatActiveCode() {
    if (!activeProject) return;
    try {
      const formatted = await formatSnippet(getCode(activeProject, activeTab), activeTab);
      updateProject(activeProject.id, (project) => applyCode(project, activeTab, formatted));
      showToast(`${activeTab === 'javascript' ? 'JavaScript' : activeTab.toUpperCase()} formatted`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? `Could not format: ${error.message}` : 'Could not format this file', 'error');
    }
  }
  formatActionRef.current = () => { void formatActiveCode(); };

  async function copyActiveCode() {
    if (!activeProject) return;
    try {
      await copyText(getCode(activeProject, activeTab));
      showToast(`${activeTab === 'javascript' ? 'JavaScript' : activeTab.toUpperCase()} copied to clipboard`, 'success');
    } catch {
      showToast('Clipboard access was blocked by this browser', 'error');
    }
  }

  function openShareDialog() {
    if (!activeProject) return;
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('share', encodeShare(activeProject));
    const share = url.toString();
    setShareUrl(share);
    setModal('share');
    copyText(share).then(() => showToast('Share link copied — anyone with it can open this snapshot', 'success')).catch(() => showToast('Share link created. Copy it from the dialog.', 'info'));
  }

  function downloadCurrentHtml() {
    if (!activeProject) return;
    downloadText(`${slugify(activeProject.name)}.html`, buildDocument(activeProject, false), 'text/html');
    showToast('Standalone HTML downloaded', 'success');
  }

  async function exportZip() {
    if (!activeProject) return;
    const zip = new JSZip();
    const filename = slugify(activeProject.name);
    const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${activeProject.name.replace(/[&<>"']/g, '')}</title><link rel="stylesheet" href="style.css"></head><body>
${activeProject.html}
<script src="script.js"></${'script'}>
</body></html>`;
    zip.file('index.html', html);
    zip.file('style.css', activeProject.css);
    zip.file('script.js', activeProject.javascript);
    zip.file('project.json', JSON.stringify({ name: activeProject.name, html: activeProject.html, css: activeProject.css, javascript: activeProject.javascript }, null, 2));
    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `${filename}.zip`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1200);
      setMoreMenuOpen(false);
      showToast('Project bundle exported', 'success');
    } catch {
      showToast('Could not build the ZIP file', 'error');
    }
  }

  function exportProjectJson(project = activeProject) {
    if (!project) return;
    downloadText(`${slugify(project.name)}.shadow.json`, JSON.stringify({ name: project.name, html: project.html, css: project.css, javascript: project.javascript }, null, 2), 'application/json');
    setMoreMenuOpen(false);
    showToast('Project backup downloaded', 'success');
  }

  function exportWorkspaceBackup() {
    downloadText('shadowhtml-workspace-backup.json', JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), projects }, null, 2), 'application/json');
    showToast('Workspace backup downloaded', 'success');
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'json') {
        const backup = JSON.parse(text);
        if (Array.isArray(backup.projects)) {
          const restored: Project[] = backup.projects
            .filter((item: unknown) => !!item && typeof item === 'object' && typeof (item as Project).name === 'string' && typeof (item as Project).html === 'string' && typeof (item as Project).css === 'string' && typeof ((item as Project).javascript ?? (item as Project & { js?: string }).js) === 'string')
            .map((item: Project & { js?: string }) => ({
              id: makeId(), name: item.name, html: item.html, css: item.css,
              javascript: item.javascript ?? item.js ?? '', createdAt: Date.now(), updatedAt: Date.now(),
              ...(typeof item.templateId === 'string' ? { templateId: item.templateId } : {}),
            }));
          if (!restored.length) throw new Error('This backup does not contain any valid projects.');
          setProjects((current) => [...restored, ...current]);
          setActiveProjectId(restored[0].id);
          setView('editor');
          setActiveTab('html');
          setModal(null);
          showToast(`${restored.length} ${restored.length === 1 ? 'project' : 'projects'} restored from backup`, 'success');
          return;
        }
      }
      const imported = projectFromImport(text, file.name);
      if ((extension === 'css' || extension === 'js' || extension === 'mjs') && activeProject) {
        const tab: EditorTab = extension === 'css' ? 'css' : 'javascript';
        updateProject(activeProject.id, (project) => applyCode(project, tab, text));
        setActiveTab(tab);
        setView('editor');
        showToast(`${file.name} imported into ${tab === 'css' ? 'CSS' : 'JavaScript'}`, 'success');
      } else {
        setProjects((current) => [imported, ...current]);
        setActiveProjectId(imported.id);
        setView('editor');
        setActiveTab('html');
        showToast(`${file.name} imported as a new project`, 'success');
      }
      setModal(null);
    } catch (error) {
      showToast(error instanceof Error ? `Import failed: ${error.message}` : 'Could not import this file', 'error');
    }
  }

  function openImportPicker() {
    importInputRef.current?.click();
    setMoreMenuOpen(false);
  }

  function clearActiveTab() {
    if (!activeProject) return;
    updateProject(activeProject.id, (project) => applyCode(project, activeTab, ''));
    showToast(`${activeTab === 'javascript' ? 'JavaScript' : activeTab.toUpperCase()} cleared`, 'info');
    setMoreMenuOpen(false);
  }

  function openProjectInNewTab() {
    if (!activeProject) return;
    const opened = window.open('', '_blank');
    if (!opened) {
      showToast('Pop-up blocked. Download the HTML to open a standalone preview.', 'info');
      return;
    }
    opened.opener = null;
    opened.document.title = `${activeProject.name} · Preview`;
    opened.document.body.style.cssText = 'margin:0;background:#111;min-height:100vh;display:grid;place-items:center;';
    const frame = opened.document.createElement('iframe');
    frame.setAttribute('title', `${activeProject.name} sandboxed preview`);
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.style.cssText = 'width:100%;height:100vh;border:0;background:#fff;';
    frame.srcdoc = buildDocument(activeProject);
    opened.document.body.appendChild(frame);
    opened.document.documentElement.style.cssText = 'margin:0;min-height:100%;';
  }

  function beginResize(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const start = (moveEvent: PointerEvent) => {
      const rect = workspaceRef.current?.getBoundingClientRect();
      if (!rect) return;
      const next = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setEditorWidth(Math.max(32, Math.min(68, next)));
    };
    const stop = () => {
      window.removeEventListener('pointermove', start);
      window.removeEventListener('pointerup', stop);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', start);
    window.addEventListener('pointerup', stop, { once: true });
  }

  const onEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.updateOptions({ tabSize: editorSettings.tabSize, fontSize: editorSettings.fontSize, wordWrap: editorSettings.wordWrap ? 'on' : 'off', minimap: { enabled: editorSettings.minimap } });
    editor.addAction({
      id: 'shadow-run-preview',
      label: 'Run preview',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => runPreviewActionRef.current?.(true),
    });
    editor.addAction({
      id: 'shadow-format-code',
      label: 'Format document',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
      run: () => formatActionRef.current?.(),
    });
    editor.focus();
  };

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.updateOptions({
      fontSize: editorSettings.fontSize,
      tabSize: editorSettings.tabSize,
      wordWrap: editorSettings.wordWrap ? 'on' : 'off',
      minimap: { enabled: editorSettings.minimap },
    });
  }, [editorSettings]);

  const openRenameActive = () => activeProject && openRename(activeProject);
  const openDelete = (project: Project) => { setModalProjectId(project.id); setModal('delete'); setProjectMenuId(null); };
  const handleSearchSubmit = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setView('projects');
      searchInputRef.current?.blur();
    }
    if (event.key === 'Escape') {
      setSearch('');
      searchInputRef.current?.blur();
    }
  };
  const filteredProjects = useMemo(() => sortedProjects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(search.trim().toLowerCase());
    const template = templates.find((item) => item.id === project.templateId);
    const matchesFilter = projectFilter === 'all' || (projectFilter === 'recent' ? Date.now() - project.updatedAt < 1000 * 60 * 60 * 24 * 7 : template?.category.toLowerCase() === projectFilter);
    return matchesSearch && matchesFilter;
  }), [sortedProjects, search, projectFilter]);
  const consoleErrors = consoleEntries.filter((entry) => entry.level === 'error').length;
  const pageDate = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  function navigate(next: AppView) {
    setView(next);
    setMobileSidebarOpen(false);
    setWorkspaceMenuOpen(false);
    setProfileMenuOpen(false);
    setTopProfileOpen(false);
  }

  function handleCreateFromTemplate(template: ProjectTemplate) {
    const existingCount = projects.filter((project) => project.templateId === template.id).length;
    createProjectFromTemplate(template, existingCount > 0 ? `${template.name} ${existingCount + 1}` : template.name);
  }

  function openShareFor(project: Project) {
    setProjectMenuId(null);
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('share', encodeShare(project));
    setShareUrl(url.toString());
    setModal('share');
  }

  const pageTransition = { duration: 0.18, ease: 'easeOut' as const };

  return (
    <div className={`app-shell ${fullscreenPreview ? 'has-fullscreen-preview' : ''}`}>
      <div className={`sidebar-backdrop ${mobileSidebarOpen ? 'is-visible' : ''}`} onClick={() => setMobileSidebarOpen(false)} />
      <aside className={`sidebar ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <button className="brand-logo" onClick={() => navigate('editor')} aria-label="ShadowHtmlEditor home"><span className="brand-glyph"><span /></span><span className="brand-name">shadow<span>html</span><b>.</b></span></button>
          <button className="icon-button sidebar-close" title="Close navigation" onClick={() => setMobileSidebarOpen(false)}><X size={16} /></button>
        </div>
        <button className="workspace-switch" onClick={() => setWorkspaceMenuOpen((open) => !open)}>
          <span className="workspace-avatar"><Sparkles size={14} /></span><span className="workspace-copy"><b>{workspaceMenuName}</b><small>Free workspace</small></span><ChevronDown size={14} />
        </button>
        <AnimatePresence>
          {workspaceMenuOpen && <motion.div className="workspace-menu floating-menu" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}>
            <div className="menu-label">WORKSPACES</div>
            <button className="menu-row" onClick={() => { setWorkspaceMenuName('Personal space'); setWorkspaceMenuOpen(false); }}><span className="menu-dot violet-dot" />Personal space{workspaceMenuName === 'Personal space' && <Check size={13} />}</button>
            <button className="menu-row" onClick={() => { setWorkspaceMenuName('Studio team'); setWorkspaceMenuOpen(false); showToast('Switched to the Studio team workspace (local demo)', 'info'); }}><span className="menu-dot blue-dot" />Studio team{workspaceMenuName === 'Studio team' && <Check size={13} />}</button>
            <div className="menu-separator" />
            <button className="menu-row" onClick={() => { setWorkspaceMenuOpen(false); setModal('about'); }}><CircleHelp size={14} />Workspace details</button>
          </motion.div>}
        </AnimatePresence>

        <button className="new-project-button" onClick={openNewProject}><Plus size={15} /><span>New project</span><kbd>⌘ N</kbd></button>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Primary navigation">
          {navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${view === id ? 'nav-item-active' : ''}`} onClick={() => navigate(id)}><Icon size={16} /><span>{label}</span>{id === 'projects' && <small>{projects.length}</small>}</button>)}
          <button className={`nav-item ${view === 'settings' ? 'nav-item-active' : ''}`} onClick={() => navigate('settings')}><Settings2 size={16} /><span>Settings</span></button>
        </nav>

        <div className="sidebar-project-head"><span>RECENT PROJECTS</span><button title="Create project" onClick={openNewProject}><Plus size={14} /></button></div>
        <div className="sidebar-project-list">
          {sortedProjects.slice(0, 5).map((project) => <button key={project.id} className={`sidebar-project ${project.id === activeProjectId && view === 'editor' ? 'sidebar-project-active' : ''}`} onClick={() => openProject(project)}><ProjectMark project={project} /><span className="sidebar-project-name">{project.name}</span><span className="project-status-dot" /></button>)}
          {projects.length === 0 && <div className="sidebar-empty">Your projects will live here.</div>}
        </div>
        <button className="sidebar-template-tip" onClick={() => navigate('templates')}><span className="tip-orbit"><Sparkles size={15} /></span><span><b>Start with a spark</b><small>Explore curated templates</small></span><ArrowUpRight size={14} /></button>
        <div className="sidebar-bottom">
          <div className="sidebar-storage"><div className="storage-line"><span><HardDrive size={12} /> Local storage</span><span>On</span></div><div className="storage-meter"><span style={{ width: `${Math.min(100, Math.max(8, projects.reduce((total, project) => total + project.html.length + project.css.length + project.javascript.length, 0) / 12000 * 100))}%` }} /></div><small>Projects stay on this device</small></div>
          <button className="user-card" onClick={() => setProfileMenuOpen((open) => !open)}><span className="avatar">A</span><span className="user-copy"><b>Alex Morgan</b><small>Personal account</small></span><MoreHorizontal size={16} /></button>
          <AnimatePresence>{profileMenuOpen && <motion.div className="profile-menu floating-menu" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}><div className="profile-menu-top"><span className="avatar">A</span><span><b>Alex Morgan</b><small>alex@shadow.studio</small></span></div><div className="menu-separator" /><button className="menu-row" onClick={() => { navigate('settings'); setProfileMenuOpen(false); }}><Settings2 size={14} />Preferences</button><button className="menu-row" onClick={() => { setProfileMenuOpen(false); setModal('about'); }}><CircleHelp size={14} />About Shadow</button></motion.div>}</AnimatePresence>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu-button" title="Open navigation" onClick={() => setMobileSidebarOpen(true)}><Menu size={18} /></button>
            <div className="topbar-breadcrumb"><span>SHADOW</span><ChevronRight size={13} /><b>{view === 'editor' ? 'Studio' : view === 'dashboard' ? 'Overview' : view === 'projects' ? 'Projects' : view === 'templates' ? 'Templates' : 'Settings'}</b>{view === 'editor' && activeProject && <><ChevronRight size={13} /><span className="breadcrumb-project">{activeProject.name}</span></>}</div>
          </div>
          <div className="topbar-right">
            <label className="global-search"><Search size={15} /><input ref={searchInputRef} value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={handleSearchSubmit} placeholder="Search projects..." aria-label="Search projects" /><kbd>⌘ K</kbd></label>
            <span className="topbar-divider" />
            <button className="icon-button theme-switch" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
            <button className="icon-button top-help" title="Keyboard shortcuts and help" onClick={() => setModal('help')}><CircleHelp size={16} /></button>
            <button className="icon-button notification-button" title="Notifications" onClick={() => showToast('You’re all caught up. Your work is saved locally.', 'info')}><Bell size={16} /><i /></button>
            <div className="top-avatar-anchor"><button className="top-avatar" title="Account menu" onClick={() => setTopProfileOpen((open) => !open)}>A</button><AnimatePresence>{topProfileOpen && <motion.div className="top-profile-menu floating-menu" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}><div className="profile-menu-top"><span className="avatar">A</span><span><b>Alex Morgan</b><small>alex@shadow.studio</small></span></div><div className="menu-separator" /><button className="menu-row" onClick={() => navigate('settings')}><Settings2 size={14} />Preferences</button><button className="menu-row" onClick={() => { setTopProfileOpen(false); setModal('about'); }}><CircleHelp size={14} />About Shadow</button><button className="menu-row" onClick={() => { setTopProfileOpen(false); saveNow(); }}><Check size={14} />Save workspace</button></motion.div>}</AnimatePresence></div>
          </div>
        </header>

        <main className="main-content">
          <AnimatePresence mode="wait" initial={false}>
            {view === 'editor' && activeProject && <motion.section key="editor" className="editor-view" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={pageTransition}>
              <div className="project-heading-row">
                <div className="project-heading-title">
                  <button className="back-link" onClick={() => navigate('dashboard')}><ArrowLeft size={14} /><span>Workspace</span></button>
                  <span className="heading-separator">/</span>
                  <button className="project-title-button" onClick={openRenameActive} title="Rename project">{activeProject.name}<span className="title-edit-mark">⌄</span></button>
                  <span className="project-visibility"><LockKeyhole size={11} /> Private</span>
                </div>
                <div className="project-heading-meta"><span className={`save-state ${saving ? 'is-saving' : ''}`}><span className="save-indicator">{saving ? <LoaderCircle size={12} className="spin" /> : <Check size={12} />}</span>{saving ? 'Saving…' : 'Saved'}<span className="save-time">{formatRelativeTime(lastSavedAt)}</span></span><button className="icon-button project-more-button" title="Project options" onClick={() => setMoreMenuOpen((open) => !open)}><MoreHorizontal size={18} /></button></div>
              </div>
              <div className="editor-toolbar">
                <div className="toolbar-group toolbar-main-actions">
                  <button className="run-button" onClick={() => renderPreview(true)}><Play size={14} fill="currentColor" /><span>Run</span><kbd>⌘ ↵</kbd></button>
                  <button className="toolbar-button refresh-action" onClick={() => renderPreview(true)} title="Refresh preview"><RefreshCw size={15} /></button>
                  <span className="toolbar-separator" />
                  <button className="toolbar-button" onClick={saveNow}><Check size={14} /><span>Save</span></button>
                  <button className="toolbar-button" onClick={openShareDialog}><Share2 size={14} /><span>Share</span></button>
                </div>
                <div className="toolbar-group toolbar-secondary-actions">
                  <button className="toolbar-button download-button" onClick={downloadCurrentHtml}><Download size={14} /><span>Download HTML</span></button>
                  <button className="toolbar-button copy-button" onClick={copyActiveCode}><Copy size={14} /><span>Copy</span></button>
                  <div className="menu-anchor">
                    <button className={`toolbar-button more-trigger ${moreMenuOpen ? 'is-open' : ''}`} title="More project actions" onClick={() => setMoreMenuOpen((open) => !open)}><MoreHorizontal size={17} /></button>
                    <AnimatePresence>{moreMenuOpen && <motion.div className="action-menu floating-menu" initial={{ opacity: 0, y: 5, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: .98 }}>
                      <div className="menu-label">PROJECT</div>
                      <button className="menu-row" onClick={exportZip}><FileCode2 size={14} />Export project ZIP</button>
                      <button className="menu-row" onClick={() => exportProjectJson()}><FileJson2 size={14} />Export project JSON</button>
                      <button className="menu-row" onClick={openImportPicker}><Upload size={14} />Import file…</button>
                      <div className="menu-separator" />
                      <button className="menu-row" onClick={() => { setModal('reset'); setMoreMenuOpen(false); }}><RefreshCw size={14} />Reset project</button>
                      <button className="menu-row" onClick={clearActiveTab}><Trash2 size={14} />Clear {activeTab === 'javascript' ? 'JavaScript' : activeTab.toUpperCase()} tab</button>
                      <div className="menu-separator" />
                      <button className="menu-row" onClick={() => { setMoreMenuOpen(false); openRenameActive(); }}><FileText size={14} />Rename project</button>
                    </motion.div>}</AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="mobile-panel-switcher"><button className={mobilePanel === 'editor' ? 'active' : ''} onClick={() => setMobilePanel('editor')}><Code2 size={14} />Code</button><button className={mobilePanel === 'preview' ? 'active' : ''} onClick={() => setMobilePanel('preview')}><PanelRight size={14} />Preview{consoleErrors > 0 && <i className="mobile-error-dot" />}</button></div>

              <div ref={workspaceRef} className={`workspace-area ${mobilePanel === 'preview' ? 'mobile-preview-active' : 'mobile-editor-active'}`} style={{ '--editor-width': `${editorWidth}%` } as CSSProperties}>
                <section className="code-pane" aria-label="Code editor">
                  <div className="panel-topline">
                    <div className="code-tabs" role="tablist" aria-label="Code files">
                      {(['html', 'css', 'javascript'] as EditorTab[]).map((tab) => {
                        const Icon = tab === 'html' ? FileCode2 : tab === 'css' ? Braces : FileText;
                        const label = tab === 'javascript' ? 'JS' : tab.toUpperCase();
                        return <button key={tab} role="tab" aria-selected={activeTab === tab} className={`code-tab ${activeTab === tab ? `tab-active tab-${tab}` : ''}`} onClick={() => setActiveTab(tab)}><Icon size={14} /><span>{label}</span><i className={`tab-dot ${tab === 'html' ? 'dot-orange' : tab === 'css' ? 'dot-blue' : 'dot-yellow'}`} /></button>;
                      })}
                      <button className="tab-add" title="Add a new project" onClick={openNewProject}><Plus size={14} /></button>
                    </div>
                    <div className="editor-tool-actions"><span className="editor-language-tag">{activeTab === 'javascript' ? 'JavaScript' : activeTab.toUpperCase()}</span><button className="editor-tool-button format-action" title="Format code (⌘⇧F)" onClick={() => void formatActiveCode()}><WandSparkles size={13} /><span>Format</span></button><button className="editor-tool-button" title="Editor settings" onClick={() => navigate('settings')}><Settings2 size={14} /></button></div>
                  </div>
                  <div className="monaco-wrap">
                    <Editor
                      height="100%"
                      language={activeTab === 'javascript' ? 'javascript' : activeTab}
                      theme={theme === 'dark' ? 'shadow-dark' : 'vs'}
                      value={activeTabCode}
                      onChange={handleCodeChange}
                      beforeMount={defineShadowTheme}
                      onMount={onEditorMount}
                      loading={<div className="editor-loading"><LoaderCircle size={18} className="spin" /><span>Preparing your studio…</span></div>}
                      options={{
                        automaticLayout: true,
                        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
                        fontSize: editorSettings.fontSize,
                        fontLigatures: true,
                        lineNumbers: 'on',
                        lineNumbersMinChars: 3,
                        minimap: { enabled: editorSettings.minimap, scale: 1 },
                        scrollBeyondLastLine: false,
                        wordWrap: editorSettings.wordWrap ? 'on' : 'off',
                        tabSize: editorSettings.tabSize,
                        insertSpaces: true,
                        padding: { top: 18, bottom: 18 },
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        renderLineHighlight: 'all',
                        guides: { indentation: true, bracketPairs: true },
                        bracketPairColorization: { enabled: true },
                        suggest: { preview: true, showWords: true },
                        quickSuggestions: { other: true, comments: false, strings: true },
                        glyphMargin: false,
                        folding: true,
                        contextmenu: true,
                        stickyScroll: { enabled: false },
                        accessibilitySupport: 'auto',
                      }}
                    />
                  </div>
                  <div className="editor-statusline"><span><span className="status-green-dot" />{saving ? 'Unsaved changes' : 'All changes saved'}</span><span>UTF-8</span><span>{activeTab === 'javascript' ? 'JavaScript' : activeTab.toUpperCase()}</span><span>Spaces: {editorSettings.tabSize}</span><button onClick={() => setEditorSettings((settings) => ({ ...settings, wordWrap: !settings.wordWrap }))}>{editorSettings.wordWrap ? 'Word wrap: on' : 'Word wrap: off'}</button></div>
                </section>
                <div className="resize-handle" onPointerDown={beginResize} role="separator" aria-label="Resize editor and preview panels" />
                <section className={`preview-pane ${fullscreenPreview ? 'preview-fullscreen' : ''}`} aria-label="Live preview">
                  <div className="preview-topline">
                    <div className="preview-heading"><span className="live-preview-icon"><span /></span><div><b>Live preview</b><small>localhost / {slugify(activeProject.name)}</small></div><span className="preview-live-badge">LIVE</span></div>
                    <div className="preview-controls">
                      <div className="device-switcher" aria-label="Preview viewport">
                        <button className={deviceMode === 'desktop' ? 'selected' : ''} title="Desktop preview" onClick={() => setDeviceMode('desktop')}><Laptop2 size={14} /></button>
                        <button className={deviceMode === 'tablet' ? 'selected' : ''} title="Tablet preview" onClick={() => setDeviceMode('tablet')}><Tablet size={14} /></button>
                        <button className={deviceMode === 'mobile' ? 'selected' : ''} title="Mobile preview" onClick={() => setDeviceMode('mobile')}><Smartphone size={14} /></button>
                      </div>
                      <span className="preview-controls-separator" />
                      <button className={`preview-icon-button console-toggle ${consoleOpen ? 'selected' : ''}`} title="Toggle console" onClick={() => setConsoleOpen((open) => !open)}><TerminalSquare size={15} />{consoleErrors > 0 && <i>{consoleErrors}</i>}</button>
                      <button className="preview-icon-button" title={fullscreenPreview ? 'Exit fullscreen' : 'Fullscreen preview'} onClick={() => setFullscreenPreview((full) => !full)}>{fullscreenPreview ? <X size={15} /> : <Fullscreen size={15} />}</button>
                      <button className="preview-icon-button open-preview" title="Open preview in a new tab" onClick={openProjectInNewTab}><ExternalLink size={14} /></button>
                    </div>
                  </div>
                  <div className={`preview-stage device-${deviceMode}`}>
                    <div className="preview-frame-shell">
                      <div className="preview-browser-bar"><span className="browser-dots"><i /><i /><i /></span><div className="preview-address"><LockKeyhole size={10} /> shadowhtml.app / preview</div><button onClick={() => renderPreview(true)} title="Refresh"><RefreshCw size={11} /></button></div>
                      <iframe key={frameVersion} ref={previewFrameRef} title={`${activeProject.name} live preview`} className="live-iframe" srcDoc={previewDoc || buildDocument(activeProject)} sandbox="allow-scripts" />
                    </div>
                  </div>
                  {consoleOpen && <div className="console-panel">
                    <div className="console-head"><div><TerminalSquare size={13} /><b>Console</b><span>{consoleEntries.length} {consoleEntries.length === 1 ? 'message' : 'messages'}</span></div><div><button title="Clear console" onClick={() => setConsoleEntries([])}><Trash2 size={12} /> Clear</button><button title="Close console" onClick={() => setConsoleOpen(false)}><X size={14} /></button></div></div>
                    <div className="console-body">{consoleEntries.length === 0 ? <div className="console-empty"><span className="console-ready-dot" />Console is ready. Logs from your JavaScript appear here.</div> : consoleEntries.map((entry) => <div className={`console-entry console-${entry.level === 'warning' ? 'warn' : entry.level}`} key={entry.id}><span className="console-entry-icon">{entry.level === 'error' ? '×' : entry.level === 'warn' ? '!' : '›'}</span><code>{entry.text}{entry.line ? <span className="console-line"> · line {entry.line}</span> : null}</code><time>{new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time></div>)}</div>
                  </div>}
                  <div className="preview-statusline"><span><span className="status-green-dot" />Sandboxed preview</span><span>100%</span></div>
                </section>
              </div>
              <div className="editor-bottomline"><span><Shield size={12} /> Runs in a sandboxed iframe</span><span><Keyboard size={12} /> ⌘↵ Run <i /> ⌘S Save <i /> ⌘⇧F Format</span></div>
            </motion.section>}

            {view === 'dashboard' && <motion.section key="dashboard" className="page-view dashboard-view" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={pageTransition}>
              <ViewHeading eyebrow={`${pageDate.toUpperCase()} · YOUR WORKSPACE`} title="A little space to make." description="Your ideas, projects, and experiments — all in one place." action={<button className="primary-button" onClick={openNewProject}><Plus size={15} />Create project</button>} />
              <div className="dashboard-hero">
                <div className="hero-mesh" /><div className="hero-glow hero-glow-one" /><div className="hero-glow hero-glow-two" />
                <div className="hero-content"><div className="hero-pill"><Sparkles size={12} /> YOUR CREATIVE SPACE</div><h2>Build something<br /><em>worth seeing.</em></h2><p>From first line to finished idea. A focused, delightful place to shape the web.</p><button onClick={openNewProject}>Start creating <ArrowRight size={15} /></button></div>
                <div className="hero-artwork" aria-hidden="true"><div className="hero-ring ring-a" /><div className="hero-ring ring-b" /><div className="hero-ring ring-c" /><div className="hero-core"><span className="core-star">✦</span><span className="core-name">SHADOW</span><span className="core-sub">HTML STUDIO</span></div><span className="hero-art-tag tag-top">HTML · CSS · JS</span><span className="hero-art-tag tag-bottom">MADE FOR THE WEB</span></div>
                <div className="hero-footnote"><span className="status-green-dot" />{projects.length} {projects.length === 1 ? 'project' : 'projects'} in your workspace<span className="hero-footnote-separator" />Changes are saved automatically</div>
              </div>
              <div className="dashboard-section-head"><div><span className="section-eyebrow">YOUR RECENT WORK</span><h2>Pick up where you left off</h2></div><button className="text-button" onClick={() => navigate('projects')}>All projects <ArrowRight size={14} /></button></div>
              <div className="recent-grid">{sortedProjects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} active={project.id === activeProjectId} onOpen={() => openProject(project)} onMenu={(event) => { event.stopPropagation(); setProjectMenuId(projectMenuId === project.id ? null : project.id); }} menuOpen={projectMenuId === project.id} onDuplicate={() => duplicateProject(project)} onRename={() => openRename(project)} onDelete={() => openDelete(project)} onShare={() => openShareFor(project)} />)}
                <button className="new-project-card" onClick={openNewProject}><span className="new-card-icon"><Plus size={18} /></span><b>Create a new project</b><small>Start with a blank canvas or a template</small><span className="new-card-arrow"><ArrowRight size={15} /></span></button>
              </div>
              <div className="dashboard-lower-grid"><div className="template-promo"><div className="promo-top"><span className="section-eyebrow">A HEAD START</span><span className="promo-spark">✦</span></div><h3>Less setup.<br /><em>More making.</em></h3><p>Start with a crafted foundation and make it your own.</p><button onClick={() => navigate('templates')}>Explore templates <ArrowRight size={14} /></button><div className="promo-orbit" /></div><div className="workspace-info"><div className="workspace-info-head"><span className="section-eyebrow">WORKSPACE OVERVIEW</span><span className="workspace-ready"><span className="status-green-dot" />All systems ready</span></div><div className="info-stat-row"><span><span className="info-icon info-purple"><Code2 size={14} /></span>Saved projects</span><b>{projects.length}<small> total</small></b></div><div className="info-stat-row"><span><span className="info-icon info-blue"><Clock3 size={14} /></span>Last edited</span><b>{activeProject ? formatRelativeTime(activeProject.updatedAt) : '—'}</b></div><div className="info-stat-row"><span><span className="info-icon info-green"><HardDrive size={14} /></span>Autosave</span><b className="positive-stat">On <Check size={13} /></b></div><div className="local-note"><LockKeyhole size={12} /> Your code stays private on this device.</div></div></div>
            </motion.section>}

            {view === 'projects' && <motion.section key="projects" className="page-view projects-view" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={pageTransition}>
              <ViewHeading eyebrow="YOUR LIBRARY" title="Projects" description="Every idea you’ve started, saved, and shipped." action={<div className="project-page-actions"><button className="secondary-button" onClick={openImportPicker}><Upload size={14} />Import</button><button className="primary-button" onClick={openNewProject}><Plus size={15} />New project</button></div>} />
              <div className="library-toolbar"><label className="library-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a project..." /></label><div className="filter-control"><ListFilter size={14} /><select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} aria-label="Filter projects"><option value="all">All projects</option><option value="recent">Edited this week</option><option value="landing page">Landing pages</option><option value="dashboard">Dashboards</option><option value="interactive">Interactive</option><option value="portfolio">Portfolios</option></select><ChevronDown size={13} /></div><span className="library-count">{filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}</span></div>
              {filteredProjects.length ? <div className="project-library-grid">{filteredProjects.map((project) => <ProjectCard key={project.id} project={project} active={project.id === activeProjectId} onOpen={() => openProject(project)} onMenu={(event) => { event.stopPropagation(); setProjectMenuId(projectMenuId === project.id ? null : project.id); }} menuOpen={projectMenuId === project.id} onDuplicate={() => duplicateProject(project)} onRename={() => openRename(project)} onDelete={() => openDelete(project)} onShare={() => openShareFor(project)} />)}<button className="new-project-card library-new-card" onClick={openNewProject}><span className="new-card-icon"><Plus size={18} /></span><b>Create a new project</b><small>Start from scratch or choose a template</small><span className="new-card-arrow"><ArrowRight size={15} /></span></button></div> : <div className="empty-library"><span><Search size={19} /></span><h3>No projects match that search</h3><p>Try another name or clear your filters.</p><button className="secondary-button" onClick={() => { setSearch(''); setProjectFilter('all'); }}>Clear filters</button></div>}
              <div className="library-footer"><Shield size={13} />Your projects are stored locally in this browser. <button onClick={exportWorkspaceBackup}>Download a workspace backup</button></div>
            </motion.section>}

            {view === 'templates' && <motion.section key="templates" className="page-view templates-view" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={pageTransition}>
              <ViewHeading eyebrow="CURATED STARTING POINTS" title="Start with a spark." description="Thoughtful foundations for your next idea. Every template is yours to remix." action={<button className="secondary-button" onClick={() => createBlankProject()}><Braces size={14} />Start blank</button>} />
              <div className="template-feature-strip"><div className="feature-spark">✦</div><div><span>THE SHADOW COLLECTION</span><b>Designed to get you from idea to <em>in-motion.</em></b></div><span className="feature-count">{templates.length.toString().padStart(2, '0')} TEMPLATES</span></div>
              <div className="template-grid">{templates.map((template, index) => <TemplateCard key={template.id} template={template} index={index} onUse={() => handleCreateFromTemplate(template)} />)}</div>
              <div className="template-note"><LockKeyhole size={13} />Templates are a starting point — the code is yours to edit, export, and share.</div>
            </motion.section>}

            {view === 'settings' && <motion.section key="settings" className="page-view settings-view" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={pageTransition}>
              <ViewHeading eyebrow="MAKE IT YOURS" title="Studio settings" description="Tune your editor and keep your workspace just right." />
              <div className="settings-layout"><div className="settings-main-column">
                <section className="settings-card"><div className="settings-card-heading"><span className="settings-card-icon purple-icon"><Code2 size={16} /></span><div><h2>Editor preferences</h2><p>Small details that make a big difference.</p></div></div>
                  <div className="setting-row"><div><b>Editor font size</b><small>Comfortable reading for long sessions</small></div><div className="setting-stepper"><button onClick={() => setEditorSettings((settings) => ({ ...settings, fontSize: Math.max(11, settings.fontSize - 1) }))} aria-label="Decrease font size"><Minus size={13} /></button><span>{editorSettings.fontSize}px</span><button onClick={() => setEditorSettings((settings) => ({ ...settings, fontSize: Math.min(20, settings.fontSize + 1) }))} aria-label="Increase font size"><Plus size={13} /></button></div></div>
                  <div className="setting-row"><div><b>Indent size</b><small>Spaces inserted when you press Tab</small></div><div className="segmented-control"><button className={editorSettings.tabSize === 2 ? 'selected' : ''} onClick={() => setEditorSettings((settings) => ({ ...settings, tabSize: 2 }))}>2</button><button className={editorSettings.tabSize === 4 ? 'selected' : ''} onClick={() => setEditorSettings((settings) => ({ ...settings, tabSize: 4 }))}>4</button></div></div>
                  <SettingToggle label="Word wrap" description="Wrap long lines instead of scrolling horizontally" checked={editorSettings.wordWrap} onChange={() => setEditorSettings((settings) => ({ ...settings, wordWrap: !settings.wordWrap }))} />
                  <SettingToggle label="Minimap" description="Show a compact map of the current file" checked={editorSettings.minimap} onChange={() => setEditorSettings((settings) => ({ ...settings, minimap: !settings.minimap }))} />
                  <SettingToggle label="Live preview" description="Refresh the sandbox as you edit (about 0.4 seconds after typing)" checked={editorSettings.livePreview} onChange={() => setEditorSettings((settings) => ({ ...settings, livePreview: !settings.livePreview }))} />
                </section>
                <section className="settings-card"><div className="settings-card-heading"><span className="settings-card-icon blue-icon"><Sun size={16} /></span><div><h2>Appearance</h2><p>Choose a comfortable canvas for your eyes.</p></div></div><div className="theme-options"><button className={`theme-option theme-option-dark ${theme === 'dark' ? 'theme-option-active' : ''}`} onClick={() => setTheme('dark')}><span className="theme-preview dark-preview"><i /><i /><i /><b /></span><span><b>Shadow dark</b><small>Easy on the eyes, day or night</small></span>{theme === 'dark' && <Check size={15} />}</button><button className={`theme-option theme-option-light ${theme === 'light' ? 'theme-option-active' : ''}`} onClick={() => setTheme('light')}><span className="theme-preview light-preview"><i /><i /><i /><b /></span><span><b>Paper light</b><small>A softer, brighter studio</small></span>{theme === 'light' && <Check size={15} />}</button></div></section>
                <section className="settings-card"><div className="settings-card-heading"><span className="settings-card-icon green-icon"><HardDrive size={16} /></span><div><h2>Local data</h2><p>Your workspace is saved in this browser, not on a server.</p></div></div><div className="data-summary"><div><b>{projects.length}</b><small>projects</small></div><span className="data-separator" /><div><b>{(projects.reduce((total, project) => total + project.html.length + project.css.length + project.javascript.length, 0) / 1024).toFixed(1)} KB</b><small>code stored</small></div><span className="data-separator" /><div><b>{saving ? 'Saving' : 'Up to date'}</b><small>autosave status</small></div></div><div className="settings-action-row"><button className="secondary-button" onClick={exportWorkspaceBackup}><Download size={14} />Download backup</button><button className="secondary-button" onClick={openImportPicker}><Upload size={14} />Import project</button><button className="danger-link" onClick={() => setModal('clearAll')}><Trash2 size={14} />Clear local projects</button></div><div className="privacy-note"><Shield size={13} />ShadowHtmlEditor runs entirely in your browser. Your source code is not sent to a server.</div></section>
              </div><aside className="settings-side-card"><div className="settings-aside-orb"><span>✦</span></div><span className="eyebrow">A QUICK REMINDER</span><h3>Your work<br />is <em>yours.</em></h3><p>Every project stays on this device until you choose to export or share it.</p><button onClick={() => setModal('help')}>View shortcuts <ArrowRight size={14} /></button><div className="settings-aside-footer"><LockKeyhole size={12} /> PRIVATE BY DEFAULT</div></aside></div>
            </motion.section>}
          </AnimatePresence>
        </main>
        <input ref={importInputRef} type="file" className="visually-hidden" accept=".html,.htm,.css,.js,.mjs,.json" onChange={handleImport} />
      </div>

      <AnimatePresence>
        {modal && <ModalShell onClose={() => setModal(null)} wide={modal === 'new'}>
          {modal === 'new' && <>
            <div className="modal-header"><div><div className="modal-eyebrow">NEW PROJECT</div><h2>Where should we begin?</h2><p>Choose a starting point. You can change everything later.</p></div><button className="icon-button" onClick={() => setModal(null)}><X size={16} /></button></div>
            <label className="field-label">PROJECT NAME<input autoFocus value={modalInput} onChange={(event) => setModalInput(event.target.value)} placeholder="Untitled project" onKeyDown={(event) => { if (event.key === 'Enter') createFromModal(); }} /></label>
            <div className="new-modal-options"><button className={`blank-option ${modalProjectId === null ? 'blank-option-selected' : ''}`} onClick={() => setModalProjectId(null)}><span className="blank-option-icon"><FilePlus2 size={18} /></span><span><b>Blank canvas</b><small>A clean start with a little inspiration.</small></span>{modalProjectId === null && <Check size={15} />}</button><div className="modal-template-label">OR START WITH A TEMPLATE</div><div className="modal-template-grid">{templates.slice(0, 4).map((template) => <button key={template.id} className={`modal-template-option ${modalProjectId === template.id ? 'selected' : ''}`} onClick={() => { setModalProjectId(template.id); if (!modalInput) setModalInput(template.name); }}><span className={`template-mini-mark mini-${template.id}`}>{template.icon}</span><span><b>{template.name}</b><small>{template.category}</small></span>{modalProjectId === template.id && <Check size={13} />}</button>)}</div></div>
            <div className="modal-footer"><button className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" onClick={createFromModal}><Plus size={14} />Create project</button></div>
          </>}
          {modal === 'rename' && <><div className="modal-header"><div><div className="modal-eyebrow">PROJECT SETTINGS</div><h2>Give it a new name.</h2><p>A good name makes it easier to find later.</p></div><button className="icon-button" onClick={() => setModal(null)}><X size={16} /></button></div><label className="field-label">PROJECT NAME<input autoFocus value={modalInput} onChange={(event) => setModalInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') commitRename(); }} /></label><div className="modal-footer"><button className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" onClick={commitRename}><Check size={14} />Save name</button></div></>}
          {modal === 'delete' && <><div className="confirm-icon danger-confirm"><Trash2 size={19} /></div><div className="confirm-copy"><div className="modal-eyebrow">DELETE PROJECT</div><h2>This project is going away.</h2><p>“{projects.find((project) => project.id === modalProjectId)?.name || 'This project'}” will be removed from this browser. This can’t be undone.</p></div><div className="modal-footer"><button className="secondary-button" onClick={() => setModal(null)}>Keep project</button><button className="danger-button" onClick={commitDelete}><Trash2 size={14} />Delete project</button></div></>}
          {modal === 'reset' && <><div className="confirm-icon reset-confirm"><RefreshCw size={19} /></div><div className="confirm-copy"><div className="modal-eyebrow">RESET PROJECT</div><h2>Back to the beginning?</h2><p>This restores <b>{activeProject?.name}</b> to its original template code. Your latest edits will be replaced.</p></div><div className="modal-footer"><button className="secondary-button" onClick={() => setModal(null)}>Keep editing</button><button className="primary-button" onClick={resetActiveProject}><RefreshCw size={14} />Reset project</button></div></>}
          {modal === 'clearAll' && <><div className="confirm-icon danger-confirm"><Trash2 size={19} /></div><div className="confirm-copy"><div className="modal-eyebrow">CLEAR LOCAL DATA</div><h2>Remove all local projects?</h2><p>This clears {projects.length} {projects.length === 1 ? 'project' : 'projects'} from this browser. Download a backup first if you may need them again.</p></div><div className="modal-footer"><button className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="danger-button" onClick={() => { const blank = emptyProject('Untitled project'); setProjects([blank]); setActiveProjectId(blank.id); setView('editor'); setModal(null); showToast('Local projects cleared', 'info'); }}>Clear projects</button></div></>}
          {modal === 'share' && <><div className="modal-header"><div><div className="modal-eyebrow">SHARE SNAPSHOT</div><h2>Pass the idea along.</h2><p>This link contains a snapshot of your code. No account required.</p></div><button className="icon-button" onClick={() => setModal(null)}><X size={16} /></button></div><div className="share-callout"><LockKeyhole size={15} /><span>Anyone with the link can view and remix this snapshot. Your local project remains private.</span></div><label className="field-label">SHAREABLE LINK<div className="share-input-row"><input readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} /><button className="primary-button" onClick={() => copyText(shareUrl).then(() => showToast('Share link copied', 'success')).catch(() => showToast('Could not copy link', 'error'))}><Copy size={14} />Copy</button></div></label><div className="modal-footer"><span className="share-private-note"><Shield size={13} />Snapshot link · no cloud storage</span><button className="secondary-button" onClick={() => setModal(null)}>Done</button></div></>}
          {modal === 'help' && <><div className="modal-header"><div><div className="modal-eyebrow">QUICK REFERENCE</div><h2>Work at your own pace.</h2><p>A few shortcuts to keep your hands on the code.</p></div><button className="icon-button" onClick={() => setModal(null)}><X size={16} /></button></div><div className="shortcut-list"><div><span><Play size={14} />Run preview</span><kbd>⌘ / Ctrl + Enter</kbd></div><div><span><Check size={14} />Save project</span><kbd>⌘ / Ctrl + S</kbd></div><div><span><WandSparkles size={14} />Format current file</span><kbd>⌘ / Ctrl + ⇧ + F</kbd></div><div><span><Search size={14} />Search projects</span><kbd>⌘ / Ctrl + K</kbd></div><div><span><Search size={14} />Find in current file</span><kbd>⌘ / Ctrl + F</kbd></div><div><span><Search size={14} />Find and replace</span><kbd>⌘ / Ctrl + H</kbd></div></div><div className="help-footnote"><Shield size={13} />Your code executes inside a sandboxed iframe and stays in your browser.</div><div className="modal-footer"><span className="shortcut-platform">{navigator.platform?.includes('Mac') ? 'Mac shortcuts shown' : 'Windows / Linux: use Ctrl instead of ⌘'}</span><button className="secondary-button" onClick={() => setModal(null)}>Got it</button></div></>}
          {modal === 'about' && <><div className="about-modal-brand"><span className="brand-glyph"><span /></span><span>shadow<span>html</span><b>.</b></span></div><div className="modal-eyebrow">A CREATIVE CODE STUDIO</div><h2>Make a little<br /><em>web magic.</em></h2><p className="about-copy">ShadowHtmlEditor is a local-first playground for writing, running, and sharing the small ideas that make the web feel alive.</p><div className="about-badges"><span><Code2 size={13} />HTML · CSS · JS</span><span><LockKeyhole size={13} />Private by default</span><span><Zap size={13} />Runs in your browser</span></div><div className="modal-footer"><span className="version-note">SHADOW HTML · VERSION 1.0</span><button className="primary-button" onClick={() => setModal(null)}>Sounds good <ArrowRight size={14} /></button></div></>}
        </ModalShell>}
      </AnimatePresence>
      <AnimatePresence>{toast && <motion.div className={`toast toast-${toast.kind || 'success'}`} initial={{ opacity: 0, y: 10, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }}><span className="toast-icon">{toast.kind === 'error' ? <X size={14} /> : toast.kind === 'info' ? <MessageSquareText size={14} /> : <Check size={14} />}</span>{toast.message}<button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={13} /></button></motion.div>}</AnimatePresence>
    </div>
  );
}

function ProjectCard({ project, active, onOpen, onMenu, menuOpen, onDuplicate, onRename, onDelete, onShare }: {
  project: Project; active: boolean; onOpen: () => void; onMenu: (event: ReactMouseEvent<HTMLButtonElement>) => void; menuOpen: boolean;
  onDuplicate: () => void; onRename: () => void; onDelete: () => void; onShare: () => void;
}) {
  const template = templates.find((item) => item.id === project.templateId);
  return (
    <motion.article className={`project-card ${active ? 'project-card-active' : ''}`} whileHover={{ y: -3 }} transition={{ duration: .16 }} onClick={onOpen}>
      <div className={`project-card-preview preview-${template?.id || 'custom'}`}><div className="card-window-top"><span><i /><i /><i /></span><small>{template?.category || 'Custom project'}</small><b><MoreHorizontal size={14} /></b></div><div className="card-preview-art"><div className="preview-art-orbit orbit-1" /><div className="preview-art-orbit orbit-2" /><span className="preview-art-glyph">{template?.icon || '✦'}</span><div className="preview-art-lines"><i /><i /><i /></div></div><span className="card-preview-glow" /></div>
      <div className="project-card-body"><div className="project-card-title-row"><ProjectMark project={project} /><div className="project-card-title"><b>{project.name}</b><small>{template?.category || 'Custom project'}</small></div><div className="project-card-menu-anchor"><button className="project-card-menu-button" title="Project actions" onClick={onMenu}><MoreHorizontal size={17} /></button><AnimatePresence>{menuOpen && <motion.div className="project-card-menu floating-menu" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 3 }} onClick={(event) => event.stopPropagation()}><button className="menu-row" onClick={onShare}><Share2 size={13} />Share snapshot</button><button className="menu-row" onClick={onDuplicate}><Copy size={13} />Duplicate</button><button className="menu-row" onClick={onRename}><FileText size={13} />Rename</button><div className="menu-separator" /><button className="menu-row danger-menu-row" onClick={onDelete}><Trash2 size={13} />Delete</button></motion.div>}</AnimatePresence></div></div><div className="project-card-meta"><span><Clock3 size={12} />{formatRelativeTime(project.updatedAt)}</span><span className="project-card-open">Open project <ArrowUpRight size={13} /></span></div></div>
    </motion.article>
  );
}

function TemplateCard({ template, index, onUse }: { template: ProjectTemplate; index: number; onUse: () => void }) {
  return (
    <motion.article className={`template-card template-card-${template.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05, duration: .2 }} whileHover={{ y: -4 }}>
      <div className={`template-preview template-preview-${template.id}`}><div className="template-preview-top"><span><i /><i /><i /></span><small>PREVIEW / 0{index + 1}</small><button title="Use template" onClick={onUse}><ArrowUpRight size={14} /></button></div><div className="template-scene"><div className="template-scene-visual"><span>{template.icon}</span><i /><i /></div><div className="template-scene-copy"><span className="template-scene-kicker">{template.category.toUpperCase()}</span><b>{template.name.split(' ').map((part) => <span key={part}>{part} </span>)}</b><i /><i /><button onClick={onUse}>Start creating <ArrowRight size={11} /></button></div></div><span className="template-preview-noise" /></div>
      <div className="template-card-copy"><div className="template-card-titleline"><span className="template-category">{template.category}</span><span className="template-number">0{index + 1}</span></div><h3>{template.name}</h3><p>{template.description}</p><div className="template-card-footer"><span><Code2 size={12} />HTML · CSS · JS</span><button onClick={onUse}>Use template <ArrowRight size={13} /></button></div></div>
    </motion.article>
  );
}

function SettingToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return <div className="setting-row"><div><b>{label}</b><small>{description}</small></div><button className={`toggle-switch ${checked ? 'toggle-on' : ''}`} role="switch" aria-checked={checked} onClick={onChange}><span /></button></div>;
}

export default App;
