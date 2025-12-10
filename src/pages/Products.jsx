import { useState, useMemo, useCallback, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useProducts } from "../api/products/getProducts";
import { postExportProducts } from "../api/products/postExportProducts";
import ProductsTableHeader from "../components/products/ProductsTableHeader";
import ProductsTableGrid from "../components/products/ProductsTableGrid";
import { alertsProducts } from "../utils/alertsProducts";

const Products = () => {
    const { token, selectedTenantId, selectedTenantName, user, resolvedProductState } = useOutletContext() || {};
    const navigate = useNavigate();
    
    const [isExporting, setIsExporting] = useState(false);
    const [selectedRowIds, setSelectedRowIds] = useState(() => new Set());
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleViewDetails = (id) => {
        navigate(`/products/${id}`);
    };

    const { products, loading, error } = useProducts(
        token,
        selectedTenantId,
        selectedTenantName,
        refreshTrigger,
        resolvedProductState
    );

    // Filtrado directo sin normalización extra
    const filteredProducts = useMemo(() => {
        const productList = products?.products || [];
        if (!productList.length) return [];

        if (resolvedProductState) {
            const targetState = resolvedProductState === "descartada" ? "discard" : resolvedProductState;
            return productList.filter(p => p.state === targetState);
        }
        return productList.filter(p => p.state !== "discard");
    }, [products?.products, resolvedProductState]);

    // Mapeo mínimo solo para agregar id (necesario para el DataGrid)
    const rows = useMemo(() => 
        filteredProducts.map((p, i) => ({ id: p._id || i, ...p })), 
        [filteredProducts]
    );

    // Selección simplificada
    const handleToggleRowSelection = useCallback((rowId) => {
        setSelectedRowIds(prev => {
            const next = new Set(prev);
            next.has(rowId) ? next.delete(rowId) : next.add(rowId);
            return next;
        });
    }, []);

    // Sincronizar selección cuando cambian las filas
    useEffect(() => {
        setSelectedRowIds(prev => {
            const valid = new Set();
            rows.forEach(row => {
                if (prev.has(row.id)) valid.add(row.id);
            });
            return valid;
        });
    }, [rows]);

    const handleToggleAllRows = useCallback(() => {
        setSelectedRowIds(prev => {
            const allIds = new Set(rows.map(r => r.id));
            return allIds.size > 0 && [...allIds].every(id => prev.has(id)) 
                ? new Set() 
                : allIds;
        });
    }, [rows]);

    const getSelectedProductIds = useCallback(() => 
        rows.filter(r => selectedRowIds.has(r.id)).map(r => r._id || r.id),
        [rows, selectedRowIds]
    );

    const refreshData = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
        setSelectedRowIds(new Set());
    }, []);

    const handleExportProducts = async () => {
        if (!token) return;
        setIsExporting(true);
        try {
            const exportBody = {
                tenantId: selectedTenantId,
                tenantName: selectedTenantName,
                state: resolvedProductState === "descartada" ? "discard" : resolvedProductState
            };

            const response = await postExportProducts(token, exportBody);
            if (response?.message) {
                alertsProducts.exportSuccess(response.message);
            }
        } catch (err) {
            alertsProducts.exportError();
        } finally {
            setIsExporting(false);
        }
    };

    if (error && !loading) {
        return <div className="px-6 py-12 text-center text-sm text-red-500">Error: {error.message}</div>;
    }

    return (
        <div className="space-y-4 md:space-y-4">
            <ProductsTableHeader
                title="Productos"
                subtitle={selectedTenantName ? `Productos de ${selectedTenantName}` : "Gestión de productos"}
                infoChips={filteredProducts.length > 0 ? [{ id: "total", label: "Total", value: filteredProducts.length }] : []}
                onExportData={handleExportProducts}
                isExportingData={isExporting}
                exportDisabled={loading || !filteredProducts.length}
                selectedCount={selectedRowIds.size}
                getSelectedProductIds={getSelectedProductIds}
                token={token}
                user={user}
                tenantId={selectedTenantId}
                tenantName={selectedTenantName}
                onDeleteSuccess={refreshData}
            />

            <div className="md:mt-0">
                <ProductsTableGrid
                    rows={rows}
                    loading={loading}
                    error={error}
                    selectedRowIds={selectedRowIds}
                    onToggleRowSelection={handleToggleRowSelection}
                    onToggleAllRows={handleToggleAllRows}
                    onViewDetails={handleViewDetails}
                />
            </div>
        </div>
    );
};

export default Products;
