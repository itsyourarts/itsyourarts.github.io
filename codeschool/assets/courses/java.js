/* GodxShadow course: Java — start se end tak */
COURSES.java = {
  name: "Java", color: "#ff7a45", icon: "Jv", blurb: "Write once, run anywhere — Android, backend, enterprise ka raja.",
  lessons: [
    {
      id: "intro", title: "Java Introduction",
      html: `
<p class="lead"><b>Java</b> is the battle-tested, verbose-but-reliable language behind Android, banking systems and enterprise backends. Write once, run anywhere (JVM).</p>
<h2>Key facts</h2>
<ul>
  <li>Compiled to <b>bytecode</b> for the JVM — any platform runs the same program</li>
  <li>Everything lives in classes; files match class names (<code class="inline">Main.java</code>)</li>
  <li>Strongly typed, garbage collected, huge ecosystem (Spring, Android)</li>
  <li>Compile: <code class="inline">javac Main.java</code> · Run: <code class="inline">java Main</code></li>
</ul>`,
      seed: { code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n        int a = 5, b = 3;\n        System.out.println("Sum = " + (a + b));\n    }\n}', lang: "java" }
    },
    {
      id: "vars-types", title: "Variables & Types",
      html: `
<p class="lead"><b>Variables</b> in Java must declare a type before use — the compiler guards types strictly.</p>
<h2>Declarations</h2>
<ul>
  <li><code class="inline">int age = 21; double pi = 3.14; boolean ok = true;</code></li>
  <li><code class="inline">char c = 'A'; String name = "Ravi";</code></li>
  <li><code class="inline">final double TAX = 0.18;</code> — constant</li>
  <li><code class="inline">var x = 10;</code> (Java 10+) — compiler detects the type</li>
  <li>Primitive vs Reference: primitives hold values; reference types (String, arrays, classes) point to objects</li>
</ul>`,
      seed: { code: 'public class Main {\n    public static void main(String[] args) {\n        int age = 21;\n        double pi = 3.14159;\n        boolean neon = true;\n        String name = "Shadow";\n        var level = 99;   // Java 10+\n        System.out.println(name + " " + age + " " + level);\n    }\n}', lang: "java" }
    },
    {
      id: "control", title: "Conditions & Loops",
      html: `
<p class="lead">Branches and loops — same-family syntax as C/C++, clean semantics.</p>
<h2>Decisions</h2>
<ul>
  <li><code class="inline">if (score &gt;= 90) {…} else if (…)} else {…}</code></li>
  <li><code class="inline">switch (day) { case 1 -&gt; "Mon"; default -&gt; "?"; }</code> (arrow switch, Java 14+)</li>
  <li>Ternary: <code class="inline">(age &gt;= 18) ? "adult" : "minor"</code></li>
</ul>
<h2>Loops</h2>
<ul>
  <li><code class="inline">for (int i = 0; i &lt; n; i++)</code> · enhanced: <code class="inline">for (String s : list)</code></li>
  <li><code class="inline">while (cond)</code> · <code class="inline">do {…} while (cond)</code> — runs once minimum</li>
  <li><code class="inline">break</code> / <code class="inline">continue</code> · labelled breaks for nested loops</li>
</ul>`,
      seed: { code: 'public class Main {\n    public static void main(String[] args) {\n        int[] nums = {1, 2, 3, 4, 5};\n        for (int n : nums) {\n            String tag = switch (n) {\n                case 1 -> "first";\n                case 2, 3 -> "small";\n                default -> "big";\n            };\n            System.out.println(n + " = " + tag);\n        }\n    }\n}', lang: "java" }
    },
    {
      id: "methods", title: "Methods",
      html: `
<p class="lead"><b>Methods</b> = class-contained functions with access modifiers, return types and parameters. Overloading = same name, different parameters.</p>
<h2>Anatomy</h2>
<ul>
  <li><code class="inline">public static int add(int a, int b) { return a + b; }</code></li>
  <li><code class="inline">public</code> visibility · <code class="inline">static</code> no instance needed · <code class="inline">int</code> return type</li>
  <li><code class="inline">void</code> — returns nothing; use <code class="inline">return;</code> to exit early</li>
</ul>
<h2>Extras</h2>
<ul>
  <li>Overloading: <code class="inline">add(int, int)</code> vs <code class="inline">add(double, double)</code></li>
  <li>Varargs: <code class="inline">sum(int... nums)</code> — any number of args (an array inside)</li>
  <li>Pass-by-value: primitives copy; objects pass reference copy (same object!)</li>
</ul>`,
      seed: { code: 'public class Main {\n    static int square(int n) { return n * n; }\n    static int sum(int... xs) {\n        int t = 0;\n        for (int x : xs) t += x;\n        return t;\n    }\n    public static void main(String[] args) {\n        System.out.println(square(9));       // 81\n        System.out.println(sum(1, 2, 3, 4)); // 10\n    }\n}', lang: "java" }
    },
    {
      id: "arrays-collections", title: "Arrays & ArrayList",
      html: `
<p class="lead">Arrays are fixed-size; <b>ArrayList</b> grows. Both index-based; generics make collections type-safe.</p>
<h2>Arrays</h2>
<ul>
  <li><code class="inline">int[] a = new int[5];</code> · <code class="inline">String[] s = {"a","b"};</code></li>
  <li><code class="inline">a.length</code> (field!) · 2D: <code class="inline">int[][] grid</code></li>
  <li><code class="inline">Arrays.sort(a), Arrays.toString(a)</code></li>
</ul>
<h2>ArrayList</h2>
<ul>
  <li><code class="inline">List&lt;String&gt; l = new ArrayList&lt;&gt;();</code> — add/get/remove/size</li>
  <li>Generics mandatory: <code class="inline">ArrayList&lt;Integer&gt;</code> (not int!)</li>
  <li>Autoboxing converts int ↔ Integer automatically</li>
</ul>`,
      seed: { code: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        ArrayList<String> skills = new ArrayList<>();\n        skills.add("HTML");\n        skills.add("CSS");\n        skills.add("JS");\n        Collections.sort(skills);\n        HashMap<String, Integer> score = new HashMap<>();\n        score.put("shadow", 99);\n        System.out.println(skills + " " + score);\n    }\n}', lang: "java" }
    },
    {
      id: "oop", title: "Classes & OOP",
      html: `
<p class="lead">Java is pure OOP — classes as blueprints, objects as instances, constructors as initializers.</p>
<h2>Core</h2>
<ul>
  <li><code class="inline">class Player { String name; int hp; }</code></li>
  <li><code class="inline">Player p = new Player();</code> — new allocates on heap</li>
  <li>Constructor: <code class="inline">Player(String n) { name = n; }</code> — called by new</li>
  <li><code class="inline">this.name = name;</code> — disambiguate fields vs parameters</li>
</ul>
<h2>Pillars</h2>
<ul>
  <li><b>Encapsulation</b>: private fields + public getters/setters</li>
  <li><b>Inheritance</b>: extends (single) · <b>Abstraction</b>: interfaces/abstract</li>
  <li><b>Polymorphism</b>: override at runtime</li>
</ul>`,
      seed: { code: 'class Hero {\n    private String name;\n    private int power;\n\n    public Hero(String name, int power) {\n        this.name = name;\n        this.power = power;\n    }\n    public String intro() { return name + " ⚡ " + power; }\n}\n\nclass NeonHero extends Hero {\n    public NeonHero(String name) { super(name, 9000); }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Hero h = new NeonHero("Shadow");\n        System.out.println(h.intro());\n    }\n}', lang: "java" }
    },
    {
      id: "exceptions-fileio", title: "Exceptions & Files",
      html: `
<p class="lead">Java distinguishes checked and unchecked exceptions — and forces you to declare or handle the checked ones. File I/O completes the daily toolkit.</p>
<h2>Exceptions</h2>
<ul>
  <li><b>Checked</b> (must handle): IOException, SQLException</li>
  <li><b>Unchecked</b>: NullPointerException, ArrayIndexOutOfBounds — logic bugs</li>
  <li><code class="inline">try {…} catch (IOException e) {…} finally {…}</code></li>
  <li><code class="inline">throw new IllegalArgumentException("bad!");</code> · <code class="inline">throws</code> on method signature</li>
  <li>try-with-resources: <code class="inline">try (Scanner sc = new Scanner(file)) {…}</code> — auto-closes</li>
</ul>
<h2>Files</h2>
<ul>
  <li><code class="inline">Files.readString(path)</code> / <code class="inline">Files.writeString(path, text)</code> — modern one-liners</li>
  <li>Scanner / BufferedReader for line-by-line streaming</li>
</ul>`,
      seed: { code: 'import java.nio.file.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        try {\n            Files.writeString(Path.of("note.txt"), "neon!");\n            String s = Files.readString(Path.of("note.txt"));\n            System.out.println("Read: " + s);\n        } catch (Exception e) {\n            System.out.println("Error: " + e.getMessage());\n        }\n    }\n}', lang: "java" }
    },
    {
      id: "eco", title: "Streams, Threads & Ecosystem",
      html: `
<p class="lead">Beyond the language: Streams API (functional data pipelines), Threads (concurrency) and the giant ecosystem.</p>
<h2>Streams API</h2>
<ul>
  <li><code class="inline">list.stream().filter(s -&gt; s.startsWith("a")).map(String::toUpperCase).toList()</code></li>
  <li>Declarative, lazily-evaluated, parallel-capable (<code class="inline">parallelStream()</code>)</li>
  <li><code class="inline">reduce, collect, groupingBy, counting</code> — report-style queries in Java!</li>
</ul>
<h2>Threads & Ecosystem</h2>
<ul>
  <li><code class="inline">new Thread(() -&gt; task()).start();</code> — parallel work</li>
  <li>Maven/Gradle (build), Spring Boot (web), JUnit (tests), Hibernate (ORM)</li>
</ul>`,
      seed: { code: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<Integer> prices = List.of(120, 340, 55, 900);\n        var big = prices.stream()\n            .filter(p -> p > 100)\n            .map(p -> p * 2)\n            .toList();\n        System.out.println(big);   // [240, 680, 1800]\n    }\n}', lang: "java" }
    },
    {
      id: "syntax", title: "Syntax & main() Method",
      html: `
<p class="lead">Java syntax is explicit: every statement in a class, semicolons everywhere, the <code class="inline">main</code> method as the entry.</p>
<h2>Anatomy</h2>
<ul>
  <li><code class="inline">public class Main</code> — must match the filename</li>
  <li><code class="inline">public static void main(String[] args)</code> — entry point signature</li>
  <li><code class="inline">System.out.println()</code> — print with newline</li>
  <li>Case-sensitive; blocks use <code class="inline">{ }</code>; <code class="inline">// comment</code>, <code class="inline">/* block */</code></li>
</ul>`,
      seed: { code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n        int x = 5 + 3;\n        System.out.println("Sum: " + x);\n    }\n}', lang: "java" }
    },
    {
      id: "casting", title: "Casting (Widening & Narrowing)",
      html: `
<p class="lead">Type conversion — widening automatic, narrowing manual with parentheses.</p>
<h2>The two directions</h2>
<ul>
  <li><b>Widening</b> (auto, safe): byte → short → int → long → float → double</li>
  <li><b>Narrowing</b> (manual, risks data loss): <code class="inline">(int) 9.99</code> = 9</li>
  <li><code class="inline">Integer.parseInt("42")</code> — String → int</li>
  <li><code class="inline">String.valueOf(42)</code> or <code class="inline">"" + 42</code> — number → String</li>
</ul>`,
      seed: { code: 'int a = 100;\ndouble d = a;              // widening (auto)\nSystem.out.println(d);     // 100.0\n\ndouble p = 9.78;\nint q = (int) p;           // narrowing (manual)\nSystem.out.println(q);     // 9\n\nString s = "42";\nint n = Integer.parseInt(s);\nSystem.out.println(n * 2); // 84', lang: "java" }
    },
    {
      id: "operators", title: "Operators & Math Class",
      html: `
<p class="lead">Arithmetic, comparison, ternary plus the <code class="inline">Math</code> library.</p>
<h2>List</h2>
<ul>
  <li><code class="inline">+, -, *, /, %, ++, --</code> — int/int = int again (17/5 = 3)</li>
  <li>Comparison: <code class="inline">==, !=, &lt;, &gt;, &lt;=, &gt;=</code> for primitives</li>
  <li>Strings: <code class="inline">a.equals(b)</code> — NEVER ==</li>
  <li>Ternary: <code class="inline">(x &gt; 10) ? "big" : "small"</code></li>
  <li><code class="inline">Math.max(), abs(), sqrt(), pow(), random()</code></li>
</ul>`,
      seed: { code: 'int a = 17, b = 5;\nSystem.out.println(a / b);          // 3 (int div!)\nSystem.out.println(a % b);          // 2\nSystem.out.println((double) a / b); // 3.4\n\nString res = (a > 10) ? "bada" : "chhota";\nSystem.out.println(res);\nSystem.out.println(Math.max(a, b));  // 17\nSystem.out.println(Math.sqrt(49));   // 7.0', lang: "java" }
    },
    {
      id: "strings", title: "String Methods (Deep)",
      html: `
<p class="lead">Java Strings are immutable — every "change" creates a new string. Learn the method set daily-devs use.</p>
<h2>Daily methods</h2>
<ul>
  <li><code class="inline">length(), charAt(i), indexOf("a"), substring(a, b)</code></li>
  <li><code class="inline">toUpperCase(), toLowerCase(), trim(), strip()</code></li>
  <li><code class="inline">concat(), +</code> (string builder behind the scenes)</li>
  <li><code class="inline">replace(), replaceAll() (regex!), contains()</code></li>
  <li><code class="inline">split(",")</code> → String[] · <code class="inline">String.join(", ", parts)</code></li>
  <li><code class="inline">StringBuilder</code> — fast builds in loops (mutable!)</li>
</ul>`,
      seed: { code: 'String s = "  GodxShadow Rocks  ";\nSystem.out.println(s.trim());\nSystem.out.println(s.trim().toUpperCase());\nSystem.out.println(s.indexOf("Shadow"));   // 7\nSystem.out.println(s.contains("Rocks"));    // true\nSystem.out.println(s.trim().substring(0, 4)); // Godx\n\nString joined = String.join(", ", "HTML", "CSS", "JS");\nSystem.out.println(joined);', lang: "java" }
    },
    {
      id: "inheritance", title: "Inheritance (extends)",
      html: `
<p class="lead">One class inherits another's fields/methods with <code class="inline">extends</code> — classic "is-a" relationships.</p>
<h2>Keywords</h2>
<ul>
  <li><code class="inline">class Car extends Vehicle</code></li>
  <li><code class="inline">super()</code> — call parent's constructor · <code class="inline">super.method()</code> — parent's method</li>
  <li><code class="inline">@Override</code> — mark an overridden method (compile-time check)</li>
  <li>Java gives single class inheritance only — multiple via interfaces</li>
  <li><code class="inline">final class</code> cannot be extended</li>
</ul>`,
      seed: { code: 'class Vehicle {\n    void start() { System.out.println("Engine on..."); }\n}\nclass Car extends Vehicle {\n    @Override\n    void start() {\n        super.start();\n        System.out.println("Car ready!");\n    }\n}\n\nCar c = new Car();\nc.start();', lang: "java" }
    },
    {
      id: "polymorphism", title: "Polymorphism & Method Overriding",
      html: `
<p class="lead">Same method call, different behaviour decided at runtime — polymorphism is why interfaces power frameworks.</p>
<h2>Two forms</h2>
<ul>
  <li><b>Overloading</b> — same name, different params (compile time)</li>
  <li><b>Overriding</b> — child replaces parent's implementation (runtime)</li>
  <li>Parent type, child object: <code class="inline">Animal a = new Dog(); a.speak();</code> → Dog's version</li>
  <li><code class="inline">instanceof</code> — check before casting</li>
</ul>`,
      seed: { code: 'class Shape {\n    void draw() { System.out.println("Drawing shape"); }\n}\nclass Circle extends Shape {\n    void draw() { System.out.println("O circle"); }\n}\nclass Square extends Shape {\n    void draw() { System.out.println("[] square"); }\n}\n\nShape[] shapes = { new Circle(), new Square() };\nfor (Shape s : shapes) s.draw();   // runtime polymorphism', lang: "java" }
    },
    {
      id: "interfaces", title: "Interface vs Abstract Class",
      html: `
<p class="lead">Interfaces = pure contracts; abstract classes = shared base implementation + contract. Pick carefully.</p>
<h2>Difference</h2>
<ul>
  <li><b>Interface</b> — all methods abstract (default/static allowed since Java 8), a class <code class="inline">implements</code> MANY</li>
  <li><b>Abstract class</b> — fields, constructors, partial implementation; single <code class="inline">extends</code></li>
  <li>Rule: "can do" capability → interface (Comparable, Runnable); "is a kind of" → abstract class</li>
</ul>`,
      seed: { code: 'interface Playable {\n    void play();\n    default void info() { System.out.println("I am playable"); }\n}\nclass Game implements Playable {\n    public void play() { System.out.println("Game started!"); }\n}\n\nPlayable p = new Game();\np.info();\np.play();', lang: "java" }
    },
    {
      id: "arraylist-hashmap", title: "ArrayList & HashMap",
      html: `
<p class="lead">The two workhorse collections — dynamic lists and key-value maps.</p>
<h2>ArrayList</h2>
<ul>
  <li><code class="inline">List&lt;String&gt; langs = new ArrayList&lt;&gt;();</code> — add/get(i)/remove/size</li>
  <li><code class="inline">Collections.sort(langs)</code> or <code class="inline">langs.sort(null)</code></li>
  <li>Iterate with enhanced for or <code class="inline">forEach(x -&gt; …)</code></li>
</ul>
<h2>HashMap</h2>
<ul>
  <li><code class="inline">Map&lt;String,Integer&gt; scores = new HashMap&lt;&gt;();</code> — put/get/remove</li>
  <li><code class="inline">putIfAbsent, getOrDefault(key, 0)</code> — everyday idioms</li>
  <li>Loop: <code class="inline">for (var e : map.entrySet())</code></li>
</ul>`,
      seed: { code: 'import java.util.*;\n\nArrayList<String> langs = new ArrayList<>();\nlangs.add("Java"); langs.add("C#"); langs.add("Rust");\nlangs.sort(null);\nSystem.out.println(langs);          // [C#, Java, Rust]\n\nHashMap<String, Integer> scores = new HashMap<>();\nscores.put("Ravi", 95);\nscores.put("Asha", 88);\nSystem.out.println(scores.get("Asha"));   // 88\nSystem.out.println(scores.size());        // 2', lang: "java" }
    },
    {
      id: "numbers", title: "Number Types & Math",
      html: `<p class="lead">Java's numeric types, the Math toolbox, and parsing user input safely.</p>
<h2>Key points</h2>
<ul>
  <li><code class="inline">byte, short, int, long</code> (append <code class="inline">L</code>) - <code class="inline">float</code> (append <code class="inline">f</code>) - <code class="inline">double</code></li>
  <li><code class="inline">Integer.parseInt("42")</code> - <code class="inline">Double.parseDouble("9.5")</code></li>
  <li><code class="inline">Math.max, Math.abs, Math.sqrt, Math.pow, Math.round, Math.random()</code></li>
  <li>Integer limits: <code class="inline">Integer.MAX_VALUE</code> - overflow silently wraps!</li>
</ul>`,
      seed: { code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println(Math.pow(2, 10));\n        System.out.println(Math.sqrt(144));\n        System.out.println(Math.round(9.7));\n        int n = Integer.parseInt("123");\n        System.out.println(n + 1);\n    }\n}', lang: "java" }
    },
    {
      id: "generics", title: "Generics - Type-Safe Code",
      html: `<p class="lead">Generics let classes and methods work with any type - checked by the compiler.</p>
<h2>Usage</h2>
<ul>
  <li>Method: <code class="inline">&lt;T&gt; T first(List&lt;T&gt; l) { return l.get(0); }</code></li>
  <li>Class: <code class="inline">class Box&lt;T&gt; { T item; }</code></li>
  <li>Bounded: <code class="inline">&lt;T extends Number&gt;</code> - only Number subtypes</li>
  <li>Wildcards: <code class="inline">List&lt;?&gt;</code> - unknown element type</li>
</ul>`,
      seed: { code: 'public class Main {\n    static <T> T first(T[] a) { return a[0]; }\n    static int sum(Number... ns) {\n        int t = 0; for (Number n : ns) t += n.intValue(); return t;\n    }\n    public static void main(String[] args) {\n        System.out.println(first(new String[]{"a","b"}));\n        System.out.println(sum(1, 2, 3));\n    }\n}', lang: "java" }
    },
    {
      id: "annotations", title: "Annotations - Markers for Tools",
      html: `<p class="lead">Annotations are metadata tags: <code class="inline">@Override</code>, <code class="inline">@Deprecated</code>, <code class="inline">@SuppressWarnings</code> - they guide compilers and IDEs.</p>
<h2>Common ones</h2>
<ul>
  <li><code class="inline">@Override</code> - compiler verifies the method actually overrides</li>
  <li><code class="inline">@Deprecated</code> - warns callers to stop using it</li>
  <li><code class="inline">@SuppressWarnings("unchecked")</code> - silence a specific warning</li>
  <li>Custom: <code class="inline">@interface TaskType</code> - used by frameworks (Spring, JUnit)</li>
</ul>`,
      seed: { code: '@Deprecated\nclass OldApi { void legacy() {} }\nclass Shape { void draw() { System.out.println("draw"); } }\nclass Circle extends Shape {\n    @Override\n    void draw() { System.out.println("circle"); }\n}\npublic class Main {\n    public static void main(String[] args) {\n        new Circle().draw();\n    }\n}', lang: "java" }
    },
    {
      id: "collections-deep", title: "Collections Framework (Deep)",
      html: `<p class="lead">The java.util collection hierarchy: List, Set, Map plus the Collections utility class.</p>
<h2>Essentials</h2>
<ul>
  <li>Interface vs implementation: use <code class="inline">List</code>, not <code class="inline">ArrayList</code>, in parameters</li>
  <li><code class="inline">Collections.sort(list, Comparator)</code> - custom ordering</li>
  <li><code class="inline">Collections.binarySearch(list, key)</code> - sorted lists only</li>
  <li><code class="inline">TreeSet</code> = sorted set - <code class="inline">LinkedHashMap</code> = insertion order</li>
</ul>`,
      seed: { code: 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        List<String> langs = new ArrayList<>();\n        langs.add("python"); langs.add("java"); langs.add("go");\n        Collections.sort(langs, Collections.reverseOrder());\n        System.out.println(langs);\n        TreeSet<Integer> unique = new TreeSet<>();\n        unique.add(5); unique.add(2); unique.add(5);\n        System.out.println(unique);\n    }\n}', lang: "java" }
    },
    {
      id: "exceptions-deep", title: "Custom Exceptions",
      html: `<p class="lead">Create your own exception types when domain rules need formal error handling.</p>
<h2>How</h2>
<ul>
  <li>Extend <code class="inline">Exception</code> (checked) or <code class="inline">RuntimeException</code> (unchecked)</li>
  <li>Constructors: message, cause, or both</li>
  <li><code class="inline">e.getMessage()</code>, <code class="inline">e.getCause()</code>, stack trace with <code class="inline">printStackTrace()</code></li>
</ul>`,
      seed: { code: 'class LowBalanceException extends Exception {\n    LowBalanceException(String m) { super(m); }\n}\npublic class Main {\n    static void withdraw(int bal, int amt) throws LowBalanceException {\n        if (amt > bal) throw new LowBalanceException("Not enough funds");\n        System.out.println("Balance: " + (bal - amt));\n    }\n    public static void main(String[] args) {\n        try { withdraw(100, 500); }\n        catch (LowBalanceException e) { System.out.println("Error: " + e.getMessage()); }\n    }\n}', lang: "java" }
    },
    {
      id: "datetime", title: "DateTime (java.time)",
      html: `<p class="lead">The modern date-time API (Java 8+): LocalDate, LocalTime, LocalDateTime - immutable and thread-safe.</p>
<h2>Daily use</h2>
<ul>
  <li><code class="inline">LocalDate.now()</code> - <code class="inline">LocalDateTime.now()</code></li>
  <li>Format: <code class="inline">DateTimeFormatter.ofPattern("dd MMM yyyy")</code></li>
  <li>Math: <code class="inline">plusDays(30)</code> - compare with <code class="inline">isBefore / isAfter</code></li>
  <li>Durations: <code class="inline">Duration.between(a, b)</code></li>
</ul>`,
      seed: { code: 'import java.time.*;\npublic class Main {\n    public static void main(String[] args) {\n        LocalDate today = LocalDate.now();\n        System.out.println(today.format(DateTimeFormatter.ofPattern("dd MMM yyyy")));\n        LocalDate nextMonth = today.plusMonths(1);\n        System.out.println(nextMonth);\n        System.out.println(today.isBefore(nextMonth));\n    }\n}', lang: "java" }
    },
    {
      id: "static-inner", title: "Static Members & Inner Classes",
      html: `<p class="lead"><code class="inline">static</code> members belong to the class itself; inner classes encapsulate helpers that need the outer instance.</p>
<h2>Points</h2>
<ul>
  <li><code class="inline">static</code> fields/methods - no object needed, shared by all instances</li>
  <li><code class="inline">static</code> blocks run once at class load (init time)</li>
  <li>Inner class: <code class="inline">class Outer { class Inner {} }</code> - can touch Outer's private members</li>
  <li>Static nested: <code class="inline">static class Util</code> - no outer reference (Utility pattern)</li>
</ul>`,
      seed: { code: 'class Outer {\n    int x = 10;\n    static int counter = 0;\n    class Inner {\n        void show() { System.out.println(x + " / " + counter); }\n    }\n    Inner make() { counter++; return new Inner(); }\n}\npublic class Main {\n    public static void main(String[] args) {\n        Outer o = new Outer();\n        o.make().show();\n        o.make().show();\n    }\n}', lang: "java" }
    },
    {
      id: "threads", title: "Threads - Run Work in Parallel",
      html: `<p class="lead">Threads let your program do multiple things at once - background downloads, concurrent game logic.</p>
<h2>Start here</h2>
<ul>
  <li>Extend <code class="inline">Thread</code> + override <code class="inline">run()</code>, OR implement <code class="inline">Runnable</code></li>
  <li><code class="inline">t.start()</code> - never call run() directly (that's same-thread)</li>
  <li><code class="inline">t.join()</code> - wait for it to finish</li>
  <li>Lambdas: <code class="inline">new Thread(() -&gt; task()).start();</code></li>
</ul>`,
      seed: { code: 'public class Main {\n    public static void main(String[] args) throws InterruptedException {\n        Thread t = new Thread(() -> {\n            for (int i = 1; i <= 5; i++) {\n                System.out.println("Worker: " + i);\n                try { Thread.sleep(50); } catch (Exception e) {}\n            }\n        });\n        t.start();\n        t.join();\n        System.out.println("All done");\n    }\n}', lang: "java" }
    },
    {
      id: "wrapup", title: "Java Summary & Next Steps",
      html: `
<p class="lead">Java course complete — from main() to Streams. Enterprise-grade skills are yours.</p>
<h2>You can now</h2>
<ul>
  <li>✔ Syntax, types, casting, methods + overloading</li>
  <li>✔ Control flow, arrays, ArrayList &amp; HashMap</li>
  <li>✔ OOP end-to-end: classes, inheritance, polymorphism, interfaces</li>
  <li>✔ Exceptions, files, Streams API &amp; pieces of the ecosystem</li>
</ul>
<h2>Next steps</h2>
<ul>
  <li>📱 Android apps → Kotlin course (modern Java alternative)</li>
  <li>🌐 Backend → Spring Boot, after the SQL course</li>
  <li>🧠 Practice → DSA course — Java is a classic interview language</li>
</ul>`,
      seed: { code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Java complete ✔");\n    }\n}', lang: "java" }
    }
  ]
};
