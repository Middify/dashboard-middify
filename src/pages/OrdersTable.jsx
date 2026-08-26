import { useState, useCallback, useMemo, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import OrdersTableHeader from "../components/orders/OrdersTableHeader";
import TableGrid from "../components/common/TableGrid";
import OrderMobileCard from "../components/orders/OrderMobileCard";
import DeleteOrdersModal from "../components/orders/DeleteOrdersModal";
import { useOrdersTableLogic } from "../components/orders/useOrdersTableLogic";
import { patchStateOrder } from "../api/orders/patchStateOrder";
import { STATE_DEFINITIONS } from "../components/dashboard/CardsStates";
import exportOrdersToExcel from "../utils/exportOrdersToExcel";
import PropTypes from "prop-types";
import { reprocessOrders } from "../api/orders/reprocessOrders";

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
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  // Estados para los filtros secundarios
  const [originStatusFilter, setOriginStatusFilter] = useState("");
  const [processingStatusFilter, setProcessingStatusFilter] = useState("");
  const [folioFilter, setFolioFilter] = useState("");

  const [sortModel, setSortModel] = useState([
    { field: "lastUpdate", sort: "desc" },
  ]);
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
    availableOriginStatuses,
    exporting,
    onExport,
  } = useOrdersTableLogic({
    token,
    selectedTenantId,
    selectedOrderState,
    selectedTenantName,
    orderIdFilter,
    startDateFilter,
    endDateFilter,
    onSelectOrder,
    sortModel,
    originStatusFilter,
    setOriginStatusFilter,
    processingStatusFilter,
    setProcessingStatusFilter,
    folioFilter,
    setFolioFilter,
    onExportSuccess: () => {
      setSnackbar({
        open: true,
        message: "Exportación lista.",
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
  const [isReprocessing, setIsReprocessing] = useState(false);
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

  // 🌟 NUEVA LÓGICA: Evaluar si se puede reprocesar la selección
  const canReprocess = useMemo(() => {
    // Si no es musicChile, apagamos el botón automáticamente
    if (
      selectedTenantName !== "musicChile" &&
      selectedTenantName !== "musicchile"
    )
      return false;

    const selectedOrders = getSelectedOrders();
    if (selectedOrders.length === 0) return false;

    // Retorna true si AL MENOS UNA orden en la selección cumple el criterio estricto
    return selectedOrders.some((order) => {
      const currentStatus = (order.status || order.state || "").toLowerCase();
      return currentStatus === "error" && order.extras?.dontRetry === true;
    });
  }, [selectedTenantName, getSelectedOrders]);

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

  // 🌟 NUEVA FUNCIÓN: Ejecutar el reprocesamiento
  const handleReprocessOrders = useCallback(async () => {
    const selectedOrders = getSelectedOrders();

    // Filtramos para enviar SOLO los IDs de las órdenes que realmente cumplen las reglas
    const validIds = selectedOrders
      .filter((o) => {
        const currentStatus = (o.status || o.state || "").toLowerCase();
        return currentStatus === "error" && o.extras?.dontRetry === true;
      })
      .map((o) => o._id || o.id);

    if (validIds.length === 0) {
      alert("En tu selección no hay órdenes válidas para reprocesar.");
      return;
    }

    setIsReprocessing(true);
    try {
      await reprocessOrders({ token, orderIds: validIds });
      refreshData();
      clearSelection();
      setSnackbar({
        open: true,
        message: `Se enviaron ${validIds.length} órdenes a reprocesar.`,
        severity: "success",
      });
    } catch (err) {
      console.error("Error al reprocesar órdenes:", err);
      alert(
        `Error al reprocesar: ${err.message || "Ocurrió un error inesperado"}`,
      );
    } finally {
      setIsReprocessing(false);
    }
  }, [token, getSelectedOrders, refreshData, clearSelection]);

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
  }, [
    getSelectedOrders,
    formatOrdersForExport,
    exportFileName,
    visibleColumns,
  ]);

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
          startDateFilter={startDateFilter}
          onStartDateChange={setStartDateFilter}
          endDateFilter={endDateFilter}
          onEndDateChange={setEndDateFilter}
          onReprocessData={handleReprocessOrders}
          isReprocessing={isReprocessing}
          canReprocess={canReprocess}
        />
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-visible mt-10">
          <TableGrid
            {...grid}
            columns={visibleColumns}
            MobileComponent={OrderMobileCard}
            mobileComponentProps={{}}
            sortModel={sortModel}
            onSortModelChange={(newModel) => setSortModel(newModel)}
            sortingMode="server"
            columnHeaderHeight={65}
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
OrdersTable.propTypes = {
  token: PropTypes.string,
  selectedTenantId: PropTypes.string,
  selectedTenantName: PropTypes.string,
  selectedOrderState: PropTypes.string,
  onSelectOrder: PropTypes.func,
  user: PropTypes.object,
  availableMarketplaces: PropTypes.array,
};

export default OrdersTable;
