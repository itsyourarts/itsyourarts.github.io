/* GodxShadow course: ASP.NET — start se end tak */
COURSES.aspnet = {
  name: "ASP.NET", color: "#a06bff", icon: ".N", blurb: "C# se web banayein — APIs, MVC, enterprise-grade .NET power.",
  lessons: [
    {
      id: "intro", title: "ASP.NET Introduction",
      html: `
<p class="lead"><b>ASP.NET Core</b> — Microsoft ka cross-platform web framework. C# ki speed + enterprise ecosystem. APIs, MVC sites, real-time, gRPC — sab.</p>
<h2>Setup</h2>
<ul>
  <li><code class="inline">dotnet new webapi -n MyApi</code> → <code class="inline">dotnet run</code></li>
  <li>Swagger UI free — <code class="inline">/swagger</code> par API test karo!</li>
</ul>
<h2>Templates</h2>
<p>webapi (REST) · mvc (server-rendered) · razor (pages) · blazor (C# in browser!)</p>`,
      seed: { code: '// Program.cs — minimal API (3 lines!)\nvar builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\n\napp.MapGet("/", () => "Hello ASP.NET!");\napp.MapGet("/ping", () => new { ok = true, time = DateTime.Now });\n\napp.Run();', lang: "csharp" }
    },
    {
      id: "cont_controllers", title: "Controllers & Routing",
      html: `
<p class="lead"><b>Controllers</b> — HTTP requests handle karne wali classes. Attributes se routes define.</p>
<h2>Patterns</h2>
<ul>
  <li><code class="inline">[ApiController] [Route("api/[controller]")]</code></li>
  <li><code class="inline">[HttpGet("{id}")]</code>, <code class="inline">[HttpPost]</code></li>
  <li><code class="inline">ActionResult&lt;T&gt;</code> returns — <code class="inline">Ok(data)</code>, <code class="inline">NotFound()</code>, <code class="inline">CreatedAtAction()</code></li>
  <li>Query: <code class="inline">[FromQuery]</code>, body: <code class="inline">[FromBody]</code></li>
</ul>`,
      seed: { code: '[ApiController]\n[Route("api/[controller]")]\npublic class UsersController : ControllerBase {\n    static List<string> users = new() { "Asha", "Ravi" };\n\n    [HttpGet]\n    public ActionResult<List<string>> GetAll() => Ok(users);\n\n    [HttpGet("{id}")]\n    public ActionResult<string> Get(int id)\n        => id < users.Count ? Ok(users[id]) : NotFound();\n\n    [HttpPost]\n    public IActionResult Add([FromBody] string name) {\n        users.Add(name);\n        return CreatedAtAction(nameof(Get), new { id = users.Count - 1 });\n    }\n}', lang: "csharp" }
    },
    {
      id: "ef", title: "Entity Framework Core",
      html: `
<p class="lead">Database ke liye SQL mat likho — <b>EF Core</b> C# classes se tables bana deta hai.</p>
<h2>Flow</h2>
<ul>
  <li>Model class + DbContext</li>
  <li><code class="inline">dotnet ef migrations add</code> → <code class="inline">database update</code></li>
  <li>LINQ queries: <code class="inline">db.Users.Where(u =&gt; u.Age &gt; 18)</code></li>
</ul>`,
      seed: { code: 'public class AppDb : DbContext {\n    public AppDb(DbContextOptions<AppDb> o) : base(o) {}\n    public DbSet<User> Users => Set<User>();\n}\n\npublic class User {\n    public int Id { get; set; }\n    public required string Name { get; set; }\n}\n\n// use\nvar elders = await db.Users\n    .Where(u => u.Age > 18)\n    .OrderBy(u => u.Name)\n    .ToListAsync();', lang: "csharp" }
    },
    {
      id: "mvc", title: "MVC & Razor Pages",
      html: `
<p class="lead">Server-rendered websites — Model-View-Controller pattern.</p>
<h2>Flow</h2>
<ul>
  <li>URL <code class="inline">/Home/Index</code> → Controller → View (Razor .cshtml)</li>
  <li><code class="inline">@model User</code> — strongly-typed views</li>
  <li>Layout <code class="inline">@RenderBody()</code> — Django templates jaisa</li>
</ul>`,
      seed: { code: 'public class ProfileController : Controller {\n    public IActionResult Show(string name) {\n        var user = new User { Name = name };\n        return View(user);   // Views/Profile/Show.cshtml\n    }\n}\n\n// Show.cshtml\n@model User\n<h1>@Model.Name ka profile</h1>', lang: "csharp" }
    },
    {
      id: "middleware", title: "Middleware & DI",
      html: `
<p class="lead">Request pipeline — har request middleware ke through jaati hai. Services <b>dependency injection</b> ke saath.</p>
<h2>Pipeline</h2>
<ul>
  <li><code class="inline">app.UseRouting() → UseAuthorization() → endpoints</code></li>
  <li>Custom: <code class="inline">app.Use(async (ctx, next) =&gt; { ... await next(); })</code></li>
</ul>
<h2>DI lifetimes</h2>
<p><code class="inline">AddSingleton / AddScoped (per-request) / AddTransient</code></p>`,
      seed: { code: 'builder.Services.AddScoped<IUserService, UserService>();\n\nvar app = builder.Build();\n\n// logger middleware\napp.Use(async (ctx, next) => {\n    Console.WriteLine(ctx.Request.Path);\n    await next();\n});\n\napp.MapControllers();\napp.Run();', lang: "csharp" }
    },
    {
      id: "auth", title: "Auth & JWT",
      html: `
<p class="lead">Secure APIs — login, tokens, role-based access.</p>
<h2>Identity</h2>
<p><code class="inline">AddIdentity</code> — full user management out-of-box.</p>
<h2>JWT pattern</h2>
<ul>
  <li>Login → token issue → client header <code class="inline">Authorization: Bearer t...</code></li>
  <li><code class="inline">[Authorize]</code> protected routes</li>
  <li><code class="inline">[Authorize(Roles = "Admin")]</code></li>
</ul>`,
      seed: { code: 'builder.Services\n    .AddAuthentication("Bearer")\n    .AddJwtBearer();\n\n[Authorize]\n[ApiController]\n[Route("api/profile")]\npublic class ProfileController : ControllerBase {\n    [HttpGet]\n    public IActionResult Me()\n        => Ok(new { user = User.Identity!.Name });\n}', lang: "csharp" }
    },
    {
      id: "di", title: "Dependency Injection (built-in!)",
      html: `
<p class="lead">ASP.NET Core ka superpower — DI container framework ke andar.</p>
<h2>Lifetimes</h2>
<ul>
  <li><code class="inline">AddTransient</code> — har inject naya</li>
  <li><code class="inline">AddScoped</code> — request ke andar ek (DB context = scoped!)</li>
  <li><code class="inline">AddSingleton</code> — app lifetime ek hi</li>
  <li>Constructor mein maango — framework de dega</li>
</ul>`,
      seed: { code: 'public interface IGreeter { string Say(string name); }\npublic class Greeter : IGreeter\n{\n    public string Say(string name) => $"Hello, {name}!";\n}\n\n// Program.cs\nbuilder.Services.AddScoped<IGreeter, Greeter>();\n\n// Controller mein inject\npublic class HelloController : ControllerBase\n{\n    private readonly IGreeter _greeter;\n    public HelloController(IGreeter greeter) => _greeter = greeter;\n\n    [HttpGet("/hi/{name}")]\n    public string Hi(string name) => _greeter.Say(name);\n}', lang: "csharp" }
    },
    {
      id: "validation", title: "Model Validation (DataAnnotations)",
      html: `
<p class="lead">Input kabhi trust mat karo — attributes se validate karo.</p>
<h2>Attributes</h2>
<ul>
  <li><code class="inline">[Required]</code> · <code class="inline">[StringLength(50)]</code></li>
  <li><code class="inline">[Range(1,120)]</code> · <code class="inline">[EmailAddress]</code> · <code class="inline">[RegularExpression]</code></li>
  <li>Controller mein: <code class="inline">ModelState.IsValid</code></li>
  <li><code class="inline">[ApiController]</code> → auto 400 on invalid</li>
</ul>`,
      seed: { code: 'using System.ComponentModel.DataAnnotations;\n\npublic class RegisterDto\n{\n    [Required, StringLength(30, MinimumLength = 3)]\n    public string Username { get; set; }\n\n    [Required, EmailAddress]\n    public string Email { get; set; }\n\n    [Range(13, 100, ErrorMessage = "Umar 13+ honi chahiye")]\n    public int Age { get; set; }\n}\n\n// [ApiController] wale controller mein invalid input\n// automatic 400 + errors JSON return ho jaata hai!', lang: "csharp" }
    },
    {
      id: "config", title: "Configuration (appsettings & Options)",
      html: `
<p class="lead">Secrets aur settings ko code se bahar — appsettings.json + env vars.</p>
<h2>Sources (priority order)</h2>
<ul>
  <li><code class="inline">appsettings.json</code> → <code class="inline">appsettings.Development.json</code></li>
  <li>Environment variables → User Secrets (dev) → CLI args (last wins)</li>
  <li>Read: <code class="inline">builder.Configuration["App:Name"]</code></li>
  <li>Strongly-typed: <code class="inline">Options pattern</code></li>
</ul>`,
      seed: { code: '// appsettings.json\n{\n  "App": { "Name": "GodxShadow", "MaxUsers": 100 },\n  "ConnectionStrings": { "Default": "Server=.;Database=app" }\n}\n\n// Program.cs — strongly typed options\nvar cfg = builder.Configuration;\nbuilder.Services.Configure<AppOptions>(cfg.GetSection("App"));\n\nvar name = cfg["App:Name"];                 // GodxShadow\nvar max = cfg.GetValue<int>("App:MaxUsers"); // 100\n\n// Controller mein IOptions<AppOptions> inject karo', lang: "csharp" }
    },
    {
      id: "deploy", title: "Publish & Deploy (dotnet publish)",
      html: `
<p class="lead">Build se production tak — publish pipeline samjho.</p>
<h2>Steps</h2>
<ul>
  <li><code class="inline">dotnet publish -c Release -o out</code></li>
  <li>Self-contained vs framework-dependent (-r win-x64)</li>
  <li>Docker image: SDK → build, aspnet runtime → final</li>
  <li>Prod env: <code class="inline">ASPNETCORE_ENVIRONMENT=Production</code></li>
  <li>Kestrel ke aage reverse proxy (Nginx/IIS) lagao</li>
</ul>`,
      seed: { code: '# 1. release build\ndotnet publish -c Release -o out\n\n# 2. run\ncd out && dotnet MyApp.dll\n\n# Dockerfile (multi-stage)\nFROM mcr.microsoft.com/dotnet/sdk:8.0 AS build\nWORKDIR /src\nCOPY . .\nRUN dotnet publish -c Release -o /app\n\nFROM mcr.microsoft.com/dotnet/aspnet:8.0\nWORKDIR /app\nCOPY --from=build /app .\nENV ASPNETCORE_URLS=http://+:8080\nENTRYPOINT ["dotnet", "MyApp.dll"]', lang: "csharp" }
    },
    {
      id: "webapi", title: "ASP.NET Core Web API",
      html: `<p class="lead">Web APIs in ASP.NET Core: controllers returning JSON, routing, model binding and status codes.</p>
<h2>Patterns</h2>
<ul>
  <li><code class="inline">[ApiController] [Route("api/[controller]")]</code></li>
  <li><code class="inline">[HttpGet("{id}")]</code> - <code class="inline">[HttpPost]</code> - <code class="inline">[HttpPut]</code> - <code class="inline">[HttpDelete]</code></li>
  <li>Bind from route, query, body (JSON); return <code class="inline">CreatedAtAction</code>, <code class="inline">NotFound()</code></li>
  <li>Async: <code class="inline">Task&lt;IActionResult&gt;</code> + <code class="inline">await _repo.FindAsync(id)</code></li>
</ul>`,
      seed: { code: '[ApiController]\n[Route("api/[controller]")]\npublic class ProductsController : ControllerBase\n{\n    private readonly IProductRepo _repo;\n    public ProductsController(IProductRepo repo) => _repo = repo;\n\n    [HttpGet("{id}")]\n    public async Task<IActionResult> Get(int id) {\n        var p = await _repo.FindAsync(id);\n        return p == null ? NotFound() : Ok(p);\n    }\n\n    [HttpPost]\n    public async Task<IActionResult> Post([FromBody] ProductDto dto) {\n        await _repo.AddAsync(dto);\n        return CreatedAtAction(nameof(Get), new { id = dto.Id }, dto);\n    }\n}', lang: "csharp" }
    },
    {
      id: "swagger", title: "Swagger & OpenAPI Documentation",
      html: `<p class="lead">Every API should ship with self-documenting Swagger UI - add Swashbuckle and it's automatic.</p>
<h2>Setup</h2>
<ul>
  <li>NuGet: Swashbuckle.AspNetCore - <code class="inline">app.UseSwagger()</code> + <code class="inline">UseSwaggerUI()</code></li>
  <li>Endpoint at <code class="inline">/swagger</code> - try every API from the browser</li>
  <li><code class="inline">[FromQuery]</code>, <code class="inline">[Authorize]</code> + JWT bearer security definitions</li>
  <li>Version your docs per environment (Development first)</li>
</ul>`,
      seed: { code: '// Program.cs (minimal API style)\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddEndpointsApiExplorer();\nbuilder.Services.AddSwaggerGen();\nvar app = builder.Build();\napp.UseSwagger();\napp.UseSwaggerUI();\napp.MapGet("/api/health", () => Results.Ok(new { status = "up", time = DateTime.Now }));\napp.Run();\n\n// browser: /swagger  ->  Try it out  ->  GET /api/health\n// returns: { "status": "up", "time": "2026-09-22T10:00:00" }', lang: "csharp" }
    },
    {
      id: "caching", title: "Caching: Memory, Distributed, Response",
      html: `<p class="lead">Cache at the right layer: per-request memory, shared distributed (Redis), or full HTTP response caching.</p>
<h2>Layers</h2>
<ul>
  <li><code class="inline">IMemoryCache</code> - fast, per-process, absolute/sliding expiries</li>
  <li><code class="inline">IDistributedCache</code> + StackExchange.Redis - shared across instances</li>
  <li>Response caching: <code class="inline">app.UseResponseCaching()</code> + <code class="inline">[ResponseCache(VaryByHeader...)]</code></li>
  <li>Caching pattern: get-or-add, invalidate on writes</li>
</ul>`,
      seed: { code: 'products:hot', lang: "csharp" }
    },
    {
      id: "aspnet-advanced", title: "Background Services & Middleware Deep",
      html: `<p class="lead">Beyond requests: <code class="inline">IHostedService</code> for background workers, and custom middleware for cross-cutting concerns.</p>
<h2>Topics</h2>
<ul>
  <li><code class="inline">AddHostedService&lt;MyWorker&gt;()</code> - runs on startup, stops cleanly</li>
  <li><code class="inline">ExecuteAsync(CancellationToken)</code> loop - timers, queue drains</li>
  <li>Custom middleware: <code class="inline">public async Task InvokeAsync(HttpContext ctx)</code></li>
  <li>Order matters: logging -&gt; auth -&gt; your middleware -&gt; endpoints</li>
</ul>`,
      seed: { code: 'public class QueueWorker : BackgroundService\n{\n    protected override async Task ExecuteAsync(CancellationToken ct) {\n        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(5));\n        do {\n            Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] draining queue...");\n        } while (await timer.WaitForNextTickAsync(ct));\n    }\n}\n// Program.cs: builder.Services.AddHostedService<QueueWorker>();\n// custom middleware order:\n// UseLogging -> UseAuthentication -> UseMiddleware<AuditLog> -> MapControllers', lang: "csharp" }
    },
    {
      id: "wrapup", title: "ASP.NET Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — C# se production APIs ab aapki ability mein.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>Minimal APIs + controllers + routing</li>
  <li>EF Core ORM queries</li>
  <li>MVC/Razor rendering, middleware, DI</li>
  <li>JWT auth</li>
</ul>
<h2>Agla step</h2>
<p><b>Blazor</b> — C# se interactive frontend. Ya <b>SignalR</b> real-time apps!</p>`,
      seed: { code: 'Console.WriteLine("ASP.NET complete ✔");', lang: "csharp" }
    }
  ]
};
