import { useCallback, useEffect, useMemo, useState } from "react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { useOrdersByState } from "../api/orders/getOrdersByState";

const ORDER_STATE_ITEMS = [
  { id: "ingresada", label: "Ingresada" },
  { id: "pendiente", label: "Pendiente" },
  { id: "procesada", label: "Procesada" },
  { id: "error", label: "Error" },
  { id: "en_proceso", label: "En proceso" },
  { id: "descartada", label: "Descartada" },
];

const PAGE_SIZE_OPTIONS_BASE = [10, 20, 50, 100];

const normalizeStatusKey = (status) => {
  if (!status) {
    return "";
  }
  return String(status).toLowerCase().replace(/\s+/g, "_");
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(value));
  } catch (_error) {
    return value;
  }
};

const NoRowsOverlay = () => (
  <div className="flex h-full items-center justify-center text-sm text-slate-500">
    No hay órdenes disponibles para los filtros seleccionados.
  </div>
);

const OrdersTable = ({
  token = null,
  selectedTenantId = null,
  selectedOrderState = null,
  onSelectOrder = () => {},
}) => {
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  const apiStatus = selectedOrderState
    ? selectedOrderState.replace(/_/g, " ")
    : null;

  const { orders, meta, loading, error } = useOrdersByState(token, {
    tenantId: selectedTenantId ?? undefined,
    status: apiStatus ?? undefined,
    page,
    pageSize,
  });

  const selectedStateLabel = useMemo(() => {
    return (
      ORDER_STATE_ITEMS.find((item) => item.id === selectedOrderState)?.label ??
      "Todos los estados"
    );
  }, [selectedOrderState]);

  const pageSizeOptions = useMemo(() => {
    if (PAGE_SIZE_OPTIONS_BASE.includes(pageSize)) {
      return PAGE_SIZE_OPTIONS_BASE;
    }
    return [...PAGE_SIZE_OPTIONS_BASE, pageSize].sort((a, b) => a - b);
  }, [pageSize]);

  useEffect(() => {
    setPage(1);
  }, [selectedTenantId, selectedOrderState]);

  const totalPagesFromMeta = meta?.totalPages ?? null;
  const resolvedPageSize =
    meta?.pageSize && meta.pageSize > 0 ? meta.pageSize : pageSize;
  const currentPage = meta?.page ?? page;
  const displayOrders = Array.isArray(orders) ? orders : [];
  const ordersCount = displayOrders.length;

  useEffect(() => {
    if (totalPagesFromMeta && page > totalPagesFromMeta) {
      setPage(totalPagesFromMeta);
    }
  }, [page, totalPagesFromMeta]);

  const rowCount = useMemo(() => {
    const total = Number(meta?.total);
    if (Number.isFinite(total) && total >= 0) {
      return total;
    }
    return ordersCount;
  }, [meta, ordersCount]);

  const paginationModel = useMemo(
    () => ({
      page: Math.max((currentPage ?? 1) - 1, 0),
      pageSize,
    }),
    [currentPage, pageSize]
  );

  const handlePaginationModelChange = useCallback(
    (model) => {
      const nextPage = model.page + 1;
      if (nextPage !== page) {
        setPage(nextPage);
      }
      if (model.pageSize !== pageSize) {
        setPageSize(model.pageSize);
      }
    },
    [page, pageSize]
  );

  const dataGridRows = useMemo(() => {
    return displayOrders.map((order, index) => {
      const orderId = order._id ?? order.id ?? `order-${index}`;
      const tenantId = order.tennantId ?? order.tenantId ?? "";
      const uniqueId = `${orderId}-${tenantId || index}`;
      const marketplace = order.marketPlace ?? {};
      const statusLabel =
        ORDER_STATE_ITEMS.find(
          (item) => item.id === normalizeStatusKey(order.status)
        )?.label ?? order.status ?? "—";
      const creationDate = marketplace.creation ?? order.creation;
      const lastUpdateDate = marketplace.lastUpdate ?? order.lastUpdate;
      const totalAmount =
        order.total?.amount ?? marketplace.total?.amount ?? null;

      return {
        id: uniqueId,
        marketplaceOrder: marketplace.orderId ?? "—",
        internalId: orderId,
        tenantName: order.tennantName ?? order.tenantName ?? "—",
        tenantCode: tenantId || "—",
        statusLabel,
        message: order.message ?? "—",
        creation: formatDateTime(creationDate),
        lastUpdate: formatDateTime(lastUpdateDate),
        total: formatCurrency(totalAmount),
        rawOrder: order,
      };
    });
  }, [displayOrders]);

  const columns = useMemo(
    () => [
      {
        field: "marketplaceOrder",
        headerName: "Orden",
        flex: 1.2,
        minWidth: 200,
        sortable: false,
        renderCell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-800">
              {row.marketplaceOrder}
            </span>
            <span className="text-xs text-slate-500">{row.internalId}</span>
          </div>
        ),
      },
      {
        field: "tenantName",
        headerName: "Tienda",
        flex: 1.2,
        minWidth: 200,
        sortable: false,
        renderCell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-800">{row.tenantName}</span>
            <span className="text-xs text-slate-500">{row.tenantCode}</span>
          </div>
        ),
      },
      {
        field: "statusLabel",
        headerName: "Estado",
        flex: 0.9,
        minWidth: 140,
        sortable: false,
        renderCell: ({ row }) => (
          <span className="text-sm font-medium text-indigo-600">
            {row.statusLabel}
          </span>
        ),
      },
      {
        field: "message",
        headerName: "Mensaje",
        flex: 1.5,
        minWidth: 220,
        sortable: false,
      },
      {
        field: "creation",
        headerName: "Creación",
        flex: 1,
        minWidth: 160,
        sortable: false,
      },
      {
        field: "lastUpdate",
        headerName: "Actualización",
        flex: 1,
        minWidth: 160,
        sortable: false,
      },
      {
        field: "total",
        headerName: "Total",
        flex: 0.8,
        minWidth: 120,
        sortable: false,
        align: "right",
        headerAlign: "right",
      },
    ],
    []
  );

  const handleRowClick = useCallback(
    (params) => {
      if (params?.row?.rawOrder) {
        onSelectOrder(params.row.rawOrder);
      }
    },
    [onSelectOrder]
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Total</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              {meta?.total ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Página</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              {currentPage ?? "—"} / {totalPagesFromMeta ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Tamaño de página
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              {resolvedPageSize ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Estado</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              {meta?.ok ? "Operativo" : meta?.ok === false ? "Sin datos" : "—"}
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white w-full max-w-[98rem] mx-auto overflow-x-auto shadow-sm">
      {error && !loading ? (
          <div className="px-6 py-12 text-center text-sm text-red-500">
            Error al cargar las órdenes: {error.message}
          </div>
        ) : (
          <div className="p-4 overflow-x-auto">
            <div className="mx-auto w-screen-full max-w-90%">
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
                  rows={dataGridRows}
                  columns={columns}
                  loading={loading}
                  paginationMode="server"
                  paginationModel={paginationModel}
                  onPaginationModelChange={handlePaginationModelChange}
                  pageSizeOptions={pageSizeOptions}
                  rowCount={rowCount}
                  disableRowSelectionOnClick
                  disableColumnMenu
                  disableColumnSelector
                  disableDensitySelector
                  onRowClick={handleRowClick}
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
        )}
      </section>
    </div>
  );
};

export default OrdersTable;

