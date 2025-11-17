import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useOrdersByState,
} from "../../api/orders/getOrdersByState";
import {
  formatCurrency,
  formatDateTime,
  getSelectedStateLabel,
  normalizeStatusKey,
  ORDER_STATE_LOOKUP,
} from "./helpers";

const PAGE_SIZE_OPTIONS_BASE = [10, 20, 50, 100];

export const useOrdersTableLogic = ({
  token = null,
  selectedTenantId = null,
  selectedOrderState = null,
  onSelectOrder = () => {},
}) => {
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState(() => new Set());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const apiStatus = selectedOrderState
    ? selectedOrderState.replace(/_/g, " ")
    : null;

  const { orders, meta, loading, error } = useOrdersByState(
    token,
    {
      tenantId: selectedTenantId ?? undefined,
      status: apiStatus ?? undefined,
      page,
      pageSize,
    },
    refreshTrigger
  );

  useEffect(() => {
    setPage(1);
  }, [selectedTenantId, selectedOrderState]);

  const totalPagesFromMeta = meta?.totalPages ?? null;
  const currentPage = meta?.page ?? page;
  const displayOrders = Array.isArray(orders) ? orders : [];

  useEffect(() => {
    if (totalPagesFromMeta && page > totalPagesFromMeta) {
      setPage(totalPagesFromMeta);
    }
  }, [page, totalPagesFromMeta]);

  const pageSizeOptions = useMemo(() => {
    if (PAGE_SIZE_OPTIONS_BASE.includes(pageSize)) {
      return PAGE_SIZE_OPTIONS_BASE;
    }
    return [...PAGE_SIZE_OPTIONS_BASE, pageSize].sort((a, b) => a - b);
  }, [pageSize]);

  const dataGridRows = useMemo(() => {
    return displayOrders.map((order, index) => {
      const orderId = order._id ?? order.id ?? `order-${index}`;
      const tenantId = order.tennantId ?? order.tenantId ?? "";
      const uniqueId = `${orderId}-${tenantId || index}`;
      const marketplace = order.marketPlace ?? {};
      const statusKey = normalizeStatusKey(order.status);
      const statusLabel =
        (statusKey && ORDER_STATE_LOOKUP[statusKey]) ?? order.status ?? "—";
      const creationDate = marketplace.creation ?? order.creation;
      const lastUpdateDate = marketplace.lastUpdate ?? order.lastUpdate;
      const totalAmount =
        order.total?.amount ?? marketplace.total?.amount ?? null;

      return {
        id: uniqueId,
        marketplaceOrder: marketplace.orderId ?? "—",
        internalId: orderId,
        _id: orderId,
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

  useEffect(() => {
    setSelectedRowIds((prevSelected) => {
      const nextSelected = new Set();
      dataGridRows.forEach((row) => {
        if (prevSelected.has(row.id)) {
          nextSelected.add(row.id);
        }
      });
      return nextSelected;
    });
  }, [dataGridRows]);

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

  const allRowIds = useMemo(() => dataGridRows.map((row) => row.id), [dataGridRows]);

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

  const columns = useMemo(
    () => [
      {
        field: "select",
        headerName: "",
        width: 52,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderHeader: () => (
          <input
            type="checkbox"
            aria-label="Seleccionar todas las órdenes visibles"
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
              aria-label={`Seleccionar orden ${row.marketplaceOrder}`}
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
      },
      {
        field: "_id",
        headerName: "ID",
        flex: 1,
        minWidth: 180,
        sortable: false,
        renderCell: ({ row }) => (
          <span className="font-mono text-sm text-slate-700">
            {row._id}
          </span>
        ),
      },
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
    [allSelected, handleToggleAllRows, handleToggleRowSelection, selectedRowIds]
  );

  const paginationModel = useMemo(() => {
    return {
      page: Math.max((currentPage ?? 1) - 1, 0),
      pageSize,
    };
  }, [currentPage, pageSize]);

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

  const rowCount = Number.isFinite(Number(meta?.total))
    ? Number(meta?.total)
    : dataGridRows.length;

  const handleRowClick = useCallback(
    (params) => {
      if (params?.row?.rawOrder) {
        onSelectOrder(params.row.rawOrder);
      }
    },
    [onSelectOrder]
  );

  const clearSelection = useCallback(() => {
    setSelectedRowIds(new Set());
  }, []);

  const getSelectedOrderIds = useCallback(() => {
    const selectedIds = [];
    dataGridRows.forEach((row) => {
      if (selectedRowIds.has(row.id)) {
        selectedIds.push(row.internalId);
      }
    });
    return selectedIds;
  }, [dataGridRows, selectedRowIds]);

  const refreshData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    loading,
    error,
    selectedStateLabel: getSelectedStateLabel(selectedOrderState),
    selectedRowIds: Array.from(selectedRowIds),
    getSelectedOrderIds,
    clearSelection,
    refreshData,
    grid: {
      rows: dataGridRows,
      columns,
      loading,
      paginationModel,
      onPaginationModelChange: handlePaginationModelChange,
      paginationMode: "server",
      pageSizeOptions,
      rowCount,
      onRowClick: handleRowClick,
    },
  };
};

