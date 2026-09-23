/* GodxShadow course: MySQL — start se end tak */
COURSES.mysql = {
  name: "MySQL", color: "#ff9f6e", icon: "My", blurb: "Duniya ka sabse popular open-source database.",
  lessons: [
    {
      id: "intro", title: "MySQL Introduction",
      html: `
<p class="lead"><b>MySQL</b> ek relational database hai — tables mein data, SQL se queries. LAMP stack (Linux, Apache, MySQL, PHP) ka M.</p>
<h2>Setup</h2>
<ul>
  <li>Install MySQL ya <b>XAMPP</b> (easy all-in-one)</li>
  <li>CLI: <code class="inline">mysql -u root -p</code></li>
  <li>GUI: MySQL Workbench / phpMyAdmin</li>
</ul>
<h2>SQL vs MySQL</h2>
<p>SQL language hai; MySQL us language ko bolne wala DBMS.</p>`,
      seed: { code: '# MySQL mein jaao\nmysql -u root -p\n\n# databases dekho\nSHOW DATABASES;\n\n# naya banao\nCREATE DATABASE shop;\nUSE shop;', lang: "sql" }
    },
    {
      id: "datatypes", title: "Data Types",
      html: `
<p class="lead">Column ka type soch samajh kar chuno — storage aur speed dono par asar padta hai.</p>
<h2>Common types</h2>
<ul>
  <li>Numbers: <code class="inline">INT, BIGINT, DECIMAL(10,2), FLOAT</code></li>
  <li>Text: <code class="inline">VARCHAR(100)</code> (variable), <code class="inline">TEXT</code>, <code class="inline">CHAR(2)</code> (fixed)</li>
  <li>Date/Time: <code class="inline">DATE</code> (YYYY-MM-DD), <code class="inline">DATETIME</code>, <code class="inline">TIMESTAMP</code></li>
  <li><code class="inline">BOOLEAN</code> (actually TINYINT), <code class="inline">JSON</code> (MySQL 5.7+)</li>
</ul>`,
      seed: { code: 'CREATE TABLE products (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    name VARCHAR(100) NOT NULL,\n    price DECIMAL(10,2),\n    stock INT DEFAULT 0,\n    created DATETIME DEFAULT CURRENT_TIMESTAMP\n);', lang: "sql" }
    },
    {
      id: "crud", title: "Tables & CRUD",
      html: `
<p class="lead">MySQL mein daily kaam — CREATE, READ (SELECT), UPDATE, DELETE.</p>
<h2>Pattern</h2>
<ul>
  <li><code class="inline">CREATE TABLE</code> pehle structure define karo</li>
  <li><code class="inline">SHOW TABLES / DESCRIBE table</code> — inspect</li>
  <li>NULL allowed ya NOT NULL decide karo</li>
  <li><code class="inline">AUTO_INCREMENT</code> IDs ke liye</li>
</ul>
<div class="tip">MySQL keywords case-insensitive, but tables/columns Linux par case-sensitive ho sakte hain.</div>`,
      seed: { code: 'INSERT INTO products (name, price, stock)\nVALUES ("Neon Keyboard", 2499.00, 15);\n\nSELECT * FROM products WHERE price < 3000;\n\nUPDATE products SET stock = stock - 1 WHERE id = 1;\n\nDELETE FROM products WHERE stock = 0;', lang: "sql" }
    },
    {
      id: "constraints", title: "Keys & Constraints",
      html: `
<p class="lead">Data integrity ke liye constraints — duplicate, NULL, wrong IDs se bachao.</p>
<h2>Types</h2>
<ul>
  <li><code class="inline">PRIMARY KEY</code> — har row ka unique ID</li>
  <li><code class="inline">FOREIGN KEY ... REFERENCES</code> — relation</li>
  <li><code class="inline">UNIQUE, NOT NULL, DEFAULT, CHECK</code></li>
  <li><code class="inline">ON DELETE CASCADE</code> — parent udhja to child bhi</li>
</ul>`,
      seed: { code: 'CREATE TABLE orders (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    product_id INT NOT NULL,\n    qty INT DEFAULT 1,\n    FOREIGN KEY (product_id)\n        REFERENCES products(id)\n        ON DELETE CASCADE\n);', lang: "sql" }
    },
    {
      id: "joins", title: "JOINs & Relations",
      html: `
<p class="lead">Relational database ka asli power — tables ko JOIN karke connected data.</p>
<h2>Relation types</h2>
<ul>
  <li><b>One-to-many</b> — user → orders (FK child mein)</li>
  <li><b>Many-to-many</b> — students↔courses (junction table bridge)</li>
</ul>
<h2>JOIN patterns</h2>
<p>INNER aur LEFT JOIN 90% use-case cover karte hain.</p>`,
      seed: { code: '-- one-to-many\nSELECT u.name, o.total\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id;\n\n-- many-to-many junction\nCREATE TABLE enrollments (\n    student_id INT,\n    course_id INT,\n    PRIMARY KEY (student_id, course_id)\n);', lang: "sql" }
    },
    {
      id: "indexes", title: "Indexes & Optimization",
      html: `
<p class="lead">Bade data par query fast rakhne ka tareeka — <b>indexes</b>.</p>
<h2>Rules</h2>
<ul>
  <li>WHERE / JOIN columns par index</li>
  <li><code class="inline">EXPLAIN SELECT...</code> — plan dekho</li>
  <li>Zyada indexes = slow writes</li>
  <li><code class="inline">SELECT *</code> avoid — sirf chahiye columns lo</li>
  <li><code class="inline">LIMIT</code> use karo big tables par</li>
</ul>`,
      seed: { code: 'CREATE INDEX idx_email ON users(email);\n\nEXPLAIN\nSELECT id, name FROM users WHERE email = \'a@b.com\';\n\n-- index sab jagah nahi chahiye\nDROP INDEX idx_email ON users;', lang: "sql" }
    },
    {
      id: "backup-users", title: "Backup, Users & Security",
      html: `
<p class="lead">Production mein sabse important — backup aadat aur least-privilege users.</p>
<h2>Backup</h2>
<p><code class="inline">mysqldump -u root -p shop &gt; backup.sql</code></p>
<h2>Users</h2>
<ul>
  <li><code class="inline">CREATE USER 'app'@'localhost' IDENTIFIED BY 'pass';</code></li>
  <li><code class="inline">GRANT SELECT, INSERT ON shop.* TO 'app'@'localhost';</code></li>
  <li><code class="inline">app</code> ko <code class="inline">root</code> access mat do</li>
</ul>`,
      seed: { code: '# backup (terminal se)\nmysqldump -u root -p shop > shop_backup.sql\n\n# restore\nmysql -u root -p shop < shop_backup.sql\n\n# limited user\nCREATE USER \'shop_app\'@\'localhost\' IDENTIFIED BY \'strong_pass\';\nGRANT SELECT, INSERT, UPDATE ON shop.* TO \'shop_app\'@\'localhost\';', lang: "sql" }
    },
    {
      id: "connect", title: "Connect from Code",
      html: `
<p class="lead">PHP aur Node.js se MySQL use karne ka actual pattern.</p>
<h2>PHP (PDO)</h2>
<p>Prepared statements — SQL injection se suraksha.</p>
<h2>Node (mysql2)</h2>
<p>Async/await + <code class="inline">?</code> placeholders.</p>
<div class="warn"><b>Never:</b> user input ko seedha query string mein jodo — hamesha prepared statements.</div>`,
      seed: { code: '// PHP — PDO\n$db = new PDO("mysql:host=localhost;dbname=shop", "app", "pass");\n$stmt = $db->prepare("SELECT * FROM products WHERE id = ?");\n$stmt->execute([1]);\n$product = $stmt->fetch(PDO::FETCH_ASSOC);\n\n// Node — mysql2\nconst [rows] = await db.execute(\n    "SELECT * FROM products WHERE id = ?", [1]\n);', lang: "sql" }
    },
    {
      id: "groupby", title: "GROUP BY, HAVING & Aggregates",
      html: `
<p class="lead">Summarize karo — department-wise salary, city-wise users.</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">SELECT city, COUNT(*) FROM users GROUP BY city</code></li>
  <li><code class="inline">HAVING</code> — grouped rows ka filter (WHERE nahi chalega count par!)</li>
  <li>Aggregates: <code class="inline">COUNT, SUM, AVG, MIN, MAX</code></li>
  <li>ORDER BY ke saath: <code class="inline">GROUP BY city ORDER BY 2 DESC</code></li>
</ul>`,
      seed: { code: '-- Grouped summary\nSELECT city, COUNT(*) AS total_users,\n       ROUND(AVG(score), 1) AS avg_score\nFROM students\nGROUP BY city\nHAVING COUNT(*) >= 2\nORDER BY avg_score DESC;\n\n-- output aisa dikhega:\n-- Delhi   | 12 | 86.4\n-- Mumbai  |  9 | 82.1\n-- Jaipur  |  3 | 79.5', lang: "sql" }
    },
    {
      id: "subqueries", title: "Subqueries (nested SELECT)",
      html: `
<p class="lead">Query ke andar query — complex filters easy ban jaate hain.</p>
<h2>Patterns</h2>
<ul>
  <li>WHERE mein: <code class="inline">WHERE score &gt; (SELECT AVG(score) FROM t)</code></li>
  <li>IN ke saath: <code class="inline">WHERE id IN (SELECT user_id FROM orders)</code></li>
  <li>FROM mein: derived table (alias zaroor!)</li>
  <li>Correlated: inner query outer row pe depend kare</li>
</ul>`,
      seed: { code: '-- Average se upar wale students\nSELECT name, score\nFROM students\nWHERE score > (SELECT AVG(score) FROM students);\n\n-- Jo kabhi order nahi kiye\nSELECT name FROM users\nWHERE id NOT IN (SELECT user_id FROM orders);\n\n-- Derived table\nSELECT city, top_score\nFROM (SELECT city, MAX(score) AS top_score\n      FROM students GROUP BY city) AS t\nWHERE top_score > 90;', lang: "sql" }
    },
    {
      id: "functions", title: "Built-in Functions (String, Date, Math)",
      html: `
<p class="lead">MySQL ke handy functions — query mein hi transformation.</p>
<h2>String</h2>
<ul>
  <li><code class="inline">UPPER(), LOWER(),LENGTH(), TRIM(), CONCAT()</code></li>
  <li><code class="inline">SUBSTRING(name,1,3), REPLACE()</code></li>
</ul>
<h2>Date & Math</h2>
<ul>
  <li><code class="inline">NOW(), CURDATE(), DATEDIFF(), DATE_FORMAT()</code></li>
  <li><code class="inline">ROUND(), CEIL(), FLOOR(), MOD()</code></li>
</ul>`,
      seed: { code: 'SELECT UPPER(name), LENGTH(name)\nFROM students;\n\nSELECT CONCAT(first, " ", last) AS full_name\nFROM users;\n\nSELECT DATE_FORMAT(NOW(), "%d %b %Y") AS today;   -- 22 Sep 2026\nSELECT DATEDIFF("2026-12-31", CURDATE()) AS days_left;\n\nSELECT ROUND(AVG(score), 2) FROM students;\nSELECT name FROM students WHERE MONTH(created_at) = 9;', lang: "sql" }
    },
    {
      id: "transactions", title: "Transactions (COMMIT / ROLLBACK)",
      html: `
<p class="lead">Paison wali queries? ALL or NOTHING — transaction use karo.</p>
<h2>ACID flow</h2>
<ul>
  <li><code class="inline">START TRANSACTION;</code> — begin</li>
  <li>Multiple statements... sab OK? → <code class="inline">COMMIT;</code></li>
  <li>Koi fail? → <code class="inline">ROLLBACK;</code> (undo sab)</li>
  <li><code class="inline">SAVEPOINT sp1;</code> + <code class="inline">ROLLBACK TO sp1;</code> — partial undo</li>
</ul>`,
      seed: { code: '-- Money transfer: dono ya koi nahi!\nSTART TRANSACTION;\n\nUPDATE accounts SET balance = balance - 500 WHERE id = 1;\nUPDATE accounts SET balance = balance + 500 WHERE id = 2;\n\n-- sab theek lage to:\nCOMMIT;\n\n-- problem aaye to:\n-- ROLLBACK;\n\n-- Intermediate checkpoint:\nSTART TRANSACTION;\nUPDATE stock SET qty = qty - 1 WHERE id = 5;\nSAVEPOINT after_stock;\nINSERT INTO orders VALUES (...);\n-- ROLLBACK TO after_stock;   -- sirf insert undo\nCOMMIT;', lang: "sql" }
    },
    {
      id: "views-triggers", title: "Views & Triggers",
      html: `<p class="lead">Views = saved queries acting as virtual tables; Triggers = code MySQL runs automatically on INSERT/UPDATE/DELETE.</p>
<h2>Views</h2>
<ul>
  <li><code class="inline">CREATE VIEW active_users AS SELECT ... WHERE active = 1;</code></li>
  <li>Reuse, encapsulation, security (hide base tables)</li>
  <li>Some views are updatable - many are read-only</li>
</ul>
<h2>Triggers</h2>
<ul>
  <li><code class="inline">CREATE TRIGGER ... AFTER INSERT ON orders FOR EACH ROW</code></li>
  <li>Reference the row: <code class="inline">NEW.col</code>, <code class="inline">OLD.col</code></li>
  <li>Classic use: audit logs, denormalized counters</li>
</ul>`,
      seed: { code: 'CREATE VIEW top_products AS\nSELECT p.name, SUM(q) AS total\nFROM products p JOIN sales s ON s.pid = p.id\nGROUP BY p.name HAVING total > 10 ORDER BY total DESC;\n\nCREATE TRIGGER after_sale\nAFTER INSERT ON sales\nFOR EACH ROW\nBEGIN\n    UPDATE stock SET qty = qty - NEW.qty WHERE pid = NEW.pid;\nEND;\n\nSELECT * FROM top_products LIMIT 5;', lang: "sql" }
    },
    {
      id: "stored-procs", title: "Stored Procedures & Functions",
      html: `<p class="lead">Package SQL logic inside the database - called by apps, reusable, permission-controlled.</p>
<h2>Stored procedure</h2>
<ul>
  <li><code class="inline">CREATE PROCEDURE GetTop(IN minScore INT)</code> + <code class="inline">BEGIN ... END</code></li>
  <li>Call: <code class="inline">CALL GetTop(90);</code></li>
  <li>OUT parameters return values to the caller</li>
</ul>
<h2>Scalar function</h2>
<ul>
  <li><code class="inline">CREATE FUNCTION discount(price DECIMAL(10,2)) RETURNS DECIMAL(10,2)</code></li>
  <li>Use inside SELECT: <code class="inline">SELECT discount(price) FROM products;</code></li>
</ul>`,
      seed: { code: 'DELIMITER //\nCREATE PROCEDURE GetTop(IN minScore INT)\nBEGIN\n    SELECT name, score FROM students\n    WHERE score >= minScore ORDER BY score DESC;\nEND //\nDELIMITER ;\n\nCREATE FUNCTION fullDiscount(p DECIMAL(10,2)) RETURNS DECIMAL(10,2)\nBEGIN\n    RETURN p * 0.8;\nEND;\n\nCALL GetTop(90);\nSELECT fullDiscount(199.99) AS sale_price;', lang: "sql" }
    },
    {
      id: "fulltext", title: "Full-Text Search",
      html: `<p class="lead">MySQL built-in full-text indexes find words in text columns - the base of in-DB search.</p>
<h2>Usage</h2>
<ul>
  <li><code class="inline">ALTER TABLE posts ADD FULLTEXT (title, body);</code></li>
  <li><code class="inline">MATCH(title, body) AGAINST ("query" IN NATURAL LANGUAGE MODE)</code></li>
  <li>Boolean mode: <code class="inline">+must -exclude wildcard*</code></li>
  <li>Min word length applies (default 3); rank via <code class="inline">AGAINST ... INTO @rank</code></li>
</ul>`,
      seed: { code: 'ALTER TABLE posts ADD FULLTEXT INDEX ft (title, body);\n\nSELECT id, title,\n       MATCH(title, body) AGAINST("neon glow" IN NATURAL LANGUAGE MODE) AS rank\nFROM posts\nWHERE MATCH(title, body) AGAINST("neon glow" IN NATURAL LANGUAGE MODE)\nORDER BY rank DESC LIMIT 10;\n\nSELECT id, title\nFROM posts\nWHERE MATCH(title, body) AGAINST("+neon -dark" IN BOOLEAN MODE);', lang: "sql" }
    },
    {
      id: "replication", title: "Replication - Scale Reads",
      html: `<p class="lead">A master handles writes; replicas serve reads - the classic horizontal read-scale pattern.</p>
<h2>How</h2>
<ul>
  <li>Master ships binary log events to replicas asynchronously</li>
  <li>Replicas: <code class="inline">CHANGE MASTER TO ... ; START REPLICA;</code></li>
  <li>Check lag: <code class="inline">SHOW REPLICA STATUS</code> (Seconds_Behind)</li>
  <li>Routing: writes -&gt; master, reads -&gt; replica pool; handle lag for read-your-writes</li>
</ul>`,
      seed: { code: '-- master:\n-- SET GLOBAL server_id = 1;\n-- SET GLOBAL log_bin = "master-bin";\n-- CREATE USER repl@% IDENTIFIED BY "secret";\n-- GRANT REPLICATION SLAVE ON *.* TO repl@%;\n\n-- replica:\n-- SET GLOBAL server_id = 2;\nCHANGE MASTER TO\n    MASTER_HOST = "master-db",\n    MASTER_USER = "repl",\n    MASTER_PASSWORD = "secret",\n    MASTER_LOG_FILE = "master-bin.000003",\n    MASTER_LOG_POS = 154;\nSTART REPLICA;\nSHOW REPLICA STATUS\\G', lang: "sql" }
    },
    {
      id: "optimization", title: "Query Optimization (EXPLAIN)",
      html: `<p class="lead">Make slow queries fast: read the plan, add the right index, write sargable predicates.</p>
<h2>EXPLAIN anatomy</h2>
<ul>
  <li><code class="inline">EXPLAIN SELECT ...</code> - type (ALL &lt; index &lt; range &lt; ref &lt; eq_ref &lt; const)</li>
  <li><code class="inline">rows</code> scanned vs returned - big gap = filter waste</li>
  <li><code class="inline">Using filesort / Using temporary</code> - avoid with indexes</li>
  <li>Composite index order matters (leftmost prefix)</li>
</ul>`,
      seed: { code: 'EXPLAIN SELECT * FROM orders\nWHERE customer_id = 7 AND status = "paid"\nORDER BY created_at DESC;\n\nCREATE INDEX idx_cust_status_created\n    ON orders(customer_id, status, created_at);\n\nEXPLAIN SELECT * FROM orders\nWHERE customer_id = 7 AND status = "paid"\nORDER BY created_at DESC;\n\n-- bad: function on column kills index\n-- SELECT * FROM users WHERE YEAR(birth) = 1990;\n-- good:\nSELECT * FROM users WHERE birth BETWEEN "1990-01-01" AND "1990-12-31";', lang: "sql" }
    },
    {
      id: "mysql-advanced", title: "Locking, Deadlocks & Concurrency",
      html: `<p class="lead">InnoDB locks rows during transactions. Understand them to avoid deadlocks and tune isolation.</p>
<h2>Key ideas</h2>
<ul>
  <li>Row locks (X for write, S for read under some levels) - gap locks on ranges</li>
  <li>Isolation levels: READ COMMITTED vs REPEATABLE READ (default)</li>
  <li>Deadlock = two tx wait on each other - InnoDB aborts one, retry it</li>
  <li>Keep transactions short; lock in consistent order</li>
</ul>`,
      seed: { code: '-- see locks held by current session\nSELECT * FROM performance_schema.data_locks\\G\n\nSELECT * FROM performance_schema.data_lock_waits\\G\n\n-- typical deadlock report:\n-- LATEST DETECTED DEADLOCK:\n-- *** (1) WAITING FOR LOCK\n-- *** (2) HOLDS LOCKS\n-- 1 of 2 transactions, try again\nSTART TRANSACTION;\nUPDATE accounts SET bal = bal - 100 WHERE id = 1;\nUPDATE accounts SET bal = bal + 100 WHERE id = 2;\nCOMMIT;', lang: "sql" }
    },
    {
      id: "wrapup", title: "MySQL Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — database fundamentals solid ab.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Setup, data types, tables</li>
  <li>CRUD, constraints, keys</li>
  <li>Joins (1:N, M:N), indexes</li>
  <li>Backups, users, code integration</li>
</ul>
<h2>Agla step</h2>
<p>Practice project: <b>Node + Express + MySQL</b> ka mini blog — posts, users, comments.</p>`,
      seed: { code: 'SELECT "MySQL complete ✔" AS status;', lang: "sql" }
    }
  ]
};
