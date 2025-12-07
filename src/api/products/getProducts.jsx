import { useEffect, useState } from "react";

const API_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/products";

export const getProducts = async ({ token, tenantId, tenantName, state, signal } = {}) => {
    const params = new URLSearchParams();
    if (tenantId) params.append("tenantId", tenantId);
    if (tenantName) params.append("tenantName", tenantName);
    if (state) params.append("state", state);

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

export const useProducts = (token, tenantId, tenantName, refreshTrigger, state) => {
    const [data, setData] = useState({ products: null, loading: true, error: null });

    useEffect(() => {
        const controller = new AbortController();
        let mounted = true;

        const fetchData = async () => {
            setData(prev => ({ ...prev, loading: true, error: null }));
            try {
                const result = await getProducts({ token, tenantId, tenantName, state, signal: controller.signal });
                if (mounted) {
                    setData({ products: result, loading: false, error: null });
                }
            } catch (err) {
                if (err.name !== "AbortError" && mounted) {
                    setData({ products: null, loading: false, error: err });
                }
            }
        };

        fetchData();
        return () => {
            mounted = false;
            controller.abort();
        };
    }, [token, tenantId, tenantName, refreshTrigger, state]);

    return data;
};
