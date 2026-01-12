import { useMemo, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { useProducts } from "../../api/products/getProducts";
import { usePrice } from "../../api/price/getPrice";
import { patchExportProducts } from "../../api/products/patchStateProduct";
import { alertsProducts } from "../../utils/alertsProducts";

const GenericRecycleTab = ({
    type,
    token,
    tenantId,
    user,
    onStatsChange
}) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });

    const isPrice = type === "price";
    const useDataHook = isPrice ? usePrice : useProducts;

    const { products, loading, error } = useDataHook({
        token,
        tenantId,
        refreshTrigger,
        state: "discarded",
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize
    });

    const rows = useMemo(() => {
        if (!Array.isArray(products)) return [];
        return products
            .filter(p => {
                const s = String(p.state || "").toLowerCase();
                return s === "discard" || s === "discarded";
            })
            .map((p, i) => ({ id: p._id || i, ...p }));
    }, [products]);

    const columns = useMemo(() => {
        const base = [
            { field: "sku", headerName: "SKU", width: 150 },
            { field: "name", headerName: "Nombre", width: 250 },
            { field: "tenantName", headerName: isPrice ? "Tienda" : "Tenant", width: 150 },
        ];

        if (isPrice) {
            base.push({
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
            });
        } else {
            base.push(
                { field: "warehouse", headerName: "Bodega", width: 150 },
                { field: "quantity", headerName: "Cantidad", width: 100, type: "number" }
            );
        }

        base.push({
            field: "updatedDate",
            headerName: "Fecha eliminación",
            width: 180,
            renderCell: ({ value }) => {
                try {
                    return value ? <span className="text-sm text-slate-700">{new Date(value).toLocaleString("es-CL")}</span> : "—";
                } catch { return "—"; }
            }
        });

        return base;
    }, [isPrice]);

    const handleUpdateState = useCallback(async (nextState) => {
        if (!nextState || rowSelectionModel.length === 0) return;
        setIsUpdating(true);
        try {
            await patchExportProducts({
                token,
                ids: rowSelectionModel,
                state: nextState,
                user: user?.name || "usuario",
                mailUser: user?.email || "usuario",
            });
            alertsProducts.updateSuccess(rowSelectionModel.length);
            setRowSelectionModel([]);
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            alertsProducts.updateError(err.message);
        } finally {
            setIsUpdating(false);
        }
    }, [rowSelectionModel, token, user]);

    const gridRowSelectionModel = useMemo(() => ({
        type: "include",
        ids: new Set(rowSelectionModel || [])
    }), [rowSelectionModel]);

    const handleRowSelectionChange = useCallback((model) => {
        if (Array.isArray(model)) {
            setRowSelectionModel(model);
            return;
        }
        const next = model?.ids instanceof Set ? Array.from(model.ids) : Array.isArray(model?.ids) ? model.ids : [];
        setRowSelectionModel(next);
    }, []);

    useEffect(() => {
        setRowSelectionModel([]);
    }, [paginationModel.page, paginationModel.pageSize]);

    useEffect(() => {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
        setRefreshTrigger((prev) => prev + 1);
    }, [tenantId, type]);

    useEffect(() => {
        onStatsChange?.({
            count: rows.length,
            selectedCount: rowSelectionModel.length,
            isProcessing: isUpdating,
            onAction: handleUpdateState
        });
    }, [rows.length, rowSelectionModel.length, isUpdating, handleUpdateState, onStatsChange]);

    if (error && !loading) return <div className="text-red-500 p-4">Error: {error.message}</div>;

    const rowCount = useMemo(() => {
        if (typeof products?.total === "number") return products.total;
        return rows.length;
    }, [products?.total, rows.length]);

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Paper elevation={0} className="w-full">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    autoHeight
                    paginationMode="server"
                    rowCount={rowCount}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    checkboxSelection
                    disableRowSelectionOnClick
                    rowSelectionModel={gridRowSelectionModel}
                    onRowSelectionModelChange={handleRowSelectionChange}
                    pageSizeOptions={[25, 50, 100]}
                    sx={{
                        border: 0,
                        "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f8fafc" },
                        "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600, fontSize: "0.75rem", color: "#475569" },
                    }}
                />
            </Paper>
        </div>
    );
};

GenericRecycleTab.propTypes = {
    type: PropTypes.oneOf(["products", "price"]).isRequired,
    token: PropTypes.string,
    tenantId: PropTypes.string,
    user: PropTypes.object,
    onStatsChange: PropTypes.func
};

export default GenericRecycleTab;

