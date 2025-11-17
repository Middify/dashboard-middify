import { useState, useCallback } from "react";
import OrdersTableHeader from "../components/orders/OrdersTableHeader";
import OrdersTableGrid from "../components/orders/OrdersTableGrid";
import DeleteOrdersModal from "../components/orders/DeleteOrdersModal";
import { useOrdersTableLogic } from "../components/orders/useOrdersTableLogic";
import { patchStateOrder } from "../api/orders/patchStateOrder";

const OrdersTable = ({
  token = null,
  selectedTenantId = null,
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
    onSelectOrder,
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = useCallback(() => {
    const selectedIds = getSelectedOrderIds();
    if (selectedIds.length === 0) {
      return;
    }
    setShowDeleteModal(true);
  }, [getSelectedOrderIds]);

  const handleCloseModal = useCallback(() => {
    if (!isDeleting) {
      setShowDeleteModal(false);
    }
  }, [isDeleting]);

  const handleConfirmDelete = useCallback(async () => {
    const selectedIds = getSelectedOrderIds();
    if (selectedIds.length === 0) {
      setShowDeleteModal(false);
      return;
    }

    if (!token) {
      alert("Error: No hay token de autenticación disponible.");
      setShowDeleteModal(false);
      return;
    }

    if (!user) {
      alert("Error: No hay información de usuario disponible.");
      setShowDeleteModal(false);
      return;
    }

    setIsDeleting(true);
    try {
      // Obtener email del usuario
      const userEmail = user.email || user.mail || user.username || "usuario";
      const userName = user.name || user.username || userEmail;

      await patchStateOrder({
        token,
        ids: selectedIds,
        status: "deleted",
        user: userName,
        mailUser: userEmail,
      });

      // Refrescar datos y limpiar selección
      refreshData();
      clearSelection();
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error al eliminar órdenes:", err);
      alert(
        `Error al eliminar las órdenes: ${err.message || "Error desconocido"}`
      );
    } finally {
      setIsDeleting(false);
    }
  }, [token, user, getSelectedOrderIds, refreshData, clearSelection]);

  return (
    <>
      <div className="flex flex-col gap-6 pt-4">
        <OrdersTableHeader
          token={token}
          selectedCount={selectedRowIds.length}
          onDeleteSelected={handleDeleteClick}
          isDeleting={isDeleting}
          onSearchIds={onSearchIds}
          onSearchLoading={onSearchLoading}
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
        isOpen={showDeleteModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        selectedCount={selectedRowIds.length}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default OrdersTable;


