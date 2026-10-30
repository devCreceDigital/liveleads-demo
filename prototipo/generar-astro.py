"""Genera el proyecto Astro del prototipo a partir de liveleads-prototipo.html.

El HTML de un solo archivo es la fuente: este script lo parte en layout, componentes
y una página por pantalla, para que las dos versiones no se separen.
Uso: python generar-astro.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = (ROOT / "liveleads-prototipo.html").read_text(encoding="utf-8")
OUT = ROOT / "astro"

ROUTES = {
    "login": "/", "registro": "/registro", "verificar": "/verificar",
    "ob-etiquetas": "/bienvenida/etiquetas", "ob-tiktok": "/bienvenida/live",
    "live": "/live", "rescatar": "/por-rescatar", "historial": "/historial",
    "etiquetas": "/etiquetas", "catalogo": "/catalogo", "perfil": "/perfil",
}
APP_VIEWS = ["live", "rescatar", "historial", "etiquetas", "catalogo", "perfil"]


def between(text, start, end):
    i = text.index(start) + len(start)
    return text[i:text.index(end, i)]


def write(rel, content):
    p = OUT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")


css = between(SRC, "<style>", "</style>")
fonts = re.search(r'<link rel="stylesheet"[^>]+>', SRC).group(0)
js = SRC[SRC.rindex("<script>") + len("<script>"):SRC.rindex("</script>")]

auth = between(SRC, "<!-- ============ AUTH ============ -->", "<!-- ============ APP SHELL ============ -->")
auth_views = {}
for chunk in auth.split('<div class="auth" data-view="')[1:]:
    name = chunk[:chunk.index('"')]
    auth_views[name] = '<div class="auth" data-view="' + chunk.rstrip()

shell = between(SRC, "<!-- ============ APP SHELL ============ -->", "<!-- ============ OVERLAYS ============ -->")
pages_start = shell.index("    <!-- LIVE -->")
pages_end = shell.index("  </main>")
app_layout_markup = shell[:pages_start] + "    <slot />\n" + shell[pages_end:]
app_views = {}
for chunk in re.split(r"\n    <!-- [A-ZÁÉÍÓÚ ]+ -->\n", "\n" + shell[pages_start:pages_end]):
    m = re.search(r'data-view="([\w-]+)"', chunk)
    if m:
        app_views[m.group(1)] = chunk.strip("\n")

overlays = between(SRC, "<!-- ============ OVERLAYS ============ -->", "<script>")

# In Astro each page only carries its own markup: $() returns an inert object for missing nodes.
js = js.replace(
    'function $(s,r){return (r||document).querySelector(s)}',
    'var NOOP=new Proxy(function(){},{get:function(t,k){return k===Symbol.toPrimitive?function(){return ""}:NOOP},set:function(){return true},apply:function(){return NOOP}});\n'
    '  function $(s,r){return (r||document).querySelector(s)||NOOP}',
)
assert "NOOP" in js, "no se encontró la función $() en el script"

write("package.json", json.dumps({
    "name": "liveleads-prototipo",
    "type": "module",
    "version": "0.1.0",
    "private": True,
    "scripts": {"dev": "astro dev", "build": "astro build", "preview": "astro preview"},
    "dependencies": {"astro": "4.16.18"},
}, indent=2) + "\n")
write("astro.config.mjs", "import { defineConfig } from 'astro/config';\n\nexport default defineConfig({});\n")
write("src/styles/global.css", css.strip() + "\n")
write("public/proto.js", js.strip() + "\n")

write("src/layouts/Base.astro", f"""---
import '../styles/global.css';
import Overlays from '../components/Overlays.astro';
interface Props {{ view: string; title: string }}
const {{ view, title }} = Astro.props;
const routes = {json.dumps(ROUTES)};
---
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>{{title}} · LiveLeads</title>
    {fonts}
  </head>
  <body>
    <slot />
    <Overlays />
    <script is:inline define:vars={{{{ view, routes }}}}>window.LL_START = view; window.LL_ROUTES = routes;</script>
    <script is:inline src="/proto.js"></script>
  </body>
</html>
""")

write("src/layouts/App.astro", """---
import Base from './Base.astro';
interface Props { view: string; title: string }
const { view, title } = Astro.props;
---
<Base view={view} title={title}>
""" + app_layout_markup.replace('<div class="shell" id="shell" hidden>', '<div class="shell" id="shell">') + """
</Base>
""")

write("src/components/Overlays.astro", "---\n---\n" + overlays.strip() + "\n")

titles = {
    "login": "Iniciar sesión", "registro": "Crear cuenta", "verificar": "Confirmar correo",
    "ob-etiquetas": "Crea tus etiquetas", "ob-tiktok": "Inicia tu live",
    "live": "Live", "rescatar": "Por rescatar", "historial": "Historial",
    "etiquetas": "Etiquetas", "catalogo": "Catálogo", "perfil": "Perfil",
}
for name, markup in auth_views.items():
    comp = "Auth" + "".join(p.capitalize() for p in name.split("-"))
    write(f"src/components/views/{comp}.astro", "---\n---\n" + markup.replace(" hidden>", ">", 1) + "\n")
    route = ROUTES[name]
    page = "index" if route == "/" else route.strip("/")
    depth = "../" * (page.count("/") + 1)
    write(f"src/pages/{page}.astro", f"""---
import Base from '{depth}layouts/Base.astro';
import View from '{depth}components/views/{comp}.astro';
---
<Base view="{name}" title="{titles[name]}">
  <View />
</Base>
""")

for name in APP_VIEWS:
    comp = "".join(p.capitalize() for p in name.split("-"))
    write(f"src/components/views/{comp}.astro", "---\n---\n" + app_views[name].replace(" hidden>", ">", 1) + "\n")
    page = ROUTES[name].strip("/")
    write(f"src/pages/{page}.astro", f"""---
import App from '../layouts/App.astro';
import View from '../components/views/{comp}.astro';
---
<App view="{name}" title="{titles[name]}">
  <View />
</App>
""")

write("README.md", """# LiveLeads · prototipo en Astro

Prototipo navegable del flujo optimizado del Mapa UX de LiveLeads. Cada pantalla es una página.

```
npm install
npm run dev
```

Abre http://localhost:4321. Rutas: `/` (login), `/registro`, `/verificar`, `/bienvenida/etiquetas`,
`/bienvenida/live`, `/live`, `/por-rescatar`, `/historial`, `/etiquetas`, `/catalogo`, `/perfil`.

La fuente es `../liveleads-prototipo.html`. Si cambias el prototipo, vuelve a generar este proyecto con
`python ../generar-astro.py` (sobrescribe `src/` y `public/proto.js`).

El estado (etiquetas, personas, productos, días del plan) se guarda en `sessionStorage` y se comparte entre páginas.
Todos los datos son de ejemplo.
""")

print("Astro generado:", sorted(str(p.relative_to(OUT)) for p in OUT.rglob("*") if p.is_file()))
