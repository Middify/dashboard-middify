import { useState } from "react";
import PropTypes from "prop-types";
import { useProducts } from "../api/products/getProducts";
import RecycleBinHeader from "../components/recycleBin/RecycleBinHeader";
import RecycleBinOrdersTab from "../components/recycleBin/RecycleBinOrdersTab";
import RecycleBinProductsTab from "../components/recycleBin/RecycleBinProductsTab";

const RecycleBin = ({
    token = null,
    selectedTenantId = null,
    onSelectOrder = () => {},
    user = null,
}) => {
    const [activeTab, setActiveTab] = useState("orders");

    // Obtener conteo de productos eliminados
    const { products } = useProducts(token, selectedTenantId, null, 0, "discard");
    const productsCount =
        products?.products?.filter((p) => p.state === "discard")?.length || 0;

    // El conteo de órdenes lo obtiene el componente hijo
    const ordersCount = 0; // TODO: obtener del hook de órdenes si es necesario

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
    };

    return (
        <div className="flex flex-col gap-4 pt-4">
            <RecycleBinHeader
                activeTab={activeTab}
                onTabChange={handleTabChange}
                ordersCount={ordersCount}
                productsCount={productsCount}
            />

            {activeTab === "orders" && (
                <RecycleBinOrdersTab
                    token={token}
                    selectedTenantId={selectedTenantId}
                    onSelectOrder={onSelectOrder}
                    user={user}
                />
            )}

            {activeTab === "products" && (
                <RecycleBinProductsTab
                    token={token}
                    selectedTenantId={selectedTenantId}
                    user={user}
                />
            )}
        </div>
    );
};

RecycleBin.propTypes = {
    token: PropTypes.string,
    selectedTenantId: PropTypes.string,
    onSelectOrder: PropTypes.func,
    user: PropTypes.object,
};

RecycleBin.defaultProps = {
    token: null,
    selectedTenantId: null,
    onSelectOrder: () => {},
    user: null,
};

export default RecycleBin;


