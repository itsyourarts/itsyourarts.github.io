/* GodxShadow course: Rust — start se end tak */
COURSES.rust = {
  name: "Rust", color: "#ff8a5c", icon: "Rs", blurb: "Memory safety bina garbage collector — systems ka future.",
  lessons: [
    {
      id: "intro", title: "Rust Introduction",
      html: `
<p class="lead"><b>Rust</b> — 8 years se StackOverflow ki "most loved" language. C-level speed + memory safety + concurrency safety, bina GC. Firefox, Figma, Cloudflare use karte hain.</p>
<h2>Pehla program</h2>
<h2>Setup</h2>
<ul>
  <li><code class="inline">rustup</code> se install → <code class="inline">rustc --version</code></li>
  <li><code class="inline">cargo new app</code> → <code class="inline">cargo run</code></li>
  <li>Variables default <b>immutable</b> — <code class="inline">mut</code> likhna padta hai change ke liye</li>
</ul>`,
      seed: { code: 'fn main() {\n    let name = "Shadow";\n    let mut level = 99;   // mut = mutable\n    level += 1;\n    println!("Hello {}, L{}", name, level);\n}', lang: "rust" }
    },
    {
      id: "control", title: "Types & Control Flow",
      html: `
<p class="lead">Rust statically typed hai, but type inference strong hai.</p>
<h2>Basics</h2>
<ul>
  <li><code class="inline">i32, u64, f64, bool, char, &amp;str, String, tuples</code></li>
  <li><code class="inline">if</code> ek <b>expression</b> hai: <code class="inline">let x = if n &gt; 5 { 1 } else { 0 };</code></li>
  <li><code class="inline">loop</code> (infinite), <code class="inline">while</code>, <code class="inline">for x in 0..10</code></li>
  <li><code class="inline">match</code> — switch on steroids (exhaustive check!)</li>
</ul>`,
      seed: { code: 'fn main() {\n    let n = 7;\n    let tag = if n % 2 == 0 { "even" } else { "odd" };\n\n    let msg = match n {\n        1 => "one",\n        2..=5 => "small",\n        _ => "big",\n    };\n    println!("{} {}", tag, msg);\n\n    for i in (1..=3).rev() { print!("{} ", i); }  // 3 2 1\n}', lang: "rust" }
    },
    {
      id: "ownership", title: "Ownership (Rust ka dil)",
      html: `
<p class="lead">Yehi cheez Rust ko special banati hai — <b>har value ka ek owner</b>, scope end par auto-free. GC nahi, leaks nahi.</p>
<h2>3 rules</h2>
<ul>
  <li>Har value ka ek owner hota hai</li>
  <li>Same time par sirf ek owner</li>
  <li>Owner scope se bahar → value drop</li>
</ul>
<h2>Move vs Borrow</h2>
<p><code class="inline">let b = a;</code> — ownership <b>move</b> ho jaati hai (Strings mein). Copy sirf simple types ke liye. Doosron ko read/write karne do bina move ke: <b>borrowing</b> <code class="inline">&amp;s</code> / <code class="inline">&amp;mut s</code>.</p>
<div class="warn"><b>Rule:</b> ek time par ya to <b>kai</b> immutable refs, ya <b>ek hi</b> mutable ref — races compile time par rok diye jaate hain!</div>`,
      seed: { code: 'fn main() {\n    let s1 = String::from("neon");\n    let s2 = s1;                    // MOVED! s1 invalid\n    // println!("{}", s1);         // ❌ compile error\n\n    let len = calculate(&s2);       // borrow — s2 alive\n    println!("{} len={}", s2, len);\n}\n\nfn calculate(s: &String) -> usize {\n    s.len()\n}', lang: "rust" }
    },
    {
      id: "structs-enums", title: "Structs & Enums",
      html: `
<p class="lead">Rust ke enums <b>data carry</b> kar sakte hain — <code class="inline">Option</code> aur <code class="inline">Result</code> isi pe bane.</p>
<h2>Struct + impl</h2>
<p><code class="inline">impl User { fn new(...) -> Self { ... } fn power(&self) -> i32 { ... } }</code></p>
<h2>Enum + match</h2>
<p><code class="inline">enum Msg { Quit, Move { x: i32, y: i32 }, Text(String) }</code> — har variant alag shape!</p>`,
      seed: { code: 'struct Player { name: String, power: u32 }\n\nimpl Player {\n    fn new(name: &str) -> Self {\n        Self { name: name.to_string(), power: 100 }\n    }\n    fn intro(&self) {\n        println!("{} ⚡ {}", self.name, self.power);\n    }\n}\n\nenum Msg { Quit, Move { x: i32, y: i32 }, Text(String) }\n\nfn main() {\n    Player::new("Shadow").intro();\n    let m = Msg::Text(String::from("hello"));\n    match m {\n        Msg::Text(t) => println!("text: {}", t),\n        Msg::Move { x, y } => println!("move {},{}", x, y),\n        Msg::Quit => println!("quit"),\n    }\n}', lang: "rust" }
    },
    {
      id: "collections-errors", title: "Collections & Error Handling",
      html: `
<p class="lead">Collection types aur kyunki Rust mein exceptions nahi hain — <code class="inline">Result</code>/<code class="inline">Option</code> enum handle karte hain.</p>
<h2>Common collections</h2>
<p><code class="inline">Vec&lt;T&gt;</code> · <code class="inline">HashMap&lt;K,V&gt;</code> · <code class="inline">String</code> (UTF-8)</p>
<h2>? operator</h2>
<p><code class="inline">fs::read_to_string("f.txt")?</code> — error ho to upar bhej, ok ho to value. Result ke liye best!</p>`,
      seed: { code: 'use std::collections::HashMap;\n\nfn parse_num(s: &str) -> Result<i32, std::num::ParseIntError> {\n    let n = s.parse::<i32>()?;   // ? = early return on error\n    Ok(n * 2)\n}\n\nfn main() {\n    println!("{:?}", parse_num("21"));   // Ok(42)\n    println!("{:?}", parse_num("abc"));  // Err(...)\n\n    let mut m = HashMap::new();\n    m.insert("html", 17);\n    println!("{:?}", m.get("html"));     // Some(17)\n}', lang: "rust" }
    },
    {
      id: "traits", title: "Traits & Generics",
      html: `
<p class="lead"><b>Traits</b> = shared behaviour (interfaces jaise). <b>Generics</b> = type-parametric code zero-cost ke saath.</p>
<h2>Trait</h2>
<p><code class="inline">trait Greet { fn hi(&self) -> String; }</code> → <code class="inline">impl Greet for Player</code></p>
<h2>Generics + bounds</h2>
<p><code class="inline">fn largest&lt;T: PartialOrd&gt;(list: &[T]) -> T</code> — T par PartialOrd chahiye.</p>`,
      seed: { code: 'trait Greet {\n    fn hi(&self) -> String;\n}\n\nstruct Bot;\nimpl Greet for Bot {\n    fn hi(&self) -> String { "beep boop".to_string() }\n}\n\nfn largest<T: PartialOrd + Copy>(list: &[T]) -> T {\n    let mut m = list[0];\n    for &x in list { if x > m { m = x; } }\n    m\n}\n\nfn main() {\n    println!("{}", Bot.hi());\n    println!("{}", largest(&[3, 9, 2]));   // 9\n}', lang: "rust" }
    },
    {
      id: "cargo-eco", title: "Cargo & Ecosystem",
      html: `
<p class="lead"><b>Cargo</b> — duniya ka best package manager+build tool.</p>
<h2>Commands</h2>
<ul>
  <li><code class="inline">cargo new / build / run / test</code></li>
  <li><code class="inline">cargo add serde</code> — dependencies Cargo.toml mein</li>
</ul>
<h2>Kahan kaam aata hai Rust?</h2>
<ul>
  <li><b>clap</b> — CLIs · <b>tokyo</b>/<b>axum</b> — async web</li>
  <li><b>WebAssembly</b> — browser mein Rust!</li>
  <li>CLI tools: <b>ripgrep</b>, <b>fd</b>, <b>bat</b> — sab Rust mein</li>
</ul>`,
      seed: { code: '# Cargo.toml\n[dependencies]\nserde = "1"\ntokio = { version = "1", features = ["full"] }\n\n# tests likhna super easy\n#[test]\nfn it_works() {\n    assert_eq!(2 + 2, 4);\n}\n# cargo test', lang: "rust" }
    },
    {
      id: "wrapup", title: "Rust Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — ownership samajh ke aap Rust ke 90% errors se bach gaye.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Variables, expressions, match</li>
  <li>Ownership, moves, borrows — memory safety</li>
  <li>Structs, enums, collections, Result/?</li>
  <li>Traits, generics, cargo ecosystem</li>
</ul>
<h2>Agla step</h2>
<p>CLI tool banao (<b>clap</b> se) ya <b>WebAssembly</b> try karo. Rustacean welcome! 🦀</p>`,
      seed: { code: 'println!("Rust complete ✔ 🦀");', lang: "rust" }
    }
  ]
};
