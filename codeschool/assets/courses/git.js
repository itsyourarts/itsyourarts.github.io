/* GodxShadow course: Git & GitHub — start se end tak */
COURSES.git = {
  name: "Git & GitHub", color: "#ff6b4a", icon: "Git", blurb: "Version control — code ka time machine aur team collaboration.",
  lessons: [
    {
      id: "intro", title: "Git Introduction",
      html: `
<p class="lead"><b>Git</b> = version control system — code ke har change ki history. <b>GitHub</b> = online hosting + collaboration.</p>
<h2>Kyun zaroori?</h2>
<ul>
  <li>Galti ho to pehle wale version par wapas</li>
  <li>Team mein sab apna kaam, merge</li>
  <li>Portfolio — resume par GitHub link</li>
</ul>
<h2>Setup</h2>
<p><code class="inline">git --version</code> → <code class="inline">git config --global user.name "Sha"</code> → <code class="inline">git config --global user.email "sha@x.com"</code></p>`,
      seed: { code: '# pehli baar setup\ngit config --global user.name "Shadow"\ngit config --global user.email "shadow@godxshadow.dev"\n\n# naya repo\ngit init my-app\ncd my-app', lang: "bash" }
    },
    {
      id: "basics", title: "init, add, commit",
      html: `
<p class="lead">Git ka daily loop: <b>change → stage → commit</b>.</p>
<h2>Commands</h2>
<ul>
  <li><code class="inline">git status</code> — kya changed, kya staged</li>
  <li><code class="inline">git add .</code> — sab stage karo</li>
  <li><code class="inline">git commit -m "msg"</code> — milestone banao</li>
  <li><code class="inline">git log --oneline</code> — history dekho</li>
</ul>
<div class="tip"><b>Commit messages:</b> chhote, clear, present tense — "add login page", not "updated some files".</div>`,
      seed: { code: 'git status          # modified: style.css\ngit add style.css\ngit commit -m "add neon theme to style.css"\n\ngit log --oneline   # a1b2c3 add neon theme...', lang: "bash" }
    },
    {
      id: "branching", title: "Branches & Merge",
      html: `
<p class="lead"><b>Branch</b> = parallel line of work. Naya feature? Nayi branch. Done? Merge back.</p>
<h2>Commands</h2>
<ul>
  <li><code class="inline">git branch feature-x</code> — branch banao</li>
  <li><code class="inline">git switch feature-x</code> (ya <code class="inline">checkout</code>) — jao uspe</li>
  <li><code class="inline">git switch -c hotfix</code> — banao + jao (ek saath)</li>
  <li><code class="inline">git merge feature-x</code> — current branch mein lao</li>
  <li><code class="inline">git branch -d feature-x</code> — delete</li>
</ul>`,
      seed: { code: 'git switch -c neon-editor\n# code changes...\ngit add . && git commit -m "add neon editor"\n\ngit switch main\ngit merge neon-editor\ngit branch -d neon-editor', lang: "bash" }
    },
    {
      id: "github", title: "GitHub: push, pull, clone",
      html: `
<p class="lead">GitHub = remote copy. Team ke saath share ko yeh enable karta hai.</p>
<h2>Remote commands</h2>
<ul>
  <li><code class="inline">git remote add origin https://github.com/you/app.git</code></li>
  <li><code class="inline">git push -u origin main</code></li>
  <li><code class="inline">git pull</code> — remote changes lao</li>
  <li><code class="inline">git clone &lt;url&gt;</code> — project download</li>
  <li><code class="inline">git fetch</code> — info lao, merge baad mein</li>
</ul>`,
      seed: { code: 'git remote add origin git@github.com:shadow/app.git\ngit branch -M main\ngit push -u origin main\n\n# baad mein daily flow\ngit pull origin main\ngit add . && git commit -m "fix: neon glow"\ngit push', lang: "bash" }
    },
    {
      id: "collaboration", title: "PRs, Forks & Conflicts",
      html: `
<p class="lead">Real-world teams ka workflow — <b>fork → branch → pull request → review → merge</b>.</p>
<h2>Pull Request flow</h2>
<ul>
  <li>Fork → clone apna → branch → push → GitHub par "Open PR"</li>
  <li>Review ke baad merge → branch delete</li>
</ul>
<h2>Merge conflict?</h2>
<p>Same line dono ne change ki — file mein <code class="inline">&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> markers aa jaate hain. Fix karo, <code class="inline">git add</code>, <code class="inline">git commit</code>.</p>`,
      seed: { code: '# conflict markers app.js mein\n<<<<<<< HEAD\nconst theme = "neon";\n=======\nconst theme = "cyberpunk";\n>>>>>>> feature/theme\n\n# fix: sahi rakho, markers hatao, phir\ngit add app.js\ngit commit -m "resolve theme conflict"', lang: "bash" }
    },
    {
      id: "undo", title: "Undo: restore, reset, revert",
      html: `
<p class="lead">Galti se bachne ke Git ke alag-alag rahaste — situation ke hisaab se.</p>
<h2>Cheatsheet</h2>
<ul>
  <li><code class="inline">git restore file.js</code> — unstaged changes drop</li>
  <li><code class="inline">git restore --staged file.js</code> — unstage</li>
  <li><code class="inline">git reset HEAD~1</code> — last commit undo (files rahengi)</li>
  <li><code class="inline">git revert &lt;hash&gt;</code> — safe undo (shared history par)</li>
  <li><code class="inline">git stash / git stash pop</code> — kaam side mein rakh lo</li>
</ul>
<div class="warn"><code class="inline">git reset --hard</code> se data kho sakta hai — dhyan se!</div>`,
      seed: { code: 'git stash           # kaam side mein\ngit switch hotfix   # urgent fix pe jao\n# ...fix karke wapas\ngit switch main\ngit stash pop       # kaam wapas lao', lang: "bash" }
    },
    {
      id: "gitignore", title: ".gitignore & Best Practices",
      html: `
<p class="lead">Har cheez Git mein nahi daalni — <code class="inline">.gitignore</code> filer ka gatekeeper hai.</p>
<h2>Common ignores</h2>
<ul>
  <li><code class="inline">node_modules/</code></li>
  <li><code class="inline">.env</code> — secrets kabhi nahi!</li>
  <li><code class="inline">dist/</code>, <code class="inline">build/</code>, <code class="inline">.DS_Store</code></li>
</ul>
<h2>Pro habits</h2>
<ul>
  <li>Chhote, frequent commits</li>
  <li>Hamesha <code class="inline">git pull</code> pehle, push baad mein</li>
  <li>Secrets leaked? <code class="inline">git-filter-repo</code> se history saaf karo</li>
</ul>`,
      seed: { code: '# .gitignore\nnode_modules/\ndist/\n.env\n*.log\n.DS_Store\n\n# mistakenly track ho gaya?\ngit rm --cached .env\ngit commit -m "stop tracking .env"', lang: "bash" }
    },
    {
      id: "wrapup", title: "Git Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — ab aap kisi bhi team mein confidently kaam kar sakte ho.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>init, add, commit, log</li>
  <li>Branches, merge, conflicts</li>
  <li>GitHub push/pull/clone, PR workflow</li>
  <li>Undo tools + .gitignore</li>
</ul>
<h2>Agla step</h2>
<p>Apna project GitHub par daalo + <b>GitHub Actions</b> se CI/CD try karo. GodxShadow ke lessons bhi Git pe hai! (well, conceptually 😄)</p>`,
      seed: { code: 'git log --oneline\n# ✔ git-basics\n# ✔ branch-merge\n# ✔ github-flow\n# ✔ conflicts-undo', lang: "bash" }
    }
  ]
};
