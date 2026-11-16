import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page, type Route } from '@playwright/test'

const apiOrigin = 'http://127.0.0.1:3000'
const allowedOrigin = 'http://127.0.0.1:4173'
const corsHeaders = {
  'access-control-allow-origin': allowedOrigin,
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'authorization,content-type',
  'access-control-expose-headers': 'x-request-id',
  'x-request-id': 'e2e-request-id',
}

async function respondJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(results.violations).toEqual([])
}

async function expectVisibleFocus(page: Page) {
  const outline = await page.locator(':focus').evaluate((element) => {
    const style = window.getComputedStyle(element)
    return { style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) }
  })

  expect(outline.style).not.toBe('none')
  expect(outline.width).toBeGreaterThan(0)
}

test('login, filtra inventario y registra ajuste con accesibilidad básica', async ({
  page,
}) => {
  const inventoryRequests: URL[] = []
  let adjustmentBody: unknown

  await page.route(`${apiOrigin}/api/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders })
      return
    }

    if (url.pathname.endsWith('/auth/login')) {
      await respondJson(route, { token: 'e2e-session-token' })
      return
    }

    if (url.pathname.endsWith('/auth/me')) {
      await respondJson(route, {
        usuario_id: 1,
        rol_id: 1,
        tienda_id: 2,
        email: 'inventory@example.com',
        nombre: 'Inventory User',
        activo: true,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
        rol: { rol_id: 1, nombre_rol: 'ADMIN' },
      })
      return
    }

    if (url.pathname.endsWith('/products')) {
      await respondJson(route, {
        items: [{ producto_id: 21, nombre: 'Café', sku: 'SKU-21', activo: true }],
        page: 1,
        limit: 100,
        total: 1,
      })
      return
    }

    if (url.pathname.endsWith('/inventory/adjustments')) {
      adjustmentBody = request.postDataJSON()
      await respondJson(
        route,
        {
          ajuste: {
            movimiento_id: 501,
            tipo: 'ENTRADA',
            cantidad: 3,
            motivo: 'Conteo físico',
            usuario: { usuario_id: 1, nombre: 'Inventory User' },
            tienda: { tienda_id: 2, nombre: 'Casa Matriz' },
            producto: { producto_id: 21, nombre: 'Café', sku: 'SKU-21' },
            fecha: '2026-01-01T10:00:00.000Z',
          },
          inventario: {
            inventario_id: 11,
            stock_actual: 5,
            stock_minimo: 3,
            status: 'NORMAL',
          },
        },
        201,
      )
      return
    }

    if (url.pathname.endsWith('/inventory')) {
      inventoryRequests.push(url)
      await respondJson(route, {
        data: [
          {
            inventario_id: 11,
            tienda_id: 2,
            producto_id: 21,
            stock_actual: 2,
            stock_minimo: 3,
            status: 'LOW',
            producto: {
              producto_id: 21,
              nombre: 'Café',
              sku: 'SKU-21',
              codigo_barras: null,
              precio_venta: '10.00',
              activo: true,
            },
            tienda: { tienda_id: 2, nombre: 'Casa Matriz' },
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      })
      return
    }

    await respondJson(
      route,
      { error: { code: 'NOT_FOUND', message: 'Not found' } },
      404,
    )
  })

  await page.goto('/inventory')
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
  await expectAccessible(page)
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Correo electrónico')).toBeFocused()
  await expectVisibleFocus(page)

  await page.getByLabel('Correo electrónico').fill('inventory@example.com')
  await page.getByLabel('Contraseña').fill('not-a-real-password')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page.getByRole('heading', { name: 'Inventario' })).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toHaveRole('link')
  await expectVisibleFocus(page)
  await expectAccessible(page)

  await page.getByLabel('Buscar producto o SKU').fill('cafe')
  await page.getByLabel('Estado').selectOption('LOW')
  await expect(page.getByRole('row', { name: /Café/ })).toBeVisible()
  await expect
    .poll(() =>
      inventoryRequests.some(
        (url) =>
          url.searchParams.get('search') === 'cafe' &&
          url.searchParams.get('status') === 'LOW',
      ),
    )
    .toBe(true)
  await expectAccessible(page)

  await page.getByRole('button', { name: 'Ajustar', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Ajustar stock' })
  await expect(dialog).toBeVisible()
  const productSelect = page.getByLabel('Producto activo', { exact: true })
  await expect(productSelect).toBeEnabled()
  await expect(productSelect.locator('option[value="21"]')).toHaveCount(1)
  await productSelect.selectOption('21')
  await page.getByLabel('Cantidad').fill('3')
  await page.getByLabel('Motivo').fill('Conteo físico')
  await expectAccessible(page)
  await page.getByRole('button', { name: 'Registrar entrada' }).click()

  const successMessage = page.getByRole('status').filter({
    hasText: 'Ajuste registrado correctamente.',
  })
  await expect(successMessage).toBeVisible()
  await expect(successMessage).toHaveAttribute('aria-live', 'polite')
  expect(adjustmentBody).toEqual({
    productId: 21,
    storeId: 2,
    tipo: 'ENTRADA',
    cantidad: 3,
    motivo: 'Conteo físico',
  })
})
