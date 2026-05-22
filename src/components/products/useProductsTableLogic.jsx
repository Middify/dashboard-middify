import { useState, useCallback, useMemo, useEffect } from "react";
import { useProducts } from "../../api/products/getProducts";
import { postExportProducts } from "../../api/products/postExportProducts";
import { alertsProducts } from "../../utils/alertsProducts";
import { getProductColumns } from "./helpers";
import { useTableState } from "../../hooks/useTableState";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];

const STATUS_MAP = {
  procesada: "SUCCESS",
  error: "FAILED",
  creada: "CREATED",
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
  const [isExporting, setIsExporting] = useState(false);

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
    return (products || []).map((p, i) => ({ id: p._id || i, ...p }));
  }, [products]);

  //candado inteligente para roles
  const isStateChangeLockedForAdmin = useMemo(() => {
    if (!rowSelectionModel || rowSelectionModel.length === 0) return false;

    const lockedStates = [
      "success",
      "procesada",
      "error",
      "failed",
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
    setIsExporting(true);
    try {
      const response = await postExportProducts(token, {
        tenantId: selectedTenantId,
        tenantName: selectedTenantName,
      });
      if (response?.message) alertsProducts.exportSuccess(response.message);
    } catch (err) {
      alertsProducts.exportError();
    } finally {
      setIsExporting(false);
    }
  }, [token, selectedTenantId, selectedTenantName]);

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
