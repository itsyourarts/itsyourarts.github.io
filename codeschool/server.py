#!/usr/bin/env python3
"""GodxShadow preview server: static files + POST /run (language code runner)."""
import http.server
import os
import json
import time
import subprocess
import tempfile
import shutil
import re
import socketserver
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
TIMEOUT = 10
CAP = 20000


def cap(s):
    s = s or ""
    return s[:CAP] + ("\n…(truncated)" if len(s) > CAP else "")


def finish(t0, ok, stdout, stderr, exitcode=None):
    return {
        "ok": ok,
        "stdout": cap(stdout),
        "stderr": cap(stderr),
        "exit": exitcode if exitcode is not None else (0 if ok else 1),
        "time": int((time.time() - t0) * 1000),
    }


def run_sql(t0, code):
    import sqlite3
    con = sqlite3.connect(":memory:")
    seed = (
        "CREATE TABLE IF NOT EXISTS Customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, country TEXT);\n"
        "INSERT INTO Customers (name, city, country) VALUES ('Aman','Delhi','India'),('Bianca','NYC','USA'),('Chen','Beijing','China'),('Dara','Mumbai','India'),('Ella','London','UK');\n"
        "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price REAL);\n"
        "INSERT INTO products (name, price) VALUES ('smartphone',999),('phone case',25),('laptop',1499),('headphones',199),('megaphone',599);\n"
        "CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);\n"
        "INSERT INTO employees (name, dept, salary) VALUES ('Asha','IT',50000),('Bhavik','IT',62000),('Chitra','HR',41000),('Dev','Sales',45000);\n"
    )
    out = []
    try:
        if "create table" not in code.lower():
            con.executescript(seed)
        for st in [s.strip() for s in code.split(";") if s.strip()]:
            if re.match(r"^(select|with|pragma)\b", st, re.I):
                cur = con.execute(st)
                cols = [d[0] for d in (cur.description or [])]
                rows = cur.fetchall()
                if cols:
                    out.append(" | ".join(cols))
                    out.append("-" * max(20, min(72, sum(len(c) for c in cols) + 3 * len(cols))))
                for r in rows:
                    out.append(" | ".join("" if x is None else str(x) for x in r))
                out.append("(%d row%s)" % (len(rows), "" if len(rows) == 1 else "s"))
            else:
                con.execute(st)
        return finish(t0, True, "\n".join(out) if out else "SQL executed OK (no result set).", "")
    except Exception as e:
        return finish(t0, False, "\n".join(out) if out else "", str(e))
    finally:
        con.close()


CONF = {
    "c": ("main.c", ["gcc", "-O0", "-o", "prog", "main.c"], ["./prog"]),
    "cpp": ("main.cpp", ["g++", "-O0", "-o", "prog", "main.cpp"], ["./prog"]),
    "csharp": ("main.cs", ["mcs", "-out:prog.exe", "main.cs"], ["mono", "prog.exe"]),
    "java": ("Main.java", ["javac", "Main.java"], ["java", "-Xss4m", "Main"]),
    "php": ("main.php", None, ["php", "main.php"]),
    "js": ("main.js", None, ["node", "main.js"]),
}

NO_RUNNER = "No %s compiler is installed in this preview, so this code is shown for learning. Live-run works here for: Python, C, C++, Java, C#, PHP, JavaScript, SQL and Bash."


def run_lang(lang, code):
    t0 = time.time()
    tmp = tempfile.mkdtemp(prefix="gxsrun-")
    try:
        if lang == "python":
            with open(tmp + "/main.py", "w") as f:
                f.write(code)
            p = subprocess.run([sys.executable, "-u", "main.py"], cwd=tmp, capture_output=True,
                               text=True, timeout=TIMEOUT, stdin=subprocess.DEVNULL)
            return finish(t0, p.returncode == 0, p.stdout, p.stderr, p.returncode)

        if lang in CONF:
            fname, compile_cmd, run_cmd = CONF[lang]
            with open(tmp + "/" + fname, "w") as f:
                f.write(code)
            if compile_cmd:
                c1 = subprocess.run(compile_cmd, cwd=tmp, capture_output=True, text=True,
                                    timeout=TIMEOUT, stdin=subprocess.DEVNULL)
                if c1.returncode != 0:
                    return finish(t0, False, "", c1.stderr or "(compilation failed)", c1.returncode)
            p = subprocess.run(run_cmd, cwd=tmp, capture_output=True, text=True,
                               timeout=TIMEOUT, stdin=subprocess.DEVNULL)
            return finish(t0, p.returncode == 0, p.stdout, p.stderr, p.returncode)

        if lang == "bash":
            with open(tmp + "/style.css", "w") as f:
                f.write("body{color:#22e8ff}\n")
            env = dict(os.environ, HOME=tmp, GIT_CONFIG_GLOBAL=tmp + "/.gitcfg")
            for cmd in (["git", "init", "-q"],
                        ["git", "config", "user.email", "dev@godxshadow"],
                        ["git", "config", "user.name", "dev"],
                        ["git", "add", "style.css"],
                        ["git", "commit", "-qm", "init"]):
                subprocess.run(cmd, cwd=tmp, env=env, capture_output=True)
            with open(tmp + "/main.sh", "w") as f:
                f.write(code)
            p = subprocess.run(["bash", "main.sh"], cwd=tmp, env=env, capture_output=True,
                               text=True, timeout=TIMEOUT, stdin=subprocess.DEVNULL)
            return finish(t0, p.returncode == 0, p.stdout, p.stderr, p.returncode)

        if lang == "sql":
            return run_sql(t0, code)

        return finish(t0, False, "", NO_RUNNER % lang)
    except subprocess.TimeoutExpired:
        return finish(t0, False, "", "timed out after %ds" % TIMEOUT)
    except Exception as e:
        return finish(t0, False, "", "runner error: %s" % e)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def do_POST(self):
        if self.path.split("?")[0] != "/run":
            self.send_error(404)
            return
        try:
            n = int(self.headers.get("Content-Length") or 0)
            body = json.loads(self.rfile.read(n) or b"{}")
            res = run_lang(str(body.get("lang", ""))[:16], str(body.get("code", "")))
        except Exception as e:
            res = {"ok": False, "stdout": "", "stderr": "bad request: %s" % e, "exit": -1, "time": 0}
        data = json.dumps(res).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def end_headers(self):
        # CORS: lets a static frontend (e.g. GitHub Pages) call this runner cross-origin.
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def log_message(self, *a):
        pass


class QuietServer(socketserver.ThreadingTCPServer):
    """Ignore client disconnects (browser closed the tab mid-request)."""

    def handle_error(self, request, client_address):
        import sys as _sys
        exc = _sys.exc_info()[1]
        if isinstance(exc, (BrokenPipeError, ConnectionResetError)):
            return
        super().handle_error(request, client_address)


if __name__ == "__main__":
    import socketserver
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    port = int(os.environ.get("PORT", "8000"))
    httpd = QuietServer(("0.0.0.0", port), Handler)
    print("godxshadow server on 0.0.0.0:%d (static + /run)" % port)
    httpd.serve_forever()
