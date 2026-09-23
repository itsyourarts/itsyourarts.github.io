/* GodxShadow course: Bootstrap — start se end tak */
COURSES.bootstrap = {
  name: "Bootstrap", color: "#b15cff", icon: "B", blurb: "Ready-made responsive components — fast UI, zero custom CSS.",
  lessons: [
    {
      id: "intro", title: "Bootstrap Introduction",
      html: `
<p class="lead"><b>Bootstrap</b> ek CSS framework hai — ready-made responsive components. Jaldi UI chahiye? Bootstrap jodi hui building blocks deta hai.</p>
<h2>Lagane ke 2 tarike</h2>
<ul>
  <li><b>CDN</b> (quick): css link + js bundle script</li>
  <li><b>npm</b>: <code class="inline">npm install bootstrap</code></li>
</ul>
<div class="note">GodxShadow editor ka preview sandbox CDN se CSS load nahi kar sakta — lessons mein code readable rakha gaya hai. Apne machine par CDN paste karke turant result dekho.</div>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}',
              js: 'const code = `&lt;head&gt;\n  &lt;link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"&gt;\n  &lt;script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"&gt;&lt;/script&gt;\n&lt;/head&gt;\n&lt;body class="p-4"&gt;\n  &lt;h1 class="display-4"&gt;Bootstrap ready!&lt;/h1&gt;\n&lt;/body&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "utility", title: "Utility Classes",
      html: `
<p class="lead">Bootstrap ka chassis — chhoti utility classes jo har cheez style karti hain, bina CSS file khole.</p>
<h2>Daily drivers</h2>
<ul>
  <li><code class="inline">m-3, p-4</code> — margin/padding (0–5)</li>
  <li><code class="inline">d-flex, justify-content-between, align-items-center</code></li>
  <li><code class="inline">text-center, fs-4, fw-bold</code></li>
  <li><code class="inline">bg-dark, text-light, rounded, shadow</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}',
              js: 'const code = `&lt;div class="d-flex justify-content-between p-3 bg-dark text-light rounded shadow"&gt;\n  &lt;span class="fw-bold"&gt;Logo&lt;/span&gt;\n  &lt;button class="btn btn-primary"&gt;Click&lt;/button&gt;\n&lt;/div&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "grid", title: "Grid System",
      html: `
<p class="lead">Bootstrap ka grid 12 columns ka — breakpoints ke saath responsive magic.</p>
<h2>Breakpoints</h2>
<ul>
  <li><code class="inline">col-</code> all sizes · <code class="inline">col-sm-</code> ≥576px · <code class="inline">col-md-</code> ≥768px · <code class="inline">col-lg-</code> ≥992px</li>
  <li><code class="inline">col-md-4</code> — medium+ par 4/12 width</li>
  <li>Auto-layout: <code class="inline">.row .col</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38f2a5;line-height:1.7}',
              js: 'const code = `&lt;div class="container"&gt;\n  &lt;div class="row g-3"&gt;\n    &lt;div class="col-12 col-md-6 col-lg-4"&gt;Card 1&lt;/div&gt;\n    &lt;div class="col-12 col-md-6 col-lg-4"&gt;Card 2&lt;/div&gt;\n    &lt;div class="col-12 col-md-6 col-lg-4"&gt;Card 3&lt;/div&gt;\n  &lt;/div&gt;\n&lt;/div&gt;\n\n&lt;!-- mobile: 1 col, tablet: 2, desktop: 3 --&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "components", title: "Cards, Alerts & Badges",
      html: `
<p class="lead">Bootstrap ke ready-made UI pieces — classes lagaake kaam khatam.</p>
<h2>Common components</h2>
<ul>
  <li><code class="inline">card card-body card-title</code></li>
  <li><code class="inline">btn btn-primary/success/danger</code></li>
  <li><code class="inline">alert alert-warning</code></li>
  <li><code class="inline">badge bg-success</code>, <code class="inline">list-group</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}',
              js: 'const code = `&lt;div class="card" style="width: 18rem"&gt;\n  &lt;div class="card-body"&gt;\n    &lt;h5 class="card-title"&gt;Neon Course &lt;span class="badge bg-success"&gt;New&lt;/span&gt;&lt;/h5&gt;\n    &lt;p class="card-text"&gt;Learn step by step.&lt;/p&gt;\n    &lt;a href="#" class="btn btn-primary"&gt;Enroll&lt;/a&gt;\n  &lt;/div&gt;\n&lt;/div&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "navbar-forms", title: "Navbar & Forms",
      html: `
<p class="lead">Navigation aur forms — har site ke core.</p>
<h2>Navbar classes</h2>
<ul>
  <li><code class="inline">navbar navbar-expand-lg navbar-dark bg-dark</code></li>
  <li><code class="inline">navbar-brand, navbar-nav, nav-link</code></li>
  <li>Responsive toggle (hamburger) auto-bundle mein</li>
</ul>
<h2>Form classes</h2>
<p><code class="inline">form-control, form-label, form-check, btn btn-success</code></p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#22e8ff;line-height:1.7}',
              js: 'const code = `&lt;div class="container mt-4" style="max-width:400px"&gt;\n  &lt;h2&gt;Login&lt;/h2&gt;\n  &lt;div class="mb-3"&gt;\n    &lt;label class="form-label"&gt;Email&lt;/label&gt;\n    &lt;input type="email" class="form-control"&gt;\n  &lt;/div&gt;\n  &lt;div class="mb-3 form-check"&gt;\n    &lt;input type="checkbox" class="form-check-input" id="r"&gt;\n    &lt;label class="form-check-label" for="r"&gt;Remember me&lt;/label&gt;\n  &lt;/div&gt;\n  &lt;button class="btn btn-success w-100"&gt;Login&lt;/button&gt;\n&lt;/div&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "js-components", title: "Modal, Toast & Collapse",
      html: `
<p class="lead">Interactive components — JS ke saath aate hain. <code class="inline">data-bs-toggle</code> se bina JS likhe chal jaate hain.</p>
<h2>Patterns</h2>
<ul>
  <li>Modal: <code class="inline">data-bs-toggle="modal" data-bs-target="#myModal"</code></li>
  <li>Collapse (accordion), Toast (notification popups)</li>
  <li>JS API: <code class="inline">new bootstrap.Modal(el).show()</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ff3ea5;line-height:1.7}',
              js: 'const code = `&lt;button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#m"&gt;Open Modal&lt;/button&gt;\n\n&lt;div class="modal fade" id="m"&gt;\n  &lt;div class="modal-dialog"&gt;\n    &lt;div class="modal-content"&gt;\n      &lt;div class="modal-header"&gt;\n        &lt;h5 class="modal-title"&gt;Neon!&lt;/h5&gt;\n        &lt;button class="btn-close" data-bs-dismiss="modal"&gt;&lt;/button&gt;\n      &lt;/div&gt;\n      &lt;div class="modal-body"&gt;Hello from modal&lt;/div&gt;\n    &lt;/div&gt;\n  &lt;/div&gt;\n&lt;/div&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "customize", title: "Customize & Dark Mode",
      html: `
<p class="lead">Bootstrap default nahi dikhani chahiye — sass variables ya CSS overrides se apna brand banayo.</p>
<h2>Tarike</h2>
<ul>
  <li><code class="inline">data-bs-theme="dark"</code> — built-in dark mode (5.3+)</li>
  <li>CSS vars override: <code class="inline">:root { --bs-primary: #22e8ff; }</code></li>
  <li>Sass: <code class="inline">$primary: #22e8ff; @import "bootstrap";</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}',
              js: 'const code = `&lt;html data-bs-theme="dark"&gt;\n&lt;style&gt;\n  :root {\n    --bs-primary: #22e8ff;\n    --bs-body-bg: #05060d;\n  }\n&lt;/style&gt;\n&lt;!-- ab sab neon dark Bootstrap! --&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "wrapup", title: "Bootstrap Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — ab tum Bootstrap se production-ready UI bana sakte ho.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>CDN setup, utilities</li>
  <li>Grid (12 cols + breakpoints)</li>
  <li>Cards, navbars, forms, modals</li>
  <li>Theming + dark mode</li>
</ul>
<h2>Agla step</h2>
<p>React devs: <b>react-bootstrap</b> · custom CSS lovers: <b>Tailwind</b> explore karo.</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}',
              js: 'const code = `&lt;footer class="text-center text-light py-4"&gt;\n  Bootstrap complete ✔\n&lt;/footer&gt;`;\ndocument.getElementById("out").innerHTML = code;\nconsole.log("Bootstrap course complete ✔");' }
    }
  ]
};
