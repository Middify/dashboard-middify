import { useState, useCallback, useMemo } from "react";
import OrdersTableHeader from "../components/orders/OrdersTableHeader";
import OrdersTableGrid from "../components/orders/OrdersTableGrid";
import DeleteOrdersModal from "../components/orders/DeleteOrdersModal";
import { useOrdersTableLogic } from "../components/orders/useOrdersTableLogic";
import { patchStateOrder } from "../api/orders/patchStateOrder";
import { STATE_DEFINITIONS } from "../components/dashboard/CardsStates";
import exportOrdersToExcel from "../utils/exportOrdersToExcel";
import { fetchOrdersByStateAllPages } from "../api/orders/getOrdersByState";

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
    getSelectedOrders,
    clearSelection,
    refreshData,
    selectedStateLabel,
    onSearchIds,
    onSearchLoading,
    formatOrdersForExport,
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
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingSelection, setIsExportingSelection] = useState(false);

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

  const exportFileName = useMemo(() => {
    const parts = ["ordenes"];
    const sanitize = (value) =>
      String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")
        .toLowerCase();

    if (selectedTenantName) {
      parts.push(selectedTenantName);
    }
    if (selectedStateLabel) {
      parts.push(selectedStateLabel);
    }

    const formatted = parts
      .filter(Boolean)
      .map((part) => sanitize(part))
      .filter(Boolean)
      .join("_");

    return `${formatted || "ordenes"}.xlsx`;
  }, [selectedTenantName, selectedStateLabel]);

  const handleExportAllOrders = useCallback(async () => {
    if (!token) {
      alert("No hay token de autenticación para exportar.");
      return;
    }

    setIsExporting(true);
    try {
      const statusParam = selectedOrderState
        ? selectedOrderState.replace(/_/g, " ")
        : undefined;
      const preferredPageSize =
        Array.isArray(grid?.pageSizeOptions) && grid.pageSizeOptions.length > 0
          ? Math.max(...grid.pageSizeOptions)
          : 500;

      const { orders: allOrders } = await fetchOrdersByStateAllPages({
        token,
        params: {
          tenantId: selectedTenantId ?? undefined,
          tenantName: selectedTenantName ?? undefined,
          status: statusParam,
        },
        pageSize: preferredPageSize,
      });

      if (!Array.isArray(allOrders) || allOrders.length === 0) {
        alert("No hay órdenes disponibles para exportar.");
        return;
      }

      const formattedRows = formatOrdersForExport(allOrders);
      exportOrdersToExcel({
        rows: formattedRows,
        columns: grid.columns,
        fileName: exportFileName,
      });
    } catch (error) {
      console.error("Error al exportar las órdenes:", error);
      alert(`No se pudo exportar las órdenes: ${error.message ?? "Error desconocido"}`);
    } finally {
      setIsExporting(false);
    }
  }, [
    token,
    selectedOrderState,
    grid?.pageSizeOptions,
    grid.columns,
    selectedTenantId,
    selectedTenantName,
    exportFileName,
    formatOrdersForExport,
  ]);

  const handleExportSelectedOrders = useCallback(async () => {
    const selectedOrders = getSelectedOrders();
    if (!selectedOrders || selectedOrders.length === 0) {
      alert("Selecciona al menos una orden para exportar.");
      return;
    }

    setIsExportingSelection(true);
    try {
      const formattedRows = formatOrdersForExport(selectedOrders);
      if (!formattedRows || formattedRows.length === 0) {
        alert("No se pudo preparar la exportación de las órdenes seleccionadas.");
        return;
      }
      const baseName =
        typeof exportFileName === "string" && exportFileName.trim().length > 0
          ? exportFileName.trim()
          : "ordenes.xlsx";
      const selectionFileName = baseName.replace(/\.xlsx$/i, "") + "_seleccion.xlsx";
      exportOrdersToExcel({
        rows: formattedRows,
        columns: grid.columns,
        fileName: selectionFileName,
      });
    } catch (error) {
      console.error("Error al exportar la selección de órdenes:", error);
      alert(
        `No se pudo exportar las órdenes seleccionadas: ${
          error.message ?? "Error desconocido"
        }`
      );
    } finally {
      setIsExportingSelection(false);
    }
  }, [getSelectedOrders, formatOrdersForExport, exportFileName, grid.columns]);

  return (
    <>
      <div className="flex flex-col gap-6 pt-4">
        <OrdersTableHeader
          selectedCount={selectedRowIds.length}
          onChangeState={handleStateSelection}
          isProcessing={isUpdatingStatus}
          stateOptions={stateOptions}
          selectedState={selectedStatusValue}
          onExportData={handleExportAllOrders}
          isExportingData={isExporting}
          exportDisabled={!token || grid.rowCount === 0}
          onExportSelectedData={handleExportSelectedOrders}
          isExportingSelectedData={isExportingSelection}
          exportSelectedDisabled={selectedRowIds.length === 0}
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


