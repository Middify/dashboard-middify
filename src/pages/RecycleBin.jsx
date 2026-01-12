import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import RecycleBinHeader from "../components/recycleBin/RecycleBinHeader";
import RecycleBinOrdersTab from "../components/recycleBin/RecycleBinOrdersTab";
import GenericRecycleTab from "../components/recycleBin/RecycleBinGenericTab";

const RecycleBin = ({ token, selectedTenantId, onSelectOrder, user }) => {
    const [activeTab, setActiveTab] = useState("orders");
    const [stats, setStats] = useState({
        orders: { count: 0, selected: 0, processing: false, actions: {} },
        products: { count: 0, selected: 0, processing: false, actions: {} },
        price: { count: 0, selected: 0, processing: false, actions: {} }
    });

    const updateStats = useCallback((tab, newStats) => {
        setStats(prev => {
            const current = prev[tab];
            if (
                current.count === newStats.count &&
                current.selected === newStats.selectedCount &&
                current.processing === newStats.isProcessing
            ) return prev;

            return {
                ...prev,
                [tab]: {
                    count: newStats.count || 0,
                    selected: newStats.selectedCount || 0,
                    processing: newStats.isProcessing || false,
                    actions: {
                        onStateChange: newStats.onAction,
                        onExportAll: newStats.onExport,
                        onExportSelection: newStats.onExportSelection
                    }
                }
            };
        });
    }, []);

    const tabs = [
        { id: "orders", label: "Órdenes", count: stats.orders.count },
        { id: "products", label: "Productos", count: stats.products.count },
        { id: "price", label: "Precio", count: stats.price.count }
    ];

    const currentStats = stats[activeTab];

    return (
        <div className="flex flex-col gap-4 pt-4">
            <RecycleBinHeader
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={tabs}
                selectedCount={currentStats.selected}
                isProcessing={currentStats.processing}
                actions={currentStats.actions}
            />

            {activeTab === "orders" && (
                <RecycleBinOrdersTab
                    token={token}
                    selectedTenantId={selectedTenantId}
                    onSelectOrder={onSelectOrder}
                    user={user}
                    onStatsChange={(s) => updateStats("orders", s)}
                />
            )}

            {(activeTab === "products" || activeTab === "price") && (
                <GenericRecycleTab
                    type={activeTab}
                    token={token}
                    tenantId={selectedTenantId}
                    user={user}
                    onStatsChange={(s) => updateStats(activeTab, s)}
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

export default RecycleBin;
