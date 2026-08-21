// Bloqueo real a nivel servidor durante mantenimiento: a diferencia del
// aviso que pinta app.js en el navegador, esto corre en el edge de Vercel
// ANTES de servir cualquier archivo — nadie recibe el HTML real (ni un
// visitante con JS apagado, ni Google, ni curl) mientras esté encendido.
// El interruptor real vive en Mongo (SiteConfig) y se consulta aquí en
// vivo; /admin, los estáticos y demás nunca pasan por este bloqueo.
export const config = {
  matcher: ['/((?!admin|css|js|img|fonts|api|robots\\.txt|sitemap\\.xml).*)']
};

const PAGINA_MANTENIMIENTO = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>En mantenimiento · Gladiadores Off Road</title>
<link rel="stylesheet" href="/css/estilos.css">
</head>
<body>
<div id="loader">
  <div class="loader-helmet"><div class="loader-ring"></div><img src="/img/i1.png" alt="Gladiadores Off Road" width="110" height="110"></div>
  <div class="loader-txt">EN MANTENIMIENTO</div>
  <div class="mant-msg">Estamos afinando la aventura para que la vivas mejor. Volvemos muy pronto.</div>
  <a class="mant-wsp" href="https://wa.me/527971001929" target="_blank" rel="noopener">¿Dudas? Escríbenos por WhatsApp</a>
</div>
</body>
</html>`;

export default async function middleware() {
  try {
    const res = await fetch('https://gladiadores-backend.vercel.app/api/config/estado', {
      cache: 'no-store'
    });
    const data = await res.json();
    if (data && data.mantenimiento) {
      return new Response(PAGINA_MANTENIMIENTO, {
        status: 503,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'retry-after': '3600'
        }
      });
    }
  } catch (err) {
    // Si el backend no responde, no tumbamos el sitio: se deja pasar.
  }
}
