export type EditorTab = 'html' | 'css' | 'javascript';
export type AppView = 'editor' | 'dashboard' | 'projects' | 'templates' | 'settings';

export interface Project {
  id: string;
  name: string;
  html: string;
  css: string;
  javascript: string;
  createdAt: number;
  updatedAt: number;
  templateId?: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  accent: string;
  html: string;
  css: string;
  javascript: string;
}

const now = Date.now();

export const templates: ProjectTemplate[] = [
  {
    id: 'noir-landing',
    name: 'Noir Studio',
    category: 'Landing page',
    description: 'A high-contrast launch page for a studio with a point of view.',
    icon: '✳',
    accent: '#a58cff',
    html: `<div class="page-shell">
  <nav class="nav"><a class="wordmark" href="#">NOIR<span>®</span></a><div class="nav-links"><a href="#work">Work</a><a href="#studio">Studio</a><a href="#contact">Contact</a></div><button class="nav-cta" id="navCta">Let’s talk <span>↗</span></button></nav>
  <main class="hero" id="studio">
    <div class="hero-copy"><div class="eyebrow"><span class="live-dot"></span> Independent digital studio · Est. 2018</div><h1>Make your<br>mark in the <em>dark.</em></h1><p>We build distinctive digital experiences for ambitious people shaping what comes next.</p><div class="hero-actions"><a class="primary-link" href="#work">Explore our work <span>↗</span></a><a class="text-link" href="#studio">A little about us <span>↓</span></a></div></div>
    <div class="hero-art"><div class="orb orb-one"></div><div class="orb orb-two"></div><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="art-label"><span>FIG. 01</span><span>CREATIVE MATTER</span></div><div class="art-center">N<span>®</span></div></div>
    <div class="hero-foot"><span>SCROLL TO DISCOVER</span><div class="scroll-line"></div><span>01 — 04</span></div>
  </main>
  <section class="work" id="work"><div><span class="section-kicker">SELECTED WORK · 2024—25</span><h2>Ideas with<br>intention.</h2></div><div class="work-card"><div class="card-art"><span>FORM / FUNCTION</span><b>01</b></div><div class="card-caption"><strong>Form &amp; Function</strong><span>Brand world · Digital</span></div></div></section>
  <footer id="contact"><span>Have a good one in mind?</span><a href="mailto:hello@noir.studio">Let’s make it real ↗</a></footer>
</div>`,
    css: `:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#0b0a0e;color:#f5f1ec;font-family:Manrope,Inter,Arial,sans-serif}.page-shell{max-width:1180px;margin:auto;padding:0 7.5%}.nav{height:86px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #ffffff17}.wordmark{font-weight:800;letter-spacing:-.08em;font-size:22px;color:#f8f4f2;text-decoration:none}.wordmark span{font:9px 'DM Mono',monospace;vertical-align:top;margin-left:4px}.nav-links{display:flex;gap:34px}.nav-links a,.text-link{color:#a9a4ac;text-decoration:none;font-size:11px}.nav-links a:hover,.text-link:hover{color:#fff}.nav-cta{background:transparent;border:1px solid #ffffff35;border-radius:2px;padding:11px 15px;color:#eee;font-size:10px;letter-spacing:.04em}.nav-cta span{color:#bd9aff;margin-left:12px}.hero{min-height:610px;position:relative;display:grid;grid-template-columns:1fr .9fr;align-items:center;gap:4%}.hero-copy{position:relative;z-index:2;padding:65px 0 85px}.eyebrow,.section-kicker{font:9px 'DM Mono',monospace;text-transform:uppercase;letter-spacing:.16em;color:#99939e}.live-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#ad8cff;box-shadow:0 0 12px #ad8cff;margin:0 8px 1px 0}.hero h1{font-size:clamp(44px,6vw,77px);line-height:.98;letter-spacing:-.075em;margin:26px 0 20px;font-weight:600}.hero h1 em{font-weight:400;color:#a990f4}.hero-copy>p{font-size:13px;color:#aaa5ad;line-height:1.8;max-width:370px}.hero-actions{display:flex;align-items:center;gap:28px;margin-top:31px}.primary-link{background:#b89aff;color:#170f24;padding:14px 17px;text-decoration:none;font-size:10px;font-weight:700}.primary-link span{margin-left:22px}.text-link{font-size:10px}.text-link span{margin-left:8px;color:#b89aff}.hero-art{height:410px;position:relative;display:grid;place-items:center;overflow:hidden;background:radial-gradient(ellipse at 50% 48%,#30213f 0,#15111c 38%,#0b0a0e 72%)}.orb{position:absolute;border-radius:50%;filter:blur(1px)}.orb-one{width:194px;height:194px;background:radial-gradient(circle at 35% 30%,#f4eaff,#b99aff 20%,#4d3680 55%,#140f20 74%);box-shadow:0 0 90px #a376eb55;z-index:1}.orb-two{width:84px;height:84px;right:18%;top:19%;background:radial-gradient(circle at 35% 30%,#e6caff,#9f78fa 38%,#4d337e);box-shadow:0 0 40px #9f78fa70}.orbit{position:absolute;border:1px solid #c5a4fc2d;border-radius:50%;width:315px;height:115px;transform:rotate(-33deg)}.orbit-two{width:360px;height:150px;transform:rotate(54deg);border-color:#c5a4fc1c}.art-center{position:relative;z-index:2;font-size:65px;font-weight:800;letter-spacing:-.1em;color:#f9efff;text-shadow:0 2px 25px #d7b8ff99}.art-center span{font:10px 'DM Mono',monospace;vertical-align:top;letter-spacing:0}.art-label{position:absolute;z-index:3;bottom:23px;left:25px;right:25px;display:flex;justify-content:space-between;font:8px 'DM Mono',monospace;color:#aaa0b7;letter-spacing:.12em}.hero-foot{position:absolute;bottom:24px;left:0;right:0;display:flex;align-items:center;gap:14px;color:#706b75;font:8px 'DM Mono',monospace;letter-spacing:.12em}.hero-foot span:last-child{margin-left:auto}.scroll-line{width:50px;height:1px;background:#a88bf1}.work{border-top:1px solid #ffffff17;padding:66px 0 80px;display:grid;grid-template-columns:1fr 1fr;gap:50px}.work h2{font-size:46px;line-height:.98;letter-spacing:-.07em;font-weight:500;margin:18px 0}.work-card{margin-top:5px}.card-art{height:175px;background:radial-gradient(circle at 68% 50%,#d9c4ee,#705489 14%,#2b2336 35%,#15131a 72%);display:flex;align-items:flex-end;justify-content:space-between;padding:17px;color:#e8d8f9;font:9px 'DM Mono',monospace;letter-spacing:.12em}.card-art b{font-size:10px;font-weight:400}.card-caption{display:flex;justify-content:space-between;padding-top:13px;font-size:10px}.card-caption span{color:#827c87}footer{border-top:1px solid #ffffff17;padding:24px 0 44px;display:flex;justify-content:space-between;font-size:11px;color:#9a949e}footer a{color:#c5aaff;text-decoration:none}@media(max-width:700px){.page-shell{padding:0 6%}.nav{height:66px}.nav-links{display:none}.hero{display:block;padding-top:34px;min-height:auto}.hero-copy{padding:35px 0 32px}.hero-art{height:280px}.hero-foot{position:static;padding:18px 0 28px}.work{padding:42px 0;grid-template-columns:1fr;gap:12px}.work h2{font-size:38px}.card-art{height:150px}footer{gap:12px;flex-direction:column}}`,
    javascript: `document.querySelectorAll('.nav-cta, .primary-link').forEach(function (button) {
  button.addEventListener('click', function (event) {
    if (button.tagName === 'BUTTON') {
      event.preventDefault();
      document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
    }
  });
});
console.log('Noir Studio is ready to make its mark.');`,
  },
  {
    id: 'aurora-dashboard',
    name: 'Aurora Metrics',
    category: 'Dashboard',
    description: 'A luminous analytics overview with a tiny, interactive chart.',
    icon: '◉',
    accent: '#70d8ff',
    html: `<main class="dashboard"><aside class="side"><div class="brand"><span class="brand-mark">◈</span> AURORA</div><div class="workspace">WORKSPACE <b>⌄</b></div><a class="side-item active">◉ <span>Overview</span></a><a class="side-item">▧ <span>Analytics</span></a><a class="side-item">♧ <span>Customers</span></a><a class="side-item">◷ <span>Reports</span></a><div class="side-bottom">◉ <span>Settings</span></div></aside><section class="main"><header><span>Overview <i>/</i> This month</span><button id="dateButton">Last 30 days⌄</button></header><div class="welcome"><div><span class="eyebrow">MONDAY, OCTOBER 21, 2025</span><h1>Good morning, Alex <span>✦</span></h1><p>Here’s what’s happening with your store today.</p></div><button class="export" id="exportButton">↧ &nbsp; Export report</button></div><div class="stats"><article><span>Total revenue</span><b>$48,294</b><small>↗ 12.8% <i>vs last month</i></small></article><article><span>Active users</span><b>8,549</b><small>↗ 8.2% <i>vs last month</i></small></article><article><span>Conversion rate</span><b>3.64%</b><small>↗ 0.6% <i>vs last month</i></small></article></div><section class="chart-card"><div class="chart-head"><div><span class="eyebrow">PERFORMANCE</span><h2>Revenue over time</h2></div><div class="legend"><i></i> This month</div></div><div class="chart"><div class="y-labels"><span>$50k</span><span>$35k</span><span>$20k</span><span>$5k</span></div><svg viewBox="0 0 700 210" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#80ddff" stop-opacity=".24"/><stop offset="1" stop-color="#80ddff" stop-opacity="0"/></linearGradient></defs><path class="area" d="M0 180 C50 166 55 138 105 148 S170 160 210 120 S280 144 325 101 S385 120 430 89 S500 101 540 61 S615 82 650 34 S680 47 700 20 L700 210 L0 210Z"/><path class="line" d="M0 180 C50 166 55 138 105 148 S170 160 210 120 S280 144 325 101 S385 120 430 89 S500 101 540 61 S615 82 650 34 S680 47 700 20"/></svg><div class="x-labels"><span>Oct 01</span><span>Oct 06</span><span>Oct 12</span><span>Oct 18</span><span>Oct 24</span><span>Oct 30</span></div></div></section><div class="activity"><span>RECENT ACTIVITY</span><b>View all ↗</b></div></section></main>`,
    css: `*{box-sizing:border-box}body{margin:0;background:#0c1017;color:#ecf1f8;font:12px Inter,Arial,sans-serif}.dashboard{min-height:600px;display:flex;background:#0c1017}.side{width:182px;background:#10151e;border-right:1px solid #202934;padding:23px 14px;display:flex;flex-direction:column}.brand{font-size:13px;font-weight:800;letter-spacing:.13em;margin:0 0 38px 6px}.brand-mark{color:#72d8ff;font-size:20px;margin-right:7px}.workspace{color:#65717e;font-size:8px;letter-spacing:.13em;padding:0 9px 14px}.workspace b{float:right;font-size:11px}.side-item,.side-bottom{padding:11px 10px;border-radius:6px;color:#82909e;display:flex;gap:11px;align-items:center;margin:2px 0;font-size:11px}.side-item.active{background:#1a2530;color:#87ddff;box-shadow:inset 2px 0 #7bdcff}.side-bottom{margin-top:auto}.main{flex:1;padding:21px 25px;min-width:0}header{display:flex;justify-content:space-between;color:#84909d;font-size:10px;border-bottom:1px solid #1d2630;padding:0 0 17px}header i{font-style:normal;margin:0 7px;color:#38434e}header button,.export{border:1px solid #293643;border-radius:5px;padding:8px 10px;background:#131b24;color:#b7c6d1;font-size:9px}.welcome{display:flex;align-items:flex-end;justify-content:space-between;margin:27px 0 20px}.eyebrow{font-size:8px;letter-spacing:.16em;color:#687785}.welcome h1{font-size:22px;letter-spacing:-.05em;margin:9px 0 5px}.welcome h1 span{color:#88e1ff;font-size:14px}.welcome p{font-size:10px;color:#74818e;margin:0}.export{background:#70d4f2;color:#09202b;border:0;font-weight:700}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stats article{background:#111923;border:1px solid #202b36;padding:15px;border-radius:7px;display:flex;flex-direction:column;gap:8px}.stats article span{font-size:9px;color:#8b9ba8}.stats article b{font-size:21px;letter-spacing:-.04em}.stats small{font-size:8px;color:#62d9ae}.stats small i{font-style:normal;color:#65727e;margin-left:4px}.chart-card{background:#111923;border:1px solid #202b36;border-radius:7px;margin-top:12px;padding:16px 16px 12px}.chart-head{display:flex;justify-content:space-between;align-items:center}.chart-head h2{font-size:13px;margin:6px 0 0}.legend{font-size:8px;color:#90a1ac}.legend i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#7dddff;margin-right:5px}.chart{height:205px;position:relative;padding:17px 0 19px 34px}.chart:before{content:'';position:absolute;left:34px;right:0;top:18px;bottom:32px;background:repeating-linear-gradient(to bottom,transparent 0,transparent 35px,#202a34 36px)}.y-labels{position:absolute;left:0;top:13px;bottom:28px;display:flex;flex-direction:column;justify-content:space-between;color:#63717f;font-size:8px}.chart svg{position:relative;width:100%;height:100%;overflow:visible}.area{fill:url(#fill)}.line{fill:none;stroke:#7bdfff;stroke-width:2;vector-effect:non-scaling-stroke}.x-labels{position:absolute;left:34px;right:0;bottom:0;display:flex;justify-content:space-between;color:#63717f;font-size:8px}.activity{margin-top:19px;display:flex;justify-content:space-between;color:#7a8793;font-size:8px;letter-spacing:.13em}.activity b{color:#83dfff;font-size:8px;letter-spacing:0}@media(max-width:600px){.side{width:48px;padding:18px 7px}.brand{font-size:0;margin-left:6px}.brand-mark{font-size:18px}.workspace,.side-item span,.side-bottom span{display:none}.side-item,.side-bottom{justify-content:center;padding:12px 0}.main{padding:16px 12px}.welcome{align-items:flex-start;gap:12px;flex-direction:column}.stats{grid-template-columns:1fr}.stats article{padding:12px}.chart-card{padding:12px}.chart{height:170px}}`,
    javascript: `document.querySelector('#exportButton').addEventListener('click', function () {
  console.log('Your report is ready to export.');
  this.textContent = '✓  Report ready';
});
document.querySelector('#dateButton').addEventListener('click', function () {
  this.textContent = this.textContent.includes('30') ? 'Last 7 days⌄' : 'Last 30 days⌄';
});
console.log('Aurora metrics loaded.');`,
  },
  {
    id: 'counter-playground',
    name: 'Tiny Interactions',
    category: 'Interactive',
    description: 'A joyful counter app to explore state, events and motion.',
    icon: '✦',
    accent: '#ffb37d',
    html: `<main class="scene"><div class="top"><span class="brand">little<span>things</span></span><span class="pill"><i></i> PLAYGROUND 01</span></div><section class="counter-card"><div class="spark">✦</div><span class="label">A MOMENT, MADE COUNTABLE</span><h1>Your little<br><em>big</em> number.</h1><div class="counter"><button id="minus" aria-label="Decrease">−</button><output id="count">08</output><button id="plus" aria-label="Increase">+</button></div><p id="message">Every click is a new beginning.</p><button class="reset" id="reset">Start again ↺</button></section><footer><span>GOOD THINGS TAKE TIME.</span><span>MADE FOR THE IN-BETWEEN ✿</span></footer></main>`,
    css: `*{box-sizing:border-box}body{margin:0;background:#f2eee8;color:#27231f;font-family:Inter,Arial,sans-serif}.scene{min-height:590px;padding:30px 7%;display:flex;flex-direction:column;background:radial-gradient(circle at 50% 45%,#fffaf3 0,#f4efe8 55%,#eee8df 100%)}.top,.scene footer{display:flex;justify-content:space-between;align-items:center}.brand{font-size:17px;font-weight:800;letter-spacing:-.08em}.brand span{font-weight:400;color:#a89888}.pill{font-size:8px;letter-spacing:.12em;color:#827a71;border:1px solid #ded6cd;padding:8px 10px;border-radius:20px}.pill i{display:inline-block;width:5px;height:5px;border-radius:50%;background:#ff9e67;margin-right:5px}.counter-card{margin:auto;text-align:center;width:min(100%,370px);padding:29px 20px;position:relative}.spark{font-size:28px;color:#ff9e67;margin-bottom:12px}.label{font-size:8px;letter-spacing:.17em;color:#93897d}.counter-card h1{font-size:40px;line-height:.98;letter-spacing:-.08em;margin:15px 0 26px;font-weight:600}.counter-card h1 em{font-family:Georgia,serif;font-weight:400;color:#d18b61}.counter{display:flex;align-items:center;justify-content:center;gap:20px}.counter button{width:39px;height:39px;border:1px solid #d8cfc6;border-radius:50%;background:transparent;font-size:18px;color:#65584e;cursor:pointer}.counter button:hover{background:#f4dfd0;border-color:#e5ae88}.counter output{min-width:68px;font-size:50px;font-weight:600;letter-spacing:-.08em;font-variant-numeric:tabular-nums}.counter-card p{color:#8f857b;font-size:10px;margin:14px 0}.reset{border:0;background:#292520;color:#fff4e8;border-radius:3px;padding:10px 16px;font-size:9px;margin-top:12px;cursor:pointer}.scene footer{font-size:7px;color:#998f84;letter-spacing:.15em}.scene footer span:last-child{color:#c28e6a}@media(max-width:560px){.scene{min-height:520px;padding:22px 5%}.counter-card h1{font-size:36px}.scene footer{font-size:6px}}`,
    javascript: `var count = 8;
var output = document.querySelector('#count');
var message = document.querySelector('#message');
function paint() {
  output.textContent = String(count).padStart(2, '0');
  message.textContent = count === 0 ? 'A blank page. Full of possibility.' : count > 20 ? 'Now you are on a roll.' : 'Every click is a new beginning.';
}
document.querySelector('#plus').addEventListener('click', function () { count += 1; paint(); });
document.querySelector('#minus').addEventListener('click', function () { count = Math.max(0, count - 1); paint(); });
document.querySelector('#reset').addEventListener('click', function () { count = 0; paint(); });`,
  },
  {
    id: 'portfolio-one',
    name: 'Soft Focus',
    category: 'Portfolio',
    description: 'An editorial portfolio for independent designers and makers.',
    icon: '◌',
    accent: '#ed9bc1',
    html: `<main class="portfolio"><nav><a class="logo" href="#">mira<span>.</span></a><div><a href="#work">Work</a><a href="#about">About</a><a href="mailto:hello@example.com">Say hello ↗</a></div></nav><section class="intro" id="about"><div class="photo"><span>✺</span><small>FIG. 01 — IN MY ELEMENT</small></div><div class="intro-copy"><span class="tag">DESIGNER &amp; ART DIRECTOR · BROOKLYN, NY</span><h1>Good design<br>feels like <em>you.</em></h1><p>I help thoughtful brands find their voice and make a little more room for wonder.</p><a href="#work" class="link">A few things I’ve made <b>↓</b></a></div></section><section class="selected" id="work"><div class="selected-head"><span>SELECTED PROJECTS</span><span>2022 — 2025</span></div><div class="project"><span>01</span><b>Good Things Market</b><span>Identity, Art Direction</span><span>↗</span></div><div class="project"><span>02</span><b>Otherworld Journal</b><span>Digital, Editorial</span><span>↗</span></div></section><footer>© MIRA S. — MADE SLOWLY, WITH CARE.</footer></main>`,
    css: `*{box-sizing:border-box}body{margin:0;background:#f7f5f1;color:#292724;font-family:Inter,Arial,sans-serif}.portfolio{max-width:940px;margin:auto;padding:0 7%}nav{height:72px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e7e2dc}.logo{font-size:22px;font-weight:700;letter-spacing:-.1em;color:#2e2926;text-decoration:none}.logo span{color:#e89aba}nav div{display:flex;gap:23px}nav div a{font-size:9px;color:#77716c;text-decoration:none}.intro{display:grid;grid-template-columns:.85fr 1fr;align-items:center;gap:9%;padding:43px 0 52px}.photo{height:260px;background:radial-gradient(ellipse at 51% 42%,#f4cfda 0,#db9fb1 22%,#bb8295 38%,#8c6c73 62%,#e9d8d2 63%,#e9d8d2 100%);position:relative;display:grid;place-items:center;overflow:hidden}.photo:after{content:'';position:absolute;inset:0;background:linear-gradient(145deg,transparent 48%,#37262c55)}.photo span{font-size:73px;color:#fff8f099;text-shadow:0 3px 22px #562c4670}.photo small{position:absolute;bottom:12px;left:13px;font-size:7px;letter-spacing:.13em;color:#fff;z-index:1}.tag,.selected-head{font-size:7px;color:#948b82;letter-spacing:.14em}.intro-copy h1{font-size:45px;line-height:.99;letter-spacing:-.075em;font-weight:600;margin:15px 0}.intro-copy h1 em{font-family:Georgia,serif;font-weight:400;color:#c77f98}.intro-copy p{font-size:10px;line-height:1.8;color:#827a74;max-width:250px}.link{display:inline-block;margin-top:13px;color:#5a4d49;text-decoration:none;font-size:9px;border-bottom:1px solid #d9c5bf;padding-bottom:5px}.link b{color:#d486a2;margin-left:13px}.selected{padding:20px 0 36px;border-top:1px solid #e7e2dc}.selected-head{display:flex;justify-content:space-between;margin-bottom:13px}.project{display:grid;grid-template-columns:40px 1.3fr 1fr 20px;align-items:center;border-bottom:1px solid #e7e2dc;padding:14px 0;font-size:9px;color:#89827a}.project b{font-size:11px;color:#3e3935;font-weight:500}.project:last-child{border:0}.project span:last-child{font-size:13px;color:#c78099}footer{border-top:1px solid #e7e2dc;padding:17px 0 27px;font-size:7px;color:#a09990;letter-spacing:.13em}@media(max-width:600px){.intro{grid-template-columns:1fr;padding:26px 0;gap:25px}.photo{height:220px}.intro-copy h1{font-size:38px}.portfolio{padding:0 6%}.project{grid-template-columns:28px 1fr 20px}.project span:nth-child(3){display:none}nav div{gap:12px}}`,
    javascript: `document.querySelectorAll('.project').forEach(function (project) {
  project.addEventListener('click', function () {
    console.log('Project selected:', project.querySelector('b').textContent);
  });
});
console.log('Welcome to Mira’s portfolio.');`,
  },
];

export const starterProject: Project = {
  id: 'starter-noir',
  name: 'Noir Studio',
  html: templates[0].html,
  css: templates[0].css,
  javascript: templates[0].javascript,
  createdAt: now,
  updatedAt: now,
  templateId: templates[0].id,
};

export const initialProjects: Project[] = [
  starterProject,
  {
    id: 'starter-aurora',
    name: 'Aurora Metrics',
    html: templates[1].html,
    css: templates[1].css,
    javascript: templates[1].javascript,
    createdAt: now - 1000 * 60 * 60 * 26,
    updatedAt: now - 1000 * 60 * 60 * 2,
    templateId: templates[1].id,
  },
  {
    id: 'starter-tiny',
    name: 'Tiny Interactions',
    html: templates[2].html,
    css: templates[2].css,
    javascript: templates[2].javascript,
    createdAt: now - 1000 * 60 * 60 * 24 * 3,
    updatedAt: now - 1000 * 60 * 60 * 24,
    templateId: templates[2].id,
  },
];
