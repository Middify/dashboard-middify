import PropTypes from "prop-types";
import { formatMoney, formatNumber, formatText, safeArray } from "./formatters";

const PanelTwo = ({ data, isEditing, onChange }) => {
  const brands = safeArray(data?.brand);
  const names = safeArray(data?.name);
  const quantities = safeArray(data?.quantity);
  const unitPrices = safeArray(data?.unitPrice);
  const payPrices = safeArray(data?.payPrice);
  const deliveryPrices = safeArray(data?.deliveryPrice);

  const totalItems = Math.max(
    brands.length,
    names.length,
    quantities.length,
    unitPrices.length,
  );

  if (totalItems === 0) {
    return <p className="text-sm text-slate-600">Sin datos</p>;
  }

  const handleItemChange = (index, field, value) => {
    if (!onChange) return;
    const currentArray = [...safeArray(data?.[field])];
    currentArray[index] = value;
    onChange(field, currentArray);
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: totalItems }, (_, index) => {
        const name = formatText(names[index]);
        const brand = formatText(brands[index]);
        const quantity = quantities[index] ?? 1;
        const unitPrice = unitPrices[index] ?? 0;
        const payPrice = payPrices[index] ?? 0;
        const deliveryPrice = deliveryPrices[index] ?? 0;

        return (
          <div
            key={`${name}-${index}`}
            className={`rounded-xl border ${
              isEditing
                ? "border-indigo-200 bg-white shadow-sm ring-1 ring-indigo-50"
                : "border-slate-200 bg-slate-50"
            } p-4 transition-all`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{name}</p>
                <p className="text-xs text-slate-500">Marca: {brand}</p>
              </div>
              <div className="w-32">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Cantidad
                </p>
                {isEditing ? (
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    placeholder="Ej. 1"
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 mt-1 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                ) : (
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatNumber(quantity)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Precio unitario
                </p>
                {isEditing ? (
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) =>
                      handleItemChange(index, "unitPrice", e.target.value)
                    }
                    placeholder="Ej. 15000"
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 mt-1 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                ) : (
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatMoney(unitPrice)}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Precio pagado
                </p>
                {isEditing ? (
                  <input
                    type="number"
                    value={payPrice}
                    onChange={(e) =>
                      handleItemChange(index, "payPrice", e.target.value)
                    }
                    placeholder="Ej. 15000"
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 mt-1 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                ) : (
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatMoney(payPrice)}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Precio envío
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {formatMoney(deliveryPrice)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

PanelTwo.propTypes = {
  data: PropTypes.object,
  isEditing: PropTypes.bool,
  onChange: PropTypes.func,
};

export default PanelTwo;
