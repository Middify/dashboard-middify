import { useQuery } from "@tanstack/react-query";

const API_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getMarketplaceSummary";

export const fetchMarketplaceSummary = async ({ token, tenantId, signal }) => {
  if (!token) throw new Error("Token missing");
  if (!tenantId) throw new Error("tenantId es obligatorio");

  const url = new URL(API_URL);
  url.searchParams.append("tenantId", tenantId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { 
      Authorization: `Bearer ${token}`
    },
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error ${response.status}`);
  }

  const data = await response.json();
  return data.tenants || data || [];
};

export const useMarketplaceSummary = (token, tenantId, autoRefreshInterval = null) => {
  return useQuery({
    queryKey: ["marketplaceSummary", token, tenantId],
    queryFn: ({ signal }) => fetchMarketplaceSummary({ token, tenantId, signal }),
    enabled: !!token && !!tenantId,
    staleTime: 1000 * 60 * 5, // 5 minutos de datos "frescos"
    gcTime: 1000 * 60 * 10,    // Mantener en caché 10 minutos
    refetchInterval: autoRefreshInterval,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

