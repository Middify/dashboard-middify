import { useEffect, useState, useRef } from "react";

const API_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getMarketplaceSummary";

export const getMarketplaceSummary = async ({ token, signal } = {}) => {
  if (!token) {
    throw new Error("Token de autenticación no proporcionado.");
  }

  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}`);
  }

  return response.json();
};

export const useMarketplaceSummary = (token, autoRefreshInterval = null) => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!token) {
      setTenants([]);
      setLoading(false);
      isInitialLoad.current = true;
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const load = async () => {
      if (isInitialLoad.current) setLoading(true);
      setError(null);
      try {
        const data = await getMarketplaceSummary({ token, signal: controller.signal });
        if (isMounted) {
          setTenants(data.tenants || data || []);
          isInitialLoad.current = false;
        }
      } catch (err) {
        if (err.name !== "AbortError" && isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    // Auto-refresh si se especifica intervalo
    let intervalId = null;
    if (autoRefreshInterval && autoRefreshInterval > 0) {
      intervalId = setInterval(load, autoRefreshInterval);
    }

    return () => {
      isMounted = false;
      controller.abort();
      if (intervalId) clearInterval(intervalId);
    };
  }, [token, autoRefreshInterval]);

  useEffect(() => {
    isInitialLoad.current = true;
  }, [token]);

  return { tenants, loading, error };
};

