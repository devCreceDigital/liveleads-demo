# Landing con waitlist: Cloudflare + Google Sheets

Guía para el taller. Resultado: una landing publicada en `app.<tu-subdominio>.workers.dev` cuyo formulario guarda cada registro en una hoja de Google, sin servidor propio.

```
Visitante → Landing (Cloudflare Worker) → fetch POST → Apps Script (web app) → Google Sheet
```

## Qué necesitas

- Cuenta gratuita de Cloudflare y cuenta de Google.
- Node.js 18 o superior (trae `npx`).
- Un archivo `index.html` con la landing y una carpeta `assets/` con las imágenes.

## Paso 1. Estructura de carpetas

```
mi-landing/
├─ wrangler.jsonc
└─ deploy/
   ├─ index.html
   ├─ _headers          (opcional)
   └─ assets/           (imágenes)
```

La carpeta `deploy/` es lo único que se publica.

## Paso 2. Crear el Google Sheet

1. Crea una hoja nueva, por ejemplo "Live Leads - Waitlist".
2. En la fila 1 escribe los encabezados:
   `Fecha | Correo | Tienda | Categoría | Lives por semana | Usuario TikTok`
3. Copia el ID de la hoja. Está en la URL: `docs.google.com/spreadsheets/d/`**`ESTE_ES_EL_ID`**`/edit`.

## Paso 3. Script receptor (Google Apps Script)

1. Abre [script.google.com](https://script.google.com) y crea un **Nuevo proyecto**.
2. Pega este código y cambia `SHEET_ID`:

```javascript
var SHEET_ID = 'TU_SHEET_ID';
var HEADERS = ['Fecha', 'Correo', 'Tienda', 'Categoría', 'Lives por semana', 'Usuario TikTok'];

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.website) return out({ ok: true }); // honeypot anti-spam

    var email = String(d.email || '').trim().slice(0, 120);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return out({ ok: false, error: 'email' });

    var tiktok = String(d.tiktok || '').trim().replace(/^@/, '');
    if (!/^[A-Za-z0-9._]{2,24}$/.test(tiktok)) return out({ ok: false, error: 'tiktok' });

    var sh = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    if (sh.getRange(1, 1, 1, HEADERS.length).getValues()[0].join('|') !== HEADERS.join('|')) {
      sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    }
    sh.appendRow([
      Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd HH:mm:ss'),
      email,
      String(d.store || '').trim().slice(0, 120),
      String(d.category || '').slice(0, 60),
      String(d.frequency || '').slice(0, 40),
      '@' + tiktok
    ]);
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: 'server' });
  }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
```

3. Pulsa **Implementar → Nueva implementación → Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
4. Autoriza los permisos y copia la URL que termina en `/exec`.

**Para cambiar el script después:** Implementar → Administrar implementaciones → lápiz → Versión: **Nueva versión**. Así conservas la misma URL. Si creas una "nueva implementación", la URL cambia.

## Paso 4. El formulario en la landing

HTML (el campo `website` es un honeypot: un humano no lo ve, un bot sí lo rellena):

```html
<form id="wl-form" novalidate>
  <input type="email" name="email" placeholder="tu@correo.com" required>
  <input type="text" name="store" placeholder="Nombre de tu tienda" required>
  <input type="text" name="tiktok" placeholder="@tunickname" required maxlength="30">
  <select name="category" required>...</select>
  <select name="frequency" required>...</select>
  <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"
         style="position:absolute;left:-9999px;opacity:0">
  <button type="submit">Unirme a la waitlist</button>
  <p id="wl-err" hidden></p>
</form>
<p id="wl-ok" hidden>Listo. Te escribiremos pronto.</p>
```

JavaScript:

```javascript
var WAITLIST_ENDPOINT = "https://script.google.com/macros/s/XXXX/exec";
var form = document.getElementById("wl-form");
var errBox = document.getElementById("wl-err");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  var d = {
    email: form.email.value.trim(),
    store: form.store.value.trim(),
    tiktok: form.tiktok.value.trim(),
    category: form.category.value,
    frequency: form.frequency.value,
    website: form.website.value
  };
  var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) && d.store &&
              /^@?[A-Za-z0-9._]{2,24}$/.test(d.tiktok) && d.category && d.frequency;
  if (!valid) { errBox.textContent = "Revisa los campos."; errBox.hidden = false; return; }
  d.tiktok = "@" + d.tiktok.replace(/^@/, "");

  fetch(WAITLIST_ENDPOINT, {
    method: "POST",
    mode: "no-cors",                                   // Apps Script no envía cabeceras CORS
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // text/plain evita el preflight
    body: JSON.stringify(d)
  })
  .then(function () { form.hidden = true; document.getElementById("wl-ok").hidden = false; })
  .catch(function () { errBox.textContent = "No pudimos guardar tu registro."; errBox.hidden = false; });
});
```

Dos detalles que confunden en el taller:

- Con `no-cors` el navegador no puede leer la respuesta. Por eso el "Listo" significa "se envió", no "se guardó". Para confirmar que guardó, prueba con `curl` (Paso 5).
- Apps Script responde con una redirección 302. Es normal: la escritura ya ocurrió en el primer POST.

## Paso 5. Probar el receptor sin la landing

```bash
URL='https://script.google.com/macros/s/XXXX/exec'
L=$(curl -s -o /dev/null -w "%{redirect_url}" -X POST \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"email":"prueba@example.com","store":"PRUEBA","tiktok":"@prueba","category":"Otra","frequency":"1 o 2"}' "$URL")
curl -s "$L"     # debe responder {"ok":true}
```

Revisa que aparezca la fila en el Sheet y borra las filas de prueba.

## Paso 6. Configurar Cloudflare

`wrangler.jsonc` en la raíz del proyecto:

```jsonc
{
  "name": "app",
  "compatibility_date": "2026-10-12",
  "assets": { "directory": "deploy" }
}
```

`name` es el nombre del Worker y será lo primero de la URL: `app.<subdominio>.workers.dev`.

## Paso 7. Iniciar sesión y desplegar

```bash
npx wrangler login      # abre el navegador: autoriza con TU cuenta de Cloudflare
npx wrangler whoami     # confirma el correo y el Account ID
npx wrangler deploy
```

Si tienes varias cuentas, fija la correcta:

```bash
CLOUDFLARE_ACCOUNT_ID=tu_account_id npx wrangler deploy
```

Para cambiar de cuenta: `npx wrangler logout` y luego `npx wrangler login`.

## Paso 8. El subdominio workers.dev

- La primera vez Cloudflare registra un subdominio de cuenta automáticamente, con un nombre que puede salir feo (por ejemplo el de tu carpeta).
- Cámbialo en el panel: **Workers & Pages → Subdomain**. No se puede cambiar por API.
- La URL final es `nombre-del-worker.tu-subdominio.workers.dev`.

## Paso 9. Actualizar el sitio

Edita `deploy/index.html` y vuelve a ejecutar `npx wrangler deploy`. Misma URL, versión nueva.

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| La URL nueva no abre durante 1 o 2 minutos | El certificado de un subdominio nuevo tarda en activarse. Espera. |
| Subes un cambio y no se ve | Caché del borde de Cloudflare. Espera unos segundos y recarga con Ctrl+F5. |
| El formulario dice "Listo" pero no hay fila | `WAITLIST_ENDPOINT` mal pegado o el acceso no es "Cualquier persona". Prueba con el `curl` del Paso 5. |
| Editaste el script y nada cambia | Falta publicar una **Nueva versión** de la misma implementación. |
| La columna nueva no aparece | El script la crea solo en el primer registro válido, no al guardarlo. |
| `wrangler` no encuentra el proyecto | Corre el comando en la carpeta donde está `wrangler.jsonc`. |

## Antes de compartir la landing

- No pongas en la landing capturas con nombres reales de personas sin su permiso.
- Aclara en el formulario para qué usarás los datos.
- Borra las filas de prueba del Sheet.
