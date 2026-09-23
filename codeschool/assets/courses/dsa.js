/* GodxShadow course: DSA — start se end tak */
COURSES.dsa = {
  name: "DSA", color: "#ff7aa7", icon: "🧠", blurb: "Data Structures & Algorithms — interviews aur coding interviews ki neev.",
  lessons: [
    {
      id: "intro", title: "DSA Introduction & Big-O",
      html: `
<p class="lead"><b>DSA</b> seekhna = better code + shap interviews. Problem solve karne ki taakat badhti hai.</p>
<h2>Big-O (complexity)</h2>
<ul>
  <li><code class="inline">O(1)</code> instant · <code class="inline">O(log n)</code> binary search · <code class="inline">O(n)</code> linear</li>
  <li><code class="inline">O(n log n)</code> good sorts · <code class="inline">O(n²)</code> nested loops (avoid!)</li>
  <li><code class="inline">O(2ⁿ)</code> brute force (exponential — kabhi nahi)</li>
</ul>
<div class="tip"><b>Rule:</b> input 10x → time kitna badhta hai? That's your complexity.</div>`,
      seed: { code: '// O(1)\nconst first = arr[0];\n\n// O(n) — n pe depends\nfor (let x of arr) console.log(x);\n\n// O(log n) — half karte jao\nwhile (low <= high) {\n  const mid = Math.floor((low + high) / 2);\n  ...\n}', lang: "js" }
    },
    {
      id: "arrays", title: "Arrays & Two Pointers",
      html: `
<p class="lead">Array pe techniques — interview mein 90% questions isi se start.</p>
<h2>Patterns</h2>
<ul>
  <li><b>Two pointers</b> — ends se beech tak (palindrome, pairs)</li>
  <li><b>Sliding window</b> — subarray problems</li>
  <li><b>In-place</b> swap — extra space avoid</li>
</ul>`,
      seed: { code: '// reverse array — two pointers O(n)\nfunction reverse(a) {\n  let l = 0, r = a.length - 1;\n  while (l < r) {\n    [a[l], a[r]] = [a[r], a[l]];\n    l++; r--;\n  }\n  return a;\n}\n\n// pre-computed sums → O(1) range sum\nconst pre = [0];\nfor (const x of arr) pre.push(pre.at(-1) + x);\n// sum(i..j) = pre[j+1] - pre[i]', lang: "js" }
    },
    {
      id: "linked-lists", title: "Linked Lists",
      html: `
<p class="lead">Nodes jo ek-doosre ko point karte hain — insertion O(1), search O(n).</p>
<h2>Structure</h2>
<ul>
  <li>Node: <code class="inline">{ value, next }</code></li>
  <li>Fast/slow pointers — middle dhoondho, cycle pakado</li>
  <li>Reverse karna — classic interview question!</li>
</ul>`,
      seed: { code: 'class Node {\n  constructor(v, next = null) { this.v = v; this.next = next; }\n}\n\nfunction reverse(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr; curr = next;\n  }\n  return prev;\n}\n\n// Floyd cycle detect: slow+fast pointer\nfunction hasCycle(head) {\n  let s = head, f = head;\n  while (f && f.next) { s = s.next; f = f.next.next; if (s === f) return true; }\n  return false;\n}', lang: "js" }
    },
    {
      id: "stacks-queues", title: "Stacks & Queues",
      html: `
<p class="lead"><b>Stack</b> = plates ka stack (LIFO). <b>Queue</b> = line (FIFO).</p>
<h2>Uses</h2>
<ul>
  <li>Stack: undo history, bracket matching, Undo/Redo</li>
  <li>Queue: print jobs, BFS traversal, task scheduling</li>
  <li>Deque — dono ends se access (sliding window maxima!)</li>
</ul>`,
      seed: { code: '// bracket balance using stack\nfunction isBalanced(s) {\n  const st = [];\n  const map = { ")": "(", "]": "[", "}": "{" };\n  for (const c of s) {\n    if ("([{".includes(c)) st.push(c);\n    else if (")]}".includes(c) && st.pop() !== map[c]) return false;\n  }\n  return st.length === 0;\n}\n\nisBalanced("(([]){})")   // true\nisBalanced("(()")        // false', lang: "js" }
    },
    {
      id: "hashing", title: "Hashing & Sets",
      html: `
<p class="lead"><b>HashMap/Set</b> — O(1) lookup ka magic. Search ko instant bana deta hai.</p>
<h2>Pattern — counting</h2>
<p><code class="inline">count[x] = (count[x] || 0) + 1</code></p>
<h2>Pair/two-sum trick</h2>
<p><code class="inline">seen.has(target - x)</code> — ek pass mein!</p>`,
      seed: { code: '// two sum — O(n) with hash set\nfunction twoSum(nums, target) {\n  const seen = new Set();\n  for (const x of nums) {\n    if (seen.has(target - x)) return [target - x, x];\n    seen.add(x);\n  }\n  return null;\n}\n\n// character count\nconst freq = {};\nfor (const c of "neonneon") freq[c] = (freq[c] || 0) + 1;\n// { n: 4, e: 2, o: 1 }', lang: "js" }
    },
    {
      id: "recursion", title: "Recursion & Trees",
      html: `
<p class="lead">Function jo khud ko call kare — base case must!</p>
<h2>Formula</h2>
<p>Recursive case + base case. Har call stack par frame banta hai.</p>
<h2>Binary Trees</h2>
<ul>
  <li>Traversals: <b>inorder</b> (sorted!), <b>preorder</b>, <b>postorder</b>, BFS (level-by-level)</li>
  <li><b>BST property</b>: left &lt; root &lt; right → O(log n) search</li>
</ul>`,
      seed: { code: 'function fact(n) {\n  if (n <= 1) return 1;     // base!\n  return n * fact(n - 1);\n}\n\n// binary search — recursion\nfunction bs(a, x, l = 0, r = a.length - 1) {\n  if (l > r) return -1;\n  const m = (l + r) >> 1;\n  if (a[m] === x) return m;\n  return x < a[m] ? bs(a, x, l, m - 1) : bs(a, x, m + 1, r);\n}', lang: "js" }
    },
    {
      id: "sorting", title: "Sorting Algorithms",
      html: `
<p class="lead">Array sort karna — manual implementations interviews mein must.</p>
<h2>Algorithms</h2>
<ul>
  <li><b>Bubble/Selection</b> — O(n²), simple (interview starter)</li>
  <li><b>Merge sort</b> — O(n log n) stable, divide-conquer</li>
  <li><b>Quick sort</b> — average O(n log n), in-place-ish</li>
</ul>`,
      seed: { code: '// merge sort\nfunction mergeSort(a) {\n  if (a.length <= 1) return a;\n  const mid = a.length >> 1;\n  return merge(mergeSort(a.slice(0, mid)), mergeSort(a.slice(mid)));\n}\nfunction merge(L, R) {\n  const out = []; let i = 0, j = 0;\n  while (i < L.length && j < R.length)\n    out.push(L[i] < R[j] ? L[i++] : R[j++]);\n  return out.concat(L.slice(i), R.slice(j));\n}', lang: "js" }
    },
    {
      id: "wrapup", title: "DSA Summary & Practice Plan",
      html: `
<p class="lead">Chapter end — ab systematic problem solving start!</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Big-O, arrays (two pointers, sliding window)</li>
  <li>Linked lists, stacks, queues</li>
  <li>Hashing, recursion/BST, sorting</li>
</ul>
<h2>Practice path</h2>
<p>LeetCode easy → medium, 20 problems per pattern. GodxShadow ke C/Python/JS courses ka code try karo interview style mein!</p>`,
      seed: { code: 'console.log("DSA complete ✔ 🧠 — ab daily 1 problem!");', lang: "js" }
    }
  ]
};
