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
    const [searchTerm, setSearchTerm] = useState("");
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 });

    const handleViewDetails = (id) => {
        navigate(`/products/${id}`);
    };

    // Paginación en servidor
    const { products, loading, error, total } = useProducts({
        token,
        tenantId: selectedTenantId,
        tenantName: selectedTenantName,
        state: resolvedProductState,
        page: paginationModel.page + 1, // API es 1-based
        pageSize: paginationModel.pageSize,
        refreshTrigger,
    });

    // Al cambiar filtros importantes, resetear a página 1
    useEffect(() => {
        setPaginationModel(prev => ({ ...prev, page: 0 }));
        setSelectedRowIds(new Set());
    }, [selectedTenantId, resolvedProductState, searchTerm]);

    const filteredRows = useMemo(() => {
        const list = products || [];
        return list.map((p, i) => ({ id: p._id || i, ...p }));
    }, [products]);

    const handleToggleRowSelection = useCallback((rowId) => {
        setSelectedRowIds(prev => {
            const next = new Set(prev);
            next.has(rowId) ? next.delete(rowId) : next.add(rowId);
            return next;
        });
    }, []);

    const handleToggleAllRows = useCallback(() => {
        setSelectedRowIds(prev => {
            const allIds = new Set(filteredRows.map(r => r.id));
            return allIds.size > 0 && [...allIds].every(id => prev.has(id)) 
                ? new Set() 
                : allIds;
        });
    }, [filteredRows]);

    const getSelectedProductIds = useCallback(() => 
        filteredRows.filter(r => selectedRowIds.has(r.id)).map(r => r._id || r.id),
        [filteredRows, selectedRowIds]
    );

    const refreshData = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
        setSelectedRowIds(new Set());
    }, []);

    const handlePaginationChange = (model) => {
        setPaginationModel(model);
        setSelectedRowIds(new Set());
    };

    const handleExportProducts = async () => {
        if (!token) return;
        setIsExporting(true);
        try {
            const response = await postExportProducts(token, {
                tenantId: selectedTenantId,
                tenantName: selectedTenantName,
            });
            if (response?.message) {
                alertsProducts.exportSuccess(response.message);
            }
        } catch (err) {
            alertsProducts.exportError();
        } finally {
            setIsExporting(false);
        }
    };

    if (error && !loading) return <div className="py-12 text-center text-red-500">Error: {error.message}</div>;

    return (
        <div className="space-y-4">
            <ProductsTableHeader
                title="Productos"
                subtitle={selectedTenantName ? `Productos de ${selectedTenantName}` : "Gestión de productos"}
                infoChips={total > 0 ? [{ id: "total", label: "Encontrados", value: total.toLocaleString('es-ES') }] : []}
                onExportData={handleExportProducts}
                isExportingData={isExporting}
                exportDisabled={loading || !total}
                selectedCount={selectedRowIds.size}
                getSelectedProductIds={getSelectedProductIds}
                token={token}
                user={user}
                tenantId={selectedTenantId}
                tenantName={selectedTenantName}
                onDeleteSuccess={refreshData}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <ProductsTableGrid
                rows={filteredRows}
                loading={loading}
                rowCount={total || 0}
                page={paginationModel.page}
                pageSize={paginationModel.pageSize}
                onPaginationModelChange={handlePaginationChange}
                selectedRowIds={selectedRowIds}
                onToggleRowSelection={handleToggleRowSelection}
                onToggleAllRows={handleToggleAllRows}
                onViewDetails={handleViewDetails}
                showPrice={false}
                showStock={true}
            />
        </div>
    );
};

export default Products;
