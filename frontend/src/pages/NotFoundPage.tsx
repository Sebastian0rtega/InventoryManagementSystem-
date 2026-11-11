import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page-section" aria-labelledby="not-found-title">
      <div className="eyebrow">
        <span className="eyebrow-line" />
        PÁGINA NO ENCONTRADA
      </div>
      <h1 id="not-found-title">No encontramos esa página.</h1>
      <p className="page-description">Comprueba la dirección o vuelve al resumen.</p>
      <Link className="primary-button" to="/">
        Volver al resumen <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}
