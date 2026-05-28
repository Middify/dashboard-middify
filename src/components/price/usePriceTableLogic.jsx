import { useCallback, useMemo, useEffect } from "react";
import { usePrice } from "../../api/price/getPrice";
import { getProductColumns } from "../products/helpers";
import { useTableState } from "../../hooks/useTableState";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];

const PRICE_STATUS_TRANSLATIONS = {
  SUCCESS: "Exitoso",
  CREATED: "Creado",
  ERROR: "Error",
  FAILED: "Error",
  DESCARTED: "Descartada",
};

export const usePriceTableLogic = ({
  token = null,
  selectedTenantId = null,
  selectedTenantName = null,
  resolvedPriceState = null,
  navigate,
  showPrice = true,
  showStock = false,
  onSuccess = () => {},
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
  } = useTableState({ initialPageSize: 50 });

  const priceResponse = usePrice({
    token,
    tenantId: selectedTenantId,
    tenantName: selectedTenantName,
    state: resolvedPriceState,
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    refreshTrigger,
  });

  const productsArray =
    priceResponse?.data?.products || priceResponse?.products || [];
  const totalRows = priceResponse?.data?.total || priceResponse?.total || 0;
  const isLoading = priceResponse?.isLoading || priceResponse?.loading || false;

  useEffect(() => {
    resetPagination();
  }, [selectedTenantId, resolvedPriceState, resetPagination]);

  const rows = useMemo(() => {
    const mappedRows = productsArray.map((p, i) => {
      let precioActual = p.price;
      let precioAnterior = p.oldPrice || null;

      if (typeof p.price === "object" && p.price !== null) {
        precioActual =
          p.price.precioVta || p.price.PrecioVta || p.price.PrecioBol || "—";
        precioAnterior = p.price.PrecioBol || p.price.precioBol || "—";
      }

      const rawStatus = p.estado || p.status || p.state;
      const translatedStatus = rawStatus
        ? PRICE_STATUS_TRANSLATIONS[String(rawStatus).toUpperCase()] ||
          rawStatus
        : "—";

      return {
        ...p,
        id: p._id || p.id || `price-${i}`,
        price: precioActual,
        oldPrice: precioAnterior,
        ingresoMiddify: p.createdDate || p.createdAt,
        actualizacion: p.updatedDate || p.updatedAt,
        estado: translatedStatus,
        status: translatedStatus,
        state: translatedStatus,
      };
    });

    return mappedRows;
  }, [productsArray]);

  const handleViewDetails = useCallback(
    (id) => {
      navigate(`/products/${id}`, { state: { from: "price" } });
    },
    [navigate],
  );

  const handleRefresh = useCallback(() => {
    triggerRefresh();
    onSuccess?.();
  }, [triggerRefresh, onSuccess]);

  const getSelectedIds = useCallback(() => {
    return rowSelectionModel;
  }, [rowSelectionModel]);

  const columns = useMemo(
    () =>
      getProductColumns({
        onViewDetails: handleViewDetails,
        showPrice,
        showStock,
      }),
    [handleViewDetails, showPrice, showStock],
  );

  return {
    loading: isLoading,
    error: priceResponse.error,
    total: totalRows,
    selectedRowIds: new Set(rowSelectionModel),
    getSelectedIds,
    refreshData: handleRefresh,
    grid: {
      rows,
      columns,
      loading: isLoading,
      rowCount: totalRows,
      paginationModel,
      onPaginationModelChange: setPaginationModel,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      onViewDetails: handleViewDetails,
      rowSelectionModel,
      onRowSelectionModelChange: handleSelectionModelChange,
      onToggleRowSelection: handleToggleRowSelection,
      onToggleAllRows: handleToggleAllRows,
      checkboxSelection: true,
    },
  };
};
