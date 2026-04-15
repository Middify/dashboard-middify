import { useQuery } from "@tanstack/react-query";

const API_URL =
  "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getProductStates";

export const fetchProductStates = async ({ token, tenantId, signal }) => {
  if (!token) throw new Error("Token missing");
  if (!tenantId) throw new Error("tenantId es obligatorio");

  const url = new URL(API_URL);
  url.searchParams.append("tenantId", tenantId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  // if (!response.ok) {
  //   const error = await response.json().catch(() => ({}));
  //   throw new Error(error.message || `Error ${response.status}`);
  // }
  if (!response.ok) {
    // Si es 404, asumimos que no hay datos para este rol/tenant y devolvemos un array vacío silenciosamente.
    if (response.status === 404) {
      console.warn(
        "No se encontraron datos para este tenant (404). Devolviendo lista vacía.",
      );
      return [];
    }

    // Si es otro error (500, 401, etc.), sí lanzamos el error para que React Query lo maneje.
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error ${response.status}`);
  }

  const data = await response.json();
  return data.tenants || data || [];
};

export const useProductStates = (
  token,
  tenantId,
  autoRefreshInterval = null,
) => {
  return useQuery({
    queryKey: ["productStates", token, tenantId],
    queryFn: ({ signal }) => fetchProductStates({ token, tenantId, signal }),
    enabled: !!token && !!tenantId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchInterval: autoRefreshInterval,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
