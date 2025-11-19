import { useState, useCallback, useMemo } from "react";
import OrdersTableHeader from "../components/orders/OrdersTableHeader";
import OrdersTableGrid from "../components/orders/OrdersTableGrid";
import DeleteOrdersModal from "../components/orders/DeleteOrdersModal";
import { useOrdersTableLogic } from "../components/orders/useOrdersTableLogic";
import { patchStateOrder } from "../api/orders/patchStateOrder";
import { STATE_DEFINITIONS } from "../components/dashboard/CardsStates";

const OrdersTable = ({
  token = null,
  selectedTenantId = null,
  selectedTenantName = null,
  selectedOrderState = null,
  onSelectOrder = () => {},
  user = null,
}) => {
  const {
    error,
    grid,
    selectedRowIds,
    getSelectedOrderIds,
    clearSelection,
    refreshData,
    onSearchIds,
    onSearchLoading,
  } = useOrdersTableLogic({
    token,
    selectedTenantId,
    selectedOrderState,
    selectedTenantName,
    onSelectOrder,
  });

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [selectedStatusValue, setSelectedStatusValue] = useState("");

  const stateOptions = useMemo(() => {
    const baseOptions =
      STATE_DEFINITIONS?.map(({ key, label }) => ({
        value: key,
        label,
      })) ?? [];

    const hasDeleted = baseOptions.some((option) => option.value === "deleted");

    return hasDeleted
      ? baseOptions
      : [...baseOptions, { value: "deleted", label: "Eliminada" }];
  }, []);

  const handleStateSelection = useCallback(
    (value) => {
      setSelectedStatusValue(value);

      if (!value) {
        setPendingStatus(null);
        return;
      }

      const selectedIds = getSelectedOrderIds();
      if (selectedIds.length === 0) {
        alert("Selecciona al menos una orden para actualizar su estado.");
        setSelectedStatusValue("");
        setPendingStatus(null);
        return;
      }

      const option =
        stateOptions.find((stateOption) => stateOption.value === value) ?? null;

      setPendingStatus(
        option ?? {
          value,
          label: value,
        }
      );
      setShowStatusModal(true);
    },
    [getSelectedOrderIds, stateOptions]
  );

  const handleCloseModal = useCallback(() => {
    if (!isUpdatingStatus) {
      setShowStatusModal(false);
      setPendingStatus(null);
      setSelectedStatusValue("");
    }
  }, [isUpdatingStatus]);

  const handleConfirmStatusChange = useCallback(async () => {
    const selectedIds = getSelectedOrderIds();
    if (selectedIds.length === 0 || !pendingStatus) {
      setShowStatusModal(false);
      setPendingStatus(null);
      setSelectedStatusValue("");
      return;
    }

    if (!token) {
      alert("Error: No hay token de autenticación disponible.");
      setShowStatusModal(false);
      setPendingStatus(null);
      setSelectedStatusValue("");
      return;
    }

    if (!user) {
      alert("Error: No hay información de usuario disponible.");
      setShowStatusModal(false);
      setPendingStatus(null);
      setSelectedStatusValue("");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const userEmail = user.email || user.mail || user.username || "usuario";
      const userName = user.name || user.username || userEmail;

      await patchStateOrder({
        token,
        ids: selectedIds,
        status: pendingStatus.value,
        user: userName,
        mailUser: userEmail,
      });

      refreshData();
      clearSelection();
      setShowStatusModal(false);
      setPendingStatus(null);
      setSelectedStatusValue("");
    } catch (err) {
      console.error("Error al actualizar órdenes:", err);
      alert(
        `Error al actualizar las órdenes: ${err.message || "Error desconocido"}`
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [
    token,
    user,
    getSelectedOrderIds,
    pendingStatus,
    refreshData,
    clearSelection,
  ]);

  return (
    <>
      <div className="flex flex-col gap-6 pt-4">
        <OrdersTableHeader
          selectedCount={selectedRowIds.length}
          onChangeState={handleStateSelection}
          isProcessing={isUpdatingStatus}
          stateOptions={stateOptions}
          selectedState={selectedStatusValue}
        />
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <OrdersTableGrid
            rows={grid.rows}
            columns={grid.columns}
            loading={grid.loading}
            error={error}
            paginationMode={grid.paginationMode}
            paginationModel={grid.paginationModel}
            onPaginationModelChange={grid.onPaginationModelChange}
            pageSizeOptions={grid.pageSizeOptions}
            rowCount={grid.rowCount}
            onRowClick={grid.onRowClick}
          />
        </section>
      </div>
      <DeleteOrdersModal
        isOpen={showStatusModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmStatusChange}
        selectedCount={selectedRowIds.length}
        isProcessing={isUpdatingStatus}
        statusLabel={pendingStatus?.label}
        statusValue={pendingStatus?.value}
      />
    </>
  );
};

export default OrdersTable;


