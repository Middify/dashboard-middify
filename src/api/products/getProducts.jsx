import { useEffect, useState } from "react";

const API_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/products";

export const getProducts = async ({ token, tenantId, tenantName, signal } = {}) => {
    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // Construcción de query params
    const queryParams = new URLSearchParams();

    if (tenantId) queryParams.append("tenantId", tenantId);
    if (tenantName) queryParams.append("tenantName", tenantName);

    const url = `${API_URL}?${queryParams.toString()}`;

    console.log("Fetching:", url);

    const response = await fetch(url, {
        method: "GET",
        headers,
        signal,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
    }

    return result;
};


export const useProducts = (token, tenantId = null, tenantName = null, refreshTrigger = 0) => {
    const [products, setProducts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        let isMounted = true;

        const loadProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getProducts({
                    token,
                    tenantId,
                    tenantName,
                    signal: controller.signal,
                });
                if (isMounted) {
                    setProducts(data);
                }
            } catch (err) {
                if (err.name === "AbortError") {
                    return;
                }
                if (isMounted) {
                    setError(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [token, tenantId, tenantName, refreshTrigger]);

    return { products, loading, error };
};
