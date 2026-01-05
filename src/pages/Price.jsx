import { useState, useMemo, useCallback, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { usePrice } from "../api/price/getPrice";
import PriceTableHeader from "../components/price/PriceTableHeader";
import PriceTableGrid from "../components/price/PriceTableGrid";

const Price = () => {
    const { token, user, resolvedPriceState, selectedTenantName } = useOutletContext() || {};
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRowIds, setSelectedRowIds] = useState(() => new Set());
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 });
    
    const { products, total, loading, error } = usePrice({
        token,
        state: resolvedPriceState,
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        refreshTrigger,
    });

    useEffect(() => {
        setPaginationModel(prev => ({ ...prev, page: 0 }));
        setSelectedRowIds(new Set());
    }, [resolvedPriceState, searchTerm]);

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

    const getSelectedIds = useCallback(() => 
        filteredRows.filter(r => selectedRowIds.has(r.id)).map(r => r._id || r.id),
        [filteredRows, selectedRowIds]
    );

    const handleViewDetails = (id) => {
        navigate(`/products/${id}`, { state: { from: 'price' } });
    };

    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
        setSelectedRowIds(new Set());
    }, []);

    const handlePaginationChange = (model) => {
        setPaginationModel(model);
        setSelectedRowIds(new Set());
    };

    if (error && !loading) return <div className="py-12 text-center text-red-500">Error: {error.message}</div>;

    return (
        <div className="space-y-4">
            <PriceTableHeader
                title="Precios"
                subtitle={selectedTenantName ? `Precios de ${selectedTenantName}` : "Gestión de precios y valores"}
                infoChips={total > 0 ? [{ id: "total", label: "Encontrados", value: total.toLocaleString('es-ES') }] : []}
                selectedCount={selectedRowIds.size}
                getSelectedIds={getSelectedIds}
                token={token}
                user={user}
                onSuccess={handleRefresh}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <PriceTableGrid
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
            />
        </div>
    );
};

export default Price;
