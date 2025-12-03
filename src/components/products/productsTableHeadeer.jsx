import PropTypes from "prop-types";
import { useState } from "react";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import { patchExportProducts } from "../../api/products/patchStateProduct";
import ImportProductsModal from "./ImportProductsModal";

const PRODUCT_STATES = [
    { value: "created", label: "Creada" },
    { value: "failed", label: "Error" },
    { value: "success", label: "Procesada" },
];

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
    const [isUpdating, setIsUpdating] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedState, setSelectedState] = useState("");
    const hasSelection = selectedCount > 0;

    const handleUpdateState = async () => {
        if (!selectedState) {
            alert("Por favor selecciona un estado.");
            return;
        }

        if (!getSelectedProductIds || typeof getSelectedProductIds !== "function") {
            alert("Error: No se puede obtener la lista de productos seleccionados.");
            return;
        }

        const selectedIds = getSelectedProductIds();
        if (selectedIds.length === 0) {
            alert("Selecciona al menos un producto para actualizar.");
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

        setIsUpdating(true);
        try {
            const userEmail = user.email || user.mail || user.username || "usuario";
            const userName = user.name || user.username || userEmail;

            await patchExportProducts({
                token,
                ids: selectedIds,
                state: selectedState,
                user: userName,
                mailUser: userEmail,
            });

            if (typeof onDeleteSuccess === "function") {
                onDeleteSuccess(); // Reutilizamos el callback de éxito
            }
            setShowUpdateModal(false);
            setSelectedState("");
            alert(`${selectedIds.length} producto(s) actualizado(s) correctamente.`);
        } catch (err) {
            console.error("Error al actualizar productos:", err);
            alert(
                `Error al actualizar los productos: ${err.message || "Error desconocido"}`
            );
        } finally {
            setIsUpdating(false);
        }
    };

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
        <>
            <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
                        {subtitle ? (
                                <p className="text-xs text-slate-500">{subtitle}</p>
                        ) : null}
                    </div>
                    {Array.isArray(infoChips) && infoChips.length > 0 ? (
                            <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                            {infoChips.map((chip) => (
                                <div
                                    key={chip.id}
                                        className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1"
                                >
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400">
                                        {chip.label}
                                    </span>
                                    <span
                                            className={`text-xs font-semibold text-slate-700 ${chip.accentClass ?? ""}`}
                                    >
                                        {chip.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        {hasSelection && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setShowUpdateModal(true)}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    disabled={isUpdating || isDeleting}
                                >
                                    <EditIcon sx={{ fontSize: 16 }} />
                                    Cambiar Estado
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteSelected}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:border-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    disabled={isDeleting || isUpdating}
                                    aria-label={`Eliminar ${selectedCount} producto(s) seleccionado(s)`}
                                    title={`Eliminar ${selectedCount} producto(s) seleccionado(s)`}
                                >
                                    {isDeleting ? (
                                        <>
                                            <CircularProgress size={14} />
                                            Eliminando...
                                        </>
                                    ) : (
                                        <>
                                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                            Eliminar ({selectedCount})
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    <button
                        type="button"
                        onClick={() => setShowImportModal(true)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-green-500 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        aria-label="Importar productos desde archivo"
                        title="Importar productos desde archivo"
                    >
                        <FileUploadOutlinedIcon sx={{ fontSize: 16 }} />
                        Importar
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (!canTriggerExport || isExportingData) {
                                return;
                            }
                            onExportData();
                        }}
                            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-catalina-blue-500 hover:text-catalina-blue-600 focus:outline-none focus:ring-2 focus:ring-catalina-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        disabled={!canTriggerExport || isExportingData}
                        aria-label="Exportar productos a Excel"
                        title="Exportar productos a Excel"
                    >
                        {isExportingData ? (
                            <>
                                    <CircularProgress size={14} />
                                Exportando...
                            </>
                        ) : (
                            <>
                                    <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
                                Exportar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>

            <Dialog open={showUpdateModal} onClose={() => setShowUpdateModal(false)}>
                <DialogTitle>Cambiar estado de productos</DialogTitle>
                <DialogContent className="min-w-[300px] pt-4">
                    <p className="mb-4 text-sm text-slate-600">
                        Selecciona el nuevo estado para {selectedCount} producto(s).
                    </p>
                    <FormControl fullWidth size="small">
                        <InputLabel id="state-select-label">Nuevo Estado</InputLabel>
                        <Select
                            labelId="state-select-label"
                            value={selectedState}
                            label="Nuevo Estado"
                            onChange={(e) => setSelectedState(e.target.value)}
                        >
                            {PRODUCT_STATES.map((state) => (
                                <MenuItem key={state.value} value={state.value}>
                                    {state.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowUpdateModal(false)} color="inherit">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUpdateState}
                        variant="contained"
                        color="primary"
                        disabled={isUpdating || !selectedState}
                    >
                        {isUpdating ? "Actualizando..." : "Confirmar"}
                    </Button>
                </DialogActions>
            </Dialog>

            <ImportProductsModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
            />
        </>
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
