import { useQuery, keepPreviousData } from "@tanstack/react-query";

const API_URL =
  "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getOrdersByState";

export const DASHBOARD_COLUMNS_TEMPLATE = [
  { title: "TIENDA", value: "logoTienda", active: true },
  { title: "ID ORDEN", value: "idOrden", active: true },
  { title: "CREACIÓN ORIGEN", value: "fechaOrigen", active: true },
  { title: "INGRESO MIDDIFY", value: "fechaMiddify", active: true },
  { title: "ACTUALIZACIÓN", value: "fechaActualizacion", active: true },
  { title: "PROCESAMIENTO", value: "estadoMiddify", active: true },
  { title: "ESTADO ORDEN", value: "estadoOrigen", active: true },
  { title: "COSTO ENVÍO", value: "costoEnvio", active: true },
  { title: "TOTAL PAGADO", value: "totalPagado", active: true },
  { title: "FOLIO BOLETA", value: "folioBoleta", active: true },
  { title: "BOLETA", value: "boletaPdf", active: true },
  { title: "MENSAJE", value: "mensaje", active: true },
];

export const buildUrlWithParams = ({
  tenantId,
  tenantName,
  state,
  page,
  pageSize,
} = {}) => {
  const url = new URL(API_URL);
  if (tenantId) url.searchParams.set("tenantId", tenantId);
  if (tenantName) url.searchParams.set("tenantName", tenantName);
  if (state) url.searchParams.set("state", state);
  if (page) url.searchParams.set("page", page);
  if (pageSize) url.searchParams.set("pageSize", pageSize);
  return url;
};

export const fetchOrdersByState = async ({ token, params = {}, signal }) => {
  if (!token) throw new Error("Token missing");

  if (!params.tenantId || params.tenantId === "") {
    console.log("Petición fantasma bloqueada exitosamente");
    return { orders: [], meta: { total: 0, totalPages: 0 } }; // Le damos un resultado vacío a React para que se quede tranquilo
  }
  const response = await fetch(buildUrlWithParams(params), {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch orders");
  }

  const data = await response.json();
  return {
    orders: Array.isArray(data.orders) ? data.orders : [],
    meta: data.meta || data || {},
  };
};

export const fetchTenantColumns = async () => DASHBOARD_COLUMNS_TEMPLATE;

export const fetchOrdersByStateAllPages = async ({
  token,
  params = {},
  pageSize = 100,
  signal,
  onPage,
  maxPages,
}) => {
  if (!token) throw new Error("Token missing");

  const safePageSize = Number(pageSize) > 0 ? Number(pageSize) : 50;
  const baseParams = { ...params };
  const accumulatedOrders = [];
  let currentPage = 1;
  let shouldContinue = true;

  while (shouldContinue) {
    const { orders, meta } = await fetchOrdersByState({
      token,
      params: { ...baseParams, page: currentPage, pageSize: safePageSize },
      signal,
    });

    accumulatedOrders.push(...orders);

    if (onPage)
      onPage({
        page: currentPage,
        received: orders.length,
        accumulated: accumulatedOrders.length,
        meta,
      });

    const totalPages = Number(meta?.totalPages);
    if (Number.isFinite(totalPages)) {
      shouldContinue = currentPage < totalPages;
    } else {
      shouldContinue = orders.length === safePageSize;
    }

    currentPage++;
    if (maxPages && currentPage > maxPages) shouldContinue = false;
  }

  return { orders: accumulatedOrders };
};

export const useOrdersData = (token, params = {}, refreshTrigger = 0) => {
  return useQuery({
    queryKey: ["orders", token, params, refreshTrigger],
    queryFn: ({ signal }) => fetchOrdersByState({ token, params, signal }),
    enabled: !!token && !!params.tenantId,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 120,
    cacheTime: 1000 * 600,
    refetchOnWindowFocus: false,
  });
};

export const useTenantColumns = (token, tenantId, tenantName) => {
  return useQuery({
    queryKey: ["columns", token, tenantId, tenantName],
    queryFn: fetchTenantColumns,
    enabled: !!token && !!tenantId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    initialData: DASHBOARD_COLUMNS_TEMPLATE,
  });
};
