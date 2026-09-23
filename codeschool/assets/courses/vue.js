/* GodxShadow course: Vue — start se end tak */
COURSES.vue = {
  name: "Vue", color: "#42d392", icon: "Vu", blurb: "Progressive framework — simple start, powerful finish. Sikhne ka sabse easy framework.",
  lessons: [
    {
      id: "intro", title: "Vue Introduction",
      html: `
<p class="lead"><b>Vue.js</b> — progressive framework: ek page ke ek hisse se start karo, full app tak grow karo. React+Angular ke beech — simple syntax, powerful features.</p>
<h2>Setup</h2>
<ul>
  <li>Quick: CDN script tag</li>
  <li>Real: <code class="inline">npm create vite@latest app -- --template vue</code></li>
</ul>
<h2>Composition vs Options API</h2>
<p>Modern Vue = <b>Composition API</b> (<code class="inline">&lt;script setup&gt;</code>) — purana Options API legacy code mein milta hai.</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#42d392;line-height:1.7}',
              js: 'const code = `&lt;!-- &lt;script setup&gt; composition API --&gt;\n&lt;script setup&gt;\nimport { ref } from "vue";\nconst msg = ref("Hello Vue!");\n&lt;/script&gt;\n\n&lt;template&gt;\n  &lt;h1&gt;{{ msg }}&lt;/h1&gt;\n&lt;/template&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "reactivity", title: "ref, reactive & computed",
      html: `
<p class="lead">Vue ki reactivity automatic — variable badlo, template khud update.</p>
<h2>Primitives</h2>
<ul>
  <li><code class="inline">ref(0)</code> — single value (template mein seedha, script mein .value)</li>
  <li><code class="inline">reactive({...})</code> — object ke liye</li>
  <li><code class="inline">computed(() =&gt; ...)</code> — derived, cached</li>
  <li><code class="inline">watch(x, fn)</code> — side effects on change</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#42d392;line-height:1.7}',
              js: 'const code = `&lt;script setup&gt;\nimport { ref, computed } from "vue";\nconst count = ref(0);\nconst double = computed(() => count.value * 2);\n&lt;/script&gt;\n\n&lt;template&gt;\n  &lt;button @click="count++"&gt;{{ count }} (2x = {{ double }})&lt;/button&gt;\n&lt;/template&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "directives", title: "Template Directives",
      html: `
<p class="lead">Vue templates mein special attributes — HTML huge power ke saath.</p>
<h2>Roz ke directives</h2>
<ul>
  <li><code class="inline">v-if / v-else</code> · list: <code class="inline">v-for="x in items" :key="x.id"</code></li>
  <li><code class="inline">v-model</code> — two-way binding (input ↔ data)</li>
  <li><code class="inline">v-bind:</code> shortcut <code class="inline">:</code> · <code class="inline">v-on:</code> shortcut <code class="inline">@</code></li>
  <li><code class="inline">v-show</code> (display toggle) vs <code class="inline">v-if</code> (remove)</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38f2a5;line-height:1.7}',
              js: 'const code = `&lt;template&gt;\n  &lt;input v-model="newTodo" placeholder="Task..."&gt;\n  &lt;button @click="todos.push(newTodo); newTodo=\'\'"&gt;Add&lt;/button&gt;\n  &lt;ul&gt;\n    &lt;li v-for="(t, i) in todos" :key="i"&gt;{{ t }}&lt;/li&gt;\n  &lt;/ul&gt;\n  &lt;p v-if="todos.length === 0"&gt;Koi task nahi&lt;/p&gt;\n&lt;/template&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "components", title: "Components, Props & Slots",
      html: `
<p class="lead">Vue component = <b>SFC (Single File Component)</b>: template + script + style ek <code class="inline">.vue</code> file mein.</p>
<h2>Communication</h2>
<ul>
  <li>Parent → child: <code class="inline">defineProps(['title'])</code></li>
  <li>Child → parent: <code class="inline">defineEmits(['save'])</code> → <code class="inline">emit('save', data)</code></li>
  <li>Content inject: <code class="inline">&lt;slot /&gt;</code> + named slots</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}',
              js: 'const code = `&lt;!-- Card.vue --&gt;\n&lt;script setup&gt;\ndefineProps({ title: String });\ndefineEmits(["done"]);\n&lt;/script&gt;\n\n&lt;template&gt;\n  &lt;div class="card"&gt;\n    &lt;h3&gt;{{ title }}&lt;/h3&gt;\n    &lt;slot&gt;Default content&lt;/slot&gt;\n    &lt;button @click="$emit(\'done\')"&gt;OK&lt;/button&gt;\n  &lt;/div&gt;\n&lt;/template&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "lifecycle-composables", title: "Lifecycle & Composables",
      html: `
<p class="lead">Component ki lifecycle hooks + reusable logic = <b>composable functions</b>.</p>
<h2>Lifecycle</h2>
<ul>
  <li><code class="inline">onMounted(() =&gt; ...)</code> — DOM ready</li>
  <li><code class="inline">onUnmounted</code>, <code class="inline">onUpdated</code></li>
</ul>
<h2>Composables</h2>
<p><code class="inline">useXxx()</code> naam convention — reuse stateful logic across components (React hooks ka Vue version).</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#22e8ff;line-height:1.7}',
              js: 'const code = `// useMouse.js — reusable composable\nimport { ref, onMounted, onUnmounted } from "vue";\n\nexport function useMouse() {\n  const x = ref(0), y = ref(0);\n  const update = e => { x.value = e.clientX; y.value = e.clientY; };\n  onMounted(() => window.addEventListener("mousemove", update));\n  onUnmounted(() => window.removeEventListener("mousemove", update));\n  return { x, y };\n}`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "eco", title: "Router, Pinia & Ecosystem",
      html: `
<p class="lead">Vue official ecosystem — <b>Vue Router</b> (pages) + <b>Pinia</b> (state management).</p>
<h2>Router</h2>
<p><code class="inline">createWebHistory()</code> + <code class="inline">{ path: '/about', component: About }</code></p>
<h2>Pinia store</h2>
<p><code class="inline">defineStore('cart', () =&gt; { const items = ref([]); return { items }; })</code> — kahin bhi <code class="inline">useCartStore()</code>!</p>
<h2>Nuxt 3</h2>
<p>Full-stack Vue framework — SSR, file-based routing, api routes.</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ff3ea5;line-height:1.7}',
              js: 'const code = `import { defineStore } from "pinia";\n\nexport const useCart = defineStore("cart", () => {\n  const items = ref([]);\n  const total = computed(() =>\n    items.value.reduce((a, i) => a + i.price, 0)\n  );\n  const add = (item) => items.value.push(item);\n  return { items, total, add };\n});`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "forms", title: "Forms & v-model Deep",
      html: `
<p class="lead"><code class="inline">v-model</code> = input ka data se sync. But modifiers aur multiple inputs ko samajhna must.</p>
<h2>Inputs</h2>
<ul>
  <li>Text: <code class="inline">&lt;input v-model="name"&gt;</code></li>
  <li>Modifiers: <code class="inline">.trim</code> · <code class="inline">.lazy</code> (blur par) · <code class="inline">.number</code></li>
  <li>Checkbox: <code class="inline">v-model="agree"</code> (boolean)</li>
  <li>Checkbox array: <code class="inline">v-model="picked"</code> value ke saath tick values</li>
  <li>Submit: <code class="inline">@submit.prevent="save"</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#42d392;line-height:1.7}',
              js: 'const code = `&lt;script setup&gt;\nimport { ref, computed } from "vue";\nconst name = ref("");\nconst agree = ref(false);\nconst picked = ref([]);\nconst canSubmit = computed(() => name.value.length > 2 && agree.value);\n&lt;/script&gt;\n\n&lt;template&gt;\n  &lt;form @submit.prevent="console.log({name, picked})"&gt;\n    &lt;input v-model.trim="name" placeholder="Naam"&gt;\n    &lt;label&gt;&lt;input type="checkbox" value="html" v-model="picked"&gt; HTML&lt;/label&gt;\n    &lt;label&gt;&lt;input type="checkbox" v-model="agree"&gt; Agree&lt;/label&gt;\n    &lt;button :disabled="!canSubmit"&gt;Save&lt;/button&gt;\n  &lt;/form&gt;\n&lt;/template&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "wrapup", title: "Vue Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — Vue ka simple-par-powerful model ab aapko aata hai.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>ref/reactive/computed reactivity</li>
  <li>Directives (v-if/v-for/v-model/@click)</li>
  <li>SFC components, props, emits, slots</li>
  <li>Lifecycle, composables, Router + Pinia</li>
</ul>
<h2>Agla step</h2>
<p><b>Nuxt 3</b> — full-stack Vue. Ya <b>Quasar</b> se cross-platform apps.</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#42d392;line-height:1.7}',
              js: 'const code = `console.log("Vue complete ✔");`;\ndocument.getElementById("out").innerHTML = code;\nconsole.log("Vue course complete ✔");' }
    }
  ]
};
