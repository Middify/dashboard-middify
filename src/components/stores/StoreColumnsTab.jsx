const StoreColumnsTab = ({
  columns = [],
  selectedCount = 0,
  allSelected = false,
  loadingColumns = false,
  saving = false,
  message = "",
  onToggleColumn = () => { },
  onToggleAllColumns = () => { },
  onSave = () => { },
}) => {
  return (
    <div className="p-3">
      <h2 className="text-xl font-semibold text-slate-900">
        Guardar columnas de ejemplo
      </h2>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <p>
          {selectedCount} de {columns.length} columnas con filtro activo.
        </p>
        <button
          type="button"
          onClick={onToggleAllColumns}
          disabled={loadingColumns}
          className="rounded-md border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {allSelected ? "Deseleccionar todas" : "Seleccionar todas"}
        </button>
      </div>

      {loadingColumns ? (
        <p className="mt-4 text-sm text-slate-500">
          Cargando configuración guardada...
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {columns.map((column) => (
            <li key={column.value}>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:border-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-catalina-blue-600 focus:ring-catalina-blue-500"
                  checked={Boolean(column.active)}
                  onChange={() => onToggleColumn(column.value)}
                />
                <span className="font-medium">{column.title}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={saving || loadingColumns}
        className="mt-4 rounded-lg bg-catalina-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-catalina-blue-500 disabled:cursor-not-allowed disabled:bg-catalina-blue-300"
      >
        {saving ? "Guardando..." : "Guardar columnas"}
      </button>
      {message && (
        <p className="mt-3 text-sm text-slate-700">
          {message}
        </p>
      )}
    </div>
  );
};

export default StoreColumnsTab;

