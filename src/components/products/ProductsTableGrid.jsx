import PropTypes from "prop-types";
import { useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";

const NoRowsOverlay = () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
        No hay productos disponibles.
    </div>
);

const ProductsTableGrid = ({
    rows,
    loading,
    error,
    selectedRowIds,
    onToggleRowSelection,
    onToggleAllRows,
}) => {
    const allRowIds = useMemo(() => rows.map(r => r.id), [rows]);
    const allSelected = useMemo(() => 
        allRowIds.length > 0 && allRowIds.every(id => selectedRowIds.has(id)),
        [allRowIds, selectedRowIds]
    );

    const columns = useMemo(() => {
        const selectColumn = {
            field: "select",
            headerName: "",
            width: 52,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            align: "center",
            headerAlign: "center",
            renderHeader: () => (
                <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={allSelected}
                    onClick={e => e.stopPropagation()}
                    onChange={e => {
                        e.stopPropagation();
                        onToggleAllRows?.();
                    }}
                />
            ),
            renderCell: ({ row }) => (
                <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedRowIds.has(row.id)}
                    onClick={e => e.stopPropagation()}
                    onChange={e => {
                        e.stopPropagation();
                        onToggleRowSelection?.(row.id);
                    }}
                />
            ),
        };

        return [
            selectColumn,
            { field: "sku", headerName: "SKU", width: 150 },
            { field: "name", headerName: "Nombre", width: 250 },
            { field: "tenantName", headerName: "Tenant", width: 150 },
            { field: "warehouse", headerName: "Bodega", width: 150 },
            { field: "quantity", headerName: "Cantidad", width: 100, type: "number" },
            { field: "price", headerName: "Precio", width: 100, type: "number" },
            { field: "state", headerName: "Estado", width: 120 },
            { field: "message", headerName: "Mensaje", width: 250 },
            {
                field: "actions",
                headerName: "Detalle",
                width: 80,
                sortable: false,
                filterable: false,
                disableColumnMenu: true,
                align: "center",
                renderCell: ({ row }) => (
                    <IconButton
                        size="small"
                        onClick={e => e.stopPropagation()}
                        sx={{ color: "rgb(99, 102, 241)" }}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                ),
            },
        ];
    }, [allSelected, onToggleAllRows, onToggleRowSelection, selectedRowIds]);

    if (error && !loading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-red-500">
                Error: {error.message}
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="overflow-x-auto">
                <div className="mx-auto w-full min-w-full md:min-w-[70rem] max-w-full lg:max-w-[94rem]">
                    <Paper elevation={0} sx={{ width: "100%", borderRadius: "16px", overflow: "hidden" }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            loading={loading}
                            autoHeight
                            paginationMode="client"
                            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
                            pageSizeOptions={[25, 50, 100]}
                            disableRowSelectionOnClick
                            disableColumnMenu
                            disableColumnSelector
                            disableDensitySelector
                            localeText={{ footerPaginationRowsPerPage: "Filas por página:" }}
                            slots={{ noRowsOverlay: NoRowsOverlay }}
                            sx={{
                                border: 0,
                                "--DataGrid-containerBackground": "transparent",
                                "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f8fafc" },
                                "& .MuiDataGrid-columnHeaderTitle": {
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    color: "#475569",
                                },
                                "& .MuiDataGrid-row:hover": { backgroundColor: "#eaf8ff" },
                                "& .MuiDataGrid-cell": { borderBottomColor: "#e2e8f0" },
                                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
                            }}
                        />
                    </Paper>
                </div>
            </div>
        </div>
    );
};

ProductsTableGrid.propTypes = {
    rows: PropTypes.arrayOf(PropTypes.object).isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    selectedRowIds: PropTypes.instanceOf(Set).isRequired,
    onToggleRowSelection: PropTypes.func.isRequired,
    onToggleAllRows: PropTypes.func.isRequired,
};

ProductsTableGrid.defaultProps = {
    error: null,
};

export default ProductsTableGrid;
