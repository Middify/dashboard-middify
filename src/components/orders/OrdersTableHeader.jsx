import PropTypes from "prop-types";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";

const OrdersTableHeader = ({
  selectedCount,
  onDeleteSelected,
  isDeleting,
}) => {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Órdenes</h1>
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onDeleteSelected}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <CircularProgress size={16} color="error" />
                  Eliminando...
                </>
              ) : (
                <>
                  <DeleteIcon fontSize="small" />
                  Eliminar seleccionadas ({selectedCount})
                </>
              )}
            </button>
          )}
          <div className="w-full max-w-md">
            <label className="relative block">
              <span className="sr-only">Buscar órdenes</span>
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <SearchIcon fontSize="small" />
              </span>
              <input
                type="search"
                placeholder="Buscar en cualquier campo..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled
              />
            </label>
          </div>
        </div>
      </div>
    </header>
  );
};

OrdersTableHeader.propTypes = {
  selectedCount: PropTypes.number,
  onDeleteSelected: PropTypes.func,
  isDeleting: PropTypes.bool,
};

OrdersTableHeader.defaultProps = {
  selectedCount: 0,
  onDeleteSelected: () => {},
  isDeleting: false,
};

export default OrdersTableHeader;