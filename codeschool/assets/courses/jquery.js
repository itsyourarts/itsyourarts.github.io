/* GodxShadow course: jQuery — start se end tak */
COURSES.jquery = {
  name: "jQuery", color: "#ffd479", icon: "jQ", blurb: "Classic library — DOM kaam karna aasaan. Legacy projects mein zaroori.",
  lessons: [
    {
      id: "intro", title: "jQuery Introduction",
      html: `
<p class="lead"><b>jQuery</b> ek JavaScript library hai — "write less, do more". 2006 se DOM tasks ko super-simple banati hai. Aaj bhi croreṡ sites (WordPress, legacy apps) is par chalti hain.</p>
<h2>CDN se jodo</h2>
<h2>Concept</h2>
<ul>
  <li><code class="inline">$(selector)</code> — element pakdo</li>
  <li><code class="inline">$(document).ready()</code> — DOM ready hone par chalao (modern: <code class="inline">$(() =&gt; {...})</code>)</li>
  <li>Chaining: <code class="inline">$("p").addClass("x").fadeIn()</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffd479;line-height:1.7}',
              js: 'const code = `&lt;script src="https://code.jquery.com/jquery-3.7.1.min.js"&gt;&lt;/script&gt;\n\n&lt;script&gt;\n$(function () {\n    $("h1").css("color", "#22e8ff").text("Neon jQuery!");\n});\n&lt;/script&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "selectors", title: "Selectors & DOM",
      html: `
<p class="lead">jQuery selectors CSS selectors raaste jaate hain — same syntax, extra powers.</p>
<h2>Select karo</h2>
<ul>
  <li><code class="inline">$("#id")</code> · <code class="inline">$(".class")</code> · <code class="inline">$("p")</code></li>
  <li><code class="inline">$("ul li:first")</code>, <code class="inline">$("[type='text']")</code></li>
</ul>
<h2>DOM change karo</h2>
<p><code class="inline">.text() .html() .val() .attr("href","#") .addClass() .removeClass() .toggleClass() .append() .remove()</code></p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffd479;line-height:1.7}',
              js: 'const code = `$(function () {\n    $("ul li:first").addClass("active");\n    $(".card").append("<span>new!</span>");\n    $("input").val("neon");\n    $("#title").toggleClass("glow");\n});`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "events", title: "Events",
      html: `
<p class="lead">User actions par react karo — sabse zyada use hone wala feature.</p>
<h2>Events</h2>
<ul>
  <li><code class="inline">$("#btn").on("click", handler)</code></li>
  <li><code class="inline">$("input").on("input", handler)</code></li>
  <li>Delegation: <code class="inline">$("ul").on("click", "li", handler)</code> — future items par bhi chalega!</li>
  <li><code class="inline">e.preventDefault()</code> · <code class="inline">$(this)</code> — current element</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38f2a5;line-height:1.7}',
              js: 'const code = `$(function () {\n    $("#add").on("click", function () {\n        $("ul").append("<li>item</li>");\n    });\n\n    // delegation — baad mein add huye items pe bhi kaam karega\n    $("ul").on("click", "li", function () {\n        $(this).toggleClass("done");\n    });\n});`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "effects", title: "Effects & Animations",
      html: `
<p class="lead">Built-in smooth animations — ek line mein.</p>
<h2>Methods</h2>
<ul>
  <li><code class="inline">.show() / .hide() / .toggle()</code></li>
  <li><code class="inline">.fadeIn() / .fadeOut() / .fadeToggle()</code></li>
  <li><code class="inline">.slideDown() / .slideUp() / .slideToggle()</code></li>
  <li><code class="inline">.animate({opacity: .5, left: "100px"}, 400)</code> — custom</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ff3ea5;line-height:1.7}',
              js: 'const code = `$(function () {\n    $("#toggle").on("click", () => $(".panel").slideToggle(400));\n    $("#fade").on("dblclick", function () {\n        $(this).animate({ opacity: 0.3, width: "+=40px" }, 600)\n               .animate({ opacity: 1, width: "-=40px" }, 600);\n    });\n});`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "ajax", title: "AJAX & JSON",
      html: `
<p class="lead">Page reload ke bina server se data — <b>$.ajax</b> isi ke liye famous tha.</p>
<h2>Shortcuts</h2>
<ul>
  <li><code class="inline">$.get(url, cb)</code> · <code class="inline">$.post(url, data, cb)</code></li>
  <li><code class="inline">$.getJSON(url, cb)</code></li>
  <li>Full control: <code class="inline">$.ajax({url, method, dataType})</code></li>
</ul>
<div class="note">Modern code <code class="inline">fetch()</code> use karta hai, but existing jQuery projects mein ye patterns dikhenge.</div>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#22e8ff;line-height:1.7}',
              js: 'const code = `$(function () {\n    $("#load").on("click", function () {\n        $("#out").text("Loading...");\n        $.getJSON("https://jsonplaceholder.typicode.com/users/1", user => {\n            $("#out").text(user.name + " — " + user.email);\n        });\n    });\n});`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "plugins", title: "Plugins & Ecosystem",
      html: `
<p class="lead">jQuery plugins se sliders, datatables, datepickers — hazaron ready solutions.</p>
<h2>Popular plugins</h2>
<ul>
  <li><b>Slick</b> — carousels · <b>DataTables</b> — powerful tables</li>
  <li><b>Select2</b> — searchable dropdowns · <b>Lightbox2</b> — galleries</li>
</ul>
<h2>Kab kab nahi?</h2>
<p>Modern projects mein vanilla JS ya React better choice hai — jQuery legacy apps aur quick WordPress custom scripts ke liye.</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}',
              js: 'const code = `&lt;!-- plugin jQuery ke BAAD load karna --&gt;\n&lt;script src="jquery.min.js"&gt;&lt;/script&gt;\n&lt;script src="slick.min.js"&gt;&lt;/script&gt;\n\n&lt;script&gt;\n$(function () {\n    $(".slider").slick({ dots: true, autoplay: true });\n});\n&lt;/script&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "traversing", title: "DOM Traversing",
      html: `
<p class="lead">Elements ke beech chalna — parent/children/siblings find karna.</p>
<h2>Walk the tree</h2>
<ul>
  <li><code class="inline">$(el).parent()</code>, <code class="inline">.parents(".wrap")</code>, <code class="inline">.closest(".card")</code></li>
  <li><code class="inline">.children()</code>, <code class="inline">.find("p")</code></li>
  <li><code class="inline">.siblings()</code>, <code class="inline">.next()</code>, <code class="inline">.prev()</code></li>
  <li><code class="inline">.first()</code>, <code class="inline">.last()</code>, <code class="inline">.eq(2)</code>, <code class="inline">.filter(), .not()</code></li>
  <li><code class="inline">.each(function(i, el){...})</code> — loop</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffd479;line-height:1.7}',
              js: 'const code = `$(function () {\n    $("li").each(function (i) {\n        $(this).text(i + 1 + ". " + $(this).text());\n    });\n    $(".active").siblings().css("opacity", .5).end()\n               .closest("ul").addClass("neon-border");\n});`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "wrapup", title: "jQuery Summary & Vanilla Comparison",
      html: `
<p class="lead">Chapter end — ab legacy code samajh aayega.</p>
<h2>jQuery ↔ Vanilla JS</h2>
<ul>
  <li><code class="inline">$("#x")</code> → <code class="inline">document.querySelector("#x")</code></li>
  <li><code class="inline">.on("click", fn)</code> → <code class="inline">addEventListener("click", fn)</code></li>
  <li><code class="inline">.addClass()</code> → <code class="inline">classList.add()</code></li>
  <li><code class="inline">$.getJSON()</code> → <code class="inline">fetch().then(r =&gt; r.json())</code></li>
</ul>
<h2>Agla step</h2>
<p>Modern frontend: <b>React</b>. Quick legacy fixes: jQuery+Plugins ka combo.</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffd479;line-height:1.7}',
              js: 'const code = `console.log("jQuery complete ✔ — ab vanilla JS king bano");`;\ndocument.getElementById("out").innerHTML = code;\nconsole.log("jQuery course complete ✔");' }
    }
  ]
};
