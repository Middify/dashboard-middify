import { useEffect, useState } from "react";

const API_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getPrice";

export const getPrice = async ({ 
    token, 
    tenantId,
    tenantName,
    state, 
    page = 1, 
    pageSize = 100, 
    signal 
} = {}) => {
    const params = new URLSearchParams();
    if (tenantId) params.append("tenantId", tenantId);
    if (tenantName) params.append("tenantName", tenantName);
    if (state) params.append("state", state);
    params.append("page", String(page));
    params.append("pageSize", String(pageSize));

    const response = await fetch(`${API_URL}?${params}`, {
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
                    const products = Array.isArray(result) ? result : (result.products || []);
                    setData({ 
                        products, 
                        total: typeof result.total === 'number' ? result.total : products.length,
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
