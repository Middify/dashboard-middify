import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useProducts } from "../api/products/getProducts";
import { usePrice } from "../api/price/getPrice";
import RecycleBinHeader from "../components/recycleBin/RecycleBinHeader";
import RecycleBinOrdersTab from "../components/recycleBin/RecycleBinOrdersTab";
import RecycleBinProductsTab from "../components/recycleBin/RecycleBinProductsTab";
import RecycleBinPrice from "../components/recycleBin/RecycleBinPrice";

const RecycleBin = ({
    token = null,
    selectedTenantId = null,
    onSelectOrder = () => {},
    user = null,
}) => {
    const [activeTab, setActiveTab] = useState("orders");
    const [ordersHeaderProps, setOrdersHeaderProps] = useState({});
    const [productsHeaderProps, setProductsHeaderProps] = useState({});
    const [priceHeaderProps, setPriceHeaderProps] = useState({});

    // Obtener conteo de productos eliminados
    const { products } = useProducts({
        token,
        tenantId: selectedTenantId,
        refreshTrigger: 0,
        state: "discarded"
    });
    const productsCount =
        products?.filter((p) => {
            const state = String(p.state || "").toLowerCase();
            return state === "discard" || state === "discarded";
        })?.length || 0;

    // Obtener conteo de precios eliminados
    const { products: priceProducts } = usePrice({
        token,
        refreshTrigger: 0,
        state: "discarded"
    });
    const priceCount =
        priceProducts?.filter((p) => {
            const state = String(p.state || "").toLowerCase();
            return state === "discard" || state === "discarded";
        })?.length || 0;

    // El conteo de órdenes lo obtiene el componente hijo
    const ordersCount = ordersHeaderProps.ordersTotalCount || 0;

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
    };

    const handleOrdersHeaderPropsChange = useCallback((props) => {
        setOrdersHeaderProps(props);
    }, []);

    const handleProductsHeaderPropsChange = useCallback((props) => {
        setProductsHeaderProps(props);
    }, []);

    const handlePriceHeaderPropsChange = useCallback((props) => {
        setPriceHeaderProps(props);
    }, []);

    return (
        <div className="flex flex-col gap-4 pt-4">
            <RecycleBinHeader
                activeTab={activeTab}
                onTabChange={handleTabChange}
                ordersCount={ordersCount}
                productsCount={productsCount}
                priceCount={priceCount}
                {...ordersHeaderProps}
                {...productsHeaderProps}
                {...priceHeaderProps}
            />

            {activeTab === "orders" && (
                <RecycleBinOrdersTab
                    token={token}
                    selectedTenantId={selectedTenantId}
                    onSelectOrder={onSelectOrder}
                    user={user}
                    onHeaderPropsChange={handleOrdersHeaderPropsChange}
                />
            )}

            {activeTab === "products" && (
                <RecycleBinProductsTab
                    token={token}
                    selectedTenantId={selectedTenantId}
                    user={user}
                    onHeaderPropsChange={handleProductsHeaderPropsChange}
                />
            )}

            {activeTab === "price" && (
                <RecycleBinPrice
                    token={token}
                    user={user}
                    onHeaderPropsChange={handlePriceHeaderPropsChange}
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


