/* GodxShadow course: Angular — start se end tak */
COURSES.angular = {
  name: "Angular", color: "#ff3355", icon: "Ng", blurb: "Google ka full framework — enterprise apps ka heavyweight.",
  lessons: [
    {
      id: "intro", title: "Angular Introduction",
      html: `
<p class="lead"><b>Angular</b> — Google ka full-featured framework (TypeScript based). React ek library hai; Angular ek complete platform hai — routing, DI, forms, HTTP sab built-in.</p>
<h2>Setup</h2>
<ul>
  <li><code class="inline">npm i -g @angular/cli</code></li>
  <li><code class="inline">ng new my-app</code> → <code class="inline">ng serve</code></li>
  <li><code class="inline">ng generate component card</code> (short: <code class="inline">ng g c card</code>)</li>
</ul>
<div class="note">Angular TypeScript <b>type-safe</b> ke liye force karta hai — TS course pehle kar lo, faayada hoga.</div>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ff3355;line-height:1.7}',
              js: 'const code = `// app.component.ts\nimport { Component } from "@angular/core";\n\n@Component({\n  selector: "app-root",\n  template: \\`<h1>Hello {{ name }}!</h1>\\`,\n  styles: [\\`h1 { color: #22e8ff; }\\`]\n})\nexport class AppComponent {\n  name = "GodxShadow";\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "components", title: "Components & Templates",
      html: `
<p class="lead">Angular app = components ka tree. Har component: <b>class + template + styles + selector</b>.</p>
<h2>Data binding ke 3 tarike</h2>
<ul>
  <li><code class="inline">{{ value }}</code> — interpolation (class → view)</li>
  <li><code class="inline">[property]="value"</code> — property binding</li>
  <li><code class="inline">(event)="handler()"</code> — event binding</li>
  <li><code class="inline">[(ngModel)]</code> — two-way</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ff3355;line-height:1.7}',
              js: 'const code = `@Component({\n  selector: "app-counter",\n  template: \\`\n    <h2>Count: {{ count }}</h2>\n    <button (click)="inc()">+</button>\n    <input [(ngModel)]="name" placeholder="Name">\n    <p>Hi {{ name }}</p>\n  \\`\n})\nexport class CounterComponent {\n  count = 0;\n  name = "";\n  inc() { this.count++; }\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "directives", title: "Directives & Pipes",
      html: `
<p class="lead"><b>Directives</b> DOM ko control karte hain; <b>pipes</b> data format karte hain — dono template mein.</p>
<h2>Structural (modern @ syntax)</h2>
<ul>
  <li><code class="inline">@if (logged) { &lt;p&gt;Hi&lt;/p&gt; }</code> (ngIf)</li>
  <li><code class="inline">@for (item of items; track item.id) { ... }</code> (ngFor)</li>
</ul>
<h2>Pipes</h2>
<p><code class="inline">{{ price | currency: 'INR' }}</code> · <code class="inline">{{ name | uppercase }}</code> · <code class="inline">{{ date | date:'short' }}</code></p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38f2a5;line-height:1.7}',
              js: 'const code = `template: \\`\n  @if (skills.length > 0) {\n    <ul>\n      @for (s of skills; track s) {\n        <li>{{ s | uppercase }}</li>\n      }\n    </ul>\n  } @else {\n    <p>Koi skill nahi</p>\n  }\n  <p>Price: {{ 499 | currency:"INR" }}</p>\n\\`\nexport class SkillsComponent {\n  skills = ["html", "css"];\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "services-di", title: "Services & Dependency Injection",
      html: `
<p class="lead">Business logic component se alag — <b>service</b> mein rakh kar <b>DI</b> se inject karo.</p>
<h2>Pattern</h2>
<ul>
  <li><code class="inline">ng g s data</code> — service banao</li>
  <li><code class="inline">@Injectable({ providedIn: "root" })</code> — singleton</li>
  <li><code class="inline">private svc = inject(DataService)</code> — inject</li>
  <li>Components print only, services fetch/store karti hain</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}',
              js: 'const code = `import { Injectable, inject } from "@angular/core";\n\n@Injectable({ providedIn: "root" })\nexport class ThemeService {\n  theme = "neon";\n  toggle() { this.theme = this.theme === "neon" ? "dark" : "neon"; }\n}\n\n// component mein\nexport class HeaderComponent {\n  private themeSvc = inject(ThemeService);\n  changeTheme() { this.themeSvc.toggle(); }\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "signals", title: "Signals (Angular 17+)",
      html: `
<p class="lead">Angular ka naya reactivity primitive — state change ko <b>fine-grained</b> track karta hai (React ka useState jaisa, par better).</p>
<h2>3 amigos</h2>
<ul>
  <li><code class="inline">const count = signal(0)</code></li>
  <li><code class="inline">count.set(5)</code> / <code class="inline">count.update(v =&gt; v+1)</code></li>
  <li><code class="inline">computed(() =&gt; count() * 2)</code> — derived</li>
  <li><code class="inline">effect(() =&gt; console.log(count()))</code> — side effect</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#22e8ff;line-height:1.7}',
              js: 'const code = `import { Component, signal, computed } from "@angular/core";\n\n@Component({\n  selector: "app-shop",\n  template: \\`\n    <h2>Items: {{ count() }}</h2>\n    <p>Double: {{ double() }}</p>\n    <button (click)="count.update(v => v + 1)">Add</button>\n  \\`\n})\nexport class ShopComponent {\n  count = signal(0);\n  double = computed(() => this.count() * 2);\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "routing-http", title: "Routing & HTTP",
      html: `
<p class="lead">Pages ke beech navigation (RouterModule) + APIs se data (HttpClient).</p>
<h2>Router</h2>
<ul>
  <li><code class="inline">{ path: 'about', component: AboutComponent }</code></li>
  <li><code class="inline">&lt;router-outlet&gt;</code> — page yahan render hota hai</li>
  <li><code class="inline">&lt;a [routerLink]="['/about']"&gt;</code> — navigate</li>
  <li>Params: <code class="inline">ActivatedRoute</code> se <code class="inline">:id</code></li>
</ul>
<h2>HttpClient</h2>
<p><code class="inline">http.get&lt;User[]&gt;(url)</code> — Observable deta hai, <code class="inline">.subscribe()</code> ya async pipe.</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ff3ea5;line-height:1.7}',
              js: 'const code = `const routes: Routes = [\n  { path: "", component: HomeComponent },\n  { path: "user/:id", component: UserComponent },\n];\n\n// service\n@Injectable({ providedIn: "root" })\nexport class ApiService {\n  private http = inject(HttpClient);\n  getUser(id: number) {\n    return this.http.get<User>(\\`https://api.x.com/users/\${id}\\`);\n  }\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "forms", title: "Forms (Reactive)",
      html: `
<p class="lead">Angular mein forms ke 2 tareeke — <b>template-driven</b> (simple) aur <b>reactive</b> (programmatic, validation rich).</p>
<h2>Reactive forms</h2>
<ul>
  <li><code class="inline">new FormControl(value, [Validators.required])</code></li>
  <li><code class="inline">new FormGroup({...})</code></li>
  <li>Template: <code class="inline">[formGroup]</code> + <code class="inline">formControlName</code></li>
  <li>Validators: required, email, minLength, custom</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#b15cff;line-height:1.7}',
              js: 'const code = `import { FormControl, FormGroup, Validators } from "@angular/forms";\n\nexport class LoginComponent {\n  form = new FormGroup({\n    email: new FormControl("", [Validators.required, Validators.email]),\n    pass:  new FormControl("", [Validators.minLength(6)]),\n  });\n\n  submit() {\n    if (this.form.valid) console.log(this.form.value);\n  }\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "wrapup", title: "Angular Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — enterprise-grade patterns ab aapke haath mein.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Components, templates, data binding</li>
  <li>Modern @if/@for control flow, pipes</li>
  <li>Services + DI, signals</li>
  <li>Routing, HTTP, reactive forms</li>
</ul>
<h2>Agla step</h2>
<p><b>Angular Material</b> se beautiful UIs, ya <b>NgRx</b> state management. Job market: Angular bahut strong hai!</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ff3355;line-height:1.7}',
              js: 'const code = `console.log("Angular complete ✔");`;\ndocument.getElementById("out").innerHTML = code;\nconsole.log("Angular course complete ✔");' }
    }
  ]
};
