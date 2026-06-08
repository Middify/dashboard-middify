import { useState, useCallback, useMemo } from "react";
import { Snackbar, Alert } from "@mui/material";
import OrdersTableHeader from "../components/orders/OrdersTableHeader";
import TableGrid from "../components/common/TableGrid";
import OrderMobileCard from "../components/orders/OrderMobileCard";
import DeleteOrdersModal from "../components/orders/DeleteOrdersModal";
import { useOrdersTableLogic } from "../components/orders/useOrdersTableLogic";
import { patchStateOrder } from "../api/orders/patchStateOrder";
import { STATE_DEFINITIONS } from "../components/dashboard/CardsStates";
import exportOrdersToExcel from "../utils/exportOrdersToExcel";

const OrdersTable = ({
  token = null,
  selectedTenantId = null,
  selectedTenantName = null,
  selectedOrderState = null,
  onSelectOrder = () => {},
  user = null,
  availableMarketplaces = [],
}) => {
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const {
    error,
    grid,
    selectedRowIds, // This is now an array
    getSelectedOrderIds,
    getSelectedOrders,
    clearSelection,
    refreshData,
    selectedStateLabel,
    formatOrdersForExport,
    selectedMarketplace,
    setSelectedMarketplace,
    exporting,
    onExport,
  } = useOrdersTableLogic({
    token,
    selectedTenantId,
    selectedOrderState,
    selectedTenantName,
    orderIdFilter,
    dateFilter,
    onSelectOrder,
    onExportSuccess: () => {
      setSnackbar({
        open: true,
        message: "Exportación lista. La descarga comenzará automáticamente.",
        severity: "success",
      });
    },
  });
  //filtro por marketplace

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [selectedStatusValue, setSelectedStatusValue] = useState("");
  const [isExportingSelection, setIsExportingSelection] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  // FILTRO  DE COLUMNAS DESDE APARTADO TIENDAS
  const visibleColumns = useMemo(() => {
    if (!grid?.columns) return [];

    return grid.columns.filter((col) => {
      if (
        col.field === "__check__" ||
        col.field === "actions" ||
        col.field === "view_details"
      )
        return true;

      return col.active !== false;
    });
  }, [grid?.columns]);

  const canEditState = useMemo(() => {
    const role = user?.role;

    if (role === "SuperAdmin" || role === "MiddifyAdmin") return true;

    const selectedOrders = getSelectedOrders();
    if (selectedOrders.length === 0) return true;

    const lockedStatuses = [
      "procesada",
      "procesad",
      "procesda",
      "error",
      "error_",
      "Descartada",
      "descartada",
      "descatada",
      "disabled",
      "discarded",
      "failed",
    ];

    const hasLockedOrder = selectedOrders.some((order) => {
      const currentStatus = (
        order.status ||
        order.state ||
        order.marketPlace?.status ||
        ""
      ).toLowerCase();
      return lockedStatuses.includes(currentStatus);
    });

    return !hasLockedOrder;
  }, [user, getSelectedOrders, selectedRowIds]);

  const stateOptions = useMemo(() => {
    const baseOptions =
      STATE_DEFINITIONS?.map(({ key, label }) => ({
        value: key,
        label,
      })) ?? [];

    const ALLOWED_STATES = ["procesada", "error", "deleted"];

    const filteredOptions = baseOptions.filter((option) =>
      ALLOWED_STATES.includes(String(option.value).toLowerCase()),
    );
    const hasDeleted = filteredOptions.some(
      (option) => option.value === "deleted",
    );

    return hasDeleted
      ? filteredOptions
      : [...filteredOptions, { value: "deleted", label: "Eliminada" }];
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
        },
      );
      setShowStatusModal(true);
    },
    [getSelectedOrderIds, stateOptions],
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

    if (!token || !user) {
      alert("Error: Falta información de autenticación.");
      setShowStatusModal(false);
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
        `Error al actualizar las órdenes: ${err.message || "Error desconocido"}`,
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
        .toLowerCase();

    if (selectedTenantName) parts.push(selectedTenantName);
    if (selectedStateLabel) parts.push(selectedStateLabel);

    return `${parts.map(sanitize).join("_")}.xlsx`;
  }, [selectedTenantName, selectedStateLabel]);

  const handleExportAllOrders = useCallback(async () => {
    if (!token) return alert("No hay token de autenticación para exportar.");
    onExport();
  }, [token, onExport]);

  const handleExportSelectedOrders = useCallback(async () => {
    const selectedOrders = getSelectedOrders();
    if (!selectedOrders || selectedOrders.length === 0)
      return alert("Selecciona al menos una orden para exportar.");

    setIsExportingSelection(true);
    try {
      const formattedRows = formatOrdersForExport(selectedOrders);
      if (!formattedRows || formattedRows.length === 0)
        return alert("No se pudo preparar la exportación.");

      const baseName = exportFileName?.trim() || "ordenes.xlsx";
      const selectionFileName =
        baseName.replace(/\.xlsx$/i, "") + "_seleccion.xlsx";

      exportOrdersToExcel({
        rows: formattedRows,
        // si queremos que el excel tambien tengas las columnas filtrdas hay que cambiar el "grid.columns" por "visibleColumns"
        columns: visibleColumns,
        fileName: selectionFileName,
      });
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Error al exportar selección.");
    } finally {
      setIsExportingSelection(false);
    }
  }, [getSelectedOrders, formatOrdersForExport, exportFileName, grid.columns]);

  return (
    <>
      <div className="flex flex-col gap-6 pt-4">
        <OrdersTableHeader
          title={`Órdenes ${selectedStateLabel ? `· ${selectedStateLabel}` : ""}`}
          tenantName={selectedTenantName}
          selectedCount={selectedRowIds.length}
          onChangeState={handleStateSelection}
          isProcessing={isUpdatingStatus}
          stateOptions={stateOptions}
          selectedState={selectedStatusValue}
          onExportData={handleExportAllOrders}
          isExportingData={exporting}
          exportDisabled={!token || grid.rowCount === 0}
          onExportSelectedData={handleExportSelectedOrders}
          isExportingSelectedData={isExportingSelection}
          exportSelectedDisabled={selectedRowIds.length === 0}
          canEditState={canEditState}
          selectedMarketplace={selectedMarketplace}
          onMarketplaceChange={(e) => setSelectedMarketplace(e.target.value)}
          availableMarketplaces={availableMarketplaces}
          orderIdFilter={orderIdFilter}
          onOrderIdChange={setOrderIdFilter}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
        />
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <TableGrid
            {...grid}
            columns={visibleColumns}
            MobileComponent={OrderMobileCard}
            mobileComponentProps={{}}
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          className="w-full"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OrdersTable;
