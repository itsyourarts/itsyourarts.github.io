/* GodxShadow course: CSS — start se end tak */
COURSES.css = {
  name: "CSS", color: "#22e8ff", icon: "{ }", blurb: "Glow, layout, colors, animation — everything visual starts here.",
  lessons: [
    {
      id: "intro", title: "CSS Introduction",
      html: `
<p class="lead"><b>CSS (Cascading Style Sheets)</b> is the language used to style HTML — colors, fonts, spacing, layouts and animations. HTML builds the skeleton; CSS makes it beautiful.</p>
<h2>Three ways to write CSS</h2>
<ul>
  <li><b>Inline</b> — inside the tag: <code class="inline">style="color:red"</code> (quick tests only)</li>
  <li><b>Internal</b> — a <code class="inline">&lt;style&gt;</code> block inside <code class="inline">&lt;head&gt;</code></li>
  <li><b>External</b> — a <code class="inline">.css</code> file linked with <code class="inline">&lt;link rel="stylesheet"&gt;</code> (best practice)</li>
</ul>
<h2>Rule anatomy</h2>
<ul>
  <li><code class="inline">selector { property: value; }</code> — every rule follows this shape</li>
  <li>"Cascading" = the most specific, latest rule wins (covered in the Specificity chapter)</li>
</ul>`,
      seed: { html: '<h1 class="neon">Neon Heading</h1>\n<p>Ye paragraph CSS se styled hai.</p>', css: 'body { background:#0b0f1e; font-family:sans-serif; }\nh1 { color:#22e8ff; text-shadow:0 0 18px #22e8ff; }\np { color:#ff3ea5; letter-spacing:1px; }\n/* responsive */\n@media(max-width:480px){h1{font-size:1.3rem;text-shadow:0 0 10px #22e8ff}p{font-size:.85rem;letter-spacing:.5px}}' }
    },
    {
      id: "selectors", title: "Selectors",
      html: `
<p class="lead"><b>Selectors</b> are patterns that pick which HTML elements a rule should style. Mastering selectors means mastering CSS.</p>
<h2>Core selectors</h2>
<ul>
  <li><code class="inline">p</code> — element · <code class="inline">.class</code> — class · <code class="inline">#id</code> — id · <code class="inline">*</code> — everything</li>
  <li><code class="inline">a, p</code> — group (both) · <code class="inline">div p</code> — descendant · <code class="inline">div &gt; p</code> — direct child</li>
  <li><code class="inline">[type="email"]</code> — attribute · <code class="inline">a:hover</code> — pseudo-class state</li>
  <li><code class="inline">li:first-child</code>, <code class="inline">li:nth-child(2n)</code> — positional</li>
  <li><code class="inline">::before</code> / <code class="inline">::after</code> — pseudo-elements (extra "free" boxes)</li>
</ul>`,
      seed: { html: '<div class="box">Class wala box</div>\n<div id="special">ID wala box</div>\n<ul><li>Pehla</li><li>Doosra</li></ul>',
              css: '.box { padding:12px; border:1px solid #22e8ff; color:#22e8ff; margin:8px 0; }\n#special { background:#1a0b2e; color:#ff3ea5; padding:12px; margin:8px 0; }\nli:first-child { color:#38f2a5; font-weight:bold; }\nbody { font-family:sans-serif; background:#0b0f1e; }' }
    },
    {
      id: "units-fonts", title: "Units, Fonts & Text",
      html: `
<p class="lead">CSS <b>units</b> measure size; <b>typography properties</b> shape text. Together they control how readable and how responsive your page feels.</p>
<h2>Units</h2>
<ul>
  <li><b>Absolute</b>: <code class="inline">px</code> — device pixels (fixed)</li>
  <li><b>Relative</b>: <code class="inline">em</code> (parent font), <code class="inline">rem</code> (root font), <code class="inline">%</code>, <code class="inline">vw/vh</code> (viewport)</li>
  <li>Rule of thumb: layout in <code class="inline">rem</code>, spacing in <code class="inline">em/px</code>, full-screen sections in <code class="inline">vh</code></li>
</ul>
<h2>Text properties</h2>
<ul>
  <li><code class="inline">font-family, font-size, font-weight, font-style</code></li>
  <li><code class="inline">line-height, letter-spacing, text-align, text-decoration, text-transform</code></li>
  <li>Web fonts: <code class="inline">@font-face</code> or Google Fonts <code class="inline">&lt;link&gt;</code></li>
</ul>`,
      seed: { html: '<p class="px">16px fixed</p>\n<p class="rem">2rem (32px)</p>\n<p class="wide">LETTER SPACING + UPPERCASE</p>',
              css: 'body{background:#05060d;color:#e7ecff;font-family:sans-serif;padding:16px}\n.px{font-size:16px;color:#22e8ff}\n.rem{font-size:2rem;color:#b15cff}\n.wide{letter-spacing:4px;text-transform:uppercase;color:#ff3ea5;font-weight:700}' }
    },
    {
      id: "box-model", title: "Box Model",
      html: `
<p class="lead"><b>Every element is a box.</b> The box model describes how its total size is computed: content → padding → border → margin.</p>
<h2>The four layers</h2>
<ul>
  <li><b>Content</b> — the text/image inside</li>
  <li><b>Padding</b> — space INSIDE the border (background shows through)</li>
  <li><b>Border</b> — the edge line around padding</li>
  <li><b>Margin</b> — space OUTSIDE the border (transparent, pushes neighbours)</li>
</ul>
<h2>Critical rules</h2>
<ul>
  <li>Default (<code class="inline">content-box</code>): <code class="inline">width</code> = content only; padding+border ADD to it</li>
  <li><code class="inline">box-sizing: border-box</code> — width INCLUDES padding+border. Use it everywhere: <code class="inline">* { box-sizing: border-box }</code></li>
  <li>Vertical margins of blocks <b>collapse</b> (the bigger one wins)</li>
</ul>`,
      seed: { html: '<div class="demo">content + padding + border + margin</div>', css: 'body { background:#0b0f1e; font-family:sans-serif; padding:20px; }\n.demo {\n  width: 260px;\n  padding: 20px;\n  border: 3px solid #22e8ff;\n  margin: 30px;\n  background: #141a33;\n  color: #e7ecff;\n  box-shadow: 0 0 24px rgba(34,232,255,.5);\n}\n/* responsive */\n.demo{max-width:100%}\n@media(max-width:520px){.demo{width:100%;margin:14px;padding:14px}}' }
    },
    {
      id: "borders-outlines", title: "Borders, Outlines & Radius",
      html: `
<p class="lead">Borders frame the box; outlines highlight elements (usually for focus); radius rounds corners.</p>
<h2>Properties</h2>
<ul>
  <li><code class="inline">border: width style color;</code> — shorthand; styles: solid, dashed, dotted, double</li>
  <li>Per-side: <code class="inline">border-top</code>, <code class="inline">border-left-color</code> …</li>
  <li><code class="inline">border-radius: 12px</code> — round corners (<code class="inline">50%</code> = circle on a square)</li>
  <li><code class="inline">outline: 3px solid #22e8ff</code> — drawn OUTSIDE the border, does not affect layout (perfect for :focus)</li>
  <li><code class="inline">outline-offset</code> — gap between element and outline</li>
</ul>`,
      seed: { html: '<div class="a">solid + radius</div>\n<div class="b">dashed + outline</div>\n<div class="c">circle</div>',
              css: 'body{background:#05060d;padding:24px;font-family:sans-serif}\ndiv{width:140px;height:80px;margin:14px 0;display:grid;place-items:center;color:#e7ecff}\n.a{border:2px solid #22e8ff;border-radius:14px}\n.b{border:2px dashed #ff3ea5;outline:2px solid #38f2a5;outline-offset:5px}\n.c{width:90px;height:90px;border:3px solid #b15cff;border-radius:50%;box-shadow:0 0 20px rgba(177,92,255,.5)}' }
    },
    {
      id: "colors", title: "Colors & Gradients",
      html: `
<p class="lead">CSS has rich ways to express color — named keywords, hex, rgb(), hsl() — plus smooth <b>gradients</b>.</p>
<h2>Color notations</h2>
<ul>
  <li>Named: <code class="inline">hotpink</code> · Hex: <code class="inline">#ff3ea5</code> (RRGGBBAA optional)</li>
  <li><code class="inline">rgb(34 232 255 / 0.5)</code> — red green blue + alpha</li>
  <li><code class="inline">hsl(180deg 100% 57%)</code> — hue, saturation, lightness (easy to manipulate)</li>
  <li><code class="inline">currentColor</code> — inherits the text color (great for icons)</li>
</ul>
<h2>Gradients</h2>
<ul>
  <li><code class="inline">linear-gradient(90deg, #22e8ff, #ff3ea5)</code></li>
  <li><code class="inline">radial-gradient(circle, …)</code>, <code class="inline">conic-gradient(…)</code></li>
  <li>Hard stops create stripes: <code class="inline">linear-gradient(#22e8ff 50%, #ff3ea5 50%)</code></li>
</ul>`,
      seed: { html: '<h1>Gradient Text</h1>\n<div class="grad-box">Linear gradient box</div>\n<div class="rad-box">Radial gradient box</div>',
              css: 'body { background:#05060d; font-family:sans-serif; padding:20px; }\nh1 {\n  background: linear-gradient(90deg,#22e8ff,#b15cff,#ff3ea5);\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n  font-size: 2.6rem;\n}\n.grad-box, .rad-box { padding:18px; margin:10px 0; border-radius:12px; color:#04121a; font-weight:bold; }\n.grad-box { background: linear-gradient(90deg,#22e8ff,#ff3ea5); }\n.rad-box { background: radial-gradient(circle at 30% 30%, #38f2a5, #0b0f1e); color:#fff; }' }
    },
    {
      id: "variables-pseudo", title: "CSS Variables & Pseudo-elements",
      html: `
<p class="lead"><b>Custom properties</b> (CSS variables) store reusable values; <b>pseudo-elements</b> style parts of elements without extra markup.</p>
<h2>CSS variables</h2>
<ul>
  <li>Declare: <code class="inline">:root { --brand: #22e8ff }</code> · Use: <code class="inline">color: var(--brand)</code></li>
  <li>They cascade and can be changed live (theming, dark mode, JS updates)</li>
  <li>Fallback: <code class="inline">var(--x, cyan)</code></li>
</ul>
<h2>Pseudo-elements</h2>
<ul>
  <li><code class="inline">::before</code> / <code class="inline">::after</code> — insert decorative boxes (need <code class="inline">content: ""</code>)</li>
  <li><code class="inline">::first-letter</code>, <code class="inline">::first-line</code>, <code class="inline">::selection</code>, <code class="inline">::placeholder</code></li>
</ul>`,
      seed: { html: '<div class="tag">Neon badge</div>\n<p class="q">pseudo-element decoration</p>',
              css: ':root { --neon:#22e8ff; --pink:#ff3ea5; }\nbody{background:#05060d;font-family:sans-serif;padding:20px}\n.tag{display:inline-block;padding:10px 18px;color:var(--neon);border:1px solid var(--neon);border-radius:10px}\n.q{color:#e7ecff}\n.q::before{content:"⚡ ";color:var(--pink)}\n.q::after{content:" ⚡";color:var(--pink)}' }
    },
    {
      id: "flexbox", title: "Flexbox",
      html: `
<p class="lead"><b>Flexbox</b> arranges items in one dimension (a row OR a column) with powerful alignment and spacing. It is the default tool for navbars, card rows and centering.</p>
<h2>Container properties</h2>
<ul>
  <li><code class="inline">display: flex</code> — activate</li>
  <li><code class="inline">flex-direction</code>: row | column · <code class="inline">flex-wrap</code>: wrap</li>
  <li><code class="inline">justify-content</code> — main-axis spacing (center, space-between, space-around)</li>
  <li><code class="inline">align-items</code> — cross-axis (center, stretch, baseline)</li>
  <li><code class="inline">gap: 12px</code> — space between items</li>
</ul>
<h2>Item properties</h2>
<ul>
  <li><code class="inline">flex: 1</code> — grow to fill · <code class="inline">flex-shrink</code>, <code class="inline">flex-basis</code></li>
  <li><code class="inline">align-self</code> — override container alignment per item</li>
  <li>Centering trick: <code class="inline">display:flex; justify-content:center; align-items:center</code></li>
</ul>`,
      seed: { html: '<div class="row">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n  <div class="item">4</div>\n</div>', css: 'body { background:#0b0f1e; font-family:sans-serif; margin:0; padding:16px; }\n.row {\n  display:flex;\n  gap:12px;\n  justify-content:space-between;\n  align-items:stretch;\n  flex-wrap:wrap;\n}\n.item {\n  flex:1 1 120px;\n  padding:24px;\n  text-align:center;\n  border-radius:12px;\n  background:linear-gradient(160deg,#141a33,#0b0f1e);\n  border:1px solid #22e8ff;\n  color:#22e8ff;\n  box-shadow:0 0 18px rgba(34,232,255,.25);\n}\n/* responsive */\n@media(max-width:420px){.row{gap:8px}.item{padding:16px 8px}}' }
    },
    {
      id: "grid", title: "CSS Grid",
      html: `
<p class="lead"><b>CSS Grid</b> lays out pages in <b>two dimensions</b> (rows AND columns at once). Use it for whole-page layouts, galleries and dashboards.</p>
<h2>Container properties</h2>
<ul>
  <li><code class="inline">grid-template-columns: 200px 1fr 1fr</code> — column tracks</li>
  <li><code class="inline">repeat(3, 1fr)</code>, <code class="inline">repeat(auto-fit, minmax(180px, 1fr))</code> — responsive tracks</li>
  <li><code class="inline">grid-auto-rows</code>, <code class="inline">gap</code></li>
</ul>
<h2>Placement</h2>
<ul>
  <li><code class="inline">grid-column: 1 / 3</code> — span lines · <code class="inline">grid-column: span 2</code></li>
  <li><code class="inline">grid-template-areas</code> + <code class="inline">grid-area</code> — visual ASCII layouts</li>
  <li><code class="inline">place-items: center</code>, <code class="inline">justify-items</code>, <code class="inline">align-content</code></li>
  <li>Flexbox vs Grid: flex = one axis, grid = two axes</li>
</ul>`,
      seed: { html: '<div class="grid">\n  <div class="c">A</div>\n  <div class="c wide">B (span 2)</div>\n  <div class="c">C</div>\n  <div class="c">D</div>\n  <div class="c">E</div>\n</div>', css: 'body { background:#05060d; font-family:sans-serif; padding:16px; }\n.grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }\n.c {\n  background:#11142a; border:1px solid #b15cff; color:#ff3ea5;\n  padding:22px; text-align:center; border-radius:12px;\n  box-shadow:0 0 18px rgba(177,92,255,.3);\n}\n.wide { grid-column: span 2; }\n/* responsive */\n@media(max-width:640px){.grid{grid-template-columns:repeat(2,1fr)}.wide{grid-column:span 2}}\n@media(max-width:420px){.grid{grid-template-columns:1fr}.wide{grid-column:auto}.c{padding:16px}}' }
    },
    {
      id: "position", title: "Position",
      html: `
<p class="lead"><code class="inline">position</code> controls how an element is placed relative to the page, its parent, or the viewport (fixed navbars, sticky headers, overlays).</p>
<h2>The five values</h2>
<ul>
  <li><code class="inline">static</code> — default; normal flow, offsets ignored</li>
  <li><code class="inline">relative</code> — nudged from its natural spot; becomes an anchor for absolute children</li>
  <li><code class="inline">absolute</code> — removed from flow; positioned to nearest positioned ancestor</li>
  <li><code class="inline">fixed</code> — pinned to the viewport (stays on screen while scrolling)</li>
  <li><code class="inline">sticky</code> — scrolls until it hits the top, then sticks (great for table headers)</li>
</ul>
<h2>Partners</h2>
<ul>
  <li><code class="inline">top / right / bottom / left</code> — offsets</li>
  <li><code class="inline">z-index</code> — stacking order (only on positioned elements)</li>
  <li><code class="inline">inset</code> — shorthand for all four offsets</li>
</ul>`,
      seed: { html: '<div class="parent">\n  Parent box\n  <div class="child">absolute child</div>\n</div>\n<div class="sticky">Sticky bar — scroll me</div>\n<p style="height:600px">Content that makes the page scroll...</p>',
              css: 'body { background:#0b0f1e; color:#e7ecff; font-family:sans-serif; margin:0; }\n.parent { position:relative; height:160px; border:2px dashed #22e8ff; margin:12px; }\n.child { position:absolute; right:10px; bottom:10px; background:#ff3ea5; color:#04121a; padding:8px 12px; border-radius:8px; font-weight:bold; }\n.sticky { position:sticky; top:0; background:#11142a; padding:12px; border-bottom:1px solid #b15cff; color:#22e8ff; }' }
    },
    {
      id: "shadows-filters", title: "Shadows, Filters & Backdrop",
      html: `
<p class="lead">Shadows add depth; filters transform rendering (blur, brightness); <code class="inline">backdrop-filter</code> creates frosted-glass effects.</p>
<h2>Shadows</h2>
<ul>
  <li><code class="inline">box-shadow: x y blur spread color</code> — e.g. <code class="inline">0 8px 24px #0006</code></li>
  <li>Neon glow = tight colored shadow: <code class="inline">0 0 14px #22e8ff</code></li>
  <li><code class="inline">inset</code> keyword → inner shadow · multiple shadows via comma</li>
  <li><code class="inline">text-shadow</code> — same syntax for text</li>
</ul>
<h2>Filters</h2>
<ul>
  <li><code class="inline">filter: blur(4px) | grayscale() | brightness() | contrast() | hue-rotate() | drop-shadow()</code></li>
  <li><code class="inline">backdrop-filter: blur(10px)</code> — blurs whatever is BEHIND the element (glassmorphism)</li>
</ul>`,
      seed: { html: '<div class="glass">Glass card</div>\n<h1 class="neon">NEON</h1>',
              css: 'body{background:radial-gradient(circle at 20% 20%, #b15cff44, transparent),#05060d;font-family:sans-serif;padding:30px}\n.glass{width:220px;padding:22px;border-radius:16px;background:rgba(255,255,255,.06);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.2);color:#fff}\n.neon{color:#22e8ff;text-shadow:0 0 8px #22e8ff,0 0 30px #22e8ff;letter-spacing:8px}\n' }
    },
    {
      id: "responsive", title: 'Responsive Design (Media Queries)',
      html: `
<p class="lead"><b>Responsive design</b> = one layout that adapts to any screen, built on three pillars: a fluid grid, flexible images/media, and media queries. You never build a separate mobile site — the same HTML/CSS reflows.</p>
<h2>The viewport meta (required on mobile)</h2>
<pre>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</pre>
<p>Without it, phones pretend the screen is ~980px wide and zoom everything out — your page looks tiny. This tag says "use the real screen width as 100%".</p>
<h2>Media queries: style by condition</h2>
<ul>
  <li><code class="inline">@media (max-width: 768px) { … }</code> — applies at 768px or SMALLER</li>
  <li><code class="inline">@media (min-width: 768px) { … }</code> — applies at 768px or BIGGER (mobile-first)</li>
  <li>Combine: <code class="inline">@media (min-width: 600px) and (max-width: 1023px) { … }</code> — tablet range only</li>
  <li>Non-width conditions: <code class="inline">(orientation: portrait)</code>, <code class="inline">(prefers-color-scheme: dark)</code>, <code class="inline">(prefers-reduced-motion: reduce)</code>, <code class="inline">(pointer: coarse)</code></li>
</ul>
<h2>Breakpoints — where do they come from?</h2>
<p>Popular defaults: <b>320</b> (phone) · <b>480</b> (large phone) · <b>768</b> (tablet) · <b>1024</b> (laptop) · <b>1280</b> (desktop) · <b>1600</b> (big desktop). Pick them where your <i>content</i> breaks, not where a device name is — design the phone first, then let columns grow.</p>
<h2>The responsive media reset</h2>
<pre>img, video, iframe { max-width: 100%; height: auto; }</pre>
<p>One line that stops media from overflowing small screens — put it in every project.</p>`,
      seed: {
        html: '<div class="bar">Width: <b id="w">?</b>px — tier: <span id="tier">?</span></div>\n<div class="wrap"><div class="c">1</div><div class="c">2</div><div class="c">3</div><div class="c">4</div><div class="c">5</div><div class="c">6</div></div>\n<p class="hint">Drag the split edge (or resize) and the grid swaps 3 → 2 → 1 columns at two breakpoints.</p>',
        css: 'body{margin:0;font-family:sans-serif;background:#05060d;color:#cfd6f2;padding:14px}\n.bar{font-size:.85rem;color:#8f9ac4;margin-bottom:10px}\n.bar b{color:#22e8ff;font-size:1rem}\n#tier{color:#38f2a5;font-weight:700}\n.wrap{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}\n.c{background:#11142a;border:1px solid #262b4d;border-radius:10px;padding:18px 8px;text-align:center;color:#22e8ff;font-weight:700}\n@media(max-width:800px){.wrap{grid-template-columns:repeat(2,1fr)}}\n@media(max-width:520px){.wrap{grid-template-columns:1fr}.c{border-color:#ff3ea5;color:#ff3ea5}}\n.hint{font-size:.78rem;color:#8f9ac4;margin-top:10px}',
        js: 'const w=document.getElementById("w"),t=document.getElementById("tier");\nfunction u(){w.textContent=innerWidth;t.textContent=innerWidth<=520?"PHONE — 1 col":innerWidth<=800?"TABLET — 2 cols":"DESKTOP — 3 cols"}\naddEventListener("resize",u);u();'
      }
    },
    {
      id: "transitions", title: "Transitions & Animations",
      html: `
<p class="lead"><b>Transitions</b> smooth the change between two states (hover, class toggle); <b>animations</b> run multi-step keyframe sequences, even in loops.</p>
<h2>Transitions</h2>
<ul>
  <li><code class="inline">transition: property duration timing delay</code> — e.g. <code class="inline">all .3s ease</code></li>
  <li>Timing functions: <code class="inline">ease, linear, ease-in-out, cubic-bezier(.2,.8,.2,1)</code></li>
  <li>Only animate cheap properties: <code class="inline">transform</code> and <code class="inline">opacity</code> (GPU-friendly)</li>
</ul>
<h2>Keyframes</h2>
<ul>
  <li><code class="inline">@keyframes rise { from {…} to {…} }</code> (or 0% / 50% / 100%)</li>
  <li><code class="inline">animation: rise 1s ease infinite alternate</code></li>
  <li>Shorthand parts: name, duration, timing, delay, count, direction, fill-mode</li>
</ul>`,
      seed: { html: '<div class="glow">Hover me</div>\n<div class="pulse">Pulsing neon</div>',
              css: 'body { background:#05060d; font-family:sans-serif; padding:30px; text-align:center; }\n.glow {\n  display:inline-block; padding:18px 34px; margin:10px;\n  border:2px solid #22e8ff; border-radius:14px; color:#22e8ff;\n  transition: all .35s ease; cursor:pointer;\n}\n.glow:hover {\n  background:#22e8ff; color:#04121a;\n  box-shadow:0 0 30px #22e8ff, 0 0 60px rgba(34,232,255,.5);\n  transform: translateY(-4px) scale(1.03);\n}\n.pulse {\n  display:inline-block; padding:18px 34px; margin:10px;\n  color:#ff3ea5; border-radius:14px; border:2px solid #ff3ea5;\n  animation: pulse 1.6s infinite alternate;\n}\n@keyframes pulse {\n  from { box-shadow:0 0 6px #ff3ea5; text-shadow:0 0 6px #ff3ea5; }\n  to   { box-shadow:0 0 30px #ff3ea5, 0 0 60px rgba(255,62,165,.6); text-shadow:0 0 18px #ff3ea5; }\n}' }
    },
    {
      id: "transforms", title: "Transforms (2D)",
      html: `
<p class="lead"><b>Transforms</b> move, rotate, scale and skew elements <b>without changing document flow</b> — the engine behind almost every smooth CSS effect.</p>
<h2>The functions</h2>
<ul>
  <li><code class="inline">translate(20px, -10px)</code> — move · <code class="inline">translateX/Y</code></li>
  <li><code class="inline">rotate(45deg)</code> · <code class="inline">scale(1.2)</code> · <code class="inline">scaleX/Y</code></li>
  <li><code class="inline">skewX(10deg)</code> — slant</li>
  <li>Chain them: <code class="inline">transform: translateY(-4px) scale(1.05)</code></li>
</ul>
<h2>Extra controls</h2>
<ul>
  <li><code class="inline">transform-origin: center | top left</code> — pivot point</li>
  <li>3D versions exist: <code class="inline">rotateY(180deg)</code> (+ <code class="inline">perspective</code> on parent) — see the 3D flip example</li>
</ul>`,
      seed: { html: '<div class="wrap">\n  <div class="box a">rotate + scale</div>\n  <div class="box b">skew + lift</div>\n  <div class="box c">flip X</div>\n</div>',
              css: 'body{background:#05060d;font-family:sans-serif;padding:34px;display:grid;place-items:center;min-height:80vh}\n.wrap{display:flex;gap:18px;flex-wrap:wrap}\n.box{width:150px;height:110px;display:grid;place-items:center;border-radius:14px;border:2px solid #22e8ff;color:#22e8ff;transition:transform .45s ease, box-shadow .45s ease;cursor:pointer}\n.a:hover{transform:rotate(-7deg) scale(1.12);box-shadow:0 0 26px rgba(34,232,255,.6)}\n.b{border-color:#ff3ea5;color:#ff3ea5}\n.b:hover{transform:skew(-8deg) translateY(-10px)}\n.c{border-color:#38f2a5;color:#38f2a5}\n.c:hover{transform:scaleX(-1) scale(1.08)}' }
    },
    {
      id: "text-effects", title: "Text Effects",
      html: `
<p class="lead">Eye-catching headlines with pure CSS — gradients on text, glowing neon, strokes and shadows.</p>
<h2>Recipes</h2>
<ul>
  <li>Gradient text: <code class="inline">background (gradient) + background-clip: text + color: transparent</code></li>
  <li>Neon glow: stacked <code class="inline">text-shadow</code> → 0 0 5px, 0 0 20px, 0 0 40px same color</li>
  <li>Outline text: <code class="inline">-webkit-text-stroke: 1px #fff</code> + transparent fill</li>
  <li>3D type: many offset <code class="inline">text-shadow</code> layers in a single direction</li>
</ul>`,
      seed: { html: '<h1 class="sign">GODXSHADOW</h1>\n<h1 class="outline">NEON</h1>\n<h1 class="press">PRESS</h1>', css: 'body{background:#05060d;font-family:sans-serif;text-align:center;padding:30px}\n.sign{font-size:2.8rem;letter-spacing:10px;color:#eaffff;text-shadow:0 0 8px #22e8ff,0 0 24px #22e8ff,0 0 60px #1899ff;animation:flick 3s infinite}\n@keyframes flick{0%,92%,96%{opacity:1}94%,98%{opacity:.35}}\n.outline{font-size:3.4rem;color:transparent;-webkit-text-stroke:2px #ff3ea5}\n.press{font-size:3.4rem;color:#8f9ac4;text-shadow:0 2px 0 #5b6791,0 4px 0 #3c4470,0 6px 0 #262b4d,0 10px 18px rgba(0,0,0,.6)}\n/* responsive */\n@media(max-width:600px){.sign{font-size:1.5rem;letter-spacing:4px}.outline{font-size:2rem;-webkit-text-stroke:1.5px #ff3ea5}.press{font-size:2rem}}' }
    },
    {
      id: "buttons-ui", title: "Modern Buttons",
      html: `
<p class="lead">Modern buttons are tiny UI projects on their own — gradients, glow, press states and micro-interactions.</p>
<h2>Recipe parts</h2>
<ul>
  <li>Base: <code class="inline">padding, border-radius, border, font-weight, cursor: pointer</code></li>
  <li>Gradient background with <code class="inline">background-size: 200%</code> → animate position on hover</li>
  <li>States: <code class="inline">:hover</code> lift (translateY -2px) · <code class="inline">:active</code> press (scale .97) · <code class="inline">:focus-visible</code> outline</li>
  <li>Loading state: a spinning <code class="inline">::after</code> circle inside the button</li>
</ul>`,
      seed: { html: '<button class="glow">Glow button</button>\n<button class="arrow">Hover me</button>\n<button class="gb">Gradient border</button>', css: 'body{background:#05060d;display:grid;place-items:center;gap:16px;min-height:80vh;font-family:sans-serif}\nbutton{font-size:1rem;padding:14px 30px;border-radius:12px;cursor:pointer}\n.glow{border:0;background:linear-gradient(90deg,#22e8ff,#b15cff);color:#04121a;font-weight:700;transition:.3s}\n.glow:hover{box-shadow:0 0 24px rgba(34,232,255,.65),0 8px 30px rgba(177,92,255,.4);transform:translateY(-3px)}\n.arrow{background:transparent;border:2px solid #ff3ea5;color:#ff3ea5;transition:.3s;position:relative;padding-right:44px}\n.arrow::after{content:"\\2192";position:absolute;right:18px;transition:.3s}\n.arrow:hover{background:#ff3ea5;color:#fff}\n.arrow:hover::after{transform:translateX(6px)}\n.gb{border:3px solid transparent;background:linear-gradient(#0d1020,#0d1020) padding-box,linear-gradient(90deg,#22e8ff,#ff3ea5) border-box;color:#e7ecff}\n/* responsive */\n@media(max-width:480px){button{font-size:.85rem;padding:11px 20px}.arrow{padding-right:36px}}' }
    },
    {
      id: "cards-ui", title: "Cards: Glass, Flip & Lift",
      html: `
<p class="lead">Cards are the most reused UI pattern — profile cards, pricing cards, product cards. Glassmorphism and 3D flips make them memorable.</p>
<h2>Building blocks</h2>
<ul>
  <li>Structure: header media → title → body → footer actions</li>
  <li>Glass card: <code class="inline">background: rgba(255,255,255,.06) + backdrop-filter: blur()+ soft border</code></li>
  <li>Lift hover: <code class="inline">transform: translateY(-6px)</code> + deeper box-shadow, transitioned</li>
  <li>Flip card: parent <code class="inline">perspective</code>, child <code class="inline">transform-style: preserve-3d</code>, faces with <code class="inline">backface-visibility: hidden</code></li>
</ul>`,
      seed: { html: '<div class="glass"><h3>Glass</h3><p>backdrop-filter blur</p></div>\n<div class="flip"><div class="inner">\n  <div class="face front">Front</div>\n  <div class="face back">Back!</div>\n</div></div>\n<div class="lift"><h3>Lift me</h3></div>', css: 'body{background:radial-gradient(circle at 70% 20%,#b15cff55,transparent),radial-gradient(circle at 20% 80%,#22e8ff44,transparent),#05060d;font-family:sans-serif;padding:30px;display:flex;gap:22px;flex-wrap:wrap;align-items:center}\n.glass{padding:20px 26px;border-radius:18px;background:rgba(255,255,255,.07);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.2);color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.4)}\n.glass h3{margin:0 0 4px;color:#22e8ff}\n.glass p{margin:0;color:#c8d0f0}\n.flip{width:160px;height:200px;perspective:900px;cursor:pointer}\n.inner{position:relative;width:100%;height:100%;transition:transform .7s;transform-style:preserve-3d}\n.flip:hover .inner{transform:rotateY(180deg)}\n.face{position:absolute;inset:0;display:grid;place-items:center;border-radius:16px;backface-visibility:hidden;border:2px solid #ff3ea5;color:#ff3ea5;font-weight:700}\n.back{transform:rotateY(180deg);background:#ff3ea5;color:#fff}\n.lift{padding:22px 28px;border-radius:16px;background:#11142a;color:#b15cff;border:1px solid #262b4d;transition:.35s}\n.lift:hover{transform:translateY(-8px);box-shadow:0 16px 40px rgba(0,0,0,.5),0 0 24px rgba(177,92,255,.35);border-color:#b15cff}\n/* responsive */\n@media(max-width:560px){body{padding:18px;gap:14px}.flip{width:130px;height:170px}}' }
    },
    {
      id: "loaders", title: "Pure CSS Loaders",
      html: `
<p class="lead">Loading spinners, pulse dots and shimmer bars — all possible with no images and no JS.</p>
<h2>Recipes</h2>
<ul>
  <li><b>Ring spinner</b>: bordered square + <code class="inline">border-top-color</code> different + <code class="inline">border-radius:50%</code> + rotate keyframes</li>
  <li><b>Bouncing dots</b>: 3 dots, staggered <code class="inline">animation-delay</code></li>
  <li><b>Bars</b>: equalizer effect with <code class="inline">scaleY</code> keyframes</li>
  <li>Always wrap heavy animation in <code class="inline">@media (prefers-reduced-motion)</code> support</li>
</ul>`,
      seed: { html: '<div class="ring"></div>\n<div class="dots"><span></span><span></span><span></span></div>\n<div class="bar"><div></div></div>', css: 'body{background:#05060d;display:grid;place-items:center;gap:28px;min-height:80vh}\n.ring{width:54px;height:54px;border:5px solid #141a33;border-top-color:#22e8ff;border-radius:50%;animation:spin 0.9s linear infinite}\n@keyframes spin{to{transform:rotate(360deg)}}\n.dots{display:flex;gap:10px}\n.dots span{width:14px;height:14px;border-radius:50%;background:#ff3ea5;animation:bounce 1.1s infinite}\n.dots span:nth-child(2){animation-delay:.18s}\n.dots span:nth-child(3){animation-delay:.36s}\n@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-16px)}}\n.bar{width:220px;height:12px;border-radius:99px;background:#141a33;overflow:hidden}\n.bar div{height:100%;width:45%;border-radius:99px;background:linear-gradient(90deg,#22e8ff,#38f2a5,#22e8ff);animation:slide 1.4s infinite}\n@keyframes slide{0%{margin-left:-45%}100%{margin-left:100%}}\n/* responsive */\n@media(max-width:420px){body{gap:18px}.ring{width:44px;height:44px;border-width:4px}.bar{width:70vw;max-width:220px}}' }
    },
    {
      id: "tooltips", title: "Tooltips & Dropdowns",
      html: `
<p class="lead">A <b>tooltip</b> is a small label that appears on hover; a <b>dropdown</b> reveals a menu. Both are pure CSS with pseudo-elements and the <code class="inline">:hover</code> state.</p>
<h2>Tooltip recipe</h2>
<ul>
  <li>Parent gets <code class="inline">position: relative</code></li>
  <li>Tooltip = <code class="inline">::after { content: attr(data-tip); position: absolute; }</code></li>
  <li>Hide with <code class="inline">opacity: 0; transform:</code> — show on <code class="inline">:hover</code> + transition</li>
  <li>Arrow = tiny rotated square (transform: rotate(45deg)) on <code class="inline">::before</code></li>
</ul>
<h2>Dropdown recipe</h2>
<ul>
  <li>Menu hidden by default (<code class="inline">opacity/visibility</code> or <code class="inline">display</code>)</li>
  <li>Show on <code class="inline">li:hover .menu</code> — CSS-only hover menus</li>
  <li>For touch devices prefer click behaviour (or JS details/summary pattern)</li>
</ul>`,
      seed: { html: '<button class="tip" data-tip="Neon tooltip!">Hover/focus me</button>\n<ul class="menu">\n  <li>Tools ▾\n    <ul class="drop">\n      <li>Editor</li><li>Quiz</li><li>Examples</li>\n    </ul>\n  </li>\n</ul>', css: 'body{background:#05060d;display:grid;place-items:center;gap:26px;min-height:80vh;font-family:sans-serif}\n.tip{position:relative;padding:12px 24px;border:1px solid #22e8ff;background:transparent;color:#22e8ff;border-radius:10px;cursor:pointer}\n.tip::after{content:attr(data-tip);position:absolute;left:50%;bottom:130%;transform:translateX(-50%) scale(.9);opacity:0;background:#141a33;border:1px solid #22e8ff;color:#e7ecff;padding:8px 12px;border-radius:8px;white-space:nowrap;transition:.25s;pointer-events:none}\n.tip:hover::after{opacity:1;transform:translateX(-50%) scale(1);box-shadow:0 0 18px rgba(34,232,255,.4)}\n.menu,.drop{list-style:none;margin:0;padding:0}\n.menu>li{position:relative;padding:10px 18px;border:1px solid #ff3ea5;color:#ff3ea5;border-radius:10px;cursor:pointer}\n.drop{display:none;position:absolute;top:110%;left:0;background:#11142a;border:1px solid #262b4d;border-radius:10px;min-width:140px}\n.drop li{padding:9px 14px;color:#e7ecff}\n.drop li:hover{background:#1a2048;color:#22e8ff}\n.menu>li:hover .drop{display:block}\n/* responsive */\n@media(max-width:520px){.tip::after{white-space:normal;width:max-content;max-width:78vw;text-align:center}}' }
    },
    {
      id: "backgrounds", title: "Background Patterns",
      html: `
<p class="lead">Subtle backgrounds make sections feel designed, not default: stripes, dots, grids — all generated, zero image files.</p>
<h2>Gradient tricks</h2>
<ul>
  <li><b>Stripes</b>: <code class="inline">repeating-linear-gradient(45deg, c1 0 12px, c2 12px 24px)</code></li>
  <li><b>Dot grid</b>: <code class="inline">radial-gradient(circle, #262b4d 1.5px, transparent 1.6px) + background-size: 22px 22px</code></li>
  <li><b>Graph paper</b>: two linear-gradients + background-size</li>
  <li>Layer many backgrounds with commas, each with own size/position/repeat</li>
</ul>
<h2>Properties recap</h2>
<ul>
  <li><code class="inline">background-size: cover | contain | auto</code>, <code class="inline">background-position</code>, <code class="inline">background-attachment</code></li>
  <li><code class="inline">background-color</code> under gradient for non-supporting fallbacks</li>
</ul>`,
      seed: { html: '<div class="tile dots">dots</div>\n<div class="tile grid">grid</div>\n<div class="tile stripes">stripes</div>\n<div class="tile mesh">mesh</div>',
              css: 'body{background:#05060d;padding:24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;font-family:sans-serif}\n.tile{height:140px;display:grid;place-items:center;border-radius:14px;color:#e7ecff;font-weight:700;text-shadow:0 1px 4px #000}\n.dots{background:#0b0f1e radial-gradient(#22e8ff66 1.5px,transparent 1.5px);background-size:22px 22px}\n.grid{background:#0b0f1e linear-gradient(#b15cff33 1px,transparent 1px),linear-gradient(90deg,#b15cff33 1px,transparent 1px);background-size:26px 26px}\n.stripes{background:repeating-linear-gradient(45deg,#141a33 0 14px,#0b0f1e 14px 28px)}\n.mesh{background:radial-gradient(at 20% 30%,#22e8ff55,transparent 55%),radial-gradient(at 80% 20%,#ff3ea544,transparent 55%),radial-gradient(at 60% 85%,#b15cff55,transparent 55%),#05060d}' }
    },
    {
      id: "clip-path", title: "clip-path & Shapes",
      html: `
<p class="lead"><code class="inline">clip-path</code> cuts an element into any shape — diagonals, waves, arrows, hexagons — without SVG or images.</p>
<h2>Shape functions</h2>
<ul>
  <li><code class="inline">polygon(x1 y1, x2 y2, …)</code> — free-form: slants, ribbons, stars</li>
  <li><code class="inline">circle(50% at 50% 50%)</code>, <code class="inline">ellipse()</code></li>
  <li><code class="inline">inset(10px round 12px)</code> — rounded crop</li>
  <li>Animate between polygons with the same vertex count!</li>
  <li>generate shapes visually at bennettfeely.com/clippy</li>
</ul>`,
      seed: { html: '<div class="hex">HEX</div>\n<div class="tri">TRI</div>\n<div class="reveal">Hover</div>', css: 'body{background:#05060d;display:flex;gap:26px;align-items:center;justify-content:center;min-height:80vh;font-family:sans-serif}\n.hex{width:150px;height:150px;display:grid;place-items:center;background:linear-gradient(135deg,#22e8ff,#b15cff);clip-path:polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);color:#04121a;font-weight:800}\n.tri{width:170px;height:120px;display:grid;place-items:center;background:#ff3ea5;clip-path:polygon(50% 0,100% 100%,0 100%);color:#fff;font-weight:700;padding-top:46px;box-sizing:border-box}\n.reveal{width:170px;height:120px;display:grid;place-items:center;background:linear-gradient(135deg,#38f2a5,#0e3b2e);color:#04141f;font-weight:700;clip-path:circle(24% at 50% 50%);transition:clip-path .5s;cursor:pointer}\n.reveal:hover{clip-path:circle(75% at 50% 50%)}\n/* responsive */\n@media(max-width:600px){body{gap:14px}.hex{width:110px;height:110px}.tri{width:130px;height:92px;padding-top:36px}.reveal{width:130px;height:92px}}' }
    },
    {
      id: "forms-ui", title: "Form UI Styling",
      html: `
<p class="lead">Default form controls look dated — a few rules make them feel professional: sizing, borders, focus rings and consistent states.</p>
<h2>Styling form controls</h2>
<ul>
  <li>Normalize: <code class="inline">input, select, textarea { font: inherit; }</code></li>
  <li>Padding + border-radius + subtle dark background for dark themes</li>
  <li>Focus: <code class="inline">:focus { outline: none } + box-shadow ring</code> — keep it ACCESSIBLE (<code class="inline">:focus-visible</code>)</li>
  <li>States: <code class="inline">:disabled</code> grey, <code class="inline">:placeholder-shown</code> muted</li>
  <li>Checkbox/radio tint: <code class="inline">accent-color</code> — one line, native pop</li>
  <li>File upload: style the label, hide the input</li>
</ul>`,
      seed: { html: '<div class="field">\n  <input id="em" type="email" placeholder=" ">\n  <label for="em">Email</label>\n</div>\n<label class="switch"><input type="checkbox"><span></span>Notifications</label>', css: 'body{background:#05060d;display:grid;place-items:center;gap:26px;min-height:80vh;font-family:sans-serif}\n.field{position:relative;width:260px}\n.field input{width:100%;padding:16px 14px 8px;background:#0b0f1e;border:1px solid #262b4d;border-radius:12px;color:#e7ecff;outline:none;transition:.3s}\n.field input:focus{border-color:#22e8ff;box-shadow:0 0 16px rgba(34,232,255,.35)}\n.field label{position:absolute;left:14px;top:14px;color:#8f9ac4;pointer-events:none;transition:.2s}\n.field input:focus+label,.field input:not(:placeholder-shown)+label{top:4px;font-size:.72rem;color:#22e8ff;letter-spacing:.5px}\n.switch{display:flex;align-items:center;gap:10px;color:#e7ecff;cursor:pointer}\n.switch input{display:none}\n.switch span{width:46px;height:26px;border-radius:99px;background:#141a33;position:relative;transition:.3s}\n.switch span::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#8f9ac4;transition:.3s}\n.switch input:checked+span{background:#123}\n.switch input:checked+span{background:#0b2d33;box-shadow:0 0 14px rgba(34,232,255,.5)}\n.switch input:checked+span::after{left:23px;background:#22e8ff}\n/* responsive */\n.field{max-width:100%}\n@media(max-width:420px){.field{width:100%}}' }
    },
    {
      id: "navbars", title: "Navbar Patterns",
      html: `
<p class="lead">The navbar is on screen 100% of the time — sticky positioning, blur, active states and a mobile toggle pattern are the essentials.</p>
<h2>Recipes</h2>
<ul>
  <li>Sticky: <code class="inline">position: sticky; top: 0</code> (+ backdrop-filter for glass effect)</li>
  <li>Layout: <code class="inline">display: flex; justify-content: space-between; align-items: center</code></li>
  <li>Active link: colored border-bottom or pill background + <code class="inline">aria-current</code></li>
  <li>Mobile: hide links row, show hamburger (see the hamburger chapter for pure-CSS toggle)</li>
  <li>Add <code class="inline">scroll-padding-top</code> on html so anchored headings are not hidden under the bar</li>
</ul>`,
      seed: { html: '<header class="nav">\n  <b>Godx</b>\n  <a class="link active">Home</a>\n  <a class="link">Docs</a>\n  <a class="link">About</a>\n</header>\n<div style="height:70vh;padding:20px;color:#8f9ac4">Scroll karke dekho — nav glass sticky hai</div>', css: 'body{margin:0;font-family:sans-serif;background:#05060d}\n.nav{position:sticky;top:0;display:flex;gap:22px;align-items:center;padding:14px 22px;background:rgba(5,6,13,.8);backdrop-filter:blur(10px);border-bottom:1px solid #141a33;color:#e7ecff}\n.nav b{color:#22e8ff;margin-right:8px}\n.link{position:relative;color:#8f9ac4;text-decoration:none;cursor:pointer;padding:4px 2px;transition:color .3s}\n.link::after{content:"";position:absolute;left:0;bottom:-2px;width:0;height:2px;background:linear-gradient(90deg,#22e8ff,#ff3ea5);transition:width .3s}\n.link:hover{color:#fff}\n.link:hover::after{width:100%}\n.link.active{color:#22e8ff;font-weight:600}\n/* responsive */\n@media(max-width:520px){.nav{gap:10px;padding:12px 14px}.nav b{margin-right:0}.link{font-size:.88rem}}' }
    },
    {
      id: "hover-effects", title: "Image Hover Effects",
      html: `
<p class="lead">Image hover effects — zoom, grayscale-to-color, caption slide-up — are pure CSS classics done with transform + transition.</p>
<h2>Recipes</h2>
<ul>
  <li><b>Zoom</b>: <code class="inline">img:hover { transform: scale(1.06) }</code> inside <code class="inline">overflow: hidden</code> card</li>
  <li><b>Color reveal</b>: <code class="inline">filter: grayscale(1)</code> → 0 on hover</li>
  <li><b>Caption slide</b>: absolutely-positioned caption <code class="inline">translateY(100%)</code> → 0</li>
  <li><b>Dim siblings</b>: <code class="inline">.row:hover img:not(:hover) { opacity:.5 }</code></li>
  <li>Keep transitions on the non-hover rule so both directions animate</li>
</ul>`,
      seed: { html: '<div class="box zoom"><img src="https://picsum.photos/seed/gx/300/180" alt=""></div>\n<div class="box cap"><img src="https://picsum.photos/seed/gx2/300/180" alt=""><div class="t">Neon city</div></div>\n<div class="box gray"><img src="https://picsum.photos/seed/gx3/300/180" alt=""></div>',
              css: 'body{background:#05060d;padding:24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;font-family:sans-serif}\n.box{overflow:hidden;border-radius:14px;position:relative}\n.box img{width:100%;display:block;transition:.45s}\n.zoom:hover img{transform:scale(1.15)}\n.cap .t{position:absolute;inset:auto 0 0 0;padding:10px;background:linear-gradient(transparent,#000d);color:#22e8ff;transform:translateY(100%);transition:.35s}\n.cap:hover .t{transform:translateY(0)}\n.gray img{filter:grayscale(1)}\n.gray:hover img{filter:grayscale(0);box-shadow:0 0 24px #b15cff}' }
    },
    {
      id: "skeleton", title: "Skeleton Loading",
      html: `
<p class="lead">A <b>skeleton screen</b> shows grey placeholder shapes while content loads — it feels faster than a spinner for real apps.</p>
<h2>Recipe</h2>
<ul>
  <li>Placeholder blocks shaped like the future content (lines, circles, cards)</li>
  <li>Base color + shimmering gradient animated <code class="inline">background-position</code></li>
  <li>Same dimensions as final content → no layout shift (CLS-safe)</li>
  <li>Swap to real content with JS when data arrives</li>
</ul>`,
      seed: { html: '<div class="card">\n  <div class="sk avatar"></div>\n  <div class="col">\n    <div class="sk" style="width:70%"></div>\n    <div class="sk" style="width:45%"></div>\n  </div>\n</div>\n<div class="sk big"></div>\n<div class="sk big" style="width:80%"></div>', css: 'body{background:#0b0f1e;padding:28px;font-family:sans-serif}\n.card{display:flex;gap:14px;align-items:center;margin-bottom:18px}\n.col{display:flex;flex-direction:column;gap:10px;flex:1}\n.sk{height:14px;border-radius:6px;background:linear-gradient(90deg,#141a33 25%,#232c52 45%,#141a33 65%);background-size:300%;animation:shimmer 1.4s infinite}\n.avatar{width:52px;height:52px;border-radius:50%;flex:none}\n.big{height:20px;margin:12px 0}\n@keyframes shimmer{from{background-position:150% 0}to{background-position:-150% 0}}\n/* responsive */\n@media(max-width:420px){body{padding:18px}.card{gap:10px}.avatar{width:44px;height:44px}}' }
    },
    {
      id: "marquee", title: "Marquee & Auto-scroll",
      html: `
<p class="lead">An auto-scrolling strip of logos, skills or announcements — done with keyframes and a duplicated track (the old <code class="inline">&lt;marquee&gt;</code> tag is obsolete).</p>
<h2>Recipe</h2>
<ul>
  <li>Inner track with the content <b>duplicated</b> (two copies side by side)</li>
  <li>Animate <code class="inline">transform: translateX(-50%)</code> in a loop — seamless</li>
  <li>Parent: <code class="inline">overflow: hidden</code> + optional fade masks at edges (<code class="inline">mask-image</code>)</li>
  <li>Pause on hover: <code class="inline">animation-play-state: paused</code></li>
  <li>Speed control: <code class="inline">animation-duration</code> only</li>
</ul>`,
      seed: { html: '<div class="marquee">\n  <div class="track">\n    <span>⚡ NEON</span><span>✦ SHADOW</span><span>✧ CSS</span><span>⚡ NEON</span><span>✦ SHADOW</span><span>✧ CSS</span>\n  </div>\n</div>', css: 'body{background:#05060d;display:grid;place-items:center;min-height:80vh;font-family:sans-serif}\n.marquee{width:340px;overflow:hidden;border-radius:12px;border:1px solid #262b4d;background:#0b0f1e}\n.track{display:flex;gap:40px;padding:16px;white-space:nowrap;width:max-content;animation:scroll 8s linear infinite;color:#22e8ff;font-weight:700}\n.marquee:hover .track{animation-play-state:paused}\n@keyframes scroll{to{transform:translateX(-50%)}}\n/* responsive */\n.marquee{max-width:100%}\n@media(max-width:400px){.track{gap:24px;font-size:.85rem}}' }
    },
    {
      id: "badges", title: "Badges & Pulsing Dots",
      html: `
<p class="lead">Notification counts, role tags, status dots — small but essential UI details built with pseudo-elements and keyframes.</p>
<h2>Recipes</h2>
<ul>
  <li><b>Count badge</b>: absolute-positioned <code class="inline">::after { content: attr(data-count) }</code> on the bell icon</li>
  <li><b>Tag pill</b>: rounded padding + low-alpha brand color background + colored text</li>
  <li><b>Pulse dot</b>: solid dot + <code class="inline">::before ring</code> animating scale+fade (availability indicators)</li>
  <li>Keep counts fully off-screen-reader friendly with aria-label on the parent</li>
</ul>`,
      seed: { html: '<button class="btn">Inbox<span class="badge">7</span></button>\n<span class="status"><i class="dot live"></i>Live</span>\n<span class="chip green">CSS</span>\n<span class="chip pink">JS</span>', css: 'body{background:#05060d;display:flex;gap:30px;align-items:center;justify-content:center;min-height:80vh;font-family:sans-serif}\n.btn{position:relative;padding:12px 24px;border:1px solid #22e8ff;background:#0b0f1e;color:#22e8ff;border-radius:10px;cursor:pointer}\n.badge{position:absolute;top:-9px;right:-9px;min-width:20px;height:20px;line-height:20px;border-radius:10px;background:#ff3ea5;color:#fff;font-size:.75rem;font-weight:700}\n.status{display:flex;align-items:center;gap:8px;color:#38f2a5}\n.dot{width:10px;height:10px;border-radius:50%;background:#38f2a5;position:relative}\n.dot::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid #38f2a5;animation:pulse 1.5s infinite}\n@keyframes pulse{from{transform:scale(.6);opacity:1}to{transform:scale(1.9);opacity:0}}\n.chip{padding:6px 14px;border-radius:99px;font-size:.85rem}\n.green{background:rgba(56,242,165,.12);color:#38f2a5;border:1px solid #38f2a5}\n.pink{background:rgba(255,62,165,.12);color:#ff3ea5;border:1px solid #ff3ea5}\n/* responsive */\n@media(max-width:600px){body{gap:14px;flex-wrap:wrap}.btn{padding:10px 16px}}' }
    },
    {
      id: "dark-toggle", title: "Dark/Light Toggle (Pure CSS)",
      html: `
<p class="lead">A theme switch needs no JavaScript at all — the <b>:checked checkbox hack</b> plus the general sibling selector <code class="inline">~</code> can recolor an entire demo.</p>
<h2>Recipe</h2>
<ul>
  <li>Hidden <code class="inline">&lt;input type="checkbox" id="th"&gt;</code> placed BEFORE the themed wrapper</li>
  <li><code class="inline">#th:checked ~ .page { ... dark overrides ... }</code></li>
  <li>Style the <code class="inline">&lt;label for="th"&gt;</code> as a sliding sun/moon switch</li>
  <li>Everything inside CSS variables so themes flip by reassigning them</li>
  <li>On real projects pair this with JS localStorage to remember the choice</li>
</ul>`,
      seed: { html: '<input type="checkbox" id="tg" hidden>\n<div class="wrap">\n  <label for="tg" class="switch"><span></span></label>\n  <h2>Theme demo</h2>\n  <p>Flip it — pure CSS, no JS!</p>\n</div>',
              css: 'body{margin:0;font-family:sans-serif}\n.wrap{--bg:#05060d;--fg:#e7ecff;--accent:#22e8ff;min-height:100vh;background:#05060d;background:var(--bg);color:var(--fg);padding:30px;transition:.4s;text-align:center}\n#tg:checked~.wrap{--bg:#f4f6ff;--fg:#141a33;--accent:#b15cff}\n.wrap h2{color:var(--accent)}\n.switch{display:inline-block;width:58px;height:30px;border-radius:99px;background:#262b4d;position:relative;cursor:pointer;transition:.3s}\n.switch span{position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#22e8ff;transition:.3s;box-shadow:0 0 12px rgba(34,232,255,.5)}\n#tg:checked~.wrap .switch{background:#c9d3f5}\n#tg:checked~.wrap .switch span{left:31px;background:#b15cff;box-shadow:0 0 12px rgba(177,92,255,.5)}' }
    },
    {
      id: "custom-scrollbar", title: "Custom Scrollbars",
      html: `
<p class="lead">Default scrollbars can clash with a dark UI. Webkit browsers let you restyle them, Firefox has its own properties.</p>
<h2>Webkit (Chrome / Edge / Safari)</h2>
<ul>
  <li><code class="inline">::-webkit-scrollbar { width: 10px }</code></li>
  <li><code class="inline">::-webkit-scrollbar-track</code> (background) · <code class="inline">::-webkit-scrollbar-thumb</code> (the draggable part)</li>
  <li>Radius + hover states on the thumb are sweet details</li>
</ul>
<h2>Firefox + future standard</h2>
<ul>
  <li><code class="inline">scrollbar-width: thin</code> · <code class="inline">scrollbar-color: #b15cff #0b0f1e</code></li>
  <li>Respect <code class="inline">overflow: overlay/auto</code> behaviour differences per OS</li>
</ul>`,
      seed: { html: '<div class="scrollbox">\n  <p style="height:600px">Keep scrolling down… watch the neon scrollbar thumb!</p>\n</div>',
              css: 'body{background:#05060d;display:grid;place-items:center;min-height:80vh;font-family:sans-serif}\n.scrollbox{width:320px;height:220px;overflow-y:auto;padding:0 16px;background:#0b0f1e;border:1px solid #262b4d;border-radius:14px;color:#8f9ac4;padding:16px}\n.scrollbox::-webkit-scrollbar{width:10px}\n.scrollbox::-webkit-scrollbar-track{background:#0b0f1e;border-radius:99px}\n.scrollbox::-webkit-scrollbar-thumb{background:linear-gradient(#22e8ff,#b15cff);border-radius:99px;border:2px solid #0b0f1e}\n.scrollbox::-webkit-scrollbar-thumb:hover{background:#ff3ea5}' }
    },
    {
      id: "accordion", title: "Pure CSS Accordion (details/summary)",
      html: `
<p class="lead">HTML gives us native toggles: <code class="inline">&lt;details&gt;</code> + <code class="inline">&lt;summary&gt;</code> — a complete accessible accordion with zero JS.</p>
<h2>Recipe</h2>
<ul>
  <li><code class="inline">&lt;details&gt;&lt;summary&gt;Title&lt;/summary&gt;content…&lt;/details&gt;</code></li>
  <li>Custom arrow: hide marker (<code class="inline">summary::-webkit-details-marker{display:none}</code>) then style a <code class="inline">::after</code> triangle that rotates on <code class="inline">details[open] summary</code></li>
  <li>Animate max-height/grid-rows for smooth opening (or let it be instant — still great)</li>
  <li><code class="inline">name</code> attribute auto-closes siblings (exclusive accordion, newest browsers)</li>
</ul>`,
      seed: { html: '<details class="acc" open>\n  <summary>How long does it take to learn CSS?</summary>\n  <p>Basics in 2-3 days; mastery comes from chapter-wise practice — every lesson here is a live experiment.</p>\n</details>\n<details class="acc">\n  <summary>Is JavaScript required?</summary>\n  <p>For interactivity yes — but 80% of styling jobs (navbars, accordions, dark mode) are pure CSS.</p>\n</details>', css: 'body{background:#05060d;max-width:520px;margin:30px auto;font-family:sans-serif;padding:16px}\n.acc{background:#0b0f1e;border:1px solid #262b4d;border-radius:12px;margin-bottom:12px;overflow:hidden}\n.acc summary{list-style:none;cursor:pointer;padding:16px 18px;color:#e7ecff;font-weight:600;display:flex;justify-content:space-between;align-items:center}\n.acc summary::-webkit-details-marker{display:none}\n.acc summary::after{content:"▾";color:#22e8ff;transition:transform .3s;font-size:1.2rem}\n.acc[open]{border-color:#22e8ff;box-shadow:0 0 20px rgba(34,232,255,.15)}\n.acc[open] summary{color:#22e8ff;border-bottom:1px solid #141a33}\n.acc[open] summary::after{transform:rotate(180deg)}\n.acc p{margin:0;padding:16px 18px;color:#8f9ac4;line-height:1.6}\n/* responsive */\n@media(max-width:420px){body{margin:16px auto;padding:10px}.acc summary,.acc p{padding:12px 14px;font-size:.9rem}}' }
    },
    {
      id: "pricing-table", title: "Pricing Tables",
      html: `
<p class="lead">Pricing sections convert visitors — they need hierarchy, a highlighted plan and a clear feature list. A grid of cards does the job.</p>
<h2>Recipe</h2>
<ul>
  <li>Grid: <code class="inline">repeat(auto-fit, minmax(230px, 1fr))</code> — stacks on mobile automatically</li>
  <li>"Popular" plan: scale(1.04) + gradient border + ribbon tag on <code class="inline">::before</code></li>
  <li>Price typography: giant price, muted period, strikethrough old price</li>
  <li>Feature list: ✅/❌ icons as <code class="inline">::before</code> content</li>
  <li>CTA button stands out only on the recommended plan</li>
</ul>`,
      seed: { html: '<div class="plans">\n  <div class="plan"><h3>Free</h3><div class="price">₹0</div><ul><li>HTML/CSS courses</li><li>50 lessons</li></ul><button>Start</button></div>\n  <div class="plan hot"><span class="tag">POPULAR</span><h3>Pro</h3><div class="price">₹499</div><ul><li>Sab courses</li><li>Certificates</li><li>Discord</li></ul><button>Go Pro</button></div>\n  <div class="plan"><h3>Team</h3><div class="price">₹999</div><ul><li>5 members</li><li>Reports</li></ul><button>Contact</button></div>\n</div>', css: 'body{background:#05060d;padding:36px;display:flex;justify-content:center;font-family:sans-serif}\n.plans{display:flex;gap:22px;flex-wrap:wrap;justify-content:center;max-width:900px}\n.plan{position:relative;background:#0b0f1e;border:1px solid #262b4d;border-radius:18px;padding:28px 30px;width:220px;transition:.3s}\n.plan:hover{transform:translateY(-6px);border-color:#38f2a5}\n.plan h3{margin:0 0 10px;color:#e7ecff}\n.price{font-size:1.9rem;font-weight:800;color:#22e8ff;margin-bottom:14px}\n.plan ul{list-style:none;margin:0 0 20px;padding:0;color:#8f9ac4}\n.plan li{padding:5px 0}\n.plan li::before{content:"✓ ";color:#38f2a5;margin-right:6px}\n.plan button{width:100%;padding:11px;border:1px solid #22e8ff;background:transparent;color:#22e8ff;border-radius:10px;cursor:pointer;font-weight:600}\n.plan.hot{border-color:#ff3ea5;transform:scale(1.05);box-shadow:0 0 30px rgba(255,62,165,.25)}\n.hot button{background:#ff3ea5;color:#fff;border-color:#ff3ea5}\n.tag{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:linear-gradient(90deg,#ff3ea5,#b15cff);color:#fff;font-size:.68rem;font-weight:700;padding:4px 12px;border-radius:99px}\n/* responsive */\n@media(max-width:760px){.plans{gap:14px}.plan{width:100%;max-width:340px}.plan.hot{transform:none}}' }
    },
    {
      id: "fab", title: "Floating Action Button",
      html: `
<p class="lead">A <b>Floating Action Button</b> sits above content in the corner — compose, scroll-to-top, quick actions. Pure CSS with fixed positioning.</p>
<h2>Recipe</h2>
<ul>
  <li><code class="inline">position: fixed; bottom: 24px; right: 24px</code> + high <code class="inline">z-index</code></li>
  <li>Circle: equal width/height + <code class="inline">border-radius: 50%</code> + center content with grid</li>
  <li>Shadow + hover lift for the "floating" feel</li>
  <li>Speed-dial variant: child actions fade/translate outward on hover of the parent</li>
  <li><code class="inline">@media</code>: hide on very small screens if it covers content</li>
</ul>`,
      seed: { html: '<div class="fab-wrap">\n  <button class="fab main">＋</button>\n  <button class="fab sub s1" title="Quiz">?</button>\n  <button class="fab sub s2" title="Editor">&lt;/&gt;</button>\n  <button class="fab sub s3" title="Home">⌂</button>\n</div>', css: 'body{background:#05060d;height:120vh;font-family:sans-serif}\n.fab-wrap{position:fixed;right:26px;bottom:26px;display:flex;flex-direction:column-reverse;gap:12px;align-items:center}\n.fab{width:56px;height:56px;border-radius:50%;border:0;font-size:1.5rem;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.5);transition:.3s}\n.fab.main{background:linear-gradient(135deg,#22e8ff,#b15cff);color:#04121a;font-weight:800;z-index:2}\n.fab.main:hover{transform:rotate(135deg)}\n.fab.sub{width:44px;height:44px;background:#141a33;color:#22e8ff;border:1px solid #262b4d;transform:translateY(70px) scale(.4);opacity:0;pointer-events:none}\n.fab-wrap:hover .sub{transform:none;opacity:1;pointer-events:auto}\n.fab-wrap:hover .s1{transition-delay:.05s}\n.fab-wrap:hover .s2{transition-delay:.12s}\n.fab-wrap:hover .s3{transition-delay:.19s}\n/* responsive */\n@media(max-width:480px){.fab-wrap{right:16px;bottom:16px}}' }
    },
    {
      id: "glow-forms", title: "Focus Glow Forms",
      html: `
<p class="lead">Neon focus glow makes forms feel alive and clearly shows which field is active — a small polish with big perceived quality.</p>
<h2>Recipe</h2>
<ul>
  <li>State base: subtle border + dark background + comfortable padding</li>
  <li><code class="inline">:focus { border-color: var(--c1); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c1) 25%, transparent) }</code></li>
  <li>Transition border-color &amp; box-shadow together (~.2s)</li>
  <li>Invalid state: <code class="inline">input:invalid:not(:placeholder-shown)</code> → red ring</li>
  <li>Labels float: transform label on <code class="inline">:focus / :not(:placeholder-shown)</code></li>
</ul>`,
      seed: { html: '<form class="form">\n  <input type="email" placeholder="Email" required>\n  <input type="text" placeholder="Naam" minlength="3" required>\n  <input type="number" placeholder="Age (optional)" min="10" max="99">\n  <button>Submit</button>\n</form>', css: 'body{background:#05060d;display:grid;place-items:center;min-height:80vh;font-family:sans-serif}\n.form{display:flex;flex-direction:column;gap:16px;width:320px}\ninput{padding:14px 18px;border-radius:12px;border:1px solid #262b4d;background:#0b0f1e;color:#e7ecff;font-size:1rem;outline:none;transition:.3s}\ninput::placeholder{color:#5b6791}\ninput:focus{border-color:#22e8ff;box-shadow:0 0 0 4px rgba(34,232,255,.13),0 0 18px rgba(34,232,255,.3)}\ninput:focus:invalid{border-color:#ff3ea5;box-shadow:0 0 0 4px rgba(255,62,165,.12)}\ninput:focus:valid{border-color:#38f2a5}\nbutton{padding:14px;border:0;border-radius:12px;background:linear-gradient(90deg,#22e8ff,#b15cff);color:#04121a;font-weight:700;font-size:1rem;cursor:pointer;transition:.3s}\nbutton:hover{filter:brightness(1.15);box-shadow:0 0 24px rgba(177,92,255,.4)}\n/* responsive */\n.form{max-width:100%}\n@media(max-width:420px){.form{width:100%;gap:12px}}' }
    },
    {
      id: "hamburger", title: "Animated Hamburger (Pure CSS)",
      html: `
<p class="lead">The animated hamburger icon (3 lines → X) can be pure CSS using a hidden checkbox and sibling selectors.</p>
<h2>Recipe</h2>
<ul>
  <li>Hidden <code class="inline">&lt;input type="checkbox" id="nav"&gt;</code> + <code class="inline">&lt;label&gt;</code> as the button</li>
  <li>Three spans: <code class="inline">width 24px; height 2px; margin; transition .3s</code></li>
  <li><code class="inline">#nav:checked ~ label span:nth-child(1)</code> → rotate(45deg) + translate</li>
  <li>Middle span: opacity 0 · bottom span: rotate(-45deg)</li>
  <li>Connect menu panel: <code class="inline">#nav:checked ~ .menu { … }</code></li>
</ul>`,
      seed: { html: '<input type="checkbox" id="burger" hidden>\n<label for="burger" class="ham"><span></span><span></span><span></span></label>\n<nav class="mmenu"><a>Home</a><a>Courses</a><a>About</a></nav>', css: 'body{background:#05060d;padding:30px;font-family:sans-serif}\n.ham{display:inline-flex;flex-direction:column;gap:7px;cursor:pointer;padding:10px;border-radius:12px;border:1px solid #262b4d;background:#0b0f1e;z-index:2;position:relative}\n.ham span{display:block;width:28px;height:3px;border-radius:99px;background:#22e8ff;transition:.35s cubic-bezier(.5,-0.3,.3,1.5)}\n#burger:checked~.ham span:nth-child(1){transform:translateY(10px) rotate(45deg)}\n#burger:checked~.ham span:nth-child(2){opacity:0;transform:scaleX(0)}\n#burger:checked~.ham span:nth-child(3){transform:translateY(-10px) rotate(-45deg)}\n.mmenu{position:absolute;top:90px;left:30px;display:flex;flex-direction:column;gap:10px;background:#0b0f1e;border:1px solid #22e8ff;border-radius:14px;padding:18px 34px 18px 18px;transform:translateX(-140%);transition:.4s;box-shadow:0 0 24px rgba(34,232,255,.2)}\n.mmenu a{color:#e7ecff;text-decoration:none;cursor:pointer;padding:6px 0;border-bottom:1px solid #141a33}\n.mmenu a:hover{color:#22e8ff}\n#burger:checked~.mmenu{transform:none}\n/* responsive */\n@media(max-width:480px){body{padding:18px}.mmenu{left:18px;top:80px;padding:14px 22px 14px 14px}}' }
    },
    {
      id: "tables-ui", title: "Table Styling",
      html: `
<p class="lead">Data tables — from grey spreadsheet look to a neon dashboard table.</p>
<h2>Recipe</h2>
<ul>
  <li><code class="inline">border-collapse: collapse</code> — removes double lines</li>
  <li>Zebra stripes: <code class="inline">tbody tr:nth-child(even)</code></li>
  <li>Row hover: <code class="inline">tbody tr:hover</code></li>
  <li>Sticky header: <code class="inline">th { position: sticky; top: 0 }</code></li>
  <li>Responsive: wrapper div with <code class="inline">overflow-x: auto</code></li>
</ul>`,
      seed: { html: '<table>\n  <thead><tr><th>Course</th><th>Lessons</th><th>Level</th></tr></thead>\n  <tbody>\n    <tr><td>HTML</td><td>22</td><td>Easy</td></tr>\n    <tr><td>CSS</td><td>42</td><td>Easy</td></tr>\n    <tr><td>JS</td><td>22</td><td>Medium</td></tr>\n    <tr><td>Rust</td><td>8</td><td>Hard</td></tr>\n    <tr><td>SQL</td><td>22</td><td>Medium</td></tr>\n  </tbody>\n</table>', css: 'body{background:#05060d;padding:30px;font-family:sans-serif}\ntable{width:100%;max-width:520px;border-collapse:collapse;background:#0b0f1e;border:1px solid #262b4d;border-radius:12px;overflow:hidden;color:#e7ecff}\nth{background:#141a33;color:#22e8ff;text-align:left;padding:13px 16px;font-size:.85rem;letter-spacing:.5px}\ntd{padding:11px 16px;border-top:1px solid #141a33}\ntbody tr:nth-child(even){background:#0d1226}\ntbody tr:hover{background:#141a33;transition:.15s}\ntbody tr:hover td:first-child{color:#ff3ea5;font-weight:600}\n/* responsive */\n@media(max-width:520px){table{display:block;overflow-x:auto;white-space:nowrap}th,td{padding:9px 12px;font-size:.82rem}}' }
    },
    {
      id: "speech-bubbles", title: "Chat Bubbles & Speech Bubbles",
      html: `
<p class="lead">Messaging UI look — a rounded bubble plus a triangle tail drawn by a pseudo-element.</p>
<h2>Tail recipe</h2>
<ul>
  <li>Pseudo-element with <code class="inline">border-top/bottom: solid transparent</code> triangles</li>
  <li>Left bubble (other person) vs right bubble (you) — different colors & alignment</li>
  <li>Asymmetric radius: one corner sharp next to the tail</li>
</ul>`,
      seed: { html: '<div class="chat">\n  <div class="bub left">Did you finish the C# chapter? 🎯</div>\n  <div class="bub right">Yes! Finished it through the summary ✅</div>\n  <div class="bub left">The neon glow section is great, right?</div>\n  <div class="bub right">I set the whole thing up already ⚡</div>\n</div>', css: 'body{background:#05060d;padding:30px;font-family:sans-serif;display:grid;place-items:center;min-height:80vh}\n.chat{width:340px;display:flex;flex-direction:column;gap:12px}\n.bub{position:relative;max-width:75%;padding:12px 16px;border-radius:18px;line-height:1.5}\n.bub.left{align-self:flex-start;background:#141a33;color:#e7ecff;border-bottom-left-radius:4px}\n.bub.left::after{content:"";position:absolute;left:-8px;bottom:0;border:8px solid transparent;border-bottom-color:#141a33;border-left-color:#141a33}\n.bub.right{align-self:flex-end;background:linear-gradient(135deg,#22e8ff,#25c4e8);color:#04121a;border-bottom-right-radius:4px}\n.bub.right::after{content:"";position:absolute;right:-8px;bottom:0;border:8px solid transparent;border-bottom-color:#22e8ff;border-right-color:#22e8ff}\n/* responsive */\n.chat{max-width:100%}' }
    },
    {
      id: "aspect-media", title: "Aspect Ratio & Responsive Media",
      html: `
<p class="lead">Keep images and videos fluid — never hardcode heights; let the ratio drive.</p>
<h2>Modern tools</h2>
<ul>
  <li><code class="inline">aspect-ratio: 16 / 9</code> — native property (no padding hacks!)</li>
  <li><code class="inline">object-fit: cover | contain</code> — fit image inside the frame</li>
  <li><code class="inline">img { max-width: 100% }</code> — golden baseline</li>
  <li>Need rounded corners? add <code class="inline">overflow: hidden</code> on the wrapper</li>
</ul>`,
      seed: { html: '<div class="vid">16:9 video spot</div>\n<div class="cards">\n  <img src="https://picsum.photos/seed/r1/300/200" alt="">\n  <img src="https://picsum.photos/seed/r2/200/300" alt="">\n</div>',
              css: 'body{background:#05060d;padding:26px;max-width:560px;margin:auto;font-family:sans-serif}\n.vid{aspect-ratio:16/9;background:linear-gradient(135deg,#141a33,#0b0f1e);border:2px dashed #22e8ff;border-radius:14px;display:grid;place-items:center;color:#22e8ff;margin-bottom:18px}\n.cards{display:grid;grid-template-columns:1fr 1fr;gap:14px}\n.cards img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;display:block}' }
    },
    {
      id: "link-animations", title: "Link Underline Animations",
      html: `
<p class="lead">Fancy link hovers — underline slide-in, center-out expansion and gradient sweeps.</p>
<h2>Three effects</h2>
<ul>
  <li><b>Left-to-right</b>: <code class="inline">::after { width: 0 → 100% }</code> with transition</li>
  <li><b>Center-out</b>: <code class="inline">transform: scaleX(0 → 1)</code>, origin center</li>
  <li><b>Gradient sweep</b>: animate background-position of an oversized gradient</li>
</ul>`,
      seed: { html: '<ul class="links">\n  <li><a class="l left">Slide from left</a></li>\n  <li><a class="l center">Expand from center</a></li>\n  <li><a class="l grad">Gradient sweep</a></li>\n</ul>', css: 'body{background:#05060d;display:grid;place-items:center;min-height:80vh;font-family:sans-serif}\n.links{list-style:none;padding:0;display:flex;flex-direction:column;gap:22px}\n.l{color:#e7ecff;text-decoration:none;font-size:1.2rem;cursor:pointer;position:relative;padding-bottom:4px}\n.l::after{content:"";position:absolute;left:0;bottom:0;height:2px;width:100%;background:#22e8ff;transition:.35s}\n.l.left::after{width:0}\n.l.left:hover::after{width:100%}\n.l.center::after{transform:scaleX(0);transform-origin:center;transition:transform .3s}\n.l.center:hover::after{transform:scaleX(1)}\n.l.grad::after{background:linear-gradient(90deg,#22e8ff,#ff3ea5,#22e8ff);background-size:200%;opacity:0;transition:.3s}\n.l.grad:hover::after{opacity:1;animation:sw 1.2s linear infinite}\n@keyframes sw{to{background-position:200% 0}}\n/* responsive */\n@media(max-width:420px){.links{gap:16px}.l{font-size:1rem}}' }
    },
    {
      id: "parallax-hero", title: "Parallax Hero Sections",
      html: `
<p class="lead">Fixed background + scrolling content = the classic landing-page parallax feel, one property deep.</p>
<h2>Key property</h2>
<ul>
  <li><code class="inline">background-attachment: fixed</code> — image stays put while content scrolls</li>
  <li><code class="inline">background-size: cover</code> + <code class="inline">background-position: center</code></li>
  <li>Mobile fallback: <code class="inline">@media (hover: none)</code> → attachment scroll (iOS quirk)</li>
</ul>`,
      seed: { html: '<section class="hero p1"><h1>NEON PARALLAX</h1></section>\n<section class="content"><p>Scroll karte raho — background "stuck" hai, content upar jaata hai. Yehi parallax hai!</p></section>\n<section class="hero p2"><h1>CSS ONLY ✨</h1></section>\n<section class="content"><p>background-attachment: fixed ka khel. Koi parallax library ki zaroorat nahi.</p></section>', css: 'body{margin:0;font-family:sans-serif}\n.hero{height:60vh;display:grid;place-items:center;background-size:cover;background-position:center}\n.p1{background-image:linear-gradient(#05060dcc,#05060d88),url("https://picsum.photos/seed/par1/1200/600")}\n.p2{background-image:url("https://picsum.photos/seed/par2/1200/600");background-blend-mode:multiply;background-color:#141a33}\n.hero h1{color:#fff;font-size:2.4rem;letter-spacing:6px;text-shadow:0 0 18px #22e8ff}\n.content{padding:44px 22px;background:#05060d;color:#8f9ac4;line-height:1.8;max-width:640px;margin:auto}\n@supports (background-attachment: fixed) {\n  .p1, .p2 { background-attachment: fixed; }\n}\n/* responsive */\n@media(max-width:560px){.hero{height:46vh}.hero h1{font-size:1.4rem;letter-spacing:3px}.content{padding:28px 16px;max-width:none}}' }
    },
    {
      id: "neumorphism", title: "Neumorphism (Soft UI)",
      html: `
<p class="lead"><b>Neumorphism</b> (soft UI) embosses elements using dual shadows — a tactile alternative to the neon look.</p>
<h2>Recipe</h2>
<ul>
  <li>Body and element share the <b>same background color</b> — shape comes from shadows alone</li>
  <li><code class="inline">box-shadow: dark(down-right), light(up-left)</code> — two opposing shadows</li>
  <li>Pressed state: switch to <code class="inline">inset</code> shadows</li>
  <li>Dark-mode neumorphism = two dark shadow stops</li>
</ul>`,
      seed: { html: '<button class="b">Button</button>\n<div class="card">\n  <h3>Soft Card</h3>\n  <p>Dual shadows = elevated feel</p>\n</div>\n<div class="inset">Inset panel</div>', css: 'body{background:#0a0d1c;display:flex;gap:26px;align-items:center;justify-content:center;min-height:80vh;font-family:sans-serif;flex-wrap:wrap;padding:20px}\n.b{padding:16px 34px;border:0;border-radius:14px;background:#0a0d1c;color:#22e8ff;font-size:1rem;cursor:pointer;box-shadow:6px 6px 14px #04050c,-6px -6px 14px #131840;transition:.25s}\n.b:hover{color:#ff3ea5}\n.b:active{box-shadow:inset 5px 5px 12px #04050c,inset -5px -5px 12px #131840}\n.card{width:190px;padding:22px;border-radius:20px;background:#0a0d1c;box-shadow:8px 8px 18px #04050c,-8px -8px 18px #131840;color:#e7ecff}\n.card h3{margin:0 0 6px;color:#b15cff}\n.inset{width:210px;padding:16px;border-radius:14px;background:#0a0d1c;box-shadow:inset 6px 6px 14px #04050c,inset -6px -6px 14px #131840;color:#8f9ac4}\n/* responsive */\n@media(max-width:600px){body{gap:16px}.card{width:100%;max-width:240px}}' }
    },
    {
      id: "grid-recipes", title: "Grid Layout Recipes",
      html: `
<p class="lead">Real-world Grid layouts — dashboards, galleries, magazine pages — explained as copy-paste recipes.</p>
<h2>Recipes</h2>
<ul>
  <li><b>Auto-fit cards:</b> <code class="inline">repeat(auto-fit, minmax(200px, 1fr))</code></li>
  <li><b>Holy-grail layout</b>: named grid-areas (header/nav/main/footer)</li>
  <li><b>Feature tiles</b>: mix in <code class="inline">grid-column: span 2</code></li>
  <li><b>Masonry-ish</b>: <code class="inline">grid-auto-flow: dense</code></li>
</ul>`,
      seed: { html: '<div class="g">\n  <div class="it big">Featured (span 2)</div>\n  <div class="it">1</div>\n  <div class="it">2</div>\n  <div class="it tall">Tall (row span 2)</div>\n  <div class="it">3</div>\n  <div class="it big">Also span 2</div>\n  <div class="it">4</div>\n</div>', css: 'body{background:#05060d;padding:24px;font-family:sans-serif}\n.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;grid-auto-rows:120px}\n.it{background:#11142a;border:1px solid #b15cff;border-radius:14px;display:grid;place-items:center;color:#b15cff;font-weight:600;padding:14px;text-align:center}\n.big{grid-column:span 2;background:linear-gradient(135deg,#1a2048,#11142a);border-color:#22e8ff;color:#22e8ff}\n.tall{grid-row:span 2;background:#0e2b21;border-color:#38f2a5;color:#38f2a5}\n/* responsive */\n@media(max-width:380px){.big{grid-column:auto}.g{grid-auto-rows:100px}}' }
    },
    {
      id: "specificity", title: "Specificity & Cascade (Who Wins?)",
      html: `
<p class="lead"><b>Specificity</b> is the score CSS uses to decide which rule wins when several rules target the same element. Understanding it ends the "why is my style ignored?" confusion forever.</p>
<h2>The score (a, b, c)</h2>
<ul>
  <li>Inline style = 1000 · ID = 100 · class / attribute / pseudo-class = 10 · element / pseudo-element = 1</li>
  <li><code class="inline">!important</code> beats everything — think twice before using it</li>
  <li>Same score? The <b>later</b> rule in the stylesheet wins (source order)</li>
  <li>Modern: <code class="inline">:where()</code> contributes a score of 0 — great for design systems</li>
</ul>`,
      seed: { html: '<p id="box" class="a b">Test this text</p>',
              css: 'body{background:#05060d;padding:20px;font-family:sans-serif}\n/* a=0,b=1,c=0 → 10 */\n#box { color: cyan; }            /* 100 — WINNER */\n.a.b { color: green; }           /* 20 */\np { color: crimson; }            /* 1 */\n\n/* order: baad wali — same score(10) pe pink jeetegi */\n.a { font-size: 26px; }\n.b { font-style: italic; }' }
    },
    {
      id: "units", title: "Units Deep Dive + clamp() Fluid Type",
      html: `
<p class="lead">px, rem, %, vw, ch — which unit for which job? Plus modern fluid sizing with <code class="inline">clamp()</code>, <code class="inline">min()</code> and <code class="inline">max()</code>.</p>
<h2>Guide</h2>
<ul>
  <li><code class="inline">rem</code> — relative to the root font size; ideal for spacing & accessibility (respects the user's font settings)</li>
  <li><code class="inline">em</code> — relative to the parent; component-internal paddings</li>
  <li><code class="inline">vw / vh</code> — viewport percentages; use <code class="inline">dvh</code> for mobile-browser-safe heights</li>
  <li><code class="inline">clamp(min, preferred, max)</code> — fluid typography in one line (see example)</li>
  <li><code class="inline">min()</code>, <code class="inline">max()</code>, <code class="inline">calc()</code> — smart, media-query-free layouts</li>
</ul>`,
      seed: { html: '<h1 class="fluid">Fluid Heading</h1>\n<p class="box">Resize karke dekho</p>',
              css: 'body{background:#05060d;padding:24px;font-family:sans-serif;color:#e7ecff}\n.fluid { font-size: clamp(1.5rem, 4vw, 3rem); color:#22e8ff; }\n.box   { width: min(90vw, 460px); padding: 1rem;\n         border:2px solid #ff3ea5; border-radius:12px;\n         line-height: 1.5em; }' }
    },
    {
      id: "scroll-snap", title: "Scroll Snap — Sections that Snap",
      html: `
<p class="lead">Native carousel / section snapping — no library required, smooth and accessible.</p>
<h2>Two properties</h2>
<ul>
  <li>Parent: <code class="inline">scroll-snap-type: y mandatory</code> (+ <code class="inline">overflow-y: scroll</code> and a height)</li>
  <li>Child: <code class="inline">scroll-snap-align: start</code></li>
  <li><code class="inline">proximity</code> = soft snapping · <code class="inline">scroll-padding</code> offsets for fixed headers</li>
  <li>Horizontal carousels: <code class="inline">scroll-snap-type: x mandatory</code></li>
</ul>`,
      seed: { html: '<div class="wrap">\n  <section style="background:#0b1f2b">Slide 1 — Neon cyan</section>\n  <section style="background:#2b0b24">Slide 2 — Hot pink</section>\n  <section style="background:#0b2b1e">Slide 3 — Mint</section>\n</div>',
              css: 'body{margin:0;font-family:sans-serif;display:grid;place-items:center;min-height:100vh;background:#05060d}\n.wrap{height:70vh;width:70vw;border-radius:16px;overflow-y:scroll;\n      scroll-snap-type: y mandatory; border:1px solid #262b4d}\nsection{height:70vh;display:grid;place-items:center;color:#fff;\n        scroll-snap-align:start;font-size:1.6rem;letter-spacing:1px}' }
    },
    {
      id: "selectors-adv", title: "Advanced Selectors (:has, :not, combinators)",
      html: `
<p class="lead">Modern selectors can pick elements in ways that used to require JavaScript — including the famous parent selector.</p>
<h2>Power list</h2>
<ul>
  <li><code class="inline">div &gt; p</code> direct child · <code class="inline">h2 + p</code> next sibling · <code class="inline">h2 ~ p</code> all following siblings</li>
  <li><code class="inline">:has(img)</code> — selects the PARENT (style a card that contains an image!)</li>
  <li><code class="inline">:not(.skip)</code>, <code class="inline">:first/:last/:nth-child(odd)</code>, <code class="inline">:empty</code></li>
  <li><code class="inline">:focus-visible</code> — outlines for keyboard users only</li>
  <li><code class="inline">:is(a, b)</code> (forgiveness + highest-part score), <code class="inline">:where()</code> (score 0)</li>
</ul>`,
      seed: { html: '<div class="cards">\n  <article class="card"><img src="" alt="pic" style="height:40px;border:1px dashed #666"><h3>With image</h3><p>Raised pad</p></article>\n  <article class="card"><h3>No image</h3><p>Plain card</p></article>\n</div>', css: 'body{background:#05060d;padding:24px;font-family:sans-serif}\n.cards{display:flex;gap:16px}\n.card{background:#11142a;color:#e7ecff;padding:18px;border-radius:14px;border:1px solid #262b4d}\n/* :has — image wala card alag style */\n.card:has(img){border-color:#22e8ff;box-shadow:0 0 18px #22e8ff22}\n.card h3{margin:.3rem 0;color:#ff3ea5}\n/* sibling: h3 ke turant baad wala p */\nh3 + p{color:#8f9ac4}\n/* responsive */\n.cards{flex-wrap:wrap}\n@media(max-width:480px){.cards{gap:10px}.card{padding:12px}}' }
    },
    {
      id: "cascade-layers", title: "Cascade Layers (@layer) — tame your CSS",
      html: `
<p class="lead"><b>Cascade layers</b> let you declare which <b>group</b> of styles wins — before specificity is even compared. Resets, components and overrides become predictable.</p>
<h2>Definition</h2>
<p><code class="inline">@layer base, components, utilities;</code> defines priority order. A style in a <b>later</b> layer always beats one in an earlier layer — even if the earlier selector has higher specificity. Un-layered styles beat all layered ones.</p>
<h2>Why use layers</h2>
<ul>
  <li>Load-order problems disappear — utilities always win if they are the last layer</li>
  <li>Stops the <code class="inline">!important</code> arms race between your CSS and libraries</li>
  <li>Clear grouping: reset → base → components → utilities → overrides</li>
</ul>`,
      seed: { html: '<p id="txt" class="util">Layers decide the winner!</p>',
              css: '@layer base, overrides;\n@layer base {   #txt { color: hotpink; font-size: 1.4rem; } }\n@layer overrides { .util { color: #22e8ff; } }\nbody{background:#05060d;padding:26px;font-family:sans-serif}' }
    },
    {
      id: "color-functions", title: "color-mix() & Modern Color Functions",
      html: `
<p class="lead">Modern CSS computes colors for you: <b>color-mix()</b> blends any two colors — no Sass needed.</p>
<h2>color-mix()</h2>
<ul>
  <li><code class="inline">color-mix(in srgb, red 30%, blue)</code> — blend with weights</li>
  <li>Perfect for hover states: mix your brand color with white or black</li>
</ul>
<h2>More color functions</h2>
<ul>
  <li><code class="inline">oklch(70% 0.25 30)</code> — perceptually uniform; vibrant, consistent palettes</li>
  <li><code class="inline">rgb(from var(--c) r g b / 0.5)</code> — relative color syntax reuses channels</li>
  <li><code class="inline">light-dark(white, black)</code> — automatic theme pairs (with color-scheme)</li>
  <li><code class="inline">accent-color</code> — tint native checkboxes/radios in one line</li>
</ul>`,
      seed: { html: '<div class="row"><div class="b base">base</div><div class="b hov">hover: mix 80%</div><div class="b deep">mix with black 25%</div></div>\n<label class="chip"><input type="checkbox" checked> accent-color: hotpink</label>', css: 'body{background:#05060d;padding:26px;font-family:sans-serif;color:#fff}\n.row{display:flex;gap:12px;margin-bottom:18px}\n.b{padding:16px 14px;border-radius:12px;font-size:.85rem;text-align:center}\n.base{background:#22e8ff;color:#03121a}\n.hov{background:color-mix(in srgb,#22e8ff 80%,white)}\n.deep{background:color-mix(in srgb,#22e8ff 25%,black);color:#22e8ff}\n.chip,.chip input{accent-color:#ff3ea5;color:#8f9ac4;font-size:.9rem}\n/* responsive */\n.row{flex-wrap:wrap}\n@media(max-width:480px){.row{gap:8px}.b{padding:10px 8px;font-size:.75rem}}' }
    },
    {
      id: "mask-image", title: "mask-image — Fade & Crop with Masks",
      html: `
<p class="lead"><b>Masks</b> control WHICH parts of an element are visible using an image or gradient as an alpha map — edge fades, image cutouts and text reveals without extra markup.</p>
<h2>Basics</h2>
<ul>
  <li><code class="inline">mask-image: linear-gradient(black, transparent)</code> — black = show, transparent = hide</li>
  <li>Can use an external PNG/SVG mask: <code class="inline">mask-image: url(star.svg)</code></li>
  <li><code class="inline">mask-size, mask-repeat, mask-position</code> — work like background-*</li>
  <li>Combine: edge-fade a text block, or give images cinematic fade-out borders</li>
  <li>Prefix: <code class="inline">-webkit-mask-image</code> for Safari</li>
</ul>
<h2>Example — image fading at the edges + masked heading</h2>`,
      seed: { html: '<div class="fadebox">This strip fades beautifully at BOTH edges — notice the soft disappearance.</div>\n<h2 class="masked">NEON MASK</h2>',
              css: 'body{background:#05060d;padding:26px;font-family:sans-serif;color:#e7ecff}\n.fadebox{background:#11142a;border:1px solid #262b4d;border-radius:14px;padding:22px;-webkit-mask-image:linear-gradient(90deg,transparent,black 15%,black 85%,transparent);mask-image:linear-gradient(90deg,transparent,black 15%,black 85%,transparent)}\n.masked{font-size:clamp(2.2rem,7vw,4.5rem);margin:26px 0 0;background:linear-gradient(90deg,#22e8ff,#ff3ea5,#22e8ff);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-mask-image:linear-gradient(#000 55%,transparent);mask-image:linear-gradient(#000 55%,transparent)}' }
    },
    {
      id: "text-polish", title: "Typography Polish (text-wrap, line-clamp, ::first-letter)",
      html: `
<p class="lead">Small typographic details separate "fine" UI from "folio" UI — balanced headlines, clamped cards, pretty drop caps.</p>
<h2>New & useful</h2>
<ul>
  <li><code class="inline">text-wrap: balance</code> — headlines distribute evenly across lines</li>
  <li><code class="inline">text-wrap: pretty</code> — avoids orphan words</li>
  <li>Multi-line clamp: <code class="inline">-webkit-line-clamp: 3</code> + flex-column hacks → one-liner truncation of cards</li>
  <li><code class="inline">text-underline-offset, text-decoration-thickness</code> — prettier links</li>
  <li><code class="inline">::first-letter</code> — drop caps without JS</li>
  <li><code class="inline">line-height: 1.4</code>+ in rem, measure <code class="inline">max-width: 65ch</code> for readability</li>
</ul>
<h2>Example</h2>`,
      seed: { html: '<h3 class="bal">This Very Long Headline Balances Its Words Across Lines</h3>\n<p class="clamp">This card text clamps after three lines no matter how much content lives inside it. The rest gets an automatic ellipsis from the browser, keeping card grids perfectly even without a single line of JavaScript. You can keep writing and it will still stop here politely.</p>',
              css: 'body{background:#05060d;padding:26px;font-family:sans-serif;color:#e7ecff;max-width:460px}\n.bal{text-wrap:balance;color:#22e8ff;font-size:1.9rem;line-height:1.25}\n.clamp{color:#8f9ac4;line-height:1.6;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}' }
    },
    {
      id: "subgrid", title: "Subgrid — Nested Grids that Align Themselves",
      html: `
<p class="lead"><b>Subgrid</b> lets a nested grid reuse the PARENT grid's tracks — card content across rows finally lines up perfectly, no fixed heights needed.</p>
<h2>How it works</h2>
<ul>
  <li>Child: <code class="inline">grid-row: span 3; display: grid; grid-template-rows: subgrid;</code></li>
  <li>Its rows become the parent's rows — headers, bodies and footers of every card align across the row</li>
  <li>Works for columns too: <code class="inline">grid-template-columns: subgrid;</code></li>
  <li>Can omit gap inheritance: set your own <code class="inline">row-gap</code> on the child</li>
</ul>
<h2>Example — uneven text, aligned layout</h2>`,
      seed: { html: '<div class="cards">\n  <article class="c"><h3>Short</h3><p>tiny text</p><button>Buy</button></article>\n  <article class="c"><h3>A Very Long Title Here</h3><p>much longer description text that would otherwise break the row alignment completely across cards</p><button>Buy</button></article>\n  <article class="c"><h3>Medium</h3><p>ok length</p><button>Buy</button></article>\n</div>', css: 'body{background:#05060d;padding:24px;font-family:sans-serif}\n.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}\n.c{grid-row:span 3;display:grid;grid-template-rows:subgrid;background:#11142a;border:1px solid #262b4d;border-radius:14px;padding:16px;row-gap:8px}\n.c h3{margin:0;color:#22e8ff;font-size:1rem}\n.c p{margin:0;color:#8f9ac4;font-size:.83rem;line-height:1.5}\n.c button{background:linear-gradient(90deg,#22e8ff,#b15cff);border:0;border-radius:8px;padding:9px;font-weight:700;cursor:pointer;align-self:end}\n/* responsive */\n@media(max-width:700px){.cards{grid-template-columns:1fr}.c{grid-row:auto}}' }
    },
    {
      id: "dialog-styling", title: "Styling <dialog> & ::backdrop (Native Modals)",
      html: `
<p class="lead">The native <code class="inline">&lt;dialog&gt;</code> element gives you an accessible modal — and <code class="inline">::backdrop</code> styles the dimmed page behind it. No framework needed.</p>
<h2>Key parts</h2>
<ul>
  <li><code class="inline">&lt;dialog open&gt;</code> — visible modal; JS can call <code class="inline">showModal()</code> / <code class="inline">close()</code></li>
  <li><code class="inline">dialog::backdrop { background: rgba(0,0,0,.6) }</code> — the overlay (with blur!)</li>
  <li>Animate entry: <code class="inline">dialog[open] { animation: pop .3s }</code></li>
  <li><code class="inline">:modal</code> pseudo-class matches dialogs opened modally</li>
</ul>
<h2>Example — a styled native dialog (with backdrop when opened via Live Editor)</h2>`,
      seed: { html: '<button id="opn">Open Modal</button>\n<dialog id="dlg"><h3>Native Modal ✨</h3><p>Styled with pure CSS. Esc closes me.</p><button id="cls">Close</button></dialog>', css: 'body{background:#05060d;display:grid;place-items:center;min-height:100vh;font-family:sans-serif}\n#opn{background:linear-gradient(90deg,#22e8ff,#b15cff);border:0;padding:14px 26px;border-radius:12px;font-weight:700;cursor:pointer}\ndialog{background:#11142a;color:#e7ecff;border:1px solid #b15cff;border-radius:18px;padding:26px;box-shadow:0 0 40px #b15cff66}\ndialog::backdrop{background:rgba(4,6,13,.7);backdrop-filter:blur(6px)}\ndialog[open]{animation:pop .25s ease}\n@keyframes pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}\n#cls{background:transparent;border:1px solid #22e8ff;color:#22e8ff;padding:9px 16px;border-radius:9px;cursor:pointer;margin-top:10px}\n/* responsive */\ndialog{max-width:calc(100vw - 32px);width:min(90vw,420px)}\n@media(max-width:480px){dialog{padding:18px}}', js: 'document.getElementById("opn").onclick = () => document.getElementById("dlg").showModal();\ndocument.getElementById("cls").onclick = () => document.getElementById("dlg").close();' }
    },
    {
      id: "layer-cascade", title: "CSS Layers (@layer) & Cascade",
      html: `<p class="lead">CSS's new cascade model: @layer controls rule priority like a stack - foundation first, your overrides last.</p>
<h2>How layers work</h2>
<ul>
  <li><code class="inline">@layer reset, base, components, utilities;</code> - declare order</li>
  <li>Later layer wins over earlier - regardless of source order</li>
  <li>Unlayered styles beat ALL layered styles</li>
  <li>Combine with <code class="inline">@scope</code> (component scoping) and <code class="inline">:has()</code></li>
</ul>`,
      seed: { html: '<div class="lbl">Same selector, three sources: <b>unlayered beats all layers</b>; between layers, the <b>later</b> one wins.</div>\n<div class="box">unlayered rule → cyan</div>\n<div class="box2">layer battle → which color?</div>', css: 'body{margin:0;font-family:sans-serif;background:#05060d;padding:26px}\n.lbl{font-size:.8rem;color:#8f9ac4;line-height:1.6;margin-bottom:16px}\n.box,.box2{padding:18px;border-radius:12px;background:#11142a;font-weight:800;margin-bottom:10px}\n.box{color:#22e8ff}\n@layer base, overrides;\n@layer base{.box2{color:#ff7a9e}}\n@layer overrides{.box2{color:#38f2a5}}' }
    },
    {
      id: "scroll-animations", title: "Scroll-Driven Animations (Pure CSS)",
      html: `<p class="lead">Animate on scroll WITHOUT JavaScript: scroll() timeline, scroll-timeline, and view() for in-view effects.</p>
<h2>API</h2>
<ul>
  <li><code class="inline">animation-timeline: scroll()</code> - progress tied to page scroll</li>
  <li><code class="inline">animation-timeline: view()</code> - element's viewport progress</li>
  <li><code class="inline">animation-range: entry 0% cover 40%</code> - when it plays</li>
  <li>Parallax, progress bars, fade-in feeds - zero JS</li>
</ul>`,
      seed: { html: '<div class="stage"><div class="box"><b>Scroll me</b><p>scroll-driven animation — no JS</p></div></div>\n<div class="tail">Keep scrolling… the box above shrinks and fades as the page scrolls (animation-timeline: scroll()). Chromium feature.</div>', css: 'body{margin:0;font-family:sans-serif;background:#05060d;color:#cfd6f2}\n.stage{height:260vh;position:relative}\n.box{position:sticky;top:18vh;margin:0 auto;width:min(420px,86vw);background:#11142a;border:1px solid #22e8ff;border-radius:18px;padding:34px;text-align:center;animation:shrink linear both;animation-timeline:scroll(root)}\n.box b{color:#22e8ff;font-size:1.3rem;display:block;margin-bottom:6px}\n.box p{color:#8f9ac4;font-size:.85rem}\n@keyframes shrink{to{transform:scale(.55);opacity:.15}}\n.tail{padding:40px 24px;text-align:center;font-size:.9rem}\n@supports not (animation-timeline: scroll()){.box{opacity:.75}}' }
    },
    {
      id: "container-queries", title: "Container Queries - Component-Responsive",
      html: `<p class="lead">Style a component by ITS container's size, not the viewport - true responsive components.</p>
<h2>Setup</h2>
<ul>
  <li><code class="inline">.card-wrap { container-type: inline-size; }</code></li>
  <li><code class="inline">@container (min-width: 420px) { .card { display: flex; } }</code></li>
  <li>Container query units: <code class="inline">cqw</code>, <code class="inline">cqh</code>, <code class="inline">cqi</code></li>
  <li>Name containers: <code class="inline">container-name: sidebar</code></li>
</ul>`,
      seed: { html: '<div class="cq"><div class="item">wide container → row layout</div></div>\n<div class="cq small"><div class="item">narrow container → stacked layout</div></div>', css: 'body{margin:0;font-family:sans-serif;background:#05060d;color:#cfd6f2;padding:20px;display:grid;grid-template-columns:1fr 1fr;gap:14px}\n.cq{container-type:inline-size;border:1px dashed #262b4d;border-radius:14px;padding:14px;min-height:120px}\n.cq.small{max-width:220px}\n.item{display:flex;flex-direction:row;gap:10px;align-items:center;background:#11142a;border:1px solid #22e8ff;border-radius:10px;padding:14px;color:#22e8ff;font-size:.85rem}\n@container (max-width:300px){.item{flex-direction:column;align-items:flex-start;border-color:#ff3ea5;color:#ff3ea5}}\n@media(max-width:560px){body{grid-template-columns:1fr}}' }
    },
    {
      id: "css-advanced", title: "Advanced Topics: @property, :has, @scope",
      html: `<p class="lead">The modern frontier: custom properties you can ANIMATE, powerful :has() selectors, and scoped styles.</p>
<h2>@property - animatable custom props</h2>
<ul>
  <li><code class="inline">@property --glow { syntax: "&lt;color&gt;"; inherits: false; initial-value: #22e8ff; }</code></li>
  <li>Now <code class="inline">transition: --glow 0.4s</code> actually interpolates</li>
  <li>Build color-shifting glows, animated gradients</li>
</ul>
<h2>:has() &amp; @scope</h2>
<ul>
  <li><code class="inline">form:has(input:invalid) { border-color: red; }</code> - parent reacts to children</li>
  <li><code class="inline">@scope (.card) to (.footer) { ... }</code> - style isolation</li>
</ul>`,
      seed: { html: '<div class="panel"><label><input type="checkbox" id="ck"> Neon mode</label><div class="dots"><i></i><i></i><i></i></div><p class="note"><b>@property</b> makes --glow animatable (watch the transition). <b>:has()</b> re-themes this whole card when the checkbox is checked — try it!</p></div>', css: 'body{margin:0;min-height:90vh;display:grid;place-items:center;font-family:sans-serif;background:#05060d}\n@property --glow{syntax:"<color>";inherits:false;initial-value:#262b4d}\n.panel{width:min(420px,88vw);background:#11142a;border:2px solid var(--glow);border-radius:18px;padding:26px;color:#e7ecff;transition:--glow .6s;box-shadow:0 0 24px color-mix(in srgb,var(--glow) 45%,transparent)}\nlabel{display:flex;gap:10px;align-items:center;font-weight:700;cursor:pointer;margin-bottom:16px}\n.panel:has(#ck:checked){--glow:#ff3ea5}\n.dots{display:flex;gap:12px;margin-bottom:14px}\n.dots i{width:26px;height:26px;border-radius:50%;background:var(--glow);transition:background .6s}\n.note{font-size:.8rem;color:#8f9ac4;line-height:1.6}' }
    },
    {
      id: "fluid-type", title: "Fluid Typography with clamp()",
      html: `<p class="lead">Fluid type scales smoothly between any two viewport sizes - no media queries needed. The workhorse: <code class="inline">clamp(min, preferred, max)</code>.</p>
<h2>Formula</h2>
<ul>
  <li><code class="inline">clamp(1.6rem, 1rem + 2vw, 2.5rem)</code> - min / ideal / max</li>
  <li>Ideal part uses <code class="inline">vw</code> so it scales with the viewport</li>
  <li>Modern units: <code class="inline">rem</code> + <code class="inline">svh/dvh</code> for full fluid layouts</li>
  <li>Use for headings, spacing scales - "type on a slider"</li>
</ul>`,
      seed: { html: '<h1>Resize me — fluid heading</h1>\n<h2>Subheading scales too</h2>\n<p>clamp(min, ideal, max): this text grows and shrinks with the viewport — zero media queries. Drag the split edge.</p>', css: 'body{margin:0;font-family:sans-serif;background:#05060d;color:#cfd6f2;padding:clamp(14px,4vw,36px)}\nh1{font-size:clamp(1.4rem,1rem + 4vw,3rem);margin:0 0 8px;background:linear-gradient(90deg,#22e8ff,#b15cff);-webkit-background-clip:text;background-clip:text;color:transparent}\nh2{font-size:clamp(1rem,.8rem + 1.6vw,1.8rem);color:#ffc857;margin:14px 0 6px}\np{font-size:clamp(.85rem,.75rem + .6vw,1.15rem);line-height:1.7;max-width:52ch}' }
    },
    {
      id: "transforms-3d", title: "3D Transforms & Perspective",
      html: `<p class="lead">CSS 3D: rotate on X/Y/Z with <code class="inline">perspective</code> for depth - flip cards, parallax, and spatial UI.</p>
<h2>Tools</h2>
<ul>
  <li><code class="inline">perspective: 800px</code> on the PARENT (camera distance)</li>
  <li><code class="inline">rotateX/rotateY/rotateZ(deg)</code>, <code class="inline">translateZ(px)</code></li>
  <li><code class="inline">transform-style: preserve-3d</code> - keep children in 3D space</li>
  <li>Classic flip card: <code class="inline">backface-visibility: hidden</code> + 180deg</li>
</ul>`,
      seed: { html: '<div class="scene"><div class="card"><div class="face front"><h3>Front</h3><p>hover me</p></div><div class="face back"><h3>Back</h3><p>rotateY(180deg)</p></div></div></div>', css: 'body{margin:0;min-height:90vh;display:grid;place-items:center;background:#05060d;font-family:sans-serif}\n.scene{perspective:900px;width:clamp(180px,50vw,260px)}\n.card{position:relative;height:clamp(200px,58vw,300px);transform-style:preserve-3d;transition:transform .8s;cursor:pointer}\n.card:hover{transform:rotateY(180deg)}\n.face{position:absolute;inset:0;backface-visibility:hidden;display:grid;place-content:center;text-align:center;padding:20px;border-radius:18px}\n.front{background:linear-gradient(160deg,#11142a,#1a1030);border:1px solid #22e8ff;box-shadow:0 0 28px #22e8ff33}\n.back{background:linear-gradient(160deg,#2a0e2a,#11142a);border:1px solid #ff3ea5;box-shadow:0 0 28px #ff3ea533;transform:rotateY(180deg)}\nh3{margin:0 0 6px}.front h3{color:#22e8ff}.back h3{color:#ff3ea5}\np{margin:0;color:#8f9ac4;font-size:.85rem}' }
    },
    {
      id: "print-styles", title: "@media print - Print-Ready Pages",
      html: `<p class="lead">Design for paper: hide chrome, force light colors, keep links readable, control page breaks.</p>
<h2>Techniques</h2>
<ul>
  <li><code class="inline">@media print { nav, .btn { display: none } }</code></li>
  <li>Force light: <code class="inline">body { background: #fff !important; color: #000 }</code></li>
  <li>Page breaks: <code class="inline">break-inside: avoid</code>, <code class="inline">break-before: page</code></li>
  <li>Print URLs: <code class="inline">a::after { content: " (" attr(href) ")" }</code></li>
</ul>`,
      seed: { html: '<div class="no-print"><button class="pb">Print me (Ctrl+P)</button><span>In print: neon theme off, buttons hidden, text black.</span></div>\n<h1>Report Title</h1>\n<p class="big">@media print strips the dark neon theme, hides .no-print, and keeps the report clean on paper.</p>', css: 'body{margin:0;font-family:sans-serif;background:#05060d;color:#e7ecff;padding:28px}\nh1{color:#22e8ff}\n.big{color:#8f9ac4;line-height:1.7;max-width:60ch}\n.pb{background:linear-gradient(90deg,#22e8ff,#b15cff);border:0;padding:10px 18px;border-radius:10px;font-weight:700;cursor:pointer;margin-right:10px}\n.no-print span{font-size:.8rem;color:#8f9ac4}\n@media print{\nbody{background:#fff;color:#000;padding:0}\nh1{color:#000}\n.big{color:#222}\n.no-print{display:none !important}\n}', js: 'document.querySelector(\'.pb\').onclick = function () { window.print(); };' }
    },
    {
      id: "a11y-motion", title: "Accessibility & Motion Preferences",
      html: `<p class="lead">Respect the user: reduced-motion, high-contrast, forced-colors, and always-visible focus states.</p>
<h2>Media queries</h2>
<ul>
  <li><code class="inline">@media (prefers-reduced-motion: reduce)</code> - kill animations</li>
  <li><code class="inline">:focus-visible { outline: 3px solid #22e8ff }</code> - keyboard users</li>
  <li><code class="inline">forced-colors: active</code> - Windows High Contrast</li>
  <li>Never trigger motion from user-triggered <code class="inline">hover</code> on touch</li>
</ul>`,
      seed: { html: '<div class="row"><div class="spin"></div><div><b id="m">Motion: full</b><p>The spinner respects <code>prefers-reduced-motion</code>. Enable reduce-motion (OS setting, or DevTools → Rendering → Emulate prefers-reduced-motion) and the animation stops, the ring turns green.</p></div></div>', css: 'body{margin:0;font-family:sans-serif;background:#05060d;color:#cfd6f2;padding:24px}\n.row{display:flex;gap:20px;align-items:center;flex-wrap:wrap}\n.spin{width:70px;height:70px;flex:none;border-radius:50%;border:6px solid #141a33;border-top-color:#22e8ff;animation:spin 1s linear infinite}\n#m{color:#22e8ff;display:block;margin-bottom:6px}\np{font-size:.85rem;line-height:1.6;color:#8f9ac4;max-width:52ch}\n@media (prefers-reduced-motion: reduce){.spin{animation:none;border-top-color:#38f2a5}#m{color:#38f2a5}}\n@media(max-width:560px){.row{gap:14px}}\n@keyframes spin{to{transform:rotate(360deg)}}' }
    },
    {
      id: "grid-auto", title: "Grid Auto-Layout: auto-fit vs auto-fill",
      html: `<p class="lead">Zero-width grids: let CSS compute the column count from <code class="inline">repeat(auto-fit, minmax(...))</code> - responsive without breakpoints.</p>
<h2>The difference</h2>
<ul>
  <li><code class="inline">auto-fit</code> - empty tracks collapse, items STRETCH to fill</li>
  <li><code class="inline">auto-fill</code> - empty tracks stay, items keep min size</li>
  <li><code class="inline">minmax(220px, 1fr)</code> - min width, grow to share space</li>
  <li>Masonry-ish: <code class="inline">grid-auto-rows</code> + spans</li>
</ul>`,
      seed: { html: '<div class="pair"><div><span class="t">auto-fit — empty tracks collapse, items stretch</span><div class="g fit"><i>A</i><i>B</i></div></div><div><span class="t">auto-fill — empty tracks stay</span><div class="g fill"><i>A</i><i>B</i></div></div></div>', css: 'body{margin:0;font-family:sans-serif;background:#05060d;color:#cfd6f2;padding:20px}\n.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}\n.t{font-size:.78rem;color:#8f9ac4;display:block;margin-bottom:8px;line-height:1.5}\n.g{display:grid;gap:10px;min-height:80px}\n.g i{background:#11142a;border:1px solid #22e8ff;color:#22e8ff;border-radius:10px;min-height:60px;display:grid;place-items:center;font-weight:800;font-style:normal}\n.fit{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}\n.fill{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}\n@media(max-width:560px){.pair{grid-template-columns:1fr}}' }
    },
    {
      id: "glass-blur", title: "Glassmorphism & backdrop-filter",
      html: `<p class="lead">Frosted glass: <code class="inline">backdrop-filter: blur()</code> over vivid backgrounds - the signature look of modern dashboards.</p>
<h2>Recipe</h2>
<ul>
  <li>Blur + saturate: <code class="inline">backdrop-filter: blur(18px) saturate(160%)</code></li>
  <li>Translucent fill: <code class="inline">rgba(255,255,255,.08)</code></li>
  <li>Thin luminous border: <code class="inline">border: 1px solid rgba(255,255,255,.18)</code></li>
  <li>Performance: blur is expensive - keep layers small, add <code class="inline">will-change</code> sparingly</li>
</ul>`,
      seed: { html: '<div class="wrap"><div class="glass g1">Glass One</div><div class="glass g2">Glass Two</div></div>', css: 'body{margin:0;font-family:sans-serif}\n.wrap{min-height:90vh;display:flex;justify-content:center;align-items:center;gap:26px;flex-wrap:wrap;background:conic-gradient(from 180deg at 50% 50%,#ff3ea5,#b15cff,#22e8ff,#38f2a5,#ff3ea5);padding:20px}\n.glass{width:min(260px,80vw);padding:34px;border-radius:22px;text-align:center;font-weight:700;color:#fff;background:rgba(255,255,255,.08);backdrop-filter:blur(18px) saturate(160%);-webkit-backdrop-filter:blur(18px) saturate(160%);border:1px solid rgba(255,255,255,.22);box-shadow:0 18px 50px rgba(0,0,0,.35)}\n.g2{background:rgba(0,0,0,.18)}' }
    },
    {
      id: "mobile-first", title: 'Mobile-First Workflow & Breakpoints',
      html: `
<p class="lead">Mobile-first CSS = write your base styles for a 320px phone, then use <code class="inline">min-width</code> media queries to ADD complexity as the screen grows. It is faster, lighter, and forces simpler design.</p>
<h2>Why mobile-first wins</h2>
<ul>
  <li>Small screens have the least space — design there first, and you never have to "un-do" big-screen clutter</li>
  <li>The cascade reads like growing up: base → <code class="inline">min-width:640px</code> → <code class="inline">min-width:1024px</code></li>
  <li>Each later block only overrides earlier ones, so repeating the same property per tier is safe</li>
</ul>
<h2>min-width vs max-width, side by side</h2>
<pre>/* MOBILE-FIRST (recommended) — start small, add up */
.grid { grid-template-columns: 1fr; }                        /* phone */
@media (min-width: 640px)  { .grid { grid-template-columns: 1fr 1fr; } }   /* tablet+ */
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(3,1fr); } } /* desktop+ */

/* DESKTOP-FIRST (legacy) — start big, strip down */
.grid { grid-template-columns: repeat(3,1fr); }
@media (max-width: 1023px) { .grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 639px)  { .grid { grid-template-columns: 1fr; } }</pre>
<h2>Choosing breakpoints</h2>
<p>Test the design at 320px and <i>keep making the viewport wider</i> until something looks cramped — that width is your breakpoint. Content-driven beats device-driven (there is no "iPhone 15 breakpoint").</p>`,
      seed: {
        html: '<div class="lbl">Current tier: <b id="t">?</b></div>\n<div class="box">This layout starts as <b>1 column</b> and only ever GAINS columns — that is the mobile-first promise: <code>min-width</code> queries add, they never remove.</div>\n<div class="grid"><div>Article</div><div>Card</div><div>Panel</div></div>',
        css: 'body{margin:0;font-family:sans-serif;background:#05060d;color:#cfd6f2;padding:16px}\n.lbl{font-size:.85rem;color:#8f9ac4;margin-bottom:10px}\n.lbl b{color:#38f2a5;font-size:1rem}\n.box{background:#11142a;border:1px solid #262b4d;border-radius:12px;padding:14px;font-size:.88rem;line-height:1.6;margin-bottom:14px}\n.grid{display:grid;grid-template-columns:1fr;gap:10px}\n.grid>div{background:linear-gradient(150deg,#11142a,#151a3a);border:1px solid #22e8ff;border-radius:10px;padding:22px 12px;text-align:center;color:#22e8ff;font-weight:700}\n@media(min-width:640px){.grid{grid-template-columns:1fr 1fr}}\n@media(min-width:980px){.grid{grid-template-columns:repeat(3,1fr)}.grid>div{border-color:#b15cff;color:#b15cff}}',
        js: 'const t=document.getElementById("t");\nfunction u(){t.textContent=innerWidth<640?"PHONE — 1 col":innerWidth<980?"TABLET — 2 cols":"DESKTOP — 3 cols"}\naddEventListener("resize",u);u();'
      }
    },
    {
      id: "fluid-layouts", title: 'Fluid Layouts: vw, %, auto-fit (Zero Breakpoints)',
      html: `
<p class="lead">The smoothest responsive design needs <b>no media queries at all</b>: let grids and type scale continuously with the viewport. Fluid = percentage sizing + <code class="inline">auto-fit</code> + <code class="inline">clamp()</code>.</p>
<h2>Viewport units</h2>
<ul>
  <li><code class="inline">1vw = 1% of viewport width</code>, <code class="inline">1vh = 1% of viewport height</code></li>
  <li><code class="inline">vmin / vmax</code> — the smaller / larger of the two (great for hero text and full-screen backgrounds)</li>
  <li>Gotcha: <code class="inline">100vw</code> includes the scrollbar width, so it can cause horizontal overflow — prefer <code class="inline">100%</code> of the body</li>
</ul>
<h2>The self-reflowing grid (no query!)</h2>
<pre>.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}</pre>
<p><code class="inline">minmax(180px, 1fr)</code> means "a column is at least 180px, otherwise share the space evenly". As the viewport narrows, columns drop off automatically — a continuous, breakpoint-free reflow.</p>
<h2>Make everything fluid</h2>
<ul>
  <li>Type: <code class="inline">font-size: clamp(1rem, 0.8rem + 2vw, 1.5rem)</code></li>
  <li>Spacing: <code class="inline">padding: clamp(16px, 4vw, 48px)</code></li>
  <li>Cap the page: <code class="inline">max-width: 1200px; margin: 0 auto</code> so it never stretches on 4K</li>
  <li>Hybrid trick: fluid for the middle range, hard min/max via <code class="inline">clamp()</code> at the ends</li>
</ul>`,
      seed: {
        html: '<h1>Fluid heading — resize me</h1>\n<p class="sub">Zero media queries on this page. The grid and the type scale continuously with the width — drag the split edge and watch it reflow.</p>\n<div class="grid"><div class="card">A</div><div class="card">B</div><div class="card">C</div><div class="card">D</div><div class="card">E</div><div class="card">F</div><div class="card">G</div><div class="card">H</div></div>',
        css: 'body{margin:0;font-family:sans-serif;background:#05060d;color:#cfd6f2;padding:clamp(14px,4vw,40px)}\nh1{font-size:clamp(1.3rem,1rem + 3vw,2.6rem);margin:0 0 6px;background:linear-gradient(90deg,#22e8ff,#b15cff);-webkit-background-clip:text;background-clip:text;color:transparent}\n.sub{font-size:clamp(.8rem,.7rem + .5vw,1rem);color:#8f9ac4;max-width:60ch;line-height:1.6;margin:0 0 18px}\n.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;max-width:1200px}\n.card{background:linear-gradient(150deg,#11142a,#181c38);border:1px solid #262b4d;border-radius:12px;min-height:70px;display:grid;place-items:center;font-weight:800;color:#22e8ff;font-size:1.1rem;transition:border-color .2s}\n.card:hover{border-color:#22e8ff}'
      }
    },
    {
      id: "responsive-images", title: 'Responsive Images & Media',
      html: `
<p class="lead">Images are the #1 thing that breaks responsive layouts. The fix is a one-line reset plus modern tools: <code class="inline">max-width:100%</code>, <code class="inline">object-fit</code>, <code class="inline">aspect-ratio</code>, <code class="inline">srcset</code> and <code class="inline">&lt;picture&gt;</code>.</p>
<h2>The reset (put it in every project)</h2>
<pre>img, video, svg, canvas, iframe { max-width: 100%; height: auto; }</pre>
<h2>object-fit — control the crop</h2>
<ul>
  <li><code class="inline">object-fit: cover</code> — fill the box, crop the overflow (photo cards)</li>
  <li><code class="inline">object-fit: contain</code> — fit inside, letterbox (logos, charts)</li>
  <li><code class="inline">object-fit: none</code> — stretch freely (usually a mistake)</li>
  <li><code class="inline">object-position: center 30%</code> — steer which part of the image shows</li>
</ul>
<h2>aspect-ratio — stop the layout jump</h2>
<pre>.thumb { aspect-ratio: 16 / 9; object-fit: cover; }</pre>
<p>Reserve the exact box BEFORE the image loads — content never shifts when it arrives (no CLS, no jumpy scroll).</p>
<h2>Serve the right file: srcset + sizes</h2>
<pre>&lt;img src="photo-480.jpg"
     srcset="photo-480.jpg 480w, photo-800.jpg 800w, photo-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw, 40vw"
     alt="sunset"&gt;</pre>
<p>The browser downloads only the file that fits the current slot. <code class="inline">&lt;picture&gt;</code> goes further: different <b>art direction</b> per breakpoint (a tall crop on phones, a wide one on desktops).</p>`,
      seed: {
        html: '<div class="bar">Box width: <b id="w">?</b>px — ratio locked, image covers &amp; crops</div>\n<div class="stage"><div class="img">GRADIENT "PHOTO"</div></div>\n<p class="hint">The .stage keeps a 16:9 box at ANY width (aspect-ratio), the inner "image" fills it (background-size: cover). Resize it — the layout never jumps.</p>',
        css: 'body{margin:0;font-family:sans-serif;background:#05060d;color:#cfd6f2;padding:16px}\n.bar{font-size:.85rem;color:#8f9ac4;margin-bottom:10px}\n.bar b{color:#22e8ff;font-size:1rem}\n.stage{aspect-ratio:16/9;background:#11142a;border:1px solid #262b4d;border-radius:14px;overflow:hidden}\n.img{width:100%;height:100%;display:grid;place-items:center;font-weight:800;letter-spacing:.08em;color:rgba(255,255,255,.92);text-shadow:0 2px 12px rgba(0,0,0,.5);background:linear-gradient(120deg,#ff3ea5,#b15cff 45%,#22e8ff)}\n.hint{font-size:.8rem;color:#8f9ac4;line-height:1.6;max-width:60ch;margin-top:10px}',
        js: 'const w=document.getElementById("w");\nfunction u(){w.textContent=Math.round(document.querySelector(".stage").getBoundingClientRect().width)}\naddEventListener("resize",u);u();'
      }
    },
    {
      id: "wrapup", title: "CSS Summary & Next Steps",
      html: `
<p class="lead">CSS course complete! Here is your final map of everything learned — and what to study next.</p>
<h2>You can now</h2>
<ul>
  <li>✔ Select anything: combinators, pseudo-classes, pseudo-elements, :has()</li>
  <li>✔ Master the box model, specificity and cascade layers</li>
  <li>✔ Layout with Flexbox and Grid at pro level (recipes included)</li>
  <li>✔ Responsive pages: media queries, container queries, fluid type with clamp()</li>
  <li>✔ Motion: transitions, keyframes, scroll-driven animations</li>
  <li>✔ 30+ UI recipes: cards, navbars, forms, loaders, tooltips, glassmorphism, neumorphism, parallax…</li>
</ul>
<h2>Css cheat sheet (most-used)</h2>
<ul>
  <li>Center: <code class="inline">display:grid; place-items:center</code></li>
  <li>Card row: <code class="inline">display:flex; gap:1rem; flex-wrap:wrap</code></li>
  <li>Gallery: <code class="inline">grid-template-columns:repeat(auto-fit,minmax(220px,1fr))</code></li>
  <li>Fluid title: <code class="inline">font-size:clamp(1.5rem,4vw,3rem)</code></li>
  <li>Glow: <code class="inline">box-shadow:0 0 14px var(--c1)</code></li>
</ul>
<h2>Next stop → JavaScript</h2>
<p>You have mastered styling — now make pages INTERACTIVE! Open the JavaScript course (22 chapters). 🚀</p>`,
      seed: { html: '<div class="pc">\n  <h2>Neon Card</h2>\n  <p>gradient + glow + hover</p>\n</div>',
              css: 'body{background:#05060d;display:grid;place-items:center;min-height:100vh;font-family:sans-serif}\n.pc{padding:30px 40px;border-radius:18px;border:2px solid transparent;background:linear-gradient(#0d1020,#0d1020) padding-box,linear-gradient(90deg,#22e8ff,#ff3ea5) border-box;transition:.3s}\n.pc:hover{box-shadow:0 0 30px rgba(34,232,255,.4);transform:scale(1.04)}\nh2{color:#22e8ff;margin:0 0 6px}p{color:#8f9ac4;margin:0}' }
    }
  ]
};
