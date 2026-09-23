/* GodxShadow course: NumPy — start se end tak */
COURSES.numpy = {
  name: "NumPy", color: "#4d8fd1", icon: "NP", blurb: "Python mein superfast arrays — data science ka foundation.",
  lessons: [
    {
      id: "intro", title: "NumPy Introduction",
      html: `
<p class="lead"><b>NumPy (Numerical Python)</b> — array computing ka king. Python lists se 50x fast, C-level performance. Pandas, scikit-learn, Matplotlib sab isi par bane hain.</p>
<h2>Install</h2>
<p><code class="inline">pip install numpy</code> → <code class="inline">import numpy as np</code> (universal convention)</p>
<h2>ndarray vs list</h2>
<ul>
  <li>Fixed type, contiguous memory — isliye fast</li>
  <li>Math ek saath sab elements par (vectorized) — loops nahi chahiye</li>
</ul>`,
      seed: { code: 'import numpy as np\n\narr = np.array([1, 2, 3, 4, 5])\nprint(arr)          # [1 2 3 4 5]\nprint(type(arr))    # numpy.ndarray\n\n# vectorized: ek saath sab par\nprint(arr * 2)      # [ 2  4  6  8 10]\nprint(arr + 100)    # [101 102 103 104 105]', lang: "python" }
    },
    {
      id: "create", title: "Arrays Banana",
      html: `
<p class="lead"><b>ndarray</b> banane ke kai tareeke — data ke saath ya structure ke saath.</p>
<h2>Creation functions</h2>
<ul>
  <li><code class="inline">np.zeros(5)</code> · <code class="inline">np.ones((3,3))</code></li>
  <li><code class="inline">np.arange(0, 10, 2)</code> — range · <code class="inline">np.linspace(0, 1, 5)</code> — equal gaps</li>
  <li><code class="inline">np.eye(3)</code> — identity matrix</li>
</ul>
<h2>Properties</h2>
<p><code class="inline">.shape .ndim .size .dtype</code> — shape (rows, cols) samajhna must!</p>`,
      seed: { code: 'import numpy as np\n\nm = np.zeros((2, 3))\nprint(m)\n\nr = np.arange(0, 20, 3)\nprint(r)                    # [ 0  3  6  9 12 15 18]\n\nc = np.array([[1, 2, 3], [4, 5, 6]])\nprint(c.shape, c.ndim, c.size, c.dtype)  # (2, 3) 2 6 int64', lang: "python" }
    },
    {
      id: "indexing", title: "Indexing & Slicing",
      html: `
<p class="lead">Arrays ke elements/sections nikaalna — Python slicing ka multi-dimensional version.</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">a[1]</code> · <code class="inline">a[-1]</code> · <code class="inline">a[1:4]</code></li>
  <li>2D: <code class="inline">a[1, 2]</code> (row 1, col 2) · <code class="inline">a[:, 0]</code> (pehla column)</li>
  <li>Boolean: <code class="inline">a[a &gt; 2]</code> — sirf 2 se bade elements!</li>
  <li><code class="inline">np.where(a &gt; 5, "bada", "chhota")</code></li>
</ul>`,
      seed: { code: 'import numpy as np\n\na = np.array([10, 20, 30, 40, 50])\nprint(a[0], a[-1], a[1:4])\n\nm = np.array([[1, 2, 3], [4, 5, 6]])\nprint(m[0, 1])        # 2\nprint(m[:, 0])        # [1 4]  — pehla column\nprint(a[a > 25])      # [30 40 50]', lang: "python" }
    },
    {
      id: "math", title: "Math & Broadcasting",
      html: `
<p class="lead"><b>Broadcasting</b> — alag shapes ke arrays ko ek saath operate karne ki NumPy power.</p>
<h2>Ops</h2>
<ul>
  <li><code class="inline">a + b, a * b, a ** 2, np.sqrt(a)</code> — element-wise</li>
  <li><code class="inline">np.dot(a, b)</code> — matrix multiplication</li>
  <li>Broadcast: <code class="inline">[[1,2,3]] + 10</code> → sab elements par</li>
  <li>Comparison: <code class="inline">a == b</code> → boolean array</li>
</ul>`,
      seed: { code: 'import numpy as np\n\na = np.array([1, 2, 3])\nb = np.array([10, 20, 30])\n\nprint(a + b)          # [11 22 33]\nprint(a * 10)         # [10 20 30]\nprint(np.sqrt([1, 4, 9]))  # [1. 2. 3.]\n\nmark = np.array([[90, 80], [70, 95]])\nprint((mark >= 75).sum())  # 3', lang: "python" }
    },
    {
      id: "reshape", title: "Reshape & Methods",
      html: `
<p class="lead">Shape badalna aur summary statistics ek line mein.</p>
<h2>Reshape</h2>
<ul>
  <li><code class="inline">a.reshape(2, 3)</code> · <code class="inline">a.flatten()</code> · <code class="inline">a.T</code> (transpose)</li>
  <li><code class="inline">np.concatenate([a, b])</code></li>
</ul>
<h2>Stats</h2>
<p><code class="inline">.sum() .mean() .max() .min() .std() .argmax()</code> — axis=0 (columns) / axis=1 (rows)</p>`,
      seed: { code: 'import numpy as np\n\na = np.arange(12).reshape(3, 4)\nprint(a)\nprint(a.T)            # transpose\n\nmarks = np.array([90, 82, 76, 95, 68])\nprint("avg:", marks.mean(), "topper:", marks.max(), "rank top index:", marks.argmax())\nprint("pass rate:", (marks >= 40).mean() * 100, "%")', lang: "python" }
    },
    {
      id: "random", title: "Random & Logging ke Kaam",
      html: `
<p class="lead"><code class="inline">np.random</code> — simulations, shuffling, test data.</p>
<h2>Functions</h2>
<ul>
  <li><code class="inline">np.random.rand(3)</code> — 0-1 floats</li>
  <li><code class="inline">np.random.randint(1, 100, 10)</code> — integers</li>
  <li><code class="inline">np.random.choice(items)</code>, <code class="inline">.shuffle(arr)</code></li>
  <li><code class="inline">np.random.seed(42)</code> — reproduce same results</li>
</ul>
<div class="tip">Data science workflow mein train/test split yahi se shuru hota hai.</div>`,
      seed: { code: 'import numpy as np\n\nnp.random.seed(42)\n\nprint(np.random.randint(1, 7, 5))     # 5 dice rolls\nstudents = np.array(["Asha", "Ravi", "Sha", "Nia"])\nprint(np.random.choice(students))     # random student\n\nscores = np.random.randint(40, 100, 10)\nprint(scores, "avg:", scores.mean().round(1))', lang: "python" }
    },
    {
      id: "dtypes", title: "dtypes & astype (casting)",
      html: `
<p class="lead">NumPy arrays single-type hote hain — dtype hi performance ka raaz hai.</p>
<h2>Key dtypes</h2>
<ul>
  <li><code class="inline">int32/int64, float32/float64, bool</code></li>
  <li><code class="inline">arr.dtype</code> check · <code class="inline">astype()</code> convert</li>
  <li>Memory: float32 vs float64 = half RAM</li>
  <li><code class="inline">arr.itemsize * arr.size</code> = total bytes</li>
</ul>`,
      seed: { code: 'import numpy as np\n\na = np.array([1, 2, 3])\nprint(a.dtype)                    # int64\n\nf = a.astype(np.float32)\nprint(f.dtype, f)                 # float32 [1. 2. 3.]\n\nbig = np.arange(10)\nprint(big.nbytes, "bytes")        # 80 (int64)\nsmall = big.astype(np.int8)\nprint(small.nbytes, "bytes")      # 10 — 8x kam RAM!', lang: "python" }
    },
    {
      id: "copy-view", title: "Copy vs View (memory ka khel)",
      html: `
<p class="lead">Slicing VIEW deta hai, copy NAHI — ye bug factory hai samajh lo!</p>
<h2>Rules</h2>
<ul>
  <li><code class="inline">b = a[1:4]</code> → <b>view</b> (same memory! b badla to a badlega)</li>
  <li><code class="inline">c = a[1:4].copy()</code> → alag memory</li>
  <li>Fancy indexing (boolean/list) → hamesha COPY</li>
  <li><code class="inline">a.base</code> — view hona to original dikhta hai</li>
</ul>`,
      seed: { code: 'import numpy as np\n\na = np.array([10, 20, 30, 40])\nv = a[1:3]          # VIEW\nv[0] = 99\nprint(a)            # [10 99 30 40] — ORIGINAL badla!!\n\nc = a[1:3].copy()   # COPY\nc[0] = 0\nprint(a)            # safe\n\nbig = a[a > 15]     # fancy → copy\nprint(big.base)     # None = alag memory', lang: "python" }
    },
    {
      id: "broadcasting", title: "Broadcasting & ufuncs",
      html: `
<p class="lead">Loops ke bina operations — NumPy ki asli speed yahin hai.</p>
<h2>Broadcasting rules</h2>
<ul>
  <li>Shapes align from right; size 1 ya missing → stretch</li>
  <li><code class="inline">arr + 100</code> — scalar har element ke saath</li>
  <li><code class="inline">(3,) + (3,1)</code> → (3,3) matrix</li>
  <li>ufuncs: <code class="inline">np.add, np.multiply, np.where</code> — vectorized!</li>
</ul>`,
      seed: { code: 'import numpy as np\n\nprices = np.array([100, 200, 300])\nprint(prices * 1.18)       # GST lagao — ek line mein\n\nrows = np.array([1, 2, 3]).reshape(3, 1)\ncols = np.array([10, 20, 30])\nprint(rows + cols)         # (3,1)+(3,) → 3x3 grid\n\n# where — vectorized if-else\nmarks = np.array([35, 80, 55])\nprint(np.where(marks >= 40, "PASS", "FAIL"))', lang: "python" }
    },
    {
      id: "stats", title: "Aggregates & Statistics",
      html: `
<p class="lead">Data science ka bread-butter — sum, mean, std, percentiles.</p>
<h2>Functions</h2>
<ul>
  <li><code class="inline">arr.sum(), arr.mean(), arr.std(), arr.var()</code></li>
  <li><code class="inline">arr.min(), arr.max(), arr.argmin(), arr.argmax()</code></li>
  <li><code class="inline">axis=0</code> columns · <code class="inline">axis=1</code> rows</li>
  <li><code class="inline">np.percentile(arr, 90)</code> · <code class="inline">np.median(arr)</code></li>
</ul>`,
      seed: { code: 'import numpy as np\n\nscores = np.array([[80, 90], [60, 70], [95, 85]])\n\nprint("total:", scores.sum())\nprint("mean:", scores.mean())\nprint("std:", scores.std().round(2))\n\nprint("per column:", scores.mean(axis=0))   # subjects avg\nprint("per row:", scores.max(axis=1))        # per student\n\nbest = np.unravel_index(scores.argmax(), scores.shape)\nprint("topper cell:", best)', lang: "python" }
    },
    {
      id: "linalg", title: "Linear Algebra (numpy.linalg)",
      html: `<p class="lead">The numpy.linalg module: matrix products, decompositions, solving linear systems - the engine behind ML math.</p>
<h2>Functions</h2>
<ul>
  <li><code class="inline">dot / matmul (@)</code> - products</li>
  <li><code class="inline">linalg.inv, linalg.solve(A, b), linalg.eig</code></li>
  <li><code class="inline">linalg.svd</code> - SVD for PCA, compression, least squares</li>
  <li><code class="inline">linalg.norm</code> - vector magnitude</li>
</ul>`,
      seed: { code: 'import numpy as np\nA = np.array([[2, 1], [1, 3]])\nb = np.array([5, 10])\nx = np.linalg.solve(A, b)\nprint("Ax=b solution:", x)\nprint("verify A@x:", A @ x)\nprint("det:", np.linalg.det(A))\nprint("inv @ b:", np.linalg.inv(A) @ b)\nv = np.array([3, 4])\nprint("norm:", np.linalg.norm(v))\nw, vt = np.linalg.eig(np.array([[0, 1], [2, 3]]))\nprint("eigenvalues:", w)', lang: "python" }
    },
    {
      id: "file-io", title: "Saving & Loading Arrays",
      html: `<p class="lead">Persist arrays with .npy (fast, binary) or .npz (zip of many arrays); text via loadtxt/savetxt.</p>
<h2>API</h2>
<ul>
  <li><code class="inline">np.save("f.npy", a)</code> / <code class="inline">np.load("f.npy")</code></li>
  <li><code class="inline">np.savez("f.npz", a=..., b=...)</code> / load with <code class="inline"]["a"]</code></li>
  <li><code class="inline">np.savetxt("f.csv", a, delimiter=",")</code> / <code class="inline">np.loadtxt</code></li>
  <li>npz stores dtype + shape; npy is one array per file</li>
</ul>`,
      seed: { code: 'import numpy as np\na = np.arange(12).reshape(3, 4)\nnp.save("demo.npy", a)\nb = np.load("demo.npy")\nprint("roundtrip ok:", np.array_equal(a, b))\nnp.savetxt("demo.csv", a, delimiter=",", fmt="%d")\nc = np.loadtxt("demo.csv", delimiter=",", ndmin=2)\nprint("text roundtrip ok:", np.array_equal(a, c))\nprint("dtype:", a.dtype, "shape:", a.shape)', lang: "python" }
    },
    {
      id: "ufuncs", title: "Universal Functions (ufuncs)",
      html: `<p class="lead">ufuncs apply element-wise operations in C speed - the core of vectorized numpy code.</p>
<h2>Power moves</h2>
<ul>
  <li><code class="inline">np.add, np.multiply, np.power, np.where</code></li>
  <li><code class="inline">np.where(cond, x, y)</code> - vectorized if/else</li>
  <li><code class="inline">np.clip, np.abs, np.sqrt</code> - element math</li>
  <li>Reduce: <code class="inline">np.sum(a, axis=0)</code> - along rows or columns</li>
</ul>`,
      seed: { code: 'import numpy as np\na = np.array([1, -2, 3, -4, 5])\nprint("abs:", np.abs(a))\nprint("where>0:", np.where(a > 0, a, 0))\nm = np.array([[1, 2, 3], [4, 5, 6]])\nprint("row sums:", m.sum(axis=1))\nprint("col sums:", m.sum(axis=0))\nprint("clip:", np.clip(a, -2, 2))\nprint("cumsum:", np.cumsum(a))', lang: "python" }
    },
    {
      id: "numpy-advanced", title: "Performance: dtype, strides, einsum",
      html: `<p class="lead">Squeeze the last drops of speed: right dtype, memory layout, and the einsum general contraction.</p>
<h2>Topics</h2>
<ul>
  <li>Float32 vs float64 - half the memory for ML batches</li>
  <li><code class="inline">arr.strides</code> - understand C vs Fortran order, slicing cost</li>
  <li><code class="inline">np.einsum("ij,jk-&gt;ik", A, B)</code> - readable contractions</li>
  <li>Avoid Python loops: broadcast + vectorize instead</li>
</ul>`,
      seed: { code: 'import numpy as np\na = np.ones((1000, 1000), dtype=np.float32)\nb = np.ones((1000, 1000), dtype=np.float64)\nprint("f32 MB:", a.nbytes / 1e6, "f64 MB:", b.nbytes / 1e6)\nA = np.arange(6).reshape(2, 3)\nB = np.arange(12).reshape(3, 4)\nprint("einsum:", np.einsum("ij,jk->ik", A, B) == A @ B)\ns = np.arange(10)[::2]\nprint("slice is view (strides):", s.strides, "shares:", s.base is not None)', lang: "python" }
    },
    {
      id: "wrapup", title: "NumPy Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — ab data computing ki speed aapke haath mein.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>ndarray creation, shape/dtype</li>
  <li>Indexing, boolean masking</li>
  <li>Vectorized math, broadcasting</li>
  <li>Reshape, stats, random</li>
</ul>
<h2>Agla step</h2>
<p><b>Pandas</b> — tables/dataframes ke liye NumPy ke upar bada bhai. Fir <b>Matplotlib</b> se plots!</p>`,
      seed: { code: 'import numpy as np\nprint("NumPy complete ✔", np.__version__)', lang: "python" }
    }
  ]
};
