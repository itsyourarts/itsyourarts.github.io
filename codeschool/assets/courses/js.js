/* GodxShadow course: JavaScript — start se end tak */
COURSES.js = {
  name: "JavaScript", color: "#ffc857", icon: "JS", blurb: "Bring pages alive — clicks, data, logic, API calls.",
  lessons: [
    {
      id: "intro", title: "JS Introduction",
      html: `
<p class="lead"><b>JavaScript (JS)</b> is the programming language of the web — it makes pages interactive: clicks, animations, data, logic and API calls. It runs in every browser with zero setup.</p>
<h2>What JS does</h2>
<ul>
  <li>Change HTML content & styles live (DOM manipulation)</li>
  <li>React to user actions: clicks, typing, scrolling (events)</li>
  <li>Fetch data from servers without reloading (fetch/AJAX)</li>
  <li>Store data, validate forms, build whole apps (SPAs)</li>
</ul>
<h2>Running JS</h2>
<ul>
  <li>Inline: <code class="inline">&lt;script&gt;…&lt;/script&gt;</code> (end of body is safest)</li>
  <li>External: <code class="inline">&lt;script src="app.js"&gt;&lt;/script&gt;</code></li>
  <li>Output during dev: <code class="inline">console.log()</code> (see it below!)</li>
</ul>`,
      seed: { html: '<h1 id="title">Hello JS</h1>\n<button id="btn">Click me</button>',
              css: 'body { background:#0b0f1e; color:#e7ecff; font-family:sans-serif; padding:20px; }\nbutton { background:#22e8ff; border:0; padding:10px 18px; border-radius:8px; font-weight:bold; cursor:pointer; }',
              js: 'const btn = document.getElementById("btn");\nconst title = document.getElementById("title");\nlet count = 0;\n\nbtn.addEventListener("click", () => {\n  count++;\n  title.textContent = "Clicked " + count + " times";\n  console.log("Button pressed!", count);\n});' }
    },
    {
      id: "variables", title: "Variables & Types",
      html: `
<p class="lead"><b>Variables</b> store data: numbers, text, lists — anything. Modern JS gives you three keywords with different rules.</p>
<h2>let, const, var</h2>
<ul>
  <li><code class="inline">let x = 5</code> — changeable, block-scoped ✅ (default choice for values that change)</li>
  <li><code class="inline">const PI = 3.14</code> — cannot be reassigned; objects inside CAN be modified</li>
  <li><code class="inline">var</code> — old, function-scoped, hoisted weirdly. Avoid in new code.</li>
</ul>
<h2>Core types</h2>
<ul>
  <li>Number (int & float are one type), BigInt, String, Boolean, undefined, null, Symbol</li>
  <li>Everything else is an <b>object</b> (arrays, functions, dates…)</li>
  <li><code class="inline">typeof x</code> — inspect a type · dynamic typing: variables hold any type</li>
  <li>Naming: camelCase, no dashes, cannot start with a digit</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>',
              css: 'body { background:#05060d; padding:20px; }\npre { color:#38f2a5; font-size:1rem; line-height:1.7; }',
              js: 'const name = "GodxShadow";\nlet score = 99;\nconst isNeon = true;\nconst skills = ["HTML", "CSS", "JS"];\n\nconst msg = "Welcome to " + name + "! Score: " + score;\ndocument.getElementById("out").textContent = msg + "\\n" + skills.join(" | ");\nconsole.log(msg);\nconsole.log(typeof score, typeof isNeon, typeof skills);' }
    },
    {
      id: "strings-math", title: "Strings & Math",
      html: `
<p class="lead"><b>Strings</b> are text; <b>Math</b> is the built-in calculator object. You will use both in every single project.</p>
<h2>String essentials</h2>
<ul>
  <li><code class="inline">length, toUpperCase(), toLowerCase(), trim()</code></li>
  <li><code class="inline">slice(a, b), substring(), replace(), split(",")</code></li>
  <li><code class="inline">includes(), startsWith(), endsWith()</code></li>
  <li>Template literals: <code class="inline">&#96;Hi \${name}, age \${age + 1}&#96;</code> — interpolation with backticks</li>
</ul>
<h2>Math utility</h2>
<ul>
  <li><code class="inline">Math.round / floor / ceil / trunc / abs / sqrt / pow</code></li>
  <li><code class="inline">Math.min(a, b)</code>, <code class="inline">Math.max(...nums)</code></li>
  <li><code class="inline">Math.random()</code> → 0…1; random int: <code class="inline">Math.floor(Math.random()*100)</code></li>
  <li>Number conversion: <code class="inline">Number("42"), parseInt(), parseFloat(), String(n), n.toFixed(2)</code></li>
</ul>`,
      seed: { html: '<p id="a"></p><p id="b"></p><p id="c"></p>',
              css: 'body{background:#0b0f1e;color:#e7ecff;font-family:monospace;padding:20px;line-height:2}',
              js: 'const s = "  Neon Dev Academy  ";\ndocument.getElementById("a").textContent = s.trim().toUpperCase();\ndocument.getElementById("b").textContent = "includes(Dev)? " + s.includes("Dev");\n\nconst dice = Math.floor(Math.random() * 6) + 1;\ndocument.getElementById("c").textContent = "Dice: " + dice + " | max(3,9,2)=" + Math.max(3, 9, 2);\nconsole.log("dice roll:", dice);' }
    },
    {
      id: "functions", title: "Functions",
      html: `
<p class="lead"><b>Functions</b> are reusable blocks of logic — give them input (parameters), they return output. Functions are first-class values in JS.</p>
<h2>Three forms</h2>
<ul>
  <li>Declaration: <code class="inline">function add(a, b) { return a + b }</code> — hoisted</li>
  <li>Expression: <code class="inline">const add = function(a, b) {…}</code></li>
  <li>Arrow: <code class="inline">const add = (a, b) =&gt; a + b</code> — short, no own <code class="inline">this</code></li>
</ul>
<h2>Common patterns</h2>
<ul>
  <li>Default parameters: <code class="inline">function greet(name = "Guest")</code></li>
  <li>Rest: <code class="inline">(...nums)</code> collects extras into an array</li>
  <li>Callbacks: pass a function as an argument (<code class="inline">btn.addEventListener("click", fn)</code>)</li>
  <li>return stops the function immediately; nothing after runs</li>
</ul>`,
      seed: { html: '<p id="r1"></p><p id="r2"></p><p id="r3"></p>',
              css: 'body { background:#0b0f1e; color:#e7ecff; font-family:sans-serif; padding:20px; line-height:2; }',
              js: 'function area(w, h) { return w * h; }\nconst double = n => n * 2;\nconst greet = (n = "Guest") => "Hello, " + n + "!";\n\ndocument.getElementById("r1").textContent = "area(4,5) = " + area(4, 5);\ndocument.getElementById("r2").textContent = "double(21) = " + double(21);\ndocument.getElementById("r3").textContent = greet("Shadow");\nconsole.log(area(4,5), double(21), greet());' }
    },
    {
      id: "conditions", title: "Conditions & Logic",
      html: `
<p class="lead">Code branches on <b>conditions</b>: if/else trees, switch for many cases, ternary for one-liners.</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">if (score &gt;= 90) {…} else if (&gt;=60) {…} else {…}</code></li>
  <li><code class="inline">switch (day) { case "Mon": … break; default: … }</code> — remember break!</li>
  <li>Ternary: <code class="inline">age &gt;= 18 ? "adult" : "minor"</code></li>
</ul>
<h2>Truthiness & operators</h2>
<ul>
  <li>Falsy values: <code class="inline">0, "", null, undefined, NaN, false</code> — everything else true</li>
  <li><code class="inline">===</code> strict (type+value) vs <code class="inline">==</code> loose (coerces) — prefer strict</li>
  <li><code class="inline">&&</code> (and) <code class="inline">||</code> (or) <code class="inline">!</code> (not) — short-circuit</li>
  <li><code class="inline">??</code> — nullish coalescing: default only for null/undefined</li>
  <li><code class="inline">?.</code> — optional chaining: <code class="inline">user?.address?.city</code></li>
</ul>`,
      seed: { html: '<p id="grade"></p><p id="msg"></p>',
              css: 'body { background:#0b0f1e; color:#e7ecff; font-family:sans-serif; padding:20px; line-height:2; }',
              js: 'const score = 78;\n\nlet grade;\nif (score >= 90) grade = "A+";\nelse if (score >= 75) grade = "A";\nelse if (score >= 50) grade = "B";\nelse grade = "C";\n\nconst msg = score >= 50 ? "Pass ho gaye 🎉" : "Fail 😢";\n\ndocument.getElementById("grade").textContent = "Grade: " + grade;\ndocument.getElementById("msg").textContent = msg;\nconsole.log(score, grade, msg);' }
    },
    {
      id: "arrays", title: "Arrays & Loops",
      html: `
<p class="lead"><b>Arrays</b> store ordered lists; <b>loops</b> process every item. Modern array methods (map/filter/reduce) are the daily bread of JS.</p>
<h2>Array basics</h2>
<ul>
  <li><code class="inline">const a = [1, 2, 3]; a[0]</code> · <code class="inline">a.length</code> · <code class="inline">a.push(4), a.pop()</code></li>
  <li><code class="inline">includes(), indexOf(), slice(), splice(), join("-")</code></li>
</ul>
<h2>Loop styles</h2>
<ul>
  <li><code class="inline">for (let i = 0; i &lt; n; i++)</code> — classic counted loop</li>
  <li><code class="inline">for (const item of arr)</code> — items · <code class="inline">arr.forEach(fn)</code></li>
  <li><code class="inline">while / do…while</code> — condition-driven</li>
</ul>
<h2>Transform trio</h2>
<ul>
  <li><code class="inline">map(x =&gt; x*2)</code> — new array, each item transformed</li>
  <li><code class="inline">filter(x =&gt; x &gt; 10)</code> — keep matching items</li>
  <li><code class="inline">reduce((acc,x) =&gt; acc+x, 0)</code> — fold to a single value</li>
  <li><code class="inline">find(), some(), every(), sort(), flat()</code> round out the kit</li>
</ul>`,
      seed: { html: '<ul id="list"></ul><p id="sum"></p>',
              css: 'body { background:#05060d; color:#22e8ff; font-family:sans-serif; padding:20px; }\nli { margin:6px 0; }',
              js: 'const prices = [120, 340, 55, 900, 42];\n\nconst big = prices.filter(p => p > 100);\nconst doubled = prices.map(p => p * 2);\nconst total = prices.reduce((a, b) => a + b, 0);\n\nconst ul = document.getElementById("list");\nbig.forEach(p => {\n  const li = document.createElement("li");\n  li.textContent = "₹" + p;\n  ul.appendChild(li);\n});\n\ndocument.getElementById("sum").textContent = "Total = ₹" + total;\nconsole.log("doubled:", doubled);\nconsole.log("total:", total);' }
    },
    {
      id: "objects", title: "Objects & JSON",
      html: `
<p class="lead"><b>Objects</b> group related data as key:value pairs; <b>JSON</b> is the text format used to send that data over the network.</p>
<h2>Object basics</h2>
<ul>
  <li><code class="inline">const user = { name: "Ravi", age: 21 }</code></li>
  <li>Access: <code class="inline">user.name</code> or <code class="inline">user["name"]</code> (dynamic keys!)</li>
  <li>Add/modify/delete: <code class="inline">user.city = "Delhi"; delete user.age</code></li>
  <li><code class="inline">Object.keys(obj), Object.values(obj), Object.entries(obj)</code></li>
  <li>Destructuring: <code class="inline">const { name, age = 18 } = user</code> · spread: <code class="inline">{...user, age: 22}</code></li>
</ul>
<h2>JSON</h2>
<ul>
  <li><code class="inline">JSON.stringify(obj)</code> — object → string (send)</li>
  <li><code class="inline">JSON.parse(str)</code> — string → object (receive)</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>',
              css: 'body { background:#05060d; padding:20px; }\npre { color:#ffc857; line-height:1.7; }',
              js: 'const user = {\n  name: "Shadow",\n  age: 21,\n  skills: ["HTML", "CSS", "JS"],\n  isPro: true\n};\n\nconst { name, skills } = user;\nconst updated = { ...user, city: "Delhi" };\n\nconst out = document.getElementById("out");\nout.textContent =\n  "Name: " + name + "\\n" +\n  "Skills: " + skills.join(", ") + "\\n" +\n  "JSON: " + JSON.stringify(updated, null, 2);\nconsole.log(updated);' }
    },
    {
      id: "dates-timers", title: "Dates & Timers",
      html: `
<p class="lead"><code class="inline">Date</code> handles time; <code class="inline">setTimeout</code>/<code class="inline">setInterval</code> schedule code for later.</p>
<h2>Dates</h2>
<ul>
  <li><code class="inline">new Date()</code> — now · <code class="inline">new Date("2026-09-22")</code> — specific</li>
  <li><code class="inline">getFullYear(), getMonth() (0-based!), getDate(), getDay(), getHours()</code></li>
  <li>Timestamps: <code class="inline">Date.now()</code> (ms since 1970) — great for measuring</li>
</ul>
<h2>Timers</h2>
<ul>
  <li><code class="inline">setTimeout(fn, 2000)</code> — once after 2s · <code class="inline">clearTimeout(id)</code></li>
  <li><code class="inline">setInterval(fn, 1000)</code> — repeats; always keep the id and clear it</li>
  <li>Timers are async — later code does NOT wait for them</li>
</ul>`,
      seed: { html: '<h1 id="clock">--:--:--</h1>\n<p id="msg"></p>',
              css: 'body{background:#05060d;font-family:monospace;text-align:center;padding:30px}\n#clock{color:#22e8ff;text-shadow:0 0 16px #22e8ff}\n#msg{color:#ff3ea5}',
              js: 'const el = document.getElementById("clock");\nconst tick = () => el.textContent = new Date().toLocaleTimeString("en-IN", { hour12: false });\ntick();\nconst id = setInterval(tick, 1000);\n\nsetTimeout(() => {\n  document.getElementById("msg").textContent = "3 second ho gaye!";\n  console.log("timeout fired");\n}, 3000);' }
    },
    {
      id: "dom", title: "DOM Manipulation",
      html: `
<p class="lead">The <b>DOM</b> (Document Object Model) is the live tree of your page — JS can find, change, create and remove any part of it.</p>
<h2>Finding elements</h2>
<ul>
  <li><code class="inline">querySelector(".card")</code> — first match · <code class="inline">querySelectorAll("li")</code> — all</li>
  <li><code class="inline">getElementById("head")</code> — by id (fast, classic)</li>
</ul>
<h2>Changing them</h2>
<ul>
  <li><code class="inline">el.textContent</code> (safe text) · <code class="inline">el.innerHTML</code> (HTML string — careful!)</li>
  <li><code class="inline">el.style.color = "cyan"</code> · <code class="inline">el.classList.add/remove/toggle("active")</code></li>
  <li>Attributes: <code class="inline">el.setAttribute("href", url)</code>, <code class="inline">el.dataset.id</code></li>
  <li>Create/remove: <code class="inline">document.createElement("li")</code>, <code class="inline">parent.append(el)</code>, <code class="inline">el.remove()</code></li>
</ul>`,
      seed: { html: '<h2 id="head">Todo List</h2>\n<input id="inp" placeholder="Naya task...">\n<button id="add">Add</button>\n<ul id="todo"></ul>',
              css: 'body { background:#0b0f1e; color:#e7ecff; font-family:sans-serif; padding:20px; }\ninput { padding:8px; border-radius:8px; border:1px solid #22e8ff; background:#05060d; color:#fff; }\nbutton { padding:8px 14px; border:0; border-radius:8px; background:#ff3ea5; color:#fff; cursor:pointer; font-weight:bold; }\nli { margin:6px 0; cursor:pointer; }\nli.done { text-decoration:line-through; color:#5b6791; }',
              js: 'const inp = document.getElementById("inp");\nconst ul = document.getElementById("todo");\n\ndocument.getElementById("add").addEventListener("click", () => {\n  const v = inp.value.trim();\n  if (!v) return;\n  const li = document.createElement("li");\n  li.textContent = v;\n  li.onclick = () => li.classList.toggle("done");\n  ul.appendChild(li);\n  inp.value = "";\n  console.log("Added:", v);\n});' }
    },
    {
      id: "events", title: "Events",
      html: `
<p class="lead"><b>Events</b> are things that happen on a page — clicks, typing, scrolling. Your code <i>listens</i> and reacts.</p>
<h2>Listening</h2>
<ul>
  <li><code class="inline">btn.addEventListener("click", (e) =&gt; {…})</code> — the modern way</li>
  <li>Common events: <code class="inline">click, input, change, submit, keydown, mousemove, scroll, load</code></li>
  <li>Event object <code class="inline">e</code>: <code class="inline">e.target, e.key, e.clientX</code>, <code class="inline">e.preventDefault()</code></li>
</ul>
<h2>Pro concepts</h2>
<ul>
  <li><b>Event delegation</b>: one listener on the parent, filter by <code class="inline">e.target.matches("li")</code> — works for dynamic children!</li>
  <li><code class="inline">e.stopPropagation()</code> — stop bubbling upward</li>
  <li><code class="inline">removeEventListener</code> — pass the same function reference</li>
</ul>`,
      seed: { html: '<div id="box">Move the mouse here</div>\n<p id="info"></p>',
              css: 'body { background:#05060d; font-family:sans-serif; padding:20px; }\n#box { width:240px; height:140px; display:grid; place-items:center; border:2px solid #b15cff; border-radius:14px; color:#22e8ff; transition:.2s; }\n#info { color:#ff3ea5; }',
              js: 'const box = document.getElementById("box");\nconst info = document.getElementById("info");\n\nbox.addEventListener("mousemove", e => {\n  info.textContent = "x=" + e.offsetX + "  y=" + e.offsetY;\n  box.style.boxShadow = "0 0 " + (10 + e.offsetX / 4) + "px #22e8ff";\n});\n\nbox.addEventListener("click", () => {\n  box.style.background = "#141a33";\n  console.log("Box clicked");\n});\n\ndocument.addEventListener("keydown", e => {\n  console.log("Key:", e.key);\n});' }
    },
    {
      id: "errors", title: "Error Handling & Debugging",
      html: `
<p class="lead">Errors are information, not enemies. Learn to <b>catch</b> them and to <b>debug</b> with the console and debugger.</p>
<h2>try / catch / finally</h2>
<ul>
  <li><code class="inline">try { risky() } catch (e) { handle(e) } finally { alwaysRuns() }</code></li>
  <li><code class="inline">throw new Error("message")</code> — raise your own</li>
  <li>Async needs <code class="inline">.catch()</code> or await inside try/catch</li>
</ul>
<h2>Debug toolkit</h2>
<ul>
  <li><code class="inline">console.log / warn / error / table / group / time"</code></li>
  <li><code class="inline">debugger;</code> — freezes the page in DevTools (step through!)</li>
  <li>Read stack traces bottom-up: the FIRST line is where it exploded</li>
</ul>`,
      seed: { html: '<p id="out"></p>',
              css: 'body{background:#0b0f1e;color:#e7ecff;font-family:monospace;padding:20px;line-height:2}',
              js: 'function parse(text) {\n  const data = JSON.parse(text);\n  if (!data.name) throw new Error("name missing!");\n  return data;\n}\n\ntry {\n  parse(\'{ "bad json\');\n} catch (err) {\n  document.getElementById("out").textContent = "Pakda gaya: " + err.message;\n  console.error("Caught:", err.message);\n} finally {\n  console.log("finally chala");\n}' }
    },
    {
      id: "oop", title: "Classes & OOP",
      html: `
<p class="lead"><b>Classes</b> are blueprints for objects: properties (data) + methods (behaviour), with constructors, inheritance and encapsulation.</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">class Player { constructor(name) { this.name = name } }</code></li>
  <li><code class="inline">new Player("Shadow")</code> — creates an instance</li>
  <li>Methods live on the prototype — shared across all instances</li>
  <li><code class="inline">static</code> — belongs to the class, not instances (<code class="inline">Math.max</code> style)</li>
</ul>
<h2>Inheritance & privacy</h2>
<ul>
  <li><code class="inline">class Pro extends Player</code> + <code class="inline">super(name)</code></li>
  <li><code class="inline">get / set</code> — computed properties with validation</li>
  <li><code class="inline">#secret</code> — truly private fields (modern JS)</li>
  <li><code class="inline">instanceof Player</code> — type check</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>',
              css: 'body{background:#05060d;padding:20px}pre{color:#38f2a5;line-height:1.8}',
              js: 'class Character {\n  constructor(name, power) {\n    this.name = name;\n    this.power = power;\n  }\n  intro() { return this.name + " (power: " + this.power + ")"; }\n}\n\nclass NeonHero extends Character {\n  intro() { return "⚡ " + super.intro(); }\n}\n\nconst h = new NeonHero("Shadow", 9000);\ndocument.getElementById("out").textContent = h.intro();\nconsole.log(h instanceof Character);' }
    },
    {
      id: "async", title: "Async, Fetch & Promises",
      html: `
<p class="lead">JavaScript is <b>single-threaded</b> — async patterns let it wait for slow work (network, timers) without freezing the page.</p>
<h2>Promises</h2>
<ul>
  <li>A promise = a future value: pending → fulfilled / rejected</li>
  <li><code class="inline">fetch(url).then(r =&gt; r.json()).then(data =&gt; …).catch(err =&gt; …)</code></li>
  <li><code class="inline">Promise.all([a, b])</code> — parallel · <code class="inline">Promise.race</code> — first one wins</li>
</ul>
<h2>async / await (modern style)</h2>
<ul>
  <li><code class="inline">const res = await fetch(url)</code> — code looks synchronous</li>
  <li>Must be inside an <code class="inline">async function</code></li>
  <li>Wrap awaits in try/catch for clean error handling</li>
  <li>Microtasks run before the next render — think about ordering!</li>
</ul>`,
      seed: { html: '<button id="go">Data lao</button>\n<pre id="out">Button dabao...</pre>',
              css: 'body { background:#05060d; font-family:sans-serif; padding:20px; }\nbutton { padding:10px 16px; border:0; border-radius:8px; background:#22e8ff; font-weight:bold; cursor:pointer; }\npre { color:#38f2a5; }',
              js: 'const out = document.getElementById("out");\n\nasync function loadUser() {\n  out.textContent = "Loading...";\n  try {\n    const res = await fetch("https://jsonplaceholder.typicode.com/users/1");\n    if (!res.ok) throw new Error("HTTP " + res.status);\n    const u = await res.json();\n    out.textContent = "Name: " + u.name + "\\nEmail: " + u.email + "\\nCity: " + u.address.city;\n    console.log("User loaded", u.id);\n  } catch (err) {\n    out.textContent = "Error: " + err.message;\n    console.error(err.message);\n  }\n}\n\ndocument.getElementById("go").onclick = loadUser;' }
    },
    {
      id: "storage", title: "Web Storage (localStorage)",
      html: `
<p class="lead"><b>Web Storage</b> keeps small key:value data on the user's machine — settings, carts, drafts — no server needed.</p>
<h2>Two flavors</h2>
<ul>
  <li><code class="inline">localStorage</code> — persists forever (until cleared)</li>
  <li><code class="inline">sessionStorage</code> — dies when the tab closes</li>
</ul>
<h2>API</h2>
<ul>
  <li><code class="inline">setItem("theme", "dark")</code> · <code class="inline">getItem("theme")</code> · <code class="inline">removeItem</code> · <code class="inline">clear()</code></li>
  <li>Everything is a STRING — objects need <code class="inline">JSON.stringify</code> / <code class="inline">JSON.parse</code></li>
  <li>~5MB limit; never store passwords or sensitive data</li>
  <li>Cookies are a different beast (sent with every request, 4KB)</li>
</ul>`,
      seed: { html: '<input id="note" placeholder="Kuch likho...">\n<button id="save">Save</button>\n<p id="view"></p>',
              css: 'body{background:#0b0f1e;color:#e7ecff;font-family:sans-serif;padding:20px}\ninput{padding:9px;border-radius:8px;border:1px solid #22e8ff;background:#05060d;color:#fff}\nbutton{padding:9px 14px;border:0;border-radius:8px;background:#38f2a5;font-weight:bold;cursor:pointer}\n#view{color:#ffc857}',
              js: 'const view = document.getElementById("view");\nview.textContent = "Saved: " + (localStorage.getItem("demoNote") || "(kuch nahi)");\n\ndocument.getElementById("save").onclick = () => {\n  const v = document.getElementById("note").value;\n  localStorage.setItem("demoNote", v);\n  view.textContent = "Saved: " + v;\n  console.log("saved to localStorage");\n};' }
    },
    {
      id: "operators", title: "Operators (Complete Reference)",
      html: `
<p class="lead">JS operators are grouped into arithmetic, assignment, comparison, logic and a few modern gems.</p>
<h2>The full tour</h2>
<ul>
  <li>Arithmetic: <code class="inline">+ - * / % **</code> · <code class="inline">++, --</code> · <code class="inline">+=, -=</code></li>
  <li>Comparison: <code class="inline">===, !==, &lt;, &gt;, &lt;=, &gt;=</code> (strict vs loose = coerces)</li>
  <li>Logic: <code class="inline">&amp;&amp; || !</code> · Ternary <code class="inline">cond ? a : b</code></li>
  <li>Type: <code class="inline">typeof, instanceof</code> · String: <code class="inline">+</code> concatenates</li>
  <li>Modern: <code class="inline">??</code> nullish · <code class="inline">?.</code> optional chain · <code class="inline">??=, ||=, &amp;&amp;=</code></li>
  <li>Spread/rest <code class="inline">...</code> — unpack arrays/objects or gather args</li>
  <li>Bitwise <code class="inline">&amp; | ^ ~ &lt;&lt; &gt;&gt;&gt;</code> — rare but fast tricks</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}',
              js: 'const code = `console.log(7 % 3, 2 ** 8);\n\nconst u = { name: "Sha", pet: null };\nconsole.log(u.pet?.name ?? "no pet");   // no pet\n\n// ?? vs ||\nconst n = 0;\nconsole.log(n || 5, n ?? 5);            // 5 vs 0 — dikkta fark!\n\nconst a = [1, 2];\nconsole.log([...a, 3], { defaults: true });\n\nconst greet = n => "Hi " + (n ?? "Guest");\nconsole.log(greet("Neon"), greet());`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "strings-deep", title: "Strings & Templates Deep",
      html: `
<p class="lead">Strings in JS go far beyond "hello"s — padding, splitting, templates and Unicode details every pro uses.</p>
<h2>Modern methods</h2>
<ul>
  <li><code class="inline">padStart/padEnd(targetLen, fill)</code> — perfect columns</li>
  <li><code class="inline">repeat(3)</code> · <code class="inline">at(-1)</code> — index from end</li>
  <li><code class="inline">replaceAll(re, to)</code> · split→map→join pipelines</li>
  <li><code class="inline">localeCompare</code> — correct multilingual sorting</li>
</ul>
<h2>Template literals</h2>
<ul>
  <li><code class="inline">&#96;multi\nline text&#96;</code> — real line breaks allowed</li>
  <li><code class="inline">\${expression}</code> — any JS inside, not just variables</li>
  <li>Tagged templates — advanced: <code class="inline">String.raw&#96;C:\new\&#96;\&#96;</code></li>
  <li>Unicode: <code class="inline">s.length</code> counts UTF-16 units (emoji = 2!) — iterate with <code class="inline">[...s]</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#22e8ff;line-height:1.7}',
              js: 'const code = `const s = "neon-dev-academy";\nconsole.log(s.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" "));\n\nconsole.log("5".padStart(3, "0"), "9".padEnd(3, "•"), s.at(-4));\n\nconst user = { name: "Sha", level: 99 };\nconsole.log("\\n" + user.name + "\\n⚡ level " + user.level);\n\nconsole.log("ha".repeat(3), "  padded  ".trim());`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "scope", title: "Scope, Closures & Hoisting",
      html: `
<p class="lead"><b>Scope</b> decides where a variable is visible; <b>closures</b> let functions remember their birthplace scope; <b>hoisting</b> explains weird "undefined before declaration" cases.</p>
<h2>Scope rules</h2>
<ul>
  <li>let/const → <b>block</b> scope (<code class="inline">{ }</code>) · var → function scope</li>
  <li>Lookup goes outward: inner scope → parent scopes → global</li>
  <li>Shadowing: inner name hides an outer name</li>
</ul>
<h2>Closure magic</h2>
<ul>
  <li>A function carries its outer variables even after the outer finished (counters, private state, memoization)</li>
  <li>Hoisting: function declarations move to the top; <code class="inline">var</code> names move (value doesn't); let/const hit the TDZ error</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ff3ea5;line-height:1.7}',
              js: 'const code = `function makeCounter(secret) {\n  let count = 0;\n  return {\n    inc: () => ++count,\n    get: () => count,\n    hint: () => secret[0]\n  };\n}\n\nconst c = makeCounter("neon");\nc.inc(); c.inc();\nconsole.log(c.get(), c.hint());   // 2, "n"\n\n// hoisting surprise\nconsole.log(typeof later);        // undefined (var)\nvar later = 42;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "objects-deep", title: "Objects Deep & this",
      html: `
<p class="lead">Pro-level object skills: <code class="inline">this</code> rules, prototype delegation, getters, reference vs copy and structured cloning.</p>
<h2>this — the 4 rules</h2>
<ul>
  <li>Method call: <code class="inline">obj.m()</code> → this = obj</li>
  <li>Plain call: <code class="inline">fn()</code> → this = undefined (strict) / window (sloppy)</li>
  <li><code class="inline">new</code> → this = the fresh instance</li>
  <li><code class="inline">call/apply/bind</code> → this = what you pass · arrow functions borrow <code class="inline">this</code> from outside</li>
</ul>
<h2>Structure</h2>
<ul>
  <li>Objects hold references — <code class="inline">a === b</code> only compares identity</li>
  <li>Shallow copy: <code class="inline">{...obj}</code> · Deep copy: <code class="inline">structuredClone(obj)</code></li>
  <li><code class="inline">Object.freeze / seal / preventExtensions</code> — lock objects</li>
  <li><code class="inline">getters/setters</code>, <code class="inline">Object.defineProperty</code> — fine-grained control</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38f2a5;line-height:1.7}',
              js: 'const code = `const u = { name: "Sha", lvl: 99 };\nconsole.log(Object.keys(u), Object.entries(u));\n\nconst greeter = {\n  name: "Neon",\n  hi() { return "Hi from " + this.name; },\n  hiArrow: () => "Arrow ka this: " + typeof this\n};\nconsole.log(greeter.hi());\n\nconst u2 = Object.freeze({ a: 1 });\n// u2.a = 9;   // strict mode mein error!\nconsole.log(Object.fromEntries(Object.entries(u).map(([k, v]) => [k.toUpperCase(), v])));`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "regex", title: "Regular Expressions",
      html: `
<p class="lead"><b>Regular expressions (RegEx)</b> are compact patterns for searching, validating and extracting text — email validation in one line, find dates in a paragraph, etc.</p>
<h2>Basics</h2>
<ul>
  <li>Literal: <code class="inline">/^\d{3}-\d{4}$/</code> or <code class="inline">new RegExp("pat","i")</code></li>
  <li>Flags: <code class="inline">g</code> global · <code class="inline">i</code> case-insensitive · <code class="inline">m</code> multiline · <code class="inline">s</code> dotNewline</li>
  <li>Metachars: <code class="inline">. \d \w \s ^ $ * + ? {n,m} [a-z] (group) [^not] |</code></li>
  <li>JS: <code class="inline">re.test(str)</code> boolean · <code class="inline">str.match(re)</code> groups · <code class="inline">str.replace(re, "-")</code></li>
  <li><code class="inline">str.matchAll(/(\d+)/g)</code> — iterate capture groups</li>
</ul>
<h2>Sample patterns</h2>
<ul>
  <li>Email-ish: <code class="inline">/^[\w.]+@[\w-]+\.\w{2,}$/</code></li>
  <li>PIN code: <code class="inline">/^\d{6}$/</code> · Hex color: <code class="inline">/^#?[0-9a-f]{6}$/i</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}',
              js: 'const code = `const phone = /^\\d{10}$/;\nconsole.log(phone.test("9876543210"));   // true\nconsole.log(phone.test("123"));          // false\n\nconst emailish = /.+@.+\\..+/;\nconsole.log(emailish.test("x@y.co"));\n\nconst tags = "html,css, js";\nconsole.log(tags.split(/,\\s*/));        // ["html","css","js"]\n\nconst camel = "neonDevAcademy".replace(/([A-Z])/g, " $1").toLowerCase();\nconsole.log(camel);`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "modules", title: "Modules (import/export)",
      html: `
<p class="lead"><b>Modules</b> split code into files with clean imports/exports — no more global soup. Supported natively in browsers.</p>
<h2>Syntax</h2>
<ul>
  <li>Export: <code class="inline">export const PI = 3.14</code> · <code class="inline">export default App</code></li>
  <li>Import: <code class="inline">import App, { PI } from "./app.js"</code></li>
  <li>Rename: <code class="inline">import { readFile as rf } from "fs"</code> · all: <code class="inline">import * as utils</code></li>
  <li>Dynamic: <code class="inline">const mod = await import("./lazy.js")</code> — load on demand</li>
</ul>
<h2>In the browser</h2>
<ul>
  <li><code class="inline">&lt;script type="module"&gt;</code> — automatic strict mode + deferred</li>
  <li>Needs a server (file:// CORS blocks modules) — the editor here handles it ✔</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38f2a5;line-height:1.7}',
              js: 'const code = `// math.js\nexport const PI = 3.14;\nexport function area(r) { return PI * r * r; }\n\n// api.js\nexport default class Api {\n  get(url) { return fetch(url); }\n}\n\n// app.js\nimport Api from "./api.js";\nimport { area, PI } from "./math.js";\nconsole.log(area(2), PI);`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "proto", title: "Prototypes & Classes (Deep)",
      html: `
<p class="lead">Underneath classes lives the <b>prototype chain</b> — JS's original inheritance system. Knowing it makes class behaviour obvious.</p>
<h2>How delegation works</h2>
<ul>
  <li>Every object has a hidden <code class="inline">[[Prototype]]</code> link; property lookup climbs the chain</li>
  <li><code class="inline">Object.getPrototypeOf(obj)</code> · <code class="inline">Object.create(parent)</code></li>
  <li>Methods defined on a class go to <code class="inline">ClassName.prototype</code> — shared memory</li>
  <li><code class="inline">hasOwnProperty</code> — own vs inherited keys</li>
  <li><code class="inline">Object.setPrototypeOf</code> — avoid; prefer classes for speed</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}',
              js: 'const code = `class Hero {\n  intro() { return "hero"; }\n}\nclass NeonHero extends Hero {\n  intro() { return "neon " + super.intro(); }\n}\n\nconst h = new NeonHero();\nconsole.log(h.intro(), h instanceof Hero);\n\n// manual prototype (old-style)\nfunction Old(name) { this.name = name; }\nOld.prototype.say = function () { return "i am " + this.name; };\nconsole.log(new Old("classic").say());`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "wrapup", title: "JS Summary & Next Steps",
      html: `
<p class="lead">JS Summary complete! While these 22 chapters cover the language, daily practice is what makes it stick.</p>
<h2>You can now</h2>
<ul>
  <li>✔ Variables, types and all operators (strict equality!)</li>
  <li>✔ String/number/toolbox mastery + template literals</li>
  <li>✔ Logic: conditions, loops, functions, arrow functions</li>
  <li>✔ Data structures: arrays + map/filter/reduce, objects + JSON</li>
  <li>✔ DOM &amp; events — full interaction on the page</li>
  <li>✔ Async/await + fetch, error handling, storage</li>
  <li>✔ Advanced: closures, modules, regex, prototypes, OOP</li>
</ul>
<h2>Daily cheat sheet</h2>
<ul>
  <li><code class="inline">const n = arr.filter(x =&gt; x &gt; 0).map(x =&gt; x * 2)</code></li>
  <li><code class="inline">const { name = "Guest" } = user</code></li>
  <li><code class="inline">btn.addEventListener("click", e =&gt; e.target.closest(".card"))</code></li>
  <li><code class="inline">const data = await (await fetch(url)).json()</code></li>
  <li><code class="inline">localStorage.setItem("k", JSON.stringify(obj))</code></li>
</ul>
<h2>Next stop → TypeScript</h2>
<p>JavaScript mastered — add static types on top! Open the TypeScript course. 🛡️</p>`,
      seed: { html: '<h1>Level Up! 🚀</h1>\n<p>JS complete — ab frameworks ki duniya.</p>',
              css: 'body{background:#05060d;color:#22e8ff;font-family:sans-serif;text-align:center;padding:40px}\nh1{text-shadow:0 0 18px #22e8ff}p{color:#ff3ea5}',
              js: 'console.log("JS course complete ✔");' }
    }
  ]
};
