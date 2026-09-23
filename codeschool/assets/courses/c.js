/* GodxShadow course: C — start se end tak */
COURSES.c = {
  name: "C", color: "#4d8fd1", icon: "C", blurb: "Languages ka baap — memory, pointers, systems samajhne ki chabi.",
  lessons: [
    {
      id: "intro", title: "C Introduction",
      html: `
<p class="lead">C ek compiled, low-level-ish language hai (1972). OS, embedded systems, compilers — sab C mein likhe gaye hain.</p>
<h2>Pehla program</h2>
<h2>Structure</h2>
<ul>
  <li><code class="inline">#include &lt;stdio.h&gt;</code> — header</li>
  <li><code class="inline">int main()</code> — entry point</li>
  <li>Har statement ke baad <code class="inline">;</code></li>
  <li><code class="inline">printf()</code> output, <code class="inline">scanf()</code> input</li>
</ul>`,
      seed: { code: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\n");\n    int a = 5, b = 3;\n    printf("Sum = %d\n", a + b);\n    return 0;\n}', lang: "c" }
    },
    {
      id: "vars-io", title: "Variables, Types & I/O",
      html: `
<p class="lead">C statically typed hai — har variable ka type pehle se fix.</p>
<h2>Basic types</h2>
<ul>
  <li><code class="inline">int</code> (4B), <code class="inline">float</code>, <code class="inline">double</code>, <code class="inline">char</code></li>
  <li>Format specifiers: <code class="inline">%d %f %c %s</code></li>
  <li><code class="inline">scanf("%d", &amp;n);</code> — address dena zaroori (<code class="inline">&amp;</code>)</li>
</ul>`,
      seed: { code: '#include <stdio.h>\n\nint main() {\n    int age = 21;\n    float pi = 3.14f;\n    char grade = \'A\';\n    printf("age=%d pi=%.2f grade=%c\n", age, pi, grade);\n    return 0;\n}', lang: "c" }
    },
    {
      id: "control", title: "Conditions & Loops",
      html: `
<p class="lead">Control flow bilkul JS jaisa — bas braces <b>zaroori</b> hain.</p>
<ul>
  <li><code class="inline">if / else if / else</code>, <code class="inline">switch-case</code> (break yaad rakho!)</li>
  <li><code class="inline">for (int i=0; i&lt;n; i++)</code></li>
  <li><code class="inline">while</code>, <code class="inline">do...while</code></li>
</ul>
<div class="warn">C mein <code class="inline">=</code> assignment hai, <code class="inline">==</code> comparison — classic bug source.</div>`,
      seed: { code: '#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 5; i++) {\n        if (i % 2 == 0) printf("%d even\n", i);\n        else printf("%d odd\n", i);\n    }\n    return 0;\n}', lang: "c" }
    },
    {
      id: "functions", title: "Functions",
      html: `
<p class="lead">Function ka signature pehle likhna hota hai — return type + naam + params.</p>
<h2>Points</h2>
<ul>
  <li><code class="inline">int add(int a, int b) { return a + b; }</code></li>
  <li>Pass-by-value default hai — original nahi badalta</li>
  <li>Original badalna ho to pointer pass karo (<code class="inline">int *x</code>)</li>
  <li>Prototypes: header mein declare, baad mein define</li>
</ul>`,
      seed: { code: '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int t = *a; *a = *b; *b = t;\n}\n\nint main() {\n    int x = 1, y = 2;\n    swap(&x, &y);\n    printf("x=%d y=%d\n", x, y);  // x=2 y=1\n    return 0;\n}', lang: "c" }
    },
    {
      id: "pointers", title: "Pointers & Memory",
      html: `
<p class="lead">Pointer = memory address rakhta variable. C ki superpower (aur darr).</p>
<h2>Operators</h2>
<ul>
  <li><code class="inline">&amp;x</code> — x ka address</li>
  <li><code class="inline">*p</code> — p jis address par hai, uski value (dereference)</li>
  <li><code class="inline">int *p = &amp;x;</code></li>
</ul>
<h2>Dynamic memory</h2>
<p><code class="inline">malloc()</code> se heap par jagah lo, <code class="inline">free()</code> se lautao — warna memory leak.</p>`,
      seed: { code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int *arr = malloc(3 * sizeof(int));\n    for (int i = 0; i < 3; i++) arr[i] = i * 10;\n    printf("%d %d %d\n", arr[0], arr[1], arr[2]);\n    free(arr);\n    return 0;\n}', lang: "c" }
    },
    {
      id: "arrays-strings", title: "Arrays & Strings",
      html: `
<p class="lead">Array = contiguous memory. String = char array jiska end <code class="inline">\\0</code> se hota hai.</p>
<h2>Yaad rakho</h2>
<ul>
  <li>Size fix hota hai: <code class="inline">int a[5];</code></li>
  <li>Bounds check C <b>nahi</b> karta — tumhari zimmedari</li>
  <li>String ke liye <code class="inline">&lt;string.h&gt;</code>: <code class="inline">strlen, strcpy, strcmp, strcat</code></li>
</ul>`,
      seed: { code: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char name[20] = "Shadow";\n    int nums[4] = {1, 2, 3, 4};\n    printf("len=%lu first=%d\n", strlen(name), nums[0]);\n    return 0;\n}', lang: "c" }
    },
    {
      id: "structs", title: "Structs & typedef",
      html: `
<p class="lead">Struct = apna custom type — related data ko ek saath bandho (class ka purvaj).</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">struct Point { int x; int y; };</code></li>
  <li><code class="inline">struct Point p = {3, 4};</code> · <code class="inline">p.x</code></li>
  <li><code class="inline">typedef struct Point Point;</code> — shortcut naam</li>
</ul>`,
      seed: { code: '#include <stdio.h>\n\ntypedef struct {\n    char title[40];\n    int lessons;\n} Course;\n\nint main() {\n    Course c = {"HTML", 17};\n    printf("%s: %d lessons\n", c.title, c.lessons);\n    return 0;\n}', lang: "c" }
    },
    {
      id: "preprocessor", title: "Preprocessor & #define",
      html: `
<p class="lead">Compile se PEHLE preprocessor text-line-level kaam karta hai: includes, macros, conditional compile.</p>
<h2>Basics</h2>
<ul>
  <li><code class="inline">#define PI 3.14159</code> — text replacement</li>
  <li><code class="inline">#define SQ(x) ((x)*(x))</code> — macro (parentheses must!)</li>
  <li><code class="inline">#include &lt;stdio.h&gt;</code> system · <code class="inline">#include "mine.h"</code> local</li>
  <li>Include guard: <code class="inline">#ifndef H ... #define H ... #endif</code></li>
</ul>`,
      seed: { code: '#include <stdio.h>\n#define NEON_COLOR "#22e8ff"\n#define SQ(x) ((x) * (x))\n#define LOG(m) printf("[LOG] %s\n", m)\n\nint main() {\n    LOG("boot");\n    printf("SQ(9)=%d color=%s\n", SQ(9), NEON_COLOR);\n    return 0;\n}', lang: "c" }
    },
    {
      id: "file-io", title: "File I/O",
      html: `
<p class="lead">Compiler se pehli baar data disk par save karna.</p>
<h2>Pattern</h2>
<ul>
  <li><code class="inline">FILE *f = fopen("data.txt", "w")</code> · modes: r w a</li>
  <li><code class="inline">fprintf(f, ...)%fscanf(f, ...)</code> · <code class="inline">fgets()</code> line-wise (safe)</li>
  <li><code class="inline">fclose(f)</code> — kabhi mat bhoolo (leak!)</li>
  <li>Always check <code class="inline">f == NULL</code></li>
</ul>`,
      seed: { code: '#include <stdio.h>\n\nint main() {\n    FILE *f = fopen("scores.txt", "w");\n    if (!f) { puts("file nahi khuli"); return 1; }\n    fprintf(f, "asha 90\nravi 75\n");\n    fclose(f);\n\n    f = fopen("scores.txt", "r");\n    char name[20]; int score;\n    while (fscanf(f, "%19s %d", name, &score) == 2)\n        printf("%s -> %d\n", name, score);\n    fclose(f);\n    return 0;\n}', lang: "c" }
    },
    {
      id: "syntax", title: "Syntax & printf Deep Dive",
      html: `
<p class="lead">C ka skeleton — har C programmer ki shuruaat.</p>
<h2>Format specifiers</h2>
<ul>
  <li><code class="inline">%d</code> int · <code class="inline">%f</code> float · <code class="inline">%c</code> char · <code class="inline">%s</code> string</li>
  <li><code class="inline">%.2f</code> — 2 decimal tak</li>
  <li>Escape: <code class="inline">\\n, \\t, \\", \\\\</code></li>
  <li><code class="inline">return 0;</code> — success signal OS ko</li>
</ul>`,
      seed: { code: '#include <stdio.h>\n\nint main(void) {\n    int age = 21;\n    float pi = 3.14159f;\n    printf("Age: %d\n", age);\n    printf("Pi ~ %.2f\n", pi);\n    printf("Grade: %c\n", 65);      // A\n    printf("Tab	here\n");\n    return 0;\n}', lang: "c" }
    },
    {
      id: "datatypes", title: "Data Types, Sizes & Limits",
      html: `
<p class="lead">C mein memory seedha control mein — type ka size JAANO zaroori hai.</p>
<h2>Core types</h2>
<ul>
  <li><code class="inline">char</code> 1B · <code class="inline">int</code> 4B · <code class="inline">float</code> 4B · <code class="inline">double</code> 8B</li>
  <li>Modifiers: <code class="inline">short, long, long long, unsigned</code></li>
  <li><code class="inline">sizeof()</code> operator — compile time check</li>
  <li>C99 bool: <code class="inline">#include &lt;stdbool.h&gt;</code> → <code class="inline">bool true false</code></li>
</ul>`,
      seed: { code: '#include <stdio.h>\n#include <stdbool.h>\n\nint main(void) {\n    printf("char: %zu byte\n", sizeof(char));\n    printf("int: %zu bytes\n", sizeof(int));\n    printf("long: %zu bytes\n", sizeof(long));\n    printf("double: %zu bytes\n", sizeof(double));\n    unsigned int big = 4000000000u;\n    printf("unsigned max-ish: %u\n", big);\n    bool ok = true;\n    printf("bool size: %zu\n", sizeof(ok));\n}', lang: "c" }
    },
    {
      id: "operators", title: "Operators & Bitwise Tricks",
      html: `
<p class="lead">C ke powerful operators — systems programming ki asli taakat.</p>
<h2>Categories</h2>
<ul>
  <li>Arithmetic: <code class="inline">+ - * / %</code> · Increment: <code class="inline">++i vs i++</code></li>
  <li>Bitwise: <code class="inline">&amp; | ^ ~ &lt;&lt; &gt;&gt;</code></li>
  <li>Shorthand: <code class="inline">+= -= *=</code></li>
  <li>Ternary: <code class="inline">even ? "haan" : "nahi"</code></li>
  <li>Logic short-circuit: <code class="inline">&amp;&amp; ||</code></li>
</ul>`,
      seed: { code: '#include <stdio.h>\n\nint main(void) {\n    int x = 6;               // 110 in binary\n    printf("x << 1 = %d\n", x << 1);   // 12 (x * 2)\n    printf("x & 3 = %d\n", x & 3);     // 2\n    printf("x ^ 3 = %d\n", x ^ 3);     // 5\n\n    int i = 5;\n    printf("++i = %d\n", ++i);         // 6 (pehle badhao)\n    printf("i++ = %d\n", i++);         // 6 (pehle use karo)\n    printf("now i = %d\n", i);         // 7\n\n    int n = 7;\n    printf("%d is %s\n", n, n % 2 == 0 ? "even" : "odd");\n}', lang: "c" }
    },
    {
      id: "math", title: "math.h & stdlib Utilities",
      html: `
<p class="lead">Standard library ke gems — compile karte time <code class="inline">-lm</code> flag yaad rakho.</p>
<h2>&lt;math.h&gt;</h2>
<ul>
  <li><code class="inline">pow(), sqrt(), fabs(), ceil(), floor(), round()</code></li>
  <li><code class="inline">sin(), cos()</code> — radians mein</li>
</ul>
<h2>&lt;stdlib.h&gt;</h2>
<ul>
  <li><code class="inline">rand(), srand(time(0))</code> — random</li>
  <li><code class="inline">atoi(), atof()</code> — string → number</li>
  <li><code class="inline">abs()</code> — int absolute</li>
</ul>`,
      seed: { code: '#include <stdio.h>\n#include <math.h>\n#include <stdlib.h>\n\nint main(void) {\n    printf("pow(2,10) = %.0f\n", pow(2, 10));\n    printf("sqrt(144) = %.1f\n", sqrt(144));\n    printf("round(3.6) = %.0f\n", round(3.6));\n\n    int r = rand() % 100;          // 0-99\n    printf("random = %d\n", r);\n\n    int n = atoi("42");\n    printf("atoi + 8 = %d\n", n + 8);\n}', lang: "c" }
    },
    {
      id: "enums", title: "Enums & typedef",
      html: `
<p class="lead">Named constants — magic numbers ki jagah readable code.</p>
<h2>enum</h2>
<ul>
  <li><code class="inline">enum Day { MON, TUE, WED };</code> — auto 0,1,2</li>
  <li>Explicit values: <code class="inline">enum Status { OK = 200, NOT_FOUND = 404 }</code></li>
  <li>Switch ke saath perfect match</li>
</ul>
<h2>typedef</h2>
<ul>
  <li><code class="inline">typedef unsigned long ulong;</code> — apna alias</li>
  <li>Struct ke saath: <code class="inline">typedef struct {...} Point;</code></li>
</ul>`,
      seed: { code: '#include <stdio.h>\n\nenum Level { LOW = 1, MEDIUM = 5, HIGH = 10 };\ntypedef unsigned int uint;\n\nint main(void) {\n    enum Level game = HIGH;\n    switch (game) {\n        case LOW:    printf("Easy mode\n"); break;\n        case MEDIUM: printf("Normal mode\n"); break;\n        case HIGH:   printf("HARD mode!\n"); break;\n    }\n    uint score = 9999;\n    printf("Score: %u\n", score);\n}', lang: "c" }
    },
    {
      id: "memory", title: "Dynamic Memory (malloc / calloc / free)",
      html: `
<p class="lead">Heap se runtime par memory lo — C ka sabse powerful aur dangerous topic.</p>
<h2>Functions (&lt;stdlib.h&gt;)</h2>
<ul>
  <li><code class="inline">malloc(n * sizeof(int))</code> — raw memory</li>
  <li><code class="inline">calloc(n, sizeof(int))</code> — zero-initialized</li>
  <li><code class="inline">realloc(ptr, newsize)</code> — resize</li>
  <li><code class="inline">free(ptr)</code> — MUST call! warna memory leak</li>
  <li>Check <code class="inline">if (ptr == NULL)</code> — allocation fail ho sakti hai</li>
</ul>`,
      seed: { code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n = 5;\n    int *arr = malloc(n * sizeof(int));   // heap array\n    if (arr == NULL) { printf("fail!\n"); return 1; }\n\n    for (int i = 0; i < n; i++) arr[i] = (i + 1) * 10;\n    for (int i = 0; i < n; i++) printf("%d ", arr[i]);\n    printf("\n");\n\n    free(arr);          // ZAROORI — leak roko\n    arr = NULL;         // dangling pointer se bachao\n    printf("freed safely\n");\n}', lang: "c" }
    },
    {
      id: "string-fns", title: "string.h Functions Masterclass",
      html: `
<p class="lead">C strings = char arrays + null terminator. string.h unko handle karta hai.</p>
<h2>Essential functions</h2>
<ul>
  <li><code class="inline">strlen, strcpy, strncpy</code> — length/copy</li>
  <li><code class="inline">strcat, strncat</code> — join</li>
  <li><code class="inline">strcmp(a, b)</code> — 0 = equal, &lt;0 / &gt;0 = order</li>
  <li><code class="inline">strchr, strstr</code> — search</li>
  <li><code class="inline">snprintf(buf, size, ...)</code> — safe formatting</li>
</ul>`,
      seed: { code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char a[50] = "Godx";\n    char b[] = "Shadow";\n\n    printf("len: %zu\n", strlen(a));\n    strcat(a, "Shadow");\n    printf("joined: %s\n", a);              // GodxShadow\n    printf("cmp: %d\n", strcmp(a, b));      // same? 0\n    printf("find: %s\n", strstr(a, "Shadow"));\n\n    char buf[30];\n    snprintf(buf, sizeof(buf), "Score: %d", 100);\n    printf("%s\n", buf);\n}', lang: "c" }
    },
    {
      id: "argv", title: "Command-Line Arguments (argv)",
      html: `<p class="lead">Programs receive arguments from the shell via <code class="inline">argc</code> (count) and <code class="inline">argv</code> (array of strings) in main.</p>
<h2>Usage</h2>
<ul>
  <li><code class="inline">int main(int argc, char *argv[])</code></li>
  <li><code class="inline">argv[0]</code> = program name; <code class="inline">argv[1]</code> = first argument</li>
  <li>Convert with <code class="inline">atoi()</code> / <code class="inline">strtol()</code></li>
  <li>Loop safely: <code class="inline">for (int i = 1; i &lt; argc; i++)</code></li>
</ul>`,
      seed: { code: '#include <stdio.h>\n#include <stdlib.h>\nint main(int argc, char *argv[]) {\n    printf("Program: %s\\n", argv[0]);\n    for (int i = 1; i < argc; i++)\n        printf("arg %d: %s\\n", i, argv[i]);\n    if (argc > 1) {\n        int n = atoi(argv[1]);\n        printf("As number: %d\\n", n);\n    }\n    return 0;\n}', lang: "c" }
    },
    {
      id: "malloc", title: "Dynamic Memory (malloc / free)",
      html: `<p class="lead">The heap: request memory at runtime with <code class="inline">malloc</code>, release with <code class="inline">free</code>. Sizes can be decided while running.</p>
<h2>Rules</h2>
<ul>
  <li><code class="inline">int *p = malloc(n * sizeof(int));</code> - always check for NULL</li>
  <li><code class="inline">free(p); p = NULL;</code> - every malloc needs a free (leaks!)</li>
  <li><code class="inline">realloc(p, newSize)</code> - grow or shrink</li>
  <li>Double free or use-after-free = crashes and security bugs</li>
</ul>`,
      seed: { code: '#include <stdio.h>\n#include <stdlib.h>\nint main() {\n    int n = 5;\n    int *a = malloc(n * sizeof(int));\n    if (!a) { printf("alloc failed\\n"); return 1; }\n    for (int i = 0; i < n; i++) a[i] = i * i;\n    for (int i = 0; i < n; i++) printf("%d ", a[i]);\n    printf("\\n");\n    a = realloc(a, 8 * sizeof(int));\n    for (int i = 5; i < 8; i++) a[i] = 100 + i;\n    printf("size now: %d, a[7] = %d\\n", 8, a[7]);\n    free(a);\n    return 0;\n}', lang: "c" }
    },
    {
      id: "recursion-c", title: "Recursion in C",
      html: `<p class="lead">C functions call themselves - each call gets fresh local variables on the stack until the base case stops it.</p>
<h2>Pattern</h2>
<ul>
  <li>Base case first, then the recursive step</li>
  <li><code class="inline">factorial(n) = n * factorial(n-1)</code>, base <code class="inline">n &lt;= 1</code></li>
  <li>Fibonacci: <code class="inline">fib(n) = fib(n-1) + fib(n-2)</code> (slow - memoize in practice)</li>
  <li>Useful for: trees, divide &amp; conquer, backtracking</li>
</ul>`,
      seed: { code: '#include <stdio.h>\nint fact(int n) {\n    if (n <= 1) return 1;\n    return n * fact(n - 1);\n}\nint fib(int n) {\n    if (n < 2) return n;\n    return fib(n - 1) + fib(n - 2);\n}\nint main() {\n    printf("5! = %d\\n", fact(5));\n    for (int i = 0; i < 8; i++)\n        printf("%d ", fib(i));\n    printf("\\n");\n    return 0;\n}', lang: "c" }
    },
    {
      id: "bitwise", title: "Bitwise Operators - Work with Bits",
      html: `<p class="lead">Shifts and masks manipulate individual bits - flags, protocol parsing, fast math.</p>
<h2>Operators</h2>
<ul>
  <li><code class="inline">&amp;</code> AND - <code class="inline">|</code> OR - <code class="inline">^</code> XOR - <code class="inline">~</code> NOT</li>
  <li><code class="inline">&lt;&lt;</code> shift left (x2) - <code class="inline">&gt;&gt;</code> shift right (/2)</li>
  <li>Set bit: <code class="inline">flags |= (1 &lt;&lt; i)</code> - clear: <code class="inline">flags &amp;= ~(1 &lt;&lt; i)</code> - test: <code class="inline">flags &amp; (1 &lt;&lt; i)</code></li>
  <li>Parity check, swap with XOR, power-of-two tests</li>
</ul>`,
      seed: { code: '#include <stdio.h>\nint main() {\n    unsigned int flags = 0;\n    flags |= (1 << 0);   // set bit 0\n    flags |= (1 << 3);   // set bit 3\n    printf("flags: %u\\n", flags);\n    printf("bit 0 set? %d\\n", (flags & (1 << 0)) != 0);\n    printf("bit 1 set? %d\\n", (flags & (1 << 1)) != 0);\n    flags &= ~(1 << 3);  // clear bit 3\n    printf("after clear: %u\\n", flags);\n    printf("shift: 1 << 4 = %d\\n", 1 << 4);\n    return 0;\n}', lang: "c" }
    },
    {
      id: "unions", title: "Unions - Shared Memory",
      html: `<p class="lead">A union stores different types in the SAME memory (unlike struct) - compact, low-level data tricks.</p>
<h2>When used</h2>
<ul>
  <li>Interpret raw bytes: read a float as its 4 integers</li>
  <li>Network protocols, hardware registers</li>
  <li>All members share offset 0 - size = largest member</li>
  <li>Only the LAST WRITTEN member is valid</li>
</ul>`,
      seed: { code: '#include <stdio.h>\nunion Value {\n    int i;\n    float f;\n    unsigned char bytes[4];\n};\nint main() {\n    union Value v;\n    v.f = 1.0f;\n    printf("float: %f\\n", v.f);\n    for (int i = 0; i < 4; i++)\n        printf("byte %d: %02x\\n", i, v.bytes[i]);\n    v.i = 0x41424344;\n    printf("int as hex: %x\\n", v.i);\n    printf("union size: %zu\\n", sizeof(v));\n    return 0;\n}', lang: "c" }
    },
    {
      id: "typedef-c", title: "typedef &amp; struct Pointers",
      html: `<p class="lead"><code class="inline">typedef</code> creates friendly names for types; struct pointers are how C passes structs around efficiently.</p>
<h2>Usage</h2>
<ul>
  <li><code class="inline">typedef unsigned int uint;</code> - new alias, same type</li>
  <li><code class="inline">typedef struct Point Point;</code> - drop the struct keyword</li>
  <li>Pointer to struct: <code class="inline">Point *p</code> - access with <code class="inline">p-&gt;x</code></li>
  <li>Callback types: <code class="inline">typedef void (*Handler)(int);</code></li>
</ul>`,
      seed: { code: '#include <stdio.h>\ntypedef unsigned int uint;\ntypedef struct { int x; int y; } Point;\ntypedef void (*Handler)(int);\nvoid show(int v) { printf("handler got %d\\n", v); }\nint main() {\n    uint a = 42;\n    Point p = {3, 4};\n    Point *pp = &p;\n    printf("point: (%d, %d)\\n", p.x, pp->y);\n    Handler h = show;\n    h(a);\n    printf("uint is %zu bytes\\n", sizeof(a));\n    return 0;\n}', lang: "c" }
    },
    {
      id: "static-c", title: "static Variables - Persistent State",
      html: `<p class="lead"><code class="inline">static</code> inside a function keeps a value between calls; <code class="inline">static</code> at file scope hides it from other files.</p>
<h2>Two meanings</h2>
<ul>
  <li>Local static: initialized once, survives calls - perfect counters</li>
  <li>File-scope static: internal linkage - only this .c file sees it</li>
  <li>Static globals + local statics both live for the program's whole run</li>
</ul>`,
      seed: { code: '#include <stdio.h>\nstatic int callCount = 0;\nint nextId() {\n    static int id = 100;\n    id++;\n    callCount++;\n    return id;\n}\nint main() {\n    printf("id1: %d\\n", nextId());\n    printf("id2: %d\\n", nextId());\n    printf("calls: %d\\n", callCount);\n    return 0;\n}', lang: "c" }
    },
    {
      id: "multi-file", title: "Multi-File Programs (Linking)",
      html: `<p class="lead">Real C programs split into multiple .c files + headers - the linker combines them into one binary.</p>
<h2>Structure</h2>
<ul>
  <li>.h = declarations (what) - .c = definitions (how)</li>
  <li><code class="inline">#include "utils.h"</code> - compiler needs the signature</li>
  <li>Compile each file: <code class="inline">gcc main.c utils.c -o app</code></li>
  <li>Include guards: <code class="inline">#ifndef / #define / #endif</code> prevent double-include</li>
  <li>One Definition Rule: exactly ONE definition per symbol</li>
</ul>`,
      seed: { code: '// utils.h  (shared header)\n// #ifndef UTILS_H\n// #define UTILS_H\n// int add(int a, int b);\n// #endif\n\n// utils.c\n// int add(int a, int b) { return a + b; }\n\n// main.c  (paste all three into one file here)\n#include <stdio.h>\nint add(int a, int b) { return a + b; }\nint main() {\n    printf("add(2,3) = %d\\n", add(2, 3));\n    return 0;\n}', lang: "c" }
    },
    {
      id: "stdlib", title: "The Standard Library Toolbox",
      html: `<p class="lead">C ships with powerful standard headers - string, math, time, memory - most programs combine several.</p>
<h2>Highlights</h2>
<ul>
  <li>&lt;string.h&gt;: <code class="inline">strlen, strcpy, strcmp, strcat, strncpy</code></li>
  <li>&lt;math.h&gt;: <code class="inline">sqrt, pow, sin, fabs, floor</code> (link with -lm)</li>
  <li>&lt;stdlib.h&gt;: <code class="inline">atoi, rand, srand, qsort, abs</code></li>
  <li>&lt;time.h&gt;: <code class="inline">time, clock, ctime, strftime</code></li>
</ul>`,
      seed: { code: '#include <stdio.h>\n#include <string.h>\n#include <math.h>\n#include <stdlib.h>\n#include <time.h>\nint main() {\n    const char *s = "C stdlib";\n    printf("len: %zu\\n", strlen(s));\n    printf("sqrt(2): %f\\n", sqrt(2.0));\n    srand((unsigned)time(NULL));\n    for (int i = 0; i < 5; i++)\n        printf("%d ", rand() % 100);\n    printf("\\n");\n    int arr[] = {5, 1, 4, 2, 3};\n    qsort(arr, 5, sizeof(int), (int(*)(const void*,const void*))NULL);\n    return 0;\n}', lang: "c" }
    },
    {
      id: "c-advanced", title: "Putting It All Together",
      html: `<p class="lead">A realistic mini-program: parse input, grow storage, sort, report - using pointers, heap, and the stdlib together.</p>
<h2>What's inside</h2>
<ul>
  <li>Reading a count + numbers from argv</li>
  <li>Dynamic array with <code class="inline">realloc</code></li>
  <li>Custom <code class="inline">qsort</code> comparator</li>
  <li>Statistics: min, max, average via <code class="inline">float</code> math</li>
</ul>`,
      seed: { code: '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\nint cmp(const void *a, const void *b) {\n    return *(const int*)a - *(const int*)b;\n}\nint main(int argc, char **argv) {\n    int n = argc - 1;\n    if (n <= 0) { printf("usage: prog 3 1 2\\n"); return 1; }\n    int *a = malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) a[i] = atoi(argv[1 + i]);\n    qsort(a, n, sizeof(int), cmp);\n    double sum = 0;\n    for (int i = 0; i < n; i++) {\n        printf("%d ", a[i]);\n        sum += a[i];\n    }\n    printf("\\nmin=%d max=%d avg=%.2f\\n", a[0], a[n-1], sum / n);\n    free(a);\n    return 0;\n}', lang: "c" }
    },
    {
      id: "wrapup", title: "C Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — ab tum jaante ho ki andar engine kaise chalta hai.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Types, I/O, control flow, functions</li>
  <li>Pointers, malloc/free, arrays, strings</li>
  <li>Structs — custom types</li>
</ul>
<h2>Agla step</h2>
<p>OOP ke saath modern systems ke liye <b>C++</b> · managed world ke liye <b>C#</b> ya <b>Java</b>.</p>`,
      seed: { code: '/* C complete ✔\n   Agla boss: C++ */\n#include <stdio.h>\nint main() { printf("Level up!\n"); return 0; }', lang: "c" }
    }
  ]
};
