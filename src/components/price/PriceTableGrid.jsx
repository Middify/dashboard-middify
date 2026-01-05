import PropTypes from "prop-types";
import { useMemo, useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Chip, IconButton, Typography } from "@mui/material";

const NoRowsOverlay = () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
        No se encontraron precios disponibles para los filtros seleccionados.
    </div>
);

const getStateColor = (state) => {
    switch (state?.toLowerCase()) {
        case "success":
        case "procesada":
            return "bg-green-100 text-green-700 border-green-200";
        case "failed":
        case "error":
            return "bg-red-100 text-red-700 border-red-200";
        case "created":
        case "creada":
            return "bg-blue-100 text-blue-700 border-blue-200";
        case "discard":
        case "discarded":
            return "bg-slate-100 text-slate-600 border-slate-200";
        default:
            return "bg-slate-100 text-slate-600 border-slate-200";
    }
};

const MobilePriceCard = ({ row, isSelected, onToggleSelection, onViewDetails }) => {
    return (
        <div 
            className={`mb-3 flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition-all duration-200 ${
                isSelected ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/10" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
            onClick={() => onViewDetails(row._id)}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 overflow-hidden">
                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSelection(row.id);
                        }}
                        className="mt-1 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border border-slate-300 transition-colors hover:border-indigo-500 bg-white"
                    >
                        {isSelected && <div className="h-3 w-3 rounded-sm bg-indigo-600" />}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <h3 className="truncate text-sm font-semibold text-slate-900">{row.name}</h3>
                        <span className="text-xs font-mono text-slate-500">SKU: {row.sku}</span>
                    </div>
                </div>
                <Chip 
                    label={row.state} 
                    size="small" 
                    className={`font-bold uppercase text-[9px] h-5 border ${getStateColor(row.state)}`}
                />
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-slate-100 pt-3 text-xs">
                <div>
                    <span className="block text-slate-400 mb-0.5">Precio Anterior</span>
                    <span className="font-mono text-slate-500">
                        {(() => {
                            const p = row.oldPrice || row.precioAnterior;
                            return p ? `$${Number(p).toLocaleString('es-ES')}` : '-';
                        })()}
                    </span>
                </div>
                <div>
                    <span className="block text-slate-400 mb-0.5">Precio Actual</span>
                    <span className="font-bold text-indigo-600 font-mono">
                        {(() => {
                            const p = row.price;
                            if (typeof p === 'object' && p !== null) {
                                return `$${Number(p.precioVta || p.PrecioBol || 0).toLocaleString('es-ES')}`;
                            }
                            return `$${Number(p || 0).toLocaleString('es-ES')}`;
                        })()}
                    </span>
                </div>
                <div>
                    <span className="block text-slate-400 mb-0.5">Tienda</span>
                    <span className="truncate font-medium text-slate-700">{row.tenantName}</span>
                </div>
                <div className="text-right">
                    <span className="block text-slate-400 mb-0.5">Actualizado</span>
                    <span className="text-[10px] text-slate-500">
                        {row.updatedDate ? new Date(row.updatedDate).toLocaleDateString('es-ES') : '-'}
                    </span>
                </div>
            </div>
        </div>
    );
};

MobilePriceCard.propTypes = {
    row: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onToggleSelection: PropTypes.func.isRequired,
    onViewDetails: PropTypes.func.isRequired,
};

const PriceTableGrid = ({
    rows,
    loading,
    error,
    selectedRowIds,
    onToggleRowSelection,
    onToggleAllRows,
    onViewDetails,
}) => {
    const [mobilePage, setMobilePage] = useState(0);
    const [mobilePageSize, setMobilePageSize] = useState(25);

    const allRowIds = useMemo(() => rows.map((row) => row.id), [rows]);

    const allSelected = useMemo(() => {
        if (allRowIds.length === 0) return false;
        return allRowIds.every((id) => selectedRowIds.has(id));
    }, [allRowIds, selectedRowIds]);

    const paginatedRows = useMemo(() => {
        const startIndex = mobilePage * mobilePageSize;
        const endIndex = startIndex + mobilePageSize;
        return rows.slice(startIndex, endIndex);
    }, [rows, mobilePage, mobilePageSize]);

    const totalPages = useMemo(() => {
        return Math.ceil(rows.length / mobilePageSize);
    }, [rows.length, mobilePageSize]);

    const startItem = mobilePage * mobilePageSize + 1;
    const endItem = Math.min((mobilePage + 1) * mobilePageSize, rows.length);

    useEffect(() => {
        if (mobilePage >= totalPages && totalPages > 0) {
            setMobilePage(0);
        }
    }, [rows.length, mobilePageSize, totalPages, mobilePage]);

    const columns = useMemo(() => [
        {
            field: "select",
            headerName: "",
            width: 50,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderHeader: () => (
                <div className="flex items-center justify-center">
                    <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={allSelected}
                        onChange={(e) => {
                            e.stopPropagation();
                            onToggleAllRows && onToggleAllRows();
                        }}
                    />
                </div>
            ),
            renderCell: ({ row }) => (
                <div className="flex h-full items-center justify-center">
                    <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedRowIds.has(row.id)}
                        onChange={(e) => {
                            e.stopPropagation();
                            onToggleRowSelection(row.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            ),
            align: "center",
            headerAlign: "center",
        },
        { 
            field: "sku", 
            headerName: "SKU", 
            width: 140,
            renderCell: (params) => (
                <span className="font-mono text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    {params.value}
                </span>
            )
        },
        { 
            field: "name", 
            headerName: "Producto", 
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <div className="flex flex-col justify-center py-2">
                    <Typography className="text-sm font-semibold text-slate-800 truncate">{params.value}</Typography>
                    <Typography className="text-[10px] text-slate-400 uppercase tracking-tighter">{params.row.tenantName}</Typography>
                </div>
            )
        },
        { 
            field: "oldPrice", 
            headerName: "Precio Anterior", 
            width: 130,
            renderCell: (params) => {
                const p = params.row.oldPrice || params.row.precioAnterior;
                return (
                    <span className="font-mono text-slate-400">
                        {p ? `$${Number(p).toLocaleString('es-ES')}` : '-'}
                    </span>
                );
            }
        },
        { 
            field: "price", 
            headerName: "Precio Actual", 
            width: 130,
            renderCell: (params) => {
                const p = params.value;
                let actual = '-';
                if (typeof p === 'object' && p !== null) {
                    actual = `$${Number(p.precioVta || p.PrecioBol || 0).toLocaleString('es-ES')}`;
                } else {
                    actual = `$${Number(p || 0).toLocaleString('es-ES')}`;
                }
                return (
                    <span className="text-indigo-600 font-bold font-mono">
                        {actual}
                    </span>
                );
            }
        },
        {
            field: "createdDate",
            headerName: "Fecha Ingreso",
            width: 160,
            renderCell: (params) => {
                if (!params.value) return <span className="text-slate-400">-</span>;
                const dateStr = typeof params.value === 'object' ? params.value.$date : params.value;
                return <span className="text-xs text-slate-600 font-medium">{new Date(dateStr).toLocaleString('es-ES')}</span>;
            }
        },
        {
            field: "updatedDate",
            headerName: "Fecha Actualizada",
            width: 160,
            renderCell: (params) => {
                if (!params.value) return <span className="text-slate-400">-</span>;
                const dateStr = typeof params.value === 'object' ? params.value.$date : params.value;
                return <span className="text-xs text-slate-600 font-medium">{new Date(dateStr).toLocaleString('es-ES')}</span>;
            }
        },
        { 
            field: "state", 
            headerName: "Estado", 
            width: 120,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => (
                <Chip 
                    label={params.value} 
                    size="small"
                    className={`font-bold uppercase text-[10px] border ${getStateColor(params.value)}`}
                />
            )
        },
        {
            field: "actions",
            headerName: "",
            width: 60,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            align: "center",
            renderCell: (params) => (
                <IconButton 
                    size="small" 
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(params.row._id);
                    }}
                    className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                >
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            )
        }
    ], [allSelected, onToggleAllRows, onToggleRowSelection, selectedRowIds, onViewDetails]);

    const containerHeight = useMemo(() => {
        const calculatedHeight = rows.length * 60 + 110;
        return Math.min(Math.max(calculatedHeight, 300), 800);
    }, [rows.length]);

    if (error && !loading) {
        return <div className="px-6 py-12 text-center text-sm text-red-500">Error: {error.message}</div>;
    }

    return (
        <div className="mx-auto w-full min-w-full md:min-w-[70rem] max-w-full lg:max-w-[94rem] md:block overflow-hidden">
            <div className="block md:hidden">
                <div className="mb-3 flex items-center justify-between px-1">
                    <span className="text-xs font-medium text-slate-500">
                        {rows.length > 0 ? `${startItem}-${endItem} de ${rows.length}` : "0 Resultados"}
                    </span>
                    <button
                        onClick={onToggleAllRows}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 w-full animate-pulse rounded-xl bg-slate-100" />
                        ))}
                    </div>
                ) : rows.length === 0 ? (
                    <NoRowsOverlay />
                ) : (
                    <>
                        <div className="flex flex-col gap-1 pb-32">
                            {paginatedRows.map((row) => (
                                <MobilePriceCard
                                    key={row.id}
                                    row={row}
                                    isSelected={selectedRowIds.has(row.id)}
                                    onToggleSelection={onToggleRowSelection}
                                    onViewDetails={onViewDetails}
                                />
                            ))}
                        </div>

                        {rows.length > 0 && (
                            <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6 py-3 shadow-lg md:hidden">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-600">Filas por página:</span>
                                        <select
                                            value={mobilePageSize}
                                            onChange={(e) => {
                                                setMobilePageSize(Number(e.target.value));
                                                setMobilePage(0);
                                            }}
                                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        >
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => setMobilePage(prev => Math.max(0, prev - 1))}
                                            disabled={mobilePage === 0}
                                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <ChevronLeftIcon fontSize="small" />
                                            Anterior
                                        </button>

                                        <span className="text-xs font-medium text-slate-700">
                                            Página {mobilePage + 1} de {totalPages}
                                        </span>

                                        <button
                                            onClick={() => setMobilePage(prev => Math.min(totalPages - 1, prev + 1))}
                                            disabled={mobilePage >= totalPages - 1}
                                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Siguiente
                                            <ChevronRightIcon fontSize="small" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="hidden md:block">
                <Paper elevation={0} className="w-full bg-white overflow-hidden">
                    <div style={{ height: containerHeight, width: '100%', maxHeight: 'calc(100vh - 240px)' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            loading={loading}
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
                            rowHeight={60}
                            columnHeaderHeight={48}
                            localeText={{
                                footerPaginationRowsPerPage: "Filas por página:",
                            }}
                            sx={{
                                border: 0,
                                "& .MuiDataGrid-columnHeaders": {
                                    backgroundColor: "#f8fafc",
                                    borderBottom: "1px solid #e2e8f0",
                                },
                                "& .MuiDataGrid-columnHeaderTitle": {
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                    color: "#64748b",
                                },
                                "& .MuiDataGrid-row:hover": {
                                    backgroundColor: "#f8fafc",
                                },
                                "& .MuiDataGrid-cell": {
                                    borderBottom: "1px solid #f1f5f9",
                                },
                                "& .MuiDataGrid-cell:focus": {
                                    outline: "none",
                                },
                                "& .MuiDataGrid-footerContainer": {
                                    borderTop: "1px solid #e2e8f0",
                                },
                            }}
                        />
                    </div>
                </Paper>
            </div>
        </div>
    );
};

PriceTableGrid.propTypes = {
    rows: PropTypes.arrayOf(PropTypes.object).isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.object,
    selectedRowIds: PropTypes.instanceOf(Set).isRequired,
    onToggleRowSelection: PropTypes.func.isRequired,
    onToggleAllRows: PropTypes.func.isRequired,
    onViewDetails: PropTypes.func.isRequired,
};

export default PriceTableGrid;

