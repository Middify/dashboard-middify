import { useQuery, keepPreviousData } from "@tanstack/react-query";

const API_URL =
  "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getOrdersByState";

export const DASHBOARD_COLUMNS_TEMPLATE = [
  { value: "marketPlace", title: "TIENDA", active: true },
  { value: "_id", title: "ID ORDEN", active: true },
  { value: "creation", title: "CREACIÓN ORIGEN", active: true },
  { value: "brand", title: "INGRESO MIDDIFY", active: true },
  { value: "lastUpdate", title: "ACTUALIZACIÓN", active: true },
  { value: "stages", title: "PROCESAMIENTO", active: true },
  { value: "status", title: "ESTADO ORDEN", active: true },
  { value: "subTotal", title: "COSTO ENVÍO", active: true },
  { value: "total", title: "TOTAL PAGADO", active: true },
  { value: "taxes", title: "FOLIO BOLETA", active: true },
  { value: "documents", title: "BOLETA", active: true },
  { value: "message", title: "MENSAJE", active: true },
];

export const buildUrlWithParams = ({
  tenantId,
  tenantName,
  state,
  page,
  pageSize,
  marketPlace,
} = {}) => {
  const url = new URL(API_URL);
  if (tenantId) url.searchParams.set("tenantId", tenantId);
  if (tenantName) url.searchParams.set("tenantName", tenantName);
  if (state) url.searchParams.set("state", state);
  if (page) url.searchParams.set("page", page);
  if (pageSize) url.searchParams.set("pageSize", pageSize);
  if (marketPlace) url.searchParams.set("marketPlace", marketPlace);
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

export const fetchTenantColumns = async ({ token, tenantName, signal }) => {
  if (!token || !tenantName) return DASHBOARD_COLUMNS_TEMPLATE;

  try {
    const result = await fetchOrdersByState({
      token,
      params: { tenantName, pageSize: 1 },
      signal,
    });

    const columnsConfig = result.meta?.columnsConfig;

    if (Array.isArray(columnsConfig) && columnsConfig.length > 0) {
      return DASHBOARD_COLUMNS_TEMPLATE.map((col) => {
        const backendCol = columnsConfig.find((bc) => bc.value === col.value);
        return {
          ...col,
          active: backendCol ? backendCol.active : col.active,
        };
      });
    }

    return DASHBOARD_COLUMNS_TEMPLATE;
  } catch (error) {
    console.error("Error atrapando al pasajero clandestino:", error);
    return DASHBOARD_COLUMNS_TEMPLATE;
  }
};

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
    queryKey: ["tenantColumns", token, tenantId, tenantName],
    queryFn: ({ signal }) => fetchTenantColumns({ token, tenantName, signal }),
    enabled: !!token && !!tenantName,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    initialData: DASHBOARD_COLUMNS_TEMPLATE,
  });
};
