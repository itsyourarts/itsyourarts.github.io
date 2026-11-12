# ShadowHtmlEditor

A local-first HTML, CSS, and JavaScript studio built with React, TypeScript, Tailwind CSS, Monaco Editor, Lucide, and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

Build a production bundle with `npm run build`; serve it with `npm run preview`.

The project prepares Monaco's minified AMD assets into `public/monaco` before development and production builds. This keeps the editor self-hosted instead of relying on a third-party CDN.

## Included

- Responsive studio editor with HTML/CSS/JS tabs, Monaco syntax services, format, find/replace, keyboard shortcuts, adjustable split panels, and dark/light themes.
- Sandboxed live preview with desktop, tablet, and mobile viewports, fullscreen, runtime errors, and a JavaScript console.
- Local autosave, multiple projects, project search, duplicate/rename/delete, starter templates, file import, HTML download, JSON backup, ZIP export, and shareable snapshot links.
- Editor preferences for font size, indentation, word wrap, minimap, and live preview.

Projects and settings are stored in the current browser's LocalStorage. Share links encode a snapshot of the project in the URL; they do not upload code to a cloud service. The demo workspace/profile UI is local and does not include authentication or server-side collaboration.
