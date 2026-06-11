import { useState, useCallback, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DASHBOARD_COLUMNS_TEMPLATE,
  useOrdersData,
  useTenantColumns,
} from "../../api/orders/getOrdersByState";
import { fetchOrdersByState } from "../../api/orders/getOrdersByState";
import {
  formatCurrency,
  formatDateTime,
  getSelectedStateLabel,
  normalizeStatusKey,
  ORDER_STATE_LOOKUP,
} from "./helpers";
import { useExportOrders } from "./useExportOrders";
import { useTableState } from "../../hooks/useTableState";

const marketplaceLogos = import.meta.glob(
  "../../assets/marketplace/*.{png,jpg,jpeg,webp}",
  { eager: true },
);

const getLogoUrl = (marketName) => {
  if (!marketName) return null;
  let normalized = String(marketName).toLowerCase().replace(/\s+/g, "");

  if (normalized.includes("meli")) {
    normalized = "mercadolibre";
  }

  for (const path in marketplaceLogos) {
    const fileName = path.split("/").pop().toLowerCase();
    if (
      fileName.includes(normalized) ||
      normalized.includes(fileName.split(".")[0])
    ) {
      return marketplaceLogos[path].default || marketplaceLogos[path];
    }
  }
  return null;
};
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const PREFETCH_STATES = ["deleted", "en proceso"];

const getColumnRawValue = (order, key) => {
  if (!order) return null;

  switch (key) {
    case "marketPlace":
    case "marketplace":
    case "logoTienda":
      return order.marketPlace?.name || order.tennantName || "Desconocida";
    case "_id":
    case "idOrden":
      return (
        order.extras?.idOrderMarket ||
        order.idOrderMarket ||
        order.marketPlace?.orderId ||
        order.market?.orderId ||
        "Sin ID"
      );
    case "creation":
    case "fechaOrigen":
      return order.marketPlace?.creation || "—";
    case "brand":
    case "fechaMiddify":
      return order.creation || "—";
    case "lastUpdate":
    case "fechaActualizacion":
      return order.lastUpdate || "—";
    case "stages":
    case "estadoMiddify":
      return order.status || order.state || "—";
    case "status":
    case "estadoOrigen":
      return order.marketPlace?.status || "—";
    case "subTotal":
    case "costoEnvio":
      return order.shipping?.cost?.amount ?? 0;
    case "total":
    case "totalPagado": {
      const totalVal = order.total ?? order.marketPlace?.total ?? 0;
      return typeof totalVal === "object" && totalVal !== null
        ? totalVal.amount || 0
        : totalVal;
    }
    case "taxes":
    case "folioBoleta": {
      const doc = (order.documents || []).find((d) => {
        const t = String(d?.type || "").toLowerCase();
        return (
          t.includes("boleta") ||
          t.includes("invoice") ||
          t.includes("dte") ||
          t.includes("factura")
        );
      });

      return doc?.folio || doc?.number || doc?.idDocNo || doc?.name || "—";
    }
    case "documents":
    case "boletaPdf": {
      const doc = (order.documents || []).find((d) => {
        const t = String(d?.type || "").toLowerCase();
        return (
          t.includes("boleta") ||
          t.includes("invoice") ||
          t.includes("dte") ||
          t.includes("factura")
        );
      });

      return doc?.url || doc?.URL || doc?.link || doc?.pdf || null;
    }
    case "message":
    case "mensaje":
      return order.message || "—";
    default:
      return order[key];
  }
};

const formatColumnValue = (key, order) => {
  const value = getColumnRawValue(order, key);
  if (value === null || value === undefined || value === "—") return "—";

  if (
    [
      "creation",
      "fechaOrigen",
      "brand",
      "fechaMiddify",
      "lastUpdate",
      "fechaActualizacion",
    ].includes(key)
  ) {
    return formatDateTime(value);
  }
  if (["costoEnvio", "totalPagado", "subTotal", "total"].includes(key))
    return formatCurrency(value);
  return String(value);
};

const buildColumnDefinition = (column) => {
  const base = {
    field: column.value,
    headerName: column.title ?? column.value,
    sortable: false,
    flex: 1,
    minWidth: 160,
    renderCell: ({ row }) => (
      <span className="text-sm text-slate-700">{row[column.value] ?? "—"}</span>
    ),
  };

  switch (column.value) {
    case "marketPlace":
    case "marketplace":
    case "logoTienda":
      return {
        ...base,
        minWidth: 100,
        align: "center",
        headerAlign: "center",
        renderCell: ({ row }) => {
          const brandName = row.rawOrder?.marketPlace?.name || "";
          const logoUrl = getLogoUrl(brandName);
          return logoUrl ? (
            <img
              src={logoUrl}
              alt={brandName}
              className="h-8 w-auto object-contain"
              title={brandName}
            />
          ) : (
            <span className="text-xs font-bold text-slate-500 uppercase">
              {brandName.substring(0, 8)}
            </span>
          );
        },
      };

    case "stages":
    case "estadoMiddify":
      return {
        ...base,
        minWidth: 150,
        renderCell: ({ row }) => {
          const val = String(row[column.value] || "").toLowerCase();
          const isSuccess =
            val.includes("procesada") || val.includes("success");
          const isError = val.includes("error") || val.includes("descartada");

          let colors = "bg-slate-100 text-slate-700 border-slate-200"; // Gris
          if (isSuccess)
            colors = "bg-emerald-50 text-emerald-700 border-emerald-200"; // Verde
          if (isError) colors = "bg-rose-50 text-rose-700 border-rose-200"; // Rojo

          return (
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${colors} capitalize`}
            >
              {row[column.value] ?? "—"}
            </span>
          );
        },
      };
    case "status":
    case "estadoOrigen":
      return {
        ...base,
        minWidth: 150,
        renderCell: ({ row }) => {
          const rawStatus = String(row[column.value] || "");
          const val = rawStatus.toLowerCase().trim();
          const STATUS_TRANSLATIONS = {
            abandoned: "Abandonada",
            "pending payment": "Pago Pendiente",
            paid: "Pagada",
            shipped: "Enviada",
            delivered: "Entregada",
            canceled: "Cancelada",
            cancelled: "Cancelada",
            open: "Abierta",
            created: "Creada",
            unfulfilled: "No Procesada",
            fulfilled: "Procesada",
            closed: "Cerrada",
            confirmed: "Confirmado",
            "ready-for-handling": "Lista para Preparación",
            handling: "En Preparación",
            pending: "Pendiente",
            ready_to_ship: "Lista para Envío",
            acknowledged: "Recibida",
            close: "Cerrada",
          };
          const displayStatus =
            STATUS_TRANSLATIONS[val] ||
            rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

          return (
            <span className="text-sm font-medium text-slate-700 capitalize">
              {displayStatus}
            </span>
          );
        },
      };

    case "documents":
    case "boletaPdf":
      return {
        ...base,
        minWidth: 90,
        align: "center",
        headerAlign: "center",
        renderCell: ({ row }) => {
          const pdfUrl = row[column.value];
          if (!pdfUrl || pdfUrl === "—") {
            return (
              <svg
                className="h-5 w-5 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            );
          }
          return (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
              title="Ver Boleta PDF"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </a>
          );
        },
      };
    case "_id":
    case "idOrden":
      return {
        ...base,
        minWidth: 160,
        renderCell: ({ row }) => (
          <span className="font-mono text-xs text-slate-600">
            {row.displayId}
          </span>
        ),
      };

    case "message":
    case "mensaje":
      return {
        ...base,
        minWidth: 200,
        renderCell: ({ row }) => (
          <span
            className="text-xs text-slate-500 truncate"
            title={row[column.value]}
          >
            {row[column.value]}
          </span>
        ),
      };

    case "subTotal":
    case "total":
    case "costoEnvio":
    case "totalPagado":
      return {
        ...base,
        align: "right",
        headerAlign: "right",
        minWidth: 120,
        renderCell: ({ row }) => (
          <span className="text-sm font-medium text-slate-700">
            {row[column.value]}
          </span>
        ),
      };

    default:
      return base;
  }
};

export const useOrdersTableLogic = ({
  token = null,
  selectedTenantId = null,
  selectedTenantName = null,
  selectedOrderState = null,
  onSelectOrder = () => {},
  onExportSuccess = () => {},
  orderIdFilter,
  dateFilter,
}) => {
  const {
    paginationModel,
    setPaginationModel,
    rowSelectionModel,
    refreshTrigger,
    handleToggleRowSelection,
    handleToggleAllRows,
    handleSelectionModelChange,
    triggerRefresh,
    resetPagination,
  } = useTableState({ initialPageSize: 100 });

  //filtro por marketplace
  const [selectedMarketplace, setSelectedMarketplace] = useState("");

  const apiStatus = selectedOrderState
    ? selectedOrderState.replace(/_/g, " ")
    : undefined;
  const queryClient = useQueryClient();

  const queryParams = useMemo(
    () => ({
      tenantId: selectedTenantId || undefined,
      tenantName: selectedTenantName || undefined,
      state: apiStatus,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      marketPlace: selectedMarketplace || undefined,
      orderId: orderIdFilter,
      date: dateFilter,
    }),
    [
      selectedTenantId,
      selectedTenantName,
      apiStatus,
      paginationModel.page,
      paginationModel.pageSize,
      selectedMarketplace,
      orderIdFilter,
      dateFilter,
    ],
  );

  const {
    data: ordersData,
    isLoading: loadingOrders,
    error,
  } = useOrdersData(token, queryParams, refreshTrigger);

  useEffect(() => {
    if (!token || !selectedTenantId || selectedTenantId === "") return;
    const currentPage = paginationModel.page + 1;
    const targets = [
      currentPage + 1,
      currentPage - 1 > 0 ? currentPage - 1 : null,
      currentPage === 1 ? 3 : null,
    ].filter(Boolean);

    targets.forEach((page) => {
      const prefetchParams = { ...queryParams, page };
      queryClient.prefetchQuery({
        queryKey: ["orders", token, prefetchParams, refreshTrigger],
        queryFn: ({ signal }) =>
          fetchOrdersByState({ token, params: prefetchParams, signal }),
        staleTime: 1000 * 120,
        cacheTime: 1000 * 600,
      });
    });
  }, [
    token,
    selectedTenantId,
    queryParams,
    refreshTrigger,
    paginationModel.page,
    queryClient,
  ]);

  useEffect(() => {
    if (!token || !selectedTenantId || selectedTenantId === "") return;
    const candidateStates = PREFETCH_STATES.filter((s) => s !== apiStatus);
    candidateStates.forEach((state) => {
      const params = {
        ...queryParams,
        state: state,
        page: 1,
        pageSize: paginationModel.pageSize,
      };
      queryClient.prefetchQuery({
        queryKey: ["orders", token, params, refreshTrigger],
        queryFn: ({ signal }) => fetchOrdersByState({ token, params, signal }),
        staleTime: 1000 * 120,
        cacheTime: 1000 * 600,
      });
    });
  }, [
    token,
    selectedTenantId,
    queryParams,
    apiStatus,
    paginationModel.pageSize,
    refreshTrigger,
    queryClient,
  ]);

  const { data: columnsData } = useTenantColumns(
    token,
    selectedTenantId,
    selectedTenantName,
  );

  const { isExporting, startExport } = useExportOrders({
    token,
    onSuccess: onExportSuccess,
  });

  useEffect(() => {
    resetPagination();
  }, [selectedTenantId, selectedOrderState, resetPagination]);

  const activeColumns = useMemo(() => {
    let mergedColumns = [...DASHBOARD_COLUMNS_TEMPLATE];

    if (Array.isArray(columnsData) && columnsData.length > 0) {
      mergedColumns = mergedColumns.map((templateCol) => {
        const backendCol = columnsData.find(
          (bc) => bc.value === templateCol.value,
        );
        return {
          ...templateCol,

          active: backendCol ? backendCol.active : templateCol.active,
        };
      });
    }

    return mergedColumns
      .filter((c) => c?.active)
      .sort(
        (a, b) =>
          (a.sortOrder ?? a.originalIndex ?? 0) -
          (b.sortOrder ?? b.originalIndex ?? 0),
      );
  }, [columnsData]);

  const orders = ordersData?.orders || [];
  const meta = ordersData?.meta || {};

  const rows = useMemo(() => {
    return orders.map((order, index) => {
      const orderId = order._id ?? order.id ?? `order-${index}`;
      const tenantId = order.tennantId ?? order.tenantId ?? "";

      const row = {
        id: orderId,
        _id: orderId,
        displayId:
          order.extras?.idOrderMarket ||
          order.idOrderMarket ||
          order.marketPlace?.orderId ||
          order.market?.orderId ||
          "Sin ID",
        internalId:
          order.internalId ||
          order.idOrderMarket ||
          order.marketPlace?.orderId ||
          orderId,
        customerName: order.customerName || "",
        total:
          typeof order.total === "object"
            ? order.total?.amount
            : order.total || order.marketPlace?.total || 0,
        status: order.status || order.state || order.marketPlace?.status || "—",
        creation: order.creation || order.marketPlace?.creation || "",
        tenantId,
        rawOrder: order,
      };
      activeColumns.forEach((col) => {
        if (col.value !== "_id") {
          row[col.value] = formatColumnValue(col.value, order);
        }
      });

      return row;
    });
  }, [orders, activeColumns]);
  //Cambiar solo a estados finales
  const isStateChangeLocked = useMemo(() => {
    if (!rowSelectionModel || rowSelectionModel.length === 0) return false;

    const lockedStates = [
      "procesada",
      "success",
      "error",
      "failed",
      "descartada",
      "eliminada",
    ];

    return rowSelectionModel.some((id) => {
      const order = rows.find((r) => r.id === id);
      if (!order) return false;
      const state = String(order.status || order.state || "")
        .toLowerCase()
        .trim();
      return lockedStates.includes(state);
    });
  }, [rowSelectionModel, rows]);

  const columns = useMemo(() => {
    const baseColumns = activeColumns.map(buildColumnDefinition);

    baseColumns.push({
      field: "detalles",
      headerName: "DETALLES",
      sortable: false,
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectOrder(row);
          }}
          className="flex h-full w-full items-center justify-center text-indigo-600 transition-colors hover:text-indigo-800"
          title="Ver Detalles"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      ),
    });

    return baseColumns;
  }, [activeColumns, onSelectOrder]);

  const rowCount = useMemo(() => {
    if (meta?.totalPages && meta?.pageSize)
      return meta.totalPages * meta.pageSize;
    if (meta?.total) return meta.total;
    return orders.length;
  }, [meta, orders.length]);

  const getSelectedOrderIds = useCallback(
    () =>
      rows.filter((r) => rowSelectionModel.includes(r.id)).map((r) => r._id),
    [rows, rowSelectionModel],
  );

  const getSelectedOrders = useCallback(
    () =>
      rows
        .filter((r) => rowSelectionModel.includes(r.id))
        .map((r) => r.rawOrder),
    [rows, rowSelectionModel],
  );

  const formatOrdersForExportFunc = useCallback(
    (list) => {
      return list.map((order, i) => {
        const row = { id: i };
        activeColumns.forEach(
          (c) => (row[c.value] = formatColumnValue(c.value, order)),
        );
        return row;
      });
    },
    [activeColumns],
  );

  //Antes
  /*const handleExport = useCallback(() => {
    const filters = {
      state: apiStatus,
      tenantId: selectedTenantId,
      tenantName: selectedTenantName,
    };
    Object.keys(filters).forEach((k) => !filters[k] && delete filters[k]);
    startExport(filters);
  }, [apiStatus, selectedTenantId, selectedTenantName, startExport]);*/
  const handleExport = useCallback(() => {
    const filters = {
      state: apiStatus,
      tenantId: selectedTenantId,
      tenantName: selectedTenantName,
    };

    const selectedIds = getSelectedOrderIds();
    if (selectedIds && selectedIds.length > 0) {
      filters.orderIds = selectedIds;
    }

    Object.keys(filters).forEach((k) => !filters[k] && delete filters[k]);

    startExport(filters);
  }, [
    apiStatus,
    selectedTenantId,
    selectedTenantName,
    startExport,
    getSelectedOrderIds,
  ]);

  return {
    loading: loadingOrders,
    error,
    selectedStateLabel: getSelectedStateLabel(selectedOrderState),
    selectedRowIds: rowSelectionModel,
    getSelectedOrderIds,
    getSelectedOrders,
    isStateChangeLocked,
    selectedMarketplace,
    setSelectedMarketplace,
    clearSelection: () => handleSelectionModelChange([]),
    refreshData: triggerRefresh,
    formatOrdersForExport: formatOrdersForExportFunc,
    exporting: isExporting,
    onExport: handleExport,
    grid: {
      rows,
      columns,
      loading: loadingOrders,
      paginationModel,
      onPaginationModelChange: setPaginationModel,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      rowCount: Number(rowCount) || 0,
      onViewDetails: (row) => onSelectOrder(row),

      rowSelectionModel,
      onRowSelectionModelChange: handleSelectionModelChange,
      onToggleRowSelection: handleToggleRowSelection,
      onToggleAllRows: (ids) =>
        handleToggleAllRows(ids || rows.map((r) => r.id)),
      checkboxSelection: true,
    },
  };
};
