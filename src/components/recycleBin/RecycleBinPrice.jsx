import { useMemo, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { usePrice } from "../../api/price/getPrice";
import { patchExportProducts } from "../../api/products/patchStateProduct";
import { alertsProducts } from "../../utils/alertsProducts";

const NoRowsOverlay = () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
        No hay precios eliminados en la papelera.
    </div>
);

const RecycleBinPrice = ({
    token,
    user,
    onHeaderPropsChange,
}) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedRowIds, setSelectedRowIds] = useState(() => new Set());
    const [isUpdating, setIsUpdating] = useState(false);

    const { products, loading, error } = usePrice({
        token,
        refreshTrigger,
        state: "discarded"
    });

    const rows = useMemo(() => {
        if (!Array.isArray(products)) {
            return [];
        }
        // Filtrar por estado 'discard' o 'discarded' (case-insensitive)
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
            { field: "tenantName", headerName: "Tienda", width: 150 },
            { 
                field: "price", 
                headerName: "Precio", 
                width: 200,
                renderCell: ({ value }) => {
                    if (!value) return '-';
                    if (typeof value === 'object') {
                        const vta = value.precioVta ? `$${parseFloat(value.precioVta).toLocaleString('es-ES')}` : '';
                        const bol = value.PrecioBol ? `$${parseFloat(value.PrecioBol).toLocaleString('es-ES')}` : '';
                        if (vta && bol) return `${vta} / ${bol}`;
                        return vta || bol || '-';
                    }
                    return typeof value === 'number' ? `$${value.toLocaleString('es-ES')}` : String(value);
                }
            },
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
            }
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
            console.error("Error al actualizar precios:", err);
            alertsProducts.updateError(err.message);
        } finally {
            setIsUpdating(false);
        }
    }, [selectedRowIds, token, user, refreshTrigger]);

    useEffect(() => {
        if (typeof onHeaderPropsChange === "function") {
            onHeaderPropsChange({
                priceSelectedCount: selectedCount,
                priceTotalCount: rows.length,
                priceOnChangeState: selectedCount > 0 ? handleUpdateState : null,
                priceIsProcessing: isUpdating,
            });
        }
    }, [selectedCount, rows.length, handleUpdateState, isUpdating, onHeaderPropsChange]);

    if (error && !loading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-red-500">
                Error al cargar precios eliminados: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="p-4">
                    <div className="overflow-x-auto">
                        <Paper elevation={0} className="w-full rounded-2xl shadow-none overflow-hidden">
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                loading={loading}
                                autoHeight
                                paginationMode="client"
                                initialState={{
                                    pagination: {
                                        paginationModel: { pageSize: 10, page: 0 },
                                    },
                                }}
                                pageSizeOptions={[10, 25, 50]}
                                disableRowSelectionOnClick
                                disableColumnMenu
                                slots={{ noRowsOverlay: NoRowsOverlay }}
                                sx={{
                                    border: 0,
                                    "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f8fafc" },
                                    "& .MuiDataGrid-columnHeaderTitle": {
                                        fontWeight: 600,
                                        fontSize: "0.75rem",
                                        textTransform: "uppercase",
                                        color: "#475569",
                                    },
                                    "& .MuiDataGrid-cell:focus": { outline: "none" },
                                }}
                            />
                        </Paper>
                    </div>
                </div>
            </section>
        </div>
    );
};

RecycleBinPrice.propTypes = {
    token: PropTypes.string,
    user: PropTypes.object,
    onHeaderPropsChange: PropTypes.func,
};

RecycleBinPrice.defaultProps = {
    token: null,
    user: null,
    onHeaderPropsChange: null,
};

export default RecycleBinPrice;

