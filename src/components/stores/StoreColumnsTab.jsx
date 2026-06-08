import TuneIcon from "@mui/icons-material/Tune";
const StoreColumnsTab = ({
  columns = [],
  selectedCount = 0,
  allSelected = false,
  loadingColumns = false,
  saving = false,
  message = "",
  onToggleColumn = () => {},
  onToggleAllColumns = () => {},
  onSave = () => {},
}) => {
  return (
    <div className="p-3">
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-catalina-blue-100 bg-catalina-blue-50/50 p-4 shadow-sm transition-all">
        <div className="mt-0.5 shrink-0 rounded-lg bg-catalina-blue-100 p-1.5 text-catalina-blue-700">
          <TuneIcon fontSize="small" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-base font-bold text-catalina-blue-900">
            Personaliza tus columnas de Órdenes
          </h1>
          <p className="text-s text-catalina-blue-800/80">
            Desmarca la información que no necesites ver para tener un panel más
            limpio en la vista de órdenes.
            <span className="ml-1 font-semibold text-catalina-blue-700">
              Tus datos no se borrarán del sistema.
            </span>
          </p>
        </div>
      </div>

      {/* CONTADORES Y BOTÓN DE SELECCIÓN RÁPIDA */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <p>
          <span className="font-semibold text-slate-700">{selectedCount}</span>{" "}
          de {columns.length} columnas activas.
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

      {/* GRILLA DE CASILLAS */}
      {loadingColumns ? (
        <p className="mt-4 text-sm text-slate-500">
          Cargando configuración guardada...
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {columns.map((column) => (
            <li key={column.value}>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-colors hover:border-catalina-blue-300 hover:bg-white cursor-pointer">
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

      {/* FOOTER Y BOTÓN DE GUARDADO */}
      <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col items-start gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || loadingColumns}
          className="rounded-lg bg-catalina-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-catalina-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
        {/* El componente padre (StoreDetail) ya muestra los mensajes globales arriba, pero dejamos este por seguridad si manda un mensaje local */}
        {/*{message && (
          <p className="text-sm font-medium text-slate-700">{message}</p>
        )}*/}
      </div>
    </div>
  );
};

export default StoreColumnsTab;
