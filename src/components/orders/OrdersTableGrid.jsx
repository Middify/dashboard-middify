import PropTypes from "prop-types";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";

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
  paginationModel,
  onPaginationModelChange,
  pageSizeOptions,
  rowCount,
  onRowClick,
}) => {
  if (error && !loading) {
    return (
      <div className="px-6 py-12 text-center text-sm text-red-500">
        Error al cargar las órdenes: {error.message}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <div className="mx-auto w-full min-w-[70rem] max-w-[94rem]">
          <Paper
            elevation={0}
            sx={{
              height: 600,
              width: "100%",
              borderRadius: "16px",
              boxShadow: "none",
              overflow: "hidden",
            }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={onPaginationModelChange}
              pageSizeOptions={pageSizeOptions}
              rowCount={rowCount}
              disableRowSelectionOnClick
              disableColumnMenu
              disableColumnSelector
              disableDensitySelector
              onRowClick={onRowClick}
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
                "& .MuiDataGrid-row": {
                  cursor: "pointer",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#eef2ff",
                },
                "& .MuiDataGrid-cell": {
                  borderBottomColor: "#e2e8f0",
                },
                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                  outline: "none",
                },
              }}
            />
          </Paper>
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


