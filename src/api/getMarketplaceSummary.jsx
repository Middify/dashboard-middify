import { useEffect, useState } from "react";

const API_URL ="https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getMarketplaceSummary";

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

export const useMarketplaceSummary = (token) => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setTenants([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMarketplaceSummary({
          token,
          signal: controller.signal,
        });
        if (isMounted) {
          const tenantList = Array.isArray(data)
            ? data
            : Array.isArray(data?.tenants)
            ? data.tenants
            : [];
          setTenants(tenantList);
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

    load();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [token]);

  return { tenants, loading, error };
};

