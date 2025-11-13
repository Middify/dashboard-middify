import PropTypes from "prop-types";
import { useMemo } from "react";
import { useOrderDetails } from "../../api/orders/getDetailsOrders";

const formatDateTime = (value) => {
  if (!value) {
    return "Sin datos";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Sin datos";
  }
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatNumber = (value) => {
  if (value === null || value === undefined) {
    return "Sin datos";
  }
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return "Sin datos";
  }
  return new Intl.NumberFormat("es-CL").format(numberValue);
};

const formatText = (value) => {
  if (value === null || value === undefined) {
    return "Sin datos";
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : "Sin datos";
  }
  if (typeof value === "number") {
    return formatNumber(value);
  }
  return "Sin datos";
};

const formatMoney = (money) => {
  if (!money || money.amount === null || money.amount === undefined) {
    return "Sin datos";
  }
  const amount = Number(money.amount);
  if (!Number.isFinite(amount)) {
    return "Sin datos";
  }
  const currencyCode = money.currencyCode || "CLP";
  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (_error) {
    return `${amount} ${currencyCode}`;
  }
};

const getArrayValue = (array, index) => {
  if (!Array.isArray(array)) {
    return null;
  }
  if (index < 0 || index >= array.length) {
    return null;
  }
  return array[index];
};

const InfoCard = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
  </div>
);

InfoCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const DetailsOrders = ({ token, orderId, fallbackOrder, onClose }) => {
  const { details, loading, error } = useOrderDetails(token, orderId, {
    enabled: Boolean(token && orderId),
  });

  const panel1 = details?.panel_1 ?? null;
  const panel2 = details?.panel_2 ?? null;
  const panel6 = details?.panel_6 ?? null;

  const summaryInfo = useMemo(() => {
    return [
      {
        label: "Orden marketplace",
        value: formatText(
          panel1?.orderId ??
            fallbackOrder?.marketPlace?.orderId ??
            fallbackOrder?.marketPlace?.idOrdenMarket ??
            fallbackOrder?.orderId
        ),
      },
      {
        label: "ID interno",
        value: formatText(orderId ?? fallbackOrder?._id ?? fallbackOrder?.id),
      },
      {
        label: "Marketplace",
        value: formatText(
          panel1?.nombre ??
            fallbackOrder?.marketPlace?.nombre ??
            fallbackOrder?.marketPlace?.name
        ),
      },
      {
        label: "Estado (Middify)",
        value: formatText(
          panel1?.statusOrder ??
            fallbackOrder?.status ??
            fallbackOrder?.marketPlace?.status
        ),
      },
      {
        label: "Estado original",
        value: formatText(
          panel1?.status ??
            fallbackOrder?.marketPlace?.status ??
            fallbackOrder?.status
        ),
      },
      {
        label: "Intentos",
        value: formatNumber(
          panel1?.attempts ??
            fallbackOrder?.attempts ??
            fallbackOrder?.marketPlace?.attempts
        ),
      },
      {
        label: "Mensaje",
        value: formatText(
          panel1?.message ??
            fallbackOrder?.message ??
            fallbackOrder?.marketPlace?.message
        ),
      },
      {
        label: "Creación",
        value: formatDateTime(
          panel1?.creation ??
            fallbackOrder?.creation ??
            fallbackOrder?.marketPlace?.creation
        ),
      },
      {
        label: "Última actualización",
        value: formatDateTime(
          panel1?.lastUpdate ??
            fallbackOrder?.lastUpdate ??
            fallbackOrder?.marketPlace?.lastUpdate
        ),
      },
      {
        label: "Error reportado",
        value: formatText(
          panel1?.errorDetail?.message ??
            fallbackOrder?.errorDetail?.message ??
            fallbackOrder?.marketPlace?.errorDetail?.message
        ),
      },
      {
        label: "Subtotal",
        value: formatMoney(panel1?.subTotal ?? fallbackOrder?.subTotal),
      },
      {
        label: "Total",
        value: formatMoney(panel1?.total ?? fallbackOrder?.total),
      },
      {
        label: "Descuentos",
        value: (() => {
          if (!Array.isArray(panel1?.discounts) || panel1.discounts.length === 0) {
            return "Sin datos";
          }
          const formattedDiscounts = panel1.discounts
            .map((discount) => formatMoney(discount))
            .filter((discount) => discount !== "Sin datos");
          if (formattedDiscounts.length === 0) {
            return "Sin datos";
          }
          return formattedDiscounts.join(", ");
        })(),
      },
    ];
  }, [panel1, fallbackOrder, orderId]);

  const products = useMemo(() => {
    if (!panel2) {
      return [];
    }

    const totalItems = Math.max(
      panel2?.name?.length ?? 0,
      panel2?.brand?.length ?? 0,
      panel2?.quantity?.length ?? 0,
      panel2?.unitPrice?.length ?? 0
    );

    if (totalItems === 0) {
      return [];
    }

    return Array.from({ length: totalItems }, (_, index) => {
      const unitPrice = getArrayValue(panel2?.unitPrice, index);
      const payPrice = getArrayValue(panel2?.payPrice, index);
      const deliveryPrice = getArrayValue(panel2?.deliveryPrice, index);
      const quantity = getArrayValue(panel2?.quantity, index);

      return {
        name: formatText(getArrayValue(panel2?.name, index)),
        brand: formatText(getArrayValue(panel2?.brand, index)),
        quantity: formatNumber(quantity),
        unitPrice: formatMoney(unitPrice),
        payPrice: formatMoney(payPrice),
        deliveryPrice: formatMoney(deliveryPrice),
      };
    });
  }, [panel2]);

  const stages = useMemo(() => {
    if (!panel6 || !Array.isArray(panel6?.stages)) {
      return [];
    }
    return panel6.stages.map((stage) => ({
      name: formatText(stage?.name),
      completed: Boolean(stage?.isCompleted),
    }));
  }, [panel6]);

  const handleGoBack = () => {
    onClose();
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-slate-800">
              Detalles de la orden
            </h1>
            <p className="text-sm text-slate-500">
              Consulta el detalle completo de la orden seleccionada. Los campos
              sin información muestran el mensaje{" "}
              <span className="font-semibold text-indigo-600">Sin datos</span>.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              ID: {formatText(orderId ?? fallbackOrder?._id ?? fallbackOrder?.id)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Marketplace:{" "}
              {formatText(
                panel1?.nombre ?? fallbackOrder?.marketPlace?.nombre
              )}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              Estado:{" "}
              {formatText(panel1?.statusOrder ?? fallbackOrder?.status)}
            </span>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {!orderId && (
          <p className="text-sm text-slate-600">
            Selecciona una orden desde la tabla para visualizar sus detalles.
          </p>
        )}

        {orderId && loading && (
          <p className="text-sm text-slate-600">Cargando detalles de la orden...</p>
        )}

        {orderId && !loading && error && (
          <p className="text-sm text-red-500">
            Error al cargar los detalles: {error.message}
          </p>
        )}

        {orderId && !loading && !error && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Información general
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Resumen consolidado de la orden seleccionada.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {summaryInfo.map((item) => (
                  <InfoCard key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">Productos</h2>
              <p className="mt-1 text-sm text-slate-500">
                Productos asociados a la orden y sus valores correspondientes.
              </p>
              {products.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">Sin datos</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {products.map((product, index) => (
                    <div
                      key={`${product.name}-${index}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Marca: {product.brand}
                          </p>
                        </div>
                        <span className="text-xs font-semibold uppercase text-slate-500">
                          Cantidad: {product.quantity}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <InfoCard label="Precio unitario" value={product.unitPrice} />
                        <InfoCard label="Precio pagado" value={product.payPrice} />
                        <InfoCard label="Precio envío" value={product.deliveryPrice} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Etapas de procesamiento
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Revisión del flujo que sigue la orden dentro de Middify.
              </p>
              {stages.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">Sin datos</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {stages.map((stage) => (
                    <li
                      key={stage.name}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-slate-800">
                        {stage.name}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          stage.completed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {stage.completed ? "Completado" : "Pendiente"}
                      </span>
                    </li>
                  ))}
                </ul>
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
};

DetailsOrders.defaultProps = {
  token: null,
  orderId: null,
  fallbackOrder: null,
  onClose: () => {},
};

export default DetailsOrders;

