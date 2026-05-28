import { useState, useCallback, useMemo, useEffect } from "react";
import { useProducts } from "../../api/products/getProducts";
import { postExportProducts } from "../../api/products/postExportProducts";
import { useExportProducts } from "./useExportProducts";
import { alertsProducts } from "../../utils/alertsProducts";
import { getProductColumns } from "./helpers";
import { useTableState } from "../../hooks/useTableState";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];
const PRODUCT_STATUS_TRANSLATIONS = {
  SUCCESS: "Exitoso",
  CREATED: "Creado",
  ERROR: "Error",
  FAILED: "Error",
  DESCARTED: "Descartada",
};

const STATUS_MAP = {
  procesada: "success",
  error: "error",
  creada: "created",
  fallido: "failed",
  descartada: "discarded",
};
export const useProductsTableLogic = ({
  token = null,
  selectedTenantId = null,
  selectedTenantName = null,
  resolvedProductState = null,
  navigate,
  showPrice = false,
  showStock = true,
  sku,
}) => {
  const { isExporting, startExport } = useExportProducts({
    token,
    onSuccess: () =>
      alertsProducts.exportSuccess("¡Excel exportado correctamente!"),
    onError: () =>
      alertsProducts.exportError("Hubo un problema con la exportación"),
  });

  // Updated useTableState returns rowSelectionModel as Array now
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
  } = useTableState({ initialPageSize: 50 });

  const apiStatusTranslated = resolvedProductState
    ? STATUS_MAP[resolvedProductState.toLowerCase().trim()] ||
      resolvedProductState
    : null;

  const { products, loading, error, total } = useProducts({
    token,
    tenantId: selectedTenantId,
    tenantName: selectedTenantName,
    state: apiStatusTranslated,
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    refreshTrigger,
    sku,
  });

  useEffect(() => {
    resetPagination();
  }, [selectedTenantId, resolvedProductState, resetPagination]);

  const rows = useMemo(() => {
    return (products || []).map((p, i) => {
      const rawStatus = p.state || p.status || "";
      const translatedStatus = rawStatus
        ? PRODUCT_STATUS_TRANSLATIONS[String(rawStatus).toUpperCase()] ||
          rawStatus
        : "—";

      return {
        ...p,
        id: p._id || i,
        state: translatedStatus,
        status: translatedStatus,
        _rawState: rawStatus,
      };
    });
  }, [products]);

  //candado inteligente para roles
  const isStateChangeLockedForAdmin = useMemo(() => {
    if (!rowSelectionModel || rowSelectionModel.length === 0) return false;

    const lockedStates = [
      "success",
      "exitoso",
      "procesada",
      "error",
      "failed",
      "fallido",
      "aprobado",
      "rejected",
    ];

    return rowSelectionModel.some((id) => {
      const product = rows.find((r) => r.id === id);
      if (!product) return false;
      const state = String(product.state || product.status || "")
        .toLowerCase()
        .trim();
      return lockedStates.includes(state);
    });
  }, [rowSelectionModel, rows]);

  const handleViewDetails = useCallback(
    (id) => {
      navigate(`/products/${id}`);
    },
    [navigate],
  );

  const columns = useMemo(
    () =>
      getProductColumns({
        onViewDetails: handleViewDetails,
        showPrice,
        showStock,
      }),
    [handleViewDetails, showPrice, showStock],
  );

  const getSelectedProductIds = useCallback(() => {
    // rowSelectionModel is already an array of IDs
    return rowSelectionModel;
  }, [rowSelectionModel]);

  const handleExportProducts = useCallback(async () => {
    if (!token) return;

    const filters = {
      tenantId: selectedTenantId,
      tenantName: selectedTenantName,
      state: apiStatusTranslated,
      sku: sku,
    };

    const selectedIds = getSelectedProductIds();
    if (selectedIds && selectedIds.length > 0) {
      filters.productIds = selectedIds;
    }

    Object.keys(filters).forEach((key) => {
      if (!filters[key]) delete filters[key];
    });

    // Avisar visualmente
    alertsProducts.exportSuccess("Exportación en proceso...");
    startExport(filters);
  }, [
    token,
    selectedTenantId,
    selectedTenantName,
    apiStatusTranslated,
    sku,
    getSelectedProductIds,
    startExport,
  ]);
  return {
    loading,
    error,
    total,
    isStateChangeLockedForAdmin,
    selectedRowIds: new Set(rowSelectionModel),
    getSelectedProductIds,
    refreshData: triggerRefresh,
    isExporting,
    handleExportProducts,
    grid: {
      rows,
      columns,
      loading,
      rowCount: total || 0,
      paginationModel,
      onPaginationModelChange: setPaginationModel,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      onViewDetails: handleViewDetails,

      // Selection Props
      rowSelectionModel,
      onRowSelectionModelChange: (newSelectionModel) => {
        if (typeof handleSelectionModelChange === "function") {
          handleSelectionModelChange(newSelectionModel);
        }
      },
      keepNonExistentRowsSelected: true,
      checkboxSelection: true,
    },
  };
};
