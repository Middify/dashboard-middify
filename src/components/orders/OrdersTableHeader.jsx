import PropTypes from "prop-types";

const OrdersTableHeader = ({ searchTerm, onSearchChange }) => {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Órdenes</h1>
        <div className="w-full max-w-md">
          <label className="relative block">
            <span className="sr-only">Buscar órdenes</span>
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 103.473 9.799l3.114 3.114a.75.75 0 101.06-1.06l-3.114-3.114A5.5 5.5 0 009 3.5zm-4 5.5a4 4 0 118 0 4 4 0 01-8 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Buscar en cualquier campo..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>
    </header>
  );
};

OrdersTableHeader.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

export default OrdersTableHeader;

