/* GodxShadow course: XML — start se end tak */
COURSES.xml = {
  name: "XML", color: "#ffcf5c", icon: "&lt;&gt;", blurb: "Classic data format — config files, SOAP APIs, RSS sab isi mein.",
  lessons: [
    {
      id: "intro", title: "XML Introduction",
      html: `
<p class="lead"><b>XML = eXtensible Markup Language.</b> JSON se purana, par aaj bhi everywhere — config files (.csproj, Android layouts), SVG, RSS feeds, SOAP, sitemap.xml.</p>
<h2>Pehla document</h2>
<h2>XML vs JSON</h2>
<ul>
  <li>XML verbose, JSON lean — but XML mein <b>attributes</b> aur <b>comments</b> hote hain</li>
  <li>XML ko schema (XSD/DTD) se strictly validate karna possible</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffcf5c;line-height:1.7}',
              js: 'const code = `&lt;?xml version="1.0" encoding="UTF-8"?&gt;\n&lt;course id="html"&gt;\n  &lt;title&gt;HTML&lt;/title&gt;\n  &lt;lessons&gt;17&lt;/lessons&gt;\n  &lt;free&gt;true&lt;/free&gt;\n&lt;/course&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "syntax", title: "Syntax Rules",
      html: `
<p class="lead">XML rules HTML se strict hain — ek bhi rule toota to parser error.</p>
<h2>Golden rules</h2>
<ul>
  <li>Har start tag ka end tag maangti hai (ya self-close <code class="inline">&lt;br/&gt;</code>)</li>
  <li>Sirf <b>ek</b> root element</li>
  <li>Case-sensitive: <code class="inline">&lt;Course&gt;</code> ≠ <code class="inline">&lt;course&gt;</code></li>
  <li>Attributes quotes mein must: <code class="inline">id="5"</code></li>
  <li>Comments: <code class="inline">&lt;!-- yahan --&gt;</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#38f2a5;line-height:1.7}',
              js: 'const code = `&lt;!-- galat ❌ --&gt;\n&lt;user&gt;&lt;name&gt;Sha&lt;/user&gt;             &lt;!-- unclosed name --&gt;\n&lt;user id=5&gt;&lt;name&gt;Sha&lt;/name&gt;&lt;/user&gt;   &lt;!-- quote missing --&gt;\n\n&lt;!-- sahi ✅ --&gt;\n&lt;user id="5" role="admin"&gt;\n  &lt;name&gt;Sha&lt;/name&gt;\n  &lt;score value="99" /&gt;\n&lt;/user&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "namespaces", title: "Elements vs Attributes & Namespaces",
      html: `
<p class="lead">Data element mein ya attribute mein — design decisions, aur namespaces se name-collision bachana.</p>
<h2>Guideline</h2>
<ul>
  <li><b>Attributes</b> — metadata (id, class, lang)</li>
  <li><b>Elements</b> — actual data</li>
</ul>
<h2>Namespaces</h2>
<p><code class="inline">xmlns:h="..."</code> → <code class="inline">&lt;h:table&gt;</code> — do vocabularies mix karne par bhi unique.</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}',
              js: 'const code = `&lt;catalog xmlns:book="https://ex.com/books"\n         xmlns:movie="https://ex.com/movies"&gt;\n  &lt;book:table&gt;\n    &lt;book:title&gt;Neon Guide&lt;/book:title&gt;\n  &lt;/book:table&gt;\n  &lt;movie:table&gt;\n    &lt;movie:title&gt;Shadow Origins&lt;/movie:title&gt;\n  &lt;/movie:table&gt;\n&lt;/catalog&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "schemas", title: "DTD & XSD Validation",
      html: `
<p class="lead">XML ka killre feature — document ka structure formally define karo, auto-validate.</p>
<h2>DTD (basic)</h2>
<p>Elements/attributes ka declaration document ke andar.</p>
<h2>XSD (powerful)</h2>
<p>Types, min/max, enums, patterns — alag <code class="inline">.xsd</code> file.</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ff3ea5;line-height:1.7}',
              js: 'const code = `&lt;!-- xs:schema (course.xsd) --&gt;\n&lt;xs:element name="course"&gt;\n  &lt;xs:complexType&gt;\n    &lt;xs:sequence&gt;\n      &lt;xs:element name="title" type="xs:string"/&gt;\n      &lt;xs:element name="lessons" type="xs:integer"/&gt;\n    &lt;/xs:sequence&gt;\n    &lt;xs:attribute name="id" type="xs:string" use="required"/&gt;\n  &lt;/xs:complexType&gt;\n&lt;/xs:element&gt;`;\ndocument.getElementById("out").innerHTML = code;' }
    },
    {
      id: "parse", title: "XML Parse Karna (JS)",
      html: `
<p class="lead">Browser mein XML parse karke DOM jaisa access karo.</p>
<h2>DOMParser API (JavaScript)</h2>
<ul>
  <li><code class="inline">new DOMParser().parseFromString(text, "text/xml")</code></li>
  <li><code class="inline">getElementsByTagName("title")</code>, <code class="inline">getAttribute("id")</code></li>
  <li>RSS feeds/front-end config read karne mein kaam aata hai</li>
</ul>`,
      seed: { html: '<ul id="list"></ul>',
              css: 'body{background:#0b0f1e;color:#e7ecff;font-family:sans-serif;padding:20px}li{color:#38f2a5;margin:6px 0}',
              js: 'const xml = `<catalog>\n  <course id="html"><title>HTML</title><lessons>17</lessons></course>\n  <course id="css"><title>CSS</title><lessons>29</lessons></course>\n  <course id="js"><title>JavaScript</title><lessons>15</lessons></course>\n</catalog>`;\n\nconst doc = new DOMParser().parseFromString(xml, "text/xml");\nconst list = document.getElementById("list");\n[...doc.querySelectorAll("course")].forEach(c => {\n  const li = document.createElement("li");\n  li.textContent = c.querySelector("title").textContent + " — " + c.querySelector("lessons").textContent + " lessons";\n  list.appendChild(li);\n});\nconsole.log("Parsed", doc.querySelectorAll("course").length, "courses");' }
    },
    {
      id: "xpath", title: "XPath Queries",
      html: `
<p class="lead">XML mein find karna ho → XPath. SQL for XML!</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">/bookstore/book</code> — direct children</li>
  <li><code class="inline">//title</code> — kahin bhi ho</li>
  <li><code class="inline">//book[@lang="hi"]</code> — attribute filter</li>
  <li><code class="inline">//book[price&gt;500]/title</code> — condition filter</li>
  <li><code class="inline">//book[position()&lt;3]</code> — first 2</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#bfe36b;line-height:1.7}',
              js: 'const code = `const xml = \\`<bookstore>\n  <book lang="hi"><title>XML Seekho</title><price>450</price></book>\n  <book lang="en"><title>Deep XML</title><price>650</price></book>\n</bookstore>\\`;\n\n// Browser XPath\nconst doc = new DOMParser().parseFromString(xml, "text/xml");\nconst nodes = doc.evaluate("//book[price>500]/title", doc, null, XPathResult.ANY_TYPE, null);\nlet n = nodes.iterateNext();\nwhile (n) { console.log(n.textContent); n = nodes.iterateNext(); }\n// → Deep XML`;\ndocument.getElementById("out").textContent = code;' }
    },
    {
      id: "xslt", title: "XSLT (XML → HTML transform)",
      html: `
<p class="lead">XML ko presentable HTML mein badlo — ek alag hi language.</p>
<h2>Core tags</h2>
<ul>
  <li><code class="inline">&lt;xsl:template match="/"&gt;</code></li>
  <li><code class="inline">&lt;xsl:value-of select="book/title"/&gt;</code></li>
  <li><code class="inline">&lt;xsl:for-each select="//book"&gt;</code></li>
  <li><code class="inline">&lt;xsl:if test="price &gt; 500"&gt;</code></li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#bfe36b;line-height:1.7}',
              js: 'const code = `<?xml version="1.0"?>\n<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\n  <xsl:template match="/">\n    <html><body>\n      <h2>Books Gallery</h2>\n      <xsl:for-each select="bookstore/book">\n        <xsl:if test="price &gt; 500">\n          <li><xsl:value-of select="title"/> — premium!</li>\n        </xsl:if>\n      </xsl:for-each>\n    </body></html>\n  </xsl:template>\n</xsl:stylesheet>`;\ndocument.getElementById("out").textContent = code;' }
    },
    {
      id: "best-practices", title: "Elements vs Attributes (Best Practices)",
      html: `
<p class="lead">Kab attribute, kab element? Design ka classic sawaal.</p>
<h2>Guidelines</h2>
<ul>
  <li><b>Attributes</b> — metadata/id: <code class="inline">&lt;book id="7"&gt;</code></li>
  <li><b>Elements</b> — asli data, specially multiple/nested values</li>
  <li>Attribute mein: no multiple values, no nesting, ordering lost</li>
  <li>Namespaces mix karne se bachna jab tak zaroori na ho</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#bfe36b;line-height:1.7}',
              js: 'const code = `<!-- BAD: attributes mein data -->\n<book title="XML Seekho" author1="Raj" author2="Mia" year="2026"/>\n\n<!-- GOOD: elements mein data -->\n<book id="7" lang="hi">\n  <title>XML Seekho</title>\n  <authors>\n    <author>Raj</author>\n    <author>Mia</author>\n  </authors>\n  <year>2026</year>\n</book>\n\n<!-- rules:\n  id/lang = metadata → attribute OK\n  authors list → elements ONLY\n-->`;\ndocument.getElementById("out").textContent = code;' }
    },
    {
      id: "entities", title: "Entities & DTD",
      html: `<p class="lead">Entities let XML define reusable snippets; DTDs (the older validation system) define allowed structure.</p>
<h2>Entities</h2>
<ul>
  <li>Built-in: <code class="inline">&amp;lt; &amp;gt; &amp;quot; &amp;amp; &amp;apos;</code></li>
  <li>General: <code class="inline">&amp;entity;</code> - character or text substitution</li>
  <li>Parameter: <code class="inline">%param;</code> - used during parsing (DTD includes)</li>
</ul>
<h2>DTD</h2>
<ul>
  <li><code class="inline">&lt;!ELEMENT note (to, body)&gt;</code> - child order</li>
  <li><code class="inline">&lt;!ATTLIST note id ID #REQUIRED&gt;</code></li>
  <li>Largely superseded by XML Schema / XSD</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'<?xml version="1.0"?>\',\'<!DOCTYPE note [\',\'  <!ELEMENT note (to, body)>\',\'  <!ELEMENT to (#PCDATA)>\',\'  <!ELEMENT body (#PCDATA)>\',\'  <!ATTLIST note id ID #REQUIRED>\',\'  <!ENTITY company "GodXShadow">\',\']>\',\'<note id="n1">\',\'  <to>Ravi</to>\',\'  <body>Weekly report for &company;</body>\',\'</note>\',\'\',\'<!-- entity resolves during parse: -->\',\'<!-- body text becomes: Weekly report for GodXShadow -->\'].join("\\n");' }
    },
    {
      id: "wsdl", title: "WSDL & SOAP - The Web Service Contract",
      html: `<p class="lead">Before REST, SOAP ruled: WSDL documents the contract, SOAP wraps calls in XML envelopes.</p>
<h2>WSDL parts</h2>
<ul>
  <li><b>types</b> - XSD data definitions</li>
  <li><b>message</b> - named parameter bundles</li>
  <li><b>portType</b> - operations (input/output)</li>
  <li><b>binding</b> + <b>service</b> - how and where to call</li>
</ul>
<h2>SOAP envelope</h2>
<ul>
  <li><code class="inline">&lt;Envelope&gt;</code> with <code class="inline">Header</code> (auth) + <code class="inline">Body</code> (payload)</li>
  <li>Still alive in banking, telecom, government systems</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'<?xml version="1.0"?>\',\'<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"\',\'           xmlns:tns="http://example.com/calc"\',\'           xmlns:xsd="http://www.w3.org/2001/XMLSchema">\',\'  <types><xsd:schema>\',\'    <xsd:element name="Add">\',\'      <xsd:complexType><xsd:sequence>\',\'        <xsd:element name="a" type="xsd:int"/>\',\'        <xsd:element name="b" type="xsd:int"/>\',\'      </xsd:sequence></xsd:complexType>\',\'    </xsd:element>\',\'  </xsd:schema></types>\',\'  <message name="AddIn"><part name="p" element="tns:Add"/></message>\',\'  <portType name="Calc">\',\'    <operation name="Add"><input message="tns:AddIn"/></operation>\',\'  </portType>\',\'</definitions>\'].join("\\n");' }
    },
    {
      id: "xml-dom", title: "DOM vs SAX vs Streaming (StAX)",
      html: `<p class="lead">Three parsing strategies with different memory/speed tradeoffs - pick by document size and needs.</p>
<h2>Compare</h2>
<ul>
  <li><b>DOM</b> - whole tree in memory; random access; easy</li>
  <li><b>SAX</b> - event stream (start/end tag); tiny memory; forward-only</li>
  <li><b>StAX</b> - pull model; cursor-based; middle ground</li>
  <li>Rule of thumb: small = DOM, huge = SAX/StAX</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'# Python: DOM (xml.etree) vs streaming (iterparse)\',\'import xml.etree.ElementTree as ET\',\'xml_doc = "<library> + two <book> elements (C: 800 pages, C++: 1400 pages)"\',\'root = ET.fromstring(xml_doc)\',\'# DOM: full tree in memory\',\'for b in root.iter("book"):\',\'    print("DOM:", b.findtext("title"), b.findtext("pages"))\',\'# StAX-style: iterparse, clear as you go\',\'import io\',\'context = ET.iterparse(io.StringIO(xml_doc), events=("end",))\',\'for _, el in context:\',\'    if el.tag == "book":\',\'        print("STREAM:", el.findtext("title"))\',\'        el.clear()\'].join("\\n");' }
    },
    {
      id: "xml-advanced", title: "Transformations, Namespaces & Performance",
      html: `<p class="lead">Production XML: XSLT transforms, namespace hygiene, and parsing performance tips.</p>
<h2>Topics</h2>
<ul>
  <li>XSLT: XML-to-XML/HTML templates (<code class="inline">&lt;xsl:template match="..."/&gt;</code>)</li>
  <li>Namespaces: <code class="inline">xmlns:ns</code> prefixes; always bind before use</li>
  <li>XML signing (XML-DSig) + encryption for documents</li>
  <li>Perf: disable DTD loading, reuse parsers, incremental parsing</li>
</ul>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffc857;line-height:1.7}', js: 'document.getElementById("out").textContent = [\'<?xml version="1.0"?>\',\'<catalog xmlns="http://shop.example" xmlns:media="http://media.example">\',\'  <item id="1">\',\'    <name>Neon Keyboard</name>\',\'    <price>2999</price>\',\'    <media:image>kb.jpg</media:image>\',\'  </item>\',\'  <item id="2">\',\'    <name>RGB Mouse</name>\',\'    <price>1499</price>\',\'    <media:image>mouse.jpg</media:image>\',\'  </item>\',\'</catalog>\',\'\',\'<!-- XSLT sketch: -->\',\'<!-- <xsl:template match="/catalog/item">\',\'      <tr><td>{name}</td><td>{price}</td></tr>\',\'    </xsl:template> -->\'].join("\\n");' }
    },
    {
      id: "wrapup", title: "XML Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — ab config files aur legacy APIs parse karna easy hai.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Syntax rules (closed tags, quotes, root element)</li>
  <li>Elements vs attributes, namespaces</li>
  <li>XSD validation</li>
  <li>DOMParser se JS mein parse</li>
</ul>
<h2>Agla step</h2>
<p><b>SVG</b> — XML ka web graphics version. Ya apna <b>RSS reader</b> banao!</p>`,
      seed: { html: '<pre id="out"></pre>', css: 'body{background:#05060d;padding:16px}pre{color:#ffcf5c;line-height:1.7}',
              js: 'const code = `&lt;status&gt;XML complete ✔&lt;/status&gt;`;\ndocument.getElementById("out").innerHTML = code;\nconsole.log("XML course complete ✔");' }
    }
  ]
};
