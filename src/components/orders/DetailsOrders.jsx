import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useQueryClient } from "@tanstack/react-query";
import { useOrderDetails } from "../../api/orders/getDetailsOrders";
import PanelOne from "./details/PanelOne";
import PanelTwo from "./details/PanelTwo";
import PanelThree from "./details/PanelThree";
import PanelFour from "./details/PanelFour";
import PanelFive from "./details/PanelFive";
import PanelSix from "./details/PanelSix";
import PanelSeven from "./details/PanelSeven";
import { formatText } from "./details/formatters";
import { CircularProgress } from "@mui/material";
import { patchOrderDetails } from "../../api/orders/patchOrderDetails";
import { toast } from "react-toastify";

const TABS = [
  { id: "panel1", label: "Resumen" },
  { id: "panel2", label: "Items" },
  { id: "panel3", label: "Envío" },
  { id: "panel4", label: "Cliente" },
  { id: "panel5", label: "Documentos" },
  { id: "panel6", label: "Etapas" },
  { id: "panel7", label: "Historial" },
];

const buildFallbackPanels = (order) => {
  if (!order) {
    return null;
  }

  const marketplace = order.marketPlace ?? {};
  const stages = Array.isArray(order.stages) ? order.stages : null;
  return {
    panel_1: {
      orderId: marketplace.orderId ?? order.orderId ?? null,
      idOrdenMarket: marketplace.idOrdenMarket ?? null,
      nombre:
        marketplace.nombre ?? order.tennantName ?? order.tenantName ?? null,
      creation: marketplace.creation ?? order.creation ?? null,
      lastUpdate: marketplace.lastUpdate ?? order.lastUpdate ?? null,
      status: marketplace.status ?? order.status ?? null,
      attempts: marketplace.attempts ?? order.attempts ?? null,
      statusOrder: order.status ?? marketplace.status ?? null,
      message: order.message ?? marketplace.message ?? null,
      errorDetail: marketplace.errorDetail ?? order.errorDetail ?? null,
      subTotal: marketplace.subTotal ?? order.subTotal ?? null,
      discounts: marketplace.discounts ?? order.discounts ?? [],
      total: marketplace.total ?? order.total ?? null,
    },
    panel_2: null,
    panel_3: null,
    panel_4: order.customer ?? null,
    panel_5: order.documents ?? null,
    panel_6: stages ? { stages } : null,
    panel_7: null,
  };
};

const DetailsOrders = ({
  token,
  orderId,
  fallbackOrder,
  onClose,
  currentUser,
}) => {
  const queryClient = useQueryClient();
  const { details, loading, error, refetch } = useOrderDetails(token, orderId, {
    enabled: Boolean(token && orderId),
  });

  const resolvedPanels = useMemo(() => {
    if (details) {
      return details;
    }
    return buildFallbackPanels(fallbackOrder);
  }, [details, fallbackOrder]);

  const [activeTab, setActiveTab] = useState(TABS[0].id);

  // ESTADOS PARA MODO EDICION
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});
  useEffect(() => {
    if (resolvedPanels) {
      setFormData({
        panel_1: { ...resolvedPanels.panel_1 },
        panel_2: { ...resolvedPanels.panel_2 },
        panel_3: { ...resolvedPanels.panel_3 },
        panel_4: { ...resolvedPanels.panel_4 },
      });
    }
  }, [resolvedPanels]);

  const handleGoBack = () => {
    onClose();
  };

  const checkEditPermission = () => {
    const role = currentUser?.role;
    if (!role) return false;

    if (role === "SuperAdmin" || role === "MiddifyAdmin") return true;

    const currentStatus = (
      resolvedPanels?.panel_1?.statusOrder ||
      resolvedPanels?.panel_1?.status ||
      ""
    ).toLowerCase();

    const lockedStatuses = [];

    const isLocked = lockedStatuses.includes(currentStatus);

    return !isLocked;
  };

  const canEdit = checkEditPermission();

  const handleFieldChange = (panelId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userName =
        currentUser?.name ||
        currentUser?.email ||
        currentUser?.username ||
        "Usuario Dashboard";

      await patchOrderDetails({
        token,
        orderId,
        changes: formData,
        user: userName,
      });
      await queryClient.invalidateQueries();

      if (typeof refetch === "function") {
        await refetch();
      }

      toast.success(
        "¡Orden actualizada con éxito! Se ha guardado el registro en el historial.",
      );

      setIsEditing(false);
    } catch (err) {
      alert("Error al guardar la orden");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col pt-6 gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* CABECERA CON BOTONES DE EDICIÓN */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            Detalles de la Orden
          </h2>
          {/*<div className="flex gap-2">
            {!isEditing ? (
              canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
                >
                  Editar Orden
                </button>
              )
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSaving && <CircularProgress size={14} color="inherit" />}
                  Guardar Cambios
                </button>
              </>
            )}
          </div>*/}
        </div>

        {orderId && loading && (
          <p className="px-6 py-6 text-sm text-slate-600">
            Cargando detalles...
          </p>
        )}

        {orderId && !loading && resolvedPanels && (
          <div className="px-6 pb-6 mt-4">
            <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="pt-6">
              {activeTab === "panel1" && (
                <PanelOne
                  data={isEditing ? formData.panel_1 : resolvedPanels.panel_1}
                  fallbackOrder={fallbackOrder}
                  orderId={orderId}
                  isEditing={isEditing}
                  onChange={(field, value) =>
                    handleFieldChange("panel_1", field, value)
                  }
                />
              )}
              {activeTab === "panel2" && (
                <PanelTwo
                  data={isEditing ? formData.panel_2 : resolvedPanels.panel_2}
                  isEditing={isEditing}
                  onChange={(field, value) =>
                    handleFieldChange("panel_2", field, value)
                  }
                />
              )}

              {activeTab === "panel3" && (
                <PanelThree
                  data={isEditing ? formData.panel_3 : resolvedPanels.panel_3}
                  isEditing={isEditing}
                  onChange={(field, value) =>
                    handleFieldChange("panel_3", field, value)
                  }
                />
              )}

              {activeTab === "panel4" && (
                <PanelFour
                  data={isEditing ? formData.panel_4 : resolvedPanels.panel_4}
                  isEditing={isEditing}
                  onChange={(field, value) =>
                    handleFieldChange("panel_4", field, value)
                  }
                />
              )}
              {activeTab === "panel5" && (
                <PanelFive data={resolvedPanels.panel_5} />
              )}
              {activeTab === "panel6" && (
                <PanelSix data={resolvedPanels.panel_6} />
              )}
              {activeTab === "panel7" && (
                <PanelSeven
                  data={resolvedPanels.panel_7}
                  current={resolvedPanels.panel_1}
                />
              )}
            </div>
          </div>
        )}
      </section>

      <div>
        <button
          type="button"
          onClick={onClose}
          disabled={isEditing}
          className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Volver a la lista de órdenes
        </button>
      </div>
    </div>
  );
};

DetailsOrders.propTypes = {
  token: PropTypes.string,
  orderId: PropTypes.string,
  fallbackOrder: PropTypes.object,
  onClose: PropTypes.func,
  currentUser: PropTypes.object,
};

DetailsOrders.defaultProps = {
  token: null,
  orderId: null,
  fallbackOrder: null,
  onClose: () => {},
  currentUser: null,
};

export default DetailsOrders;
