import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section className="welcome-panel" aria-labelledby="welcome-title">
      <div className="eyebrow">
        <span className="eyebrow-line" />
        CONTROL DE INVENTARIO
      </div>
      <h1 id="welcome-title">Todo en orden.</h1>
      <p className="welcome-copy">
        Tu espacio de trabajo para consultar existencias y mantener el inventario al
        día.
      </p>
      <Link className="primary-button" to="/inventory">
        Ir al inventario <span aria-hidden="true">→</span>
      </Link>
      <div className="welcome-note">
        <span className="note-icon" aria-hidden="true">
          ✓
        </span>
        <span>Una base clara para empezar a trabajar</span>
      </div>
    </section>
  )
}
