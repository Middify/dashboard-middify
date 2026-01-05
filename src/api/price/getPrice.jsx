import { useEffect, useState } from "react";

const API_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getPrice";

export const getPrice = async ({ token, signal } = {}) => {
    const response = await fetch(API_URL, {
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

export const usePrice = (token, refreshTrigger, state) => {
    const [data, setData] = useState({ products: null, total: 0, loading: true, error: null });

    useEffect(() => {
        const controller = new AbortController();
        let mounted = true;

        const fetchData = async () => {
            setData(prev => ({ ...prev, loading: true, error: null }));
            try {
                const result = await getPrice({ token, signal: controller.signal });
                if (mounted) {
                    setData({ 
                        products: result.products, 
                        total: result.total, 
                        loading: false, 
                        error: null 
                    });
                }
            } catch (err) {
                if (err.name !== "AbortError" && mounted) {
                    setData({ products: null, total: 0, loading: false, error: err });
                }
            }
        };

        fetchData();
        return () => {
            mounted = false;
            controller.abort();
        };
    }, [token, refreshTrigger]);

    return data;
};

