/* GodxShadow course: Linux & Bash — start se end tak */
COURSES.linux = {
  name: "Linux & Bash", color: "#ffe066", icon: ">_", blurb: "Terminal se dosti karo — servers, automation, DevOps ki neev.",
  lessons: [
    {
      id: "intro", title: "Linux Introduction",
      html: `
<p class="lead">Servers ka 90%+ duniya <b>Linux</b> par chalti hai. Terminal (shell) mein commands likhna — har developer ki superpower.</p>
<h2>Distros</h2>
<p>Ubuntu (beginner-friendly), Debian, Fedora, Arch (hardcore) — WSL se Windows mein bhi use karo!</p>
<h2>Shell</h2>
<p><code class="inline">bash</code> / <code class="inline">zsh</code> — command interpreter. Prompt: <code class="inline">user@host:~$</code></p>`,
      seed: { code: '# terminal kholke pehli commands\nwhoami          # kaun ho tum\npwd             # kahan ho\nuname -a        # system info\nls -la          # files list', lang: "bash" }
    },
    {
      id: "navigation", title: "Files & Navigation",
      html: `
<p class="lead">File system = ek tree. Root <code class="inline">/</code> se shuru, sab kuch file hai.</p>
<h2>Commands</h2>
<ul>
  <li><code class="inline">cd /var/www</code>, <code class="inline">cd ..</code>, <code class="inline">cd ~</code> (home)</li>
  <li><code class="inline">ls -lh</code>, <code class="inline">tree</code></li>
  <li><code class="inline">mkdir -p a/b/c</code>, <code class="inline">touch file.txt</code></li>
  <li><code class="inline">cp -r src dest</code>, <code class="inline">mv</code>, <code class="inline">rm -rf</code> (dhyan se!)</li>
</ul>`,
      seed: { code: 'cd ~/projects\nmkdir -p godx/assets\ntouch godx/index.html godx/note.md\nls -R godx\n\ncp godx/note.md godx/note.bak.md\nmv godx/note.bak.md ~/Desktop/\nrm -rf /tmp/old-stuff   # ⚠ dhyan se', lang: "bash" }
    },
    {
      id: "read-text", title: "cat, grep, less",
      html: `
<p class="lead">Files dekhna aur andar text dhoondhna — daily ka bread-butter.</p>
<h2>View files</h2>
<ul>
  <li><code class="inline">cat file.txt</code>, <code class="inline">head -10</code>, <code class="inline">tail -5</code></li>
  <li><code class="inline">less big.log</code> — scrollable (<code class="inline">q</code> se exit)</li>
  <li><code class="inline">tail -f server.log</code> — LIVE follow!</li>
</ul>
<h2>grep</h2>
<p><code class="inline">grep "error" app.log</code> · <code class="inline">-n</code> line number · <code class="inline">-i</code> case-insensitive · <code class="inline">-r</code> recursive folder</p>`,
      seed: { code: 'grep -in "error" server.log\ngrep -rn "TODO" src/\n\n# log dekhne ka lifehack (live!)\ntail -f /var/log/nginx/access.log', lang: "bash" }
    },
    {
      id: "pipes", title: "Pipes & Redirection",
      html: `
<p class="lead">Unix philosophy: chhote tools jodkar powerful pipelines banao — <code class="inline">|</code> ka magic.</p>
<h2>Redirection</h2>
<ul>
  <li><code class="inline">&gt; file</code> overwrite · <code class="inline">&gt;&gt;</code> append · <code class="inline">&lt;</code> input</li>
  <li><code class="inline">2&gt;err.log</code> — errors redirect</li>
</ul>
<h2>Pipeline combos</h2>
<p><code class="inline">history | grep "docker" | tail -5</code><br><code class="inline">cat log | sort | uniq -c | sort -nr | head</code></p>`,
      seed: { code: '# command ka output doosre ko do\nls | wc -l                       # kitne files?\nhistory | grep "npm" | head -10\n\n# output file mein save karo\ngrep "ERROR" app.log > errors.txt\ncat errors.txt | sort | uniq -c', lang: "bash" }
    },
    {
      id: "permissions", title: "Permissions & sudo",
      html: `
<p class="lead">Linux security ka base — <b>read(4), write(2), execute(1)</b> har file par, 3 logon ke liye: owner, group, others.</p>
<h2>chmod / chown</h2>
<ul>
  <li><code class="inline">chmod 755 script.sh</code> (rwxr-xr-x)</li>
  <li><code class="inline">chmod +x script.sh</code> — executable banao</li>
  <li><code class="inline">sudo command</code> — admin rights se run</li>
  <li><code class="inline">ls -l</code> → <code class="inline">-rwxr-xr-- 1 user group size date file</code></li>
</ul>`,
      seed: { code: 'ls -l\n# -rwxr-xr-x  1 shadow shadow  deploy.sh\n\nchmod +x deploy.sh\nchmod 644 index.html   # 6=rw, 4=r\nsudo apt update        # admin ke liye sudo', lang: "bash" }
    },
    {
      id: "packages-processes", title: "Packages & Processes",
      html: `
<p class="lead">Software install karna aur running programs manage karna.</p>
<h2>apt (Ubuntu/Debian)</h2>
<ul>
  <li><code class="inline">sudo apt update</code>, <code class="inline">install curl</code>, <code class="inline">remove git</code></li>
</ul>
<h2>Processes</h2>
<ul>
  <li><code class="inline">ps aux</code> · <code class="inline">top</code>/<code class="inline">htop</code></li>
  <li><code class="inline">kill PID</code> · <code class="inline">pkill node</code></li>
  <li><code class="inline">&amp;</code> background · <code class="inline">jobs</code> · <code class="inline">fg</code></li>
</ul>`,
      seed: { code: 'sudo apt update && sudo apt install -y htop curl\n\nhtop                    # task manager!q se exit\nps aux | grep nginx\nkill 4321               # PID 4321 band\n\nnode server.js &        # background mein\njobs\nfg %1                   # foreground mein lao', lang: "bash" }
    },
    {
      id: "bash-scripting", title: "Bash Scripting",
      html: `
<p class="lead">Commands ko .sh file mein likh ke automation banao!</p>
<h2>Script anatomy</h2>
<ul>
  <li><code class="inline">#!/bin/bash</code> — shebang first line</li>
  <li>Variables: <code class="inline">name="sha"</code> (spaces nahi!) → <code class="inline">$name</code></li>
  <li><code class="inline">$1, $2</code> — arguments · <code class="inline">$? </code>— last exit code</li>
  <li><code class="inline">if [ -f file ]; then ... fi</code></li>
</ul>`,
      seed: { code: '#!/bin/bash\nsite=$1\n\necho "Deploying $site..."\n\nif [ -d "dist" ]; then\n    tar -czf backup.tar.gz dist/\n    echo "Backup done ✔"\nelse\n    echo "dist folder nahi mila"\n    exit 1\nfi\n\n# run: chmod +x deploy.sh && ./deploy.sh godxshadow', lang: "bash" }
    },
    {
      id: "wrapup", title: "Linux Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — terminal ab dost hai, dushman nahi.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Navigation, files, text search (grep)</li>
  <li>Pipes & redirection</li>
  <li>Permissions, sudo, packages, processes</li>
  <li>Bash scripts</li>
</ul>
<h2>Agla step</h2>
<p><b>Docker + Linux</b> = DevOps ki neev. SSH keys, cron jobs explore karo!</p>`,
      seed: { code: 'echo "Linux complete ✔"\nalias gxs="cd ~/godxshadow"  # shortcut banao!', lang: "bash" }
    }
  ]
};
