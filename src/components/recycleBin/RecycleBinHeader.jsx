import PropTypes from "prop-types";
import { Tabs, Tab, Box, CircularProgress } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

const numberFormatter = new Intl.NumberFormat("es-CL");

const RecycleBinHeader = ({
    activeTab,
    onTabChange,
    ordersCount,
    productsCount,

    ordersSelectedCount = 0,
    ordersTotalCount = 0,
    ordersOnChangeState,
    ordersIsProcessing = false,
    ordersStateOptions = [],
    ordersSelectedState = "",
    ordersOnExportData,
    ordersIsExportingData = false,
    ordersExportDisabled = false,
    ordersOnExportSelectedData,
    ordersIsExportingSelectedData = false,
    ordersExportSelectedDisabled = false,

    productsSelectedCount = 0,
    productsTotalCount = 0,
    productsOnRestore,
    productsIsRestoring = false,
}) => {
    const hasOrdersSelection = ordersSelectedCount > 0;
    const hasProductsSelection = productsSelectedCount > 0;

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-100 p-2">
                        <DeleteOutlineIcon className="text-red-600 text-[28px]" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-slate-800">
                            Papelera de Reciclaje
                        </h1>
                        <p className="text-xs text-slate-500">
                            Elementos eliminados que pueden ser restaurados
                        </p>
                    </div>
                </div>
            </div>

            <Box className="border-b border-slate-200 mt-3">
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => onTabChange(newValue)}
                    aria-label="Papelera de reciclaje tabs"
                    className="[&_.MuiTab-root]:normal-case [&_.MuiTab-root]:font-semibold [&_.MuiTab-root]:text-sm [&_.MuiTab-root]:min-h-[40px] [&_.Mui-selected]:text-red-600 [&_.MuiTabs-indicator]:bg-red-600"
                >
                    <Tab
                        label={
                            <span className="flex items-center gap-2">
                                Órdenes
                                {ordersCount > 0 && (
                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                        {ordersCount}
                                    </span>
                                )}
                            </span>
                        }
                        value="orders"
                    />
                    <Tab
                        label={
                            <span className="flex items-center gap-2">
                                Productos
                                {productsCount > 0 && (
                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                        {productsCount}
                                    </span>
                                )}
                            </span>
                        }
                        value="products"
                    />
                </Tabs>
            </Box>

            <div className="mt-4 flex flex-col border-slate-200 pt-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Info chips */}
                <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                    {activeTab === "orders" && (
                        <>
                            {hasOrdersSelection && (
                                <div className="flex items-center gap-1.5 rounded-lg bg-indigo-100 px-2.5 py-1">
                                    <span className="text-[10px] uppercase tracking-wider text-indigo-400">
                                        Seleccionados
                                    </span>
                                    <span className="text-xs font-semibold text-indigo-700">
                                        {ordersSelectedCount}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                    {activeTab === "products" && (
                        <>
                            {hasProductsSelection && (
                                <div className="flex items-center gap-1.5 rounded-lg bg-indigo-100 px-2.5 py-1">
                                    <span className="text-[10px] uppercase tracking-wider text-indigo-400">
                                        Seleccionados
                                    </span>
                                    <span className="text-xs font-semibold text-indigo-700">
                                        {productsSelectedCount}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Botones de acción */}
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    {activeTab === "orders" && (
                        <>
                            {hasOrdersSelection && (
                                <>
                                    <label className="block text-sm font-medium text-slate-700 sm:hidden">
                                        Cambiar estado
                                    </label>
                                    <div className="relative w-full sm:w-auto sm:min-w-[200px]">
                                        <select
                                            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-10 text-xs text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                                            onChange={(event) => {
                                                if (ordersOnChangeState) {
                                                    ordersOnChangeState(event.target.value);
                                                }
                                            }}
                                            value={ordersSelectedState}
                                            disabled={
                                                ordersIsProcessing ||
                                                ordersStateOptions.length === 0
                                            }
                                        >
                                            <option value="">Seleccionar estado…</option>
                                            {ordersStateOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {ordersIsProcessing && (
                                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-indigo-500">
                                                <CircularProgress size={14} />
                                            </span>
                                        )}
                                    </div>
                                    {ordersOnExportSelectedData && (
                                        <button
                                            type="button"
                                            onClick={ordersOnExportSelectedData}
                                            disabled={ordersIsExportingSelectedData || ordersExportSelectedDisabled}
                                            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                        >
                                            {ordersIsExportingSelectedData ? (
                                                <>
                                                    <CircularProgress size={14} />
                                                    Exportando...
                                                </>
                                            ) : (
                                                <>
                                                    <FileDownloadOutlinedIcon className="text-[16px]" />
                                                    Exportar Selección
                                                </>
                                            )}
                                        </button>
                                    )}
                                </>
                            )}
                            {ordersOnExportData && (
                                <button
                                    type="button"
                                    onClick={ordersOnExportData}
                                    disabled={ordersIsExportingData || ordersExportDisabled}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {ordersIsExportingData ? (
                                        <>
                                            <CircularProgress size={14} />
                                            Exportando...
                                        </>
                                    ) : (
                                        <>
                                            <FileDownloadOutlinedIcon className="text-[16px]" />
                                            Exportar Todo
                                        </>
                                    )}
                                </button>
                            )}
                        </>
                    )}

                    {activeTab === "products" && (
                        <>
                            {hasProductsSelection && productsOnRestore && (
                                <button
                                    type="button"
                                    onClick={productsOnRestore}
                                    disabled={productsIsRestoring}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-white px-3 py-1.5 text-xs font-semibold text-green-600 shadow-sm transition hover:border-green-500 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {productsIsRestoring ? (
                                        <>
                                            <CircularProgress size={14} />
                                            Restaurando...
                                        </>
                                    ) : (
                                        <>
                                            Restaurar ({productsSelectedCount})
                                        </>
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

RecycleBinHeader.propTypes = {
    activeTab: PropTypes.oneOf(["orders", "products"]).isRequired,
    onTabChange: PropTypes.func.isRequired,
    ordersCount: PropTypes.number,
    productsCount: PropTypes.number,
    // Props para órdenes
    ordersSelectedCount: PropTypes.number,
    ordersTotalCount: PropTypes.number,
    ordersOnChangeState: PropTypes.func,
    ordersIsProcessing: PropTypes.bool,
    ordersStateOptions: PropTypes.array,
    ordersSelectedState: PropTypes.string,
    ordersOnExportData: PropTypes.func,
    ordersIsExportingData: PropTypes.bool,
    ordersExportDisabled: PropTypes.bool,
    ordersOnExportSelectedData: PropTypes.func,
    ordersIsExportingSelectedData: PropTypes.bool,
    ordersExportSelectedDisabled: PropTypes.bool,
    // Props para productos
    productsSelectedCount: PropTypes.number,
    productsTotalCount: PropTypes.number,
    productsOnRestore: PropTypes.func,
    productsIsRestoring: PropTypes.bool,
};

RecycleBinHeader.defaultProps = {
    ordersCount: 0,
    productsCount: 0,
    ordersSelectedCount: 0,
    ordersTotalCount: 0,
    ordersOnChangeState: null,
    ordersIsProcessing: false,
    ordersStateOptions: [],
    ordersSelectedState: "",
    ordersOnExportData: null,
    ordersIsExportingData: false,
    ordersExportDisabled: false,
    ordersOnExportSelectedData: null,
    ordersIsExportingSelectedData: false,
    ordersExportSelectedDisabled: false,
    productsSelectedCount: 0,
    productsTotalCount: 0,
    productsOnRestore: null,
    productsIsRestoring: false,
};

export default RecycleBinHeader;



