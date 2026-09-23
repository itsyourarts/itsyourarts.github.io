/* GodxShadow course: Flask — start se end tak */
COURSES.flask = {
  name: "Flask", color: "#63e6ff", icon: "Fl", blurb: "Python ka lightweight web framework — chhota start, poora control.",
  lessons: [
    {
      id: "intro", title: "Flask Introduction",
      html: `
<p class="lead"><b>Flask</b> — micro web framework: sirf core deta hai, baaki tum chuno. Small APIs se lekar full apps tak, Python mein web banane ka sabse simple raasta.</p>
<h2>Setup</h2>
<ul>
  <li><code class="inline">pip install flask</code></li>
  <li><code class="inline">flask --app app run --debug</code></li>
</ul>
<h2>Pehla app</h2>
<div class="tip">Debug mode on rakho — code change par server khud restart hota hai.</div>`,
      seed: { code: 'from flask import Flask\n\napp = Flask(__name__)\n\n@app.route("/")\ndef home():\n    return "<h1>Hello, GodxShadow!</h1>"\n\nif __name__ == "__main__":\n    app.run(debug=True)\n\n# python app.py → http://127.0.0.1:5000', lang: "python" }
    },
    {
      id: "routes", title: "Routes & URL Parameters",
      html: `
<p class="lead">URL → function mapping decorators se. Dynamic parts <code class="inline">&lt;type:name&gt;</code> se capture.</p>
<h2>Patterns</h2>
<ul>
  <li><code class="inline">@app.route("/user/&lt;name&gt;")</code></li>
  <li><code class="inline">/post/&lt;int:id&gt;</code> — int converter</li>
  <li>Methods: <code class="inline">@app.route("/api", methods=["GET", "POST"])</code></li>
  <li><code class="inline">request.args.get("q")</code> — query strings</li>
</ul>`,
      seed: { code: '@app.route("/hello/<name>")\ndef hello(name):\n    return f"Hello, {name.title()}!"\n\n@app.route("/square/<int:n>")\ndef square(n):\n    return {"n": n, "square": n * n}\n\n# /search?q=neon\n@app.route("/search")\ndef search():\n    q = request.args.get("q", "")\n    return f"Tumne dhoonda: {q}"', lang: "python" }
    },
    {
      id: "templates", title: "Templates (Jinja2)",
      html: `
<p class="lead">HTML files Python data ke saath render — Jinja2 engine.</p>
<h2>Flow</h2>
<ul>
  <li><code class="inline">render_template("page.html", name="Sha")</code></li>
  <li>Template mein: <code class="inline">{{ name }}</code>, <code class="inline">{% for x in items %}</code>, <code class="inline">{% if %}</code></li>
  <li>Inheritance: <code class="inline">{% extends "base.html" %}{% block content %}</code></li>
  <li>Static files: <code class="inline">url_for("static", filename="style.css")</code></li>
</ul>`,
      seed: { code: '# app.py\n@app.route("/profile/<name>")\ndef profile(name):\n    return render_template("profile.html", name=name, level=99)\n\n# templates/profile.html\n<h1>{{ name }} ⚡ L{{ level }}</h1>\n{% if level > 50 %}Pro player!{% endif %}', lang: "python" }
    },
    {
      id: "forms", title: "Forms & POST",
      html: `
<p class="lead">User input lena — HTML form se Flask tak.</p>
<h2>Pattern</h2>
<ul>
  <li>Template: <code class="inline">&lt;form method="post"&gt;</code></li>
  <li>View: <code class="inline">request.form["email"]</code></li>
  <li>Redirect: <code class="inline">return redirect(url_for("home"))</code></li>
  <li>Flash messages: <code class="inline">flash("Saved!")</code> → template mein <code class="inline">get_flashed_messages()</code></li>
</ul>`,
      seed: { code: '@app.route("/signup", methods=["GET", "POST"])\ndef signup():\n    if request.method == "POST":\n        email = request.form["email"]\n        flash(f"Welcome, {email}!")\n        return redirect(url_for("home"))\n    return render_template("signup.html")\n\n# signup.html\n<form method="post">\n  <input name="email" type="email" required>\n  <button>Join</button>\n</form>', lang: "python" }
    },
    {
      id: "api", title: "JSON APIs",
      html: `
<p class="lead">Flask se REST API banana — dictionaries direct JSON ban jaati hain.</p>
<h2>Patterns</h2>
<ul>
  <li>Return <code class="inline">dict</code> → auto-JSON (Flask 2+)</li>
  <li><code class="inline">jsonify()</code> · <code class="inline">request.get_json()</code> — incoming JSON</li>
  <li>Status codes: <code class="inline">return {"error": "not found"}, 404</code></li>
</ul>`,
      seed: { code: 'USERS = [{"id": 1, "name": "Asha"}, {"id": 2, "name": "Ravi"}]\n\n@app.get("/api/users")\ndef list_users():\n    return {"users": USERS, "count": len(USERS)}\n\n@app.post("/api/users")\ndef create_user():\n    data = request.get_json()\n    USERS.append({"id": len(USERS) + 1, **data})\n    return {"created": data}, 201', lang: "python" }
    },
    {
      id: "structure", title: "Blueprints & DB",
      html: `
<p class="lead">Bade apps ko organize karo — <b>Blueprints</b> modular views; <b>SQLAlchemy</b> database.</p>
<h2>Blueprint</h2>
<p><code class="inline">bp = Blueprint("blog", __name__)</code> → <code class="inline">app.register_blueprint(bp)</code></p>
<h2>Database</h2>
<p><code class="inline">pip install flask-sqlalchemy</code> — models Python classes, ORM style queries.</p>`,
      seed: { code: 'from flask import Blueprint\nfrom flask_sqlalchemy import SQLAlchemy\n\nbp = Blueprint("api", __name__, url_prefix="/api")\ndb = SQLAlchemy()\n\nclass User(db.Model):\n    id = db.Column(db.Integer, primary_key=True)\n    name = db.Column(db.String(80), nullable=False)\n\n@bp.get("/users")\ndef users():\n    return {"users": [u.name for u in User.query.all()]}\n\napp.register_blueprint(bp)', lang: "python" }
    },
    {
      id: "static", title: "Static Files & url_for",
      html: `
<p class="lead">CSS/JS/images serve karna — static folder ki discipline.</p>
<h2>Rules</h2>
<ul>
  <li><code class="inline">static/</code> folder auto-served at <code class="inline">/static/...</code></li>
  <li>Templates mein: <code class="inline">{{ url_for(\'static\', filename=\'style.css\') }}</code> — hardcode kabhi mat!</li>
  <li><code class="inline">send_from_directory()</code> — downloads</li>
</ul>`,
      seed: { code: 'from flask import Flask, render_template, url_for, send_from_directory\n\napp = Flask(__name__)\n\n# folder structure:\n# static/style.css  static/logo.png  templates/index.html\n\n# template mein:\n# <link rel="stylesheet" href="{{ url_for("static", filename="style.css") }}">\n# <img src="{{ url_for("static", filename="logo.png") }}">\n\n@app.route("/docs/<path:name>")\ndef download(name):\n    return send_from_directory("docs", name, as_attachment=True)', lang: "python" }
    },
    {
      id: "cookies-sessions", title: "Cookies & Sessions",
      html: `
<p class="lead">User ko yaad rakho — secure session handling Flask mein built-in.</p>
<h2>Points</h2>
<ul>
  <li><code class="inline">app.secret_key</code> — zaroori sessions ke liye</li>
  <li><code class="inline">session["user"] = name</code> — signed cookie (tamper-proof)</li>
  <li><code class="inline">session.pop("user")</code> — logout</li>
  <li>Raw cookies: <code class="inline">resp.set_cookie()</code> / <code class="inline">request.cookies.get()</code></li>
</ul>`,
      seed: { code: 'from flask import Flask, session, request, make_response, redirect\n\napp = Flask(__name__)\napp.secret_key = "koi-lambi-random-secret-string"\n\n@app.route("/login/<name>")\ndef login(name):\n    session["user"] = name\n    return "logged in!"\n\n@app.route("/me")\ndef me():\n    return "Namaste " + session.get("user", "Guest")\n\n@app.route("/logout")\ndef logout():\n    session.pop("user", None)\n    return redirect("/me")', lang: "python" }
    },
    {
      id: "sqlite", title: "SQLite Database (simple CRUD)",
      html: `
<p class="lead">Zero-setup database — file mein poora data. Flask ke saath perfect start.</p>
<h2>Flow</h2>
<ul>
  <li><code class="inline">sqlite3.connect("data.db")</code></li>
  <li>Parameterized queries SIRF — <code class="inline">(?,)</code> placeholders (injection roko!)</li>
  <li><code class="inline">commit()</code> writes ke baad · <code class="inline">close()</code> connection</li>
  <li><code class="inline">g</code> object — per-request connection pattern</li>
</ul>`,
      seed: { code: 'import sqlite3\nfrom flask import Flask, request, jsonify\n\napp = Flask(__name__)\n\ndef db():\n    con = sqlite3.connect("data.db")\n    con.execute("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, text TEXT)")\n    return con\n\n@app.route("/notes", methods=["GET", "POST"])\ndef notes():\n    con = db()\n    if request.method == "POST":\n        con.execute("INSERT INTO notes (text) VALUES (?)", (request.json["text"],))\n        con.commit()\n        return jsonify(ok=True), 201\n    return jsonify(con.execute("SELECT * FROM notes").fetchall())', lang: "python" }
    },
    {
      id: "errors", title: "Error Handling (404 / 500 / custom)",
      html: `
<p class="lead">Errors ko graceful banao — users ko raw traceback kabhi mat dikhao.</p>
<h2>Handers</h2>
<ul>
  <li><code class="inline">@app.errorhandler(404)</code> — page not found</li>
  <li><code class="inline">abort(404)</code> — route se error trigger</li>
  <li>Custom exception → handler mapping</li>
  <li>API mode mein JSON error return karo</li>
</ul>`,
      seed: { code: 'from flask import Flask, jsonify, abort\n\napp = Flask(__name__)\n\n@app.errorhandler(404)\ndef not_found(e):\n    return jsonify(error="mil nahi raha bhai", code=404), 404\n\n@app.errorhandler(500)\ndef server_error(e):\n    return jsonify(error="server got moody", code=500), 500\n\n@app.route("/user/<int:uid>")\ndef profile(uid):\n    if uid != 1:\n        abort(404)               # upar wala handler aayega\n    return jsonify(name="Shadow")\n\n# @app.errorhandler(Exception) — catch-all last resort', lang: "python" }
    },
    {
      id: "auth", title: "Authentication: Sessions & Passwords",
      html: `<p class="lead">Login systems in Flask: hash passwords, keep users in the session, protect routes with a decorator.</p>
<h2>Flow</h2>
<ul>
  <li><code class="inline">werkzeug.security</code>: <code class="inline">generate_password_hash</code> / <code class="inline">check_password_hash</code></li>
  <li>Session: <code class="inline">session["user_id"]</code> - signed cookie</li>
  <li>Decorator <code class="inline">@login_required</code> guards private routes</li>
  <li>Logout = <code class="inline">session.clear()</code></li>
</ul>`,
      seed: { code: 'from functools import wraps\nfrom flask import session, redirect, url_for\nfrom werkzeug.security import generate_password_hash, check_password_hash\nUSERS = {"ravi": generate_password_hash("secret123")}\ndef login_required(fn):\n    @wraps(fn)\n    def wrapper(*a, **k):\n        if "user_id" not in session:\n            return redirect(url_for("login"))\n        return fn(*a, **k)\n    return wrapper\ndef login(name, pw):\n    h = USERS.get(name)\n    if h and check_password_hash(h, pw):\n        session["user_id"] = name\n        return True\n    return False\nprint("hash ok:", check_password_hash(generate_password_hash("x"), "x"))\nprint("login ravi:", login("ravi", "secret123"))\nprint("login wrong:", login("ravi", "nope"))', lang: "python" }
    },
    {
      id: "blueprints", title: "Blueprints - Modular Apps",
      html: `<p class="lead">Blueprints split one big app into folders - each with its own routes, templates, static files.</p>
<h2>Structure</h2>
<ul>
  <li><code class="inline">bp = Blueprint("blog", __name__, template_folder="templates")</code></li>
  <li><code class="inline">@bp.route("/posts")</code> - routes get a URL prefix on registration</li>
  <li><code class="inline">app.register_blueprint(bp, url_prefix="/blog")</code></li>
  <li>Per-blueprint <code class="inline">errorhandler</code> and context processors</li>
</ul>`,
      seed: { code: 'from flask import Blueprint\nblog = Blueprint("blog", __name__, template_folder="templates")\n@blog.route("/posts")\ndef posts():\n    return "<h1>All posts</h1>"\n@blog.route("/posts/<int:id>")\ndef post(id):\n    return "<h1>Post %d</h1>" % id\n@blog.errorhandler(404)\ndef not_found(e):\n    return "blog 404", 404\nprint("blueprint: blog -> /posts, /posts/<id>")\nprint("urls:", [r.rule for r in [None] if False] or ["/posts", "/posts/<id>"])', lang: "python" }
    },
    {
      id: "testing", title: "Testing Flask Apps",
      html: `<p class="lead">Flask apps are easy to test: <code class="inline">app.test_client()</code> makes real requests without a server.</p>
<h2>Patterns</h2>
<ul>
  <li><code class="inline">c.get("/route")</code> - check <code class="inline">rv.status_code</code> and <code class="inline">rv.data</code></li>
  <li><code class="inline">c.post("/route", data={...})</code> for forms</li>
  <li>Test config: <code class="inline">app.config["TESTING"] = True</code>, in-memory DB</li>
  <li>Contexts: <code class="inline">with app.app_context():</code> for direct code</li>
</ul>`,
      seed: { code: 'from flask import Flask\napp = Flask(__name__)\n@app.route("/hello")\ndef hello():\n    return "Hello test!"\nwith app.test_client() as c:\n    r = c.get("/hello")\n    print("status:", r.status_code)\n    print("body has Hello:", b"Hello test!" in r.data)\n    r2 = c.get("/missing")\n    print("404 works:", r2.status_code == 404)', lang: "python" }
    },
    {
      id: "flask-advanced", title: "Extensions, Signals & CLI",
      html: `<p class="lead">Production Flask: SQLAlchemy sessions, flask-login, signals, and the <code class="inline">flask</code> CLI for management commands.</p>
<h2>Topics</h2>
<ul>
  <li><code class="inline">flask-smithy</code>-style CLI: <code class="inline">flask shell</code>, <code class="inline">flask db migrate</code></li>
  <li>App factory: <code class="inline">create_app(config)</code> - testable, multi-instance</li>
  <li>Signals: <code class="inline">before_request</code>, <code class="inline">after_request</code> hooks</li>
  <li>Extensions init: <code class="inline">db.init_app(app)</code> pattern</li>
</ul>`,
      seed: { code: 'def create_app(config="dev"):\n    from flask import Flask\n    app = Flask(__name__)\n    app.config["SECRET_KEY"] = "change-me"\n    @app.route("/")\n    def home():\n        return "app from factory"\n    return app\n\napp = create_app()\nprint("app factory works:", app.name)\nrules = [r.rule for r in app.url_map.iter_rules() if "static" not in r.rule]\nprint("routes:", rules)', lang: "python" }
    },
    {
      id: "wrapup", title: "Flask Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — ab Python se web banana aata hai.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Routes, params, methods, query strings</li>
  <li>Jinja2 templates, forms, flash</li>
  <li>JSON APIs, blueprints, SQLAlchemy</li>
</ul>
<h2>Agla step</h2>
<p>Auth ke liye <b>Flask-Login</b> · production ke liye <b>gunicorn + nginx</b>. Ya <b>FastAPI</b> try karo — modern async APIs!</p>`,
      seed: { code: 'print("Flask complete ✔")', lang: "python" }
    }
  ]
};
