/* GodxShadow course: Pandas — start se end tak */
COURSES.pandas = {
  name: "Pandas", color: "#8f6bff", icon: "Pd", blurb: "Data ko tables ki tarah socho — CSV se insights tak.",
  lessons: [
    {
      id: "intro", title: "Pandas Introduction",
      html: `
<p class="lead"><b>Pandas</b> — Python ka Excel+SQL ka baby. DataFrames = tables, Series = columns. Data analysis ka daily-driver.</p>
<h2>Setup</h2>
<p><code class="inline">pip install pandas</code> → <code class="inline">import pandas as pd</code></p>
<h2>2 core types</h2>
<ul>
  <li><b>Series</b> — 1D labeled column</li>
  <li><b>DataFrame</b> — 2D table (rows × columns)</li>
</ul>`,
      seed: { code: 'import pandas as pd\n\ns = pd.Series([90, 85, 76], name="marks")\nprint(s)\n\ndf = pd.DataFrame({\n    "name": ["Asha", "Ravi", "Sha"],\n    "age": [21, 22, 20],\n    "city": ["Delhi", "Pune", "Delhi"]\n})\nprint(df)', lang: "python" }
    },
    {
      id: "read-inspect", title: "Files Read & Inspect",
      html: `
<p class="lead">Data ke saath pehla step: load karo, shape/sample samjho.</p>
<h2>Read</h2>
<ul>
  <li><code class="inline">pd.read_csv("data.csv")</code> · <code class="inline">read_excel</code> · <code class="inline">read_json</code></li>
  <li>Write: <code class="inline">df.to_csv("out.csv", index=False)</code></li>
</ul>
<h2>Inspect</h2>
<p><code class="inline">df.head()</code> · <code class="inline">df.tail()</code> · <code class="inline">df.info()</code> · <code class="inline">df.describe()</code> · <code class="inline">df.shape</code></p>`,
      seed: { code: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "course": ["HTML", "CSS", "JS", "React"],\n    "lessons": [17, 29, 15, 9],\n    "free": [True, True, True, True]\n})\n\nprint(df.head(2))\nprint(df.shape)            # (4, 3)\nprint(df.describe())\nprint(df.dtypes)', lang: "python" }
    },
    {
      id: "select", title: "Select & Filter",
      html: `
<p class="lead">Columns nikaalna, rows filter karna — 90% daily kaam yahi hai.</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">df["name"]</code> · <code class="inline">df[["name", "age"]]</code></li>
  <li><code class="inline">df.loc[row, col]</code> (labels) · <code class="inline">df.iloc[0:3]</code> (positions)</li>
  <li><code class="inline">df[df.age &gt; 20]</code> — boolean filter</li>
  <li><code class="inline">df[(df.age &gt; 20) &amp; (df.city == "Delhi")]</code> — &amp;/| mandatory!</li>
  <li><code class="inline">df.query("age &gt; 20 and city == 'Delhi'")</code> — readable SQL-style</li>
</ul>`,
      seed: { code: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "name": ["Asha", "Ravi", "Sha", "Nia"],\n    "marks": [92, 61, 85, 44],\n    "city": ["Delhi", "Pune", "Delhi", "Goa"]\n})\n\ntoppers = df[df.marks >= 80]\nprint(toppers)\n\ndelhi_top = df[(df.marks >= 80) & (df.city == "Delhi")]\nprint(delhi_top[["name", "marks"]])', lang: "python" }
    },
    {
      id: "modify", title: "Columns Add/Modify & Sort",
      html: `
<p class="lead">Data ko transform karna — naye columns banana, values badalna, sort.</p>
<h2>Patterns</h2>
<ul>
  <li><code class="inline">df["total"] = df.a + df.b</code></li>
  <li><code class="inline">df["grade"] = df.marks.map(lambda m: "A" if m &gt;= 90 else "B")</code></li>
  <li><code class="inline">df.apply(fn, axis=1)</code> — row-wise function</li>
  <li><code class="inline">df.sort_values("marks", ascending=False)</code></li>
  <li>Drop: <code class="inline">df.drop(columns=[...])</code> / rows: <code class="inline">.drop(index=[...])</code></li>
</ul>`,
      seed: { code: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "name": ["Asha", "Ravi", "Sha"],\n    "marks": [92, 61, 85]\n})\n\ndf["grade"] = df.marks.map(lambda m: "A+" if m >= 90 else ("A" if m >= 75 else "B"))\ndf["pass"] = df.marks >= 40\ndf = df.sort_values("marks", ascending=False)\n\nprint(df)', lang: "python" }
    },
    {
      id: "groupby", title: "groupby & Merge",
      html: `
<p class="lead"><b>groupby</b> — SQL GROUP BY ka pandas version: split → apply → combine.</p>
<h2>groupby</h2>
<p><code class="inline">df.groupby("city").marks.mean()</code> · <code class="inline">.agg(["mean","max","count"])</code></p>
<h2>Merge (joins)</h2>
<p><code class="inline">pd.merge(df1, df2, on="id", how="left")</code> — inner/left/right/outer</p>`,
      seed: { code: 'import pandas as pd\n\nsales = pd.DataFrame({\n    "city": ["Delhi", "Pune", "Delhi", "Goa", "Pune"],\n    "amount": [500, 200, 300, 400, 150]\n})\n\nprint(sales.groupby("city").amount.sum())\n\ndf1 = pd.DataFrame({"id": [1, 2], "name": ["Asha", "Ravi"]})\ndf2 = pd.DataFrame({"id": [1, 3], "score": [90, 75]})\nprint(pd.merge(df1, df2, on="id", how="left"))', lang: "python" }
    },
    {
      id: "cleaning", title: "Data Cleaning",
      html: `
<p class="lead">Real data messy hota hai — missing values, duplicates, types galat.</p>
<h2>Missing data</h2>
<ul>
  <li><code class="inline">df.isna().sum()</code> — kitne NaN</li>
  <li><code class="inline">df.dropna()</code> · <code class="inline">df.fillna(0)</code> · <code class="inline">df.fillna(df.age.mean())</code></li>
</ul>
<h2>Other fixes</h2>
<ul>
  <li><code class="inline">df.drop_duplicates()</code></li>
  <li><code class="inline">df["age"] = df.age.astype(int)</code></li>
  <li>Strings: <code class="inline">df.city.str.strip().str.title()</code></li>
</ul>`,
      seed: { code: 'import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\n    "name": [" asha", "ravi", "sha", None],\n    "marks": [90, np.nan, 85, 70]\n})\n\nprint(df.isna().sum())\n\ndf["name"] = df.name.str.strip().str.title()\ndf["marks"] = df.marks.fillna(df.marks.mean())\nprint(df)', lang: "python" }
    },
    {
      id: "series", title: "Series Deep Dive",
      html: `
<p class="lead">DataFrame ka atom — ek column, index ke saath superpowers.</p>
<h2>Create & ops</h2>
<ul>
  <li><code class="inline">pd.Series([10, 20], index=["a","b"])</code></li>
  <li>Math aligned by <b>index</b> — missing index → NaN</li>
  <li><code class="inline">value_counts(), sort_values(), unique()</code></li>
  <li><code class="inline">s.map(), s.apply(), s.astype()</code></li>
</ul>`,
      seed: { code: 'import pandas as pd\n\ns = pd.Series([95, 88, 76, 92], index=["Ravi","Asha","Raj","Mia"])\nprint(s["Asha"])              # 88\nprint(s + 5)                  # grace marks — sab pe\n\nprint(s.value_counts())\nprint(s.sort_values(ascending=False))\n\nbonus = pd.Series([10, 5], index=["Ravi","Mia"])\nprint(s + bonus)              # alignment! baaki NaN', lang: "python" }
    },
    {
      id: "filter-sort", title: "Filtering & Sorting DataFrames",
      html: `
<p class="lead">Boolean masks — SQL WHERE ka pandas version.</p>
<h2>Patterns</h2>
<ul>
  <li><code class="inline">df[df.score &gt; 80]</code> — mask filter</li>
  <li>Multi: <code class="inline">df[(df.a &gt; 5) &amp; (df.b == "x")]</code> — &amp; | ~ use karo</li>
  <li><code class="inline">df.isin([...])</code> · <code class="inline">df.query("a &gt; 5")</code></li>
  <li><code class="inline">sort_values(["city","score"], ascending=[True,False])</code></li>
</ul>`,
      seed: { code: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "name": ["Ravi","Asha","Raj","Mia"],\n    "city": ["Delhi","Mumbai","Delhi","Jaipur"],\n    "score": [95, 88, 60, 92]\n})\n\nprint(df[df.score > 80])\nprint(df[(df.city == "Delhi") & (df.score > 70)])\n\nprint(df.sort_values("score", ascending=False))\nprint(df.query("score >= 85 and city != " + chr(39) + "Jaipur" + chr(39)))', lang: "python" }
    },
    {
      id: "merge", title: "Merge, Join & Concat",
      html: `
<p class="lead">Multiple tables combine karo — SQL JOINs ka pandas bhai.</p>
<h2>Tools</h2>
<ul>
  <li><code class="inline">pd.merge(a, b, on="id", how="inner|left|outer")</code></li>
  <li><code class="inline">df.join(other)</code> — index-on-index</li>
  <li><code class="inline">pd.concat([df1, df2])</code> — stack rows (ignore_index=True!)</li>
  <li><code class="inline">validate="1:m"</code> — duplicates pakdo</li>
</ul>`,
      seed: { code: 'import pandas as pd\n\nusers = pd.DataFrame({"uid":[1,2,3], "name":["Ravi","Asha","Raj"]})\norders = pd.DataFrame({"uid":[1,1,3], "item":["Book","Pen","Bag"]})\n\nm = pd.merge(users, orders, on="uid", how="left")\nprint(m)\n\nd1 = pd.DataFrame({"x":[1,2]})\nd2 = pd.DataFrame({"x":[3,4]})\nprint(pd.concat([d1, d2], ignore_index=True))', lang: "python" }
    },
    {
      id: "export", title: "Export & Plots (CSV, Excel, Chart)",
      html: `
<p class="lead">Analysis khatam? Ab share karo — files + quick charts.</p>
<h2>Export</h2>
<ul>
  <li><code class="inline">df.to_csv("out.csv", index=False)</code></li>
  <li><code class="inline">df.to_excel("out.xlsx")</code> · <code class="inline">df.to_json("out.json")</code></li>
  <li><code class="inline">df.plot(kind="bar")</code> — matplotlib backend</li>
  <li><code class="inline">df.to_markdown()</code> — reports ke liye mast</li>
</ul>`,
      seed: { code: 'import pandas as pd\n\ndf = pd.DataFrame({"city":["Delhi","Mumbai","Jaipur"],\n                   "avg":[86.4, 82.1, 79.5]})\n\ndf.to_csv("summary.csv", index=False)\n# df.to_excel("summary.xlsx", sheet_name="Report")\nprint(df.to_markdown(index=False))   # README-ready table!\n\n# df.plot(kind="bar", x="city", y="avg").get_figure().savefig("chart.png")\nprint("exported!")', lang: "python" }
    },
    {
      id: "plotting", title: "Plotting DataFrames",
      html: `<p class="lead">pandas plots directly (via matplotlib) - quick charts from a DataFrame in one line.</p>
<h2>Recipes</h2>
<ul>
  <li><code class="inline">df.plot(kind="line"|"bar"|"hist"|"scatter")</code></li>
  <li><code class="inline">df.plot.scatter("x", "y", c="z")</code></li>
  <li>Grouped bars: <code class="inline">df.groupby("cat")["val"].plot.bar()</code></li>
  <li>Style: titles, labels, figsize, ylim</li>
</ul>`,
      seed: { code: 'import pandas as pd, numpy as np\ndf = pd.DataFrame({\n    "month": ["Jan", "Feb", "Mar", "Apr"],\n    "sales": [120, 180, 150, 210],\n    "cost": [80, 90, 110, 100],\n})\ndf["profit"] = df.sales - df.cost\nprint(df.to_string(index=False))\nprint("\\ndf.plot(kind="bar") - months on x, sales/cost/profit bars")\nprint("df.plot.scatter("cost", "sales") - each point a month")\nprint("grouped: df.groupby("month")["profit"].plot.bar()")', lang: "python" }
    },
    {
      id: "time-series", title: "Time Series: index, resample, shift",
      html: `<p class="lead">DatetimeIndex unlocks the time machine: slicing by date, resampling, rolling windows.</p>
<h2>Tools</h2>
<ul>
  <li><code class="inline">pd.date_range("2026-01-01", periods=30, freq="D")</code></li>
  <li><code class="inline">df.resample("M").sum()</code> - daily -&gt; monthly</li>
  <li><code class="inline">df.rolling(7).mean()</code> - moving average</li>
  <li><code class="inline">df.shift(1)</code> - lag column (yesterday's value)</li>
</ul>`,
      seed: { code: 'import pandas as pd, numpy as np\nidx = pd.date_range("2026-01-01", periods=14, freq="D")\ns = pd.Series(np.random.default_rng(7).integers(10, 50), index=idx)\nprint(s.to_string())\nprint("\\nweekly sums:"); print(s.resample("W").sum().to_string())\nprint("\\n7-day rolling mean (last 3):"); print(s.rolling(7).mean().tail(3).round(1).to_string())\nprint("\\nlag 1 (yesterday):"); print(s.shift(1).tail(2).to_string())', lang: "python" }
    },
    {
      id: "apply-lambda", title: "apply, map & lambda transformations",
      html: `<p class="lead">apply pushes a function over rows, columns, or elements - the flexible middle ground between vectorization and loops.</p>
<h2>Forms</h2>
<ul>
  <li><code class="inline">s.map(fn)</code> - element-wise on Series</li>
  <li><code class="inline">df.apply(fn, axis=1)</code> - per row (returns Series/DataFrame)</li>
  <li><code class="inline">df.applymap / df.map</code> - every cell</li>
  <li>Prefer vectorized ops when possible - apply is slower</li>
</ul>`,
      seed: { code: 'import pandas as pd\ndf = pd.DataFrame({\n    "first": ["Asha", "Raj"],\n    "last": ["Verma", "Iyer"],\n    "score": [88, 95],\n})\ndf["full"] = df.apply(lambda r: r.first + " " + r.last, axis=1)\ndf["grade"] = df.score.map(lambda s: "A" if s >= 90 else "B")\nprint(df.to_string(index=False))\ndf["upper"] = df.first.map(str.upper)\nprint("\\nmap(str.upper):", list(df.upper))', lang: "python" }
    },
    {
      id: "pandas-advanced", title: "GroupBy Aggregation Patterns",
      html: `<p class="lead">groupby + aggregate is pandas' killer feature - SQL-style summaries on any DataFrame.</p>
<h2>Patterns</h2>
<ul>
  <li><code class="inline">df.groupby("cat")[col].agg(["sum", "mean", "count"])</code></li>
  <li>Named aggregations: <code class="inline">.agg(total="x", "sum")</code></li>
  <li>Transform: per-group value back to original shape</li>
  <li>Multilevel grouping + <code class="inline">reset_index()</code></li>
</ul>`,
      seed: { code: 'import pandas as pd\ndf = pd.DataFrame({\n    "store": ["A", "A", "B", "B", "A"],\n    "item": ["pen", "book", "pen", "book", "book"],\n    "sales": [12, 30, 8, 45, 22],\n})\ng = df.groupby(["store", "item"]).sales.agg(total="sum", n="count", avg="mean")\nprint(g.to_string())\nprint("\\nstore totals:"); print(df.groupby("store").sales.sum().to_string())\ndf["store_avg"] = df.groupby("store").sales.transform("mean")\nprint("\\nwith per-store mean:"); print(df[["store", "sales", "store_avg"]].round(2).to_string(index=False))', lang: "python" }
    },
    {
      id: "wrapup", title: "Pandas Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — ab raw data se insights nikalna aata hai.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Series/DataFrame, read/inspect files</li>
  <li>Select, filter, query, sort</li>
  <li>Groupby, merge/joins</li>
  <li>Cleaning (NaN, duplicates, types)</li>
</ul>
<h2>Agla step</h2>
<p><b>Matplotlib/seaborn</b> — data ko visualize karo. Ya <b>scikit-learn</b> se ML models!</p>`,
      seed: { code: 'import pandas as pd\nprint("Pandas complete ✔", pd.__version__)', lang: "python" }
    }
  ]
};
