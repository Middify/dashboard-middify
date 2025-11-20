import { useMemo, useState, useCallback } from "react";
import OrdersTableGrid from "../components/orders/OrdersTableGrid";
import OrdersTableHeader from "../components/orders/OrdersTableHeader";
import DeleteOrdersModal from "../components/orders/DeleteOrdersModal";
import { useOrdersTableLogic } from "../components/orders/useOrdersTableLogic";
import { patchStateOrder } from "../api/orders/patchStateOrder";
import { STATE_DEFINITIONS } from "../components/dashboard/CardsStates";
import exportOrdersToExcel from "../utils/exportOrdersToExcel";
import { fetchOrdersByStateAllPages } from "../api/orders/getOrdersByState";

const numberFormatter = new Intl.NumberFormat("es-CL");

const RecycleBin = ({
  token = null,
  selectedTenantId = null,
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
    formatOrdersForExport,
  } = useOrdersTableLogic({
    token,
    selectedTenantId,
    selectedOrderState: "deleted",
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

  const columns = useMemo(
    () => grid.columns.filter((col) => col.field !== "total"),
    [grid.columns]
  );

  const exportFileName = useMemo(() => {
    const base = selectedTenantId ? `ordenes_papelera_${selectedTenantId}` : "ordenes_papelera";
    return base
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .concat(".xlsx");
  }, [selectedTenantId]);

  const handleExportDeletedOrders = useCallback(async () => {
    if (!token) {
      alert("No hay token de autenticación para exportar.");
      return;
    }

    setIsExporting(true);
    try {
      const preferredPageSize =
        Array.isArray(grid?.pageSizeOptions) && grid.pageSizeOptions.length > 0
          ? Math.max(...grid.pageSizeOptions)
          : 500;

      const { orders: allOrders } = await fetchOrdersByStateAllPages({
        token,
        params: {
          tenantId: selectedTenantId ?? undefined,
          status: "deleted",
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
        columns,
        fileName: exportFileName,
      });
    } catch (error) {
      console.error("Error al exportar la papelera:", error);
      alert(
        `No se pudo exportar la papelera: ${error.message ?? "Error desconocido"}`
      );
    } finally {
      setIsExporting(false);
    }
  }, [
    token,
    grid?.pageSizeOptions,
    selectedTenantId,
    columns,
    exportFileName,
    formatOrdersForExport,
  ]);

  const handleExportSelectedDeletedOrders = useCallback(async () => {
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
          : "ordenes_papelera.xlsx";
      const selectionFileName = baseName.replace(/\.xlsx$/i, "") + "_seleccion.xlsx";
      exportOrdersToExcel({
        rows: formattedRows,
        columns,
        fileName: selectionFileName,
      });
    } catch (error) {
      console.error("Error al exportar las órdenes seleccionadas de la papelera:", error);
      alert(
        `No se pudo exportar las órdenes seleccionadas: ${
          error.message ?? "Error desconocido"
        }`
      );
    } finally {
      setIsExportingSelection(false);
    }
  }, [getSelectedOrders, formatOrdersForExport, exportFileName, columns]);

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
    <div className="flex flex-col gap-6 pt-4">
      <OrdersTableHeader
        title="Papelera"
        infoChips={[
          {
            id: "deleted-total",
            label: "Órdenes eliminadas",
            value: numberFormatter.format(grid.rowCount || 0),
          },
        ]}
        selectedCount={selectedRowIds.length}
        onChangeState={handleStateSelection}
        isProcessing={isUpdatingStatus}
        stateOptions={stateOptions}
        selectedState={selectedStatusValue}
        searchPlaceholder="Buscar por ID, mensaje, tienda..."
        searchDisabled
        onExportData={handleExportDeletedOrders}
        isExportingData={isExporting}
        exportDisabled={!token || grid.rowCount === 0}
        onExportSelectedData={handleExportSelectedDeletedOrders}
        isExportingSelectedData={isExportingSelection}
        exportSelectedDisabled={selectedRowIds.length === 0}
      />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <OrdersTableGrid
          rows={grid.rows}
          columns={columns}
          loading={grid.loading}
          error={error}
          paginationMode={grid.paginationMode}
          paginationModel={grid.paginationModel}
          onPaginationModelChange={grid.onPaginationModelChange}
          pageSizeOptions={grid.pageSizeOptions}
          rowCount={grid.rowCount}
          onRowClick={undefined}
        />
      </section>
      <DeleteOrdersModal
        isOpen={showStatusModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmStatusChange}
        selectedCount={selectedRowIds.length}
        isProcessing={isUpdatingStatus}
        statusLabel={pendingStatus?.label}
        statusValue={pendingStatus?.value}
      />
    </div>
  );
};

export default RecycleBin;


