import PropTypes from "prop-types";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { useMemo } from "react";

const NoRowsOverlay = () => (
  <div className="flex h-full items-center justify-center text-sm text-slate-500">
    No hay órdenes disponibles para los filtros seleccionados.
  </div>
);

const OrdersTableGrid = ({
  rows,
  columns,
  loading,
  error,
  paginationMode,
  paginationModel,
  onPaginationModelChange,
  pageSizeOptions,
  rowCount,
  onRowClick,
}) => {
  const containerHeight = useMemo(() => {
    const calculatedHeight = rows.length * 52 + 110;
    return Math.min(Math.max(calculatedHeight, 300), 800);
  }, [rows.length]);

  if (error && !loading) {
    return (
      <div className="px-6 py-12 text-center text-sm text-red-500">
        Error al cargar las órdenes: {error.message}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-full md:min-w-[70rem] max-w-full lg:max-w-[94rem] md:block overflow-hidden">
      <div className="mx-auto w-full min-w-full md:min-w-[70rem] max-w-full lg:max-w-[94rem] md:block">
        <Paper
          elevation={0}
          className="w-full bg-white"
          sx={{
            width: "100%",
            overflow: "hidden",
          }}
        >
          <div style={{ height: containerHeight, width: '100%', maxHeight: 'calc(100vh - 240px)' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              paginationMode={paginationMode}
              paginationModel={paginationModel}
              onPaginationModelChange={onPaginationModelChange}
              pageSizeOptions={pageSizeOptions}
              rowCount={rowCount}
              disableRowSelectionOnClick
              disableColumnMenu
              disableColumnSelector
              disableDensitySelector
              onRowClick={onRowClick}
              rowHeight={52}
              columnHeaderHeight={48}
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
                  borderBottom: "1px solid #e2e8f0",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#64748b",
                },
                "& .MuiDataGrid-row": {
                  cursor: "pointer",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f8fafc",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #f1f5f9",
                },
                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
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

      {/* Vista Móvil: Implementación simple para móviles si no existe una tarjeta específica */}
      <div className="block md:hidden">
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="h-32 w-full animate-pulse rounded-xl bg-slate-100" />
          ) : rows.length === 0 ? (
            <NoRowsOverlay />
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className="mb-3 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                onClick={() => onRowClick({ row })}
              >
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">#{row.orderNumber || row.id.slice(-6)}</span>
                  <span className="text-xs text-slate-500">{row.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-700">{row.customerName || "Cliente"}</span>
                  <span className="font-medium text-slate-900">${row.total}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {row.state || row.status}
                    </span>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

OrdersTableGrid.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  paginationMode: PropTypes.oneOf(["client", "server"]).isRequired,
  paginationModel: PropTypes.shape({
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
  }).isRequired,
  onPaginationModelChange: PropTypes.func.isRequired,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  rowCount: PropTypes.number.isRequired,
  onRowClick: PropTypes.func.isRequired,
};

OrdersTableGrid.defaultProps = {
  error: null,
};

export default OrdersTableGrid;
