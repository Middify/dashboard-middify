import PropTypes from "prop-types";
import { useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const NoRowsOverlay = () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
        No se encontraron productos disponibles.
    </div>
);

const getStateColor = (s) => {
    const states = {
        success: "bg-green-100 text-green-700",
        procesada: "bg-green-100 text-green-700",
        failed: "bg-red-100 text-red-700",
        error: "bg-red-100 text-red-700",
        created: "bg-blue-100 text-blue-700",
        creada: "bg-blue-100 text-blue-700",
        discard: "bg-slate-100 text-slate-600",
        discarded: "bg-slate-100 text-slate-600"
    };
    return states[s?.toLowerCase()] || "bg-slate-100 text-slate-600";
};

const formatDate = (date) => {
    if (!date) return '-';
    const rawDate = date?.$date || date;
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const MobileProductCard = ({ row, isSelected, onToggleSelection, onViewDetails }) => (
    <div 
        className={`mb-3 flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
            isSelected ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/10" : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
        }`}
        onClick={() => onViewDetails(row.id || row._id)}
    >
        <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
                <div 
                    onClick={(e) => { e.stopPropagation(); onToggleSelection(row.id); }}
                    className="mt-1 h-5 w-5 flex items-center justify-center rounded border border-slate-300 bg-white"
                >
                    {isSelected && <div className="h-2.5 w-2.5 rounded-sm bg-indigo-600" />}
                </div>
                <div className="flex flex-col min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-900">{row.name}</h3>
                    <span className="text-xs font-mono text-slate-500">SKU: {row.sku}</span>
                </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStateColor(row.state)}`}>
                {row.state}
            </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-3 text-xs">
            <div>
                <p className="text-slate-400 mb-0.5">Cantidad</p>
                <p className="font-bold text-slate-700">{row.quantity}</p>
            </div>
            <div>
                <p className="text-slate-400 mb-0.5">Bodega</p>
                <p className="font-medium text-slate-700 truncate">{row.warehouse}</p>
            </div>
            <div>
                <p className="text-slate-400 mb-0.5">Tenant</p>
                <p className="font-medium text-slate-700 truncate">{row.tenantName}</p>
            </div>
            <div>
                <p className="text-slate-400 mb-0.5">Ingreso</p>
                <p className="text-slate-500 font-medium">{formatDate(row.createdDate || row.ingresoMiddify)}</p>
            </div>
            <div className="col-span-2">
                <p className="text-slate-400 mb-0.5">Actualizado</p>
                <p className="text-slate-500 font-medium">{formatDate(row.updatedDate || row.actualizacion)}</p>
            </div>
        </div>
    </div>
);

const ProductsTableGrid = ({ 
    rows,
    loading,
    rowCount,
    page,
    pageSize,
    onPaginationModelChange,
    selectedRowIds,
    onToggleRowSelection,
    onToggleAllRows,
    onViewDetails,
}) => {
    const allRowIds = useMemo(() => rows.map(r => r.id), [rows]);
    const allSelected = allRowIds.length > 0 && allRowIds.every(id => selectedRowIds.has(id));
    
    const totalPages = Math.max(1, Math.ceil((rowCount || 0) / pageSize));

    const columns = useMemo(() => [
        {
            field: "select", headerName: "", width: 50, sortable: false,
            renderHeader: () => (
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                    checked={allSelected} onChange={onToggleAllRows} />
            ),
            renderCell: ({ row }) => (
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                    checked={selectedRowIds.has(row.id)} onChange={() => onToggleRowSelection(row.id)} />
            ),
            align: "center", headerAlign: "center",
        },
        { field: "sku", headerName: "SKU", width: 140, renderCell: (p) => <span className="text-xs font-mono text-slate-600">{p.value}</span> },
        { field: "name", headerName: "Nombre", flex: 1, renderCell: (p) => <span className="font-semibold text-slate-800">{p.value}</span> },
        { field: "tenantName", headerName: "Tenant", width: 120 },
        { field: "warehouse", headerName: "Bodega", width: 120 },
        { field: "quantity", headerName: "Cant.", width: 80, align: "center", headerAlign: "center", renderCell: (p) => <span className="font-bold text-slate-700">{p.value}</span> },
        { field: "createdDate", headerName: "Fecha Ingreso", width: 140, renderCell: (p) => (
            <span className="text-xs text-slate-600 font-medium">{formatDate(p.value || p.row.ingresoMiddify)}</span>
        )},
        { field: "updatedDate", headerName: "Actualizado", width: 140, renderCell: (p) => (
            <span className="text-xs text-slate-600 font-medium">{formatDate(p.value || p.row.actualizacion)}</span>
        )},
        { field: "state", headerName: "Estado", width: 110, align: "center", headerAlign: "center", renderCell: (p) => (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStateColor(p.value)}`}>
                {p.value}
            </span>
        )},
        {
            field: "actions", headerName: "", width: 50, sortable: false, align: "center",
            renderCell: (p) => (
                <button onClick={() => onViewDetails(p.row.id || p.row._id)} className="text-slate-400 hover:text-indigo-600 p-1 hover:bg-indigo-50 rounded-lg">
                    <VisibilityIcon fontSize="small" />
                </button>
            )
        }
    ], [allSelected, selectedRowIds, onViewDetails]);

    return (
        <div className="mx-auto w-full min-w-full md:min-w-[70rem] max-w-full lg:max-w-[94rem] overflow-hidden">
            {/* Mobile View */}
            <div className="md:hidden">
                <div className="mb-3 flex justify-between items-center text-xs font-medium text-slate-500 px-1">
                    <span>{(rowCount || 0).toLocaleString()} Resultados</span>
                    <button onClick={onToggleAllRows} className="text-indigo-600 font-semibold">{allSelected ? "Deseleccionar" : "Seleccionar todo"}</button>
                </div>
                <div className="flex flex-col gap-1 pb-32">
                    {rows.map(row => (
                        <MobileProductCard key={row.id} row={row} isSelected={selectedRowIds.has(row.id)} 
                            onToggleSelection={onToggleRowSelection} onViewDetails={onViewDetails} />
                    ))}
                </div>
                {/* Pagination Mobile */}
                <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white/95 backdrop-blur px-4 py-3 flex justify-between items-center shadow-lg">
                    <button
                        onClick={() => onPaginationModelChange({ page: Math.max(0, page - 1), pageSize })}
                        disabled={page === 0}
                        className="p-1 disabled:opacity-30 flex items-center gap-1 text-xs font-medium text-slate-600"
                    >
                        <ChevronLeftIcon fontSize="small" /> Anterior
                    </button>
                    <span className="text-xs font-bold text-slate-700">Pág. {page + 1} de {totalPages || 1}</span>
                    <button
                        onClick={() => onPaginationModelChange({ page: Math.min(totalPages - 1, page + 1), pageSize })}
                        disabled={page >= totalPages - 1}
                        className="p-1 disabled:opacity-30 flex items-center gap-1 text-xs font-medium text-slate-600"
                    >
                        Siguiente <ChevronRightIcon fontSize="small" />
                    </button>
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <Paper elevation={0} className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                    <div style={{ height: Math.min(rows.length * 52 + 110, 800), width: '100%', maxHeight: 'calc(100vh - 240px)' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            loading={loading}
                            paginationMode="server"
                            rowCount={rowCount}
                            paginationModel={{ page, pageSize }}
                            onPaginationModelChange={onPaginationModelChange}
                            pageSizeOptions={[25, 50, 100, 250]}
                            disableRowSelectionOnClick
                            disableColumnMenu
                            rowHeight={52} columnHeaderHeight={48}
                            slots={{ noRowsOverlay: NoRowsOverlay }}
                            sx={{
                                border: 0,
                                "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
                                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600, fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" },
                                "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9", outline: "none !important" },
                                "& .MuiDataGrid-row:hover": { backgroundColor: "#f8fafc" },
                                "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #e2e8f0" },
                            }}
                        />
                    </div>
                </Paper>
            </div>
        </div>
    );
};

ProductsTableGrid.propTypes = {
    rows: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    rowCount: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    onPaginationModelChange: PropTypes.func.isRequired,
    selectedRowIds: PropTypes.instanceOf(Set).isRequired,
    onToggleRowSelection: PropTypes.func.isRequired,
    onToggleAllRows: PropTypes.func.isRequired,
    onViewDetails: PropTypes.func.isRequired,
};

export default ProductsTableGrid;
