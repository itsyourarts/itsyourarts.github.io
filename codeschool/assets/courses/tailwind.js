/* GodxShadow course: Tailwind CSS — start se end tak */
COURSES.tailwind = {
  name: "Tailwind CSS", color: "#38bdf8", icon: "Tw", blurb: "Utility-first CSS — HTML mein hi design karo, lightning fast.",
  lessons: [
    {
      id: "intro", title: "Tailwind Introduction",
      html: `
<p class="lead"><b>Tailwind</b> utility-first framework hai — custom CSS likhne ki jagah chhoti utility classes jodo: <code class="inline">flex p-4 rounded-lg</code>.</p>
<h2>Setup</h2>
<ul>
  <li><code class="inline">npm install -D tailwindcss</code> + config</li>
  <li>Play CDN (experiments): <code class="inline">&lt;script src="https://cdn.tailwindcss.com"&gt;</code></li>
</ul>
<div class="tip">Editor mein <b>Tailwind IntelliSense</b> extension — classes autocomplete hoti hain.</div>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38bdf8;line-height:1.7}',
              js: 'const code = `&lt;div class="max-w-sm mx-auto p-6 bg-slate-800 rounded-2xl shadow-xl"&gt;\n  &lt;h1 class="text-xl font-bold text-cyan-400"&gt;Neon Card&lt;/h1&gt;\n  &lt;p class="mt-2 text-slate-300"&gt;Bina ek line CSS likhe, fully styled.&lt;/p&gt;\n&lt;/div&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "layout", title: "Spacing & Sizing",
      html: `
<p class="lead">Tailwind philosophy: consistent scale (4px = 1 unit).</p>
<h2>Spacing</h2>
<ul>
  <li><code class="inline">p-4, px-2, py-6, m-8, mx-auto, gap-4</code></li>
  <li>Numbers: 0,0.5,1...96 — <code class="inline">p-4</code> = 1rem = 16px</li>
</ul>
<h2>Sizing</h2>
<ul>
  <li><code class="inline">w-full, w-1/2, w-64, h-screen</code></li>
  <li><code class="inline">max-w-lg, min-h-0</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38bdf8;line-height:1.7}',
              js: 'const code = `&lt;div class="w-full max-w-lg mx-auto p-8"&gt;\n  &lt;div class="mb-4 p-6 bg-slate-700 rounded-xl"&gt;p-6 m-4&lt;/div&gt;\n  &lt;div class="h-32 w-1/2 bg-cyan-500/20 rounded-lg"&gt;w-1/2&lt;/div&gt;\n&lt;/div&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "flex-grid", title: "Flexbox & Grid",
      html: `
<p class="lead">Layouts sin línea de CSS — sirf classes.</p>
<h2>Flex</h2>
<ul>
  <li><code class="inline">flex flex-col items-center justify-between</code></li>
  <li><code class="inline">gap-4</code>, <code class="inline">flex-1</code>, <code class="inline">shrink-0</code></li>
</ul>
<h2>Grid</h2>
<ul>
  <li><code class="inline">grid grid-cols-3 gap-4</code></li>
  <li><code class="inline">col-span-2</code>, <code class="inline">grid-cols-2 md:grid-cols-4</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38bdf8;line-height:1.7}',
              js: 'const code = `&lt;div class="grid grid-cols-3 gap-3"&gt;\n  &lt;div class="col-span-2 p-4 bg-cyan-900 rounded"&gt;span-2&lt;/div&gt;\n  &lt;div class="p-4 bg-fuchsia-900 rounded"&gt;1&lt;/div&gt;\n&lt;/div&gt;\n\n&lt;div class="flex items-center justify-between"&gt;\n  &lt;span&gt;Left&lt;/span&gt;&lt;span&gt;Right&lt;/span&gt;\n&lt;/div&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "typography", title: "Typography & Colors",
      html: `
<p class="lead">Text system — size, weight, color sab scale par.</p>
<h2>Classes</h2>
<ul>
  <li>Size: <code class="inline">text-sm ... text-4xl</code></li>
  <li>Weight: <code class="inline">font-medium font-bold</code></li>
  <li>Colors: <code class="inline">text-cyan-400 bg-slate-800 border-fuchsia-500</code></li>
  <li>Opacity: <code class="inline">bg-white/20</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38bdf8;line-height:1.7}',
              js: 'const code = `&lt;h1 class="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500"&gt;\n  Gradient headline\n&lt;/h1&gt;\n&lt;p class="text-sm text-slate-400 leading-relaxed"&gt;Body text&lt;/p&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "states", title: "States & Variants",
      html: `
<p class="lead">Tailwind ka asli magic — <b>variant prefixes</b>.</p>
<h2>Common prefixes</h2>
<ul>
  <li><code class="inline">hover:bg-cyan-500</code> · <code class="inline">focus:ring</code></li>
  <li><code class="inline">md:grid-cols-3</code> — responsive breakpoints (sm md lg xl)</li>
  <li><code class="inline">dark:bg-slate-900</code> — dark mode</li>
  <li><code class="inline">group-hover:opacity-100</code> — parent par</li>
  <li><code class="inline">active:scale-95</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38bdf8;line-height:1.7}',
              js: 'const code = `&lt;button class="px-6 py-3 rounded-xl bg-cyan-500/10 text-cyan-400\n  border border-cyan-400/50 transition\n  hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_30px_rgba(34,232,255)]\n  active:scale-95"&gt;\n  Neon button\n&lt;/button&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "arbitrary-customize", title: "Arbitrary Values & Config",
      html: `
<p class="lead">Jab scale mein na ho — brackets mein exact value, ya theme config extend karo.</p>
<h2>Arbitrary</h2>
<ul>
  <li><code class="inline">w-[347px]</code> · <code class="inline">bg-[#22e8ff]</code></li>
  <li><code class="inline">shadow-[0_0_25px_#ff3ea5]</code></li>
  <li><code class="inline">before:content-['⚡']</code> — pseudo too!</li>
</ul>
<h2>tailwind.config</h2>
<p><code class="inline">theme.extend.colors.neon = "#22e8ff"</code> → <code class="inline">text-neon</code></p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38bdf8;line-height:1.7}',
              js: 'const code = `// tailwind.config.js\nexport default {\n  theme: {\n    extend: {\n      colors: { neon: "#22e8ff", pink: "#ff3ea5" },\n      fontFamily: { display: ["Orbitron", "sans-serif"] },\n    }\n  }\n}\n// ab: class="text-neon font-display"`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "forms-recipes", title: "Forms & Component Recipes",
      html: `
<p class="lead">Real pages banane ka pattern — utility classes jodkar components banao.</p>
<h2>Form recipe</h2>
<ul>
  <li>Inputs: <code class="inline">w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400</code></li>
  <li>Labels: <code class="inline">block mb-1 text-sm text-slate-400</code></li>
  <li>Buttons: <code class="inline">inline-flex items-center gap-2</code></li>
</ul>
<h2>Card recipe</h2>
<p><code class="inline">rounded-2xl bg-slate-800/60 backdrop-blur border border-white/10 p-6 shadow-xl</code></p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38bdf8;line-height:1.7}',
              js: 'const code = `&lt;form class="max-w-sm space-y-4 p-6 rounded-2xl bg-slate-800/60 border border-white/10"&gt;\n  &lt;div&gt;\n    &lt;label class="block mb-1 text-sm text-slate-400"&gt;Email&lt;/label&gt;\n    &lt;input type="email" class="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white\n      focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400" placeholder="you@x.com"&gt;\n  &lt;/div&gt;\n  &lt;button class="w-full py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black\n    hover:shadow-lg hover:shadow-fuchsia-500/30 transition"&gt;Join&lt;/button&gt;\n&lt;/form&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "wrapup", title: "Tailwind Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — ab tum design system speed se bana sakte ho.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Utility-first approach, spacing scale</li>
  <li>Flex/grid layouts, typography, colors</li>
  <li>hover/responsive/dark variants</li>
  <li>Arbitrary values, custom theme</li>
</ul>
<h2>Agla step</h2>
<p>Component libraries: <b>DaisyUI / Flowbite / shadcn</b>. React+Tailwind combo = industry standard.</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38bdf8;line-height:1.7}',
              js: 'const code = `console.log("Tailwind complete ✔");`;\ndocument.getElementById("out").innerHTML = code;\nconsole.log("Tailwind course complete ✔");' }
    }
  ]
};
