import PropTypes from "prop-types";
import {
  formatDateTime,
  formatMoney,
  formatText,
  safeArray,
} from "./formatters";

const EditableAddressBlock = ({
  title,
  address,
  typeKey,
  index,
  isEditing,
  onChange,
}) => {
  if (!address || Object.keys(address).length === 0) return null;

  const fields = [
    { label: "Dirección 1", key: "line1", placeholder: "Ej. Los Maitenes 162" },
    {
      label: "Dirección 2",
      key: "line2",
      placeholder: "Ej. Depto 402 (Opcional)",
    },
    { label: "Ciudad", key: "city", placeholder: "Ej. Santiago" },
    {
      label: "Comuna / Municipalidad",
      key: "municipality",
      placeholder: "Ej. Providencia",
    },
    { label: "Región", key: "region", placeholder: "Ej. Región Metropolitana" },
    { label: "País", key: "country", placeholder: "Ej. Chile" },
    { label: "Código Postal", key: "zipCode", placeholder: "Ej. 7550000" },
    {
      label: "Persona de contacto",
      key: "contactPerson",
      placeholder: "Ej. Gina Torres",
    },
    {
      label: "Teléfono de contacto",
      key: "contactPhone",
      placeholder: "Ej. +56912345678",
    },
  ];

  return (
    <div
      className={`rounded-xl border ${
        isEditing
          ? "border-indigo-200 bg-white shadow-sm ring-1 ring-indigo-50"
          : "border-slate-200 bg-slate-50"
      } p-4 transition-all`}
    >
      <h3 className="text-sm font-semibold text-slate-800 mb-3">{title}</h3>
      <dl className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key}>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              {field.label}
            </dt>
            {isEditing ? (
              <input
                type="text"
                value={address[field.key] || ""}
                onChange={(e) =>
                  onChange(typeKey, index, field.key, e.target.value)
                }
                placeholder={field.placeholder}
                className="w-full text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 mt-1 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            ) : (
              <dd className="text-sm text-slate-700 mt-0.5">
                {formatText(address[field.key])}
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
};

const PanelThree = ({ data, isEditing, onChange }) => {
  if (!data) return <p className="text-sm text-slate-600">Sin datos</p>;

  // Extraemos limpiamente el monto numérico
  const cost =
    typeof data?.cost === "object"
      ? (data?.cost?.amount ?? 0)
      : (data?.cost ?? 0);
  const date = formatDateTime(data?.cost?.date ?? data?.date);
  const pickUpAddresses = safeArray(data?.pickupAddress);
  const deliveryAddresses = safeArray(data?.address);
  const handleAddressChange = (typeKey, index, field, value) => {
    const list = [...safeArray(data?.[typeKey])];
    list[index] = { ...list[index], [field]: value };
    onChange(typeKey, list);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Fecha de envío
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">{date}</p>
        </div>

        <div
          className={`rounded-xl border ${
            isEditing
              ? "border-indigo-200 bg-white shadow-sm ring-1 ring-indigo-50"
              : "border-slate-200 bg-slate-50"
          } p-4 transition-all`}
        >
          <p className="text-xs font-semibold uppercase text-slate-500">
            Costo de Envío
          </p>
          {isEditing ? (
            <input
              type="number"
              value={cost}
              onChange={(e) => onChange("cost", e.target.value)}
              ß
              placeholder="Ej. 3033"
              className="w-full text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 mt-1 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          ) : (
            <p className="mt-1 text-sm font-medium text-slate-800">
              {formatMoney(cost)}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {deliveryAddresses.map((address, index) => (
          <EditableAddressBlock
            key={`delivery-${index}`}
            title={`Dirección de entrega ${deliveryAddresses.length > 1 ? index + 1 : ""}`}
            address={address}
            typeKey="address"
            index={index}
            isEditing={isEditing}
            onChange={handleAddressChange}
          />
        ))}
        {pickUpAddresses.map((address, index) => (
          <EditableAddressBlock
            key={`pickup-${index}`}
            title={`Dirección de retiro ${pickUpAddresses.length > 1 ? index + 1 : ""}`}
            address={address}
            typeKey="pickupAddress"
            index={index}
            isEditing={isEditing}
            onChange={handleAddressChange}
          />
        ))}
      </div>
    </div>
  );
};

PanelThree.propTypes = {
  data: PropTypes.object,
  isEditing: PropTypes.bool,
  onChange: PropTypes.func,
};

export default PanelThree;
