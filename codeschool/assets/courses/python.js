/* GodxShadow course: Python — start se end tak */
COURSES.python = {
  name: "Python", color: "#63e6ff", icon: "Py", blurb: "Sabse popular language — simple syntax, powerful libraries.",
  lessons: [
    {
      id: "intro", title: "Python Introduction",
      html: `
<p class="lead"><b>Python</b> is the world's most popular beginner-friendly language — web backends, data science, AI/ML, automation, scripts — with a famously readable syntax.</p>
<h2>Why Python?</h2>
<ul>
  <li>Almost-English syntax: no braces, no semicolons, indentation defines blocks</li>
  <li>Huge ecosystem: Django/Flask (web), NumPy/Pandas (data), PyTorch (AI), and pip libraries for everything</li>
  <li>Interpreted — code runs line by line directly; <code class="inline">python script.py</code> or the REPL</li>
</ul>
<h2>Your first line</h2>
<p>Run the example below in the playground — <code class="inline">print()</code> writes to output.</p>`,
      seed: { code: 'print("Hello, GodxShadow!")\n\nname = "Shadow"\nage = 21\nprint(f"Naam: {name}, Age: {age}")', lang: "python" }
    },
    {
      id: "vars-strings", title: "Variables & Strings",
      html: `
<p class="lead"><b>Variables</b> are labels for values — no type declarations needed; Python sniffs the type for you.</p>
<h2>Variables</h2>
<ul>
  <li><code class="inline">name = "Shadow"; age = 21</code> — assignment is plain <code class="inline">=</code></li>
  <li>Multi-assign: <code class="inline">x = y = z = 0</code> · unpack: <code class="inline">a, b = 1, 2</code></li>
  <li>Dynamic types: <code class="inline">type(x)</code> tells you what a variable currently holds</li>
  <li>Naming: snake_case for vars/functions, PascalCase for classes</li>
</ul>
<h2>String essentials</h2>
<ul>
  <li>Slicing: <code class="inline">s[0], s[-1], s[1:4], s[::-1]</code> (reverse!)</li>
  <li><code class="inline">len(), split(), replace(), join(), format, f-strings</code></li>
  <li>f-strings embed values: <code class="inline">f"age is {age + 1}"</code> (shown below)</li>
</ul>`,
      seed: { code: 'name = "neon"\npi = 3.14159\n\nprint(f"PI = {pi:.2f}")\nprint(name.upper())          # NEON\nprint("reverse:", name[::-1])  # noen\nprint(len(name), type(pi))', lang: "python" }
    },
    {
      id: "flow", title: "Conditions & Loops",
      html: `
<p class="lead">Code flows through <b>conditions</b> and <b>loops</b> — if/elif/else and for/while with indentation as the block marker.</p>
<h2>Conditions</h2>
<ul>
  <li><code class="inline">if score >= 90: … elif >= 60: … else: …</code></li>
  <li>Truthiness: empty string/list/0/None are falsy</li>
  <li>Combine: <code class="inline">and, or, not</code> · membership <code class="inline">in / not in</code></li>
</ul>
<h2>Loops</h2>
<ul>
  <li><code class="inline">for i in range(5):</code> — clean counted loops</li>
  <li><code class="inline">for item in items:</code> — direct iteration</li>
  <li><code class="inline">while cond:</code> · <code class="inline">break</code> / <code class="inline">continue</code></li>
  <li><code class="inline">enumerate(items)</code> — index + value together</li>
</ul>`,
      seed: { code: 'for i in range(1, 6):\n    if i % 2 == 0:\n        print(i, "even")\n    else:\n        print(i, "odd")\n\nsquares = [n * n for n in range(10) if n % 2 == 0]\nprint(squares)', lang: "python" }
    },
    {
      id: "collections", title: "List, Tuple, Dict, Set",
      html: `
<p class="lead">Python has 4 built-in collection types — each with its own job. Knowing which one to use is half the craft.</p>
<h2>The four</h2>
<ul>
  <li><b>List</b> <code class="inline">[1, 2, 3]</code> — ordered, changeable: append/insert/remove/sort</li>
  <li><b>Tuple</b> <code class="inline">(1, 2)</code> — ordered, IMMUTABLE (dict keys, multiple returns)</li>
  <li><b>Dict</b> <code class="inline">{"k": "v"}</code> — key→value map: get/keys/values</li>
  <li><b>Set</b> <code class="inline">{1, 2, 3}</code> — unique items, blazing membership test, union/intersect</li>
</ul>
<h2>Shared powers</h2>
<ul>
  <li>Slicing on lists/tuples · <code class="inline">len(), min(), max(), sum(), sorted()</code></li>
  <li>Comprehensions: <code class="inline">[x*x for x in range(5) if x % 2]</code></li>
  <li>Zip: <code class="inline">for a, b in zip(list1, list2)</code></li>
</ul>`,
      seed: { code: 'skills = ["html", "css", "js"]\npoint = (10, 20)\nuser = {"name": "Shadow", "level": 99}\nuniq = {1, 2, 2, 3}\n\nskills.append("python")\nprint(skills, point, uniq)\nprint(user.get("city", "Delhi"))\nfor k, v in user.items():\n    print(k, "->", v)', lang: "python" }
    },
    {
      id: "functions", title: "Functions & Modules",
      html: `
<p class="lead"><b>Functions</b> package logic once, reuse forever: define with <code class="inline">def</code>, call by name, return values.</p>
<h2>Basics</h2>
<ul>
  <li><code class="inline">def greet(name): return "Hi " + name</code></li>
  <li>Defaults: <code class="inline">def log(msg, level="INFO")</code></li>
  <li>Keyword args: <code class="inline">greet(name="Ravi")</code> · flexible: <code class="inline">*args, **kwargs</code></li>
  <li>Return multiple values: <code class="inline">return a, b</code> (a tuple!)</li>
</ul>
<h2>Modules</h2>
<ul>
  <li><code class="inline">import math</code> then <code class="inline">math.sqrt(16)</code></li>
  <li><code class="inline">from random import randint</code> · alias <code class="inline">import pandas as pd</code></li>
  <li>Your own file <code class="inline">helpers.py</code> IS a module</li>
</ul>`,
      seed: { code: 'import math\n\ndef greet(name="Guest"):\n    return f"Hello, {name}!"\n\nsq = lambda n: n * n\n\nprint(greet("Shadow"))\nprint(sq(9), math.sqrt(144))', lang: "python" }
    },
    {
      id: "oop", title: "Classes & OOP",
      html: `
<p class="lead"><b>Classes</b> bundle data + behaviour into objects. Python's OOP is lightweight — <code class="inline">self</code> is explicit, everything is practical.</p>
<h2>Basics</h2>
<ul>
  <li><code class="inline">class Player:</code> then <code class="inline">def __init__(self, name): self.name = name</code></li>
  <li>Create: <code class="inline">p = Player("Shadow")</code> · attributes: <code class="inline">p.name</code></li>
  <li>Methods: <code class="inline">def level_up(self): …</code> (first param always self)</li>
  <li>Dunder methods: <code class="inline">__str__</code> (print view), <code class="inline">__len__</code>, <code class="inline">__add__</code></li>
</ul>
<h2>Inheritance</h2>
<ul>
  <li><code class="inline">class Pro(Player):</code> + <code class="inline">super().__init__(name)</code></li>
  <li>Python allows multiple inheritance: <code class="inline">class C(A, B)</code></li>
  <li><code class="inline">isinstance(p, Player)</code> — type check</li>
</ul>`,
      seed: { code: 'class Hero:\n    def __init__(self, name, power):\n        self.name = name\n        self.power = power\n\n    def __str__(self):\n        return f"{self.name} ⚡ {self.power}"\n\nclass NeonHero(Hero):\n    pass\n\nh = NeonHero("Shadow", 9000)\nprint(h)', lang: "python" }
    },
    {
      id: "files-exceptions", title: "Files & Exceptions",
      html: `
<p class="lead">Read/write files cleanly with <code class="inline">with</code>; handle runtime errors with try/except so programs recover instead of crashing.</p>
<h2>Files</h2>
<ul>
  <li><code class="inline">with open("f.txt") as f: text = f.read()</code> — auto-closes!</li>
  <li>Modes: <code class="inline">"r"</code> read · <code class="inline">"w"</code> overwrite · <code class="inline">"a"</code> append · <code class="inline">"b"</code> binary</li>
  <li><code class="inline">f.write(), f.readlines(),</code> iterate <code class="inline">for line in f</code></li>
</ul>
<h2>try/except</h2>
<ul>
  <li><code class="inline">try: … except ValueError: … finally: …</code></li>
  <li>Multiple excepts for different failures · <code class="inline">else</code> runs when NO error</li>
  <li>Raise your own: <code class="inline">raise TypeError("bad input")</code></li>
  <li>Catch what you expect — bare <code class="inline">except:</code> hides bugs</li>
</ul>`,
      seed: { code: 'with open("notes.txt", "w") as f:\n    f.write("neon notes")\n\ntry:\n    n = int("abc")\nexcept ValueError as e:\n    print("Pakda:", e)\nfinally:\n    print("clean-up done")', lang: "python" }
    },
    {
      id: "modules", title: "Modules, pip & Ecosystem",
      html: `
<p class="lead">The standard library + 400k packages on PyPI = "batteries included" Python.</p>
<h2>Standard library gems</h2>
<ul>
  <li><code class="inline">math, random, datetime, json, os, sys, re, collections, itertools</code></li>
  <li>datetime: <code class="inline">datetime.now().strftime("%d %b %Y")</code></li>
  <li>json: <code class="inline">json.dumps(obj)</code> / <code class="inline">json.loads(s)</code></li>
</ul>
<h2>pip</h2>
<ul>
  <li><code class="inline">pip install requests</code> · <code class="inline">pip list</code> · <code class="inline">pip freeze > requirements.txt</code></li>
  <li>Virtual environments: <code class="inline">python -m venv .venv</code> — isolated per-project (always do this!)</li>
</ul>`,
      seed: { code: '# terminal par:\n# pip install requests\n\nimport requests\nr = requests.get("https://api.github.com")\nprint(r.status_code)', lang: "python" }
    },
    {
      id: "syntax", title: "Syntax, Indentation & Comments",
      html: `
<p class="lead">Python's grammar trades braces for indentation — structure is visible at a glance.</p>
<h2>Rules</h2>
<ul>
  <li>Blocks are created by <b>indentation</b> (4 spaces standard) — not { }</li>
  <li><code class="inline"># comment</code> — single line; triple quotes = docstring</li>
  <li>Statements end at end of line — semicolon optional</li>
  <li>Case-sensitive: <code class="inline">Name</code> ≠ <code class="inline">name</code></li>
</ul>`,
      seed: { code: '# Python syntax demo\nif 5 > 2:        # condition\n    print("Five is greater")   # 4-space indent REQUIRED\n\ndef greet():\n    """This is a docstring — the function’s docs"""\n    print("Hello!")\n\ngreet()', lang: "python" }
    },
    {
      id: "datatypes", title: "Data Types (int, str, bool...)",
      html: `
<p class="lead">Everything in Python is an object — types categorize values and <code class="inline">type()</code> reveals them.</p>
<h2>Common types</h2>
<ul>
  <li><code class="inline">int, float, complex</code> — numbers</li>
  <li><code class="inline">str</code> — text · <code class="inline">bool</code> — True/False</li>
  <li><code class="inline">list, tuple, range</code> — sequences</li>
  <li><code class="inline">dict</code> — mapping · <code class="inline">set, frozenset</code></li>
  <li><code class="inline">NoneType</code> — the absence of value (<code class="inline">None</code>)</li>
</ul>`,
      seed: { code: 'x = 5\ny = 3.14\ns = "shadow"\nok = True\nz = [1, 2, 3]\nd = {"lang": "py"}\n\nprint(type(x))   # <class "int">\nprint(type(y))   # float\nprint(type(s))   # str\nprint(type(ok))  # bool\nprint(type(z))   # list\nprint(type(d))   # dict', lang: "python" }
    },
    {
      id: "casting", title: "Type Casting (int(), str(), float())",
      html: `
<p class="lead"><b>Casting</b> converts values between types — needed constantly because <code class="inline">input()</code> always yields a string.</p>
<h2>Constructors</h2>
<ul>
  <li><code class="inline">int("5")</code> → 5 · <code class="inline">float("3.5")</code> → 3.5</li>
  <li><code class="inline">str(42)</code> → "42" · <code class="inline">list("abc")</code> → ["a","b","c"]</li>
  <li>Invalid value → <code class="inline">ValueError</code>: int("hello") throws</li>
  <li>Check convertibility with try/except for user data</li>
</ul>`,
      seed: { code: 'age = int("21")\nmarks = float("87.5")\nlabel = str(99)\nprint(age + 1)      # 22\nprint(marks / 10)   # 8.75\nprint(label + "%")  # 99%\n\n# with input()?\n# n = int(input("Number: "))   # cast required!', lang: "python" }
    },
    {
      id: "booleans", title: "Booleans & Comparison",
      html: `
<p class="lead">Every Python value has a truth value — conditions rely on it.</p>
<h2>Truthy / Falsy</h2>
<ul>
  <li>Falsy: <code class="inline">0, 0.0, "", [], {}, None, False</code></li>
  <li>Everything else is truthy — even <code class="inline">"0"</code> and <code class="inline">[0]</code>!</li>
  <li>Comparisons: <code class="inline">==, !=, <, >, <=, >=, is, in</code></li>
  <li>Check with <code class="inline">bool()</code> · <code class="inline">is</code> tests identity (use for None)</li>
</ul>`,
      seed: { code: 'print(bool(0))       # False\nprint(bool(""))      # False\nprint(bool("hi"))    # True\nprint(bool([1, 2]))  # True\n\na, b = 10, 20\nprint(a == b)   # False\nprint(a < b)    # True\nprint("py" in "python")  # True', lang: "python" }
    },
    {
      id: "operators", title: "Operators (Arithmetic, Logic, Identity)",
      html: `
<p class="lead">Python operators: from arithmetic to the cute walrus.</p>
<h2>Quick list</h2>
<ul>
  <li>Arithmetic: <code class="inline">**</code> (power), <code class="inline">//</code> (floor division), <code class="inline">%</code> (remainder)</li>
  <li>Logic: <code class="inline">and, or, not</code> (words, not &&!)</li>
  <li>Identity: <code class="inline">is / is not</code> · membership: <code class="inline">in / not in</code></li>
  <li>Walrus: <code class="inline">if (n := len(items)) > 2:</code> — assign while using</li>
  <li>Shorthand: <code class="inline">+=, *=</code> — no ++/-- in Python (<code class="inline">x += 1</code>)</li>
</ul>`,
      seed: { code: 'print(2 ** 10)    # 1024\nprint(17 // 5)    # 3  (floor)\nprint(17 % 5)     # 2\n\nx = 15\nprint(x > 10 and x < 20)   # True\nprint(not (x == 1))        # True\n\nitems = [1, 2, 3]\nif (n := len(items)) > 2:\n    print(f"items = {n}")   # walrus!', lang: "python" }
    },
    {
      id: "dicts", title: "Dictionaries (key → value)",
      html: `
<p class="lead">Dictionaries are Python's superstar — JSON-shaped, fast, everywhere in real code.</p>
<h2>Essentials</h2>
<ul>
  <li><code class="inline">user = {"name": "Ravi", "age": 21}</code> — insertion order kept</li>
  <li>Read: <code class="inline">user["name"]</code> or safe <code class="inline">user.get("marks", 0)</code></li>
  <li>Iterate: <code class="inline">for k, v in user.items():</code></li>
  <li>Tools: <code class="inline">keys(), values(), pop(), update(), "in" checks</code></li>
  <li>Dict comprehension: <code class="inline">{k: k*k for k in range(4)}</code></li>
</ul>`,
      seed: { code: 'user = {"name": "Ravi", "age": 21, "city": "Delhi"}\nuser["level"] = "pro"          # add\nprint(user.get("marks", "N/A"))\n\nfor k, v in user.items():\n    print(k, "->", v)\n\nprint("name" in user)   # True', lang: "python" }
    },
    {
      id: "while-loops", title: "while Loops + break / continue / else",
      html: `
<p class="lead"><code class="inline">while</code> repeats as long as a condition stays true — perfect when you don't know the count upfront. Loop-control makes it flexible.</p>
<h2>Controls</h2>
<ul>
  <li><code class="inline">break</code> — exit immediately</li>
  <li><code class="inline">continue</code> — skip to next iteration</li>
  <li><code class="inline">else</code> after a loop — runs only if NO break happened (Python secret weapon!)</li>
  <li>Always mutate the counter/condition or you'll loop forever</li>
</ul>`,
      seed: { code: 'i = 1\ntotal = 0\nwhile i <= 100:\n    total += i\n    i += 1\nprint("1..100 ka sum:", total)   # 5050\n\nn = 0\nwhile n < 10:\n    n += 1\n    if n % 2 == 0:\n        continue      # even skip\n    print(n, end=" ")   # 1 3 5 7 9\nelse:\n    print("--- done (no break)")', lang: "python" }
    },
    {
      id: "lambda", title: "Lambda + map / filter / sorted",
      html: `
<p class="lead"><b>Lambdas</b> are one-line anonymous functions — they pair beautifully with map/filter/sorted for functional-style data work.</p>
<h2>Where used</h2>
<ul>
  <li><code class="inline">lambda x: x * 2</code> — anonymous single-expression function</li>
  <li><code class="inline">map(fn, items)</code> — transform every item</li>
  <li><code class="inline">filter(fn, items)</code> — keep items that pass</li>
  <li><code class="inline">sorted(items, key=lambda s: s[1], reverse=True)</code> — custom ordering</li>
  <li>Use def + a name when logic grows past one expression</li>
</ul>`,
      seed: { code: 'nums = [1, 2, 3, 4, 5]\nsq = list(map(lambda x: x ** 2, nums))\neven = list(filter(lambda x: x % 2 == 0, nums))\nprint(sq)    # [1, 4, 9, 16, 25]\nprint(even)  # [2, 4]\n\nstudents = [("Asha", 88), ("Raj", 95), ("Mia", 76)]\ntopper = sorted(students, key=lambda s: s[1], reverse=True)\nprint(topper[0])   # ("Raj", 95)', lang: "python" }
    },
    {
      id: "lists", title: "Lists (Deep Dive)",
      html: `
<p class="lead">Lists are Python's most-used collection - ordered, changeable, indexable.</p>
<h2>Methods</h2>
<ul>
  <li><code class="inline">append(x)</code> end - <code class="inline">insert(i, x)</code> middle - <code class="inline">remove(x)</code> - <code class="inline">pop(i)</code></li>
  <li><code class="inline">sort()</code> / <code class="inline">sorted()</code> - <code class="inline">reverse()</code> - <code class="inline">count(x)</code>, <code class="inline">index(x)</code></li>
  <li>Slicing: <code class="inline">l[1:4]</code> - <code class="inline">l[::-1]</code> reverse - <code class="inline">l += other</code> extend</li>
  <li>Nested lists = matrix: <code class="inline">g[i][j]</code></li>
</ul>`
,
      seed: { code: 'nums = [4, 2, 9, 1, 7]\nnums.append(5)\nnums.insert(0, 0)     # at start\nnums.sort()\nprint(nums)\nprint("max:", max(nums), "| sum:", sum(nums))\nmatrix = [[1, 2], [3, 4]]\nprint("cell:", matrix[1][0])', lang: "python" }
    },
    {
      id: "tuples", title: "Tuples - Immutable Sequences",
      html: `
<p class="lead">Tuples are fixed lists (parentheses) - hashable, so they can be dict keys and multiple return values.</p>
<h2>Use it</h2>
<ul>
  <li><code class="inline">t = (1, 2, 3)</code> - <code class="inline">a, b = t</code> - unpacking</li>
  <li>Swap: <code class="inline">x, y = y, x</code> - Python's famous trick</li>
  <li>Functions returning pairs: <code class="inline">return key, value</code></li>
  <li>No append - recreate: <code class="inline">t = t + (4,)</code></li>
</ul>`
,
      seed: { code: 'point = (10, 20)\nx, y = point\nprint("x:", x, "y:", y)\na, b = 1, 2\na, b = b, a     # swap!\nprint("swapped:", a, b)\npairs = [(1, "one"), (2, "two")]\nfor n, w in pairs:\n    print(n, "-", w)', lang: "python" }
    },
    {
      id: "sets", title: "Sets - Unique Members",
      html: `
<p class="lead">Sets store UNIQUE items with lightning membership tests - math-set style.</p>
<h2>Operations</h2>
<ul>
  <li><code class="inline">s.add(x)</code> - <code class="inline">x in s</code> - O(1) check</li>
  <li>Union <code class="inline">|</code> - intersection <code class="inline">&</code> - difference <code class="inline">-</code> - symmetric <code class="inline">^</code></li>
  <li>Remove duplicates from a list: <code class="inline">list(set(l))</code></li>
</ul>`
,
      seed: { code: 'a = {1, 2, 3, 4}\nb = {3, 4, 5, 6}\nprint("union:", a | b)\nprint("common:", a & b)\nprint("only a:", a - b)\nwords = ["a", "b", "a", "c", "b"]\nprint("unique:", sorted(set(words)))', lang: "python" }
    },
    {
      id: "for-loops", title: "for Loops (range, enumerate, zip)",
      html: `
<p class="lead"><code class="inline">for</code> walks any iterable; with <code class="inline">range</code>, <code class="inline">enumerate</code>, <code class="inline">zip</code> it covers real-world loops.</p>
<h2>Tools</h2>
<ul>
  <li><code class="inline">range(start, stop, step)</code> - stop is exclusive</li>
  <li><code class="inline">for i, item in enumerate(items):</code> - index + value</li>
  <li><code class="inline">for a, b in zip(names, scores):</code> - parallel iteration</li>
  <li><code class="inline">break</code> stop - <code class="inline">continue</code> skip</li>
</ul>`
,
      seed: { code: 'for i in range(2, 10, 2):\n    print(i, end=" ")\nprint()\nnames = ["A", "B", "C"]\nscores = [80, 95, 70]\nfor i, n in enumerate(names):\n    print(i, n)\nfor n, s in zip(names, scores):\n    print(n, "->", s)', lang: "python" }
    },
    {
      id: "comprehensions", title: "List & Dict Comprehensions",
      html: `
<p class="lead">One-liner loops that BUILD collections - the most Pythonic syntax you will learn.</p>
<h2>Forms</h2>
<ul>
  <li>Map: <code class="inline">[x*x for x in range(5)]</code></li>
  <li>Filter: <code class="inline">[x for x in n if x % 2 == 0]</code></li>
  <li>Dict: <code class="inline">{k: k*k for k in range(4)}</code> - Set: <code class="inline">{x%3 for x in n}</code></li>
  <li>Nested: <code class="inline">[b for row in g for b in row]</code></li>
</ul>`
,
      seed: { code: 'squares = [x * x for x in range(6)]\nevens = [x for x in squares if x % 2 == 0]\nprint(squares)\nprint(evens)\ncube = {k: k ** 3 for k in range(4)}\nprint(cube)\nprint("set:", sorted({x % 3 for x in range(10)}))', lang: "python" }
    },
    {
      id: "recursion", title: "Recursion - Functions Calling Themselves",
      html: `
<p class="lead">A recursive function solves a problem by calling itself on a smaller piece until it hits a base case.</p>
<h2>Pattern</h2>
<ul>
  <li>Base case - the stop condition (or an infinite loop!)</li>
  <li><code class="inline">factorial(n) = n * factorial(n-1)</code>, base case at 1</li>
  <li>Classics: Fibonacci, tree walks, divide and conquer</li>
  <li>Each call gets its own frame on the call stack</li>
</ul>`
,
      seed: { code: 'def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)\n\nprint("5! =", fact(5))\n\ndef fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nprint("fib:", [fib(i) for i in range(8)])', lang: "python" }
    },
    {
      id: "generators", title: "Generators and yield - Lazy Iteration",
      html: `
<p class="lead">Generators produce values ON DEMAND (memory-light) using <code class="inline">yield</code> - ideal for huge or infinite sequences.</p>
<h2>How</h2>
<ul>
  <li>A function containing <code class="inline">yield</code> becomes a generator</li>
  <li><code class="inline">next()</code> resumes exactly where it paused</li>
  <li>Generator expression: <code class="inline">(x*x for x in range(10**6))</code> - no full list in memory</li>
  <li>Works with for-loops, <code class="inline">sum()</code>, <code class="inline">any()</code>...</li>
</ul>`
,
      seed: { code: 'def countdown(n):\n    while n > 0:\n        yield n\n        n -= 1\n\nfor v in countdown(4):\n    print(v, end=" ")\nprint()\n\ndef squares(n):\n    i = 0\n    while i < n:\n        yield i * i\n        i += 1\n\nprint("sum of squares:", sum(squares(5)))', lang: "python" }
    },
    {
      id: "dates-json", title: "Dates and JSON in Python",
      html: `
<p class="lead">Two daily utilities: <code class="inline">datetime</code> for time and <code class="inline">json</code> for data exchange (APIs, files).</p>
<h2>datetime</h2>
<ul>
  <li><code class="inline">datetime.now()</code> - <code class="inline">strftime("%d %b %Y")</code> formatting</li>
  <li>Arithmetic with <code class="inline">timedelta</code></li>
</ul>
<h2>json</h2>
<ul>
  <li><code class="inline">json.dumps(obj)</code> to string - <code class="inline">json.loads(s)</code> to object</li>
  <li>dict becomes JSON object, list becomes array</li>
</ul>`
,
      seed: { code: 'from datetime import datetime, timedelta\n\nnow = datetime.now()\nprint(now.strftime("%d %b %Y, %H:%M"))\nprint(now + timedelta(days=7))\n\nimport json\nuser = {"name": "Shadow", "level": 7, "tags": ["pro", "neon"]}\ntext = json.dumps(user, indent=2)\nprint(text)\nback = json.loads(text)\nprint("name:", back["name"])', lang: "python" }
    },
    {
      id: "wrapup", title: "Python Summary & Next Steps",
      html: `
<p class="lead">Python course complete — from print() to lambdas. You now know the language's full core.</p>
<h2>You can now</h2>
<ul>
  <li>✔ Syntax, indentation, variables, all data types + casting</li>
  <li>✔ Conditions, for/while loops + loop else</li>
  <li>✔ Collections: list, tuple, dict, set + comprehensions</li>
  <li>✔ Functions, modules, pip + files and exceptions</li>
  <li>✔ OOP: classes, inheritance, dunders</li>
</ul>
<h2>Next steps</h2>
<ul>
  <li>🌐 Web apps → Flask / Django courses</li>
  <li>📊 Data → NumPy + Pandas courses</li>
  <li>⚙️ Algorithms → DSA course (Python-friendly!)</li>
</ul>`,
      seed: { code: 'done = ["syntax", "flow", "collections", "oop", "files"]\nprint("Python complete ✔")\nprint("Seekha:", ", ".join(done))', lang: "python" }
    }
  ]
};
