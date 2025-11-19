import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DASHBOARD_COLUMNS_TEMPLATE,
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

const getColumnRawValue = (order, key) => {
  if (!order) return null;
  switch (key) {
    case "_id":
      return order._id ?? order.id ?? null;
    case "tennantId":
    case "tenantId":
      return order.tennantId ?? order.tenantId ?? null;
    case "tennantName":
    case "tenantName":
      return order.tennantName ?? order.tenantName ?? null;
    default:
      break;
  }

  if (order[key] !== undefined) {
    return order[key];
  }

  if (order.marketPlace && order.marketPlace[key] !== undefined) {
    return order.marketPlace[key];
  }

  return null;
};

const formatColumnValue = (key, order) => {
  const value = getColumnRawValue(order, key);
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  switch (key) {
    case "creation":
    case "lastUpdate":
      return formatDateTime(value);
    case "status": {
      const statusKey = normalizeStatusKey(value);
      return (statusKey && ORDER_STATE_LOOKUP[statusKey]) ?? String(value);
    }
    case "total":
    case "subTotal": {
      const amount =
        (typeof value === "object" && value !== null && "amount" in value
          ? value.amount
          : value);
      return Number.isFinite(Number(amount))
        ? formatCurrency(Number(amount))
        : String(value);
    }
    case "attempts":
    case "itemQuantity":
      return Number.isFinite(Number(value)) ? Number(value).toString() : String(value);
    case "discounts":
    case "errorDetail":
    case "message":
    case "marketPlace":
    case "omniChannel":
    case "taxes":
    case "extras":
    case "documents":
    case "comments":
    case "stages": {
      if (typeof value === "object") {
        try {
          return JSON.stringify(value);
        } catch {
          return "[object]";
        }
      }
      return String(value);
    }
    default:
      return String(value);
  }
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

  if (column.value === "_id") {
    return {
      ...base,
      minWidth: 200,
      renderCell: ({ row }) => (
        <span className="font-mono text-sm text-slate-700">
          {row[column.value] ?? "—"}
        </span>
      ),
    };
  }

  if (["total", "subTotal"].includes(column.value)) {
    return {
      ...base,
      align: "right",
      headerAlign: "right",
      minWidth: 140,
    };
  }

  if (["creation", "lastUpdate"].includes(column.value)) {
    return {
      ...base,
      minWidth: 180,
    };
  }

  return base;
};

export const useOrdersTableLogic = ({
  token = null,
  selectedTenantId = null,
  selectedTenantName = null,
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

  const { orders, meta, columns: apiColumns, loading, error } = useOrdersByState(
    token,
    {
      tenantId: selectedTenantId ?? undefined,
      tenantName: selectedTenantName ?? undefined,
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

  const activeColumns = useMemo(() => {
    const base =
      Array.isArray(apiColumns) && apiColumns.length > 0
        ? apiColumns
        : DASHBOARD_COLUMNS_TEMPLATE;
    return base.filter((column) => column?.hasFilter === true);
  }, [apiColumns]);

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

      const row = {
        id: uniqueId,
        internalId: orderId,
        tenantId,
        rawOrder: order,
      };

      activeColumns.forEach((column) => {
        row[column.value] = formatColumnValue(column.value, order);
      });

      return row;
    });
  }, [activeColumns, displayOrders]);

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

  const columns = useMemo(() => {
    const selectColumn = {
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
            aria-label={`Seleccionar orden ${row._id ?? row.id}`}
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
    };

    const dynamicColumns = activeColumns.map(buildColumnDefinition);

    return [selectColumn, ...dynamicColumns];
  }, [
    activeColumns,
    allSelected,
    handleToggleAllRows,
    handleToggleRowSelection,
    selectedRowIds,
  ]);

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

