import { useMemo } from "react";
import { useOrdersByState } from "../api/getOrdersByState";

const ORDER_STATE_ITEMS = [
  { id: "ingresada", label: "Ingresada" },
  { id: "pendiente", label: "Pendiente" },
  { id: "procesada", label: "Procesada" },
  { id: "error", label: "Error" },
  { id: "en_proceso", label: "En proceso" },
  { id: "descartada", label: "Descartada" },
];

const normalizeStatusKey = (status) => {
  if (!status) {
    return "";
  }
  return String(status).toLowerCase().replace(/\s+/g, "_");
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(value));
  } catch (_error) {
    return value;
  }
};

const OrdersTable = ({
  token = null,
  selectedTenantId = null,
  selectedOrderState = null,
}) => {
  const apiStatus = selectedOrderState
    ? selectedOrderState.replace(/_/g, " ")
    : null;

  const { orders, meta, loading, error } = useOrdersByState(token, {
    tenantId: selectedTenantId ?? undefined,
    status: apiStatus ?? undefined,
  });

  const filteredOrders = useMemo(() => {
    return (orders || []).filter((order) => {
      if (!order || typeof order !== "object") {
        return false;
      }

      const matchesTenant = selectedTenantId
        ? order.tennantId === selectedTenantId || order.tenantId === selectedTenantId
        : true;
      const normalizedStatus = normalizeStatusKey(order.status);
      const matchesStatus = selectedOrderState
        ? normalizedStatus === selectedOrderState
        : true;

      return matchesTenant && matchesStatus;
    });
  }, [orders, selectedOrderState, selectedTenantId]);

  const selectedStateLabel =
    ORDER_STATE_ITEMS.find((item) => item.id === selectedOrderState)?.label ??
    "Todos los estados";

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-800">Estado de órdenes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Mostrando{" "}
          <span className="font-medium text-indigo-600">
            {selectedStateLabel.toLowerCase()}
          </span>{" "}
          {selectedTenantId ? "para la tienda seleccionada" : "para todas las tiendas"}.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Total</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              {meta?.total ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Página</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              {meta?.page ?? "—"} / {meta?.totalPages ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Tamaño de página
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              {meta?.pageSize ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Estado</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              {meta?.ok ? "Operativo" : meta?.ok === false ? "Sin datos" : "—"}
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Cargando órdenes...
          </div>
        )}
        {error && !loading && (
          <div className="px-6 py-12 text-center text-sm text-red-500">
            Error al cargar las órdenes: {error.message}
          </div>
        )}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No hay órdenes disponibles para los filtros seleccionados.
          </div>
        )}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Orden
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tienda
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mensaje
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Creación
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actualización
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredOrders.map((order) => {
                  const orderId = order._id ?? order.id ?? "—";
                  const marketplace = order.marketPlace ?? {};
                  const statusLabel =
                    ORDER_STATE_ITEMS.find(
                      (item) => item.id === normalizeStatusKey(order.status)
                    )?.label ?? order.status ?? "—";
                  const creationDate = marketplace.creation ?? order.creation;
                  const lastUpdateDate = marketplace.lastUpdate ?? order.lastUpdate;
                  const totalAmount =
                    order.total?.amount ?? marketplace.total?.amount ?? null;

                  return (
                    <tr key={`${orderId}-${order.tennantId ?? order.tenantId ?? ""}`}>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <div className="font-medium text-slate-800">
                          {marketplace.orderId ?? "—"}
                        </div>
                        <div className="text-xs text-slate-500">{orderId}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <div className="font-medium text-slate-800">
                          {order.tennantName ?? order.tenantName ?? "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {order.tennantId ?? order.tenantId ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-indigo-600">
                        {statusLabel}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {order.message ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDateTime(creationDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDateTime(lastUpdateDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        {formatCurrency(totalAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default OrdersTable;

