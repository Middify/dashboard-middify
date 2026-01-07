import { useMemo, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { useProducts } from "../../api/products/getProducts";
import { patchExportProducts } from "../../api/products/patchStateProduct";
import { alertsProducts } from "../../utils/alertsProducts";

const numberFormatter = new Intl.NumberFormat("es-CL");

const NoRowsOverlay = () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
        No hay productos eliminados.
    </div>
);

const RecycleBinProductsTab = ({
    token,
    selectedTenantId,
    user,
    onHeaderPropsChange,
}) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedRowIds, setSelectedRowIds] = useState(() => new Set());
    const [isUpdating, setIsUpdating] = useState(false);

    const { products, loading, error } = useProducts({
        token,
        tenantId: selectedTenantId,
        refreshTrigger,
        state: "discarded"
    });

    const rows = useMemo(() => {
        if (!Array.isArray(products)) {
            return [];
        }
        return products
            .filter((product) => {
                const state = String(product.state || "").toLowerCase();
                return state === "discard" || state === "discarded";
            })
            .map((product, index) => ({
                id: product._id || index,
                ...product,
            }));
    }, [products]);

    const handleToggleRowSelection = useCallback((rowId) => {
        setSelectedRowIds((prevSelected) => {
            const nextSelected = new Set(prevSelected);
            if (nextSelected.has(rowId)) {
                nextSelected.delete(rowId);
            } else {
                nextSelected.add(rowId);
            }
            return nextSelected;
        });
    }, []);

    const allRowIds = useMemo(() => rows.map((row) => row.id), [rows]);

    useEffect(() => {
        setSelectedRowIds((prevSelected) => {
            const nextSelected = new Set();
            rows.forEach((row) => {
                if (prevSelected.has(row.id)) {
                    nextSelected.add(row.id);
                }
            });
            return nextSelected;
        });
    }, [rows]);

    const allSelected = useMemo(() => {
        if (allRowIds.length === 0) {
            return false;
        }
        return allRowIds.every((id) => selectedRowIds.has(id));
    }, [allRowIds, selectedRowIds]);

    const handleToggleAllRows = useCallback(() => {
        setSelectedRowIds((prevSelected) => {
            if (allSelected) {
                return new Set();
            }
            return new Set(allRowIds);
        });
    }, [allSelected, allRowIds]);

    const columns = useMemo(() => {
        const selectColumn = {
            field: "select",
            headerName: "",
            width: 52,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderHeader: () => (
                <input
                    type="checkbox"
                    aria-label="Seleccionar todos los productos eliminados"
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={allSelected}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => {
                        event.stopPropagation();
                        handleToggleAllRows();
                    }}
                />
            ),
            align: "center",
            headerAlign: "center",
            renderCell: ({ row }) => {
                const isChecked = selectedRowIds.has(row.id);
                return (
                    <input
                        type="checkbox"
                        aria-label={`Seleccionar producto ${row._id ?? row.id}`}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={isChecked}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => {
                            event.stopPropagation();
                            handleToggleRowSelection(row.id);
                        }}
                    />
                );
            },
        };

        const dataColumns = [
            { field: "sku", headerName: "SKU", width: 150 },
            { field: "name", headerName: "Nombre", width: 250 },
            { field: "tenantName", headerName: "Tenant", width: 150 },
            { field: "warehouse", headerName: "Bodega", width: 150 },
            { field: "quantity", headerName: "Cantidad", width: 100, type: "number" },
            {
                field: "updatedDate",
                headerName: "Fecha eliminación",
                width: 180,
                renderCell: ({ value }) => {
                    if (!value) return <span className="text-sm text-slate-500">—</span>;
                    try {
                        return (
                            <span className="text-sm text-slate-700">
                                {new Date(value).toLocaleString("es-CL")}
                            </span>
                        );
                    } catch {
                        return <span className="text-sm text-slate-500">—</span>;
                    }
                },
            },
        ];

        return [selectColumn, ...dataColumns];
    }, [allSelected, handleToggleAllRows, handleToggleRowSelection, selectedRowIds]);

    const selectedCount = selectedRowIds.size;

    const handleUpdateState = useCallback(async (nextState) => {
        if (!nextState) return;
        
        setIsUpdating(true);
        try {
            const ids = Array.from(selectedRowIds);
            const mailUser = user?.email || user?.mail || user?.username || "usuario";
            const userName = user?.name || user?.username || user?.email || user?.mail || "usuario";

            await patchExportProducts({
                token,
                ids,
                state: nextState,
                user: userName,
                mailUser: mailUser,
            });

            alertsProducts.updateSuccess(ids.length);
            setSelectedRowIds(new Set());
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            console.error("Error al actualizar productos:", err);
            alertsProducts.updateError(err.message);
        } finally {
            setIsUpdating(false);
        }
    }, [selectedRowIds, token, user, refreshTrigger]);

    useEffect(() => {
        if (typeof onHeaderPropsChange === "function") {
            onHeaderPropsChange({
                productsSelectedCount: selectedCount,
                productsTotalCount: rows.length,
                productsOnChangeState: selectedCount > 0 ? handleUpdateState : null,
                productsIsProcessing: isUpdating,
            });
        }
    }, [selectedCount, rows.length, handleUpdateState, isUpdating, onHeaderPropsChange]);

    if (error && !loading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-red-500">
                Error al cargar los productos eliminados: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="p-4">
                    <div className="overflow-x-auto">
                        <div className="mx-auto w-full min-w-full md:min-w-[70rem] max-w-full lg:max-w-[94rem]">
                            <Paper
                                elevation={0}
                                className="w-full rounded-2xl shadow-none overflow-hidden"
                            >
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    loading={loading}
                                    autoHeight
                                    paginationMode="client"
                                    initialState={{
                                        pagination: {
                                            paginationModel: { pageSize: 25, page: 0 },
                                        },
                                    }}
                                    pageSizeOptions={[25, 50, 100]}
                                    disableRowSelectionOnClick
                                    disableColumnMenu
                                    disableColumnSelector
                                    disableDensitySelector
                                    localeText={{
                                        footerPaginationRowsPerPage: "Filas por página:",
                                    }}
                                    slots={{
                                        noRowsOverlay: NoRowsOverlay,
                                    }}
                                    sx={{
                                        border: 0,
                                        "--DataGrid-containerBackground": "transparent",
                                        "& .MuiDataGrid-columnHeaders": {
                                            backgroundColor: "#f8fafc",
                                        },
                                        "& .MuiDataGrid-columnHeaderTitle": {
                                            fontWeight: 600,
                                            fontSize: "0.75rem",
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                            color: "#475569",
                                        },
                                        "& .MuiDataGrid-row:hover": {
                                            backgroundColor: "#fef2f2",
                                        },
                                        "& .MuiDataGrid-cell": {
                                            borderBottomColor: "#e2e8f0",
                                        },
                                        "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within":
                                            {
                                                outline: "none",
                                            },
                                    }}
                                />
                            </Paper>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

RecycleBinProductsTab.propTypes = {
    token: PropTypes.string,
    selectedTenantId: PropTypes.string,
    user: PropTypes.object,
    onHeaderPropsChange: PropTypes.func,
};

RecycleBinProductsTab.defaultProps = {
    token: null,
    selectedTenantId: null,
    user: null,
    onHeaderPropsChange: null,
};

export default RecycleBinProductsTab;

