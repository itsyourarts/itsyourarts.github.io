/* GodxShadow course: Django — start se end tak */
COURSES.django = {
  name: "Django", color: "#22c77b", icon: "Dj", blurb: "Python ka batteries-included web framework — Instagram, Spotify isi par.",
  lessons: [
    {
      id: "intro", title: "Django Introduction",
      html: `
<p class="lead"><b>Django</b> — Python ka high-level web framework: admin panel, ORM, auth sab built-in. "Batteries included" — abhi se production ke liye ready.</p>
<h2>Setup</h2>
<ul>
  <li><code class="inline">pip install django</code></li>
  <li><code class="inline">django-admin startproject mysite</code></li>
  <li><code class="inline">python manage.py runserver</code></li>
  <li>App: <code class="inline">python manage.py startapp blog</code></li>
</ul>
<h2>MVT pattern</h2>
<p><b>M</b>odel (data) · <b>V</b>iew (logic) · <b>T</b>emplate (HTML) — Django ka architectura.</p>`,
      seed: { code: '# pehla project\ndjango-admin startproject mysite\ncd mysite\npython manage.py startapp blog\npython manage.py runserver\n# → http://127.0.0.1:8000', lang: "python" }
    },
    {
      id: "urls-views", title: "URLs & Views",
      html: `
<p class="lead">Request → URL match → View function → Response.</p>
<h2>urls.py</h2>
<p><code class="inline">path("hello/", views.hello)</code> · params: <code class="inline">path("user/&lt;int:id&gt;/", ...)</code></p>
<h2>views.py</h2>
<p><code class="inline">def hello(request): return HttpResponse("Hi")</code> · JSON: <code class="inline">JsonResponse({...})</code></p>`,
      seed: { code: '# urls.py\nfrom django.urls import path\nfrom . import views\n\nurlpatterns = [\n    path("", views.home),\n    path("user/<int:pk>/", views.user_detail),\n]\n\n# views.py\ndef home(request):\n    return HttpResponse("Namaste Django!")', lang: "python" }
    },
    {
      id: "templates", title: "Templates & Jinja Syntax",
      html: `
<p class="lead">HTML mein Python-like expressions — <code class="inline">{{ variable }}</code> output, <code class="inline">{% ... %}</code> logic.</p>
<h2>Syntax</h2>
<ul>
  <li><code class="inline">{{ user.name|upper }}</code> — variable + filter</li>
  <li><code class="inline">{% if x %} ... {% endif %}</code></li>
  <li><code class="inline">{% for item in items %}</code></li>
  <li>Inheritance: <code class="inline">{% extends "base.html" %}{% block content %}</code></li>
</ul>`,
      seed: { code: '{% extends "base.html" %}\n{% block content %}\n  <h1>{{ course.name|upper }}</h1>\n  <ul>\n    {% for lesson in lessons %}\n      <li>{{ forloop.counter }}. {{ lesson.title }}</li>\n    {% empty %}\n      <li>Koi lesson nahi</li>\n    {% endfor %}\n  </ul>\n{% endblock %}', lang: "python" }
    },
    {
      id: "models", title: "Models & ORM",
      html: `
<p class="lead">Django ka crown jewel — <b>ORM</b>: Python classes → database tables. SQL likhne ki zaroorat kam!</p>
<h2>Flow</h2>
<ul>
  <li>Model define → <code class="inline">makemigrations</code> → <code class="inline">migrate</code></li>
  <li><code class="inline">Post.objects.create(...)</code> · <code class="inline">.all() .get() .filter()</code></li>
  <li>Relations: <code class="inline">ForeignKey</code>, <code class="inline">ManyToManyField</code></li>
</ul>`,
      seed: { code: 'from django.db import models\n\nclass Course(models.Model):\n    title = models.CharField(max_length=100)\n    lessons = models.IntegerField(default=0)\n    created = models.DateTimeField(auto_now_add=True)\n\n# shell:\n# Course.objects.create(title="HTML", lessons=17)\n# Course.objects.filter(lessons__gt=10)   # __gt = greater than', lang: "python" }
    },
    {
      id: "admin", title: "Admin Panel",
      html: `
<p class="lead">Django ka cheat code — free admin dashboard for all your models!</p>
<h2>Enable</h2>
<ul>
  <li><code class="inline">python manage.py createsuperuser</code></li>
  <li>admin.py: <code class="inline">admin.site.register(Course)</code></li>
  <li><code class="inline">@admin.register</code> + <code class="inline">list_display</code> se customize</li>
</ul>
<div class="tip">Internal tools jaldi chahiye? Sirf admin use karo — CRUD zero code mein!</div>`,
      seed: { code: 'from django.contrib import admin\nfrom .models import Course\n\n@admin.register(Course)\nclass CourseAdmin(admin.ModelAdmin):\n    list_display = ("title", "lessons", "created")\n    list_filter = ("lessons",)\n    search_fields = ("title",)', lang: "python" }
    },
    {
      id: "forms", title: "Forms & Validation",
      html: `
<p class="lead">Django forms — render, validate, save teeno handle karte hain.</p>
<h2>ModelForm</h2>
<p>Model se form auto-generate: <code class="inline">class Meta: model = Course; fields = [...]</code></p>
<h2>View flow</h2>
<ul>
  <li>Request POST → <code class="inline">form = CourseForm(request.POST)</code></li>
  <li><code class="inline">if form.is_valid(): form.save()</code></li>
  <li>Template: <code class="inline">{{ form.as_p }}</code></li>
</ul>`,
      seed: { code: 'from django import forms\nfrom .models import Course\n\nclass CourseForm(forms.ModelForm):\n    class Meta:\n        model = Course\n        fields = ["title", "lessons"]\n\ndef create(request):\n    form = CourseForm(request.POST or None)\n    if request.method == "POST" and form.is_valid():\n        form.save()\n        return redirect("home")\n    return render(request, "form.html", {"form": form})', lang: "python" }
    },
    {
      id: "auth", title: "Auth & Sessions",
      html: `
<p class="lead">Login/logout/permissions — Django ne pehle se likha hua hai, bas wire karo.</p>
<h2>Built-in</h2>
<ul>
  <li>URLs: <code class="inline">path("accounts/", include("django.contrib.auth.urls"))</code></li>
  <li><code class="inline">@login_required</code> decorator</li>
  <li><code class="inline">request.user</code> template mein</li>
  <li>Signup: <code class="inline">UserCreationForm</code></li>
</ul>`,
      seed: { code: 'from django.contrib.auth.decorators import login_required\n\n@login_required\ndef dashboard(request):\n    return render(request, "dash.html", {"user": request.user})\n\n# template\n# {% if user.is_authenticated %}\n#   Hi {{ user.username }} | Logout\n# {% else %} Login {% endif %}', lang: "python" }
    },
    {
      id: "rest", title: "Django REST Framework",
      html: `
<p class="lead"><b>DRF</b> — Django ko full API backend banata hai. Mobile/SPA frontends ko JSON deta hai.</p>
<h2>Building blocks</h2>
<ul>
  <li><b>Serializer</b> — Model ↔ JSON converter</li>
  <li><b>ViewSet</b> + <b>Router</b> — full CRUD 3 lines mein</li>
  <li>Browsable API — browser mein test UI free!</li>
  <li>Auth: tokens, JWT (<code class="inline">djangorestframework-simplejwt</code>)</li>
</ul>`,
      seed: { code: 'from rest_framework import serializers, viewsets, routers\nfrom .models import Course\n\nclass CourseSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Course; fields = "__all__"\n\nclass CourseViewSet(viewsets.ModelViewSet):\n    queryset = Course.objects.all()\n    serializer_class = CourseSerializer\n\nrouter = routers.DefaultRouter()\nrouter.register("courses", CourseViewSet)\nurlpatterns = router.urls   # /courses/, /courses/5/', lang: "python" }
    },
    {
      id: "wrapup", title: "Django Summary & Aage Kya",
      html: `
<p class="lead">Chapter end — full-stack Python web dev ab aapka hai.</p>
<h2>Aap ab jaante ho</h2>
<ul>
  <li>MVT, URLs, views, templates</li>
  <li>ORM models → admin → forms</li>
  <li>Auth, sessions, DRF APIs</li>
</ul>
<h2>Agla step</h2>
<p>Deploy: <b>Railway/Render</b> · Async: <b>Django Channels</b> · Frontend: <b>React + DRF</b> combo.</p>`,
      seed: { code: 'print("Django complete ✔")', lang: "python" }
    }
  ]
};
