import { useQuery } from '@tanstack/react-query'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { z } from 'zod'
import { listActiveProducts } from '@/features/inventory/api'
import { ApiError } from '@/lib/httpClient'
import { queryKeys } from '@/shared/api/queryKeys'
import type { ActiveProductSummary, InventoryAdjustmentInput } from '@/shared/api/types'

export type AdjustmentSeed = {
  product?: ActiveProductSummary
  storeId?: number
  storeName?: string
}

type AdjustmentField = 'productId' | 'storeId' | 'tipo' | 'cantidad' | 'motivo'
type FormValues = Record<AdjustmentField, string>

type InventoryAdjustmentDialogProps = {
  isAdmin: boolean
  warehouseStoreId: number
  seed?: AdjustmentSeed
  pending: boolean
  error: unknown
  onSubmit: (input: InventoryAdjustmentInput) => void
  onClose: () => void
}

const positiveIntegerField = z
  .string()
  .regex(/^\d+$/, 'Ingresa un número entero positivo.')
  .transform(Number)
  .pipe(z.number().int().positive('Ingresa un número entero positivo.'))

const adjustmentFormSchema = z.object({
  productId: positiveIntegerField,
  tipo: z.enum(['ENTRADA', 'SALIDA']),
  cantidad: positiveIntegerField,
  motivo: z
    .string()
    .trim()
    .min(3, 'El motivo debe tener entre 3 y 255 caracteres.')
    .max(255, 'El motivo debe tener entre 3 y 255 caracteres.'),
})

function adjustmentError(error: unknown): {
  title: string
  details: string[]
} {
  if (!(error instanceof ApiError)) {
    return {
      title: 'No se pudo completar el ajuste.',
      details: error instanceof Error ? [error.message] : [],
    }
  }

  switch (error.code) {
    case 'INSUFFICIENT_STOCK':
    case 'STOCK_INSUFFICIENT':
      return {
        title: 'No hay stock suficiente para realizar esta salida.',
        details: error.details.filter(
          (detail): detail is string => typeof detail === 'string',
        ),
      }
    case 'VALIDATION_ERROR':
      return {
        title: 'Los datos del ajuste no cumplen las reglas del inventario.',
        details: error.details.map((detail) =>
          typeof detail === 'string'
            ? detail
            : (JSON.stringify(detail) ?? String(detail)),
        ),
      }
    case 'FORBIDDEN':
      return {
        title: 'No tienes permiso para ajustar stock en esa tienda.',
        details: [],
      }
    case 'NOT_FOUND':
      return {
        title: 'No se encontró el producto o la tienda seleccionada.',
        details: [],
      }
    default:
      return {
        title: 'No se pudo completar el ajuste.',
        details: [error.message],
      }
  }
}

function focusableElements(element: HTMLElement): HTMLElement[] {
  return Array.from(
    element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
}

export function InventoryAdjustmentDialog({
  isAdmin,
  warehouseStoreId,
  seed,
  pending,
  error,
  onSubmit,
  onClose,
}: InventoryAdjustmentDialogProps) {
  const [values, setValues] = useState<FormValues>({
    productId: seed?.product?.activo ? String(seed.product.producto_id) : '',
    storeId: seed?.storeId ? String(seed.storeId) : '',
    tipo: 'ENTRADA',
    cantidad: '',
    motivo: '',
  })
  const [productSearch, setProductSearch] = useState('')
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<AdjustmentField, string>>
  >({})
  const [confirmedAdjustment, setConfirmedAdjustment] =
    useState<InventoryAdjustmentInput | null>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const initialFocusRef = useRef<HTMLInputElement>(null)
  const submitLock = useRef(false)
  const normalizedSearch = productSearch.trim()
  const productsQuery = useQuery({
    queryKey: queryKeys.products.active(normalizedSearch),
    queryFn: async ({ signal }) =>
      (await listActiveProducts(normalizedSearch, { signal })).data,
  })

  const seedProduct = seed?.product
  const products = useMemo(() => {
    const activeProducts =
      productsQuery.data?.items.filter((product) => product.activo) ?? []
    const seedMatchesSearch =
      !normalizedSearch ||
      [seedProduct?.nombre, seedProduct?.sku].some((value) =>
        value?.toLocaleLowerCase().includes(normalizedSearch.toLocaleLowerCase()),
      )
    if (
      seedProduct?.activo &&
      seedMatchesSearch &&
      !activeProducts.some((product) => product.producto_id === seedProduct.producto_id)
    ) {
      return [seedProduct, ...activeProducts]
    }
    return activeProducts
  }, [normalizedSearch, productsQuery.data, seedProduct])

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    initialFocusRef.current?.focus()

    return () => previousFocus?.focus()
  }, [])

  useEffect(() => {
    if (!pending) {
      submitLock.current = false
    }
  }, [pending])

  function updateValue(field: AdjustmentField, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  function submit(input: InventoryAdjustmentInput) {
    if (pending || submitLock.current) {
      return
    }
    submitLock.current = true
    onSubmit(input)
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || submitLock.current) {
      return
    }

    setFieldErrors({})
    const parsed = adjustmentFormSchema.safeParse(values)
    const errors: Partial<Record<AdjustmentField, string>> = {}

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (
          (field === 'productId' ||
            field === 'tipo' ||
            field === 'cantidad' ||
            field === 'motivo') &&
          !errors[field]
        ) {
          errors[field] = issue.message
        }
      }
    }

    let storeId: number | undefined
    if (isAdmin) {
      const parsedStoreId = positiveIntegerField.safeParse(values.storeId)
      if (!parsedStoreId.success) {
        errors.storeId = 'Ingresa un ID de tienda entero positivo.'
      } else {
        storeId = parsedStoreId.data
      }
    }

    if (!parsed.success || Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    const adjustment: InventoryAdjustmentInput = {
      productId: parsed.data.productId,
      tipo: parsed.data.tipo,
      cantidad: parsed.data.cantidad,
      motivo: parsed.data.motivo,
      ...(isAdmin && storeId !== undefined ? { storeId } : {}),
    }

    if (adjustment.tipo === 'SALIDA') {
      setConfirmedAdjustment(adjustment)
      return
    }

    submit(adjustment)
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (!pending) {
        onClose()
      }
      return
    }
    if (event.key !== 'Tab' || !dialogRef.current) {
      return
    }

    const focusable = focusableElements(dialogRef.current)
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) {
      event.preventDefault()
      dialogRef.current.focus()
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const translatedError = error ? adjustmentError(error) : null
  const selectedProduct = products.find(
    (product) => product.producto_id === Number(values.productId),
  )
  const storeLabel = isAdmin
    ? `Tienda #${values.storeId || '—'}`
    : (seed?.storeName ?? `Tienda asignada (#${warehouseStoreId})`)

  return (
    <div
      className="adjustment-backdrop"
      onMouseDown={(event) => {
        if (!pending && event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        ref={dialogRef}
        className="adjustment-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adjustment-dialog-title"
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <header className="adjustment-dialog-heading">
          <div>
            <span className="inventory-overline">MOVIMIENTO MANUAL</span>
            <h2 id="adjustment-dialog-title">Ajustar stock</h2>
          </div>
          <button
            className="secondary-button"
            type="button"
            aria-label="Cerrar ajuste"
            disabled={pending}
            onClick={onClose}
          >
            Cerrar
          </button>
        </header>

        {translatedError && (
          <div className="inventory-error" role="alert">
            <strong>{translatedError.title}</strong>
            {translatedError.details.map((detail, index) => (
              <p key={`${index}-${detail}`}>{detail}</p>
            ))}
          </div>
        )}

        {confirmedAdjustment ? (
          <div className="adjustment-confirmation">
            <p>
              Confirma la salida de <strong>{confirmedAdjustment.cantidad}</strong>{' '}
              unidad(es) de{' '}
              <strong>{selectedProduct?.nombre ?? 'el producto seleccionado'}</strong>{' '}
              en <strong>{storeLabel}</strong>.
            </p>
            <p>El sistema no permitirá que el stock quede bajo cero.</p>
            <div className="adjustment-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={pending}
                onClick={() => setConfirmedAdjustment(null)}
              >
                Volver
              </button>
              <button
                className="primary-button"
                type="button"
                disabled={pending}
                onClick={() => submit(confirmedAdjustment)}
              >
                {pending ? 'Guardando…' : 'Confirmar salida'}
              </button>
            </div>
          </div>
        ) : (
          <form className="adjustment-form" onSubmit={handleFormSubmit} noValidate>
            <div className="inventory-filter">
              <label htmlFor="adjustment-product-search">Buscar producto activo</label>
              <input
                id="adjustment-product-search"
                ref={initialFocusRef}
                type="search"
                value={productSearch}
                disabled={pending}
                onChange={(event) => {
                  setProductSearch(event.target.value)
                  updateValue('productId', '')
                }}
                placeholder="Nombre o SKU"
              />
            </div>

            <div className="inventory-filter">
              <label htmlFor="adjustment-product">Producto activo</label>
              <select
                id="adjustment-product"
                value={values.productId}
                aria-invalid={Boolean(fieldErrors.productId)}
                aria-describedby={
                  fieldErrors.productId ? 'adjustment-product-error' : undefined
                }
                disabled={productsQuery.isPending || productsQuery.isError || pending}
                onChange={(event) => updateValue('productId', event.target.value)}
              >
                <option value="">Selecciona un producto</option>
                {products.map((product) => (
                  <option key={product.producto_id} value={product.producto_id}>
                    {product.nombre} · {product.sku}
                  </option>
                ))}
              </select>
              {fieldErrors.productId && (
                <span id="adjustment-product-error" className="adjustment-field-error">
                  {fieldErrors.productId}
                </span>
              )}
              {productsQuery.isPending && (
                <span role="status">Cargando productos activos…</span>
              )}
              {productsQuery.isError && (
                <span className="adjustment-field-error" role="alert">
                  No se pudieron cargar los productos activos.{' '}
                  <button type="button" onClick={() => void productsQuery.refetch()}>
                    Reintentar
                  </button>
                </span>
              )}
              {productsQuery.data?.total === 0 && products.length === 0 && (
                <span>No hay productos activos para seleccionar.</span>
              )}
              {productsQuery.data && productsQuery.data.total > products.length && (
                <span>
                  Hay más productos. Busca por nombre o SKU para encontrarlos.
                </span>
              )}
            </div>

            {isAdmin ? (
              <label className="inventory-filter">
                <span>ID de tienda</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={values.storeId}
                  disabled={pending}
                  aria-invalid={Boolean(fieldErrors.storeId)}
                  aria-describedby={
                    fieldErrors.storeId ? 'adjustment-store-error' : undefined
                  }
                  onChange={(event) => updateValue('storeId', event.target.value)}
                />
                {fieldErrors.storeId && (
                  <span id="adjustment-store-error" className="adjustment-field-error">
                    {fieldErrors.storeId}
                  </span>
                )}
              </label>
            ) : (
              <p className="adjustment-store-note">
                La operación se aplicará a tu tienda asignada (ID {warehouseStoreId}
                {seed?.storeName ? ` · ${seed.storeName}` : ''}).
              </p>
            )}

            <label className="inventory-filter">
              <span>Tipo de movimiento</span>
              <select
                value={values.tipo}
                disabled={pending}
                onChange={(event) => updateValue('tipo', event.target.value)}
              >
                <option value="ENTRADA">ENTRADA</option>
                <option value="SALIDA">SALIDA</option>
              </select>
            </label>

            <label className="inventory-filter">
              <span>Cantidad</span>
              <input
                type="number"
                min="1"
                step="1"
                value={values.cantidad}
                disabled={pending}
                aria-invalid={Boolean(fieldErrors.cantidad)}
                aria-describedby={
                  fieldErrors.cantidad ? 'adjustment-quantity-error' : undefined
                }
                onChange={(event) => updateValue('cantidad', event.target.value)}
              />
              {fieldErrors.cantidad && (
                <span id="adjustment-quantity-error" className="adjustment-field-error">
                  {fieldErrors.cantidad}
                </span>
              )}
            </label>

            <div className="inventory-filter">
              <label htmlFor="adjustment-reason">Motivo</label>
              <textarea
                id="adjustment-reason"
                rows={3}
                value={values.motivo}
                disabled={pending}
                aria-invalid={Boolean(fieldErrors.motivo)}
                aria-describedby={
                  fieldErrors.motivo ? 'adjustment-reason-error' : undefined
                }
                onChange={(event) => updateValue('motivo', event.target.value)}
              />
              {fieldErrors.motivo && (
                <span id="adjustment-reason-error" className="adjustment-field-error">
                  {fieldErrors.motivo}
                </span>
              )}
              <span>{values.motivo.trim().length}/255 caracteres</span>
            </div>

            <div className="adjustment-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={pending}
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                className="primary-button"
                type="submit"
                disabled={pending || productsQuery.isPending || productsQuery.isError}
              >
                {pending
                  ? 'Guardando…'
                  : values.tipo === 'SALIDA'
                    ? 'Continuar'
                    : 'Registrar entrada'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
