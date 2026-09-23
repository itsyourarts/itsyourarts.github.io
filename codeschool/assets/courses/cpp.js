/* GodxShadow course: C++ — start se end tak */
COURSES.cpp = {
  name: "C++", color: "#7ad6ff", icon: "C+", blurb: "Fast, compiled language — games, systems, competitive coding.",
  lessons: [
    {
      id: "intro", title: "C++ Introduction",
      html: `
<p class="lead">C++ = C + classes + modern features. Compiled, statically-typed — games (Unreal), engines, OS, competitive programming.</p>
<h2>Pehla program</h2>
<h2>Key points</h2>
<ul>
  <li><code class="inline">#include &lt;iostream&gt;</code> — input/output</li>
  <li><code class="inline">int main()</code> — entry point</li>
  <li><code class="inline">cout &lt;&lt;</code> output · <code class="inline">cin &gt;&gt;</code> input</li>
  <li><code class="inline">using namespace std;</code> — std:: prefix se bachne ke liye</li>
</ul>`,
      seed: { code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, GodxShadow!" << endl;\n    int a = 5, b = 3;\n    cout << "Sum = " << a + b << endl;\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "control", title: "Loops, Arrays & Functions",
      html: `
<p class="lead">Control flow aur functions — C++ ka core.</p>
<h2>Loops</h2>
<ul>
  <li><code class="inline">for (int i=0; i&lt;n; i++)</code></li>
  <li><code class="inline">while</code>, <code class="inline">do...while</code></li>
  <li>Range-based: <code class="inline">for (int x : arr)</code></li>
</ul>
<h2>Containers</h2>
<p><code class="inline">vector&lt;int&gt;</code>, <code class="inline">string</code>, <code class="inline">map</code>, <code class="inline">set</code> — STL ka power yahan hai.</p>`,
      seed: { code: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint square(int n) { return n * n; }\n\nint main() {\n    vector<int> v = {1, 2, 3, 4};\n    for (int x : v) cout << square(x) << " ";\n    cout << endl;\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "oop", title: "Classes & Objects",
      html: `
<p class="lead">C++ mein OOP full power ke saath — access control, constructors, overloading.</p>
<h2>Features</h2>
<ul>
  <li><code class="inline">public / private / protected</code></li>
  <li>Constructor / destructor (<code class="inline">~Player()</code>)</li>
  <li>Method overloading — same naam, alag params</li>
  <li>Inheritance + <code class="inline">virtual</code> functions (polymorphism)</li>
</ul>`,
      seed: { code: '#include <iostream>\nusing namespace std;\n\nclass Player {\npublic:\n    string name;\n    int power;\n    Player(string n, int p) : name(n), power(p) {}\n    void show() { cout << name << " ⚡ " << power << endl; }\n};\n\nint main() {\n    Player p("Shadow", 9000);\n    p.show();\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "stl", title: "STL: vector, map, sort",
      html: `
<p class="lead">Standard Template Library — ready-made, fast, tested containers + algorithms.</p>
<h2>Roz use hone wale</h2>
<ul>
  <li><code class="inline">vector</code> — dynamic array</li>
  <li><code class="inline">map / unordered_map</code> — key→value</li>
  <li><code class="inline">set</code> — sorted unique</li>
  <li><code class="inline">sort(v.begin(), v.end())</code></li>
  <li><code class="inline">max_element, accumulate, find</code> (<code class="inline">&lt;algorithm&gt;</code>, <code class="inline">&lt;numeric&gt;</code>)</li>
</ul>`,
      seed: { code: '#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <map>\nusing namespace std;\n\nint main() {\n    vector<int> v = {5, 1, 9};\n    sort(v.begin(), v.end());\n    map<string, int> scores = {{"asha", 90}, {"ravi", 75}};\n    for (auto &[k, s] : scores) cout << k << ":" << s << " ";\n    for (int x : v) cout << x << " ";\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "templates", title: "Templates & Exceptions",
      html: `
<p class="lead"><b>Templates</b> = generic code, ek baar likho har type ke liye. <b>Exceptions</b> = try/catch C++ style.</p>
<h2>Template function</h2>
<p><code class="inline">template &lt;typename T&gt; T maxi(T a, T b) { return a &gt; b ? a : b; }</code></p>
<h2>Exceptions</h2>
<p><code class="inline">throw runtime_error("boom");</code> → <code class="inline">catch (const exception&amp; e)</code>.</p>`,
      seed: { code: '#include <iostream>\n#include <stdexcept>\nusing namespace std;\n\ntemplate <typename T>\nT maxi(T a, T b) { return a > b ? a : b; }\n\nint main() {\n    cout << maxi(3, 7) << " " << maxi(2.5, 1.5) << endl;\n    try { throw runtime_error("boom"); }\n    catch (const exception &e) { cout << "Caught: " << e.what(); }\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "modern", title: "Modern C++ (11/14/17/20)",
      html: `
<p class="lead">Aaj ka C++ purane C++ se kaafi alag — likhna aasaan, safe, expressive.</p>
<h2>Must-know</h2>
<ul>
  <li><code class="inline">auto</code> — type inference</li>
  <li><code class="inline">nullptr</code> (NULL nahi)</li>
  <li>Range-for, structured bindings <code class="inline">auto [k, v] = pair;</code></li>
  <li><code class="inline">unique_ptr / shared_ptr</code> — smart pointers, no manual delete</li>
  <li>Lambda: <code class="inline">[&amp;](int x){ return x*2; }</code></li>
</ul>`,
      seed: { code: '#include <iostream>\n#include <memory>\n#include <vector>\nusing namespace std;\n\nint main() {\n    auto nums = vector{4, 2, 8};\n    auto dbl = [](int x) { return x * 2; };\n    for (auto n : nums) cout << dbl(n) << " ";\n    auto sp = make_unique<int>(42);\n    cout << "\\nsmart: " << *sp << endl;\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "pointers-refs", title: "Pointers & References",
      html: `
<p class="lead">C++ ka soul — memory ko direct access. <b>Reference</b> = safe alias, <b>pointer</b> = flexible address.</p>
<h2>Diff samjho</h2>
<ul>
  <li><code class="inline">int &amp;r = x;</code> — same memory, change karne par x badlega</li>
  <li><code class="inline">int *p = &amp;x;</code> — address store, <code class="inline">*p</code> se value</li>
  <li><code class="inline">nullptr</code> — safe null pointer</li>
  <li>Functions mein pass-by-ref se copy avoid: <code class="inline">void f(const string&amp; s)</code></li>
</ul>`,
      seed: { code: '#include <iostream>\nusing namespace std;\n\nvoid twice(int &n) { n *= 2; }\n\nint main() {\n    int x = 21;\n    twice(x);                 // x = 42\n    int *p = &x;\n    cout << *p << endl;      // 42\n    cout << p << endl;       // address\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "strings-files", title: "Strings & File I/O",
      html: `
<p class="lead"><code class="inline">std::string</code> ki powers aur files read/write.</p>
<h2>String methods</h2>
<p><code class="inline">.length(), .substr(0,3), .find("x"), + concat, getline</code></p>
<h2>Files</h2>
<p><code class="inline">ifstream in("f.txt")</code> read · <code class="inline">ofstream out("f.txt")</code> write · RAII se khud close.</p>`,
      seed: { code: '#include <iostream>\n#include <fstream>\n#include <string>\nusing namespace std;\n\nint main() {\n    ofstream("note.txt") << "Neon notes line 1";\n\n    ifstream in("note.txt");\n    string line;\n    while (getline(in, line)) cout << line << endl;\n\n    string s = "godxshadow";\n    cout << s.substr(0, 4) << " len=" << s.length();\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "syntax", title: "Syntax, cout & namespace",
      html: `
<p class="lead">C++ ka pehla structure — headers, main, output.</p>
<h2>Anatomy</h2>
<ul>
  <li><code class="inline">#include &lt;iostream&gt;</code> — header library</li>
  <li><code class="inline">using namespace std;</code> — std:: baar-baar na likhna pade</li>
  <li><code class="inline">cout &lt;&lt;</code> — output · <code class="inline">cin &gt;&gt;</code> — input</li>
  <li><code class="inline">endl</code> ya <code class="inline">"\\\\n"</code> — new line</li>
</ul>`,
      seed: { code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello C++" << endl;\n    int a = 7, b = 5;\n    cout << "Sum = " << a + b << "\\n";\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "datatypes", title: "Data Types & Casting",
      html: `
<p class="lead">C++ mein types fixed hain — size bhi pata honi chahiye.</p>
<h2>Core types</h2>
<ul>
  <li><code class="inline">int, float, double, char, bool</code> — primitives</li>
  <li><code class="inline">string</code> — <code class="inline">#include &lt;string&gt;</code></li>
  <li>Modifiers: <code class="inline">short, long, unsigned</code></li>
  <li>Cast: <code class="inline">(int)9.9</code> ya <code class="inline">static_cast&lt;int&gt;(9.9)</code></li>
  <li><code class="inline">sizeof(int)</code> → bytes check</li>
</ul>`,
      seed: { code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int i = 42;\n    double d = 9.99;\n    cout << sizeof(int) << " bytes" << endl;\n    int cut = (int) d;              // C-style cast\n    cout << cut << endl;            // 9\n    int safe = static_cast<int>(d); // C++ style (better!)\n    cout << i + safe << endl;       // 51\n}', lang: "cpp" }
    },
    {
      id: "operators", title: "Operators & cmath",
      html: `
<p class="lead">C++ operators + math library ka combo.</p>
<h2>List</h2>
<ul>
  <li>Arithmetic: <code class="inline">+ - * / %</code> — int/int = int!</li>
  <li><code class="inline">&lt;cmath&gt;</code>: <code class="inline">pow(), sqrt(), abs(), round(), ceil(), floor()</code></li>
  <li>Ternary: <code class="inline">(x &gt; y) ? x : y</code></li>
  <li>Bitwise: <code class="inline">&amp; | ^ ~ &lt;&lt; &gt;&gt;</code> — performance tricks</li>
</ul>`,
      seed: { code: '#include <iostream>\n#include <cmath>\nusing namespace std;\n\nint main() {\n    cout << 17 / 5 << endl;         // 3 (int div)\n    cout << 17.0 / 5 << endl;       // 3.4\n    cout << pow(2, 10) << endl;     // 1024\n    cout << sqrt(49) << endl;       // 7\n    int big = (10 > 5) ? 10 : 5;    // ternary\n    cout << "max=" << big << endl;\n}', lang: "cpp" }
    },
    {
      id: "structs", title: "Structs (data grouping)",
      html: `
<p class="lead">C++ mein struct = class (bas default public). Data bundle ke liye perfect.</p>
<h2>Usage</h2>
<ul>
  <li><code class="inline">struct Point { int x, y; };</code> — semicolon mat bhoolo!</li>
  <li>Access: <code class="inline">p.x</code> · pointer: <code class="inline">ptr-&gt;x</code></li>
  <li>Struct mein functions bhi daal sakte ho (C++ only, C mein nahi)</li>
</ul>`,
      seed: { code: '#include <iostream>\n#include <string>\nusing namespace std;\n\nstruct Student {\n    string name;\n    int marks;\n    void show() { cout << name << " : " << marks << endl; }\n};\n\nint main() {\n    Student s1 = {"Ravi", 95};\n    Student s2 = {"Asha", 88};\n    s1.show(); s2.show();\n}', lang: "cpp" }
    },
    {
      id: "classes-deep", title: "Constructors, this & Access Specifiers",
      html: `
<p class="lead">Class ka lifecycle — constructor se banegi, destructor se khatam.</p>
<h2>Pillars</h2>
<ul>
  <li><code class="inline">public / private / protected</code> — access levels</li>
  <li><b>Constructor</b> — class ke naam ka, auto-invoke on create</li>
  <li><b>Destructor</b> — <code class="inline">~ClassName()</code> on destroy</li>
  <li><code class="inline">this</code> — current object ka pointer</li>
  <li>Getters/setters = encapsulation ka tareeka</li>
</ul>`,
      seed: { code: '#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Player {\nprivate:\n    string name; int hp;\npublic:\n    Player(string n, int h) {   // constructor\n        name = n; hp = h;\n        cout << name << " joined!" << endl;\n    }\n    ~Player() { cout << name << " left." << endl; }\n    int getHp() { return hp; }\n    void heal(int amt) { this->hp += amt; }\n};\n\nint main() {\n    Player p("Shadow", 80);\n    p.heal(20);\n    cout << "HP: " << p.getHp() << endl;   // 100\n}', lang: "cpp" }
    },
    {
      id: "inheritance", title: "Inheritance & Access Modes",
      html: `
<p class="lead">Base se derive karo — reusable classes ki hierarchy.</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">class Dog : public Animal</code> — public inheritance (sabse common)</li>
  <li>protected members → child classes ko access</li>
  <li><code class="inline">Animal::speak()</code> — parent ka version explicit call</li>
  <li>C++ mein <b>multiple inheritance</b> allowed (carefully!)</li>
</ul>`,
      seed: { code: '#include <iostream>\nusing namespace std;\n\nclass Animal {\nprotected:\n    string name;\npublic:\n    Animal(string n) : name(n) {}\n    void speak() { cout << name << " makes sound" << endl; }\n};\n\nclass Dog : public Animal {\npublic:\n    Dog(string n) : Animal(n) {}\n    void speak() {\n        Animal::speak();\n        cout << name << " barks woof!" << endl;\n    }\n};\n\nint main() { Dog d("Bruno"); d.speak(); }', lang: "cpp" }
    },
    {
      id: "virtual", title: "Polymorphism & virtual Functions",
      html: `
<p class="lead">Runtime par decide kaunsa function chalega — virtual ka kamaal.</p>
<h2>Key points</h2>
<ul>
  <li><code class="inline">virtual</code> — base mein likho, override ko track karega</li>
  <li>Base pointer → derived object: <code class="inline">Animal* a = new Dog()</code></li>
  <li><code class="inline">= 0</code> pure virtual → abstract class</li>
  <li>Destructor bhi virtual rakho base mein!</li>
</ul>`,
      seed: { code: '#include <iostream>\nusing namespace std;\n\nclass Shape {\npublic:\n    virtual void draw() = 0;        // pure virtual\n    virtual ~Shape() {}\n};\nclass Circle : public Shape {\npublic:\n    void draw() override { cout << "O" << endl; }\n};\nclass Box : public Shape {\npublic:\n    void draw() override { cout << "[]" << endl; }\n};\n\nint main() {\n    Shape* shapes[2] = { new Circle(), new Box() };\n    for (auto s : shapes) { s->draw(); delete s; }\n}', lang: "cpp" }
    },
    {
      id: "exceptions", title: "Exceptions (try / catch / throw)",
      html: `
<p class="lead">Runtime errors ko gracefully handle karo — crash se bachao.</p>
<h2>Flow</h2>
<ul>
  <li><code class="inline">try { }</code> — risky code yahan</li>
  <li><code class="inline">throw type</code> — error udaao</li>
  <li><code class="inline">catch (type e) { }</code> — pakdo aur handle</li>
  <li><code class="inline">catch (...)</code> — sab kuch pakadta hai</li>
  <li>Standard: <code class="inline">&lt;stdexcept&gt;</code> — runtime_error, invalid_argument</li>
</ul>`,
      seed: { code: '#include <iostream>\n#include <stdexcept>\nusing namespace std;\n\ndouble divide(int a, int b) {\n    if (b == 0) throw runtime_error("zero se divide nahi!");\n    return (double) a / b;\n}\n\nint main() {\n    try {\n        cout << divide(10, 2) << endl;\n        cout << divide(5, 0) << endl;\n    } catch (const runtime_error& e) {\n        cout << "Error: " << e.what() << endl;\n    }\n    cout << "program chalta raha" << endl;\n}', lang: "cpp" }
    },
    {
      id: "vectors", title: "vector - The Dynamic Array",
      html: `<p class="lead"><code class="inline">std::vector</code> is C++'s resizable array - the workhorse container used in almost every program.</p>
<h2>Methods</h2>
<ul>
  <li><code class="inline">push_back(x)</code> - append - <code class="inline">pop_back()</code> - remove last</li>
  <li><code class="inline">v[i]</code> - <code class="inline">v.at(i)</code> (bounds-checked) - <code class="inline">v.size()</code></li>
  <li><code class="inline">v.begin() / v.end()</code> - for range-for and algorithms</li>
  <li>Initialize: <code class="inline">vector&lt;int&gt; v(5, 0)</code> - five zeros</li>
</ul>`,
      seed: { code: '#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    vector<int> v = {3, 1, 4, 1, 5};\n    v.push_back(9);\n    for (int x : v) cout << x << " ";\n    cout << "\\nsize: " << v.size() << " last: " << v.back();\n    v.pop_back();\n    cout << "\\nafter pop: " << v.size();\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "maps-deep", title: "map & unordered_map (Key-Value)",
      html: `<p class="lead">Associative containers store key-value pairs: <code class="inline">map</code> (sorted, O(log n)) and <code class="inline">unordered_map</code> (hash, O(1)).</p>
<h2>Usage</h2>
<ul>
  <li><code class="inline">m["key"] = value</code> - create or update</li>
  <li><code class="inline">m.count(k)</code>, <code class="inline">m.find(k)</code>, <code class="inline">m.erase(k)</code></li>
  <li>Iterate: <code class="inline">for (auto &amp;p : m)</code> - <code class="inline">p.first</code>, <code class="inline">p.second</code></li>
  <li><code class="inline">operator[]</code> on map creates missing keys (watch for bugs!) - use <code class="inline">at()</code> for read-only</li>
</ul>`,
      seed: { code: '#include <iostream>\n#include <map>\nusing namespace std;\nint main() {\n    map<string, int> score = {{"Asha", 92}, {"Raj", 78}, {"Mia", 85}};\n    score["Neon"] = 99;\n    for (auto &p : score) cout << p.first << " -> " << p.second << "\\n";\n    cout << "Raj: " << score.at("Raj") << endl;\n    score.erase("Raj");\n    cout << "size now: " << score.size() << endl;\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "smart-pointers", title: "Smart Pointers - Automatic Memory",
      html: `<p class="lead">Smart pointers own heap memory and release it automatically - no more leaks, no manual delete.</p>
<h2>The three</h2>
<ul>
  <li><code class="inline">unique_ptr</code> - sole owner (cannot copy, can move)</li>
  <li><code class="inline">shared_ptr</code> - shared ownership with reference counting</li>
  <li><code class="inline">weak_ptr</code> - non-owning observer (breaks reference cycles)</li>
  <li>Factory: <code class="inline">make_unique</code> / <code class="inline">make_shared</code></li>
</ul>`,
      seed: { code: '#include <iostream>\n#include <memory>\nusing namespace std;\nint main() {\n    auto a = make_unique<int>(42);\n    cout << "unique: " << *a << endl;\n    auto b = make_shared<string>("hello");\n    auto c = b;  // shared\n    cout << "shared count: " << b.use_count() << endl;\n    b.reset();\n    cout << "after reset: " << c.use_count() << " - " << *c << endl;\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "move-semantics", title: "Move Semantics - Zero-Copy Efficiency",
      html: `<p class="lead">Move semantics transfer resources (memory, handles) instead of copying - the key to C++ performance.</p>
<h2>Concepts</h2>
<ul>
  <li>Rvalue references <code class="inline">T&amp;&amp;</code> bind to temporaries</li>
  <li><code class="inline">std::move(x)</code> casts to rvalue - triggers move, leaves x valid-but-unspecified</li>
  <li>Move constructor / assignment: swap pointers, skip deep copy</li>
  <li>"Rule of zero/five" - prefer value types with proper moves</li>
</ul>`,
      seed: { code: '#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    vector<int> a(1000000, 7);\n    cout << "a capacity: " << a.capacity() << endl;\n    vector<int> b = std::move(a);  // move, no copy!\n    cout << "b size: " << b.size() << endl;\n    cout << "a after move: " << a.size() << endl;\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "exceptions-cpp", title: "C++ Exception Handling",
      html: `<p class="lead">try/catch with typed exceptions - structured, no error-code hell. Match C++ style: throw objects by value, catch by reference.</p>
<h2>Rules</h2>
<ul>
  <li><code class="inline">throw</code> by value - <code class="inline">catch</code> by <code class="inline">const&amp;</code></li>
  <li>Base class catches (catch <code class="inline">exception</code> last)</li>
  <li><code class="inline">what()</code> returns the message</li>
  <li>Common: <code class="inline">runtime_error, invalid_argument, out_of_range, bad_alloc</code></li>
</ul>`,
      seed: { code: '#include <iostream>\n#include <stdexcept>\nusing namespace std;\nint divide(int a, int b) {\n    if (b == 0) throw runtime_error("division by zero");\n    return a / b;\n}\nint main() {\n    try {\n        cout << divide(10, 2) << endl;\n        cout << divide(5, 0) << endl;\n    } catch (const exception &e) {\n        cout << "Caught: " << e.what() << endl;\n    }\n    cout << "program continues" << endl;\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "namespaces-cpp", title: "Namespaces - Organize Names",
      html: `<p class="lead">Namespaces group declarations and prevent name collisions between libraries.</p>
<h2>Usage</h2>
<ul>
  <li><code class="inline">namespace game { ... }</code> - <code class="inline">game::render()</code></li>
  <li><code class="inline">using namespace std;</code> - convenience (fine in small programs)</li>
  <li><code class="inline">using std::cout;</code> - import one name</li>
  <li>Nested namespaces: <code class="inline">namespace a::b</code> (C++17)</li>
</ul>`,
      seed: { code: '#include <iostream>\nnamespace game {\n    int lives = 3;\n    void respawn() { lives = 3; }\n}\nnamespace game::ui {\n    void showLives(int n) { std::cout << "Lives: " << n << std::endl; }\n}\nint main() {\n    game::ui::showLives(game::lives);\n    game::respawn();\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "streams-files", title: "File I/O with Streams",
      html: `<p class="lead">ifstream/ofstream mirror cin/cout - read and write files with the same familiar operators.</p>
<h2>Pattern</h2>
<ul>
  <li><code class="inline">ofstream out("f.txt")</code> - <code class="inline">out &lt;&lt; data;</code></li>
  <li><code class="inline">ifstream in("f.txt")</code> - <code class="inline">in &gt;&gt; value;</code> or <code class="inline">getline(in, line)</code></li>
  <li>Check <code class="inline">in.is_open()</code> / stream state after operations</li>
  <li>Binary: <code class="inline">ios::binary</code> flag</li>
</ul>`,
      seed: { code: '#include <iostream>\n#include <fstream>\n#include <string>\nusing namespace std;\nint main() {\n    ofstream out("notes.txt");\n    out << "line one" << endl << "line two" << endl;\n    out.close();\n    ifstream in("notes.txt");\n    string line;\n    while (getline(in, line)) cout << "read: " << line << endl;\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "friends-static-cpp", title: "Friend Functions & Static Members",
      html: `<p class="lead"><code class="inline">friend</code> lets selected outside functions access private members; <code class="inline">static</code> data members are shared across all instances.</p>
<h2>Usage</h2>
<ul>
  <li><code class="inline">friend void printSecret(const Box&amp;);</code> inside the class</li>
  <li>Friendships: to a function or to another class</li>
  <li>Static data: declared in class, defined once outside, shared state</li>
  <li>Static member functions - no <code class="inline">this</code>, can only touch statics</li>
</ul>`,
      seed: { code: '#include <iostream>\nclass Counter {\n    static int total;\npublic:\n    Counter() { total++; }\n    static int all() { return total; }\n    friend void reset(Counter &c);\n};\nint Counter::total = 0;\nvoid reset(Counter &c) { Counter::total = 0; }\nint main() {\n    Counter a, b, c;\n    std::cout << "created: " << Counter::all() << std::endl;\n    reset(a);\n    std::cout << "after reset: " << Counter::all() << std::endl;\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "threads-cpp", title: "Multithreading with &lt;thread&gt;",
      html: `<p class="lead">C++'s standard thread library runs functions in parallel - for CPU-bound work and concurrent systems.</p>
<h2>Basics</h2>
<ul>
  <li><code class="inline">thread t(fn, args...)</code> - starts immediately</li>
  <li><code class="inline">t.join()</code> - wait - <code class="inline">t.detach()</code> - run independently</li>
  <li><code class="inline">mutex</code> + <code class="inline">lock_guard</code> protect shared data (data races!)</li>
  <li><code class="inline">async</code> / <code class="inline">future</code> for results</li>
</ul>`,
      seed: { code: '#include <iostream>\n#include <thread>\n#include <mutex>\nstd::mutex mtx;\nint shared = 0;\nvoid worker() {\n    for (int i = 0; i < 1000; i++) {\n        std::lock_guard<std::mutex> g(mtx);\n        shared++;\n    }\n}\nint main() {\n    std::thread t1(worker), t2(worker);\n    t1.join(); t2.join();\n    std::cout << "shared = " << shared << " (expected 2000)" << std::endl;\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "algorithms", title: "&lt;algorithm&gt; - Built-in Superpowers",
      html: `<p class="lead">The &lt;algorithm&gt; header ships ready-made, optimized functions: sort, search, transform, count.</p>
<h2>Must-knows</h2>
<ul>
  <li><code class="inline">sort(v.begin(), v.end())</code> + <code class="inline">sort(..., greater&lt;int&gt;())</code></li>
  <li><code class="inline">find, count, max_element, min_element</code></li>
  <li><code class="inline">transform(v.begin(), v.end(), v.begin(), [](int x){return x*2;});</code></li>
  <li><code class="inline">accumulate(v.begin(), v.end(), 0)</code> (from &lt;numeric&gt;)</li>
</ul>`,
      seed: { code: '#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <numeric>\nusing namespace std;\nint main() {\n    vector<int> v = {5, 2, 9, 1, 7};\n    sort(v.begin(), v.end());\n    for (int x : v) cout << x << " ";\n    cout << "\\nsum: " << accumulate(v.begin(), v.end(), 0) << endl;\n    transform(v.begin(), v.end(), v.begin(), [](int x){return x * 2;});\n    cout << "doubled: ";\n    for (int x : v) cout << x << " ";\n    cout << endl;\n    return 0;\n}', lang: "cpp" }
    },
    {
      id: "wrapup", title: "C++ Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — C++ ka solid base ready.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Basics, control flow, functions</li>
  <li>OOP: classes, inheritance, virtual</li>
  <li>STL containers + algorithms</li>
  <li>Templates, exceptions, modern C++ idioms</li>
</ul>
<h2>Agla step</h2>
<p>Game dev (Unreal/Unity-C#), systems (Rust), ya competitive coding (Codeforces) — C++ har jagah chalta hai.</p>`,
      seed: { code: '#include <iostream>\nusing namespace std;\nint main() { cout << "C++ complete ✔" << endl; return 0; }', lang: "cpp" }
    }
  ]
};
