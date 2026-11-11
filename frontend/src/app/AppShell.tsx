import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
}

const navigationItems = [
  { label: 'Resumen', to: '/' },
  { label: 'Inventario', to: '/inventory' },
]

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegación principal">
        <NavLink className="brand" to="/" aria-label="Inventory, ir al resumen">
          <span className="brand-mark" aria-hidden="true">
            I
          </span>
          <span>
            <strong>Inventory</strong>
            <small>GESTIÓN DE STOCK</small>
          </span>
        </NavLink>

        <span className="nav-label">ESPACIO DE TRABAJO</span>
        <nav className="primary-nav">
          {navigationItems.map(({ label, to }) => (
            <NavLink
              key={to}
              className={({ isActive }) =>
                `nav-link${isActive ? ' nav-link-active' : ''}`
              }
              end={to === '/'}
              to={to}
            >
              <span className="nav-indicator" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" aria-hidden="true" />
          <span>Entorno de desarrollo</span>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <span className="topbar-context">Plataforma de inventario</span>
          <div className="user-placeholder" aria-label="Sesión no iniciada">
            <span className="avatar" aria-hidden="true">
              D
            </span>
            <span className="user-label">Demo</span>
          </div>
        </header>
        <main className="main-content">{children}</main>
        <footer className="page-footer">
          <span>Inventory Management System</span>
          <span>Frontend · Semana 5</span>
        </footer>
      </div>
    </div>
  )
}
