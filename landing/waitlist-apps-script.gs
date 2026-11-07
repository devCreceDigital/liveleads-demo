// Live Leads - receptor de la waitlist (v2: agrega usuario de TikTok).
// Pega este código en tu proyecto de https://script.google.com reemplazando el anterior,
// luego: Implementar > Administrar implementaciones > editar (lápiz) > Versión: Nueva versión > Implementar.
// Así se conserva la misma URL /exec.
var SHEET_ID = '1_R6chMj7QPIXQm8S7zX8KilYKxCPTv7YcztKxjlq3jQ';
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
