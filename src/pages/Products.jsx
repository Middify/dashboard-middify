import { useOutletContext, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ProductsTableHeader from "../components/products/ProductsTableHeader";
import TableGrid from "../components/common/TableGrid";
import ProductMobileCard from "../components/products/ProductMobileCard";
import { useProductsTableLogic } from "../components/products/useProductsTableLogic";

//buscador por sku
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Products = () => {
  const {
    token,
    selectedTenantId,
    selectedTenantName,
    user,
    resolvedProductState,
  } = useOutletContext() || {};
  const navigate = useNavigate();
  const [skuSearch, setSkuSearch] = useState("");

  const debouncedSkuSearch = useDebounce(skuSearch, 500); // Espera 500ms

  const {
    loading,
    error,
    total,
    selectedRowIds,
    getSelectedProductIds,
    refreshData,
    isExporting,
    handleExportProducts,
    isStateChangeLockedForAdmin,
    grid,
  } = useProductsTableLogic({
    token,
    selectedTenantId,
    selectedTenantName,
    resolvedProductState,
    user,
    navigate,
    sku: debouncedSkuSearch,
    showPrice: false,
    showStock: true,
  });

  if (error && !loading)
    return (
      <div className="py-12 text-center text-red-500">
        Error: {error.message}
      </div>
    );

  return (
    <div className="space-y-4">
      <ProductsTableHeader
        title="Productos"
        subtitle={
          selectedTenantName
            ? `Productos de ${selectedTenantName}`
            : "Gestión de productos"
        }
        infoChips={
          total > 0
            ? [
                {
                  id: "total",
                  label: "Encontrados",
                  value: total.toLocaleString("es-ES"),
                },
              ]
            : []
        }
        onExportData={handleExportProducts}
        isExportingData={isExporting}
        exportDisabled={loading || !total}
        selectedCount={selectedRowIds.size}
        getSelectedProductIds={getSelectedProductIds}
        token={token}
        user={user}
        searchValue={skuSearch}
        onSearchChange={setSkuSearch}
        tenantId={selectedTenantId}
        tenantName={selectedTenantName}
        onDeleteSuccess={refreshData}
        isStateChangeLockedForAdmin={isStateChangeLockedForAdmin}
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
