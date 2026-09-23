/* GodxShadow course: Node.js — start se end tak */
COURSES.nodejs = {
  name: "Node.js", color: "#4cd964", icon: "Nd", blurb: "JavaScript server par — APIs, CLIs, real-time apps.",
  lessons: [
    {
      id: "intro", title: "Node.js Introduction",
      html: `
<p class="lead"><b>Node.js</b> se JavaScript server par chalta hai — browser ke bahar. APIs, CLIs, real-time apps (sockets), tooling sab.</p>
<h2>Kyun Node?</h2>
<ul>
  <li>Same language frontend + backend — learning curve zero</li>
  <li>Non-blocking I/O — ek threaded par massive concurrency</li>
  <li><b>npm</b> — duniya ka sabse bada package registry</li>
</ul>
<h2>Install & run</h2>
<p><code class="inline">node -v</code> check → <code class="inline">node app.js</code> chalao.</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#4cd964;line-height:1.7}',
              js: 'const code = `// app.js\nconst sum = (a, b) => a + b;\n\nconsole.log("Node running on", process.platform);\nconsole.log("Sum:", sum(2, 3));\n`;\n\n// terminal:\n// node app.js`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "modules", title: "Modules & npm",
      html: `
<p class="lead">Code ko files mein organize karo — <b>modules</b>. Packages install karo — <b>npm</b>.</p>
<h2>CommonJS</h2>
<p><code class="inline">module.exports / require()</code></p>
<h2>ES Modules (modern)</h2>
<p><code class="inline">export / import</code> — <code class="inline">package.json</code> mein <code class="inline">"type": "module"</code></p>
<h2>npm</h2>
<ul>
  <li><code class="inline">npm init -y</code> → package.json</li>
  <li><code class="inline">npm install express</code></li>
  <li><code class="inline">"scripts": { "dev": "node app.js" }</code> → <code class="inline">npm run dev</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#4cd964;line-height:1.7}',
              js: 'const code = `// math.js\nexport const add = (a, b) => a + b;\n\n// app.js\nimport { add } from "./math.js";\nconsole.log(add(4, 5));   // 9`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "fs-env", title: "fs, path & env",
      html: `
<p class="lead">File system, paths aur environment variables — server ka daily kaam.</p>
<h2>Built-in modules</h2>
<ul>
  <li><code class="inline">fs.promises.readFile/writeFile</code></li>
  <li><code class="inline">path.join()</code> — cross-platform paths</li>
  <li><code class="inline">process.env.PORT</code> — env vars (<code class="inline">.env</code> + dotenv)</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#63e6ff;line-height:1.7}',
              js: 'const code = `import { readFile, writeFile } from "fs/promises";\nimport path from "path";\n\nawait writeFile("note.txt", "Neon note!");\nconst data = await readFile("note.txt", "utf8");\nconsole.log(data);\n\nconsole.log(path.join("src", "assets", "app.js"));\nconsole.log(process.env.PORT || 3000);`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "http", title: "HTTP Server (basic)",
      html: `
<p class="lead">Bina framework ke bhi Node mein server ban sakta hai — <code class="inline">http</code> module.</p>
<h2>Concept</h2>
<ul>
  <li><code class="inline">http.createServer((req, res) =&gt; {...})</code></li>
  <li><code class="inline">req.method</code>, <code class="inline">req.url</code></li>
  <li><code class="inline">res.writeHead(200, {"content-type": "text/html"})</code> → <code class="inline">res.end()</code></li>
  <li><code class="inline">server.listen(3000)</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ff3ea5;line-height:1.7}',
              js: 'const code = `import http from "http";\n\nconst server = http.createServer((req, res) => {\n    if (req.url === "/api") {\n        res.writeHead(200, { "content-type": "application/json" });\n        res.end(JSON.stringify({ neon: true }));\n    } else {\n        res.writeHead(200, { "content-type": "text/html" });\n        res.end("<h1>GodxShadow Server</h1>");\n    }\n});\n\nserver.listen(3000, () => console.log("Running on :3000"));`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "express", title: "Express Framework",
      html: `
<p class="lead"><b>Express</b> — Node ka most popular web framework. Routing, middleware, APIs aasaan.</p>
<h2>Setup & flow</h2>
<ul>
  <li><code class="inline">npm install express</code></li>
  <li><code class="inline">app.get/post/put/delete</code> — routes</li>
  <li><code class="inline">app.use(express.json())</code> — JSON body parse</li>
  <li><code class="inline">req.params / req.query / req.body</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#22e8ff;line-height:1.7}',
              js: 'const code = `import express from "express";\nconst app = express();\napp.use(express.json());\n\napp.get("/", (req, res) => res.send("GodxShadow API"));\n\napp.get("/users/:id", (req, res) => {\n    res.json({ id: +req.params.id, name: "Shadow" });\n});\n\napp.post("/users", (req, res) => {\n    res.status(201).json({ created: true, ...req.body });\n});\n\napp.listen(3000);`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "middleware", title: "Middleware & REST API",
      html: `
<p class="lead"><b>Middleware</b> — function jo request ke beech mein chale (auth, logging, errors).</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">app.use((req, res, next) =&gt; {...; next();})</code></li>
  <li>Error middleware: 4 args <code class="inline">(err, req, res, next)</code></li>
  <li>Router: <code class="inline">express.Router()</code> — routes ko modules mein</li>
</ul>
<h2>REST conventions</h2>
<p>GET /items · POST /items · GET /items/:id · PUT /items/:id · DELETE /items/:id</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}',
              js: 'const code = `import express, { Router } from "express";\nconst app = express();\napp.use(express.json());\n\n// logger middleware\napp.use((req, res, next) => {\n    console.log(req.method, req.url);\n    next();\n});\n\n// router\nconst api = Router();\napi.get("/ping", (req, res) => res.json({ pong: true }));\napp.use("/api", api);\n\n// error handler\napp.use((err, req, res, next) => {\n    res.status(500).json({ error: err.message });\n});\n\napp.listen(3000);`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "database", title: "Database Connect",
      html: `
<p class="lead">Node se databases — MySQL, PostgreSQL, MongoDB.</p>
<h2>Options</h2>
<ul>
  <li><b>mysql2</b> / <b>pg</b> — SQL drivers</li>
  <li><b>Prisma / Drizzle</b> — type-safe ORM</li>
  <li><b>Mongoose</b> — MongoDB</li>
</ul>
<div class="note">Hamesha credentials <code class="inline">.env</code> mein rakho, code mein <b>kabhi nahi</b>. <code class="inline">.gitignore</code> mein <code class="inline">.env</code> dalna zaroori!</div>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38f2a5;line-height:1.7}',
              js: 'const code = `import mysql from "mysql2/promise";\n\nconst db = await mysql.createConnection({\n    host: "localhost",\n    user: "root",\n    database: "shop",\n    password: process.env.DB_PASS\n});\n\nconst [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [1]);\nconsole.log(rows);`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "deploy", title: "Deployment & Best Practices",
      html: `
<p class="lead">Node app ko internet par le jaana — hosting, env, processes.</p>
<h2>Checklist</h2>
<ul>
  <li><code class="inline">process.env.PORT</code> use karo</li>
  <li><b>PM2</b> se process manage — crash par restart</li>
  <li><b>Helmet</b> — security headers, <b>rate-limit</b></li>
  <li>Hosting: Railway, Render, Vercel (serverless), VPS + Nginx</li>
  <li>Docker se containerize for portability</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}',
              js: 'const code = `// package.json scripts\n{\n    "start": "node src/index.js",\n    "dev": "node --watch src/index.js"\n}\n\n// Dockerfile\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nEXPOSE 3000\nCMD ["node", "src/index.js"]`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "events-streams", title: "Events & Streams",
      html: `
<p class="lead">Node.js ka dil event-driven hai — EventEmitter samajhna pakka.</p>
<h2>Concepts</h2>
<ul>
  <li><code class="inline">EventEmitter.on()</code> / <code class="inline">.emit()</code> — pub-sub</li>
  <li><code class="inline">once()</code> — sirf ek baar</li>
  <li><b>Streams</b> — file/data chunks mein (memory efficient)</li>
  <li><code class="inline">fs.createReadStream().pipe()</code> — classic combo</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#8df29b;line-height:1.7}',
              js: 'const code = `const { EventEmitter } = require("events");\nconst bus = new EventEmitter();\n\nbus.on("login", (user) => console.log(user + " logged in"));\nbus.once("boot", () => console.log("sirf pehli baar"));\n\nbus.emit("boot");    // fires\nbus.emit("boot");    // ignored (once!)\nbus.emit("login", "Shadow");\nbus.emit("login", "Shadow2");\n\n// Streams (pipe)\n// const fs = require("fs");\n// fs.createReadStream("big.mp4").pipe(res);\nconsole.log("events flow samjha!");`;\ndocument.getElementById("out").textContent = code;' }
    },
    {
      id: "async-patterns", title: "Async Patterns (Callbacks → async/await)",
      html: `
<p class="lead">Node non-blocking hai — async patterns mastery zaroori.</p>
<h2>Evolution</h2>
<ul>
  <li><b>Callbacks</b> — purana style, "callback hell"</li>
  <li><b>Promises</b> — <code class="inline">.then().catch()</code> chain</li>
  <li><b>async/await</b> — readable modern style</li>
  <li><code class="inline">Promise.all()</code> — parallel · <code class="inline">Promise.race()</code> — fastest</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#8df29b;line-height:1.7}',
              js: 'const code = `const wait = (ms) => new Promise(r => setTimeout(r, ms));\n\nasync function loadDashboard() {\n    try {\n        console.log("loading...");\n        const [user, posts] = await Promise.all([\n            wait(300).then(() => "user@x.in"),\n            wait(500).then(() => "5 posts")\n        ]);\n        console.log("user:", user);\n        console.log("data:", posts);\n    } catch (e) {\n        console.error("Load failed:", e.message);\n    }\n}\nloadDashboard();\nconsole.log("ye line PEHLE aayegi (non-blocking!)");`;\ndocument.getElementById("out").textContent = code;' }
    },
    {
      id: "npm", title: "npm & package.json Masterclass",
      html: `
<p class="lead">Package management — scripts, versions, lock file sab samjho.</p>
<h2>Commands</h2>
<ul>
  <li><code class="inline">npm init -y</code> · <code class="inline">npm i express</code> · <code class="inline">npm i -D nodemon</code></li>
  <li>Scripts: <code class="inline">"start": "node index.js"</code> → <code class="inline">npm start</code></li>
  <li>Versioning: <code class="inline">^1.2.3</code> minor ok · <code class="inline">~1.2.3</code> patch only</li>
  <li><code class="inline">npx</code> — bina install pakage run (e.g. <code class="inline">npx cowsay hi</code>)</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#8df29b;line-height:1.7}',
              js: 'const code = `// package.json sample\n{\n  "name": "godxshadow-api",\n  "version": "1.0.0",\n  "scripts": {\n    "start": "node server.js",\n    "dev": "nodemon server.js",\n    "test": "node --test"\n  },\n  "dependencies": {\n    "express": "^4.18.2",\n    "dotenv": "^16.3.1"\n  },\n  "devDependencies": {\n    "nodemon": "^3.0.1"\n  }\n}`;\ndocument.getElementById("out").textContent = code;' }
    },
    {
      id: "rest-api", title: "REST API Design (Express)",
      html: `
<p class="lead">Proper RESTful structure — routes, status codes, versioning.</p>
<h2>Best practices</h2>
<ul>
  <li>Nouns, verbs nahi: <code class="inline">GET /api/v1/users</code> ✅</li>
  <li>Status codes: 200 ok · 201 created · 400 bad · 404 not found · 500 error</li>
  <li><code class="inline">app.use("/api/v1/users", userRouter)</code> — modular routers</li>
  <li>Central error handler middleware at end</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#8df29b;line-height:1.7}',
              js: 'const code = `const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst users = express.Router();\nusers.get("/", (req, res) => res.json([{ id: 1, name: "Shadow" }]));\nusers.post("/", (req, res) => {\n    if (!req.body.name) return res.status(400).json({ error: "name required" });\n    res.status(201).json({ id: 2, ...req.body });\n});\nusers.get("/:id", (req, res) => {\n    const u = { id: +req.params.id, name: "Shadow" };\n    u.id === 99 ? res.status(404).json({ error: "not found" }) : res.json(u);\n});\n\napp.use("/api/v1/users", users);\napp.use((err, req, res, next) => res.status(500).json({ error: err.message }));\napp.listen(3000);`;\ndocument.getElementById("out").textContent = code;' }
    },
    {
      id: "cluster", title: "Cluster - Multi-Core Servers",
      html: `<p class="lead">Node runs single-threaded per process; the <code class="inline">cluster</code> module spawns worker processes to use every CPU core.</p>
<h2>Concept</h2>
<ul>
  <li>Master forks workers - each gets its own event loop</li>
  <li>All workers share the same TCP port (SO_REUSEPORT)</li>
  <li>Workers recycle on crash - master can respawn</li>
  <li>For heavier parallelism: <code class="inline">worker_threads</code> (shared memory via SharedArrayBuffer)</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#22e8ff;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'const cluster = require("cluster");\',\'const numCPUs = require("os").cpus().length;\',\'if (cluster.isPrimary) {\',\'    console.log("primary", process.pid, "forking", numCPUs);\',\'    for (let i = 0; i < numCPUs; i++) cluster.fork();\',\'    cluster.on("exit", (w) => { console.log("worker died, respawning"); cluster.fork(); });\',\'} else {\',\'    console.log("worker", process.pid, "ready");\',\'}\'].join("\\n");' }
    },
    {
      id: "tests", title: "Testing with Node's Built-in Test Runner",
      html: `<p class="lead">Node 18+ ships <code class="inline">node:test</code> - no framework needed for unit tests.</p>
<h2>Flow</h2>
<ul>
  <li><code class="inline">import { test, describe } from "node:test"</code></li>
  <li><code class="inline">assert.strictEqual / deepEqual / throws</code></li>
  <li>Run: <code class="inline">node --test</code> - discovers <code class="inline">*.test.js</code></li>
  <li>Subtests with <code class="inline">t.test()</code>, hooks with <code class="inline">before/after</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#22e8ff;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'const { test } = require("node:test");\',\'const assert = require("node:assert");\',\'function add(a, b) { return a + b; }\',\'test("add returns sum", () => {\',\'    assert.strictEqual(add(2, 3), 5);\',\'});\',\'test("add handles negatives", (t) => {\',\'    t.test("minus plus minus", () => {\',\'        assert.strictEqual(add(-1, -2), -3);\',\'    });\',\'});\',\'console.log("tests defined - run: node --test");\'].join("\\n");' }
    },
    {
      id: "security-node", title: "Web Security Essentials",
      html: `<p class="lead">Hardening a Node/Express API: rate limiting, helmet headers, CORS, input validation.</p>
<h2>Checklist</h2>
<ul>
  <li>helmet - sane HTTP security headers</li>
  <li>express-rate-limit - block floods</li>
  <li>Validate + sanitize all input (zod/joi) - never trust clients</li>
  <li>CORS: whitelist origins; parameterized SQL; env-based secrets</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#22e8ff;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'// concept: middleware pipeline order\',\'const chain = ["helmet", "rateLimit", "cors", "express.json", "validator", "router"];\',\'console.log("pipeline:");\',\'for (const [i, mw] of chain.entries())\',\'    console.log("  " + (i + 1) + ". " + mw);\',\'// helmet adds:\',\'const headers = ["X-Content-Type-Options", "X-Frame-Options", "Strict-Transport-Security"];\',\'console.log("\\\\nhelmet headers: " + headers.join(", "));\'].join("\\n");' }
    },
    {
      id: "workers", title: "Worker Threads - CPU Work Off the Main Loop",
      html: `<p class="lead">worker_threads runs real JS in parallel - for CPU-bound tasks without blocking the event loop.</p>
<h2>Pattern</h2>
<ul>
  <li>Parent: <code class="inline">new Worker(file)</code> or inline eval worker</li>
  <li>Exchange via <code class="inline">postMessage</code> (structured clone) or shared memory</li>
  <li>Child: <code class="inline">parentPort.on("message")</code></li>
  <li>Use for: image processing, crypto, compression, heavy math</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#22e8ff;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'// parent.js (concept)\',\'// const { Worker } = require("worker_threads");\',\'// const w = new Worker("./heavy.js");\',\'// w.postMessage({ n: 100000 });\',\'// w.on("message", (m) => console.log("result:", m));\',\'\',\'// heavy.js (concept) — runs in its own thread\',\'// const { parentPort } = require("worker_threads");\',\'// parentPort.on("message", ({ n }) => {\',\'//     let sum = 0;\',\'//     for (let i = 0; i < n; i++) sum += i;\',\'//     parentPort.postMessage(sum);\',\'// });\',\'console.log("worker threads = parallel JS without blocking the event loop");\'].join("\\n");' }
    },
    {
      id: "node-advanced", title: "Streams Deep Dive",
      html: `<p class="lead">Streams are Node's superpower: process huge data in constant memory by moving it in chunks.</p>
<h2>Types</h2>
<ul>
  <li>Readable -&gt; Writable -&gt; Duplex -&gt; Transform</li>
  <li>Pipes: <code class="inline">readable.pipe(transform).pipe(dest)</code></li>
  <li>Backpressure handled automatically by pipe</li>
  <li>Classic: <code class="inline">curl url | gunzip | out.txt</code> in-process</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#22e8ff;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'const { Readable, Transform } = require("stream");\',\'const data = Readable.from(["Hello", ",", " world", "!", ""]);\',\'const upper = new Transform({\',\'    transform(chunk, enc, cb) {\',\'        cb(null, chunk.toString().toUpperCase());\',\'    },\',\'});\',\'let out = "";\',\'data.pipe(upper).on("data", (c) => (out += c)).on("end", () => {\',\'    console.log(out);\',\'}\'].join("\\n");' }
    },
    {
      id: "node-network", title: "net - Raw TCP Sockets",
      html: `<p class="lead">Below HTTP lives <code class="inline">net</code> - create any TCP server: chat rooms, game servers, protocol bridges.</p>
<h2>Basics</h2>
<ul>
  <li><code class="inline">net.createServer((socket) =&gt; ...)</code></li>
  <li><code class="inline">socket.on("data" | "end" | "error")</code> - <code class="inline">socket.write(...)</code></li>
  <li>Frame messages yourself (e.g. newline-delimited)</li>
  <li>Broadcast: keep a Set of sockets, write to all</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#22e8ff;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'const net = require("net");\',\'const server = net.createServer((socket) => {\',\'    socket.write("welcome\\\\n");\',\'    socket.on("data", (d) => {\',\'        const line = d.toString().trim();\',\'        console.log("client said:", line || "(empty)");\',\'        socket.write("echo: " + line + "\\\\n");\',\'    });\',\'});\',\'server.listen(0, () => {\',\'    console.log("TCP server on port", server.address().port);\',\'    server.close();\',\'});\'].join("\\n");' }
    },
    {
      id: "wrapup", title: "Node.js Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — backend ab aapka dost hai.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Modules, npm scripts, fs/path/env</li>
  <li>http + Express routes, middleware, REST</li>
  <li>DB connect, security, deployment</li>
</ul>
<h2>Agla step</h2>
<p>Frontend <b>React</b> + backend <b>Node</b> = <b>MERN stack</b>. Full-stack project banao!</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#4cd964;line-height:1.7}',
              js: 'const code = `console.log("Node.js complete ✔");\n// Agla: MERN stack project!`;\ndocument.getElementById("out").innerHTML = code;\nconsole.log("Node course complete ✔");' }
    }
  ]
};
