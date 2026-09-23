/* GodxShadow course: React — start se end tak */
COURSES.react = {
  name: "React", color: "#61dafb", icon: "⚛", blurb: "UI banane ki modern library — components, state, hooks.",
  lessons: [
    {
      id: "intro", title: "React Introduction & JSX",
      html: `
<p class="lead"><b>React</b> ek UI library hai — Facebook ne banayi, poora industry standard. UI ko chhote reusable <b>components</b> mein todo.</p>
<h2>JSX — HTML inside JS</h2>
<p><code class="inline">const el = &lt;h1&gt;Hello&lt;/h1&gt;;</code> — browser ko nahi samajhta, Babel/Vite compile karta hai.</p>
<h2>Setup</h2>
<p><code class="inline">npm create vite@latest my-app -- --template react</code> → <code class="inline">npm run dev</code></p>
<div class="tip"><b>Concept:</b> React mein UI = f(state). State badlo, UI khud re-render ho jaata hai.</div>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#61dafb;line-height:1.7}',
              js: 'const code = `function App() {\n    const name = "GodxShadow";\n    return (\n        <div>\n            <h1>Welcome to {name}</h1>\n            <p>JSX mein {} mein koi bhi JS expression.</p>\n            <p>{2 + 2} = 4</p>\n        </div>\n    );\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "components-props", title: "Components & Props",
      html: `
<p class="lead"><b>Component</b> = reusable UI piece (function). <b>Props</b> = parent se child ko data pass karna.</p>
<h2>Basics</h2>
<ul>
  <li>Component naam Capital se shuru</li>
  <li>Props read-only: <code class="inline">function Card({ title }) { ... }</code></li>
  <li><code class="inline">&lt;Card title="Neon" /&gt;</code> se pass</li>
  <li>Children: <code class="inline">&lt;Card&gt;content&lt;/Card&gt;</code> → <code class="inline">props.children</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#61dafb;line-height:1.7}',
              js: 'const code = `function Card({ title, children }) {\n    return (\n        <div className="card">\n            <h3>{title}</h3>\n            {children}\n        </div>\n    );\n}\n\nfunction App() {\n    return (\n        <Card title="Neon Basics">\n            <p>Ye children hai</p>\n        </Card>\n    );\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "state", title: "State & useState",
      html: `
<p class="lead"><b>State</b> = component ka memory. Jab change hota hai, UI automatically update hota hai.</p>
<h2>useState hook</h2>
<ul>
  <li><code class="inline">const [count, setCount] = useState(0);</code></li>
  <li>Objects: <code class="inline">setUser({...user, age: 22})</code> — spread must!</li>
  <li>Prev state: <code class="inline">setCount(c =&gt; c + 1)</code></li>
</ul>
<div class="warn">State directly mutate mat karo (<code class="inline">count++</code> ❌) — setter use karo.</div>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}',
              js: 'const code = `import { useState } from "react";\n\nfunction Counter() {\n    const [count, setCount] = useState(0);\n    return (\n        <div>\n            <h2>Count: {count}</h2>\n            <button onClick={() => setCount(c => c + 1)}>+</button>\n            <button onClick={() => setCount(0)}>Reset</button>\n        </div>\n    );\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "lists-events", title: "Lists, Keys & Events",
      html: `
<p class="lead">React mein loops nahi — <code class="inline">.map()</code> se lists banti hain. Har item ko unique <b>key</b> do.</p>
<h2>Handlers</h2>
<ul>
  <li><code class="inline">onClick={() =&gt; ...}</code> — camelCase!</li>
  <li><code class="inline">onChange={(e) =&gt; setVal(e.target.value)}</code></li>
  <li><code class="inline">onSubmit, onKeyDown, onFocus</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38f2a5;line-height:1.7}',
              js: 'const code = `function TodoList() {\n    const [items, setItems] = useState(["HTML seekho", "CSS seekho"]);\n    const [val, setVal] = useState("");\n\n    const add = () => {\n        if (!val.trim()) return;\n        setItems([...items, val]);\n        setVal("");\n    };\n\n    return (\n        <div>\n            <input value={val} onChange={e => setVal(e.target.value)} />\n            <button onClick={add}>Add</button>\n            <ul>\n                {items.map((t, i) => <li key={i}>{t}</li>)}\n            </ul>\n        </div>\n    );\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "conditional-forms", title: "Conditional Rendering & Forms",
      html: `
<p class="lead">JSX mein if/else logic — ternary, <code class="inline">&amp;&amp;</code>, ya variable assign karke.</p>
<h2>Tarike</h2>
<ul>
  <li><code class="inline">{isLogged ? &lt;Dash/&gt; : &lt;Login/&gt;}</code></li>
  <li><code class="inline">{errors.length &gt; 0 &amp;&amp; &lt;ErrorBox/&gt;}</code></li>
</ul>
<h2>Controlled forms</h2>
<p><code class="inline">value={state} onChange</code> — React hi form ka single source of truth.</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ff3ea5;line-height:1.7}',
              js: 'const code = `function Login() {\n    const [email, setEmail] = useState("");\n    const [done, setDone] = useState(false);\n\n    if (done) return <h2>Welcome back! ⚡</h2>;\n\n    return (\n        <form onSubmit={e => { e.preventDefault(); setDone(true); }}>\n            <input type="email" value={email} required\n                   onChange={e => setEmail(e.target.value)} />\n            <button type="submit">Login</button>\n        </form>\n    );\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "useeffect", title: "useEffect & API Fetch",
      html: `
<p class="lead">Side effects (API, timers, event listeners) — <b>useEffect</b> hook.</p>
<h2>Patterns</h2>
<ul>
  <li><code class="inline">useEffect(() =&gt; {...}, [])</code> — sirf mount par</li>
  <li><code class="inline">useEffect(() =&gt; {...}, [dep])</code> — dep change par</li>
  <li>Cleanup: <code class="inline">return () =&gt; clearInterval(id)</code></li>
</ul>
<div class="tip">Naya React: <code class="inline">useEffect</code> data fetching ke liye sirf jab zaroori ho. Server state ke liye <b>TanStack Query / SWR</b> better.</div>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#22e8ff;line-height:1.7}',
              js: 'const code = `import { useState, useEffect } from "react";\n\nfunction UserCard() {\n    const [user, setUser] = useState(null);\n    const [loading, setLoading] = useState(true);\n\n    useEffect(() => {\n        fetch("https://jsonplaceholder.typicode.com/users/1")\n            .then(r => r.json())\n            .then(u => { setUser(u); setLoading(false); });\n    }, []);\n\n    if (loading) return <p>Loading...</p>;\n    return <h3>{user.name} — {user.email}</h3>;\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "hooks-context", title: "More Hooks & Context",
      html: `
<p class="lead">React 18+ ka toolkit — <b>useRef</b>, <b>useMemo</b>, <b>useCallback</b>, <b>Context</b>.</p>
<h2>Zaroori hooks</h2>
<ul>
  <li><code class="inline">useRef</code> — DOM element ya mutable value (re-render trigger nahi karta)</li>
  <li><code class="inline">useMemo(() =&gt; heavy(), [dep])</code> — computation cache</li>
  <li><code class="inline">useContext</code> — global data bina prop drilling</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}',
              js: 'const code = `import { useRef, createContext, useContext } from "react";\n\nconst ThemeCtx = createContext("neon");\n\nfunction Deep() {\n    const theme = useContext(ThemeCtx);\n    return <span>Theme: {theme}</span>;\n}\n\nfunction App() {\n    const inputRef = useRef(null);\n    return (\n        <ThemeCtx.Provider value="neon">\n            <input ref={inputRef} />\n            <button onClick={() => inputRef.current.focus()}>Focus</button>\n            <Deep />\n        </ThemeCtx.Provider>\n    );\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "router-query", title: "Routing & Ecosystem",
      html: `
<p class="lead">Single-page app mein URL navigation — <b>react-router</b>, plus pro tools.</p>
<h2>react-router</h2>
<p><code class="inline">&lt;BrowserRouter&gt;</code> → <code class="inline">&lt;Route path="/about"&gt;</code> → <code class="inline">&lt;Link to="/about"&gt;</code></p>
<h2>Ecosystem</h2>
<ul>
  <li><b>Vite / Next.js</b> — build &amp; SSR</li>
  <li><b>TanStack Query</b> — server state caching</li>
  <li><b>Zustand / Redux</b> — global state</li>
  <li><b>Tailwind</b> — styling</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38f2a5;line-height:1.7}',
              js: 'const code = `import { BrowserRouter, Routes, Route, Link } from "react-router-dom";\n\nfunction App() {\n    return (\n        <BrowserRouter>\n            <nav><Link to="/">Home</Link> | <Link to="/about">About</Link></nav>\n            <Routes>\n                <Route path="/" element={<Home />} />\n                <Route path="/about" element={<About />} />\n            </Routes>\n        </BrowserRouter>\n    );\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "jsx", title: "JSX Rules (className, style, expressions)",
      html: `
<p class="lead">JSX HTML jaisa lagta hai, par JavaScript hai — rules yaad rakho.</p>
<h2>Rules</h2>
<ul>
  <li>Sirf <b>ek root</b> element (ya <code class="inline">&lt;&gt; fragment &lt;/&gt;</code>)</li>
  <li><code class="inline">class</code> nahi, <code class="inline">className</code> · <code class="inline">for</code> nahi, <code class="inline">htmlFor</code></li>
  <li>Har tag close: <code class="inline">&lt;img /&gt;, &lt;br /&gt;</code></li>
  <li><code class="inline">{ }</code> ke andar koi bhi JS expression</li>
  <li>style = object: <code class="inline">style={{color:"cyan", fontSize:20}}</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#61dafb;line-height:1.7}',
              js: 'const code = `function Profile() {\n    const name = "Shadow";\n    const hp = 96;\n    return (\n        <>\n            <h1 style={{ color: "cyan", fontSize: 24 }}>\n                Player: {name.toUpperCase()}\n            </h1>\n            <progress value={hp} max="100" />\n            <p>Health {hp >= 50 ? "good" : "low"} — {hp}%</p>\n            <label htmlFor="name">Edit:</label>\n            <input id="name" className="neon-input" />\n        </>\n    );\n}`;\ndocument.getElementById("out").textContent = code;' }
    },
    {
      id: "styling", title: "Styling in React (3 tareeke)",
      html: `
<p class="lead">Components ko kaise style karein — pros/cons sab.</p>
<h2>Options</h2>
<ul>
  <li><b>Inline</b>: <code class="inline">style={{...}}</code> — quick, dynamic values</li>
  <li><b>CSS files</b>: <code class="inline">import "./Card.css"</code> — classic</li>
  <li><b>CSS Modules</b>: <code class="inline">styles.title</code> — scoped, no clash</li>
  <li>Conditional class: <code class="inline">className={active ? "on" : ""}</code></li>
  <li>Libraries: styled-components, Tailwind</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#61dafb;line-height:1.7}',
              js: 'const code = `// Card.module.css → .title { color:cyan }\nimport styles from "./Card.module.css";\nimport "./global.css";\n\nfunction Card({ title, active }) {\n    return (\n        <div className={\\`card \${active ? "card--on" : ""}\\`}\n             style={{ borderRadius: 12 }}>\n            <h3 className={styles.title}>{title}</h3>\n            <p style={{ color: active ? "#22e8ff" : "#8f9ac4" }}>\n                {active ? "LIVE" : "idle"}\n            </p>\n        </div>\n    );\n}`;\ndocument.getElementById("out").textContent = code;' }
    },
    {
      id: "useref-memo", title: "useRef, useMemo & useCallback",
      html: `
<p class="lead">Performance hooks — jab re-render aur values manage karni ho.</p>
<h2>Purpose</h2>
<ul>
  <li><code class="inline">useRef</code> — DOM access ya value bina re-render (timer id!)</li>
  <li><code class="inline">useMemo</code> — expensive calc cache</li>
  <li><code class="inline">useCallback</code> — function identity stable (memoized children ke liye)</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#61dafb;line-height:1.7}',
              js: 'const code = `import { useRef, useMemo, useState } from "react";\n\nfunction SearchBox({ items }) {\n    const inputRef = useRef(null);\n    const [q, setQ] = useState("");\n\n    // heavy filter — sirf q ya items badle tabhi dubara chale\n    const results = useMemo(\n        () => items.filter(i => i.includes(q)),\n        [q, items]\n    );\n\n    return (\n        <>\n            <input ref={inputRef} onChange={e => setQ(e.target.value)} />\n            <button onClick={() => inputRef.current.focus()}>\n                Focus karo\n            </button>\n            <p>{results.length} results</p>\n        </>\n    );\n}`;\ndocument.getElementById("out").textContent = code;' }
    },
    {
      id: "custom-hooks", title: "Custom Hooks (logic reuse)",
      html: `
<p class="lead">Apna hook banao — logic components ke beech share karo, clean tarika.</p>
<h2>Rules</h2>
<ul>
  <li>Naam <code class="inline">use</code> se start: <code class="inline">useFetch, useLocalStorage</code></li>
  <li>Andar doosre hooks use kar sakte ho</li>
  <li>Return value ya array-tuple</li>
  <li>Top level call (loops/ifs mein nahi)</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#61dafb;line-height:1.7}',
              js: 'const code = `import { useState, useEffect } from "react";\n\nfunction useLocalStorage(key, initial) {\n    const [val, setVal] = useState(() =>\n        JSON.parse(localStorage.getItem(key)) ?? initial\n    );\n    useEffect(() => {\n        localStorage.setItem(key, JSON.stringify(val));\n    }, [key, val]);\n    return [val, setVal];\n}\n\n// usage — kisi bhi component mein\nfunction Settings() {\n    const [theme, setTheme] = useLocalStorage("theme", "dark");\n    return <button onClick={() =>\n        setTheme(t => t === "dark" ? "light" : "dark")}>\n        Theme: {theme}\n    </button>;\n}`;\ndocument.getElementById("out").textContent = code;' }
    },
    {
      id: "perf-optim", title: "Performance: memo, useMemo, useCallback",
      html: `<p class="lead">React re-renders more than you think - memoization tools stop wasted renders.</p>
<h2>Tools</h2>
<ul>
  <li><code class="inline">React.memo(Component)</code> - skip re-render if props unchanged</li>
  <li><code class="inline">useMemo(fn, deps)</code> - cache expensive computed values</li>
  <li><code class="inline">useCallback(fn, deps)</code> - stable function identity</li>
  <li>Key lists by stable ids; split big components; lazy routes with <code class="inline">React.lazy</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'import { memo, useMemo, useState } from "react";\',\'function Heavy({ n }) {\',\'  const squares = useMemo(() => {\',\'    console.log("computing...");\',\'    return Array.from({ length: n }, (_, i) => i * i);\',\'  }, [n]);\',\'  return <div>{squares.length} squares</div>\',\'}\',\'const Item = memo(function Item({ v }) {\',\'  console.log("item render", v);\',\'  return <li>{v}</li>;\',\'});\',\'export default function App() {\',\'  const [n, setN] = useState(10);\',\'  return <div>\',\'    <button onClick={() => setN(n + 1)}>grows to {n}</button>\',\'    <Heavy n={n} />\',\'    <ul><Item v="stable" /><Item v={n} /></ul>\',\'  </div>;\',\'}\'].join("\\n");' }
    },
    {
      id: "testing-react", title: "Testing Components (React Testing Library)",
      html: `<p class="lead">Test components the way users experience them: render, query by role/text, assert, simulate.</p>
<h2>Core flow</h2>
<ul>
  <li><code class="inline">render(&lt;App /&gt;)</code> into the document</li>
  <li>Queries: <code class="inline">screen.getByRole("button")</code>, <code class="inline">getByText</code>, <code class="inline">findByText</code> (async)</li>
  <li><code class="inline">fireEvent</code> / <code class="inline">userEvent</code> for clicks, typing</li>
  <li>Assert with <code class="inline">expect(...).toBeInTheDocument()</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'import { render, screen, fireEvent } from "@testing-library/react";\',\'import Counter from "./Counter";\',\'test("increments on click", () => {\',\'  render(<Counter />);\',\'  const btn = screen.getByRole("button", { name: /add/i });\',\'  expect(screen.getByText("Count: 0")).toBeInTheDocument();\',\'  fireEvent.click(btn);\',\'  fireEvent.click(btn);\',\'  expect(screen.getByText("Count: 2")).toBeInTheDocument();\',\'});\'].join("\\n");' }
    },
    {
      id: "forms-deep", title: "Forms: Controlled Inputs at Scale",
      html: `<p class="lead">Real forms need validation, dirty state, and multi-field management - patterns beyond the basics.</p>
<h2>Pattern</h2>
<ul>
  <li>One state object + a single <code class="inline">handleChange</code> for all fields</li>
  <li>Validate on blur + on submit; show inline errors</li>
  <li><code class="inline">FormEvent</code> preventDefault, disable submit until valid</li>
  <li>For big apps: react-hook-form / Formik (uncontrolled under the hood)</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'import { useState } from "react";\',\'export default function Signup() {\',\'  const [f, setF] = useState({ name: "", email: "", pw: "" });\',\'  const [touched, setTouched] = useState({});\',\'  const errors = {\',\'    name: f.name.length < 2 ? "too short" : "",\',\'    email: !/\\\\S+@\\\\S+\\\\.\\\\S+/.test(f.email) ? "invalid email" : "",\',\'    pw: f.pw.length < 6 ? "min 6 chars" : "",\',\'  };\',\'  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });\',\'  const valid = !errors.name && !errors.email && !errors.pw;\',\'  return (\',\'    <form onSubmit={(e) => { e.preventDefault(); if (valid) alert("saved " + f.name); }}>\',\'      <input value={f.name} onChange={set("name")} onBlur={() => setTouched({ ...touched, name: 1 })} />\',\'      {touched.name && errors.name && <small>{errors.name}</small>}\',\'      <button disabled={!valid}>Sign up</button>\',\'    </form>\',\'  );\',\'}\'].join("\\n");' }
    },
    {
      id: "error-boundary", title: "Error Boundaries - Catch Render Crashes",
      html: `<p class="lead">Error boundaries catch JS errors in the render tree and show a fallback instead of a white screen.</p>
<h2>Usage</h2>
<ul>
  <li>Class component with <code class="inline">static getDerivedStateFromError(err)</code></li>
  <li><code class="inline">componentDidCatch(err, info)</code> - log the component stack</li>
  <li>Wrap subtrees; they do NOT catch event handlers or async code</li>
  <li>Combine with a "retry" state reset for graceful recovery</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'import { Component } from "react";\',\'class Boundary extends Component {\',\'  state = { err: null };\',\'  static getDerivedStateFromError(err) { return { err }; }\',\'  componentDidCatch(err, info) { console.error("crash:", err, info.componentStack); }\',\'  render() {\',\'    if (this.state.err) {\',\'      return <div>\',\'        Something broke: {this.state.err.message}\',\'        <button onClick={() => this.setState({ err: null })}>Try again</button>\',\'      </div>;\',\'    }\',\'    return this.props.children;\',\'  }\',\'}\',\'function Boom() { throw new Error("demo crash"); }\',\'export default function App() {\',\'  return <Boundary><Boom /></Boundary>;\',\'}\'].join("\\n");' }
    },
    {
      id: "suspense", title: "Suspense &amp; React.lazy - Load on Demand",
      html: `<p class="lead">Code-split heavy routes and show a fallback while async UI (components, data) is loading.</p>
<h2>How</h2>
<ul>
  <li><code class="inline">const Chart = lazy(() =&gt; import("./Chart"))</code> - separate bundle</li>
  <li><code class="inline">&lt;Suspense fallback={...}&gt;&lt;Chart /&gt;&lt;/Suspense&gt;</code></li>
  <li>Nested Suspense = finer fallback boundaries</li>
  <li>Pairs with <code class="inline">useTransition</code> for non-blocking UI</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'import { lazy, Suspense } from "react";\',\'const Heavy = lazy(() => Promise.resolve({ default: () => <div>Heavy chart loaded in its own chunk</div> }));\',\'function Chart() {\',\'  return <div>chart placeholder</div>;\',\'}\',\'export default function App() {\',\'  return (\',\'    <div>\',\'      <Suspense fallback={<div>Loading chart...</div>}>\',\'        <Heavy />\',\'      </Suspense>\',\'    </div>\',\'  );\',\'}\'].join("\\n");' }
    },
    {
      id: "react-advanced", title: "Advanced: context-perf, portals, refs patterns",
      html: `<p class="lead">Production-level React: optimizing context, rendering portals (modals/toasts), and orchestrating refs.</p>
<h2>Topics</h2>
<ul>
  <li>Split context by update frequency; <code class="inline">useContext</code> only where needed</li>
  <li><code class="inline">createPortal(child, root)</code> - render into <code class="inline">document.body</code></li>
  <li>Callback refs for lifecycle; <code class="inline">useImperativeHandle</code> to expose APIs</li>
  <li>Compound component pattern (<code class="inline">Tabs.Tab</code>)</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'import { createPortal, useRef, useState } from "react";\',\'function Modal({ open, onClose, children }) {\',\'  if (!open) return null;\',\'  return createPortal(\',\'    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)" }} onClick={onClose}>\',\'      <div style={{ margin: "20vh auto", width: 320, background: "#111", padding: 20 }} onClick={(e) => e.stopPropagation()}>\',\'        {children}\',\'        <button onClick={onClose}>Close</button>\',\'      </div>\',\'    </div>\',\'    document.body\',\'  );\',\'}\',\'export default function App() {\',\'  const [open, setOpen] = useState(false);\',\'  return (\',\'    <div>\',\'      <button onClick={() => setOpen(true)}>Open portal modal</button>\',\'      <Modal open={open} onClose={() => setOpen(false)}>Portal content!</Modal>\',\'    </div>\',\'  );\',\'}\'].join("\\n");' }
    },
    {
      id: "wrapup", title: "React Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — components se lekar ecosystem tak.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>JSX, components, props</li>
  <li>State, events, lists, keys, controlled forms</li>
  <li>useEffect, useRef, useMemo, Context</li>
  <li>Routing + ecosystem tools</li>
</ul>
<h2>Agla step</h2>
<p><b>Next.js</b> — React ka full-stack framework. Ya <b>React Native</b> se mobile app banao.</p>
<div class="tip"><b>Project:</b> React mein GodxShadow ka neon dashboard banao — hooks sare use karke.</div>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#61dafb;line-height:1.7}',
              js: 'const code = `function Done() {\n    return <h1>React complete ✔ — ab ship karo! 🚀</h1>;\n}`;\ndocument.getElementById("out").innerHTML = code;\nconsole.log("React course complete ✔");' }
    }
  ]
};
