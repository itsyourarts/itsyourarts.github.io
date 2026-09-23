/* GodxShadow course: TypeScript — start se end tak */
COURSES.typescript = {
  name: "TypeScript", color: "#3f9dff", icon: "TS", blurb: "JavaScript + types — bade projects mein bugs pehle hi rok lo.",
  lessons: [
    {
      id: "intro", title: "TypeScript Introduction",
      html: `
<p class="lead"><b>TypeScript = JavaScript + type safety.</b> Code likhte waqt hi bugs pakda leti hai, editor ko intelligent autocomplete milta hai, aur compile karke plain JS ban jaata hai.</p>
<h2>Pehla program</h2>
<h2>Setup</h2>
<ul>
  <li><code class="inline">npm install -g typescript</code></li>
  <li><code class="inline">tsc app.ts</code> → <code class="inline">app.js</code> banta hai</li>
  <li>Browser/folder mein <code class="inline">.ts</code> directly nahi chalta — compile karta hai</li>
</ul>`,
      seed: { code: 'let name: string = "Shadow";\nlet score: number = 99;\nlet neon: boolean = true;\n\nconsole.log(name, score, neon);\n\nfunction double(n: number): number {\n    return n * 2;\n}', lang: "ts" }
    },
    {
      id: "basic-types", title: "Basic Types & Arrays",
      html: `
<p class="lead">TS types explicitly likhte ho ya compiler khud samajhta hai (inference).</p>
<h2>Types</h2>
<ul>
  <li><code class="inline">string, number, boolean, null, undefined</code></li>
  <li><code class="inline">any</code> — kuch bhi (avoid!), <code class="inline">unknown</code> — safe any</li>
  <li>Arrays: <code class="inline">number[]</code> ya <code class="inline">Array&lt;number&gt;</code></li>
  <li>Tuple: <code class="inline">[string, number]</code> — fixed structure</li>
  <li>Union: <code class="inline">string | number</code></li>
</ul>`,
      seed: { code: 'let skills: string[] = ["HTML", "CSS", "TS"];\nlet point: [string, number] = ["x", 10];\nlet id: string | number = 42;\n\nskills.push("React");\nconsole.log(skills, point);\n\n// Type inference v same:\nlet city = "Delhi";  // string inferred', lang: "ts" }
    },
    {
      id: "functions", title: "Functions & Optional Params",
      html: `
<p class="lead">Functions par types — params aur return value dono.</p>
<h2>Features</h2>
<ul>
  <li>Optional: <code class="inline">greet(n?: string)</code></li>
  <li>Default: <code class="inline">greet(n: string = "Guest")</code></li>
  <li>Arrow: <code class="inline">const sq = (n: number): number =&gt; n * n;</code></li>
  <li>Function type: <code class="inline">let op: (a: number, b: number) =&gt; number;</code></li>
  <li><code class="inline">void</code> — no return · <code class="inline">never</code> — kabhi return nahi karti</li>
</ul>`,
      seed: { code: 'function greet(name: string = "Guest"): string {\n    return `Hello, ${name}!`;\n}\n\nfunction introduce(name: string, level?: number): string {\n    return level ? `${name} L${level}` : name;\n}\n\nconst add: (a: number, b: number) => number = (a, b) => a + b;', lang: "ts" }
    },
    {
      id: "interfaces", title: "Interfaces & Custom Types",
      html: `
<p class="lead">TS ka asli power — apne shapes define karo.</p>
<h2>Interface vs Type alias</h2>
<ul>
  <li><code class="inline">interface User { name: string; age: number; }</code></li>
  <li><code class="inline">type Point = { x: number; y: number };</code></li>
  <li>Optional prop: <code class="inline">age?: number</code></li>
  <li>Readonly: <code class="inline">readonly id: number</code></li>
  <li>Interface extend: <code class="inline">interface Admin extends User</code></li>
</ul>`,
      seed: { code: 'interface User {\n    readonly id: number;\n    name: string;\n    email?: string;\n}\n\nfunction printUser(u: User): void {\n    console.log(u.id, u.name);\n}\n\ntype Status = "active" | "banned";', lang: "ts" }
    },
    {
      id: "classes", title: "Classes & Access Modifiers",
      html: `
<p class="lead">TS classes mein visibility control — <code class="inline">public/private/protected</code>.</p>
<h2>Features</h2>
<ul>
  <li><code class="inline">private name: string;</code> — sirf class andar</li>
  <li>Shorthand: <code class="inline">constructor(private name: string) {}</code></li>
  <li>Interfaces implement: <code class="inline">class X implements Y</code></li>
  <li>Abstract classes, <code class="inline">override</code> keyword</li>
</ul>`,
      seed: { code: 'class Player {\n    constructor(\n        public name: string,\n        private power: number\n    ) {}\n\n    intro(): string {\n        return `${this.name} ⚡ ${this.power}`;\n    }\n}\n\nconst p = new Player("Shadow", 9000);\nconsole.log(p.intro());', lang: "ts" }
    },
    {
      id: "generics", title: "Generics & Enums",
      html: `
<p class="lead">Reusable functions/classes jo type ke saath kaam karein — <b>generics</b>.</p>
<h2>Generic function</h2>
<p><code class="inline">function first&lt;T&gt;(arr: T[]): T { return arr[0]; }</code></p>
<h2>Enum</h2>
<p><code class="inline">enum Level { Beginner, Pro, Neon }</code> — named constants.</p>
<h2>Utility types</h2>
<p><code class="inline">Partial&lt;User&gt;</code> · <code class="inline">Required&lt;T&gt;</code> · <code class="inline">Pick&lt;User,"name"&gt;</code> · <code class="inline">Record&lt;string,number&gt;</code></p>`,
      seed: { code: 'function first<T>(arr: T[]): T {\n    return arr[0];\n}\n\nenum Level { Beginner, Pro, Neon }\n\ninterface ApiRes<T> {\n    ok: boolean;\n    data: T;\n}\n\nconst nums = first([1, 2, 3]);       // 1\nconst name = first(["a", "b"]);      // "a"', lang: "ts" }
    },
    {
      id: "config-modules", title: "tsconfig & Modules",
      html: `
<p class="lead">Bade project mein <code class="inline">tsconfig.json</code> build behaviour control karta hai.</p>
<h2>Common options</h2>
<ul>
  <li><code class="inline">"strict": true</code> — sab safety on (zaroori!)</li>
  <li><code class="inline">"target": "ES2020"</code> — output JS version</li>
  <li><code class="inline">"outDir": "./dist"</code></li>
  <li><code class="inline">"module": "CommonJS"</code> ya <code class="inline">"ESNext"</code></li>
</ul>
<h2>Modules</h2>
<p><code class="inline">export default / export const</code> · <code class="inline">import { x } from "./file"</code></p>`,
      seed: { code: '// tsconfig.json\n{\n    "compilerOptions": {\n        "strict": true,\n        "target": "ES2020",\n        "module": "ESNext",\n        "outDir": "./dist",\n        "skipLibCheck": true\n    }\n}', lang: "ts" }
    },
    {
      id: "unions-literals", title: "Union & Literal Types",
      html: `
<p class="lead">"ya to ye, ya wo" — TS ka sabse handy feature.</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">string | number</code> — union</li>
  <li><code class="inline">type Dir = "up" | "down" | "left"</code> — literal union</li>
  <li>Typos compile-time pakde jaate hain!</li>
  <li><code class="inline">as const</code> — values ko literal freeze</li>
</ul>`,
      seed: { code: 'type Id = number | string;\ntype Status = "loading" | "success" | "error";\n\nlet id: Id = 42;\nid = "abc-123";            // OK dono\n\nlet state: Status = "loading";\n// state = "done";         // ERROR — literal union ke bahar!\n\nfunction setDir(d: "up" | "down") { console.log(d); }\nsetDir("up");\n\nconst COLORS = ["red", "cyan", "hotpink"] as const;\ntype Color = typeof COLORS[number];\n\nconsole.log(id, state, COLORS.join("/"));', lang: "ts" }
    },
    {
      id: "narrowing", title: "Type Narrowing & Guards",
      html: `
<p class="lead">Union ko safely specific type tak pahunchao — checks ke saath.</p>
<h2>Guards</h2>
<ul>
  <li><code class="inline">typeof x === "string"</code> — primitive guard</li>
  <li><code class="inline">Array.isArray(x)</code> · <code class="inline">x instanceof Date</code></li>
  <li><code class="inline">"name" in obj</code> — property guard</li>
  <li>Discriminated union: common <code class="inline">kind:</code> literal field</li>
</ul>`,
      seed: { code: 'function show(v: string | number[]) {\n    if (typeof v === "string") {\n        console.log(v.toUpperCase());   // v: string yahan\n    } else {\n        console.log(v.map(n => n * 2)); // v: number[] yahan\n    }\n}\n\ntype Circle = { kind: "circle"; r: number };\ntype Box = { kind: "box"; w: number; h: number };\nfunction area(s: Circle | Box) {\n    switch (s.kind) {\n        case "circle": return 3.14 * s.r * s.r;\n        case "box":    return s.w * s.h;\n    }\n}\n\nconsole.log(area({ kind: "circle", r: 2 }));   // 12.56\nconsole.log(area({ kind: "box", w: 3, h: 4 })); // 12', lang: "ts" }
    },
    {
      id: "enums", title: "Enums & const Objects",
      html: `
<p class="lead">Named constant groups — switch/flags ke liye.</p>
<h2>Options</h2>
<ul>
  <li><code class="inline">enum Dir { Up, Down }</code> — numeric (auto 0,1...)</li>
  <li>String enum: <code class="inline">enum Color { Cyan = "#22e8ff" }</code></li>
  <li>Modern preference: <code class="inline">const obj = {} as const</code> + union type</li>
  <li><code class="inline">const enum</code> — compile-time inline (bundle chhota)</li>
</ul>`,
      seed: { code: 'enum Level { Easy, Normal, Hard }\nenum Neon { Cyan = "#22e8ff", Pink = "#ff3ea5" }\n\nlet my: Level = Level.Hard;\nconsole.log(my);              // 2\nconsole.log(Level[my]);       // "Hard" (reverse map)\nconsole.log(Neon.Cyan);       // #22e8ff\n\n// as-const alternative (modern style)\nconst Role = { Admin: "ADMIN", User: "USER" } as const;\ntype Role = typeof Role[keyof typeof Role];\nlet r: Role = Role.Admin;\nconsole.log(r);', lang: "ts" }
    },
    {
      id: "utility-types", title: "Utility Types (Partial, Pick, Record...)",
      html: `
<p class="lead">Built-in type transformers — APIs aur forms mein roz kaam aate hain.</p>
<h2>Top 6</h2>
<ul>
  <li><code class="inline">Partial&lt;T&gt;</code> — sab optional · <code class="inline">Required&lt;T&gt;</code> — sab must</li>
  <li><code class="inline">Pick&lt;T, "a"|"b"&gt;</code> — subset · <code class="inline">Omit&lt;T, "x"&gt;</code> — minus keys</li>
  <li><code class="inline">Record&lt;string, T&gt;</code> — dict type</li>
  <li><code class="inline">Readonly&lt;T&gt;</code>, <code class="inline">ReturnType&lt;Fn&gt;</code></li>
</ul>`,
      seed: { code: 'interface User { id: number; name: string; email: string; age: number; }\n\nfunction update(u: User, patch: Partial<User>) {\n    return { ...u, ...patch };\n}\n\ntype PublicUser = Omit<User, "email">;      // email chipao\ntype Preview = Pick<User, "id" | "name">;   // sirf 2 fields\n\nconst dict: Record<string, number> = { a: 1, b: 2 };\n\nconst u: User = { id: 1, name: "Ravi", email: "r@x.in", age: 21 };\nconsole.log(update(u, { age: 22 }));        // sirf age update\nconsole.log(Object.keys(dict));', lang: "ts" }
    },
    {
      id: "type-guards", title: "Type Guards - Narrowing Runtime",
      html: `<p class="lead">Type guards let TypeScript check a type AT RUNTIME and narrow inside the branch - safer code with plain ifs.</p>
<h2>Tools</h2>
<ul>
  <li><code class="inline">typeof x === "string"</code> - primitive narrowing</li>
  <li><code class="inline">x is T</code> - custom type predicate function</li>
  <li><code class="inline">in</code> operator: <code class="inline">"error" in result</code></li>
  <li><code class="inline">instanceof</code> - class checks - <code class="inline">!x</code> truthy narrowing</li>
</ul>`,
      seed: { code: 'type User = { name: string; age: number };\ntype Admin = User & { role: "admin" };\nfunction isAdmin(u: User | Admin): u is Admin {\n    return (u as Admin).role === "admin";\n}\nfunction greet(u: User | string) {\n    if (typeof u === "string") {\n        console.log("hi anon:", u);\n        return;\n    }\n    console.log("hi", u.name);\n}\nconst a: Admin = { name: "R", age: 30, role: "admin" };\nif (isAdmin(a)) { console.log("admin!", a.role); }\ngreet("guest"); greet({ name: "A", age: 1 });', lang: "ts" }
    },
    {
      id: "decorators", title: "Decorators - Metaprogramming Tags",
      html: `<p class="lead">Decorators attach behavior or metadata to classes, methods, and properties - used by frameworks (Angular, DI containers).</p>
<h2>Basics</h2>
<ul>
  <li>Legacy form: <code class="inline">@sealed class</code> style with <code class="inline">experimentalDecorators</code></li>
  <li>Standard decorators are functions: <code class="inline">(value, ctx) =&gt; ...</code></li>
  <li>Common jobs: logging, validation, DI metadata, route registration</li>
  <li>Chainable: stack multiple decorators top-to-bottom</li>
</ul>`,
      seed: { code: 'function log(target: any, key: string, fn: Function) {\n    return function (...args: any[]) {\n        console.log("call:", key);\n        return fn.apply(this, args);\n    };\n}\nclass Api {\n    // @log\n    fetch(url: string) { return "data from " + url; }\n}\nconst api = new Api();\nconst logged = log(api, "fetch", api.fetch);\nconsole.log(logged("/users"));', lang: "ts" }
    },
    {
      id: "async-deep", title: "Async / Await Patterns",
      html: `<p class="lead">TypeScript types Promises end to end - <code class="inline">Promise&lt;T&gt;</code>, async functions, and error handling that scales.</p>
<h2>Patterns</h2>
<ul>
  <li><code class="inline">async function f(): Promise&lt;number&gt;</code> - typed results</li>
  <li><code class="inline">await</code> inside async only; parallel with <code class="inline">Promise.all</code></li>
  <li>Typed errors: <code class="inline">throw new Error(…)</code> + try/catch</li>
  <li>Abort: <code class="inline">AbortController</code> for cancelable fetch</li>
</ul>`,
      seed: { code: 'async function fetchScore(name: string): Promise<number> {\n    await new Promise(r => setTimeout(r, 100));\n    return name.length * 10;\n}\nasync function main() {\n    const scores = await Promise.all(["A", "BB", "CCC"].map(fetchScore));\n    console.log("scores:", scores);\n    try {\n        await Promise.reject(new Error("boom"));\n    } catch (e) {\n        console.log("caught:", (e as Error).message);\n    }\n}\nmain();', lang: "ts" }
    },
    {
      id: "classes-deep", title: "Classes Deep: Access, Modifiers, #privates",
      html: `<p class="lead">Beyond basics: access modifiers, static members, getters, and true ES private fields with <code class="inline">#</code>.</p>
<h2>Features</h2>
<ul>
  <li><code class="inline">public / protected / private</code> - compile-time access control</li>
  <li><code class="inline">#count</code> - truly private (runtime enforced)</li>
  <li><code class="inline">static</code> members - <code class="inline">get name()</code> computed properties</li>
  <li><code class="inline">readonly</code> - set once in constructor</li>
</ul>`,
      seed: { code: 'class BankAccount {\n    #balance = 0;\n    readonly owner: string;\n    constructor(owner: string, deposit: number) {\n        this.owner = owner;\n        this.#balance = deposit;\n    }\n    get balance(): number { return this.#balance; }\n    deposit(n: number) { this.#balance += n; }\n    static create(o: string): BankAccount { return new BankAccount(o, 0); }\n}\nconst acc = BankAccount.create("Ravi");\nacc.deposit(500);\nconsole.log(acc.owner, acc.balance);\n// acc.#balance  // compile error: private', lang: "ts" }
    },
    {
      id: "patterns", title: "Common TypeScript Patterns",
      html: `<p class="lead">Idioms professional TS code uses daily: discriminated unions, exhaustive checks, factories, branded types.</p>
<h2>Idioms</h2>
<ul>
  <li>Discriminated union: <code class="inline">{ kind: "ok", data } | { kind: "err", msg }</code></li>
  <li><code class="inline">never</code> + <code class="inline">assertNever</code> for exhaustive switch</li>
  <li>Branded types: <code class="inline">type UserId = string &amp; { __id: never }</code></li>
  <li>Const assertions: <code class="inline">as const</code> - literal precision</li>
</ul>`,
      seed: { code: 'type Result<T> = { kind: "ok"; data: T } | { kind: "err"; msg: string };\nfunction assertNever(x: never): never {\n    throw new Error("unhandled: " + JSON.stringify(x));\n}\nfunction handle(r: Result<number>) {\n    switch (r.kind) {\n        case "ok": return r.data * 2;\n        case "err": return -1;\n        default: return assertNever(r);\n    }\n}\nconst roles = ["admin", "user"] as const;\ntype Role = typeof roles[number];\nconst role: Role = "admin";\nconsole.log(handle({ kind: "ok", data: 21 }));\nconsole.log(role);', lang: "ts" }
    },
    {
      id: "advanced-utility", title: "Utility Types Masterclass",
      html: `<p class="lead">The built-in utility types plus writing your own - the difference between TS novices and pros.</p>
<h2>Build your own</h2>
<ul>
  <li><code class="inline">Partial, Required, Pick, Omit, Record, Readonly, ReturnType, Parameters</code></li>
  <li>Custom: <code class="inline">type DeepReadonly&lt;T&gt; = { readonly [K in keyof T]: DeepReadonly&lt;T[K]&gt; }</code></li>
  <li>Conditional mapping: <code class="inline">[K in keyof T]?: …</code></li>
  <li>Template literal types: <code class="inline">type Event = "on" + (Name extends string ? Name : never)</code></li>
</ul>`,
      seed: { code: 'type Config = { host: string; port: number; debug: boolean };\ntype PartialConfig = Partial<Config>;\ntype NoPort = Omit<Config, "port">;\ntype EventName = "start" | "stop";\ntype HandlerMap = Record<`on${Capitalize<EventName>}`, () => void>;\nfunction assertType<T extends 1>(): void {}\ntype Deep<T> = { [K in keyof T]: T[K] };\nconst h: HandlerMap = {\n    onStart: () => console.log("started"),\n    onStop: () => console.log("stopped"),\n};\nassertType<1>();\nh.onStart();', lang: "ts" }
    },
    {
      id: "wrapup", title: "TypeScript Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — ab JS code type-safe likh sakte ho.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Basic types, arrays, tuples, unions</li>
  <li>Functions, interfaces, classes</li>
  <li>Generics, enums, utility types</li>
  <li>tsconfig + modules</li>
</ul>
<h2>Agla step</h2>
<p><b>React</b> ke saath TS — professional frontend ka standard. Ya <b>Node.js</b> project mein <code class="inline">ts-node</code>.</p>`,
      seed: { code: 'const done: string[] = ["types", "interfaces", "classes", "generics"];\nconsole.log("TypeScript complete ✔", done.length);', lang: "ts" }
    }
  ]
};
