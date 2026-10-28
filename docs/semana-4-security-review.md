# Revisión de seguridad de dependencias y entrega

Fecha de revisión: 2026-10-28

## Auditoría de dependencias de producción

Comando: `npm audit --omit=dev` desde `backend/`.

| Paquete afectado | Severidad | Tipo | Hallazgo / evaluación | Decisión |
|---|---|---|---|---|
| `zod` | HIGH (corregido) | Directa | GHSA-mrhx-c7xc-m3w5: consumo de memoria al validar colecciones restringidas de gran tamaño. La API valida entradas externas. | Actualizado dentro del rango compatible a `4.6.7`; build y pruebas focalizadas pasan. |
| `uuid@8.3.2` vía `sequelize@6.37.8` | MODERATE | Transitiva de dependencia directa | GHSA-w5hq-g745-h8pq describe un chequeo de límites insuficiente al proporcionar un buffer a funciones UUID v3/v5/v6. La revisión de Sequelize 6.37.8 encuentra usos internos de v1/v4, no llamadas v3/v5/v6 con buffer; no se identificó un flujo explotable desde las rutas actuales, pero el advisory transitivo sigue pendiente. | `npm audit` propone Sequelize `3.30.0`, downgrade incompatible de major. No ejecutar `npm audit fix --force`; mantener Sequelize 6 y crear Issue para evaluar actualización compatible y comprobar el alcance en un PR aislado. |

El informe de auditoría de producción después de actualizar Zod contiene dos entradas moderadas (`sequelize` y su dependencia `uuid`) y cero hallazgos altos o críticos. La auditoría completa también reporta siete entradas bajas transitivas de desarrollo relacionadas con Jest/deepmerge; no se incluyen en la imagen runtime. npm propone downgrades mayores antiguos para esa cadena, por lo que no se forzaron. Confirmar ambas auditorías al preparar el PR, ya que advisories y lockfiles pueden cambiar.

## Mitigaciones HTTP

- `express.json` limita cuerpos a 1 MiB y devuelve un error `413` estandarizado al excederlo.
- `express-rate-limit` limita a 5 intentos por IP cada 15 minutos únicamente en `POST /api/auth/login`; otras rutas no comparten ese límite.
- Helmet permanece habilitado con sus cabeceras seguras predeterminadas.
- CORS actualmente permite orígenes web arbitrarios sin habilitar credenciales. Mantenerlo así mientras la API sea pública; al definir los orígenes del frontend, limitar `origin` en una actualización revisada.

## Imagen y workflow

- El Dockerfile usa `node:22-bookworm-slim`, etapa final separada, `npm ci --omit=dev` y `USER node`.
- GitHub Actions declara `permissions: contents: read` y usa credenciales de prueba no secretas; no imprime secretos ni recibe secretos del repositorio.
- El escaneo de imagen está pendiente de ejecutarse en AWS sobre la imagen reconstruida; no se presenta como completado en este informe.
- El escaneo Trivy de la imagen debe ejecutarse sobre la imagen construida en AWS y adjuntarse como resumen sin credenciales ni variables de entorno. Comandos sugeridos desde la raíz:

  ```bash
  trivy image --scanners vuln --severity HIGH,CRITICAL --exit-code 1 inventory-api:semana4
  trivy image --scanners vuln --format table --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL inventory-api:semana4 \
    > docs/semana-4-trivy-image.txt
  ```

  El primer comando bloquea si hay hallazgos altos/críticos; el segundo guarda un inventario para revisión. No registrar `docker inspect` de variables de entorno ni archivos `.env`.

## Política de actualización

1. Abrir un PR pequeño por dependencia o grupo relacionado; no combinarlo con cambios de negocio.
2. Revisar advisory y changelog, incluidos cambios incompatibles y dependencias transitivas.
3. No ejecutar `npm audit fix --force` sin una migración planificada, pruebas y revisión explícita.
4. Ejecutar `npm ci`, build, lint, setup de base de pruebas y suite completa antes de fusionar.
5. Escanear la imagen de producción y adjuntar un resumen sin secretos.
