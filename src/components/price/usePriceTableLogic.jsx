import { useCallback, useMemo, useEffect } from "react";
import { usePrice } from "../../api/price/getPrice";
import { getProductColumns } from "../products/helpers";
import { useTableState } from "../../hooks/useTableState";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];

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

    const { products, loading, error, total } = usePrice({
        token,
        tenantId: selectedTenantId,
        tenantName: selectedTenantName,
        state: resolvedPriceState,
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        refreshTrigger,
    });

    useEffect(() => {
        resetPagination();
    }, [selectedTenantId, resolvedPriceState, resetPagination]);

    const rows = useMemo(() => {
        return (products || []).map((p, i) => ({ id: p._id || i, ...p }));
    }, [products]);

    const handleViewDetails = useCallback((id) => {
        navigate(`/products/${id}`, { state: { from: 'price' } });
    }, [navigate]);

    const handleRefresh = useCallback(() => {
        triggerRefresh();
        onSuccess?.();
    }, [triggerRefresh, onSuccess]);

    const getSelectedIds = useCallback(() => {
        return rowSelectionModel;
    }, [rowSelectionModel]);

    const columns = useMemo(() => getProductColumns({ 
        onViewDetails: handleViewDetails, 
        showPrice, 
        showStock 
    }), [handleViewDetails, showPrice, showStock]);

    return {
        loading,
        error,
        total,
        selectedRowIds: new Set(rowSelectionModel),
        getSelectedIds,
        refreshData: handleRefresh,
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
            onRowSelectionModelChange: handleSelectionModelChange,
            onToggleRowSelection: handleToggleRowSelection,
            onToggleAllRows: handleToggleAllRows,
            checkboxSelection: true,
        }
    };
};
