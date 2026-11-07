# LiveLeads · prototipo y Mapa UX

LiveLeads ordena por intención los comentarios de un live de TikTok y, al terminar, muestra a quién escribirle primero. Le escribe el vendedor, desde TikTok.

Este repositorio contiene el prototipo navegable del producto y el Mapa UX que lo guía. **Es una demo:** todos los datos son de ejemplo y el live, los pagos, el QR y las conexiones son simulados.

## Contenido

| Ruta | Qué es |
|---|---|
| `landing/` | Landing de Live Leads: demo, cómo funciona, waitlist, preguntas frecuentes y contacto |
| `docs/mapa-ux-liveleads.html` | Mapa UX: guía para el usuario, mapa del sitio, flujos, pantallas, sistema visual, tarifas, mejoras y copywriting |
| `prototipo/liveleads-prototipo.html` | Prototipo navegable en un solo archivo |
| `prototipo/astro/` | El mismo prototipo como proyecto Astro, con una página por pantalla |
| `prototipo/generar-astro.py` | Genera el proyecto Astro a partir del prototipo HTML |

## Ver el Mapa UX y el prototipo

Descarga el repositorio y abre estos archivos en el navegador:

- `docs/mapa-ux-liveleads.html`
- `prototipo/liveleads-prototipo.html`

La barra inferior del prototipo tiene atajos a Login, Registro, Onboarding y Panel. El botón **Conexión** simula los casos "sin live" y "con falla".

Necesitas internet para cargar las fuentes y dibujar los diagramas del Mapa.

## Ejecutar la versión Astro

Requiere Node.js 18 o superior.

```bash
cd prototipo/astro
npm install
npm run dev
```

Abre http://localhost:4321.

| Ruta | Pantalla |
|---|---|
| `/` | Iniciar sesión |
| `/registro` | Crear cuenta |
| `/verificar` | Confirmar correo |
| `/bienvenida/etiquetas` | Paso 1: etiquetas |
| `/bienvenida/live` | Paso 2: primer live |
| `/live` | Live |
| `/por-rescatar` | Por rescatar |
| `/historial` | Historial |
| `/etiquetas` | Etiquetas |
| `/catalogo` | Catálogo |
| `/perfil` | Perfil, Mis tiendas y Monedero |

La fuente es `prototipo/liveleads-prototipo.html`. Después de cambiarla, regenera Astro:

```bash
cd prototipo
python generar-astro.py
```

El comando sobrescribe `astro/src` y `astro/public/proto.js`.

## Flujo principal

1. **Crear cuenta:** 7 días gratis, sin tarjeta.
2. **Confirmar correo:** con un código de 6 dígitos.
3. **Crear etiquetas:** con un toque, usando las recomendadas.
4. **Iniciar live:** LiveLeads busca el live del @ y ordena los comentarios.
5. **Por atender:** una fila por persona, por etiqueta e insistencia.
6. **Terminar live:** resumen y botón "Ver a quién escribir".
7. **Por rescatar:** personas del último live.
8. **Mensajes y DM:** el vendedor abre TikTok y escribe.
9. **Historial:** estadísticas, filtros y todos los lives.

## Decisiones de producto

- **Perú:** montos en soles. Pagos con Yape, Plin o tarjeta.
- **Monedero por cuenta:** 7 días gratis. Paquetes de 15 días por S/ 20, 30 días por S/ 40 y 60 días por S/ 80. No se cobra por tienda.
- **Tiendas:** hasta 3 por cuenta.
- **WhatsApp:** opcional y fuera del onboarding. Se conecta en Perfil.
- **Enlace de WhatsApp:** abre WhatsApp con el mensaje listo para que el cliente complete su @. No prueba identidad: la cuenta se confirma antes de compartir datos del pedido.
- **Mensajes:** LiveLeads no escribe por el vendedor. La excepción es el mensaje que pide el @ a un número nuevo, solo si el vendedor conecta WhatsApp.
- **Diseño:** primero para celular, con el sistema visual de la app real. Los valores están en el Mapa UX.

## Limitaciones de la demo

- Todas las tiendas muestran los mismos datos de ejemplo.
- El estado se guarda en `sessionStorage`. Se pierde al cerrar la pestaña.
- En Astro, un live en curso se reinicia al cambiar de página.
- Las estadísticas de Historial son una propuesta: aún no existen en la app real.
