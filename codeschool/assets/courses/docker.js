/* GodxShadow course: Docker — start se end tak */
COURSES.docker = {
  name: "Docker", color: "#2f9bf7", icon: "🐳", blurb: "Containerization — \"mere machine pe to chalta tha\" ka permanent ilaaj.",
  lessons: [
    {
      id: "intro", title: "Docker Introduction",
      html: `
<p class="lead"><b>Docker</b> app ko dependencies ke saath ek <b>container</b> mein pack karta hai — har jagah same chalega: laptop, server, cloud.</p>
<h2>Core concepts</h2>
<ul>
  <li><b>Image</b> — blueprint (disk par blueprint cache)</li>
  <li><b>Container</b> — image ka running instance</li>
  <li><b>Registry</b> — Docker Hub (public images)</li>
</ul>
<div class="note">Ubuntu terminal mein docker commands chalte hain; desktop app (Docker Desktop) GUI deta hai.</div>`,
      seed: { code: '# version check\ndocker --version\n\n# pehla container\ndocker run hello-world\n\n# nginx server run karo\ndocker run -d -p 8080:80 --name web nginx\n# ab browser: http://localhost:8080', lang: "bash" }
    },
    {
      id: "images-containers", title: "Images & Containers",
      html: `
<p class="lead">Daily commands — container lifecycle manage karna.</p>
<h2>Essential commands</h2>
<ul>
  <li><code class="inline">docker ps</code> / <code class="inline">docker ps -a</code> — running/all containers</li>
  <li><code class="inline">docker images</code> — downloaded images</li>
  <li><code class="inline">docker run -it ubuntu bash</code> — interactive shell</li>
  <li><code class="inline">docker stop/rm ID</code> · <code class="inline">docker exec -it web bash</code></li>
  <li><code class="inline">docker logs -f web</code></li>
</ul>`,
      seed: { code: 'docker run -d --name db -e POSTGRES_PASSWORD=secret postgres\ndocker ps              # chal rahe containers\ndocker logs db         # dekho kya hora\ndocker exec -it db psql -U postgres   # andar shell\ndocker stop db && docker rm db', lang: "bash" }
    },
    {
      id: "dockerfile", title: "Dockerfile & Build",
      html: `
<p class="lead">Khud ki image banao — <b>Dockerfile</b> mein instructions likhke.</p>
<h2>Key instructions</h2>
<ul>
  <li><code class="inline">FROM</code> base image · <code class="inline">WORKDIR</code> kaam ka folder</li>
  <li><code class="inline">COPY</code> files · <code class="inline">RUN</code> commands · <code class="inline">CMD</code> start command</li>
  <li><code class="inline">EXPOSE</code> port · <code class="inline">ENV</code> variables</li>
  <li><code class="inline">docker build -t myapp .</code></li>
</ul>
<div class="tip"><b>.dockerignore</b> mein node_modules daalwao — context chhota rahega, build fast!</div>`,
      seed: { code: 'FROM node:20-alpine\n\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\n\nEXPOSE 3000\nENV NODE_ENV=production\nCMD ["node", "src/index.js"]\n\n# build & run:\n# docker build -t myapp .\n# docker run -d -p 3000:3000 myapp', lang: "bash" }
    },
    {
      id: "layers", title: "Layers & Caching",
      html: `
<p class="lead">Docker images <b>layers</b> se banti hain — har instruction ek layer. Cache smartly use karo!</p>
<h2>Rule of thumb</h2>
<ul>
  <li>Jo kam badalti hai, wo pehle likho (deps install before source copy)</li>
  <li><code class="inline">COPY package*.json</code> + install, <b>phir</b> <code class="inline">COPY . .</code> — source change par rebuild fast</li>
  <li>Multi-stage builds — final image chhoti (build env alag, runtime alag)</li>
</ul>`,
      seed: { code: '# Multi-stage — build alag, runtime alag\nFROM node:20 AS builder\nWORKDIR /app\nCOPY . .\nRUN npm ci && npm run build\n\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCMD ["node", "dist/server.js"]\n\n# dekho layers:\n# docker history myapp', lang: "bash" }
    },
    {
      id: "volumes-networks", title: "Volumes & Networks",
      html: `
<p class="lead">Containers ephemeral hain (hatao to data gayab) — data persist karne ke liye <b>volumes</b>. Containers ko aapas mein baat karane ke liye <b>networks</b>.</p>
<h2>Volumes</h2>
<ul>
  <li><code class="inline">docker volume create mydata</code></li>
  <li><code class="inline">-v mydata:/var/lib/mysql</code> — DB data survive container delete</li>
  <li><code class="inline">-v $(pwd):/app</code> — bind mount for live code sync</li>
</ul>
<h2>Networks</h2>
<p>Default bridge mein containers <code class="inline">name</code> se connect — <code class="inline">app → db:5432</code></p>`,
      seed: { code: '# volume with data persistence\ndocker run -d --name db -v pgdata:/var/lib/postgresql/data postgres\n\n# docker rm db   # container gayab\ndocker run -d -v pgdata:/var/lib/postgresql/data --name db2 postgres\n# data zinda hai!\n\n# custom network\ndocker network create appnet\ndocker run -d --name db --network appnet postgres\ndocker run -d --name app --network appnet -e DB_HOST=db myapp', lang: "bash" }
    },
    {
      id: "compose", title: "Docker Compose",
      html: `
<p class="lead">Multi-container apps ko ek <b>docker-compose.yml</b> mein define karo — <code class="inline">docker compose up</code> se sab chal jaata hai.</p>
<h2>Services example</h2>
<ul>
  <li>app + db + redis ek saath</li>
  <li>Depends_on se order control</li>
  <li><code class="inline">docker compose up -d / down / logs -f</code></li>
</ul>`,
      seed: { code: '# docker-compose.yml\nservices:\n  app:\n    build: .\n    ports: ["3000:3000"]\n    environment:\n      DB_URL: postgres://db:5432/shop\n    depends_on: [db]\n\n  db:\n    image: postgres:16-alpine\n    volumes: [pgdata:/var/lib/postgresql/data]\n    environment:\n      POSTGRES_PASSWORD: secret\n  \n  redis:\n    image: redis:alpine\n\nvolumes:\n  pgdata:', lang: "bash" }
    },
    {
      id: "best-practices", title: "Best Practices",
      html: `
<p class="lead">Production ke liye Docker sahi se chalana — size, security, speed.</p>
<h2>Golden rules</h2>
<ul>
  <li><code class="inline">alpine</code> variants — image 5x chhoti</li>
  <li>Single process per container</li>
  <li>Non-root user: <code class="inline">USER node</code></li>
  <li>.dockerignore + multi-stage builds</li>
  <li>Specific tags (<code class="inline">node:20-alpine</code>, <code class="inline">latest</code> nahi!)</li>
  <li>Secrets <code class="inline">ENV</code> mein hardcode mat karo</li>
</ul>`,
      seed: { code: '# image size audit\ndocker images\n\n# scan vulnerabilities\ndocker scout quickview myapp\n\n# .dockerignore\nnode_modules\ndist\n.env\n.git', lang: "bash" }
    },
    {
      id: "wrapup", title: "Docker Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — ab "works on my machine" history hai.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Images vs containers, essential commands</li>
  <li>Dockerfile + build layers + multi-stage</li>
  <li>Volumes (persistence), networks</li>
  <li>Compose multi-service stacks, best practices</li>
</ul>
<h2>Agla step</h2>
<p><b>Kubernetes</b> — containers ko scale par orchestrate karna. Docker Compose se start karo prod-like local dev!</p>`,
      seed: { code: 'docker run --rm hello-world\necho "Docker complete ✔ 🐳"', lang: "bash" }
    }
  ]
};
