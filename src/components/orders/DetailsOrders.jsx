import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useOrderDetails } from "../../api/orders/getDetailsOrders";
import PanelOne from "./details/PanelOne";
import PanelTwo from "./details/PanelTwo";
import PanelThree from "./details/PanelThree";
import PanelFour from "./details/PanelFour";
import PanelFive from "./details/PanelFive";
import PanelSix from "./details/PanelSix";
import PanelSeven from "./details/PanelSeven";
import { formatText } from "./details/formatters";

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
  const { details, loading, error } = useOrderDetails(token, orderId, {
    enabled: Boolean(token && orderId),
  });

  const resolvedPanels = useMemo(() => {
    if (details) {
      return details;
    }
    return buildFallbackPanels(fallbackOrder);
  }, [details, fallbackOrder]);

  const [activeTab, setActiveTab] = useState(TABS[0].id);

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

    const lockedStatuses = [
      "procesada",
      "procesado",
      "completada",
      "completado",
      "completed",
      "finalizada",
    ];

    const isLocked = lockedStatuses.includes(currentStatus);

    return !isLocked;
  };

  const canEdit = checkEditPermission();

  return (
    <div className="flex flex-col pt-6 gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {!orderId && (
          <p className="px-6 py-6 text-sm text-slate-600">
            Selecciona una orden desde la tabla para visualizar sus detalles.
          </p>
        )}

        {orderId && loading && (
          <p className="px-6 py-6 text-sm text-slate-600">
            Cargando detalles de la orden...
          </p>
        )}

        {orderId && !loading && error && (
          <div className="mx-6 mt-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            Error al cargar los detalles desde la API: {error.message}. Se
            muestra la información disponible localmente.
          </div>
        )}

        {orderId && !loading && resolvedPanels && (
          <div className="px-6 pb-6">
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
                  data={resolvedPanels.panel_1}
                  fallbackOrder={fallbackOrder}
                  orderId={orderId}
                  canEdit={canEdit}
                />
              )}
              {activeTab === "panel2" && (
                <PanelTwo data={resolvedPanels.panel_2} canEdit={canEdit} />
              )}
              {activeTab === "panel3" && (
                <PanelThree data={resolvedPanels.panel_3} canEdit={canEdit} />
              )}
              {activeTab === "panel4" && (
                <PanelFour data={resolvedPanels.panel_4} canEdit={canEdit} />
              )}
              {activeTab === "panel5" && (
                <PanelFive data={resolvedPanels.panel_5} canEdit={canEdit} />
              )}
              {activeTab === "panel6" && (
                <PanelSix data={resolvedPanels.panel_6} canEdit={canEdit} />
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
          onClick={handleGoBack}
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
