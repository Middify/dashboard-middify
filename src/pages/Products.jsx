import { useOutletContext, useNavigate } from "react-router-dom";
import ProductsTableHeader from "../components/products/ProductsTableHeader";
import TableGrid from "../components/common/TableGrid";
import ProductMobileCard from "../components/products/ProductMobileCard";
import { useProductsTableLogic } from "../components/products/useProductsTableLogic";

const Products = () => {
    const { token, selectedTenantId, selectedTenantName, user, resolvedProductState } = useOutletContext() || {};
    const navigate = useNavigate();
    
    const {
        loading,
        error,
        total,
        selectedRowIds,
        getSelectedProductIds,
        refreshData,
        isExporting,
        handleExportProducts,
        grid
    } = useProductsTableLogic({
        token,
        selectedTenantId,
        selectedTenantName,
        resolvedProductState,
        user,
        navigate,
        showPrice: false,
        showStock: true
    });

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
            />

            <TableGrid
                {...grid}
                MobileComponent={ProductMobileCard}
                mobileComponentProps={{ showPrice: false, showStock: true }}
            />
        </div>
    );
};

export default Products;
