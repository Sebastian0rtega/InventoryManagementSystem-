import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <main>
      <section aria-labelledby="forbidden-title">
        <h1 id="forbidden-title">Acceso denegado</h1>
        <p>Tu cuenta no tiene permisos para acceder a esta sección.</p>
        <Link to="/inventory">Volver al inventario</Link>
      </section>
    </main>
  )
}
