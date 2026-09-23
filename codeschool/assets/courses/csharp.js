/* GodxShadow course: C# — start se end tak (full W3Schools-style depth) */
COURSES.csharp = {
  name: "C#", color: "#d05cff", icon: "C#", blurb: "Microsoft ki language — .NET, Unity games, enterprise apps. 23 chapters, start se end.",
  lessons: [
    {
      id: "intro", title: "C# Introduction",
      html: `
<p class="lead"><b>C# (C-Sharp)</b> is Microsoft's modern, object-oriented language for .NET — used for desktop apps, web backends, Unity games and enterprise software.</p>
<h2>Why C#?</h2>
<ul>
  <li>Strongly typed + compiled → fast, safe, predictable</li>
  <li>Perfect for Unity game development (the world's most popular game engine)</li>
  <li>Web backends with ASP.NET, desktop with WPF/WinForms, mobile with .NET MAUI</li>
  <li>C# files end with <code class="inline">.cs</code>; a console app starts at <code class="inline">static void Main()</code></li>
</ul>
<h2>Your first program</h2>
<p>The example below shows the classic skeleton. Run it in the playground <b>right here</b> — no install needed.</p>`,
      seed: { code: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from C#!");\n    }\n}', lang: "csharp" }
    },
    {
      id: "syntax", title: "Syntax & Output",
      html: `
<p class="lead">C# syntax is C-family: statements end with <b>semicolons</b>, blocks use <b>braces</b>, and everything lives inside classes.</p>
<h2>Rules</h2>
<ul>
  <li><code class="inline">Console.WriteLine("hi")</code> — print with newline; <code class="inline">Write()</code> — without</li>
  <li>Comments: <code class="inline">// single</code> · <code class="inline">/* block */</code></li>
  <li>Namespaces group classes: <code class="inline">using System;</code> imports one</li>
  <li>Case-sensitive: <code class="inline">Name</code> ≠ <code class="inline">name</code>; entry point is <code class="inline">Main</code> (capital M)</li>
</ul>`,
      seed: { code: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.Write("same line ");\n        Console.WriteLine("then newline");\n\n        // ek line comment\n        /* multi-line\n           comment */ \n        Console.WriteLine("Done");\n    }\n}', lang: "csharp" }
    },
    {
      id: "variables", title: "Variables & Constants",
      html: `
<p class="lead"><b>Variables</b> store data; in C# each variable has a FIXED type chosen at declaration.</p>
<h2>Declaration styles</h2>
<ul>
  <li>Explicit: <code class="inline">int age = 21; string name = "Shadow";</code></li>
  <li>Type inference: <code class="inline">var score = 98.5;</code> — compiler detects the type (double here)</li>
  <li>Constants: <code class="inline">const double PI = 3.14;</code> — cannot change later (compile error if you try)</li>
  <li>Always initialize before use — C# refuses unassumed variables</li>
</ul>
<h2>Naming</h2>
<ul>
  <li>camelCase for locals, PascalCase for classes/methods, ALL_CAPS for constants is common</li>
  <li>Reserved keywords need <code class="inline">@</code>: <code class="inline">int &commat;class;</code></li>
</ul>`,
      seed: { code: 'using System;\n\nclass Program {\n    static void Main() {\n        int age = 21;\n        var mood = "neon";              // string\n        const string LANG = "C#";\n\n        Console.WriteLine(age + mood + LANG);\n    }\n}', lang: "csharp" }
    },
    {
      id: "datatypes", title: "Data Types Deep",
      html: `
<p class="lead">C# is strongly typed: every value has an exact type, with fixed ranges and sizes.</p>
<h2>Value types</h2>
<ul>
  <li><code class="inline">int</code> (4B int) · <code class="inline">long</code> (8B) · <code class="inline">short, byte</code></li>
  <li><code class="inline">float f = 3.14f</code> · <code class="inline">double d = 3.14</code> · <code class="inline">decimal m = 99.99m</code> (money!)</li>
  <li><code class="inline">bool b = true</code> · <code class="inline">char c = 'A'</code></li>
</ul>
<h2>Reference types</h2>
<ul>
  <li><code class="inline">string</code>, <code class="inline">object</code>, arrays, classes</li>
  <li>Nullable: <code class="inline">int? x = null;</code> — value type that can be empty</li>
  <li>Inspect: <code class="inline">x.GetType()</code> · ranges: <code class="inline">int.MaxValue</code></li>
</ul>`,
      seed: { code: 'using System;\n\nclass Program {\n    static void Main() {\n        long big = 9000000000L;\n        decimal price = 499.99m;  // money\n        int code = \'A\';           // char => 65\n\n        Console.WriteLine($"{big}, {price}, {code}");\n        Console.WriteLine(sizeof(int));\n    }\n}', lang: "csharp" }
    },
    {
      id: "casting", title: "Type Casting & User Input",
      html: `
<p class="lead"><b>Casting</b> converts one type into another — automatic when safe, explicit when risky.</p>
<h2>Two kinds</h2>
<ul>
  <li><b>Implicit</b> (automatic, no data loss): int → long → float → double</li>
  <li><b>Explicit</b> (manual, possible loss): <code class="inline">double d = 9.8; int x = (int)d;</code> → 9</li>
</ul>
<h2>Conversion helpers</h2>
<ul>
  <li><code class="inline">Convert.ToInt32("42")</code>, <code class="inline">Convert.ToString(42)</code>, <code class="inline">Convert.ToBoolean</code></li>
  <li>Parsing: <code class="inline">int.Parse("42")</code> throws; <code class="inline">int.TryParse("42", out var n)</code> is safe</li>
  <li>User input: <code class="inline">Console.ReadLine()</code> always returns a string — parse it!</li>
</ul>`,
      seed: { code: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.Write("Age batao: ");\n        string inp = Console.ReadLine();\n\n        if (int.TryParse(inp, out int age)) {\n            Console.WriteLine($"Next year: {age + 1}");\n        } else {\n            Console.WriteLine("Number likhna tha!");\n        }\n    }\n}', lang: "csharp" }
    },
    {
      id: "operators", title: "Operators",
      html: `
<p class="lead">C# operators cover arithmetic, comparison, logic and a few gems you will use daily.</p>
<h2>Families</h2>
<ul>
  <li>Arithmetic: <code class="inline">+ - * / %</code> — int/int = int (<code class="inline">17/5</code> = 3!)</li>
  <li>Comparison: <code class="inline">==, !=, &lt;, &gt;, &lt;=, &gt;=</code></li>
  <li>Logic: <code class="inline">&amp;&amp;, ||, !</code> — short-circuiting</li>
  <li>Assignment: <code class="inline">+=, -=, /=</code> · <code class="inline">++x, x++</code></li>
  <li>Ternary: <code class="inline">age &gt; 18 ? "adult" : "minor"</code></li>
  <li>Null-safe: <code class="inline">name ?? "Guest"</code> (null-coalescing) · <code class="inline">obj?.Length</code> (null-conditional)</li>
</ul>`,
      seed: { code: 'using System;\n\nclass Program {\n    static void Main() {\n        int a = 17, b = 5;\n        Console.WriteLine(a % b);          // 2\n\n        string? name = null;\n        Console.WriteLine(name ?? "Guest"); // Guest\n\n        object o = 42;\n        if (o is int n) Console.WriteLine($"int hai: {n}");\n    }\n}', lang: "csharp" }
    },
    {
      id: "math", title: "Math & Random",
      html: `
<p class="lead"><code class="inline">Math</code> is the static math toolbox; <code class="inline">Random</code> generates numbers — games and simulations need both.</p>
<h2>Math methods</h2>
<ul>
  <li><code class="inline">Math.Max/Min</code>, <code class="inline">Math.Abs</code>, <code class="inline">Math.Pow(x, y)</code>, <code class="inline">Math.Sqrt</code></li>
  <li><code class="inline">Math.Round(x, 2)</code>, <code class="inline">Math.Floor</code>, <code class="inline">Math.Ceiling</code></li>
  <li>Constants: <code class="inline">Math.PI</code>, <code class="inline">Math.E</code></li>
</ul>
<h2>Random</h2>
<ul>
  <li><code class="inline">var rng = new Random();</code></li>
  <li><code class="inline">rng.Next(1, 101)</code> — int in [1,100]; upper bound is EXCLUSIVE</li>
  <li><code class="inline">rng.NextDouble()</code> — 0.0–1.0</li>
</ul>`,
      seed: { code: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine(Math.Max(5, 9));       // 9\n        Console.WriteLine(Math.Sqrt(144));       // 12\n        Console.WriteLine(Math.Round(3.7));      // 4\n\n        var rnd = new Random();\n        Console.WriteLine($"Dice: {rnd.Next(1, 7)}");\n    }\n}', lang: "csharp" }
    },
    {
      id: "strings", title: "Strings (Full Power)",
      html: `
<p class="lead">C# strings are immutable objects with a rich method set — interpolation makes them pleasant to build.</p>
<h2>Daily methods</h2>
<ul>
  <li><code class="inline">Length, ToUpper(), ToLower(), Trim()</code></li>
  <li><code class="inline">Contains(), IndexOf(), Replace(), StartsWith()</code></li>
  <li><code class="inline">Substring(start, len)</code> · <code class="inline">Split(',')</code> · <code class="inline">string.Join("-", arr)</code></li>
  <li>Empty checks: <code class="inline">string.IsNullOrEmpty(s)</code>, <code class="inline">IsNullOrWhiteSpace(s)</code></li>
</ul>
<h2>Interpolation & verbatim</h2>
<ul>
  <li><code class="inline">$"Score: 100 + bonus 20"</code> — embed expressions with { }</li>
  <li><code class="inline">@"C:\folder\file.txt"</code> — verbatim (backslashes stay raw)</li>
  <li>Compare: <code class="inline">a == b</code> compares VALUES for strings (unlike Java!)</li>
</ul>`,
      seed: { code: 'using System;\n\nclass Program {\n    static void Main() {\n        string s = "  Neon Dev Academy  ";\n        Console.WriteLine(s.Trim().ToUpper());\n\n        string[] parts = "html,css,js".Split(\',\');\n        Console.WriteLine(string.Join(" | ", parts));\n\n        string name = "shadow";\n        Console.WriteLine($"{name.Substring(0,2).ToUpper()}... len={name.Length}");\n    }\n}', lang: "csharp" }
    },
    {
      id: "conditions", title: "Booleans & if/else",
      html: `
<p class="lead"><b>Booleans</b> drive every decision; <code class="inline">if / else if / else</code> picks the branch to run.</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">if (score &gt;= 60) { … } else if (score &gt;= 33) { … } else { … }</code></li>
  <li>Single statement branches can skip braces — keep them anyway (clarity)</li>
  <li>Ternary for one-liners: <code class="inline">string s = pass ? "OK" : "FAIL";</code></li>
</ul>
<h2>Patterns</h2>
<ul>
  <li>Guard clauses: early <code class="inline">if (user == null) return;</code> keeps nesting low</li>
  <li>Combine conditions with <code class="inline">&amp;&amp;</code> and <code class="inline">||</code></li>
  <li>Nullable bool: <code class="inline">bool?</code> has 3 states — true/false/unknown</li>
</ul>`,
      seed: { code: 'using System;\n\nclass Program {\n    static void Main() {\n        int score = 78;\n\n        if (score >= 90) Console.WriteLine("A+");\n        else if (score >= 75) Console.WriteLine("A");\n        else Console.WriteLine("below");\n\n        string res = score >= 40 ? "Pass 🎉" : "Fail 😢";\n        Console.WriteLine(res);\n    }\n}', lang: "csharp" }
    },
    {
      id: "switch", title: "Switch & Pattern Match",
      html: `
<p class="lead"><code class="inline">switch</code> handles many discrete cases; modern C# adds pattern matching and switch expressions.</p>
<h2>Classic switch</h2>
<ul>
  <li><code class="inline">switch (day) { case 1: … break; default: … break; }</code></li>
  <li>Every case ends with break/return — no accidental fall-through</li>
</ul>
<h2>Modern C#</h2>
<ul>
  <li>Switch expressions: <code class="inline">var s = day switch { 1 =&gt; "Mon", _ =&gt; "?" };</code></li>
  <li>Pattern matching: <code class="inline">case &gt;= 90: "A"</code>, type patterns, <code class="inline">when</code> guards</li>
  <li><code class="inline">_</code> is the discard — the fallback arm</li>
</ul>`,
      seed: { code: 'using System;\n\nclass Program {\n    static void Main() {\n        int day = 3;\n\n        var label = day switch {\n            1 => "Monday",\n            3 => "Wednesday",\n            6 or 7 => "Weekend!",\n            _ => "Regular day"\n        };\n        Console.WriteLine(label);\n\n        var size = 96 switch { < 50 => "S", < 95 => "M", _ => "L" };\n        Console.WriteLine(size);\n    }\n}', lang: "csharp" }
    },
    {
      id: "loops", title: "Loops (for/while/do)",
      html: `
<p class="lead">Loops repeat work — C# offers four flavors for four situations.</p>
<h2>The four</h2>
<ul>
  <li><code class="inline">for (int i = 0; i &lt; n; i++)</code> — counted loop (arrays!)</li>
  <li><code class="inline">while (cond)</code> — maybe zero runs</li>
  <li><code class="inline">do { … } while (cond);</code> — runs at least ONCE</li>
  <li>Classic <code class="inline">foreach</code> — clean iteration over collections (next chapter)</li>
</ul>
<h2>Loop control</h2>
<ul>
  <li><code class="inline">break</code> — exit now · <code class="inline">continue</code> — skip to next round</li>
  <li>Nested loops common for grids/matrices; label-like patterns via flags</li>
</ul>`,
      seed: { code: 'using System;\n\nclass Program {\n    static void Main() {\n        for (int i = 1; i <= 5; i++) Console.Write(i + " ");\n        Console.WriteLine();\n\n        int n = 1;\n        while (n < 100) n *= 2;\n        Console.WriteLine(n);   // 128\n\n        int k = 5;\n        do { Console.WriteLine("k is now " + k); k--; } while (k > 0);\n    }\n}', lang: "csharp" }
    },
    {
      id: "arrays", title: "Arrays & foreach",
      html: `
<p class="lead"><b>Arrays</b> are fixed-size, index-based containers of one type — the fastest collection for raw storage.</p>
<h2>Basics</h2>
<ul>
  <li><code class="inline">int[] a = new int[5];</code> · <code class="inline">string[] s = { "a", "b" };</code></li>
  <li>Access: <code class="inline">a[0]</code> · length: <code class="inline">a.Length</code></li>
  <li>Multi-d: <code class="inline">int[,] grid = new int[3, 3];</code> · jagged: <code class="inline">int[][]</code></li>
</ul>
<h2>Utilities</h2>
<ul>
  <li><code class="inline">foreach (var x in a)</code> — iterate without indices</li>
  <li><code class="inline">Array.Sort(a), Array.Reverse(a), Array.IndexOf(a, v)</code></li>
  <li>Slicing (C# 8): <code class="inline">a[1..4]</code> · &#96;..&#96; range with &#96;^1&#96; from-end indices</li>
</ul>`,
      seed: { code: 'using System;\n\nclass Program {\n    static void Main() {\n        int[] nums = {40, 10, 30, 20};\n        Array.Sort(nums);\n        foreach (var n in nums) Console.Write(n + " ");  // 10 20 30 40\n\n        string[] names = new string[2];\n        names[0] = "Asha";\n        names[1] = "Ravi";\n        Console.WriteLine("\n" + string.Join(", ", names));\n    }\n}', lang: "csharp" }
    },
    {
      id: "methods", title: "Methods & Overloading",
      html: `
<p class="lead"><b>Methods</b> are reusable logic blocks with inputs (parameters) and an output (return type). Overloading lets the same name handle different inputs.</p>
<h2>Anatomy</h2>
<ul>
  <li><code class="inline">static int Add(int a, int b) { return a + b; }</code></li>
  <li><code class="inline">void</code> = no return · <code class="inline">static</code> = callable without an instance</li>
  <li>Parameters: values, <code class="inline">out</code> extra returns, <code class="inline">ref</code> in-place changes</li>
  <li>Optional args: <code class="inline">void Log(string msg, int level = 1)</code></li>
</ul>
<h2>Overloading</h2>
<ul>
  <li><code class="inline">Add(int, int)</code> vs <code class="inline">Add(double, double)</code> — picked by argument types at compile time</li>
  <li>Expression-bodied members: <code class="inline">static int Sq(int x) =&gt; x * x;</code></li>
</ul>`,
      seed: { code: 'using System;\n\nclass Program {\n    static int Square(int n) => n * n;\n    static int Square(double n) => (int)(n * n);   // overload\n    static void Swap(ref int a, ref int b) { int t = a; a = b; b = t; }\n\n    static void Main() {\n        Console.WriteLine(Square(9));\n        Console.WriteLine(Square(4.5));\n\n        int x = 1, y = 2;\n        Swap(ref x, ref y);\n        Console.WriteLine($"{x},{y}");   // 2,1\n    }\n}', lang: "csharp" }
    },
    {
      id: "classes", title: "Classes, Objects & Constructors",
      html: `
<p class="lead">C# is object-oriented: <b>classes</b> are blueprints; <b>objects</b> are their instances; <b>constructors</b> initialize them.</p>
<h2>Core</h2>
<ul>
  <li><code class="inline">class Player { public string Name; }</code></li>
  <li><code class="inline">var p = new Player(); p.Name = "Shadow";</code></li>
  <li>Constructor: same name as class, no return type, auto-called by <code class="inline">new</code></li>
  <li>Multiple constructors = constructor overloading; use <code class="inline">: this(...)</code> to chain</li>
  <li><code class="inline">this</code> — the current instance</li>
</ul>
<h2>Static vs instance</h2>
<ul>
  <li><code class="inline">static</code> members belong to the class itself (<code class="inline">Math.Max</code>), instances share them</li>
  <li>Object initializers: <code class="inline">new Player { Name = "Shadow" }</code></li>
</ul>`,
      seed: { code: 'using System;\n\nclass Player {\n    public string Name;\n    public int Power;\n    public static int Count;\n\n    public Player(string n, int p) {\n        Name = n; Power = p; Count++;\n    }\n    public string Intro() => $"{Name} ⚡ {Power}";\n}\n\nclass Program {\n    static void Main() {\n        var a = new Player("Shadow", 99);\n        var b = new Player("Asha", 85);\n        Console.WriteLine(a.Intro());\n        Console.WriteLine("Players: " + Player.Count);\n    }\n}', lang: "csharp" }
    },
    {
      id: "properties", title: "Properties & Access Modifiers",
      html: `
<p class="lead"><b>Properties</b> encapsulate fields with getter/setter logic — C#'s elegant answer to getX()/setX() methods.</p>
<h2>Forms</h2>
<ul>
  <li>Auto: <code class="inline">public string Name { get; set; }</code></li>
  <li>Read-only: <code class="inline">{ get; }</code> · private-write: <code class="inline">{ get; private set; }</code></li>
  <li>Full: <code class="inline">set { if (value &gt;= 0) _hp = value; }</code> — validation on writes</li>
  <li>Init-only (C# 9): <code class="inline">{ get; init; }</code> — set once during creation</li>
</ul>
<h2>Access modifiers</h2>
<ul>
  <li><code class="inline">public</code> everywhere · <code class="inline">private</code> inside class only (default)</li>
  <li><code class="inline">protected</code> class + subclasses · <code class="inline">internal</code> same assembly</li>
</ul>`,
      seed: { code: 'using System;\n\nclass Account {\n    public int Id { get; init; }\n    public string Owner { get; private set; }\n    private decimal balance;\n\n    public Account(string o) { Owner = o; }\n\n    public decimal Balance {\n        get => balance;\n        set {\n            if (value < 0) throw new ArgumentException("Negative nahi!");\n            balance = value;\n        }\n    }\n}', lang: "csharp" }
    },
    {
      id: "records", title: "Records & Structs",
      html: `
<p class="lead"><b>Records</b> are compact, value-compared, immutable-by-default data carriers — ideal for DTOs and API models.</p>
<h2>Records vs classes</h2>
<ul>
  <li><code class="inline">record Point(int X, int Y);</code> — a full type in one line!</li>
  <li>Value equality: two records with same data are EQUAL (classes compare references)</li>
  <li>Non-destructive copy: <code class="inline">var p2 = p1 with { X = 5 };</code></li>
</ul>
<h2>Structs</h2>
<ul>
  <li><code class="inline">struct</code> = value type (stack-copied), classes are reference types</li>
  <li>Use structs for small immutable data (Point, Color); classes for objects with identity</li>
</ul>`,
      seed: { code: 'using System;\n\nrecord Player(string Name, int Power);\n\nstruct Size { public int W, H; }\n\nclass Program {\n    static void Main() {\n        var p1 = new Player("Shadow", 99);\n        var p2 = p1 with { Power = 100 };\n        Console.WriteLine(p1);   // Player { Name = Shadow, Power = 99 }\n        Console.WriteLine(p2);\n\n        var s = new Size { W = 10, H = 20 };\n        Console.WriteLine(s.W * s.H);\n    }\n}', lang: "csharp" }
    },
    {
      id: "inheritance", title: "Inheritance & Polymorphism",
      html: `
<p class="lead"><b>Inheritance</b> lets a class reuse another's members; <b>polymorphism</b> lets child behavior override the parent's at runtime.</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">class Dog : Animal</code> — single inheritance only (C# rule)</li>
  <li><code class="inline">base.Method()</code> — call parent version explicitly</li>
  <li><code class="inline">virtual</code> (parent) + <code class="inline">override</code> (child) — opt-in replacement</li>
  <li><code class="inline">sealed class</code> — forbid inheritance entirely</li>
</ul>
<h2>Polymorphism</h2>
<ul>
  <li>Parent reference, child object: <code class="inline">Animal a = new Dog();</code></li>
  <li>Virtual calls dispatch to the CHILD's override automatically</li>
  <li><code class="inline">is</code> / <code class="inline">as</code> — type tests and safe casts</li>
</ul>`,
      seed: { code: 'using System;\n\nclass Hero {\n    public virtual string Intro() => "Hero";\n}\n\nclass NeonHero : Hero {\n    public override string Intro() => "⚡ NEON Hero";\n}\n\nclass Program {\n    static void Main() {\n        Hero h = new NeonHero();\n        Console.WriteLine(h.Intro());          // ⚡ NEON Hero — polymorphism!\n    }\n}', lang: "csharp" }
    },
    {
      id: "interfaces", title: "Abstract Classes & Interfaces",
      html: `
<p class="lead"><b>Abstract classes</b> mix implemented + abstract members; <b>interfaces</b> are pure contracts. How to pick? Abstract = "is-a base"; interface = "can-do capability".</p>
<h2>Abstract class</h2>
<ul>
  <li><code class="inline">abstract class Shape { abstract double Area(); }</code> — cannot instantiate</li>
  <li>Can hold fields, constructors and implemented methods</li>
</ul>
<h2>Interface</h2>
<ul>
  <li><code class="inline">interface IPlayable { void Play(); }</code> — members implicitly public</li>
  <li>A class implements MANY interfaces: <code class="inline">class Game : IPlayable, ISaveable</code></li>
  <li>Default interface methods (C# 8+) allow fallback implementations</li>
</ul>`,
      seed: { code: 'using System;\n\ninterface IShape { double Area(); }\n\nabstract class Shape {\n    public abstract double Area();\n    public void Print() => Console.WriteLine(Area());\n}\n\nclass Circle : Shape, IComparable<Circle> {\n    public double R;\n    public override double Area() => Math.PI * R * R;\n    public int CompareTo(Circle? other) => R.CompareTo(other?.R);\n}', lang: "csharp" }
    },
    {
      id: "enums", title: "Enums",
      html: `
<p class="lead"><b>Enums</b> give friendly names to numbered constants — statuses, directions, levels.</p>
<h2>Basics</h2>
<ul>
  <li><code class="inline">enum Level { Low = 1, Medium = 5, High = 10 }</code></li>
  <li>Auto-increment from 0 if not set: <code class="inline">enum Day { Mon, Tue, Wed }</code></li>
  <li>Convert: <code class="inline">(Level)5</code> → Medium · <code class="inline">l.ToString()</code> → name</li>
  <li><code class="inline">Enum.Parse(typeof(Level), "High")</code> · <code class="inline">Enum.GetValues&lt;Level&gt;()</code></li>
</ul>
<h2>Flags</h2>
<ul>
  <li><code class="inline">[Flags]</code> + powers of two → combine options: <code class="inline">Read | Write</code></li>
</ul>`,
      seed: { code: 'using System;\n\nenum Level { Beginner = 1, Pro = 2, Neon = 99 }\n\nclass Program {\n    static void Main() {\n        var l = Level.Pro;\n        Console.WriteLine(l);                // Pro\n        Console.WriteLine((int)Level.Neon);  // 99\n\n        var label = l switch {\n            Level.Beginner => "Start here",\n            Level.Pro => "Advanced",\n            _ => "Ultimate"\n        };\n        Console.WriteLine(label);\n    }\n}', lang: "csharp" }
    },
    {
      id: "exceptions", title: "Exception Handling",
      html: `
<p class="lead"><b>Exceptions</b> signal runtime errors — handle them so apps degrade gracefully instead of crashing.</p>
<h2>try / catch / finally</h2>
<ul>
  <li><code class="inline">try { … } catch (FormatException e) { … } finally { … }</code></li>
  <li>Catch specific first, generic last; <code class="inline">finally</code> always runs (cleanup)</li>
  <li><code class="inline">throw new ArgumentException("msg");</code> — raise your own</li>
  <li><code class="inline">using</code> statements dispose resources automatically</li>
</ul>
<h2>Best practices</h2>
<ul>
  <li>Never catch and ignore silently — log at minimum</li>
  <li>Prefer TryParse/TryGetValue patterns for EXPECTED failures</li>
</ul>`,
      seed: { code: 'using System;\n\nclass Program {\n    static int ParseAge(string s) {\n        if (!int.TryParse(s, out int a))\n            throw new FormatException("Age must be a number!");\n        if (a < 0) throw new ArgumentException("Negative impossible");\n        return a;\n    }\n\n    static void Main() {\n        try {\n            ParseAge("xyz");\n        } catch (FormatException fe) {\n            Console.WriteLine("Format: " + fe.Message);\n        } finally {\n            Console.WriteLine("cleanup always runs");\n        }\n    }\n}', lang: "csharp" }
    },
    {
      id: "collections-linq", title: "Collections & LINQ",
      html: `
<p class="lead">Beyond arrays: <code class="inline">List&lt;T&gt;</code>, <code class="inline">Dictionary</code>, <code class="inline">Queue</code>, <code class="inline">Stack</code> — plus <b>LINQ</b>, SQL-like querying over any collection.</p>
<h2>Collections</h2>
<ul>
  <li><code class="inline">List&lt;string&gt; names = new() { "Asha" };</code> — Add/Remove/Count/Sort</li>
  <li><code class="inline">Dictionary&lt;string,int&gt; d = new();</code> — d["hp"] = 100; keys unique</li>
  <li>Queue = FIFO (Enqueue/Dequeue) · Stack = LIFO (Push/Pop)</li>
</ul>
<h2>LINQ</h2>
<ul>
  <li><code class="inline">nums.Where(x =&gt; x &gt; 5).Select(x =&gt; x * 2).ToList()</code></li>
  <li><code class="inline">OrderByDescending, GroupBy, Any, All, FirstOrDefault, Sum, Count, Skip/Take</code></li>
  <li>Query syntax mirrors SQL: <code class="inline">from n in nums where n &gt; 5 select n</code></li>
  <li>LAMBDA syntax is what .NET pros write daily</li>
</ul>`,
      seed: { code: 'using System;\nusing System.Linq;\nusing System.Collections.Generic;\n\nclass Program {\n    static void Main() {\n        var scores = new List<int> { 90, 45, 78, 92, 61, 33 };\n\n        var toppers = scores\n            .Where(s => s >= 60)\n            .OrderByDescending(s => s)\n            .ToList();\n\n        Console.WriteLine(string.Join(", ", toppers));\n        Console.WriteLine($"avg: {scores.Average():0.0}, max: {scores.Max()}");\n        Console.WriteLine(scores.Any(s => s == 100));\n    }\n}', lang: "csharp" }
    },
    {
      id: "async", title: "Async/Await & Ecosystem",
      html: `
<p class="lead"><b>async / await</b> keeps apps responsive — the C# gold standard for I/O (network, files, DB).</p>
<h2>Pattern</h2>
<ul>
  <li><code class="inline">static async Task Main()</code> · inside: <code class="inline">await Task.Delay(500);</code></li>
  <li>Return types: <code class="inline">Task</code> (no value) · <code class="inline">Task&lt;T&gt;</code> (with value)</li>
  <li>async does NOT create threads — it frees the thread while waiting</li>
  <li>HTTP: <code class="inline">var s = await client.GetStringAsync(url);</code></li>
</ul>
<h2>Danger zones</h2>
<ul>
  <li>Never <code class="inline">.Result</code> / <code class="inline">.Wait()</code> on UI threads (deadlock)</li>
  <li>async void only for event handlers</li>
</ul>`,
      seed: { code: 'using System;\nusing System.Net.Http;\nusing System.Threading.Tasks;\n\nclass Program {\n    static async Task Main() {\n        var task1 = Task.Delay(1000).ContinueWith(_ => "slow task");\n        var task2 = Task.FromResult("instant");\n\n        var results = await Task.WhenAll(task1, task2);\n        Console.WriteLine(string.Join(", ", results));\n\n        using var http = new HttpClient();\n        var html = await http.GetStringAsync("https://example.com");\n        Console.WriteLine(html.Length + " chars");\n    }\n}', lang: "csharp" }
    },
    {
      id: "wrapup", title: "C# Summary & Next Steps",
      html: `
<p class="lead">C# course complete — from Hello World to async LINQ. Here is your graduation map.</p>
<h2>You can now</h2>
<ul>
  <li>✔ Types, casting, operators, strings — the core language</li>
  <li>✔ Logic: if/else, modern switch, all four loops</li>
  <li>✔ Arrays, collections and querying with LINQ</li>
  <li>✔ OOP: classes, constructors, properties, records, inheritance, interfaces, enums</li>
  <li>✔ Exceptions and async/await — pro-level robustness</li>
</ul>
<h2>Next steps</h2>
<ul>
  <li>🎮 Game dev → Unity (C# scripts)</li>
  <li>🌐 Web APIs → ASP.NET Core course (11 chapters waiting!)</li>
  <li>🗃️ Databases → SQL course + Entity Framework</li>
</ul>`,
      seed: { code: 'Console.WriteLine("C# complete ✔ — 23/23 chapters!");', lang: "csharp" }
    }
  ]
};
