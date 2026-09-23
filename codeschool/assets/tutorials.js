/* ============================================================
   GodxShadow — course data (W3Schools-style lesson bank)
   Structure: COURSES[slug] = { name, color, icon, lessons:[{id,title,html,seed}] }
   seed = { html, css, js } loaded into the live editor for "Try it yourself"
   ============================================================ */

const DEFAULT_SEED = {
  html: '<!DOCTYPE html>\n<html>\n<body>\n\n<h1>GodxShadow Editor</h1>\n<p>Edit the code and see the result live.</p>\n\n</body>\n</html>',
  css: 'body {\n  font-family: sans-serif;\n  background: #0b0f1e;\n  color: #22e8ff;\n}',
  js: 'console.log("Hello from GodxShadow!");\ndocument.querySelector("p").style.color = "#ff3ea5";'
};

/* course files attach themselves here, in include order */
const COURSES = {};

/* ---------- helper lookups ---------- */
function allLessons() {
  const out = [];
  Object.keys(COURSES).forEach(cs => {
    COURSES[cs].lessons.forEach(l => out.push({
      course: cs, courseName: COURSES[cs].name, id: l.id, title: l.title
    }));
  });
  return out;
}
function findLesson(cs, id) {
  const c = COURSES[cs];
  if (!c) return null;
  return c.lessons.find(l => l.id === id) || null;
}
