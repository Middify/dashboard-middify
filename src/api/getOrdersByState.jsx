import { useEffect, useState } from "react";

const API_URL =
  "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getOrdersByState";

const buildUrlWithParams = ({ tenantId, status, page, pageSize } = {}) => {
  const url = new URL(API_URL);

  if (tenantId) {
    url.searchParams.set("tenantId", tenantId);
  }
  if (status) {
    url.searchParams.set("status", status);
  }
  if (page) {
    url.searchParams.set("page", page);
  }
  if (pageSize) {
    url.searchParams.set("pageSize", pageSize);
  }

  return url;
};

export const getOrdersByState = async ({
  token,
  signal,
  tenantId,
  status,
  page,
  pageSize,
} = {}) => {
  if (!token) {
    throw new Error("Token de autenticación no proporcionado.");
  }

  const endpoint = buildUrlWithParams({
    tenantId,
    status,
    page,
    pageSize,
  });

  const response = await fetch(endpoint, {
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

export const useOrdersByState = (
  token,
  { tenantId = null, status = null, page = null, pageSize = null } = {}
) => {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setOrders([]);
      setMeta(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getOrdersByState({
          token,
          signal: controller.signal,
          tenantId,
          status,
          page,
          pageSize,
        });
        if (isMounted) {
          setOrders(Array.isArray(data?.orders) ? data.orders : []);
          setMeta({
            ok: data?.ok ?? null,
            total: data?.total ?? null,
            page: data?.page ?? null,
            pageSize: data?.pageSize ?? null,
            totalPages: data?.totalPages ?? null,
          });
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
  }, [token, tenantId, status, page, pageSize]);

  return { orders, meta, loading, error };
};

