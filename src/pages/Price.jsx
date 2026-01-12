import { useOutletContext, useNavigate } from "react-router-dom";
import PriceTableHeader from "../components/price/PriceTableHeader";
import TableGrid from "../components/common/TableGrid";
import ProductMobileCard from "../components/products/ProductMobileCard";
import { usePriceTableLogic } from "../components/price/usePriceTableLogic";

const Price = () => {
    const { token, user, resolvedPriceState, selectedTenantId, selectedTenantName } = useOutletContext() || {};
    const navigate = useNavigate();
    
    const {
        loading,
        error,
        total,
        selectedRowIds,
        getSelectedIds,
        refreshData,
        grid
    } = usePriceTableLogic({
        token,
        selectedTenantId,
        selectedTenantName,
        resolvedPriceState,
        user,
        navigate,
        showPrice: true,
        showStock: false,
    });

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
                onSuccess={refreshData}
            />

            <TableGrid
                {...grid}
                MobileComponent={ProductMobileCard}
                mobileComponentProps={{ showPrice: true, showStock: false }}
            />
        </div>
    );
};

export default Price;
