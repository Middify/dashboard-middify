import { useState, useMemo, useCallback, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { getPrice } from "../api/price/getPrice";
import PriceTableHeader from "../components/price/PriceTableHeader";
import PriceTableGrid from "../components/price/PriceTableGrid";

const Price = () => {
    const { token, user, resolvedPriceState, selectedTenantName } = useOutletContext() || {};
    const navigate = useNavigate();
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRowIds, setSelectedRowIds] = useState(() => new Set());
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchData = useCallback(async (signal) => {
        try {
            setLoading(true);
            const result = await getPrice({ token, signal });
            setData(result);
            setError(null);
        } catch (err) {
            if (err.name !== "AbortError") setError(err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, [token, fetchData, refreshTrigger]);

    const normalizeState = (state) => {
        if (!state) return null;
        return (state === "discarded" || state === "discard") ? "discard" : state;
    };

    const allProducts = useMemo(() => data?.products || [], [data]);

    const filteredRows = useMemo(() => {
        let result = allProducts;

        if (resolvedPriceState) {
            result = result.filter((p) => normalizeState(p.state) === resolvedPriceState);
        } else {
            result = result.filter((p) => normalizeState(p.state) !== "discard");
        }

        if (searchTerm) {
            const low = searchTerm.toLowerCase();
            result = result.filter(p => {
                const name = String(p.name || "").toLowerCase();
                const sku = String(p.sku || "").toLowerCase();
                const tenant = String(p.tenantName || "").toLowerCase();
                return name.includes(low) || 
                       sku.includes(low) ||
                       tenant.includes(low);
            });
        }

        return result.map((p, i) => ({ id: p._id || i, ...p }));
    }, [allProducts, resolvedPriceState, searchTerm]);

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

    useEffect(() => {
        setSelectedRowIds(prev => {
            const valid = new Set();
            filteredRows.forEach(row => {
                if (prev.has(row.id)) valid.add(row.id);
            });
            return valid;
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

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4">
                <PriceTableHeader
                    title="Precios"
                    subtitle={selectedTenantName ? `Precios de ${selectedTenantName}` : "Gestión de precios y valores"}
                    infoChips={filteredRows.length > 0 ? [{ id: "total", label: "Total", value: filteredRows.length }] : []}
                    selectedCount={selectedRowIds.size}
                    getSelectedIds={getSelectedIds}
                    token={token}
                    user={user}
                    onSuccess={handleRefresh}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
            </div>

            <PriceTableGrid
                rows={filteredRows}
                loading={loading}
                error={error}
                selectedRowIds={selectedRowIds}
                onToggleRowSelection={handleToggleRowSelection}
                onToggleAllRows={handleToggleAllRows}
                onViewDetails={handleViewDetails}
            />
        </div>
    );
};

export default Price;
