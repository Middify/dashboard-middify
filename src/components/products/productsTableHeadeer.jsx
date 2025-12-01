import PropTypes from "prop-types";
import { useState } from "react";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CircularProgress from "@mui/material/CircularProgress";
import { patchExportProducts } from "../../api/products/patchStateProduct";

const ProductsTableHeader = ({
    title,
    subtitle,
    infoChips,
    onExportData,
    isExportingData,
    exportDisabled,
    selectedCount,
    getSelectedProductIds,
    token,
    user,
    onDeleteSuccess,
}) => {
    const canTriggerExport = typeof onExportData === "function" && !exportDisabled;
    const [isDeleting, setIsDeleting] = useState(false);
    const hasSelection = selectedCount > 0;

    const handleDeleteSelected = async () => {
        if (!getSelectedProductIds || typeof getSelectedProductIds !== "function") {
            alert("Error: No se puede obtener la lista de productos seleccionados.");
            return;
        }

        const selectedIds = getSelectedProductIds();
        if (selectedIds.length === 0) {
            alert("Selecciona al menos un producto para eliminar.");
            return;
        }

        if (!token) {
            alert("Error: No hay token de autenticación disponible.");
            return;
        }

        if (!user) {
            alert("Error: No hay información de usuario disponible.");
            return;
        }

        const confirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar ${selectedIds.length} producto(s)? Esta acción cambiará el estado a "discard".`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        try {
            const userEmail = user.email || user.mail || user.username || "usuario";
            const userName = user.name || user.username || userEmail;

            console.log("Eliminando productos:", {
                ids: selectedIds,
                state: "discard",
                user: userName,
                mailUser: userEmail,
                token: token ? "presente" : "ausente",
            });

            const response = await patchExportProducts({
                token,
                ids: selectedIds,
                state: "discard",
                user: userName,
                mailUser: userEmail,
            });

            console.log("Respuesta de eliminación:", response);

            if (typeof onDeleteSuccess === "function") {
                onDeleteSuccess();
            }
            alert(`${selectedIds.length} producto(s) eliminado(s) correctamente.`);
        } catch (err) {
            console.error("Error al eliminar productos:", err);
            console.error("Detalles del error:", {
                message: err.message,
                name: err.name,
                stack: err.stack,
            });
            alert(
                `Error al eliminar los productos: ${err.message || "Error desconocido"}`
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
                        {subtitle ? (
                            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                        ) : null}
                    </div>
                    {Array.isArray(infoChips) && infoChips.length > 0 ? (
                        <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-600">
                            {infoChips.map((chip) => (
                                <div
                                    key={chip.id}
                                    className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2"
                                >
                                    <span className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                                        {chip.label}
                                    </span>
                                    <span
                                        className={`text-sm font-semibold text-slate-700 ${chip.accentClass ?? ""}`}
                                    >
                                        {chip.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
                <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                    {hasSelection && (
                        <button
                            type="button"
                            onClick={handleDeleteSelected}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:border-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            disabled={isDeleting}
                            aria-label={`Eliminar ${selectedCount} producto(s) seleccionado(s)`}
                            title={`Eliminar ${selectedCount} producto(s) seleccionado(s)`}
                        >
                            {isDeleting ? (
                                <>
                                    <CircularProgress size={16} />
                                    Eliminando...
                                </>
                            ) : (
                                <>
                                    <DeleteOutlineIcon fontSize="small" />
                                    Eliminar ({selectedCount})
                                </>
                            )}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            if (!canTriggerExport || isExportingData) {
                                return;
                            }
                            onExportData();
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-catalina-blue-500 hover:text-catalina-blue-600 focus:outline-none focus:ring-2 focus:ring-catalina-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        disabled={!canTriggerExport || isExportingData}
                        aria-label="Exportar productos a Excel"
                        title="Exportar productos a Excel"
                    >
                        {isExportingData ? (
                            <>
                                <CircularProgress size={16} />
                                Exportando...
                            </>
                        ) : (
                            <>
                                <FileDownloadOutlinedIcon fontSize="small" />
                                Exportar Excel
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

ProductsTableHeader.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    infoChips: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            accentClass: PropTypes.string,
        })
    ),
    onExportData: PropTypes.func,
    isExportingData: PropTypes.bool,
    exportDisabled: PropTypes.bool,
    selectedCount: PropTypes.number,
    getSelectedProductIds: PropTypes.func,
    token: PropTypes.string,
    user: PropTypes.object,
    onDeleteSuccess: PropTypes.func,
};

ProductsTableHeader.defaultProps = {
    title: "Productos",
    subtitle: "",
    infoChips: [],
    onExportData: undefined,
    isExportingData: false,
    exportDisabled: false,
    selectedCount: 0,
    getSelectedProductIds: undefined,
    token: null,
    user: null,
    onDeleteSuccess: undefined,
};

export default ProductsTableHeader;
