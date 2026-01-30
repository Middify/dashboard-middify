import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev";

export const fetchProducts = async ({ 
    token, 
    tenantId, 
    tenantName, 
    state, 
    page = 1, 
    pageSize = 100, 
    signal 
} = {}) => {
    if (!token) throw new Error("Token missing");
    if (!tenantId) throw new Error("tenantId es obligatorio");

    // Según el backend, el endpoint es único o se maneja por parámetros
    const endpoint = `${BASE_URL}/getProducts`;
    
    const params = new URLSearchParams();
    params.append("tenantId", tenantId);
    if (tenantName) params.append("tenantName", tenantName);
    if (state) params.append("state", state);
    params.append("page", String(page));
    params.append("pageSize", String(pageSize));

    const response = await fetch(`${endpoint}?${params}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        signal,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Error ${response.status}`);
    }

    const data = await response.json();
    
    return {
        products: data.products || [],
        total: data.total || 0,
        totalPages: data.totalPages || 0,
        columnsConfig: data.columnsConfig || []
    };
};

export const useProducts = ({
    token,
    tenantId,
    tenantName,
    state,
    page = 1,
    pageSize = 100,
    refreshTrigger = 0,
} = {}) => {
    const query = useQuery({
        queryKey: ["products", token, tenantId, tenantName, state, page, pageSize, refreshTrigger],
        queryFn: ({ signal }) => fetchProducts({ 
            token, 
            tenantId, 
            tenantName, 
            state, 
            page, 
            pageSize, 
            signal 
        }),
        enabled: !!token && !!tenantId,
        staleTime: 1000 * 60 * 2, // 2 minutos
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    return {
        products: query.data?.products ?? null,
        total: query.data?.total ?? 0,
        columnsConfig: query.data?.columnsConfig ?? [],
        loading: query.isLoading,
        error: query.error,
        isFetching: query.isFetching
    };
};
