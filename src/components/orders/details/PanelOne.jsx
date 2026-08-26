import PropTypes from "prop-types";
import {
  formatDateTime,
  formatMoney,
  formatNumber,
  formatText,
} from "./formatters";

const EditableInfoCard = ({
  label,
  value,
  field,
  isEditing,
  isLocked,
  type = "text",
  placeholder,
  hint,
  onChange,
}) => {
  return (
    <div
      className={`rounded-xl border ${isEditing && !isLocked ? "border-indigo-200 bg-white shadow-sm ring-1 ring-indigo-50" : "border-slate-200 bg-slate-50"} p-4 transition-all`}
    >
      <p className="text-xs font-semibold uppercase text-slate-500 mb-1">
        {label}
      </p>

      {isEditing && !isLocked ? (
        <div className="mt-1">
          <input
            type={type}
            value={value || ""}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={placeholder}
            className="w-full text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-indigo-500 focus:bg-white placeholder:text-slate-300 transition-colors"
          />
          {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
        </div>
      ) : (
        <p className="text-sm font-medium text-slate-800">
          {type === "money"
            ? formatMoney(value)
            : type === "number"
              ? formatNumber(value)
              : formatText(value)}
        </p>
      )}
    </div>
  );
};

const PanelOne = ({ data, fallbackOrder, orderId, isEditing, onChange }) => {
  const summaryInfo = [
    {
      label: "Orden marketplace",
      field: "orderId",
      value:
        data?.orderId ??
        fallbackOrder?.marketPlace?.orderId ??
        fallbackOrder?.marketPlace?.idOrdenMarket ??
        fallbackOrder?.orderId,
      isLocked: true,
    },
    {
      label: "ID interno",
      field: "_id",
      value: orderId ?? fallbackOrder?._id ?? fallbackOrder?.id,
      isLocked: true,
    },
    {
      label: "Marketplace",
      field: "nombre",
      value:
        data?.nombre ??
        fallbackOrder?.marketPlace?.nombre ??
        fallbackOrder?.marketPlace?.name,
      isLocked: true,
    },
    {
      label: "Estado (Middify)",
      field: "statusOrder",
      value:
        data?.statusOrder ??
        fallbackOrder?.status ??
        fallbackOrder?.marketPlace?.status,
      isLocked: true,
      placeholder: "Ej. ingresada, procesada, error, pendiente o descartada",
      hint: "Debe coincidir con los estados válidos del sistema.",
    },
    {
      label: "Estado original",
      field: "status",
      value:
        data?.status ??
        fallbackOrder?.marketPlace?.status ??
        fallbackOrder?.status,
      isLocked: true,
    },
    {
      label: "Intentos",
      value:
        data?.attempts ??
        fallbackOrder?.attempts ??
        fallbackOrder?.marketPlace?.attempts,
      type: "number",
      isLocked: true,
    },
    {
      label: "Mensaje",
      field: "message",
      value:
        data?.message ??
        fallbackOrder?.message ??
        fallbackOrder?.marketPlace?.message,
      isLocked: true,
      placeholder: "Ej. Timeout esperando respuesta del ERP",
    },
    {
      label: "Creación",
      field: "creation",
      value:
        data?.creation ??
        fallbackOrder?.creation ??
        fallbackOrder?.marketPlace?.creation,
      type: "date", // Esto es solo referencial, está bloqueado
      isLocked: true,
    },
    {
      label: "Última actualización",
      field: "lastUpdate",
      value:
        data?.lastUpdate ??
        fallbackOrder?.lastUpdate ??
        fallbackOrder?.marketPlace?.lastUpdate,
      type: "date",
      isLocked: true,
    },
    {
      label: "Error reportado",
      value:
        data?.errorDetail?.message ??
        fallbackOrder?.errorDetail?.message ??
        fallbackOrder?.marketPlace?.errorDetail?.message,
      isLocked: true,
    },
    {
      label: "Subtotal",
      field: "subTotal",
      value: data?.subTotal ?? fallbackOrder?.subTotal,
      type: "money",
      isLocked: true,
      placeholder: "0",
    },
    {
      label: "Total",
      field: "total",
      value: data?.total ?? fallbackOrder?.total,
      type: "money",
      isLocked: true,
      placeholder: "0",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">
        {isEditing ? "Editando Resumen" : "Resumen de la orden"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {summaryInfo.map((item, i) => (
          <EditableInfoCard
            key={i}
            label={item.label}
            value={item.value}
            field={item.field}
            type={item.type}
            isEditing={isEditing}
            isLocked={item.isLocked}
            placeholder={item.placeholder}
            hint={item.hint}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
};

export default PanelOne;
