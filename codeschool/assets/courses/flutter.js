/* GodxShadow course: Flutter — start se end tak */
COURSES.flutter = {
  name: "Flutter", color: "#54c5f8", icon: "🎯", blurb: "Ek codebase se Android + iOS + Web — Dart ke saath mobile dev.",
  lessons: [
    {
      id: "intro", title: "Flutter & Dart Introduction",
      html: `
<p class="lead"><b>Flutter</b> — Google ka UI toolkit. Ek hi code se Android, iOS, web, desktop apps. Language: <b>Dart</b>.</p>
<h2>Setup</h2>
<ul>
  <li><code class="inline">flutter doctor</code> — environment check</li>
  <li><code class="inline">flutter create app</code> → <code class="inline">flutter run</code></li>
  <li><b>Hot reload</b> — code save karte hi UI refresh!</li>
</ul>
<h2>Dart basics</h2>
<p><code class="inline">var/val nahi — var/final/const</code>; types inferred;;</p>`,
      seed: { code: 'void main() {\n  var name = "Shadow";\n  final level = 99;\n  print("Hello $name, L$level");\n}\n\nString greet(String n) => "Hi $n";\n\nvoid hw() => print("HW running");', lang: "dart" }
    },
    {
      id: "widgets", title: "Widgets (Flutter ka sab kuch)",
      html: `
<p class="lead">Flutter mein <b>everything is a widget</b> — text bhi, button bhi, padding bhi, screen bhi.</p>
<h2>Stateless vs Stateful</h2>
<ul>
  <li><b>StatelessWidget</b> — jo kabhi nahi badalta (static UI)</li>
  <li><b>StatefulWidget</b> — setState() se re-build hoga (counters, forms)</li>
</ul>
<h2>Core widgets</h2>
<p><code class="inline">Text, Container, Row, Column, Stack, Icon, Center, Padding, SizedBox</code></p>`,
      seed: { code: 'class Card extends StatelessWidget {\n  const Card({super.key, required this.title});\n  final String title;\n\n  @override\n  Widget build(BuildContext context) {\n    return Container(\n      padding: const EdgeInsets.all(16),\n      decoration: BoxDecoration(\n        color: const Color(0xFF0B0F1E),\n        borderRadius: BorderRadius.circular(16),\n      ),\n      child: Text(title, style: const TextStyle(color: Color(0xFF22E8FF))),\n    );\n  }\n}', lang: "dart" }
    },
    {
      id: "layout-list", title: "Layout & Lists",
      html: `
<p class="lead">Rows/columns align karna aur scroll karne wali lambi lists — mobile ka basics.</p>
<h2>Flex widgets</h2>
<ul>
  <li><code class="inline">Row(mainAxisAlignment: ...)</code>, <code class="inline">Column(crossAxisAlignment: ...)</code></li>
  <li><code class="inline">Expanded</code>, <code class="inline">Flexible</code> — responsive space</li>
</ul>
<h2>ListView</h2>
<p><code class="inline">ListView.builder(itemCount: ...)</code> — long lists efficiently.</p>`,
      seed: { code: 'ListView.builder(\n  itemCount: courses.length,\n  itemBuilder: (context, i) => ListTile(\n    title: Text(courses[i].name),\n    subtitle: Text("${courses[i].lessons} lessons"),\n    trailing: const Icon(Icons.arrow_forward),\n    onTap: () {},\n  ),\n)', lang: "dart" }
    },
    {
      id: "state", title: "State & setState",
      html: `
<p class="lead"><b>setState()</b> — UI ko batana ki data badla hai, rebuild karna.</p>
<h2>Pattern</h2>
<ul>
  <li>Stateful widget mein class-ke fields state hain</li>
  <li><code class="inline">setState(() { count++; })</code> — build() dobara chalta hai</li>
  <li>Bade apps ke liye <b>Provider/Riverpod</b> use karo</li>
</ul>`,
      seed: { code: 'class Counter extends StatefulWidget {\n  const Counter({super.key});\n  @override\n  State<Counter> createState() => _CounterState();\n}\n\nclass _CounterState extends State<Counter> {\n  int count = 0;\n  @override\n  Widget build(BuildContext context) {\n    return Column(children: [\n      Text("Count: $count", style: const TextStyle(fontSize: 32)),\n      ElevatedButton(onPressed: () => setState(() => count++), child: const Text("+1")),\n    ]);\n  }\n}', lang: "dart" }
    },
    {
      id: "navigation", title: "Navigation & Routes",
      html: `
<p class="lead">Screens ke beech जाना — stack-based navigation.</p>
<h2>Push/Pop</h2>
<ul>
  <li><code class="inline">Navigator.push(context, MaterialPageRoute(...))</code></li>
  <li><code class="inline">Navigator.pop(context)</code> — back</li>
  <li>Named routes: <code class="inline">Navigator.pushNamed(context, "/about")</code></li>
  <li>Data wapas: <code class="inline">final res = await Navigator.push...</code></li>
</ul>`,
      seed: { code: '// Home → Detail\nonPressed: () {\n  Navigator.push(context, MaterialPageRoute(\n    builder: (_) => DetailScreen(course: courses[i]),\n  ));\n}\n\n// Detail mein back\nIconButton(\n  icon: const Icon(Icons.arrow_back),\n  onPressed: () => Navigator.pop(context),\n)', lang: "dart" }
    },
    {
      id: "http", title: "HTTP & JSON",
      html: `
<p class="lead">Internet se data laana — http package + JSON decode.</p>
<h2>Flow</h2>
<ul>
  <li>pubspec.yml: <code class="inline">http: ^1.2</code></li>
  <li><code class="inline">final r = await http.get(Uri.parse(url));</code></li>
  <li><code class="inline">jsonDecode(r.body)</code> → objects</li>
  <li><b>FutureBuilder</b> — Loading → Done states UI mein</li>
</ul>`,
      seed: { code: 'Future<List<User>> loadUsers() async {\n  final r = await http.get(Uri.parse("https://jsonplaceholder.typicode.com/users"));\n  final data = jsonDecode(r.body) as List;\n  return data.map((u) => User.fromJson(u)).toList();\n}\n\n// UI mein\nFutureBuilder<List<User>>(\n  future: loadUsers(),\n  builder: (context, snap) => snap.hasData\n      ? ListView(children: [for (var u in snap.data!) Text(u.name)])\n      : const CircularProgressIndicator(),\n)', lang: "dart" }
    },
    {
      id: "forms", title: "Forms & Theming",
      html: `
<p class="lead">Input forms + poore app ka look ek jagah se control.</p>
<h2>TextField + Form</h2>
<ul>
  <li><code class="inline">TextFormField</code> + <code class="inline">validator</code></li>
  <li><code class="inline">GlobalKey<FormState></code> → <code class="inline">formKey.currentState!.validate()</code></li>
</ul>
<h2>Theming</h2>
<p><code class="inline">ThemeData(colorScheme: ColorScheme.fromSeed(...))</code> — Material 3 auto-style.</p>`,
      seed: { code: 'MaterialApp(\n  theme: ThemeData(\n    colorScheme: ColorScheme.fromSeed(\n      seedColor: const Color(0xFF22E8FF),\n      brightness: Brightness.dark,\n    ),\n    useMaterial3: true,\n  ),\n  home: const HomePage(),\n)', lang: "dart" }
    },
    {
      id: "wrapup", title: "Flutter Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — mobile dev ka express ticket mil gaya.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Dart basics, widgets, layouts</li>
  <li>Stateful/setState, navigation</li>
  <li>HTTP + FutureBuilder, forms, theming</li>
</ul>
<h2>Agla step</h2>
<p><b>Riverpod</b> state management · fir apni neon app <b>Play Store</b> par daalo!</p>`,
      seed: { code: 'print("Flutter complete ✔ 🚀");', lang: "dart" }
    }
  ]
};
