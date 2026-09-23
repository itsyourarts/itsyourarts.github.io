/* GodxShadow course: JSON — start se end tak */
COURSES.json = {
  name: "JSON", color: "#7dd4ff", icon: "{ }", blurb: "Internet ki universal data bhasha — har API isi mein baat karti hai.",
  lessons: [
    {
      id: "intro", title: "JSON Introduction",
      html: `
<p class="lead"><b>JSON = JavaScript Object Notation.</b> Text format data store/transfer karne ka — servers ↔ browser ↔ apps sab isko samajhte hain.</p>
<h2>Kya dikhta hai</h2>
<h2>Rules (strict!)</h2>
<ul>
  <li>Keys hamesha <b>double quotes</b> mein</li>
  <li>Comments allowed <b>nahi</b></li>
  <li>Trailing comma <b>nahi</b></li>
  <li>Values: string, number, boolean, null, object, array</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#7dd4ff;line-height:1.7}',
              js: 'const code = `{\n  "name": "GodxShadow",\n  "courses": 35,\n  "free": true,\n  "tags": ["html", "css", "js"],\n  "founder": null,\n  "address": {\n    "city": "Delhi",\n    "pin": 110001\n  }\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "syntax", title: "Syntax Deep Dive",
      html: `
<p class="lead">Har valid JSON samajhne ke simple rules.</p>
<h2>Valid vs invalid</h2>
<ul>
  <li>✅ <code class="inline">{"age": 21}</code> · ❌ <code class="inline">{age: 21}</code></li>
  <li>✅ <code class="inline">"127.0.0.1"</code> · ❌ <code class="inline">'single quotes'</code></li>
  <li>Escape: <code class="inline">\\" \\n \\t \\\\</code></li>
</ul>
<h2>Nested structures</h2>
<p>Object ke andar object/array — unlimited depth.</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38f2a5;line-height:1.7}',
              js: 'const code = `{\n  "user": {\n    "name": "Shadow",\n    "skills": [\n      { "id": "html", "done": true },\n      { "id": "css", "done": false }\n    ]\n  },\n  "meta": {\n    "version": 1,\n    "updated": "2026-09-22T10:30:00Z"\n  }\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "js", title: "JSON in JavaScript",
      html: `
<p class="lead">Browser/Node mein JSON ke 2 core methods.</p>
<h2>Parse & Stringify</h2>
<ul>
  <li><code class="inline">JSON.parse(text)</code> → JS object (invalid JSON = error!)</li>
  <li><code class="inline">JSON.stringify(obj)</code> → JSON text</li>
  <li>Pretty print: <code class="inline">JSON.stringify(obj, null, 2)</code></li>
  <li>localStorage ke saath — objects isi se save hote hain</li>
</ul>`,
      seed: { html: '<pre id="out">Loading...</pre>',
              css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}button{padding:8px 16px;border:0;border-radius:8px;background:#22e8ff;font-weight:700;cursor:pointer}',
              js: 'const out = document.getElementById("out");\nconst obj = { course: "JSON", done: true };\nconst text = JSON.stringify(obj, null, 2);\nout.textContent = text;\n\nconst back = JSON.parse(text);\nconsole.log(back.course, typeof back);' }
    },
    {
      id: "apis", title: "JSON + APIs (fetch)",
      html: `
<p class="lead">Real-world JSON — APIs se lena, bhejna.</p>
<h2>Fetch</h2>
<ul>
  <li>GET: <code class="inline">const d = await res.json()</code></li>
  <li>POST: <code class="inline">body: JSON.stringify(obj)</code> + <code class="inline">Content-Type: application/json</code> header</li>
</ul>
<div class="tip">Har modern API (REST) JSON mein baat karti hai. Response dekhne ke liye browser DevTools → Network tab.</div>`,
      seed: { html: '<button id="go">API se data lao</button><pre id="out"></pre>',
              css: 'body{background:#05060d;padding:16px;font-family:sans-serif}pre{color:#38f2a5}button{padding:8px 16px;border:0;border-radius:8px;background:#ff3ea5;color:#fff;font-weight:700;cursor:pointer}',
              js: 'document.getElementById("go").onclick = async () => {\n  const out = document.getElementById("out");\n  out.textContent = "Loading...";\n  try {\n    const r = await fetch("https://jsonplaceholder.typicode.com/users/1");\n    const d = await r.json();\n    out.textContent = JSON.stringify({ name: d.name, email: d.email }, null, 2);\n  } catch (e) { out.textContent = "Error: " + e.message; }\n};' }
    },
    {
      id: "validate", title: "Validation & JSON Schema",
      html: `
<p class="lead">Bade projects mein JSON structure validate karna — schema likh ke.</p>
<h2>JSON Schema basics</h2>
<ul>
  <li><code class="inline">type: "object|array|string|number"</code></li>
  <li><code class="inline">required: ["name"]</code></li>
  <li><code class="inline">minimum / minLength / pattern</code></li>
</ul>
<p>Libraries: JS mein <b>ajv</b>, Python mein <b>jsonschema</b>, TypeScript mein types + <b>zod</b>.</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}',
              js: 'const code = `{\n  "$schema": "https://json-schema.org/draft/2020-12/schema",\n  "type": "object",\n  "required": ["name", "email"],\n  "properties": {\n    "name":  { "type": "string", "minLength": 2 },\n    "email": { "type": "string", "format": "email" },\n    "age":   { "type": "number", "minimum": 0 }\n  }\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "nested", title: "Nested Objects & Arrays",
      html: `
<p class="lead">Real-world JSON kabhi flat nahi hota — nesting master karo.</p>
<h2>Patterns</h2>
<ul>
  <li>Object ke andar object: <code class="inline">{"user": {"name": "..."}}</code></li>
  <li>Arrays of objects — API lists ka standard</li>
  <li>Mixed arrays bhi valid (par avoid karo)</li>
  <li>Access in JS: <code class="inline">data.users[0].name</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffd166;line-height:1.7}',
              js: 'const code = `{\n  "app": "GodxShadow",\n  "stats": { "courses": 35, "lessons": 452 },\n  "users": [\n    { "id": 1, "name": "Ravi", "skills": ["c#", "sql"] },\n    { "id": 2, "name": "Asha", "skills": ["react", "css"] }\n  ],\n  "meta": {\n    "updated": "2026-09-22",\n    "tags": ["tutorial", "free"],\n    "author": { "name": "Shadow", "verified": true }\n  }\n}`;\ndocument.getElementById("out").textContent = code;' }
    },
    {
      id: "langs", title: "JSON in Python, C# & JS",
      html: `
<p class="lead">Ek hi JSON — har language mein parse/serialize kaise hota hai.</p>
<h2>Cross-language</h2>
<ul>
  <li><b>JS</b>: <code class="inline">JSON.parse()</code> / <code class="inline">JSON.stringify()</code></li>
  <li><b>Python</b>: <code class="inline">json.loads()</code> / <code class="inline">json.dumps()</code></li>
  <li><b>C#</b>: <code class="inline">JsonSerializer.Deserialize&lt;T&gt;()</code></li>
  <li>Types map: object→dict/class, array→list, number→int/double</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffd166;line-height:1.7}',
              js: 'const code = `// JavaScript\nconst js = JSON.parse("{\\"n\\": 42}");\nconsole.log(js.n, JSON.stringify({n: 42}));\n\n# Python\nimport json\nd = json.loads("{\\"n\\": 42}")\nprint(d["n"], json.dumps({"n": 42}))\n\n// C#\nrecord Item(int N);\nvar x = JsonSerializer.Deserialize<Item>("{ \\"N\\": 42 }");\nConsole.WriteLine(x.N);\nConsole.WriteLine(JsonSerializer.Serialize(new Item(42)));`;\ndocument.getElementById("out").textContent = code;' }
    },
    {
      id: "schema-deep", title: "JSON Schema Validation",
      html: `
<p class="lead">Contract likh do — galat JSON aaye to reject karo.</p>
<h2>Keywords</h2>
<ul>
  <li><code class="inline">type, properties, required</code></li>
  <li><code class="inline">minimum, maxLength, pattern (regex), enum</code></li>
  <li><code class="inline">items</code> — array elements ki shape</li>
  <li>Validators: ajv (JS), pydantic (Python desktop/JSONSchema)</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffd166;line-height:1.7}',
              js: 'const code = `{\n  "$schema": "https://json-schema.org/draft/2020-12/schema",\n  "title": "User",\n  "type": "object",\n  "required": ["id", "email"],\n  "properties": {\n    "id":    { "type": "integer", "minimum": 1 },\n    "name":  { "type": "string", "maxLength": 50 },\n    "email": { "type": "string", "format": "email" },\n    "role":  { "enum": ["admin", "user", "guest"] },\n    "tags":  { "type": "array", "items": { "type": "string" } }\n  }\n}`;\ndocument.getElementById("out").textContent = code;' }
    },
    {
      id: "json-files", title: "JSON Files - Read, Write, Validate",
      html: `<p class="lead">Every language meets JSON files - configs, data drops, exchange formats. Know the safe read/write patterns.</p>
<h2>Patterns</h2>
<ul>
  <li>Read: parse once, then navigate (<code class="inline">data.users[0].name</code>)</li>
  <li>Write: pretty-print for humans, compact for machines</li>
  <li>Validate structure before use - never trust external JSON</li>
  <li>UTF-8 everywhere; <code class="inline">ensure_ascii=false</code> where supported</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'import json, os\',\'data = {\',\'    "app": "godxshadow",\',\'    "users": [{"name": "Ravi", "city": "Delhi"}, {"name": "Mia", "city": "Mumbai"}],\',\'    "limits": {"max": 100, "retry": 3},\',\'}\',\'path = "config.json"\',\'with open(path, "w", encoding="utf-8") as f:\',\'    json.dump(data, f, indent=2, ensure_ascii=False)\',\'with open(path, encoding="utf-8") as f:\',\'    loaded = json.load(f)\',\'print("roundtrip ok:", loaded == data)\',\'print("first user:", loaded["users"][0]["name"])\',\'print("size on disk:", os.path.getsize(path), "bytes")\',\'os.remove(path)\'].join("\\n");' }
    },
    {
      id: "streaming", title: "Streaming Large JSON",
      html: `<p class="lead">Gigabyte JSON files don't fit in memory - stream them chunk by chunk instead of parsing all at once.</p>
<h2>Options</h2>
<ul>
  <li>ijson (Python): <code class="inline">items(f, "users.item")</code> - lazy event stream</li>
  <li>NDJSON: one JSON object per line - read line by line</li>
  <li>JSON Lines is the practical choice for logs and ETL</li>
  <li>Server side: stream response arrays to avoid buffering</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'import json\',\'lines = [\',\'    json.dumps({"id": i, "val": i * 7}) for i in range(1000)\',\']\',\'ndjson = "\\\\n".join(lines)\',\'total = 0\',\'count = 0\',\'for line in ndjson.splitlines():\',\'    obj = json.loads(line)   # one object at a time\',\'    total += obj["val"]\',\'    count += 1\',\'print(f"streamed {count} objects, total = {total}")\',\'print("memory: O(1 line) instead of O(all data)")\'].join("\\n");' }
    },
    {
      id: "diff-compare", title: "Comparing & Merging JSON",
      html: `<p class="lead">Version control for JSON configs: detect what changed between two versions and merge them.</p>
<h2>Techniques</h2>
<ul>
  <li>Deep diff: recurse dicts, compare lists by value</li>
  <li>Merge strategies: shallow replace vs deep recursive</li>
  <li>Ordered comparison: sort keys for stable diffs</li>
  <li>Use for: config drift detection, feature flags sync</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'import json\',\'old = {"db": {"host": "a", "port": 5432}, "flags": {"x": True}}\',\'new = {"db": {"host": "b", "port": 5432, "ssl": True}, "flags": {"x": False}, "log": "info"}\',\'def diff(a, b, path=""):\',\'    out = []\',\'    keys = set(a) | set(b)\',\'    for k in sorted(keys):\',\'        p = f"{path}.{k}" if path else k\',\'        if k not in a: out.append(("+", p, b[k]))\',\'        elif k not in b: out.append(("-", p, a[k]))\',\'        elif isinstance(a[k], dict) and isinstance(b[k], dict):\',\'            out += diff(a[k], b[k], p)\',\'        elif a[k] != b[k]: out.append(("~", p, f"{a[k]} -> {b[k]}")\',\'    return out\',\'for op, p, v in diff(old, new):\',\'    print(f"{op} {p}: {v}")\'].join("\\n");' }
    },
    {
      id: "json-advanced", title: "Schemas, Streaming Output & Tools",
      html: `<p class="lead">Production JSON: JSON Schema for contracts, schema validation, and the everyday CLI tools.</p>
<h2>Schema basics</h2>
<ul>
  <li><code class="inline">{"type":"object","properties":{...},"required":[...]}</code></li>
  <li>Validate: Python <code class="inline">jsonschema.validate(instance, schema)</code></li>
  <li>CLI: <code class="inline">jq</code> - the JSON swiss army knife</li>
  <li>Related: JSON5 (comments, trailing commas), JSONL, MessagePack (binary cousin)</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'import json\',\'schema = {\',\'    "type": "object",\',\'    "properties": {\',\'        "name": {"type": "string"},\',\'        "age": {"type": "integer", "minimum": 0},\',\'        "tags": {"type": "array", "items": {"type": "string"}},\',\'    },\',\'    "required": ["name", "age"],\',\'}\',\'doc = {"name": "Ravi", "age": 21, "tags": ["dev", "neon"]}\',\'print("valid doc:", doc["name"] == "Ravi" and doc["age"] >= 0)\',\'print(\\\'jq ".users[0].name" data.json\\\')\',\'print(\\\'jq ".users | map(.age) | add" data.json\\\')\',\'print(\\\'jq "to_entries" data.json\\\')\',\'print(\\\'jq -s "add" part1.json part2.json\\\')\'].join("\\n");' }
    },
    {
      id: "wrapup", title: "JSON Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — ab har API ka payload samajh aaega.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Types, strict rules (quotes, na comments)</li>
  <li>parse/stringify, localStorage</li>
  <li>fetch GET/POST APIs</li>
  <li>Schema validation</li>
</ul>
<h2>Agla step</h2>
<p><b>Node.js</b> mein apni API banao JSON serve karne ke liye!</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#7dd4ff;line-height:1.7}',
              js: 'const code = `{"status": "JSON complete ✔"}`;\ndocument.getElementById("out").innerHTML = code;\nconsole.log("JSON course complete ✔");' }
    }
  ]
};
