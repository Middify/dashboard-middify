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

export const formatCurrency = (value) => {
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

export const getSelectedStateLabel = (selectedOrderState) => {
  if (!selectedOrderState) {
    return "Todos los estados";
  }

  return ORDER_STATE_LOOKUP[selectedOrderState] ?? selectedOrderState;
};


