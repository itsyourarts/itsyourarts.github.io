/* GodxShadow course: SQL — start se end tak */
COURSES.sql = {
  name: "SQL", color: "#38f2a5", icon: "DB", blurb: "Database se baat karne ki bhasha — data store, query, update.",
  lessons: [
    {
      id: "intro", title: "SQL Introduction",
      html: `
<p class="lead"><b>SQL (Structured Query Language)</b> is the language used to talk to relational databases — query, insert, update and design data.</p>
<h2>Why SQL matters</h2>
<ul>
  <li>Behind almost every app: users, orders, posts, scores live in a database</li>
  <li>Same core dialect everywhere: MySQL, PostgreSQL, SQLite, SQL Server</li>
  <li>Jobs list SQL as a must-have for devs, analysts and data science</li>
</ul>
<h2>Core concept</h2>
<ul>
  <li>A database holds <b>tables</b> (think Excel sheets)</li>
  <li>Tables = rows (records) × columns (fields)</li>
  <li><b>SELECT</b> reads data — your 80% verb in real work</li>
</ul>`,
      seed: { code: 'SELECT name, city\nFROM Customers\nWHERE country = \'India\'\nORDER BY name;', lang: "sql" }
    },
    {
      id: "select", title: "SELECT & WHERE",
      html: `
<p class="lead"><code class="inline">SELECT</code> picks columns, <code class="inline">FROM</code> picks the table, <code class="inline">WHERE</code> filters rows. This trio runs the world.</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">SELECT * FROM users;</code> — all columns</li>
  <li><code class="inline">SELECT name, city FROM users WHERE city = 'Delhi';</code></li>
  <li>Comparisons: <code class="inline">&gt;, &gt;=, =, &lt;&gt; (not-equal)</code></li>
  <li>Numbers unquoted, strings SINGLE-quoted, keywords uppercase by convention</li>
  <li>Each statement usually ends with a semicolon</li>
</ul>`,
      seed: { code: 'SELECT id, name, price\nFROM products\nWHERE price BETWEEN 100 AND 500\n  AND name LIKE \'%phone%\'\nORDER BY price DESC\nLIMIT 10;', lang: "sql" }
    },
    {
      id: "like-wildcards", title: "LIKE & Wildcards",
      html: `
<p class="lead"><code class="inline">LIKE</code> performs pattern searches on text using wildcards.</p>
<h2>Wildcards</h2>
<ul>
  <li><code class="inline">%</code> — any run of characters (even none): <code class="inline">name LIKE 'ra%'</code> starts with "ra"</li>
  <li><code class="inline">_</code> — exactly ONE character: <code class="inline">code LIKE '_AB'</code></li>
  <li><code class="inline">NOT LIKE</code> — inverse match</li>
  <li>Case-sensitivity depends on DB collation (MySQL ci = insensitive)</li>
</ul>`,
      seed: { code: 'SELECT name, email\nFROM users\nWHERE email LIKE \'%@gmail.com\'\n  AND name LIKE \'_ohan\';   -- 5 letters, "ohan" end', lang: "sql" }
    },
    {
      id: "dml", title: "INSERT / UPDATE / DELETE",
      html: `
<p class="lead"><b>DML</b> (Data Manipulation Language) changes rows: INSERT adds, UPDATE modifies, DELETE removes.</p>
<h2>The three verbs</h2>
<ul>
  <li><code class="inline">INSERT INTO users (name, age) VALUES ('Ravi', 21);</code></li>
  <li><code class="inline">UPDATE users SET age = 22 WHERE id = 1;</code></li>
  <li><code class="inline">DELETE FROM users WHERE id = 1;</code></li>
  <li>⚠️ FORGET THE <code class="inline">WHERE</code> and EVERY row changes — the classic production horror</li>
  <li>Multi-row insert: comma-separate value rows</li>
</ul>`,
      seed: { code: 'INSERT INTO users (name, email)\nVALUES (\'Asha\', \'asha@x.com\'), (\'Ravi\', \'ravi@x.com\');\n\nUPDATE users SET name = \'Asha K\' WHERE id = 1;\n\nDELETE FROM users WHERE id = 2;', lang: "sql" }
    },
    {
      id: "groupby", title: "GROUP BY & HAVING",
      html: `
<p class="lead"><code class="inline">GROUP BY</code> collapses rows into summary groups (per city, per category); <code class="inline">HAVING</code> filters those groups.</p>
<h2>Usage</h2>
<ul>
  <li><code class="inline">SELECT city, COUNT(*) FROM users GROUP BY city;</code></li>
  <li>Aggregates per group: COUNT, SUM, AVG, MIN, MAX</li>
  <li><code class="inline">HAVING COUNT(*) > 2</code> — filter AFTER grouping; WHERE filters BEFORE</li>
  <li>Every selected non-aggregated column must appear in GROUP BY</li>
</ul>`,
      seed: { code: 'SELECT city, COUNT(*) AS users, AVG(age) AS avg_age\nFROM users\nGROUP BY city\nHAVING COUNT(*) > 5\nORDER BY users DESC;', lang: "sql" }
    },
    {
      id: "joins", title: "JOINs",
      html: `
<p class="lead"><b>JOINs</b> combine rows from related tables — the heart of relational databases.</p>
<h2>Join types</h2>
<ul>
  <li><b>INNER JOIN</b> — only matches on both sides (most common)</li>
  <li><b>LEFT JOIN</b> — all left rows + matches (NULLs where missing)</li>
  <li><b>RIGHT JOIN</b> — mirror of left</li>
  <li><b>FULL OUTER JOIN</b> — matches and orphans from both (Postgres, not MySQL)</li>
  <li>Condition: <code class="inline">ON orders.user_id = users.id</code></li>
  <li>Self-join: table joined to itself (manager-of-employee)</li>
</ul>`,
      seed: { code: 'SELECT c.name, o.total\nFROM customers c\nINNER JOIN orders o\n  ON o.customer_id = c.id\nWHERE o.total > 500;', lang: "sql" }
    },
    {
      id: "union-sub", title: "UNION & Subqueries",
      html: `
<p class="lead"><code class="inline">UNION</code> stacks result sets vertically; <b>subqueries</b> nest a SELECT inside another SELECT.</p>
<h2>UNION</h2>
<ul>
  <li><code class="inline">SELECT city FROM a UNION SELECT city FROM b;</code> — duplicates removed</li>
  <li><code class="inline">UNION ALL</code> — keeps duplicates (faster)</li>
  <li>Column count and (compatible) types must align</li>
</ul>
<h2>Subqueries</h2>
<ul>
  <li>WHERe: <code class="inline">WHERE score &gt; (SELECT AVG(score) FROM t)</code></li>
  <li>IN-list: <code class="inline">WHERE id IN (SELECT uid FROM orders)</code></li>
  <li>FROM: derived table (needs an alias)</li>
</ul>`,
      seed: { code: 'SELECT name FROM customers\nUNION\nSELECT name FROM suppliers\nORDER BY name;\n\n-- subquery\nSELECT * FROM products\nWHERE price > (SELECT AVG(price) FROM products);', lang: "sql" }
    },
    {
      id: "views", title: "Views & Indexes",
      html: `
<p class="lead"><b>Views</b> are saved queries acting like virtual tables; <b>indexes</b> speed lookups like a book's index.</p>
<h2>Views</h2>
<ul>
  <li><code class="inline">CREATE VIEW top_students AS SELECT … WHERE score &gt; 90;</code></li>
  <li>Reuse: <code class="inline">SELECT * FROM top_students;</code> — no duplicated SQL</li>
  <li>Security: expose safe columns only</li>
</ul>
<h2>Indexes</h2>
<ul>
  <li><code class="inline">CREATE INDEX idx_city ON users(city);</code> — faster WHERE + JOIN</li>
  <li>Trade-off: reads speed up, writes slow down (index maintenance)</li>
  <li><code class="inline">PRIMARY KEY</code> gets an index automatically</li>
</ul>`,
      seed: { code: 'CREATE VIEW india_users AS\nSELECT id, name FROM users WHERE country = \'India\';\n\nSELECT * FROM india_users;\n\nCREATE INDEX idx_email ON users(email);', lang: "sql" }
    },
    {
      id: "ddl", title: "CREATE / ALTER / DROP (DDL)",
      html: `
<p class="lead"><b>DDL</b> (Data Definition Language) structures the database itself: CREATE, ALTER, DROP, TRUNCATE.</p>
<h2>The verbs</h2>
<ul>
  <li><code class="inline">CREATE DATABASE shop;</code> · <code class="inline">CREATE TABLE users(id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50));</code></li>
  <li><code class="inline">ALTER TABLE users ADD email VARCHAR(120);</code> / <code class="inline">MODIFY COLUMN</code> / <code class="inline">DROP COLUMN</code></li>
  <li><code class="inline">DROP TABLE users;</code> — table gone · <code class="inline">TRUNCATE</code> — keep structure, wipe rows</li>
  <li><code class="inline">RENAME TABLE a TO b;</code></li>
</ul>`,
      seed: { code: 'CREATE TABLE courses (\n  id INT PRIMARY KEY,\n  title VARCHAR(100) NOT NULL,\n  level VARCHAR(10) DEFAULT \'beginner\',\n  UNIQUE (title)\n);\n\nALTER TABLE courses ADD COLUMN lessons INT;', lang: "sql" }
    },
    {
      id: "distinct", title: "SELECT DISTINCT",
      html: `
<p class="lead"><code class="inline">DISTINCT</code> removes duplicate values from results — "what unique cities do our users live in?"</p>
<h2>Usage</h2>
<ul>
  <li><code class="inline">SELECT DISTINCT city FROM users;</code></li>
  <li>Multi-column: uniqueness of the COMBINATION</li>
  <li><code class="inline">SELECT COUNT(DISTINCT city) FROM users;</code> — unique count</li>
  <li>Use sparingly — heavy on big tables; sometimes GROUP BY is what you want</li>
</ul>`,
      seed: { code: 'SELECT DISTINCT city FROM users;            -- Delhi, Pune ...\nSELECT COUNT(DISTINCT city) FROM users;       -- kitne alag sheher', lang: "sql" }
    },
    {
      id: "orderby", title: "ORDER BY & Aliases",
      html: `
<p class="lead"><code class="inline">ORDER BY</code> sorts the results; <b>aliases</b> give readable temporary names.</p>
<h2>Sorting</h2>
<ul>
  <li><code class="inline">ORDER BY score DESC</code> (high→low) · <code class="inline">ASC</code> default</li>
  <li>Multi-key: <code class="inline">ORDER BY city ASC, score DESC</code></li>
  <li>Position shortcut: <code class="inline">ORDER BY 2 DESC</code> (second selected column)</li>
  <li>NULLs order differs per DB — control it explicitly when it matters</li>
</ul>
<h2>Aliases</h2>
<ul>
  <li>Columns: <code class="inline">SELECT name AS customer_name</code></li>
  <li>Tables: <code class="inline">FROM users u</code> — essential for joins</li>
</ul>`,
      seed: { code: 'SELECT name, marks * 1.1 AS bonus_marks\nFROM students\nORDER BY bonus_marks DESC, name ASC;', lang: "sql" }
    },
    {
      id: "logic", title: "AND, OR, NOT & IN",
      html: `
<p class="lead"><code class="inline">AND / OR / NOT / IN / BETWEEN</code> build precise <code class="inline">WHERE</code> conditions.</p>
<h2>Operators</h2>
<ul>
  <li><code class="inline">WHERE city = 'Delhi' AND age &gt;= 18</code></li>
  <li><code class="inline">WHERE city = 'Delhi' OR city = 'Mumbai'</code> — or better: <code class="inline">IN ('Delhi','Mumbai')</code></li>
  <li><code class="inline">NOT IN (…)</code> — exclusion lists</li>
  <li><code class="inline">BETWEEN 10 AND 20</code> — inclusive range (dates too!)</li>
  <li>Parentheses matter: <code class="inline">a AND (b OR c)</code></li>
</ul>`,
      seed: { code: 'SELECT * FROM products\nWHERE (price BETWEEN 100 AND 500)\n  AND category IN (\'tech\', \'home\')\n  AND NOT discontinued;', lang: "sql" }
    },
    {
      id: "nulls", title: "NULL Values",
      html: `
<p class="lead"><code class="inline">NULL</code> means "no value" — it is not zero, not empty string, and it breaks naive comparisons.</p>
<h2>Rules</h2>
<ul>
  <li>Test with <code class="inline">IS NULL</code> / <code class="inline">IS NOT NULL</code> — <code class="inline">= NULL</code> never matches!</li>
  <li>Defaults: <code class="inline">IFNULL(marks, 0)</code> (MySQL) / <code class="inline">COALESCE(a, b, 'n/a')</code> — first non-NULL</li>
  <li>Aggregates IGNORE nulls (COUNT(col) skips them; COUNT(*) doesn't)</li>
  <li><code class="inline">NOT IN</code> with NULL in list can return ZERO rows — watch out</li>
</ul>`,
      seed: { code: 'SELECT name, COALESCE(phone, \'N/A\') AS contact\nFROM users\nWHERE phone IS NOT NULL;\n\nSELECT COALESCE(discount, 0) * price AS final\nFROM products;', lang: "sql" }
    },
    {
      id: "toplevel", title: "LIMIT, TOP & BETWEEN",
      html: `
<p class="lead">Limit how many rows come back: <code class="inline">LIMIT</code> (MySQL/Postgres/SQLite), <code class="inline">TOP</code> (SQL Server), and the <code class="inline">BETWEEN</code> range filter.</p>
<h2>Row limiting</h2>
<ul>
  <li><code class="inline">SELECT * FROM users LIMIT 5;</code> — first 5</li>
  <li>Paginate: <code class="inline">LIMIT 10 OFFSET 20</code> = page 3</li>
  <li>Always pair LIMIT with ORDER BY — otherwise results are arbitrary</li>
</ul>
<h2>Range filter</h2>
<ul>
  <li><code class="inline">WHERE age BETWEEN 18 AND 25</code> — inclusive both sides</li>
  <li><code class="inline">WHERE created BETWEEN '2026-09-01' AND '2026-09-30'</code></li>
</ul>`,
      seed: { code: 'SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20;   -- page 3\n\nSELECT * FROM orders WHERE total BETWEEN 500 AND 2000;\nSELECT * FROM events WHERE date BETWEEN \'2026-01-01\' AND \'2026-03-31\';', lang: "sql" }
    },
    {
      id: "aggregate", title: "Aggregate Functions",
      html: `
<p class="lead"><b>Aggregate functions</b> compress many rows into one answer: how many, how much, best, average.</p>
<h2>The big five</h2>
<ul>
  <li><code class="inline">COUNT(*)</code> · <code class="inline">COUNT(DISTINCT city)</code></li>
  <li><code class="inline">SUM(price)</code> · <code class="inline">AVG(score)</code> — use <code class="inline">ROUND(AVG(x),2)</code></li>
  <li><code class="inline">MIN()</code>, <code class="inline">MAX()</code> — oldest, highest, cheapest</li>
  <li>Combine: <code class="inline">SELECT COUNT(*) total, AVG(score) mean FROM students;</code></li>
  <li>They ignore NULLs (except COUNT(*))</li>
</ul>`,
      seed: { code: 'SELECT COUNT(*) AS total_users,\n       AVG(score) AS avg_score,\n       MIN(score) AS lowest,\n       MAX(score) AS highest\nFROM results;', lang: "sql" }
    },
    {
      id: "exists-any", title: "EXISTS, ANY & ALL",
      html: `
<p class="lead"><code class="inline">EXISTS</code> tests whether a subquery finds anything; <code class="inline">ANY/ALL</code> compare against a whole set.</p>
<h2>EXISTS</h2>
<ul>
  <li><code class="inline">WHERE EXISTS (SELECT 1 FROM orders o WHERE o.uid = u.id)</code></li>
  <li>Often faster than IN with correlated data; <code class="inline">NOT EXISTS</code> for "users without orders"</li>
</ul>
<h2>ANY / ALL</h2>
<ul>
  <li><code class="inline">score &gt; ANY (SELECT … )</code> — greater than at least one</li>
  <li><code class="inline">score &gt; ALL (SELECT … )</code> — greater than every single one</li>
</ul>`,
      seed: { code: 'SELECT name FROM users u\nWHERE EXISTS (\n  SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.total > 1000\n);\n\nSELECT * FROM products\nWHERE price > ALL (SELECT price FROM products WHERE brand = \'X\');', lang: "sql" }
    },
    {
      id: "joins-advanced", title: "Advanced JOINs",
      html: `
<p class="lead">Beyond basics: multiple joins, self-joins, CROSS joins and choosing the right join for the question.</p>
<h2>Patterns</h2>
<ul>
  <li>Chain: <code class="inline">u JOIN orders o ON … JOIN items i ON …</code></li>
  <li>Left-join floor: LEFT JOIN exposes missing matches (customers who never ordered)</li>
  <li>Self-join: <code class="inline">FROM employees e JOIN employees m ON e.manager_id = m.id</code></li>
  <li><code class="inline">CROSS JOIN</code> — every combination (sizes × colors)</li>
  <li>Exclude matches elegantly: <code class="inline">WHERE o.id IS NULL</code> after LEFT JOIN</li>
</ul>`,
      seed: { code: '-- employee → manager (same table!)\nSELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id;\n\n-- colors × sizes (cross)\nSELECT c.name, s.name FROM colors c CROSS JOIN sizes s;', lang: "sql" }
    },
    {
      id: "select-into", title: "SELECT INTO, CASE & Comments",
      html: `
<p class="lead">Create tables from query output, branch values with CASE, and leave comments for future-you.</p>
<h2>SELECT INTO / INSERT SELECT</h2>
<ul>
  <li><code class="inline">CREATE TABLE backup AS SELECT * FROM users;</code> (MySQL/Postgres syntax)</li>
  <li><code class="inline">INSERT INTO archive SELECT * FROM users WHERE age &lt; 18;</code></li>
</ul>
<h2>CASE logic</h2>
<ul>
  <li><code class="inline">CASE WHEN score &gt;= 90 THEN 'A' WHEN &gt;= 60 THEN 'B' ELSE 'C' END</code></li>
  <li>Works in SELECT, ORDER BY — real if/else inside SQL</li>
  <li>Comments: <code class="inline">-- single line</code> · <code class="inline">/* block */</code></li>
</ul>`,
      seed: { code: 'SELECT name, score,\n  CASE\n    WHEN score >= 90 THEN \'A+\'\n    WHEN score >= 75 THEN \'A\'\n    ELSE \'below\'\n  END AS grade\nFROM results;\n\n-- backup table banao\nSELECT * INTO users_backup FROM users WHERE created < \'2025-01-01\';', lang: "sql" }
    },
    {
      id: "procedures", title: "Functions & Stored Procedures",
      html: `
<p class="lead"><b>Stored procedures</b> and <b>functions</b> package SQL logic INSIDE the database — reusable, permission-controlled, fast.</p>
<h2>Stored procedures</h2>
<ul>
  <li><code class="inline">CREATE PROCEDURE GetTop(after INT) BEGIN SELECT … WHERE score &gt; after; END</code></li>
  <li>Call: <code class="inline">CALL GetTop(90);</code></li>
  <li>Inputs, outputs, transactions — full programs in the DB</li>
</ul>
<h2>Functions</h2>
<ul>
  <li>Scalar function returns one value; can be used inside SELECT</li>
  <li>Built-ins seen earlier: UPPER, DATEDIFF, ROUND… (see Functions chapter of MySQL)</li>
</ul>`,
      seed: { code: 'DELIMITER //\nCREATE PROCEDURE TopSpenders(IN min_total INT)\nBEGIN\n  SELECT name, total FROM orders WHERE total >= min_total ORDER BY total DESC;\nEND //\nDELIMITER ;\n\nCALL TopSpenders(1000);', lang: "sql" }
    },
    {
      id: "indexes-views2", title: "Indexes Deep Dive",
      html: `
<p class="lead">Deep dive on indexing — the single biggest lever for query speed — and view variants.</p>
<h2>Index wisdom</h2>
<ul>
  <li>B-tree indexes shine on WHERE + JOIN + ORDER BY columns</li>
  <li>Composite index (a, b): works for a alone too ("leftmost prefix")</li>
  <li><code class="inline">EXPLAIN SELECT …</code> — read the query plan regularly!</li>
  <li>Selectivity: indexes on boolean-ish columns rarely help</li>
  <li>Materialized views (Postgres): precomputed results, refresh on demand</li>
</ul>`,
      seed: { code: 'CREATE INDEX idx_city_age ON users(city, age);\n\n-- ✅ idx use hoga\nSELECT * FROM users WHERE city = \'Delhi\' AND age > 18;\n-- ⚠ leading column skip — index waste\nSELECT * FROM users WHERE age > 18;\n\nEXPLAIN SELECT * FROM users WHERE city = \'Delhi\' AND age > 18;', lang: "sql" }
    },
    {
      id: "injection", title: "SQL Injection & Security",
      html: `
<p class="lead"><b>SQL injection</b> happens when user input enters SQL as code. One line of defense fixes it forever: parameters.</p>
<h2>The attack</h2>
<ul>
  <li>Query: <code class="inline">"SELECT * FROM users WHERE name = '" + input + "'"</code></li>
  <li>Input <code class="inline">' OR '1'='1</code> → returns ALL users; worse: <code class="inline">'; DROP TABLE users;--</code></li>
</ul>
<h2>The defense</h2>
<ul>
  <li><b>Parameterized queries</b> always: <code class="inline">WHERE name = ?</code> (+ bind values)</li>
  <li>Never concatenate user input into SQL strings</li>
  <li>Least-privilege DB user per app, validate inputs, use ORMs correctly</li>
</ul>`,
      seed: { code: '-- ❌ vulnerable\nquery = "SELECT * FROM users WHERE name = \'" + name + "\'";\n-- attacker: name = \' OR 1=1 --  → poore users leak!\n\n-- ✅ safe\n$stmt = $db->prepare("SELECT * FROM users WHERE name = ?");\n$stmt->execute([$name]);', lang: "sql" }
    },
    {
      id: "wrapup", title: "SQL Summary & Next Steps",
      html: `
<p class="lead">SQL course complete! You are now fluent in CRUD, aggregation, joins, transactions and security.</p>
<h2>What you learned</h2>
<ul>
  <li>✔ SELECT / WHERE + all filters (LIKE, BETWEEN, IN, NULL logic)</li>
  <li>✔ CRUD writes safely, DDL for structure</li>
  <li>✔ GROUP BY, aggregates, HAVING</li>
  <li>✔ JOINs incl. advanced patterns, UNION, subqueries, EXISTS</li>
  <li>✔ Views, indexes, procedures and injection defense</li>
</ul>
<h2>Cheat sheet</h2>
<ul>
  <li>Top-N: <code class="inline">SELECT * FROM t ORDER BY score DESC LIMIT 5;</code></li>
  <li>Count per group: <code class="inline">GROUP BY city HAVING COUNT(*) &gt; 1</code></li>
  <li>Join: <code class="inline">FROM a JOIN b ON a.id = b.a_id</code></li>
  <li>Above average: <code class="inline">WHERE x &gt; (SELECT AVG(x) FROM t)</code></li>
</ul>
<h2>Next stop → MySQL course</h2>
<p>Dialect mastered — now the world's #1 database server specifics (13 chapters). 🐬</p>`,
      seed: { code: '-- Revision: ek complex query\nSELECT u.name, COUNT(o.id) AS orders\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.name\nHAVING COUNT(o.id) > 0\nORDER BY orders DESC;', lang: "sql" }
    }
  ]
};
