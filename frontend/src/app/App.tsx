import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/AppShell'
import { ProtectedRoute, RoleRoute } from '@/features/auth/guards'
import { HomePage } from '@/pages/HomePage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { InventoryPage } from '@/pages/InventoryPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <AppShell>
              <Outlet />
            </AppShell>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route
            path="/inventory/adjustments"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'WAREHOUSE']}>
                <section aria-labelledby="adjustments-title">
                  <h1 id="adjustments-title">Ajustes de inventario</h1>
                  <p>
                    Tu rol está autorizado. El formulario de ajuste se incorporará en la
                    siguiente etapa.
                  </p>
                </section>
              </RoleRoute>
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
