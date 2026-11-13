export function InventoryPage() {
  return (
    <section className="page-section" aria-labelledby="inventory-title">
      <div className="eyebrow">
        <span className="eyebrow-line" />
        OPERACIONES
      </div>
      <h1 id="inventory-title">Inventario</h1>
      <p className="page-description">
        La consulta de existencias se conectará con la API en la siguiente etapa.
      </p>
      <div className="empty-placeholder">
        <span className="empty-mark" aria-hidden="true">
          +
        </span>
        <strong>Conexión de inventario en preparación</strong>
        <span>Esta sección estará disponible en la siguiente etapa.</span>
      </div>
    </section>
  )
}
