/* GodxShadow course: PHP — start se end tak */
COURSES.php = {
  name: "PHP", color: "#8a7dff", icon: "php", blurb: "Web ke 70% websites isi par — form se lekar full CMS tak.",
  lessons: [
    {
      id: "intro", title: "PHP Introduction",
      html: `
<p class="lead">PHP ek server-side language hai — Code HTML ke andar ghus jaata hai aur page generate karta hai. WordPress, Facebook (shuru mein), Laravel sab PHP.</p>
<h2>Pehla program</h2>
<h2>Key points</h2>
<ul>
  <li>File <code class="inline">.php</code> hoti hai, server par chalti hai (Apache/Nginx + PHP)</li>
  <li>Code <code class="inline">&lt;?php ... ?&gt;</code> ke andar</li>
  <li>Variable $ se shuru: <code class="inline">$name</code></li>
  <li>Local run: <code class="inline">php -S localhost:8000</code></li>
</ul>`,
      seed: { code: '<?php\n$name = "GodxShadow";\n$year = 2026;\n\necho "<h1>Welcome to $name</h1>";\necho "Year: " . $year;\n?>', lang: "php" }
    },
    {
      id: "vars-strings", title: "Variables & Strings",
      html: `
<p class="lead">PHP variables <code class="inline">$</code> se shuru hote hain, dynamically typed hain.</p>
<h2>String powers</h2>
<ul>
  <li>Double quotes mein variables interpolate: <code class="inline">"Hi $name"</code></li>
  <li><code class="inline">strlen, strtoupper, str_replace, str_contains, explode, implode</code></li>
  <li>Concatenation dot se: <code class="inline">$a . $b</code> (plus nahi!)</li>
</ul>`,
      seed: { code: '<?php\n$name = "shadow";\necho strlen($name);            // 6\necho strtoupper($name);        // SHADOW\necho str_replace("sha", "&#9733;", $name);\n$parts = explode("-", "html-css-js");\nprint_r($parts);\n?>', lang: "php" }
    },
    {
      id: "control", title: "Conditions & Loops",
      html: `
<p class="lead">Flow control JS/C-family jaisa, plus <code class="inline">foreach</code> ka laziz version.</p>
<ul>
  <li><code class="inline">if / elseif / else</code></li>
  <li><code class="inline">foreach ($arr as $item)</code> aur <code class="inline">foreach ($m as $k =&gt; $v)</code></li>
  <li><code class="inline">match($x) { ... }</code> — PHP 8+ ka switch</li>
  <li>Null-safe: <code class="inline">??</code>, <code class="inline">?-&gt;</code></li>
</ul>`,
      seed: { code: '<?php\n$skills = ["HTML", "CSS", "JS"];\nforeach ($skills as $i => $s) {\n    echo "$i: $s<br>";\n}\n\n$score = 85;\necho match(true) {\n    $score >= 90 => "A+",\n    $score >= 75 => "A",\n    default => "B",\n};\n?>', lang: "php" }
    },
    {
      id: "functions", title: "Functions & Arrays",
      html: `
<p class="lead">PHP ke functions flexible hain — default params, arrow functions (PHP 7.4+).</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">function greet($n = "Guest") { return "Hi $n"; }</code></li>
  <li>Arrow: <code class="inline">$sq = fn($n) =&gt; $n * $n;</code></li>
  <li>Type declarations: <code class="inline">function add(int $a, int $b): int</code></li>
</ul>
<h2>Array functions</h2>
<p><code class="inline">array_map, array_filter, array_merge, in_array, usort</code> — sab built-in.</p>`,
      seed: { code: '<?php\n$prices = [120, 340, 55, 900];\n\n$big = array_filter($prices, fn($p) => $p > 100);\nprint_r($big);\n\necho array_sum($prices);   // 1415\n?>', lang: "php" }
    },
    {
      id: "forms", title: "Forms: GET & POST",
      html: `
<p class="lead">PHP ka most common kaam — HTML form ko handle karna.</p>
<h2>Superglobals</h2>
<ul>
  <li><code class="inline">$_GET</code> — URL ke params</li>
  <li><code class="inline">$_POST</code> — form data (hidden)</li>
  <li><code class="inline">$_REQUEST</code> — dono</li>
  <li><code class="inline">$_SERVER</code> — server info</li>
</ul>
<div class="warn"><b>Security:</b> user input hamesha <code class="inline">htmlspecialchars()</code> se escape karo aur <b>prepared statements</b> se DB mein daalo.</div>`,
      seed: { code: '<?php\nif ($_SERVER["REQUEST_METHOD"] === "POST") {\n    $email = htmlspecialchars($_POST["email"] ?? "");\n    echo "Thanks! Subscribed: $email";\n} else {\n    ?>\n    <form method="post">\n      <input type="email" name="email" required>\n      <button>Join</button>\n    </form>\n    <?php\n}\n?>', lang: "php" }
    },
    {
      id: "sessions", title: "Cookies & Sessions",
      html: `
<p class="lead">User ko yaad rakhna — login state, cart, preferences.</p>
<h2>Cookie</h2>
<p>Browser mein store: <code class="inline">setcookie("user", "sha", time()+86400);</code> → <code class="inline">$_COOKIE["user"]</code></p>
<h2>Session</h2>
<p>Server par store: <code class="inline">session_start();</code> → <code class="inline">$_SESSION["u"] = "x";</code> · Logout: <code class="inline">session_destroy();</code></p>`,
      seed: { code: '<?php\nsession_start();\n$_SESSION["user"] = "Shadow";\n$_SESSION["level"] = 99;\n\nsetcookie("theme", "neon", time() + 86400);\n\necho "Logged in as " . $_SESSION["user"];\n?>', lang: "php" }
    },
    {
      id: "mysql", title: "PHP + MySQL",
      html: `
<p class="lead">PHP aur MySQL ka combo web ka classic stack hai — <b>PDO</b> se connect karo.</p>
<h2>Prepared statements (must!)</h2>
<p>SQL injection se bachne ka raaz — data kabhi query mein seedha mat jodo.</p>
<h2>CRUD flow</h2>
<ul>
  <li><code class="inline">connect → prepare → execute → fetch/fetchAll</code></li>
  <li>SELECT ke liye <code class="inline">fetchAll(PDO::FETCH_ASSOC)</code></li>
  <li>INSERT/UPDATE ke liye <code class="inline">execute!</code></li>
</ul>`,
      seed: { code: '<?php\n$db = new PDO("mysql:host=localhost;dbname=shop", "root", "pass");\n$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);\n\n// INSERT — prepared!\n$stmt = $db->prepare("INSERT INTO users (name, email) VALUES (?, ?)");\n$stmt->execute(["Asha", "asha@x.com"]);\n\n// SELECT\n$rows = $db->query("SELECT * FROM users LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);\nprint_r($rows);\n?>', lang: "php" }
    },
    {
      id: "apis", title: "JSON API & Modern PHP",
      html: `
<p class="lead">PHP se JSON API banana — frontend (JS/React) ko data dena.</p>
<h2>JSON</h2>
<ul>
  <li><code class="inline">header("Content-Type: application/json");</code></li>
  <li><code class="inline">echo json_encode($data);</code> · input: <code class="inline">json_decode(file_get_contents("php://input"), true)</code></li>
</ul>
<h2>Modern PHP</h2>
<p><b>Composer</b> (packages), <b>Laravel</b> (framework), <b>PSR standards</b>, namespaces.</p>`,
      seed: { code: '<?php\nheader("Content-Type: application/json");\n\n$api = [\n    "status" => "ok",\n    "data" => ["course" => "PHP", "lessons" => 9]\n];\n\necho json_encode($api, JSON_PRETTY_PRINT);\n?>', lang: "php" }
    },
    {
      id: "datatypes", title: "Data Types & Casting (var_dump)",
      html: `
<p class="lead">PHP loosely typed hai — var_dump se type + value dono dekho.</p>
<h2>Types</h2>
<ul>
  <li><code class="inline">int, float, string, bool, array, object, NULL</code></li>
  <li>Cast: <code class="inline">(int)"123"</code>, <code class="inline">intval()</code>, <code class="inline">(string)$n</code></li>
  <li>Checks: <code class="inline">is_int(), is_string(), is_array()</code></li>
  <li><code class="inline">gettype($x)</code> vs <code class="inline">settype()</code></li>
</ul>`,
      seed: { code: '<?php\n    $i = 21;\n    $f = 3.14;\n    $s = "shadow";\n    $b = true;\n    $arr = ["a", "b"];\n\n    var_dump($i);      // int(21)\n    var_dump($f);\n    var_dump($s);\n    var_dump((int)"99 hello");  // int(99)\n    var_dump(is_array($arr));   // bool(true)\n    echo gettype($f);           // double\n?>', lang: "php" }
    },
    {
      id: "operators", title: "Operators (== vs === & More)",
      html: `
<p class="lead">PHP ka comparison khatarnak loose hai — strict === use karo!</p>
<h2>Key</h2>
<ul>
  <li><code class="inline">==</code> loose (type juggle) · <code class="inline">===</code> strict (type+value)</li>
  <li><code class="inline">. </code> string concat · <code class="inline">.= </code> append</li>
  <li><code class="inline">?? </code> null coalesce · <code class="inline">?: </code> short ternary</li>
  <li><code class="inline">&lt;=&gt; </code> spaceship operator (−1, 0, 1)</li>
</ul>`,
      seed: { code: '<?php\n    var_dump(1 == "1");    // true (loose!)\n    var_dump(1 === "1");   // false (strict)\n\n    $name = $_GET["name"] ?? "Guest";  // null-safe default\n    $age = 21;\n    $msg = ($age >= 18) ? "adult" : "minor";\n    echo $name . " is " . $msg;\n\n    echo 5 <=> 10;   // -1\n    echo 10 <=> 10;  // 0\n?>', lang: "php" }
    },
    {
      id: "arrays", title: "Arrays & Array Functions",
      html: `
<p class="lead">PHP arrays = list + map dono. 80+ builtin functions!</p>
<h2>Daily functions</h2>
<ul>
  <li><code class="inline">count(), in_array(), array_push()</code></li>
  <li><code class="inline">array_map(), array_filter(), array_reduce()</code></li>
  <li><code class="inline">sort(), rsort(), usort()</code></li>
  <li>Associative: <code class="inline">array_keys(), array_values()</code></li>
</ul>`,
      seed: { code: '<?php\n    $langs = ["php", "js", "python"];\n    array_push($langs, "rust");\n    echo count($langs);              // 4\n\n    $scores = ["ravi" => 95, "asha" => 88];\n    $names = array_map(fn($s) => strtoupper($s), $langs);\n    print_r($names);\n    print_r(array_keys($scores));\n\n    $big = array_filter($scores, fn($m) => $m > 90);\n    print_r($big);                   // ravi => 95\n?>', lang: "php" }
    },
    {
      id: "oop", title: "OOP in PHP (Classes & Inheritance)",
      html: `
<p class="lead">PHP 8 se modern OOP — constructor promotion tak.</p>
<h2>Core</h2>
<ul>
  <li><code class="inline">class User { public string $name; }</code></li>
  <li>PHP 8: <code class="inline">public function __construct(public string $name) {}</code></li>
  <li><code class="inline">extends</code> inheritance · <code class="inline">implements</code> interfaces</li>
  <li><code class="inline">$this-&gt;</code> current object · <code class="inline">self::</code> static</li>
</ul>`,
      seed: { code: '<?php\n    class Player {\n        public function __construct(\n            public string $name,\n            private int $hp = 100\n        ) {}\n        public function heal(int $amt): int {\n            return $this->hp += $amt;\n        }\n    }\n\n    class Pro extends Player {\n        public function boost(): string {\n            return $this->name . " boosted!";\n        }\n    }\n\n    $p = new Pro("Shadow", 80);\n    echo $p->heal(20);      // 100\n    echo $p->boost();\n?>', lang: "php" }
    },
    {
      id: "files", title: "File Handling (read / write / append)",
      html: `
<p class="lead">Server pe files padho/likho — logs, uploads, cache sab yahin se.</p>
<h2>Quick functions</h2>
<ul>
  <li><code class="inline">file_get_contents()</code> / <code class="inline">file_put_contents()</code> — one-liners</li>
  <li><code class="inline">fopen($f, "r"|"w"|"a")</code> + <code class="inline">fwrite/fgets + fclose</code> — control</li>
  <li><code class="inline">file_exists(), filesize(), unlink()</code></li>
  <li>Uploads: <code class="inline">$_FILES</code> + <code class="inline">move_uploaded_file()</code></li>
</ul>`,
      seed: { code: '<?php\n    // write + read (one-liners)\n    file_put_contents("log.txt", "Run at 10:00\n");\n    file_put_contents("log.txt", "More...\n", FILE_APPEND);\n\n    echo file_get_contents("log.txt");\n\n    // manual control\n    $h = fopen("log.txt", "a");\n    fwrite($h, "via handle\n");\n    fclose($h);\n\n    echo filesize("log.txt") . " bytes";\n    if (file_exists("log.txt")) unlink("log.txt");  // cleanup\n?>', lang: "php" }
    },
    {
      id: "inheritance-php", title: "OOP Inheritance (extends)",
      html: `<p class="lead">PHP classes extend each other with <code class="inline">extends</code>; <code class="inline">parent::</code> calls the parent version.</p>
<h2>Key points</h2>
<ul>
  <li><code class="inline">class Dog extends Animal</code> - inherits public/protected members</li>
  <li><code class="inline">parent::__construct()</code> - call parent constructor</li>
  <li><code class="inline">final</code> - stop further inheritance or method override</li>
  <li><code class="inline">instanceof</code>, <code class="inline">get_class()</code> - runtime type checks</li>
</ul>`,
      seed: { code: 'class Animal {\n    protected $name;\n    public function __construct($name) { $this->$name = $name; }\n    public function speak() { return "..."; }\n}\nclass Dog extends Animal {\n    public function speak() { return $this->$name . " says Woof!"; }\n}\nclass Cat extends Animal {\n    final public function speak() { return $this->$name . " says Meow!"; }\n}\n$d = new Dog("Rex");\necho $d->speak() . "\\n";\n$c = new Cat("Mimi");\necho $c->speak() . "\\n";\necho ($d instanceof Animal) ? "is animal" : "";', lang: "php" }
    },
    {
      id: "security-php", title: "Security: Input, SQLi, XSS",
      html: `<p class="lead">The three classic web attacks and the standard defenses every PHP app needs.</p>
<h2>Defenses</h2>
<ul>
  <li><b>SQL injection</b> -&gt; PDO prepared statements (never string-built SQL)</li>
  <li><b>XSS</b> -&gt; <code class="inline">htmlspecialchars($out, ENT_QUOTES)</code> on output</li>
  <li><b>CSRF</b> -&gt; token in every state-changing form</li>
  <li>Validate server-side; hash passwords with <code class="inline">password_hash()</code></li>
</ul>`,
      seed: { code: '// prepared statement - injection-proof\nfunction safeQuery(PDO $db, string $name): array {\n    $stmt = $db->prepare("SELECT * FROM users WHERE name = ?");\n    $stmt->execute([$name]);\n    return $stmt->fetchAll();\n}\n// XSS-safe output\nfunction e(string $s): string {\n    return htmlspecialchars($s, ENT_QUOTES, "UTF-8");\n}\necho e("<script>alert(1)</script>");\necho "\\n";\necho password_verify("secret123", password_hash("secret123", PASSWORD_DEFAULT)) ? "hash ok" : "";', lang: "php" }
    },
    {
      id: "ajax-php", title: "AJAX with PHP (fetch API)",
      html: `<p class="lead">PHP endpoints + JavaScript fetch = dynamic pages without full reloads. The core of every modern PHP app.</p>
<h2>Flow</h2>
<ul>
  <li>PHP: read <code class="inline">$_POST</code> or JSON body -&gt; return <code class="inline">json_encode($data)</code></li>
  <li>Set header <code class="inline">Content-Type: application/json</code></li>
  <li>JS: <code class="inline">fetch(url, {method, body})</code> -&gt; <code class="inline">res.json()</code></li>
  <li>CORS headers for cross-origin calls</li>
</ul>`,
      seed: { code: '// api.php (concept)\n// header("Content-Type: application/json");\n// echo json_encode(["sum" => (int)$_POST["a"] + (int)$_POST["b"]]);\n\n// browser side:\n// fetch("api.php", {\n//   method: "POST",\n//   body: JSON.stringify({a: 2, b: 3})\n// }).then(r => r.json()).then(d => console.log(d.sum));\nfunction demo() {\n    $payload = json_encode(["a" => 2, "b" => 3]);\n    echo "request body: $payload\\n";\n    $decoded = json_decode($payload, true);\n    echo "server computes sum = " . ($decoded["a"] + $decoded["b"]);\n}\ndemo();', lang: "php" }
    },
    {
      id: "mail-php", title: "Sending Email & Files",
      html: `<p class="lead">PHP ships with mail tools - sending mail (or via libraries like PHPMailer) and handling file uploads safely.</p>
<h2>Uploads</h2>
<ul>
  <li><code class="inline">$_FILES["f"]</code> -&gt; name, tmp_name, size, error</li>
  <li>Check <code class="inline">is_uploaded_file()</code>, MIME type, size limit</li>
  <li>Move with <code class="inline">move_uploaded_file()</code> to a safe path</li>
  <li>Rand-name the file - never trust the client filename</li>
</ul>`,
      seed: { code: 'function handleUpload(array $file): string {\n    if ($file["error"] !== UPLOAD_ERR_OK) {\n        return "upload error code " . $file["error"];\n    }\n    if ($file["size"] > 2 * 1024 * 1024) return "too big (2MB max)";\n    $ext = pathinfo($file["name"], PATHINFO_EXTENSION);\n    $safe = bin2hex(random_bytes(8)) . "." . $ext;\n    // move_uploaded_file($file["tmp_name"], "uploads/" . $safe);\n    return "stored as uploads/$safe";\n}\n$fake = ["error" => 0, "size" => 1234, "name" => "photo.JPG", "tmp_name" => "/tmp/phpX"];\necho handleUpload($fake);', lang: "php" }
    },
    {
      id: "error-php", title: "Error &amp; Exception Handling",
      html: `<p class="lead">PHP distinguishes notices, warnings, and fatals - convert them to exceptions for clean control flow.</p>
<h2>Tools</h2>
<ul>
  <li><code class="inline">set_exception_handler()</code>, <code class="inline">set_error_handler()</code> - global hooks</li>
  <li><code class="inline">try / catch (TypeError | ValueError $e) / finally</code></li>
  <li>Custom exceptions extend <code class="inline">Exception</code> or <code class="inline">RuntimeException</code></li>
  <li><code class="inline">error_log()</code> - send details to logs, users see a friendly message</li>
</ul>`,
      seed: { code: 'class InsufficientFunds extends RuntimeException {}\nfunction withdraw(int $bal, int $amt): int {\n    if ($amt > $bal) throw new InsufficientFunds("need " . ($amt - $bal) . " more");\n    return $bal - $amt;\n}\ntry {\n    $left = withdraw(100, 500);\n    echo "left: $left";\n} catch (InsufficientFunds $e) {\n    echo "Blocked: " . $e->getMessage();\n    error_log("withdraw failed: " . $e->getMessage());\n} finally {\n    echo " \\nlogged to error_log";\n}', lang: "php" }
    },
    {
      id: "php-advanced", title: "PHP 8+ Features",
      html: `<p class="lead">Modern PHP is fast and expressive: nullsafe operator, match, constructor promotion, enums, fibers.</p>
<h2>Highlights</h2>
<ul>
  <li><code class="inline">?-&gt;</code> nullsafe: <code class="inline">$user?-&gt;address?-&gt;city</code></li>
  <li><code class="inline">match</code> - expression, strict typing, no fall-through</li>
  <li>Constructor property promotion (shorter classes)</li>
  <li><code class="inline">enum Status: string</code> - real enums</li>
</ul>`,
      seed: { code: 'enum Status: string {\n    case Active = "active";\n    case Banned = "banned";\n}\nclass User {\n    public function __construct(public string $name, public ?string $city = null) {}\n}\nfunction label(Status $s): string {\n    return match ($s) {\n        Status::Active => "go",\n        Status::Banned => "stop",\n    };\n}\n$u = new User("Ravi");\necho $u->name . " in " . ($u->city ?? "unknown city") . "\\n";\necho label(Status::Active);', lang: "php" }
    },
    {
      id: "wrapup", title: "PHP Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — PHP se full-stack server banana ab possible hai.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Syntax, strings, arrays, functions</li>
  <li>Forms, cookies, sessions</li>
  <li>PDO + prepared statements (security!)</li>
  <li>JSON APIs, Composer</li>
</ul>
<h2>Agla step</h2>
<p><b>Laravel</b> — PHP ka most loved framework. Ya <b>WordPress</b> theme/plugin dev.</p>`,
      seed: { code: '<?php\necho "PHP course complete ✔";\n?>', lang: "php" }
    }
  ]
};
