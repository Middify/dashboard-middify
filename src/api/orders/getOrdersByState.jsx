import { useEffect, useState } from "react";

const API_URL =
  "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getOrdersByState";

export const DASHBOARD_COLUMNS_TEMPLATE = [
  { title: "_id", value: "_id", active: true },
  { title: "LastUpdate", value: "lastUpdate", active: true },
  { title: "TennantId", value: "tennantId", active: true },
  { title: "TennantName", value: "tennantName", active: true },
  { title: "Brand", value: "brand", active: true },
  { title: "Attempts", value: "attempts", active: true },
  { title: "Creation", value: "creation", active: true },
  { title: "Discounts", value: "discounts", active: true },
  { title: "ErrorDetail", value: "errorDetail", active: true },
  { title: "Message", value: "message", active: true },
  { title: "Status", value: "status", active: true },
  { title: "MarketPlace", value: "marketPlace", active: true },
  { title: "OmniChannel", value: "omniChannel", active: true },
  { title: "Taxes", value: "taxes", active: true },
  { title: "SubTotal", value: "subTotal", active: true },
  { title: "Total", value: "total", active: true },
  { title: "ItemQuantity", value: "itemQuantity", active: true },
  { title: "Extras", value: "extras", active: true },
  { title: "Documents", value: "documents", active: true },
  { title: "Comments", value: "comments", active: true },
  { title: "Stages", value: "stages", active: true },
];

export const buildUrlWithParams = ({
  tenantId,
  tenantName,
  status,
  page,
  pageSize,
} = {}) => {
  const url = new URL(API_URL);
  if (tenantId) url.searchParams.set("tenantId", tenantId);
  if (tenantName) url.searchParams.set("tenantName", tenantName);
  if (status) url.searchParams.set("status", status);
  if (page) url.searchParams.set("page", page);
  if (pageSize) url.searchParams.set("pageSize", pageSize);
  return url;
};

export async function fetchTenantColumns({
  token,
  tenantName,
  tenantId,
  signal,
}) {
  if (!token) throw new Error("Falta token");
  if (!tenantName && !tenantId) throw new Error("Falta referencia del tenant");

  const url = buildUrlWithParams({
    tenantId,
    tenantName,
    page: 1,
    pageSize: 1,
  });

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.error || payload?.message || "Error al leer columnas"
    );
  }

  const targetName =
    typeof tenantName === "string" ? tenantName.toLowerCase() : null;
  const targetId =
    tenantId === null || tenantId === undefined ? null : String(tenantId);

  if ((targetName || targetId) && Array.isArray(payload?.columnsConfig)) {
    const match =
      payload.columnsConfig.find((entry) => {
        const entryName =
          typeof entry?.tenantName === "string"
            ? entry.tenantName.toLowerCase()
            : null;
        const entryId =
          entry?.tenantId === null || entry?.tenantId === undefined
            ? null
            : String(entry.tenantId);

        if (targetName && entryName && entryName === targetName) {
          return true;
        }
        if (targetId && entryId && entryId === targetId) {
          return true;
        }
        return false;
      }) ?? null;

    if (match?.columns) {
      return match.columns.map((column) => ({ ...column }));
    }
  }

  if (Array.isArray(payload?.defaultColumns) && payload.defaultColumns.length) {
    return payload.defaultColumns.map((column) => ({ ...column }));
  }

  if (Array.isArray(payload?.columns) && payload.columns.length) {
    return payload.columns.map((column) => ({ ...column }));
  }

  return DASHBOARD_COLUMNS_TEMPLATE.map((column) => ({ ...column }));
}

export const fetchOrdersByState = async ({
  token,
  params = {},
  signal,
} = {}) => {
  if (!token) throw new Error("Falta token");
  const url = buildUrlWithParams(params);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.error || payload?.message || "Error al cargar órdenes"
    );
  }

  return {
    orders: Array.isArray(payload?.orders) ? payload.orders : [],
    meta: payload?.meta || null,
  };
};

export const useOrdersByState = (token, params = {}, refreshTrigger = 0) => {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [columns, setColumns] = useState(
    DASHBOARD_COLUMNS_TEMPLATE.map((column) => ({ ...column }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setOrders([]);
      setMeta(null);
      setColumns(DASHBOARD_COLUMNS_TEMPLATE.map((column) => ({ ...column })));
      setError(new Error("Falta token"));
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [ordersResult, tenantColumns] = await Promise.all([
          fetchOrdersByState({
            token,
            params,
            signal: controller.signal,
          }),
          params?.tenantName || params?.tenantId
            ? fetchTenantColumns({
                token,
                tenantName: params?.tenantName,
                tenantId: params?.tenantId,
                signal: controller.signal,
              }).catch(() => null)
            : Promise.resolve(null),
        ]);

        setOrders(ordersResult.orders);
        setMeta(ordersResult.meta);
        if (tenantColumns && Array.isArray(tenantColumns)) {
          setColumns(tenantColumns);
        } else {
          setColumns(
            DASHBOARD_COLUMNS_TEMPLATE.map((column) => ({ ...column }))
          );
        }
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }
        setOrders([]);
        setMeta(null);
        setColumns(DASHBOARD_COLUMNS_TEMPLATE.map((column) => ({ ...column })));
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [
    token,
    params?.tenantId,
    params?.tenantName,
    params?.status,
    params?.page,
    params?.pageSize,
    refreshTrigger,
  ]);

  return { orders, meta, columns, loading, error };
};