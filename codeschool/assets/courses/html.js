/* GodxShadow course: HTML — full course, start to finish (English) */
COURSES.html = {
  name: "HTML", color: "#ff5c7a", icon: "&lt;/&gt;", blurb: "The skeleton of every web page — structure, content and meaning.",
  lessons: [
    {
      id: "intro", title: "HTML Introduction",
      html: `
<p class="lead"><b>HTML (HyperText Markup Language)</b> is the standard markup language used to create web pages. It describes the <b>structure</b> of a page — what is a heading, what is a paragraph, what is a link — and the browser turns that structure into the page you see.</p>
<h2>Key ideas</h2>
<ul>
  <li>HTML is made of <b>elements</b> written inside angle brackets: <code class="inline">&lt;p&gt;Hello&lt;/p&gt;</code></li>
  <li>Most elements come in pairs: an <b>opening tag</b> <code class="inline">&lt;p&gt;</code> and a <b>closing tag</b> <code class="inline">&lt;/p&gt;</code></li>
  <li>HTML defines <b>structure</b>; CSS handles looks and JavaScript handles behaviour</li>
  <li>It is <b>not</b> case sensitive, but lowercase is the convention</li>
</ul>
<h2>The smallest complete page</h2>
<p>Every HTML document follows the same skeleton shown in the example below. Press <b>Try it ▸</b>, edit the text and run it — the page on the right updates live.</p>`,
      seed: { html: '<h1>My First Heading</h1>\n<p>My first paragraph.</p>\n<p>HTML is not a programming language,\nit is a <b>markup language</b>.</p>',
              css: 'body { font-family: sans-serif; background: #0b0f1e; color: #e7ecff; padding: 20px; }\nh1 { color: #ff5c7a; }' }
    },
    {
      id: "elements", title: "HTML Elements",
      html: `
<p class="lead"><b>An HTML element</b> is everything from the start tag to the end tag, including the content in between. Elements can be nested inside each other, like boxes inside boxes.</p>
<h2>Definition</h2>
<p>An element = <b>start tag</b> + <b>content</b> + <b>end tag</b>. Example: <code class="inline">&lt;h1&gt;Hello&lt;/h1&gt;</code>. The content can itself contain more elements.</p>
<h2>Rules to remember</h2>
<ul>
  <li>Always close your tags: <code class="inline">&lt;p&gt;...&lt;/p&gt;</code> (except <b>empty elements</b> like <code class="inline">&lt;br&gt;</code>, <code class="inline">&lt;img&gt;</code>, <code class="inline">&lt;hr&gt;</code> which have no end tag)</li>
  <li>Nest properly — never cross: ❌ <code class="inline">&lt;b&gt;&lt;i&gt;text&lt;/b&gt;&lt;/i&gt;</code> ✅ <code class="inline">&lt;b&gt;&lt;i&gt;text&lt;/i&gt;&lt;/b&gt;</code></li>
  <li>Skipping <code class="inline">&lt;html&gt;</code>/<code class="inline">&lt;head&gt;</code>/<code class="inline">&lt;body&gt;</code> can cause unpredictable rendering</li>
</ul>
<h2>Example</h2>`,
      seed: { html: '<div>\n  <h2>Elements can be nested</h2>\n  <p>This <b>bold</b> and <i>italic</i> text lives inside a paragraph,</p>\n  <p>and the paragraph lives inside a <b>div</b>.</p>\n</div>\n<hr>\n<p>The line above is made by an empty element: &lt;hr&gt;</p>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}\ndiv{border:2px solid #ff5c7a;border-radius:10px;padding:12px}\nb{color:#22e8ff}' }
    },
    {
      id: "attributes", title: "HTML Attributes",
      html: `
<p class="lead"><b>Attributes</b> provide extra information about an element. They are always written <b>inside the start tag</b> as <code class="inline">name="value"</code> pairs.</p>
<h2>Definition</h2>
<p>An attribute modifies or configures an element: <code class="inline">&lt;a href="https://example.com"&gt;link&lt;/a&gt;</code> — here <code class="inline">href</code> tells the link where to go.</p>
<h2>The most-used attributes</h2>
<ul>
  <li><code class="inline">href</code> — address of a link</li>
  <li><code class="inline">src</code> — file path of an image/script</li>
  <li><code class="inline">alt</code> — text shown if an image fails (and read by screen readers)</li>
  <li><code class="inline">style</code> — inline CSS · <code class="inline">class</code>/<code class="inline">id</code> — names for styling & JS</li>
  <li><code class="inline">title</code> — tooltip on hover · <code class="inline">width</code>/<code class="inline">height</code> — dimensions</li>
  <li><code class="inline">lang</code> — language of the document</li>
</ul>
<h2>Good practices</h2>
<ul>
  <li>Always write attributes in <b>lowercase</b> and quote the values</li>
  <li>Boolean attributes like <code class="inline">disabled</code> and <code class="inline">required</code> need no value</li>
</ul>
<h2>Example</h2>`,
      seed: { html: '<a href="https://w3schools.com" title="Visit W3Schools">Hover me — I have a tooltip</a>\n<img src="https://picsum.photos/seed/gx1/200/120" alt="A sample image" width="200" height="120">\n<p style="color:#22e8ff">This paragraph uses the style attribute.</p>\n<input type="checkbox" checked disabled> A disabled checkbox',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}\na{color:#ff3ea5;font-size:1.1rem}\nimg{display:block;margin:14px 0;border-radius:8px}' }
    },
    {
      id: "headings", title: "Headings & Paragraphs",
      html: `
<p class="lead"><b>Headings</b> give structure and importance levels to your text; <b>paragraphs</b> hold the actual content. Search engines and screen readers use headings to understand your page.</p>
<h2>Definitions</h2>
<ul>
  <li><code class="inline">&lt;h1&gt;</code> to <code class="inline">&lt;h6&gt;</code> — six heading levels, h1 most important, h6 least</li>
  <li><code class="inline">&lt;p&gt;</code> — a paragraph of text</li>
  <li><code class="inline">&lt;hr&gt;</code> — a horizontal rule (thematic break)</li>
  <li><code class="inline">&lt;br&gt;</code> — a line break <b>without</b> a new paragraph</li>
</ul>
<h2>Best practices</h2>
<ul>
  <li>Use <b>one</b> <code class="inline">&lt;h1&gt;</code> per page, and do not skip levels (h2 after h1 …)</li>
  <li>Never choose a heading for its size — choose it for its <b>level</b>; style size with CSS</li>
</ul>
<h2>Example</h2>`,
      seed: { html: '<h1>Main Title (h1)</h1>\n<h2>Section (h2)</h2>\n<p>Each heading carries a different level of importance. Browsers show them at different sizes by default.</p>\n<h3>Sub section (h3)</h3>\n<p>Use br to break a line<br>without starting a new paragraph.</p>\n<hr>\n<p>Everything above the line is one theme.</p>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}\nh1{color:#ff5c7a} h2{color:#22e8ff} h3{color:#b15cff}\nhr{border:0;border-top:2px solid #262b4d}' }
    },
    {
      id: "formatting", title: "Text Formatting",
      html: `
<p class="lead">Formatting elements carry <b>meaning</b> for your text — bold importance, emphasis, code, quotations — not just a look.</p>
<h2>Semantic formatting elements</h2>
<ul>
  <li><code class="inline">&lt;strong&gt;</code> — important text (usually <b>bold</b>)</li>
  <li><code class="inline">&lt;em&gt;</code> — emphasised text (usually <i>italic</i>)</li>
  <li><code class="inline">&lt;mark&gt;</code> — highlighted text</li>
  <li><code class="inline">&lt;del&gt;</code> / <code class="inline">&lt;ins&gt;</code> — deleted / inserted text</li>
  <li><code class="inline">&lt;sub&gt;</code> / <code class="inline">&lt;sup&gt;</code> — subscript / superscript: H₂O, x³</li>
  <li><code class="inline">&lt;code&gt;</code> — computer code · <code class="inline">&lt;kbd&gt;</code> — keyboard input</li>
  <li><code class="inline">&lt;b&gt;</code> / <code class="inline">&lt;i&gt;</code> — style only, no extra meaning</li>
  <li><code class="inline">&lt;small&gt;</code> — side comments</li>
</ul>
<h2>Example</h2>`,
      seed: { html: '<p>This word is <strong>important</strong> and this is <em>emphasised</em>.</p>\n<p>Revision: <del>old price ₹499</del> <ins>new ₹299</ins></p>\n<p>Water is H<sub>2</sub>O and 2<sup>3</sup> = 8.</p>\n<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save. Your function <code>main()</code> returns a value.</p>\n<p><mark>Highlighted</mark> text draws attention.</p>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif;line-height:1.8}\nstrong{color:#ff5c7a} em{color:#b15cff} mark{background:#ffc857;color:#111}\nkbd{background:#141a33;padding:2px 8px;border-radius:6px;border:1px solid #262b4d}\ndel{color:#8f9ac4} ins{color:#38f2a5}' }
    },
    {
      id: "links", title: "Links",
      html: `
<p class="lead"><b>Hyperlinks</b> connect the web. The <code class="inline">&lt;a&gt;</code> (anchor) element links to other pages, files, emails, phone numbers or spots on the same page.</p>
<h2>Definition</h2>
<p><code class="inline">&lt;a href="URL"&gt;link text&lt;/a&gt;</code> — the <code class="inline">href</code> (hypertext reference) attribute is the destination.</p>
<h2>Types of links</h2>
<ul>
  <li><b>Absolute</b>: <code class="inline">href="https://example.com/page"</code> — full URL, leaves your site</li>
  <li><b>Relative</b>: <code class="inline">href="about.html"</code> — inside your own site</li>
  <li><b>Bookmark</b>: <code class="inline">href="#section2"</code> — jumps to an element with <code class="inline">id="section2"</code></li>
  <li><b>Email</b>: <code class="inline">href="mailto:hi@x.in"</code> · <b>Call</b>: <code class="inline">href="tel:+911234567890"</code></li>
  <li><code class="inline">target="_blank"</code> — opens in a new tab (add <code class="inline">rel="noopener"</code>)</li>
  <li>Anything can be a link — an image or a button too</li>
</ul>
<h2>Example</h2>`,
      seed: { html: '<a href="https://google.com" target="_blank" rel="noopener">Open Google in a new tab</a><br>\n<a href="#bottom">Jump to the bottom section</a><br>\n<a href="mailto:hello@godxshadow.dev">Email us</a>\n<div style="height:120px"></div>\n<h2 id="bottom">You jumped here! 🎯</h2>\n<a href="https://example.com"><img src="https://picsum.photos/seed/gx2/120/80" alt="clickable image"></a>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif;line-height:2}\na{color:#22e8ff} img{border-radius:8px;margin-top:10px}' }
    },
    {
      id: "images", title: "Images",
      html: `
<p class="lead">The <code class="inline">&lt;img&gt;</code> element embeds images. It has <b>no closing tag</b> and its two required attributes are <code class="inline">src</code> and <code class="inline">alt</code>.</p>
<h2>Essential attributes</h2>
<ul>
  <li><code class="inline">src</code> — path/URL of the image file</li>
  <li><code class="inline">alt</code> — alternative text: shown if the image fails to load, and read aloud by screen readers. <b>Never skip it.</b></li>
  <li><code class="inline">width</code>/<code class="inline">height</code> — reserve space so the page does not jump while loading</li>
  <li><code class="inline">loading="lazy"</code> — load only when scrolled into view (faster pages)</li>
</ul>
<h2>Related elements</h2>
<ul>
  <li><code class="inline">&lt;figure&gt;</code> + <code class="inline">&lt;figcaption&gt;</code> — image with a caption</li>
  <li><code class="inline">&lt;picture&gt;</code> + <code class="inline">&lt;source&gt;</code> — different images for different screens</li>
  <li>Background images belong in CSS, not <code class="inline">&lt;img&gt;</code></li>
</ul>
<h2>Example</h2>`,
      seed: { html: '<img src="https://picsum.photos/seed/gx3/320/180" alt="Neon city at night" width="320" height="180">\n<figure style="margin-left:0">\n  <img src="https://picsum.photos/seed/gx4/320/180" alt="Circuit board closeup" loading="lazy">\n  <figcaption>figure + figcaption = image with caption</figcaption>\n</figure>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}\nimg{display:block;border-radius:12px;max-width:100%;height:auto;margin-bottom:14px}\nfigcaption{color:#8f9ac4;font-size:.85rem;margin-top:6px}\nfigure{border:1px solid #262b4d;border-radius:12px;padding:12px;display:inline-block}' }
    },
    {
      id: "lists", title: "Lists",
      html: `
<p class="lead">Lists group related items. HTML has three kinds: <b>unordered</b> (bullets), <b>ordered</b> (numbers) and <b>description</b> (term + definition).</p>
<h2>Definition</h2>
<ul>
  <li><code class="inline">&lt;ul&gt;</code> + <code class="inline">&lt;li&gt;</code> — bullets, order does not matter</li>
  <li><code class="inline">&lt;ol&gt;</code> — numbered; attributes: <code class="inline">start="5"</code>, <code class="inline">reversed</code>, <code class="inline">type="A|a|I|i|1"</code></li>
  <li><code class="inline">&lt;dl&gt;</code> + <code class="inline">&lt;dt&gt;</code> (term) + <code class="inline">&lt;dd&gt;</code> (description)</li>
</ul>
<h2>Tricks</h2>
<ul>
  <li>Lists <b>nest</b> — put a full list inside an <code class="inline">&lt;li&gt;</code></li>
  <li>Navigation menus are conventionally built from <code class="inline">&lt;ul&gt;</code> restyled with CSS</li>
</ul>
<h2>Example</h2>`,
      seed: { html: '<h3>Shopping list (ul)</h3>\n<ul><li>Milk</li><li>Bread\n  <ul><li>Whole wheat</li><li>Brown</li></ul>\n</li></ul>\n<h3>Steps (ol, starting at 5)</h3>\n<ol start="5"><li>Open editor</li><li>Write HTML</li><li>Press Run</li></ol>\n<h3>Glossary (dl)</h3>\n<dl><dt>HTML</dt><dd>Structure of the page</dd><dt>CSS</dt><dd>Style of the page</dd></dl>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif;line-height:1.8}\nh3{color:#22e8ff;margin-bottom:4px}\ndt{color:#ff5c7a;font-weight:700}\ndd{color:#8f9ac4;margin-bottom:6px}' }
    },
    {
      id: "tables", title: "Tables",
      html: `
<p class="lead">Tables display <b>tabular data</b> in rows and columns — marks sheets, prices, schedules. (They are for data, not for page layout!)</p>
<h2>The anatomy</h2>
<ul>
  <li><code class="inline">&lt;table&gt;</code> → <code class="inline">&lt;tr&gt;</code> (row) → <code class="inline">&lt;th&gt;</code> (header cell) / <code class="inline">&lt;td&gt;</code> (data cell)</li>
  <li><code class="inline">&lt;thead&gt;</code>, <code class="inline">&lt;tbody&gt;</code>, <code class="inline">&lt;tfoot&gt;</code> — semantic row groups</li>
  <li><code class="inline">colspan="2"</code> — span across columns · <code class="inline">rowspan="2"</code> — span across rows</li>
  <li><code class="inline">&lt;caption&gt;</code> — table title · <code class="inline">&lt;colgroup&gt;</code> — style whole columns</li>
</ul>
<h2>Example</h2>
<p>The borders and stripes below are normal CSS applied to the table.</p>`,
      seed: { html: '<table>\n  <caption>Course Progress</caption>\n  <thead><tr><th>Course</th><th>Lessons</th><th>Status</th></tr></thead>\n  <tbody>\n    <tr><td>HTML</td><td>22</td><td>✅ Done</td></tr>\n    <tr><td>CSS</td><td>50</td><td>🔥 Running</td></tr>\n    <tr><td>C#</td><td>23</td><td>📌 Next</td></tr>\n  </tbody>\n  <tfoot><tr><td colspan="2">Total</td><td>3 courses</td></tr></tfoot>\n</table>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}\ntable{border-collapse:collapse;width:100%;max-width:480px}\ncaption{margin-bottom:8px;color:#22e8ff;font-weight:700}\nth{background:#141a33;color:#22e8ff;text-align:left}\nth,td{border:1px solid #262b4d;padding:10px 14px}\ntbody tr:nth-child(even){background:#11142a}' }
    },
    {
      id: "forms", title: "Forms & Inputs",
      html: `
<p class="lead"><b>Forms</b> collect user input — login boxes, search bars, feedback forms. The <code class="inline">&lt;form&gt;</code> element wraps controls; each control is an <b>input</b>.</p>
<h2>Core pieces</h2>
<ul>
  <li><code class="inline">&lt;form action="/submit" method="post"&gt;</code> — where & how data goes</li>
  <li><code class="inline">&lt;label for="email"&gt;</code> — click-able caption; pair with <code class="inline">id</code></li>
  <li><code class="inline">&lt;input type="…"&gt;</code> — text, email, password, number, date, radio, checkbox, file, color, range…</li>
  <li><code class="inline">&lt;select&gt;</code> + <code class="inline">&lt;option&gt;</code> — dropdown · <code class="inline">&lt;textarea&gt;</code> — multi-line text</li>
  <li><code class="inline">&lt;button type="submit"&gt;</code> — sends the form</li>
</ul>
<h2>UX helpers</h2>
<ul>
  <li><code class="inline">placeholder</code>, <code class="inline">required</code>, <code class="inline">minlength</code>/<code class="inline">maxlength</code>, <code class="inline">min</code>/<code class="inline">max</code>, <code class="inline">pattern</code></li>
  <li><code class="inline">&lt;fieldset&gt;</code> + <code class="inline">&lt;legend&gt;</code> — group related fields</li>
  <li><code class="inline">autofocus</code>, <code class="inline">autocomplete="email"</code></li>
</ul>
<h2>Example</h2>`,
      seed: { html: '<form>\n  <label for="e">Email</label>\n  <input id="e" type="email" required placeholder="you@mail.com">\n\n  <label for="c">Favorite course</label>\n  <select id="c"><option>HTML</option><option>CSS</option><option>C#</option></select>\n\n  <label><input type="radio" name="lvl" checked> Beginner</label>\n  <label><input type="radio" name="lvl"> Pro</label>\n\n  <button type="submit">Sign Up</button>\n</form>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}\nform{display:flex;flex-direction:column;gap:10px;max-width:320px}\ninput,select{background:#11142a;border:1px solid #262b4d;color:#fff;padding:10px;border-radius:8px}\nbutton{background:linear-gradient(90deg,#22e8ff,#b15cff);border:0;padding:12px;border-radius:10px;font-weight:700;cursor:pointer}\nlabel{color:#8f9ac4}' }
    },
    {
      id: "classes-ids", title: "Classes & IDs",
      html: `
<p class="lead"><code class="inline">class</code> and <code class="inline">id</code> are global attributes that name elements so CSS and JavaScript can find them.</p>
<h2>Definition</h2>
<ul>
  <li><code class="inline">id="intro"</code> — <b>unique</b> name; only ONE element per page may have it</li>
  <li><code class="inline">class="card neon"</code> — <b>reusable</b> name; many elements can share classes, and one element can have many classes (space-separated)</li>
</ul>
<h2>How they are used</h2>
<ul>
  <li>In CSS: <code class="inline">#intro { }</code> (hash) vs <code class="inline">.card { }</code> (dot)</li>
  <li>In JS: <code class="inline">getElementById("intro")</code>, <code class="inline">querySelector(".card")</code></li>
  <li>Links can jump to ids: <code class="inline">href="#intro"</code></li>
</ul>
<h2>Naming tips</h2>
<ul>
  <li>Lowercase with hyphens: <code class="inline">nav-item, hero-title</code></li>
  <li>Names describe <b>role</b>, not look: prefer <code class="inline">alert-box</code> over <code class="inline">red-box</code></li>
</ul>
<h2>Example</h2>`,
      seed: { html: '<div id="header">I am UNIQUE (one id per page)</div>\n<div class="card neon">Card 1 — class shared</div>\n<div class="card">Card 2 — same class, no glow</div>\n<div class="card neon">Card 3 — class reused</div>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}\n#header{background:#ff5c7a;color:#fff;padding:14px;border-radius:10px;margin-bottom:12px;font-weight:700}\n.card{background:#11142a;border:1px solid #262b4d;padding:14px;border-radius:10px;margin-bottom:10px}\n.neon{border-color:#22e8ff;color:#22e8ff;box-shadow:0 0 14px #22e8ff33}' }
    },
    {
      id: "block-inline", title: "Block vs Inline",
      html: `
<p class="lead">Every element is naturally either <b>block-level</b> or <b>inline</b>. This decides how it flows on the page.</p>
<h2>Definitions</h2>
<ul>
  <li><b>Block-level</b> — always starts on a new line and takes the full available width: <code class="inline">&lt;div&gt;, &lt;p&gt;, &lt;h1&gt;-&lt;h6&gt;, &lt;section&gt;, &lt;form&gt;, &lt;table&gt;, &lt;ul&gt;</code></li>
  <li><b>Inline</b> — sits <i>inside</i> the flow, takes only the width it needs: <code class="inline">&lt;span&gt;, &lt;a&gt;, &lt;img&gt;, &lt;b&gt;, &lt;em&gt;, &lt;code&gt;, &lt;button&gt;, &lt;input&gt;</code></li>
</ul>
<h2>Key consequences</h2>
<ul>
  <li>You <b>cannot</b> put a block element inside an inline one: ✅ <code class="inline">&lt;div&gt;&lt;span&gt;&lt;/span&gt;&lt;/div&gt;</code> ❌ <code class="inline">&lt;span&gt;&lt;div&gt;&lt;/div&gt;&lt;/span&gt;</code></li>
  <li><code class="inline">width</code>/<code class="inline">height</code> and vertical margins are ignored on inline elements</li>
  <li>CSS can override: <code class="inline">display: inline | block | inline-block</code></li>
</ul>
<h2>Example — the outlines show the difference</h2>`,
      seed: { html: '<div class="bl">Block div — full width</div>\n<div class="bl">Another block — new line</div>\n<p>This is a paragraph with an <span class="in">inline span</span> and an <a class="in">inline link</a> inside it. They share the line.</p>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}\n.bl{background:#141a33;color:#22e8ff;border:2px solid #22e8ff;padding:12px;border-radius:8px;margin:10px 0}\n.in{background:#3a1228;color:#ff5c7a;border:2px dashed #ff5c7a;padding:0 6px;border-radius:6px}' }
    },
    {
      id: "semantic", title: "Semantic Layout",
      html: `
<p class="lead"><b>Semantic elements</b> describe their <b>purpose</b> to browsers, search engines and screen readers — instead of anonymous <code class="inline">&lt;div&gt;</code> soup.</p>
<h2>The layout elements</h2>
<ul>
  <li><code class="inline">&lt;header&gt;</code> — intro content / logo / nav of a page or section</li>
  <li><code class="inline">&lt;nav&gt;</code> — major navigation links</li>
  <li><code class="inline">&lt;main&gt;</code> — the unique main content (one per page)</li>
  <li><code class="inline">&lt;section&gt;</code> — thematic group · <code class="inline">&lt;article&gt;</code> — self-contained content (blog post, card)</li>
  <li><code class="inline">&lt;aside&gt;</code> — side content (related links, ads)</li>
  <li><code class="inline">&lt;footer&gt;</code> — closing info</li>
  <li><code class="inline">&lt;figure&gt;</code>, <code class="inline">&lt;hgroup&gt;</code>, <code class="inline">&lt;address&gt;</code></li>
</ul>
<h2>Why it matters</h2>
<ul>
  <li>Better SEO — search engines understand your page hierarchy</li>
  <li>Better accessibility — screen-reader users can jump straight to <code class="inline">&lt;main&gt;</code> or <code class="inline">&lt;nav&gt;</code></li>
  <li>Easier code to read and maintain</li>
</ul>
<h2>Example — a semantic page structure</h2>`,
      seed: { html: '<header class="p">header — logo &amp; nav</header>\n<nav class="p">nav — menu links</nav>\n<main>\n  <article class="p">article — main blog post</article>\n  <aside class="p">aside — related links</aside>\n</main>\n<footer class="p">footer — copyright</footer>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}\n.p{padding:14px;border-radius:10px;margin:6px 0;border:2px dashed #262b4d;text-align:center}\nheader.p{border-color:#ff5c7a;color:#ff5c7a}\nnav.p{border-color:#22e8ff;color:#22e8ff}\nmain{display:grid;grid-template-columns:2fr 1fr;gap:6px}\narticle.p{border-color:#b15cff;color:#b15cff;margin:0}\naside.p{border-color:#ffc857;color:#ffc857;margin:0}\nfooter.p{border-color:#38f2a5;color:#38f2a5}' }
    },
    {
      id: "media", title: "Audio & Video",
      html: `
<p class="lead">HTML5 plays media <b>natively</b> — no plugins needed. Use <code class="inline">&lt;audio&gt;</code> for sound and <code class="inline">&lt;video&gt;</code> for movies.</p>
<h2>Common attributes</h2>
<ul>
  <li><code class="inline">controls</code> — show play/pause/volume (without this the player is invisible)</li>
  <li><code class="inline">autoplay</code> — starts automatically (browsers usually require <code class="inline">muted</code> too)</li>
  <li><code class="inline">loop</code>, <code class="inline">muted</code>, <code class="inline">preload="auto|metadata|none"</code></li>
  <li>video only: <code class="inline">poster="img.jpg"</code>, <code class="inline">width</code>/<code class="inline">height</code></li>
</ul>
<h2>Sources & tracks</h2>
<ul>
  <li>Multiple <code class="inline">&lt;source&gt;</code> elements = fallbacks (mp4 → webm)</li>
  <li><code class="inline">&lt;track kind="subtitles"&gt;</code> — captions for accessibility</li>
  <li>Text between the tags shows only in very old browsers</li>
</ul>
<h2>Example</h2>`,
      seed: { html: '<h3>Audio</h3>\n<audio controls>\n  <source src="https://www.w3schools.com/html/horse.ogg" type="audio/ogg">\n  <source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg">\n  Your browser does not support audio.\n</audio>\n<h3>Video</h3>\n<video controls width="320" poster="https://picsum.photos/seed/gx5/320/180" muted>\n  <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">\n  Your browser does not support video.\n</video>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}\nh3{color:#22e8ff;margin:16px 0 8px}\nvideo{border-radius:12px;display:block;max-width:100%}\naudio{width:280px}' }
    },
    {
      id: "canvas-svg", title: "Canvas & SVG",
      html: `
<p class="lead">Two ways to draw on a page: <b>SVG</b> (vector graphics written as XML markup) and <b>&lt;canvas&gt;</b> (pixels drawn with JavaScript).</p>
<h2>Definitions</h2>
<ul>
  <li><b>SVG</b> — shapes are elements in the DOM: scalable without loss, styleable with CSS, good for icons/charts</li>
  <li><b>Canvas</b> — a drawing surface controlled entirely from JS: great for games, photo filters, thousands of moving particles</li>
</ul>
<h2>When to choose</h2>
<ul>
  <li>SVG → logos, icons, diagrams, anything that must stay crisp</li>
  <li>Canvas → fast animations, image manipulation, pixel effects</li>
</ul>
<h2>Example — one of each</h2>`,
      seed: { html: '<h3>SVG (markup)</h3>\n<svg width="120" height="120">\n  <circle cx="60" cy="60" r="50" fill="none" stroke="#22e8ff" stroke-width="4"/>\n  <circle cx="60" cy="60" r="20" fill="#ff3ea5"/>\n</svg>\n<h3>Canvas (JavaScript)</h3>\n<canvas id="c" width="300" height="120" style="border:1px solid #262b4d;border-radius:10px"></canvas>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}\nh3{color:#b15cff;margin:10px 0 6px}',
              js: 'const c = document.getElementById("c");\nconst ctx = c.getContext("2d");\nctx.fillStyle = "#22e8ff";\nctx.fillRect(10, 20, 90, 80);\nctx.strokeStyle = "#ff3ea5";\nctx.lineWidth = 4;\nctx.strokeRect(110, 20, 90, 80);\nctx.fillStyle = "#ffc857";\nctx.beginPath();\nctx.arc(250, 60, 35, 0, Math.PI * 2);\nctx.fill();' }
    },
    {
      id: "entities", title: "Entities & Symbols",
      html: `
<p class="lead">Some characters are <b>reserved</b> in HTML (like <code class="inline">&lt;</code> and <code class="inline">&gt;</code>) and some are not on your keyboard (© € ₹). You write them with <b>character entities</b>.</p>
<h2>Definition</h2>
<p>An entity starts with <code class="inline">&amp;</code> and ends with <code class="inline">;</code> — either a name (<code class="inline">&amp;copy;</code>) or a number (<code class="inline">&amp;#169;</code>).</p>
<h2>The must-know entities</h2>
<ul>
  <li><code class="inline">&amp;lt;</code> → &lt; · <code class="inline">&amp;gt;</code> → &gt; · <code class="inline">&amp;amp;</code> → &amp; · <code class="inline">&amp;quot;</code> → &quot;</li>
  <li><code class="inline">&amp;nbsp;</code> → non-breaking space (browsers squeeze normal spaces!)</li>
  <li><code class="inline">&amp;copy;</code> → © · <code class="inline">&amp;reg;</code> → ® · <code class="inline">&amp;trade;</code> → ™</li>
  <li><code class="inline">&amp;euro;</code> → € · <code class="inline">&amp;#8377;</code> → ₹ · <code class="inline">&amp;times;</code> → × · <code class="inline">&amp;divide;</code> → ÷</li>
  <li>Emoji/emoticon codes: <code class="inline">&amp;#128512;</code> → 😀</li>
</ul>
<h2>Example</h2>`,
      seed: { html: '<p>To write a tag as text: &amp;lt;h1&amp;gt; renders as &lt;h1&gt;</p>\n<p>Copyright &copy; 2026 GodxShadow &trade;</p>\n<p>Prices: 100 &euro; | &#8377;999 | 8 &times; 4 = 32</p>\n<p>Saved&nbsp;&nbsp;&nbsp;three non-breaking spaces.</p>\n<p style="font-size:2rem">Emoji from code: &#128512; &#128640; &#10024;</p>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif;line-height:1.9}' }
    },
    {
      id: "head-meta", title: "<head> & Meta Tags",
      html: `
<p class="lead">The <code class="inline">&lt;head&gt;</code> element holds <b>metadata</b> — information about the page that is not shown on the page itself (except the tab <b>title</b>).</p>
<h2>What lives in head</h2>
<ul>
  <li><code class="inline">&lt;title&gt;</code> — shown on the browser tab & Google results</li>
  <li><code class="inline">&lt;meta charset="utf-8"&gt;</code> — character encoding (always first!)</li>
  <li><code class="inline">&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code> — mobile responsiveness</li>
  <li><code class="inline">&lt;meta name="description" content="…"&gt;</code> — SEO snippet</li>
  <li><code class="inline">&lt;link rel="stylesheet"&gt;</code> — external CSS · <code class="inline">&lt;style&gt;</code> — internal CSS</li>
  <li><code class="inline">&lt;script&gt;</code>, <code class="inline">&lt;base&gt;</code>, <code class="inline">&lt;link rel="icon"&gt;</code> (favicon)</li>
</ul>
<h2>Social sharing</h2>
<ul>
  <li>Open Graph tags (<code class="inline">og:title, og:image</code>) control how links look on WhatsApp/X</li>
</ul>
<h2>Example — a complete head</h2>`,
      seed: { html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <meta name="description" content="Learn HTML the neon way — free.">\n  <meta property="og:title" content="GodxShadow Academy">\n  <title>My Page — GodxShadow</title>\n</head>\n<body>\n  <p>Look at the browser TAB — that is the title from the head!</p>\n</body>\n</html>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}' }
    },
    {
      id: "quotes-elements", title: "Quotes, Abbreviations & Addresses",
      html: `
<p class="lead">Several small semantic elements exist for quotations, abbreviations, contact info and citations.</p>
<h2>The elements</h2>
<ul>
  <li><code class="inline">&lt;blockquote&gt;</code> — a long quotation (indented); attribute <code class="inline">cite="URL"</code></li>
  <li><code class="inline">&lt;q&gt;</code> — short inline quote, adds quotation marks automatically</li>
  <li><code class="inline">&lt;abbr title="full form"&gt;</code> — abbreviation; hover shows the tooltip</li>
  <li><code class="inline">&lt;address&gt;</code> — contact info (usually italic)</li>
  <li><code class="inline">&lt;cite&gt;</code> — title of a creative work (book, movie)</li>
  <li><code class="inline">&lt;bdo dir="rtl"&gt;</code> — overrides text direction</li>
</ul>
<h2>Example</h2>`,
      seed: { html: '<p>As Tim Berners-Lee said, <q>The Web is for everyone.</q></p>\n<blockquote cite="https://example.com">\n  Any fool can write code that a computer can understand.\n  Good programmers write code that humans can understand.\n</blockquote>\n<p><abbr title="HyperText Markup Language">HTML</abbr> was invented at <abbr title="European Organization for Nuclear Research">CERN</abbr>.</p>\n<p>My favourite book this year: <cite>The Pragmatic Programmer</cite>.</p>\n<address>Written by GodxShadow — Delhi, India</address>\n<p><bdo dir="rtl">edocylesi live, say what?</bdo></p>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif;line-height:1.8}\nblockquote{background:#11142a;border-left:4px solid #22e8ff;margin:12px 0;padding:12px 16px;border-radius:0 10px 10px 0;color:#c9d2f5}\nabbr{border-bottom:2px dotted #ff3ea5;cursor:help}\naddress{color:#8f9ac4;font-size:.9rem}' }
    },
    {
      id: "iframes-embed", title: "iFrames & Embedding",
      html: `
<p class="lead">An <code class="inline">&lt;iframe&gt;</code> (inline frame) embeds <b>another HTML page inside your page</b> — used for maps, videos, payment widgets and live demos (like the one below!).</p>
<h2>Definition</h2>
<p><code class="inline">&lt;iframe src="page.html"&gt;&lt;/iframe&gt;</code> — a window into another document. Set <code class="inline">width</code>/<code class="inline">height</code> (or CSS), and give it a <code class="inline">title</code> for accessibility.</p>
<h2>Important attributes</h2>
<ul>
  <li><code class="inline">srcdoc="…"</code> — HTML content written directly (no external URL)</li>
  <li><code class="inline">sandbox="allow-scripts"</code> — security: restricts what the framed page can do</li>
  <li><code class="inline">loading="lazy"</code> — load when visible</li>
  <li><code class="inline">allow="fullscreen"</code> — needed for video players</li>
</ul>
<h2>Also embeddable</h2>
<ul>
  <li><code class="inline">&lt;embed&gt;</code> / <code class="inline">&lt;object&gt;</code> — older general-purpose embedding (PDFs, plugins)</li>
  <li>YouTube/Maps give you ready-made <code class="inline">&lt;iframe&gt;</code> code to paste</li>
</ul>
<h2>Example — an iframe made with srcdoc</h2>`,
      seed: { html: '<iframe title="Mini embedded page"\n        style="width:100%;height:150px;border:2px solid #22e8ff;border-radius:12px;background:#fff"\n        srcdoc="&lt;body style=\'font-family:sans-serif;background:#0b0f1e;color:#22e8ff;display:grid;place-items:center;height:90vh;margin:0\'&gt;&lt;h2&gt;I live inside an iframe!&lt;/h2&gt;&lt;/body&gt;"></iframe>\n<p>This whole page-in-page is one &lt;iframe&gt; element with srcdoc.</p>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}' }
    },
    {
      id: "file-paths", title: "File Paths (All Types)",
      html: `
<p class="lead">A <b>file path</b> tells the browser where a resource lives — your images, CSS files, pages. Getting paths wrong is the #1 reason for broken images.</p>
<h2>The types</h2>
<ul>
  <li><b>Absolute URL</b> — full address: <code class="inline">https://site.com/img/cat.jpg</code></li>
  <li><b>Relative to current page</b>: <code class="inline">img/cat.jpg</code> → current folder/img/</li>
  <li><b>Up one level</b>: <code class="inline">../img/cat.jpg</code> → parent folder</li>
  <li><b>Root-relative</b>: <code class="inline">/img/cat.jpg</code> → from the site root (starts with /)</li>
</ul>
<h2>Example folder map</h2>
<ul>
  <li><code class="inline">index.html</code> → <code class="inline">src="img/logo.png"</code></li>
  <li><code class="inline">pages/about.html</code> → <code class="inline">src="../img/logo.png"</code></li>
</ul>
<h2>Good practices</h2>
<ul>
  <li>Use relative paths for your own files, absolute URLs only for external ones</li>
  <li>Filenames are <b>case sensitive</b> on web servers: <code class="inline">Logo.png</code> ≠ <code class="inline">logo.png</code></li>
</ul>
<h2>Example</h2>`,
      seed: { html: '<!-- These are the same image requested 3 different ways -->\n<img src="https://picsum.photos/id/10/150/100" alt="absolute URL">\n<!-- src="img/cat.jpg"        → relative: looks in ./img/ -->\n<!-- src="../assets/pic.png"  → one folder up -->\n<!-- src="/images/pic.png"    → from site root -->',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}\nimg{border-radius:10px;display:block}p{color:#8f9ac4}' }
    },
    {
      id: "a11y", title: "Accessibility (a11y)",
      html: `
<p class="lead"><b>Accessibility</b> means building pages that everyone can use — including people who navigate with keyboards, screen readers or zoom. "a11y" = "a" + 11 letters + "y".</p>
<h2>Quick wins (HTML level)</h2>
<ul>
  <li>Always write <code class="inline">alt</code> on images — screen readers speak it</li>
  <li>Use <code class="inline">&lt;label for="…"&gt;</code> on every form control</li>
  <li>Use semantic elements (<code class="inline">&lt;nav&gt;, &lt;main&gt;, &lt;button&gt;</code>) instead of clickable divs</li>
  <li>Set <code class="inline">&lt;html lang="en"&gt;</code> so readers pronounce correctly</li>
  <li>Keep a logical heading order (h1 → h2 → h3)</li>
  <li>Every iframe gets a <code class="inline">title</code></li>
</ul>
<h2>Extra practices</h2>
<ul>
  <li>Sufficient colour contrast (never light-grey-on-white)</li>
  <li>Visible focus outlines — do not remove <code class="inline">:focus</code> styling</li>
  <li>ARIA attributes only when native HTML cannot express it</li>
</ul>
<h2>Example — accessible vs not</h2>`,
      seed: { html: '<h3>❌ Not accessible: clickable div</h3>\n<div class="fake">Click me</div>\n<h3>✅ Accessible: real button</h3>\n<button class="real">Click me (keyboard friendly!)</button>\n<h3>✅ Properly labelled input</h3>\n<label for="n">Your name:</label>\n<input id="n" type="text" placeholder="focus outline visible">',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:20px;font-family:sans-serif}\nh3{color:#8f9ac4;margin:14px 0 6px;font-size:1rem}\n.fake{display:inline-block;background:#3a1228;color:#8f9ac4;padding:10px 16px;border-radius:8px;cursor:pointer}\n.real{background:#22e8ff;color:#03121a;border:0;padding:12px 18px;border-radius:10px;font-weight:700;cursor:pointer}\n.real:focus-visible{outline:3px solid #ff3ea5;outline-offset:2px}\ninput{background:#11142a;border:1px solid #262b4d;color:#fff;padding:10px;border-radius:8px}\ninput:focus-visible{outline:3px solid #22e8ff}' }
    },
    {
      id: "wrapup", title: "HTML Summary & Next Steps",
      html: `
<p class="lead">HTML complete! Here is everything you learned, in one checklist — and what to study next.</p>
<h2>You can now</h2>
<ul>
  <li>✔ Build the skeleton of any page: doctype, html, head, body</li>
  <li>✔ Structure content with headings, paragraphs, lists and tables</li>
  <li>✔ Connect the web with links, images, audio/video and iframes</li>
  <li>✔ Collect data with forms and all the input types</li>
  <li>✔ Organise pages with semantic elements (header, nav, main, article, footer)</li>
  <li>✔ Name things with classes & ids, and write accessible markup</li>
</ul>
<h2>HTML Cheat Sheet</h2>
<ul>
  <li>Structure: <code class="inline">&lt;!DOCTYPE html&gt; &lt;html&gt; &lt;head&gt; &lt;body&gt;</code></li>
  <li>Text: <code class="inline">&lt;h1&gt;-&lt;h6&gt; &lt;p&gt; &lt;strong&gt; &lt;em&gt; &lt;mark&gt; &lt;code&gt;</code></li>
  <li>Media: <code class="inline">&lt;img&gt; &lt;a&gt; &lt;audio&gt; &lt;video&gt; &lt;iframe&gt;</code></li>
  <li>Lists: <code class="inline">&lt;ul&gt; &lt;ol&gt; &lt;dl&gt;</code> · Table: <code class="inline">&lt;table&gt; &lt;tr&gt; &lt;th&gt; &lt;td&gt;</code></li>
  <li>Forms: <code class="inline">&lt;form&gt; &lt;input&gt; &lt;label&gt; &lt;select&gt; &lt;textarea&gt; &lt;button&gt;</code></li>
  <li>Semantic: <code class="inline">&lt;header&gt; &lt;nav&gt; &lt;main&gt; &lt;section&gt; &lt;article&gt; &lt;aside&gt; &lt;footer&gt;</code></li>
</ul>
<h2>Next stop → CSS</h2>
<p>Your pages are structured — now make them <b>beautiful</b>. Open the CSS course (50 chapters!) to learn colors, flexbox, grid, animations and responsive design. 🎨⚡</p>`,
      seed: { html: '<h1>🎓 HTML — course complete!</h1>\n<p>You finished every chapter. The button below links straight to CSS.</p>\n<a class="go" href="tutorials.html?c=css">Next: CSS course →</a>',
              css: 'body{background:#0b0f1e;color:#e7ecff;padding:24px;font-family:sans-serif;text-align:center}\nh1{color:#22e8ff}\n.go{display:inline-block;margin-top:12px;background:linear-gradient(90deg,#ff5c7a,#b15cff);color:#fff;text-decoration:none;padding:14px 26px;border-radius:12px;font-weight:700}' }
    }
  ]
};
