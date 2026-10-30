# LiveLeads · prototipo en Astro

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
