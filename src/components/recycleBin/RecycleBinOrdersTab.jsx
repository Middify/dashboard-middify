import { useMemo, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import TableGrid from "../common/TableGrid";
import OrderMobileCard from "../orders/OrderMobileCard";
import DeleteOrdersModal from "../orders/DeleteOrdersModal";
import { useOrdersTableLogic } from "../orders/useOrdersTableLogic";
import { patchStateOrder } from "../../api/orders/patchStateOrder";
import exportOrdersToExcel from "../../utils/exportOrdersToExcel";
import { fetchOrdersByStateAllPages } from "../../api/orders/getOrdersByState";

const RecycleBinOrdersTab = ({
    token,
    selectedTenantId,
    onSelectOrder,
    user,
    onStatsChange,
}) => {
    const {
        error,
        grid,
        selectedRowIds,
        getSelectedOrderIds,
        getSelectedOrders,
        clearSelection,
        refreshData,
        formatOrdersForExport,
    } = useOrdersTableLogic({
        token,
        selectedTenantId,
        selectedOrderState: "deleted",
        onSelectOrder,
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);

    const filteredRows = useMemo(() => {
        if (!Array.isArray(grid.rows)) return [];
        return grid.rows.filter(row => {
            const status = String(row.rawOrder?.status || "").toLowerCase();
            return status === "deleted" || status === "descartada" || status === "eliminada";
        });
    }, [grid.rows]);

    const handleExport = useCallback(async (selectedOnly = false) => {
        setIsProcessing(true);
        try {
            let ordersToExport = [];
            let fileName = selectedTenantId ? `papelera_${selectedTenantId}` : "papelera";

            if (selectedOnly) {
                ordersToExport = getSelectedOrders();
                fileName += "_seleccion";
            } else {
                const { orders } = await fetchOrdersByStateAllPages({
                    token,
                    params: { tenantId: selectedTenantId, status: "deleted" },
                    pageSize: 500,
                });
                ordersToExport = orders;
            }

            if (!ordersToExport?.length) return alert("No hay datos para exportar");

            exportOrdersToExcel({
                rows: formatOrdersForExport(ordersToExport),
                columns: grid.columns.filter(c => c.field !== "total"),
                fileName: `${fileName}.xlsx`,
            });
        } catch (e) {
            console.error(e);
            alert("Error al exportar");
        } finally {
            setIsProcessing(false);
        }
    }, [token, selectedTenantId, getSelectedOrders, formatOrdersForExport, grid.columns]);

    const handleStateChange = useCallback((value) => {
        if (!value || selectedRowIds.length === 0) return;
        setPendingStatus(value);
        setShowModal(true);
    }, [selectedRowIds]);

    const confirmStateChange = useCallback(async () => {
        if (!pendingStatus || !user) return;
        setIsProcessing(true);
        try {
            await patchStateOrder({
                token,
                ids: getSelectedOrderIds(),
                status: pendingStatus,
                user: user.name || "usuario",
                mailUser: user.email || "usuario",
            });
            refreshData();
            clearSelection();
            setShowModal(false);
        } catch (e) {
            console.error(e);
            alert("Error al actualizar");
        } finally {
            setIsProcessing(false);
        }
    }, [token, user, getSelectedOrderIds, pendingStatus, refreshData, clearSelection]);

    useEffect(() => {
        onStatsChange?.({
            count: filteredRows.length,
            selectedCount: selectedRowIds.length,
            isProcessing,
            onAction: handleStateChange,
            onExport: () => handleExport(false),
            onExportSelection: () => handleExport(true)
        });
    }, [filteredRows.length, selectedRowIds.length, isProcessing, handleStateChange, handleExport, onStatsChange]);

    if (error) return <div className="text-red-500 p-4">Error: {error.message}</div>;

    return (
        <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <TableGrid
                    {...grid}
                    rows={filteredRows}
                    MobileComponent={OrderMobileCard}
                />
            </section>

            <DeleteOrdersModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={confirmStateChange}
                selectedCount={selectedRowIds.length}
                isProcessing={isProcessing}
                statusLabel="Restaurar"
                statusValue={pendingStatus}
            />
        </div>
    );
};

RecycleBinOrdersTab.propTypes = {
    token: PropTypes.string,
    selectedTenantId: PropTypes.string,
    onSelectOrder: PropTypes.func,
    user: PropTypes.object,
    onStatsChange: PropTypes.func,
};

export default RecycleBinOrdersTab;
