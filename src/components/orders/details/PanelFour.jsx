import PropTypes from "prop-types";
import { formatText } from "./formatters";

const PanelFour = ({ data, isEditing, onChange }) => {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-sm text-slate-600">Sin datos</p>;
  }

  const fields = [
    {
      label: "Documento / RUT",
      key: "idDocNo",
      placeholder: "Ej. 123456789",
      hint: "Sin puntos ni guión",
    },
    { label: "Tipo documento", key: "idDocType", placeholder: "Ej. RUT o DNI" },
    {
      label: "Tipo persona",
      key: "personType",
      placeholder: "Ej. natural o juridica",
    },
    {
      label: "Razón social",
      key: "businessName",
      placeholder: "Ej. Empresa SpA",
    },
    { label: "Nombre", key: "name", placeholder: "Ej. Juan" },
    { label: "Apellido", key: "lastName", placeholder: "Ej. Pérez" },
    {
      label: "Correo electrónico",
      key: "mail",
      placeholder: "Ej. cliente@correo.com",
    },
    { label: "Teléfono", key: "phone", placeholder: "Ej. +56912345678" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div
          key={field.key}
          className={`rounded-xl border ${
            isEditing
              ? "border-indigo-200 bg-white shadow-sm ring-1 ring-indigo-50"
              : "border-slate-200 bg-slate-50"
          } p-4 transition-all`}
        >
          <p className="text-xs font-semibold uppercase text-slate-500">
            {field.label}
          </p>
          {isEditing ? (
            <div className="mt-1">
              <input
                type="text"
                value={data[field.key] || ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 mt-1 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
              {field.hint && (
                <p className="text-[10px] text-slate-400 mt-1">{field.hint}</p>
              )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-slate-700">
              {formatText(data[field.key])}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

PanelFour.propTypes = {
  data: PropTypes.object,
  isEditing: PropTypes.bool,
  onChange: PropTypes.func,
};

export default PanelFour;
