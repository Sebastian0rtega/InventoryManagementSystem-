# Auth

La sesión conserva el JWT en `sessionStorage` y obtiene la identidad canónica
desde `/auth/me`. Las rutas protegidas conservan el destino solicitado durante
el login; los errores 401 limpian la sesión y la caché, mientras los 403
mantienen la sesión y muestran acceso denegado.

`sessionStorage` es accesible desde JavaScript y no protege contra XSS. El
backend todavía no ofrece cookies HttpOnly ni refresh tokens. La autorización
real continúa correspondiendo al backend; los controles por rol del frontend
solo ocultan acciones no disponibles para ese rol.
