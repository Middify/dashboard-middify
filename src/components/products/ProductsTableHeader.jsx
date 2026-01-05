import PropTypes from "prop-types";
import { useState, useCallback } from "react";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import SyncIcon from "@mui/icons-material/Sync";
import WarningIcon from "@mui/icons-material/Warning";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
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
import { alertsProducts } from "../../utils/alertsProducts";
import SearchBar from "../common/SearchBar";
import { lazy, Suspense } from "react";

// Carga perezosa de modales para optimizar el bundle inicial
const ImportProductsModal = lazy(() => import("./ImportProductsModal"));
const SyncSkuModal = lazy(() => import("./SyncSkuModal"));

const PRODUCT_STATES = [
    { value: "created", label: "Creada" },
    { value: "failed", label: "Error" },
    { value: "success", label: "Procesada" },
];

// Funciones de normalización
const normalizeUser = (user) => ({
    email: user?.email || user?.mail || user?.username || "usuario",
    name: user?.name || user?.username || user?.email || user?.mail || "usuario",
});

const validateSelection = (getSelectedProductIds) => {
    if (!getSelectedProductIds || typeof getSelectedProductIds !== "function") {
        throw new Error("No se puede obtener la lista de productos seleccionados.");
    }
    const ids = getSelectedProductIds();
    if (ids.length === 0) {
        throw new Error("Selecciona al menos un producto.");
    }
    return ids;
};

const validateAuth = (token, user) => {
    if (!token) throw new Error("No hay token de autenticación disponible.");
    if (!user) throw new Error("No hay información de usuario disponible.");
};

// Componente de botón reutilizable
const ActionButton = ({
    icon: Icon,
    label,
    onClick,
    disabled,
    variant = "default",
    loading,
    loadingLabel,
    className = "",
    ...props
}) => {
    const variants = {
        default: "border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 focus:ring-indigo-500",
        danger: "border-red-200 text-red-600 hover:border-red-500 hover:bg-red-50 hover:text-red-700 focus:ring-red-500",
        success: "border-slate-200 text-slate-700 hover:border-green-500 hover:text-green-600 focus:ring-green-500",
        primary: "border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 focus:ring-indigo-500",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`flex w-full items-center justify-center gap-1.5 rounded-lg border bg-white px-2.5 py-1 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${variants[variant]} ${className}`}
            {...props}
        >
            {loading ? (
                <>
                    <CircularProgress size={14} />
                    {loadingLabel}
                </>
            ) : (
                <>
                    {Icon && <Icon className="text-[16px]" />}
                    {label}
                </>
            )}
        </button>
    );
};

ActionButton.propTypes = {
    icon: PropTypes.elementType,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    variant: PropTypes.oneOf(["default", "danger", "success", "primary"]),
    loading: PropTypes.bool,
    loadingLabel: PropTypes.string,
    className: PropTypes.string,
};

const ProductsTableHeader = ({
    title = "Productos",
    subtitle,
    infoChips = [],
    onExportData,
    isExportingData = false,
    exportDisabled = false,
    selectedCount = 0,
    getSelectedProductIds,
    token,
    user,
    onDeleteSuccess,
    tenantId,
    tenantName,
    searchTerm,
    onSearchChange,
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [selectedState, setSelectedState] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const hasSelection = selectedCount > 0;
    const canTriggerExport = typeof onExportData === "function" && !exportDisabled;
    const isLoading = isDeleting || isUpdating;

    // Función genérica para actualizar estado de productos
    const updateProductsState = useCallback(
        async (state) => {
            try {
                const selectedIds = validateSelection(getSelectedProductIds);
                validateAuth(token, user);

                const { email, name } = normalizeUser(user);
                await patchExportProducts({
                    token,
                    ids: selectedIds,
                    state,
                    user: name,
                    mailUser: email,
                });

                onDeleteSuccess?.();
                return { success: true, count: selectedIds.length };
            } catch (error) {
                console.error(`Error al actualizar productos:`, error);
                throw error;
            }
        },
        [getSelectedProductIds, token, user, onDeleteSuccess]
    );

    const handleUpdateState = useCallback(async () => {
        if (!selectedState) {
            alertsProducts.selectState();
            return;
        }

        setIsUpdating(true);
        try {
            const result = await updateProductsState(selectedState);
            setShowUpdateModal(false);
            setSelectedState("");
            alertsProducts.updateSuccess(result.count);
        } catch (error) {
            alertsProducts.updateError(error.message);
        } finally {
            setIsUpdating(false);
        }
    }, [selectedState, updateProductsState]);

    const handleDeleteClick = useCallback(() => {
        setShowDeleteModal(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        setShowDeleteModal(false);
        setIsDeleting(true);
        try {
            const result = await updateProductsState("discard");
            alertsProducts.deleteSuccess(result.count);
        } catch (error) {
            alertsProducts.deleteError(error.message);
        } finally {
            setIsDeleting(false);
        }
    }, [updateProductsState]);

    const handleModalSuccess = useCallback(
        (result) => {
            console.log("Operación exitosa:", result);
            onDeleteSuccess?.();
        },
        [onDeleteSuccess]
    );

    return (
        <div className="flex flex-col gap-4">
            {/* Encabezado Móvil Sticky */}
            <div className="sticky top-20 mt-2 z-40 md:hidden">
                <header className="mx-auto w-full min-w-full md:min-w-[70rem] max-w-full lg:max-w-[94rem] rounded-xl border-b border-slate-200 bg-white shadow-sm">
                    {/* Barra superior compacta */}
                    <div className="flex flex-col gap-2 px-4 py-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <h1 className="text-sm font-semibold text-slate-800 truncate">{title}</h1>
                                {selectedCount > 0 && (
                                    <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                        {selectedCount}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                            >
                                {isMobileMenuOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
                            </button>
                        </div>
                        
                        {/* Buscador Móvil */}
                        <SearchBar 
                            value={searchTerm}
                            onChange={onSearchChange}
                            placeholder="Buscar SKU, nombre..."
                            className="bg-slate-50 border-slate-100"
                        />
                    </div>

                    {/* Menú desplegable de acciones */}
                    {isMobileMenuOpen && (
                        <div className="border-t border-slate-100 bg-slate-50 p-2">
                            <div className="flex flex-col gap-1.5">
                                {hasSelection && (
                                    <>
                                        <ActionButton
                                            icon={EditIcon}
                                            label="Cambiar Estado"
                                            onClick={() => {
                                                setShowUpdateModal(true);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            disabled={isLoading}
                                            variant="default"
                                            className="w-full"
                                        />
                                        <ActionButton
                                            icon={DeleteOutlineIcon}
                                            label={`Eliminar (${selectedCount})`}
                                            onClick={() => {
                                                handleDeleteClick();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            disabled={isLoading}
                                            variant="danger"
                                            loading={isDeleting}
                                            loadingLabel="Eliminando..."
                                            className="w-full"
                                            aria-label={`Eliminar ${selectedCount} producto(s) seleccionado(s)`}
                                        />
                                    </>
                                )}
                                <ActionButton
                                    icon={FileUploadOutlinedIcon}
                                    label="Importar"
                                    onClick={() => {
                                        setShowImportModal(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    variant="success"
                                    className="w-full"
                                    aria-label="Importar productos desde archivo"
                                />
                                <ActionButton
                                    icon={SyncIcon}
                                    label="Sincronizar SKU"
                                    onClick={() => {
                                        setShowSyncModal(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    variant="primary"
                                    className="w-full"
                                    aria-label="Sincronizar SKU"
                                />
                                <ActionButton
                                    icon={FileDownloadOutlinedIcon}
                                    label="Exportar"
                                    onClick={() => {
                                        onExportData?.();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    disabled={!canTriggerExport || isExportingData}
                                    variant="default"
                                    loading={isExportingData}
                                    loadingLabel="Exportando..."
                                    className="w-full"
                                    aria-label="Exportar productos a Excel"
                                />
                            </div>
                        </div>
                    )}
                </header>
            </div>

            {/* Encabezado Escritorio */}
            <header className="hidden md:block mx-auto w-full min-w-full md:min-w-[70rem] max-w-full lg:max-w-[94rem] rounded-xl mt-2 border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-baseline gap-2">
                            <h1 className="text-base font-semibold text-slate-800">{title}</h1>
                            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                        </div>
                        {infoChips.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 text-xs font-medium text-slate-600">
                                {infoChips.map((chip) => (
                                    <div
                                        key={chip.id}
                                        className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5"
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
                        )}
                    </div>

                    <div className="mt-2 grid w-full grid-cols-2 gap-1.5 sm:flex sm:flex-row sm:items-center sm:justify-end">
                        {hasSelection && (
                            <>
                                <ActionButton
                                    icon={EditIcon}
                                    label="Cambiar Estado"
                                    onClick={() => setShowUpdateModal(true)}
                                    disabled={isLoading}
                                    variant="default"
                                />
                                <ActionButton
                                    icon={DeleteOutlineIcon}
                                    label={`Eliminar (${selectedCount})`}
                                    onClick={handleDeleteClick}
                                    disabled={isLoading}
                                    variant="danger"
                                    loading={isDeleting}
                                    loadingLabel="Eliminando..."
                                    aria-label={`Eliminar ${selectedCount} producto(s) seleccionado(s)`}
                                />
                            </>
                        )}
                        <ActionButton
                            icon={FileUploadOutlinedIcon}
                            label="Importar"
                            onClick={() => setShowImportModal(true)}
                            variant="success"
                            aria-label="Importar productos desde archivo"
                        />
                        <ActionButton
                            icon={SyncIcon}
                            label="Sincronizar SKU"
                            onClick={() => setShowSyncModal(true)}
                            variant="primary"
                            aria-label="Sincronizar SKU"
                        />
                        <ActionButton
                            icon={FileDownloadOutlinedIcon}
                            label="Exportar"
                            onClick={onExportData}
                            disabled={!canTriggerExport || isExportingData}
                            variant="default"
                            loading={isExportingData}
                            loadingLabel="Exportando..."
                            aria-label="Exportar productos a Excel"
                        />
                    </div>
                </div>
            </header>

            {/* Buscador Global */}
            <div className="hidden md:block mx-auto w-full max-w-full lg:max-w-[94rem]">
                <SearchBar 
                    value={searchTerm}
                    onChange={onSearchChange}
                    placeholder="Buscar por SKU, nombre, tienda o bodega..."
                />
            </div>

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

            <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <DialogTitle className="flex items-center gap-2">
                    <WarningIcon className="text-red-600" />
                    Confirmar eliminación
                </DialogTitle>
                <DialogContent className="min-w-[300px] pt-4">
                    <p className="text-sm text-slate-700">
                        ¿Estás seguro de que deseas eliminar <strong>{selectedCount}</strong> producto(s)?
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                        Esta acción cambiará el estado a "discard" y los productos no se mostrarán en la tabla principal.
                    </p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteModal(false)} color="inherit" disabled={isDeleting}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteOutlineIcon />}
                    >
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Suspense fallback={null}>
                {showImportModal && (
                    <ImportProductsModal
                        open={showImportModal}
                        onClose={() => setShowImportModal(false)}
                        token={token}
                        tenantId={tenantId}
                        tenantName={tenantName}
                        onImportSuccess={handleModalSuccess}
                    />
                )}

                {showSyncModal && (
                    <SyncSkuModal
                        open={showSyncModal}
                        onClose={() => setShowSyncModal(false)}
                        token={token}
                        tenantId={tenantId}
                        tenantName={tenantName}
                        onSyncSuccess={handleModalSuccess}
                    />
                )}
            </Suspense>
        </div>
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
    tenantId: PropTypes.string,
    tenantName: PropTypes.string,
    searchTerm: PropTypes.string,
    onSearchChange: PropTypes.func,
};

export default ProductsTableHeader;
