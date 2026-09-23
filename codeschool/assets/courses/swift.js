/* GodxShadow course: Swift — start se end tak */
COURSES.swift = {
  name: "Swift", color: "#f05138", icon: "Sw", blurb: "Apple ki language — iPhone, iPad, Mac apps ke liye.",
  lessons: [
    {
      id: "intro", title: "Swift Introduction",
      html: `
<p class="lead"><b>Swift</b> — Apple ki modern, safe, fast language (2014). iOS/macOS apps ka primary tool. Playgrounds mein turant experiment kar sakte ho.</p>
<h2>Pehla program</h2>
<h2>Basics</h2>
<ul>
  <li><code class="inline">let</code> = constant, <code class="inline">var</code> = variable</li>
  <li>Type inference strong: <code class="inline">let x = 5</code> → Int</li>
  <li>String interpolation: <code class="inline">"Hi \\(name)"</code></li>
</ul>`,
      seed: { code: 'let name = "Shadow"\nvar level = 99\nlevel += 1\nprint("Hello \\(name), L\\(level)")\n\nlet pi = 3.14159\nlet enabled = true', lang: "swift" }
    },
    {
      id: "control", title: "Conditions, Loops & Optionals",
      html: `
<p class="lead">Control flow + Swift ki pehchan <b>Optionals</b> — null crashes ka ilaaj.</p>
<h2>Optionals</h2>
<ul>
  <li><code class="inline">var nick: String? = nil</code> — maybe-value</li>
  <li><code class="inline">if let n = nick { ... }</code> — safe unwrap (best!)</li>
  <li><code class="inline">guard let ... else { return }</code> — early exit</li>
  <li><code class="inline">??</code> nil-coalescing · <code class="inline">!</code> force (danger!)</li>
</ul>
<h2>Loops</h2>
<p><code class="inline">for i in 1...10</code> (inclusive) ya <code class="inline">..&lt;</code> (exclusive).</p>`,
      seed: { code: 'var nick: String? = nil\n\nif let n = nick {\n    print("nick is \\(n)")\n} else {\n    print("no nickname")     // ye chalega\n}\n\nprint(nick?.count ?? 0)      // 0\n\nfor i in 1...3 { print(i) }  // 1 2 3\nfor c in "neon" { print(c) }', lang: "swift" }
    },
    {
      id: "functions", title: "Functions & Closures",
      html: `
<p class="lead">Swift functions labelled parameters ke saath — padhne mein English jaisi!</p>
<h2>Signatures</h2>
<ul>
  <li><code class="inline">func greet(name n: String, age: Int)</code> — external/internal labels</li>
  <li><code class="inline">throws</code> + <code class="inline">try</code> — error functions</li>
  <li>Closures: <code class="inline">{ $0 * 2 }</code> — <code class="inline">$0</code> first param</li>
  <li>Trailing closure: <code class="inline">list.map { $0 * 2 }</code></li>
</ul>`,
      seed: { code: 'func greet(person name: String, from city: String) {\n    print("\\(name), (city) se")\n}\ngreet(person: "Shadow", from: "Delhi")\n\nlet nums = [1, 2, 3].map { $0 * 2 }\nprint(nums)                     // [2, 4, 6]\n\nlet big = (120 + 340).advanced(by: 0)\nprint([120, 340, 55].filter { $0 > 100 })', lang: "swift" }
    },
    {
      id: "structs", title: "Structs, Classes & Protocols",
      html: `
<p class="lead">Swift mein <b>value types</b> (structs) king hain — SwiftUI bhi structs par chalta hai.</p>
<h2>Kaun kab?</h2>
<ul>
  <li><b>struct</b> — copy by value (default choice!)</li>
  <li><b>class</b> — reference + inheritance</li>
  <li><b>protocol</b> — interface (iOS std: <code class="inline">protocol Flyable { func fly() }</code>)</li>
  <li><b>extension</b> — kisi bhi type mein baad mein methods!</li>
</ul>`,
      seed: { code: 'struct Player {\n    var name: String\n    var power = 100\n    mutating func levelUp() { power += 10 }\n}\n\nprotocol Glowable {\n    func glow() -> String\n}\n\nextension Player: Glowable {\n    func glow() -> String { "\\(name) ✨" }\n}\n\nvar p = Player(name: "Shadow")\np.levelUp()\nprint(p.glow(), p.power)', lang: "swift" }
    },
    {
      id: "async", title: "Async/Await & Errors",
      html: `
<p class="lead">Modern Swift concurrency — clean sequential-looking async code.</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">func fetchUser() async throws -&gt; User</code></li>
  <li><code class="inline">let u = try await fetchUser()</code></li>
  <li><code class="inline">Task { }</code> — concurrent work start</li>
  <li>Errors: <code class="inline">do / try / catch</code></li>
</ul>`,
      seed: { code: 'enum NetError: Error { case badURL }\n\nfunc fetchData() async throws -> String {\n    // simulated\n    return "payload"\n}\n\nTask {\n    do {\n        let d = try await fetchData()\n        print("Got:", d)\n    } catch {\n        print("Error:", error)\n    }\n}', lang: "swift" }
    },
    {
      id: "swiftui", title: "SwiftUI (Declarative UI)",
      html: `
<p class="lead"><b>SwiftUI</b> — UI = f(state), React jaisa declarative. iOS 13+ ki modern toolkit.</p>
<h2>Building blocks</h2>
<ul>
  <li><code class="inline">struct ContentView: View { var body: some View { ... } }</code></li>
  <li><code class="inline">VStack / HStack / ZStack</code> layout</li>
  <li><code class="inline">@State</code>, <code class="inline">@Binding</code>, <code class="inline">@ObservedObject</code></li>
  <li>Modifiers: <code class="inline">.padding().background(.blue).cornerRadius(12)</code></li>
</ul>`,
      seed: { code: 'struct ContentView: View {\n    @State private var count = 0\n\n    var body: some View {\n        VStack(spacing: 16) {\n            Text("Count: \\(count)").font(.title)\n            Button("Tap!") { count += 1 }\n        }\n        .padding()\n    }\n}', lang: "swift" }
    },
    {
      id: "collections", title: "Array, Dictionary, Set",
      html: `
<p class="lead">Swift ke 3 core collections + functional powers.</p>
<h2>Types</h2>
<ul>
  <li><code class="inline">var a = [1, 2]</code> · <code class="inline">a.append(3)</code> · <code class="inline">a.count</code></li>
  <li><code class="inline">var d = ["html": 17]</code> · <code class="inline">d.keys, d["css"] = 29</code></li>
  <li><code class="inline">var st: Set = [1, 2, 2]</code> — unique items</li>
  <li>Pipeline: <code class="inline">.filter { }.map { }.reduce(0, +)</code></li>
</ul>`,
      seed: { code: 'var skills = ["html", "css", "js"]\nskills.append("swift")\n\nvar scores = ["asha": 90, "ravi": 75]\nscores["sha"] = 99\n\nlet big = scores.filter { $0.value > 80 }.map { $0.key }\nprint(big)\n\nlet uniq = Set([1, 2, 2, 3, 3, 3])\nprint(uniq)   // [1, 2, 3]', lang: "swift" }
    },
    {
      id: "error-do-catch", title: "Error Handling (throws/do-catch)",
      html: `
<p class="lead">Swift errors first-class hain — <code class="inline">throw</code>, <code class="inline">try</code>, <code class="inline">do-catch</code>, aur <code class="inline">Result</code> type.</p>
<h2>Pattern</h2>
<ul>
  <li><code class="inline">enum AppError: Error { case invalid }</code></li>
  <li><code class="inline">func parse() throws -> Int</code></li>
  <li><code class="inline">do { try parse() } catch { ... }</code></li>
  <li><code class="inline">try?</code> → nil if error · <code class="inline">try!</code> → crash (avoid)</li>
</ul>`,
      seed: { code: 'enum AgeError: Error { case negative }\n\nfunc check(age: Int) throws -> String {\n    if age < 0 { throw AgeError.negative }\n    return "OK (age)"\n}\n\ndo {\n    let msg = try check(age: -3)\n    print(msg)\n} catch {\n    print("Pakda: (error)")\n}\n\nlet maybe = try? check(age: 21)\nprint(maybe ?? "fail hua")', lang: "swift" }
    },
    {
      id: "wrapup", title: "Swift Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — iOS dev ki seedhi chadh gayi.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>let/var, optionals (if let, ??, guard)</li>
  <li>Functions, closures, trailing syntax</li>
  <li>Structs vs classes, protocols, extensions</li>
  <li>async/await, SwiftUI declarative UI</li>
</ul>
<h2>Agla step</h2>
<p><b>Xcode</b> kholkar SwiftUI app banao — neon calculator accha start hai! 🍎</p>`,
      seed: { code: 'print("Swift complete ✔")', lang: "swift" }
    }
  ]
};
