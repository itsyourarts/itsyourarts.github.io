/* GodxShadow course: Go (Golang) — start se end tak */
COURSES.go = {
  name: "Go", color: "#29e0e6", icon: "Go", blurb: "Google ki fast, simple language — cloud, APIs, DevOps tools.",
  lessons: [
    {
      id: "intro", title: "Go Introduction",
      html: `
<p class="lead"><b>Go (Golang)</b> — Google ne banayi compiled language. Simple syntax + C-level speed + built-in concurrency. Docker, Kubernetes, Terraform — sab Go mein likhe gaye!</p>
<h2>Pehla program</h2>
<h2>Setup</h2>
<ul>
  <li>Install: go.dev → <code class="inline">go version</code></li>
  <li>Run: <code class="inline">go run main.go</code> · build: <code class="inline">go build</code></li>
  <li>Har file ek <code class="inline">package</code> mein hoti hai; executable ke liye <code class="inline">package main</code> + <code class="inline">func main()</code></li>
</ul>`,
      seed: { code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n    a, b := 5, 3   // := short declaration\n    fmt.Println("Sum =", a+b)\n}', lang: "go" }
    },
    {
      id: "control", title: "Types & Control Flow",
      html: `
<p class="lead">Go static typing ke saath minimal rakhta hai — parentheses optional, semicolons automatic.</p>
<h2>Basics</h2>
<ul>
  <li><code class="inline">int, float64, string, bool, rune</code></li>
  <li><code class="inline">if</code> mein bina parentheses: <code class="inline">if x &gt; 5 { }</code></li>
  <li><b>Sirf <code class="inline">for</code> loop</b> hai — while ka kaam bhi yehi karta hai</li>
  <li><code class="inline">switch</code> break-free, aur <code class="inline">defer</code> — function end par chalta hai</li>
</ul>`,
      seed: { code: 'for i := 0; i < 5; i++ {\n    fmt.Print(i, " ")\n}\n\n// for as while\nn := 1\nfor n < 100 {\n    n *= 2\n}\nfmt.Println(n)        // 128\n\nswitch day := 3; day {\ncase 1:\n    fmt.Println("Mon")\ndefault:\n    fmt.Println("other", day)\n}', lang: "go" }
    },
    {
      id: "functions", title: "Functions & Slices",
      html: `
<p class="lead">Go functions multiple values return kar sakte hain; arrays ke upar flexible layer = <b>slice</b>.</p>
<h2>Patterns</h2>
<ul>
  <li><code class="inline">func divide(a, b float64) (float64, error)</code> — (result, error) idiomatic!</li>
  <li><code class="inline">nums := []int{1, 2, 3}</code> · <code class="inline">nums = append(nums, 4)</code></li>
  <li><code class="inline">for i, v := range nums</code> — index + value</li>
  <li>Variadic: <code class="inline">func sum(nums ...int)</code></li>
</ul>`,
      seed: { code: 'func divide(a, b float64) (float64, error) {\n    if b == 0 {\n        return 0, fmt.Errorf("zero se divide?")\n    }\n    return a / b, nil\n}\n\nfunc sum(nums ...int) int {\n    t := 0\n    for _, v := range nums { t += v }\n    return t\n}', lang: "go" }
    },
    {
      id: "structs", title: "Structs & Maps",
      html: `
<p class="lead">Go mein classes nahi — <b>structs</b> + <b>methods</b> se OOP-lite.</p>
<h2>Struct + method</h2>
<p><code class="inline">type User struct { Name string; Age int }</code> · Receiver: <code class="inline">func (u User) Greet() string</code></p>
<h2>Map</h2>
<p><code class="inline">scores := map[string]int{"asha": 90}</code> · <code class="inline">delete(scores, "asha")</code> · v, ok := scores["x"] (comma-ok idiom)</p>`,
      seed: { code: 'type User struct {\n    Name  string\n    Level int\n}\n\nfunc (u User) Intro() string {\n    return fmt.Sprintf("%s (L%d)", u.Name, u.Level)\n}\n\nfunc main() {\n    u := User{"Shadow", 99}\n    fmt.Println(u.Intro())\n\n    m := map[string]int{"html": 17, "css": 23}\n    if v, ok := m["css"]; ok { fmt.Println("css:", v) }\n}', lang: "go" }
    },
    {
      id: "interfaces", title: "Interfaces & Errors",
      html: `
<p class="lead">Go interfaces <b>implicit</b> hote hain — methods satisfy karo, declare karne ki zaroorat nahi.</p>
<h2>Interface</h2>
<p><code class="inline">type Shaper interface { Area() float64 }</code> — jo bhi Area() rakhe, wahi Shaper hai.</p>
<h2>Error handling</h2>
<ul>
  <li><code class="inline">error</code> ek interface — <code class="inline">err != nil</code> check culture</li>
  <li><code class="inline">fmt.Errorf()</code>, Go 1.13+: <code class="inline">errors.Is/Unwrap</code></li>
</ul>`,
      seed: { code: 'type Shaper interface{ Area() float64 }\n\ntype Square struct{ Side float64 }\nfunc (s Square) Area() float64 { return s.Side * s.Side }\n\nfunc printArea(sh Shaper) {\n    fmt.Println("Area:", sh.Area())\n}\n\nfunc main() {\n    printArea(Square{Side: 4})  // Square is Shaper — bina bolna\n}', lang: "go" }
    },
    {
      id: "concurrency", title: "Goroutines & Channels",
      html: `
<p class="lead">Go ka superpower — lightweight concurrency. <b>"Do not communicate by sharing memory; share memory by communicating."</b></p>
<h2>2 keywords</h2>
<ul>
  <li><code class="inline">go worker()</code> — function ek naye goroutine mein</li>
  <li><code class="inline">ch := make(chan int)</code> → <code class="inline">ch &lt;- 5</code> / <code class="inline">v := &lt;-ch</code></li>
  <li><code class="inline">select</code> — multiple channels par wait</li>
</ul>`,
      seed: { code: 'func worker(id int, ch chan string) {\n    ch <- fmt.Sprintf("worker %d done", id)\n}\n\nfunc main() {\n    ch := make(chan string)\n    for i := 1; i <= 3; i++ {\n        go worker(i, ch)\n    }\n    for i := 0; i < 3; i++ {\n        fmt.Println(<-ch)\n    }\n}', lang: "go" }
    },
    {
      id: "web", title: "HTTP Server & Ecosystem",
      html: `
<p class="lead">Standard library se hi full web server — framework zaroori nahi.</p>
<h2>net/http</h2>
<p><code class="inline">http.HandleFunc</code> + <code class="inline">http.ListenAndServe(":8080", nil)</code></p>
<h2>Ecosystem</h2>
<ul>
  <li><b>Gin / Echo / Fiber</b> — web frameworks</li>
  <li><b>GORM</b> — database ORM</li>
  <li><b>Cobra</b> — CLIs (kubectl jaisa)</li>
</ul>`,
      seed: { code: 'package main\n\nimport (\n    "encoding/json"\n    "net/http"\n)\n\nfunc main() {\n    http.HandleFunc("/api/ping", func(w http.ResponseWriter, r *http.Request) {\n        w.Header().Set("Content-Type", "application/json")\n        json.NewEncoder(w).Encode(map[string]bool{"ok": true})\n    })\n    http.ListenAndServe(":8080", nil)\n}', lang: "go" }
    },
    {
      id: "wrapup", title: "Go Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — Go ki simplicity ab aapki strength hai.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Syntax, types, control flow, functions (multi-return!)</li>
  <li>Slices, maps, structs, methods</li>
  <li>Implicit interfaces, error culture</li>
  <li>Goroutines + channels, net/http</li>
</ul>
<h2>Agla step</h2>
<p><b>Gin</b> se REST API, ya <b>Cobra</b> se CLI tool. Go backend jobs mein bahut demand!</p>`,
      seed: { code: 'fmt.Println("Go complete ✔")', lang: "go" }
    }
  ]
};
