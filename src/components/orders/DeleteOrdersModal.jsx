import PropTypes from "prop-types";

const DeleteOrdersModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay con blur */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-4">
          {/* Icono de advertencia */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-6 w-6 text-red-600"
            >
              <path
                fillRule="evenodd"
                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.572.055-1.14.122-1.706.193C2.99 4.322 2.25 5.16 2.25 6.25v11.5A2.75 2.75 0 004.75 20h10.5A2.75 2.75 0 0017.75 17.25V6.25c0-1.09-.74-1.928-1.544-2.314a41.108 41.108 0 00-1.706-.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4.75c-.41 0-.75.34-.75.75v.5h1.5v-.5c0-.41-.34-.75-.75-.75zM4.75 6.5c-.41 0-.75.34-.75.75v10.5c0 .41.34.75.75.75h10.5c.41 0 .75-.34.75-.75V7.25c0-.41-.34-.75-.75-.75H4.75z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Contenido */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">
              Confirmar eliminación
            </h3>
            <div className="mt-2">
              <p className="text-sm text-slate-600">
                ¿Estás seguro de que deseas eliminar{" "}
                <span className="font-semibold text-slate-900">
                  {selectedCount}
                </span>{" "}
                {selectedCount === 1 ? "orden seleccionada" : "órdenes seleccionadas"}
                ?
              </p>

            </div>

            {/* Botones */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.572.055-1.14.122-1.706.193C2.99 4.322 2.25 5.16 2.25 6.25v11.5A2.75 2.75 0 004.75 20h10.5A2.75 2.75 0 0017.75 17.25V6.25c0-1.09-.74-1.928-1.544-2.314a41.108 41.108 0 00-1.706-.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4.75c-.41 0-.75.34-.75.75v.5h1.5v-.5c0-.41-.34-.75-.75-.75zM4.75 6.5c-.41 0-.75.34-.75.75v10.5c0 .41.34.75.75.75h10.5c.41 0 .75-.34.75-.75V7.25c0-.41-.34-.75-.75-.75H4.75z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DeleteOrdersModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  selectedCount: PropTypes.number.isRequired,
  isDeleting: PropTypes.bool,
};

DeleteOrdersModal.defaultProps = {
  isDeleting: false,
};

export default DeleteOrdersModal;

