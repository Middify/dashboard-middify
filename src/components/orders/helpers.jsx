const DATE_FORMATTER = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "short",
  timeStyle: "short",
});

const CURRENCY_FORMATTER = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const ORDER_STATE_ITEMS = [
  { id: "ingresada", label: "Ingresada" },
  { id: "pendiente", label: "Pendiente" },
  { id: "procesada", label: "Procesada" },
  { id: "error", label: "Error" },
  { id: "en_proceso", label: "En proceso" },
  { id: "descartada", label: "Descartada" },
];

export const ORDER_STATE_LOOKUP = ORDER_STATE_ITEMS.reduce((acc, item) => {
  acc[item.id] = item.label;
  return acc;
}, {});

export const normalizeStatusKey = (status) => {
  if (!status) {
    return "";
  }
  return String(status).toLowerCase().replace(/\s+/g, "_");
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  
  const date = value instanceof Date ? value : new Date(value);
  
  if (isNaN(date.getTime())) return String(value);

  return DATE_FORMATTER.format(date);
};

export const formatCurrency = (value) => {
  if (value === null || value === undefined) return "—";
  
  const num = Number(value);
  if (isNaN(num)) return "—";

  return CURRENCY_FORMATTER.format(num);
};

export const getSelectedStateLabel = (selectedOrderState) => {
  if (!selectedOrderState) {
    return "Todos los estados";
  }

  return ORDER_STATE_LOOKUP[selectedOrderState] ?? selectedOrderState;
};
