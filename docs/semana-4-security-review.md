# Revisión de seguridad de dependencias y entrega

Fecha de revisión: 2026-10-30

## Auditoría de dependencias de producción

Comando: `npm audit --omit=dev` desde `backend/`.

| Paquete afectado | Severidad | Tipo | Hallazgo / evaluación | Decisión |
|---|---|---|---|---|
| `zod` | HIGH (corregido) | Directa | GHSA-mrhx-c7xc-m3w5: consumo de memoria al validar colecciones restringidas de gran tamaño. La API valida entradas externas. | Actualizado dentro del rango compatible a `4.6.7`; build y pruebas focalizadas pasan. |
| `uuid` vía `sequelize@6.37.8` | MODERATE (mitigado en lockfile) | Transitiva de dependencia directa | GHSA-w5hq-g745-h8pq afecta v3/v5/v6 cuando se proporciona un buffer. Sequelize usa v1/v4 en el código inspeccionado y no se identificó un flujo desde las rutas hacia las funciones afectadas. | Override acotado de Sequelize a `uuid@^11.1.1`, que conserva CommonJS y las funciones v1/v4 usadas. `npm audit --omit=dev` reporta cero vulnerabilidades tras el override. No forzar el downgrade de Sequelize que propone npm. |

La auditoría de producción previa al override reportó dos entradas moderadas (`sequelize` y su dependencia `uuid`) y cero hallazgos altos o críticos. El fix automático propuesto por npm instala Sequelize 3.30.0, un downgrade incompatible, y no se ejecutó. La validación posterior al override reportó cero vulnerabilidades de producción; la auditoría completa aún reporta siete vulnerabilidades bajas de dependencias de desarrollo.

## Mitigaciones HTTP

- `express.json` limita cuerpos a 1 MiB y devuelve un error `413` estandarizado al excederlo.
- `express-rate-limit` limita a 5 intentos por IP cada 15 minutos únicamente en `POST /api/auth/login`; otras rutas no comparten ese límite.
- Helmet permanece habilitado con sus cabeceras seguras predeterminadas.
- CORS actualmente permite orígenes web arbitrarios sin habilitar credenciales. Mantenerlo así mientras la API sea pública; al definir los orígenes del frontend, limitar `origin` en una actualización revisada.

## Imagen y workflow

- El Dockerfile usa `node:22-bookworm-slim`, etapa final separada, `npm ci --omit=dev` y `USER node`.
- La etapa runtime actualiza los paquetes Debian durante la construcción y elimina npm/npx globales, que no son necesarios para ejecutar `node dist/server.js`.
- GitHub Actions declara `permissions: contents: read` y usa credenciales de prueba no secretas; no imprime secretos ni recibe secretos del repositorio.
- El primer escaneo de `inventory-api:day6-rescan` reportó 229 vulnerabilidades Debian (56 HIGH, 1 CRITICAL) y 22 de paquetes Node (10 HIGH). Tras actualizar los paquetes Debian durante el build y retirar npm global, el escaneo final del 2026-10-30 reportó 228 Debian (56 HIGH, 1 CRITICAL) y cero vulnerabilidades en los paquetes Node detectados. Evidencia: [`docs/semana-6-trivy-image.txt`](./semana-6-trivy-image.txt), commit `954c47c`.
- El CRITICAL `CVE-2023-45853` sigue reportado para `zlib1g` con estado `will_not_fix`; la actualización de la base Debian no lo eliminó. Los hallazgos HIGH del sistema operativo también permanecen y requieren evaluación; no se consideran mitigados solo por actualizar paquetes.
- Seguimiento de hallazgos del sistema operativo en imagen: [#62](https://github.com/Sebastian0rtega/InventoryManagementSystem-/issues/62). Reevaluar imagen base/parches Debian y exposición; registrar una excepción revisada si un fix no está disponible. No ocultar findings ni bloquear un release únicamente con el conteo sin analizar aplicabilidad.
- Para repetir el escaneo en AWS sin reemplazar la evidencia previa si falla:

  ```bash
  if docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$HOME/.cache/trivy:/cache" \
    aquasec/trivy:latest \
    --cache-dir /cache \
    image --quiet --no-progress --scanners vuln \
    --format table --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL \
    inventory-api:day6-rescan \
    > /tmp/semana-6-trivy-image.txt 2>&1
  then
    cp /tmp/semana-6-trivy-image.txt docs/semana-6-trivy-image.txt
  else
    tail -n 40 /tmp/semana-6-trivy-image.txt
    echo "El escaneo falló; conservar el reporte versionado."
    exit 1
  fi
  ```

  El escaneo debe terminar correctamente antes de copiar el archivo temporal al repositorio. No registrar `docker inspect` de variables de entorno ni archivos `.env`.
- Seguimiento: [#61](https://github.com/Sebastian0rtega/InventoryManagementSystem-/issues/61) evalúa la compatibilidad del override para `GHSA-w5hq-g745-h8pq`, la regresión PostgreSQL y el escaneo de la imagen.

## Política de actualización

1. Abrir un PR pequeño por dependencia o grupo relacionado; no combinarlo con cambios de negocio.
2. Revisar advisory y changelog, incluidos cambios incompatibles y dependencias transitivas.
3. No ejecutar `npm audit fix --force` sin una migración planificada, pruebas y revisión explícita.
4. Ejecutar `npm ci`, build, lint, setup de base de pruebas y suite completa antes de fusionar.
5. Escanear la imagen de producción y adjuntar un resumen sin secretos.
