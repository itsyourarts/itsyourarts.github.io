/* GodxShadow course: Kotlin — start se end tak */
COURSES.kotlin = {
  name: "Kotlin", color: "#7f52ff", icon: "Kt", blurb: "Android ki official language — modern, safe, concise.",
  lessons: [
    {
      id: "intro", title: "Kotlin Introduction",
      html: `
<p class="lead"><b>Kotlin</b> — JetBrains ne banayi, Google ne Android ki official language bhi declare ki. Java ke saath 100% interoperable, par likhne mein aadha kam code.</p>
<h2>Pehla program</h2>
<h2>Kyun Kotlin?</h2>
<ul>
  <li>Null-safety compiler mein — crash nahi hota</li>
  <li><code class="inline">val</code> (immutable) / <code class="inline">var</code> (mutable)</li>
  <li>Semicolons optional, string interpolation <code class="inline">"Hi $name"</code></li>
</ul>`,
      seed: { code: 'fun main() {\n    val name = "Shadow"\n    var level = 99\n    level++\n    println("Hello $name, L$level")\n}', lang: "kotlin" }
    },
    {
      id: "control", title: "when, Loops & Ranges",
      html: `
<p class="lead"><code class="inline">when</code> — switch ka powerful version; ranges se loops dhamakedaar.</p>
<h2>when</h2>
<p><code class="inline">when (x) { 1 -> "one"; in 2..5 -> "small"; else -> "big" }</code> — expression ki tarah value deta hai.</p>
<h2>Loops</h2>
<ul>
  <li><code class="inline">for (i in 1..10)</code> · <code class="inline">downTo</code> · <code class="inline">step 2</code></li>
  <li><code class="inline">repeat(5) { }</code></li>
  <li><code class="inline">for (item in list)</code></li>
</ul>`,
      seed: { code: 'fun main() {\n    val score = 85\n    val grade = when {\n        score >= 90 -> "A+"\n        score >= 75 -> "A"\n        else -> "B"\n    }\n    println(grade)\n\n    for (i in 5 downTo 1 step 2) print("$i ")  // 5 3 1\n    println()\n}', lang: "kotlin" }
    },
    {
      id: "functions", title: "Functions & Lambdas",
      html: `
<p class="lead">Kotlin functions first-class hain — lambdas har jagah.</p>
<h2>Function styles</h2>
<ul>
  <li>Single-expression: <code class="inline">fun sq(n: Int) = n * n</code></li>
  <li>Default params: <code class="inline">fun greet(n: String = "Guest")</code></li>
  <li>Named args: <code class="inline">greet(n = "Sha")</code></li>
  <li>Lambda: <code class="inline">val dbl = { x: Int -> x * 2 }</code></li>
  <li>SCOPE functions: <code class="inline">let, apply, also, run, with</code></li>
</ul>`,
      seed: { code: 'fun sum(vararg xs: Int) = xs.sum()\n\nfun main() {\n    val dbl = { x: Int -> x * 2 }\n    println(listOf(1, 2, 3).map(dbl))   // [2, 4, 6]\n\n    val s = StringBuilder().apply {\n        append("Neon ")\n        append("Kotlin")\n    }.toString()\n    println(s)\n    println(sum(1, 2, 3, 4))            // 10\n}', lang: "kotlin" }
    },
    {
      id: "oop", title: "Classes & Data Classes",
      html: `
<p class="lead">Kotlin mein boilerplate gayab — <b>data class</b> ek line mein equals/hashCode/toString deta hai.</p>
<h2>Classes</h2>
<ul>
  <li><code class="inline">class Player(val name: String, var power: Int)</code> — constructor + properties ek saath</li>
  <li><code class="inline">data class</code> — value objects ke liye perfect</li>
  <li><code class="inline">object</code> — built-in singleton!</li>
  <li>Sealed classes — restricted hierarchies</li>
</ul>`,
      seed: { code: 'data class User(val name: String, val age: Int)\n\nobject Config {\n    const val THEME = "neon"\n}\n\nfun main() {\n    val u = User("Shadow", 21)\n    val (name, age) = u          // destructuring!\n    println("$name is $age")\n    println(u)                   // auto toString\n    println(Config.THEME)\n}', lang: "kotlin" }
    },
    {
      id: "nulls", title: "Null Safety",
      html: `
<p class="lead">Kotlin ka killer feature — <b>NullPointerException</b> ka ilaaj compile time par.</p>
<h2>Operators</h2>
<ul>
  <li><code class="inline">String?</code> — nullable type (explicit mark!)</li>
  <li><code class="inline">s?.length</code> — safe call (null ho to null deta hai)</li>
  <li><code class="inline">s ?: "default"</code> — Elvis operator</li>
  <li><code class="inline">s!!</code> — "I swear non-null" (danger, avoid)</li>
  <li><code class="inline">s?.let { ... }</code> — non-null ho to chalao</li>
</ul>`,
      seed: { code: 'fun main() {\n    var nick: String? = null\n    println(nick?.length ?: "no nick")   // no nick\n\n    nick = "Shade"\n    nick?.let { println("Length: ${it.length}") }\n\n    // val n: String = null   // ❌ compile error!\n}', lang: "kotlin" }
    },
    {
      id: "collections-coroutines", title: "Collections & Coroutines",
      html: `
<p class="lead">Kotlin collections ke functional operators + async ka modern tareeka <b>coroutines</b>.</p>
<h2>Collection pipelines</h2>
<p><code class="inline">.filter { }.map { }.sortedBy { }.groupBy { }</code></p>
<h2>Coroutines</h2>
<ul>
  <li><code class="inline">suspend</code> — pausable function</li>
  <li><code class="inline">launch</code> (fire-and-forget) / <code class="inline">async</code> → <code class="inline">await()</code></li>
  <li>Threads nahi — thousands coroutines ek thread par!</li>
</ul>`,
      seed: { code: 'fun main() {\n    val big = listOf(120, 340, 55, 900).filter { it > 100 }\n    println(big)                      // [340, 900]\n\n    // coroutine (concept)\n    // runBlocking {\n    //     launch { delay(1000); println("world") }\n    //     println("hello")\n    // }\n}', lang: "kotlin" }
    },
    {
      id: "android", title: "Android & Jetpack Compose",
      html: `
<p class="lead">Kotlin ka sabse bada kaam — Android apps. Modern UI toolkit = <b>Jetpack Compose</b> (declarative UI, React jaisa!).</p>
<h2>Compose basics</h2>
<ul>
  <li><code class="inline">@Composable</code> functions — UI as functions</li>
  <li><code class="inline">remember { mutableStateOf(0) }</code> — state</li>
  <li>Recomposition — state change par UI auto-update</li>
</ul>`,
      seed: { code: '@Composable\nfun Counter() {\n    var count by remember { mutableStateOf(0) }\n    Column(Modifier.padding(16.dp)) {\n        Text("Count: $count")\n        Button(onClick = { count++ }) {\n            Text("Click")\n        }\n    }\n}', lang: "kotlin" }
    },
    {
      id: "wrapup", title: "Kotlin Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — ab aap Play Store ki duniya ke liye ready ho.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>val/var, when, ranges, lambdas</li>
  <li>Data classes, object singleton, sealed classes</li>
  <li>Null-safety (?., ?:, let) — compiler ki superpower</li>
  <li>Collection pipelines, coroutines, Compose UI</li>
</ul>
<h2>Agla step</h2>
<p><b>Android Studio</b> install karo → Compose mein neon app banao. Kotlin Multiplatform bhi explore!</p>`,
      seed: { code: 'println("Kotlin complete ✔")', lang: "kotlin" }
    }
  ]
};
