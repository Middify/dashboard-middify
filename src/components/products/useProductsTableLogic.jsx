import { useState, useCallback, useMemo, useEffect } from "react";
import { useProducts } from "../../api/products/getProducts";
import { postExportProducts } from "../../api/products/postExportProducts";
import { alertsProducts } from "../../utils/alertsProducts";
import { getProductColumns } from "./helpers";
import { useTableState } from "../../hooks/useTableState";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];

export const useProductsTableLogic = ({
    token = null,
    selectedTenantId = null,
    selectedTenantName = null,
    resolvedProductState = null,
    navigate,
    showPrice = false,
    showStock = true,
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

    const { products, loading, error, total } = useProducts({
        token,
        tenantId: selectedTenantId,
        tenantName: selectedTenantName,
        state: resolvedProductState,
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        refreshTrigger,
    });

    useEffect(() => {
        resetPagination();
    }, [selectedTenantId, resolvedProductState, resetPagination]);

    const rows = useMemo(() => {
        return (products || []).map((p, i) => ({ id: p._id || i, ...p }));
    }, [products]);

    const handleViewDetails = useCallback((id) => {
        navigate(`/products/${id}`);
    }, [navigate]);

    const columns = useMemo(() => getProductColumns({ 
        onViewDetails: handleViewDetails, 
        showPrice, 
        showStock 
    }), [handleViewDetails, showPrice, showStock]);

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
        selectedRowIds: new Set(rowSelectionModel), // Compatibility with Header props if needed
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
            onRowSelectionModelChange: handleSelectionModelChange,
            onToggleRowSelection: handleToggleRowSelection, // For mobile
            onToggleAllRows: handleToggleAllRows, // For mobile
            checkboxSelection: true,
        }
    };
};
