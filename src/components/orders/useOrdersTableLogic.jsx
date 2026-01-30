import { useState, useCallback, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DASHBOARD_COLUMNS_TEMPLATE,
  useOrdersData,
  useTenantColumns
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

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const PREFETCH_STATES = ["deleted", "en proceso"];

const getColumnRawValue = (order, key) => {
  if (!order) return null;
  if (key === "_id" || key === "id") return order._id ?? order.id;
  if (key === "tennantId" || key === "tenantId") return order.tennantId ?? order.tenantId;
  if (key === "tennantName" || key === "tenantName") return order.tennantName ?? order.tenantName;
  return order[key] ?? order.marketPlace?.[key] ?? null;
};

const FORMATTERS = {
  creation: formatDateTime,
  lastUpdate: formatDateTime,
  status: (value) => {
    const statusKey = normalizeStatusKey(value);
    return (statusKey && ORDER_STATE_LOOKUP[statusKey]) ?? String(value);
  },
  total: (value) => {
    const amount = (typeof value === "object" && value !== null && "amount" in value) ? value.amount : value;
    return formatCurrency(amount);
  },
  subTotal: (value) => {
    const amount = (typeof value === "object" && value !== null && "amount" in value) ? value.amount : value;
    return formatCurrency(amount);
  },
  marketPlace: (value) => typeof value === "object" ? (value.name || value.displayName || String(value)) : String(value),
  omniChannel: (value) => typeof value === "object" ? (value.name || value.displayName || String(value)) : String(value),
  errorDetail: (value) => typeof value === "object" ? (value.message || value.detail || "") : String(value),
};

const formatColumnValue = (key, order) => {
  const value = getColumnRawValue(order, key);
  if (value === null || value === undefined || value === "") return "—";

  const formatter = FORMATTERS[key];
  if (formatter) return formatter(value);

  return typeof value === "object" ? "[Detalle]" : String(value);
};

const buildColumnDefinition = (column) => {
  const base = {
    field: column.value,
    headerName: column.title ?? column.value,
    sortable: false,
    flex: 1,
    minWidth: 160,
    renderCell: ({ row }) => <span className="text-sm text-slate-700">{row[column.value] ?? "—"}</span>,
  };

  if (column.value === "_id") {
    return {
      ...base,
      minWidth: 200,
      renderCell: ({ row }) => <span className="font-mono text-sm text-slate-700">{row[column.value] ?? "—"}</span>,
    };
  }

  if (["total", "subTotal"].includes(column.value)) {
    return { ...base, align: "right", headerAlign: "right", minWidth: 140 };
  }

  if (["creation", "lastUpdate"].includes(column.value)) {
    return { ...base, minWidth: 180 };
  }

  return base;
};

export const useOrdersTableLogic = ({
  token = null,
  selectedTenantId = null,
  selectedTenantName = null,
  selectedOrderState = null,
  onSelectOrder = () => { },
  onExportSuccess = () => { },
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

  const apiStatus = selectedOrderState ? selectedOrderState.replace(/_/g, " ") : undefined;
  const queryClient = useQueryClient();

  const queryParams = useMemo(() => ({
    tenantId: selectedTenantId || undefined,
    tenantName: selectedTenantName || undefined,
    state: apiStatus,
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  }), [selectedTenantId, selectedTenantName, apiStatus, paginationModel.page, paginationModel.pageSize]);

  const { data: ordersData, isLoading: loadingOrders, error } = useOrdersData(
    token,
    queryParams,
    refreshTrigger
  );

  useEffect(() => {
    if (!token) return;
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
        queryFn: ({ signal }) => fetchOrdersByState({ token, params: prefetchParams, signal }),
        staleTime: 1000 * 120,
        cacheTime: 1000 * 600,
      });
    });
  }, [token, queryParams, refreshTrigger, paginationModel.page, queryClient]);

  useEffect(() => {
    if (!token) return;
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
  }, [token, queryParams, apiStatus, paginationModel.pageSize, refreshTrigger, queryClient]);

  const { data: columnsData } = useTenantColumns(token, selectedTenantId, selectedTenantName);
  const { isExporting, startExport } = useExportOrders({ token, onSuccess: onExportSuccess });

  useEffect(() => {
    resetPagination();
  }, [selectedTenantId, selectedOrderState, resetPagination]);

  const activeColumns = useMemo(() => {
    const base = Array.isArray(columnsData) && columnsData.length > 0 ? columnsData : DASHBOARD_COLUMNS_TEMPLATE;
    return base
      .filter((c) => c?.active)
      .sort((a, b) => (a.sortOrder ?? a.originalIndex ?? 0) - (b.sortOrder ?? b.originalIndex ?? 0));
  }, [columnsData]);

  const orders = ordersData?.orders || [];
  const meta = ordersData?.meta || {};

  const rows = useMemo(() => {
    return orders.map((order, index) => {
      const orderId = order._id ?? order.id ?? `order-${index}`;
      const tenantId = order.tennantId ?? order.tenantId ?? "";
      // Ensure uniqueId is truly unique by appending index if tenantId is missing or to be safe
      const uniqueId = order._id ? `${order._id}-${index}` : `${orderId}-${tenantId || "no-tenant"}-${index}`;

      const row = {
        id: uniqueId,
        internalId: orderId,
        tenantId,
        rawOrder: order,
      };

      const len = activeColumns.length;
      for (let i = 0; i < len; i++) {
        const col = activeColumns[i];
        row[col.value] = formatColumnValue(col.value, order);
      }

      return row;
    });
  }, [orders, activeColumns]);

  const columns = useMemo(() => {
    return activeColumns.map(buildColumnDefinition);
  }, [activeColumns]);


  const rowCount = useMemo(() => {
    if (meta?.totalPages && meta?.pageSize) return meta.totalPages * meta.pageSize;
    if (meta?.total) return meta.total;
    return orders.length;
  }, [meta, orders.length]);

  const getSelectedOrderIds = useCallback(() => 
    rows.filter(r => rowSelectionModel.includes(r.id)).map(r => r.internalId),
  [rows, rowSelectionModel]);

  const getSelectedOrders = useCallback(() => 
    rows.filter(r => rowSelectionModel.includes(r.id)).map(r => r.rawOrder),
  [rows, rowSelectionModel]);

  const formatOrdersForExportFunc = useCallback((list) => {
      return list.map((order, i) => {
        const row = { id: i };
        activeColumns.forEach(c => row[c.value] = formatColumnValue(c.value, order));
        return row;
      });
  }, [activeColumns]);

  const handleExport = useCallback(() => {
      const filters = { state: apiStatus, tenantId: selectedTenantId, tenantName: selectedTenantName };
      Object.keys(filters).forEach(k => !filters[k] && delete filters[k]);
      startExport(filters);
  }, [apiStatus, selectedTenantId, selectedTenantName, startExport]);

  return {
    loading: loadingOrders,
    error,
    selectedStateLabel: getSelectedStateLabel(selectedOrderState),
    selectedRowIds: rowSelectionModel, 
    getSelectedOrderIds,
    getSelectedOrders,
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
      onToggleAllRows: (ids) => handleToggleAllRows(ids || rows.map(r => r.id)),
      checkboxSelection: true,
    },
  };
};
