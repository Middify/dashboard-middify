import PropTypes from "prop-types";
import { useMemo } from "react";
import { 
  DataGrid, 
  GridOverlay, 
  GridPagination, 
} from "@mui/x-data-grid";
import { Paper, Box, CircularProgress, Typography, Skeleton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

const NoRowsOverlay = () => (
  <GridOverlay>
    <Box className="flex flex-col items-center justify-center gap-3 p-8 text-slate-400">
      <InboxOutlinedIcon sx={{ fontSize: 64, opacity: 0.2 }} />
      <div className="text-center">
        <Typography variant="h6" className="font-bold text-slate-500">
          Sin resultados
        </Typography>
        <Typography variant="body2">
          No encontramos registros con los filtros seleccionados.
        </Typography>
      </div>
    </Box>
  </GridOverlay>
);

const LoadingOverlay = () => (
  <GridOverlay>
    <Box className="w-full h-full flex flex-col items-center justify-center bg-white/50 backdrop-blur-[1px]">
      <div className="relative flex items-center justify-center">
        <CircularProgress size={48} thickness={4} sx={{ color: "#4f46e5" }} />
        <div className="absolute animate-ping h-8 w-8 rounded-full bg-indigo-100 opacity-75"></div>
      </div>
      <Typography
        variant="body2"
        className="mt-4 font-bold text-slate-600 animate-pulse uppercase tracking-widest"
      >
        Cargando datos...
      </Typography>
    </Box>
  </GridOverlay>
);

const LoadingSkeleton = () => (
  <Box sx={{ width: "100%", p: 2 }}>
    {[...Array(10)].map((_, i) => (
      <Skeleton
        key={i}
        variant="rectangular"
        height={52}
        sx={{ mb: 1, borderRadius: 2, opacity: 0.6 }}
      />
    ))}
  </Box>
);

const CustomFooter = () => {
  return (
    <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0' }}>
      <GridPagination />
    </Box>
  );
};

const TableGrid = ({
  rows,
  columns,
  loading,
  rowCount,
  paginationModel,
  pageSizeOptions,
  onPaginationModelChange,
  rowSelectionModel = [],
  onRowSelectionModelChange,
  onToggleRowSelection,
  onToggleAllRows,
  onViewDetails,
  MobileComponent,
  mobileComponentProps = {},
  rowHeight = 52,
  headerHeight = 48,
  checkboxSelection = false,
}) => {
  const { page, pageSize } = paginationModel;
  const totalPages = Math.max(1, Math.ceil((rowCount || 0) / pageSize));

  const allRowIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const allSelected = allRowIds.length > 0 && allRowIds.every((id) => rowSelectionModel.includes(id));

  const gridRowSelectionModel = useMemo(() => ({
    type: "include",
    ids: new Set(rowSelectionModel || []),
  }), [rowSelectionModel]);

  const handleGridSelectionChange = (model) => {
    if (!onRowSelectionModelChange) return;
    if (Array.isArray(model)) {
      onRowSelectionModelChange(model);
      return;
    }
    const next = model?.ids instanceof Set ? Array.from(model.ids) : Array.isArray(model?.ids) ? model.ids : [];
    onRowSelectionModelChange(next);
  };

  const handleMobileToggleAll = () => {
    if (onToggleAllRows) onToggleAllRows(allRowIds);
  };

  const handleMobileToggleRow = (id) => {
    if (onToggleRowSelection) onToggleRowSelection(id);
  };

  return (
    <div className="mx-auto w-full min-w-full md:min-w-[70rem] max-w-full lg:max-w-[94rem] overflow-hidden">
      <div className="md:hidden">
        <div className="mb-3 flex justify-between items-center text-xs font-medium text-slate-500 px-1">
          <span>{(rowCount || 0).toLocaleString()} Resultados</span>
          {onToggleAllRows && (
            <button
              onClick={handleMobileToggleAll}
              className="text-indigo-600 font-semibold"
            >
              {allSelected ? "Deseleccionar" : "Seleccionar todo"}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1 pb-32">
          {loading && rows.length === 0 ? (
            <LoadingSkeleton />
          ) : rows.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <InboxOutlinedIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              <p className="text-sm font-medium">No se encontraron registros</p>
            </div>
          ) : (
            rows.map((row) =>
              MobileComponent ? (
                <MobileComponent
                  key={row.id}
                  row={row}
                  isSelected={rowSelectionModel.includes(row.id)}
                  onToggleSelection={handleMobileToggleRow}
                  onViewDetails={onViewDetails}
                  {...mobileComponentProps}
                />
              ) : null
            )
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white/95 backdrop-blur px-4 py-3 flex justify-between items-center shadow-lg">
          <button
            onClick={() => onPaginationModelChange({ ...paginationModel, page: Math.max(0, page - 1) })}
            disabled={page === 0}
            className="p-1 disabled:opacity-30 flex items-center gap-1 text-xs font-medium text-slate-600"
          >
            <ChevronLeftIcon fontSize="small" /> Anterior
          </button>
          <span className="text-xs font-bold text-slate-700">
            Pág. {page + 1} de {totalPages || 1}
          </span>
          <button
            onClick={() => onPaginationModelChange({ ...paginationModel, page: Math.min(totalPages - 1, page + 1) })}
            disabled={page >= totalPages - 1}
            className="p-1 disabled:opacity-30 flex items-center gap-1 text-xs font-medium text-slate-600"
          >
            Siguiente <ChevronRightIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="hidden md:block">
        <Paper elevation={0} className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          <div style={{ height: Math.min(Math.max(rows.length * rowHeight + 110, 400), 800), width: "100%", maxHeight: "calc(100vh - 240px)" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              paginationMode="server"
              rowCount={Number.isFinite(rowCount) ? rowCount : 0}
              paginationModel={paginationModel}
              onPaginationModelChange={onPaginationModelChange}
              pageSizeOptions={pageSizeOptions}
              checkboxSelection={checkboxSelection}
              rowSelectionModel={gridRowSelectionModel}
              onRowSelectionModelChange={handleGridSelectionChange}
              disableRowSelectionOnClick
              disableColumnMenu
              rowHeight={rowHeight}
              columnHeaderHeight={headerHeight}
              slots={{
                noRowsOverlay: NoRowsOverlay,
                loadingOverlay: LoadingOverlay,
                footer: CustomFooter,
              }}
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

TableGrid.propTypes = {
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  rowCount: PropTypes.number.isRequired,
  paginationModel: PropTypes.object.isRequired,
  pageSizeOptions: PropTypes.array.isRequired,
  onPaginationModelChange: PropTypes.func.isRequired,
  rowSelectionModel: PropTypes.array,
  onRowSelectionModelChange: PropTypes.func,
  onToggleRowSelection: PropTypes.func,
  onToggleAllRows: PropTypes.func,
  onViewDetails: PropTypes.func,
  MobileComponent: PropTypes.elementType,
  mobileComponentProps: PropTypes.object,
  rowHeight: PropTypes.number,
  headerHeight: PropTypes.number,
  checkboxSelection: PropTypes.bool,
};

export default TableGrid;
