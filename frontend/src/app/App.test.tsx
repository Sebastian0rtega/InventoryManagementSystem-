import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { Providers } from '@/app/Providers'

describe('flujo de navegación inicial', () => {
  it('muestra el resumen y permite abrir la vista de inventario', () => {
    render(
      <Providers>
        <App />
      </Providers>,
    )

    expect(screen.getByRole('heading', { name: 'Todo en orden.' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: /ir al inventario/i }))

    expect(screen.getByRole('heading', { name: 'Inventario' })).toBeInTheDocument()
  })
})
