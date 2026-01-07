import { useEffect, useState } from "react";

const BASE_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev";

export const getPrice = async ({ 
    token, 
    tenantId,
    tenantName,
    state, 
    page = 1, 
    pageSize = 100, 
    signal 
} = {}) => {
    // Usamos siempre el endpoint principal de precios por requerimiento
    const endpoint = `${BASE_URL}/getPrice`;

    const params = new URLSearchParams();
    if (tenantId) params.append("tenantId", tenantId);
    if (tenantName) params.append("tenantName", tenantName);
    if (state) params.append("state", state);
    params.append("page", String(page));
    params.append("pageSize", String(pageSize));

    const response = await fetch(`${endpoint}?${params}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Error ${response.status}`);
    }

    return response.json();
};

export const usePrice = ({
    token,
    tenantId,
    tenantName,
    state,
    page = 1,
    pageSize = 100,
    refreshTrigger = 0,
} = {}) => {
    const [data, setData] = useState({
        products: null,
        total: 0,
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!token) return;

        const controller = new AbortController();
        let mounted = true;

        const fetchData = async () => {
            setData(prev => ({ ...prev, loading: true, error: null }));
            try {
                const result = await getPrice({ 
                    token,
                    tenantId,
                    tenantName,
                    state,
                    page,
                    pageSize,
                    signal: controller.signal,
                });
                if (mounted) {
                    const allProducts = Array.isArray(result) ? result : (result.products || []);
                    
                    // Aplicamos el filtro de tópico y estado en el frontend
                    // ya que la API principal puede no estar filtrando por 'state' todavía
                    const products = allProducts.filter(p => {
                        const matchesTopic = p.topic === "price-change";
                        const matchesState = !state || p.state?.toLowerCase() === state.toLowerCase();
                        return matchesTopic && matchesState;
                    });
                    
                    // El total debe reflejar los productos filtrados encontrados en esta página
                    // o el total que devuelva la API si ya viene filtrado.
                    // Si aplicamos filtros en frontend, el total real es products.length
                    const totalFound = state ? products.length : (typeof result.total === 'number' ? result.total : products.length);

                    setData({ 
                        products, 
                        total: totalFound,
                        loading: false, 
                        error: null 
                    });
                }
            } catch (err) {
                if (err.name !== "AbortError" && mounted) {
                    setData(prev => ({ ...prev, products: null, total: 0, loading: false, error: err }));
                }
            }
        };

        fetchData();
        return () => {
            mounted = false;
            controller.abort();
        };
    }, [token, tenantId, tenantName, refreshTrigger, state, page, pageSize]);

    return data;
};
