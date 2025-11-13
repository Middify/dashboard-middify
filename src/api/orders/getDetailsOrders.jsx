import { useEffect, useRef, useState } from "react";

const API_URL =
  "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getDetailsOrders";

const CACHE_TTL_MS = 30 * 1000;

const buildUrlWithParams = (orderId) => {
  const url = new URL(API_URL);
  if (orderId) {
    url.searchParams.set("_id", orderId);
  }
  return url;
};

export const getOrderDetails = async ({ token, orderId, signal } = {}) => {
  if (!token) {
    throw new Error("Token de autenticación no proporcionado.");
  }

  if (!orderId) {
    throw new Error("Identificador de orden no proporcionado.");
  }

  const endpoint = buildUrlWithParams(orderId);

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_error) {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.message ??
      payload?.error ??
      `Error ${response.status}: no se pudieron obtener los detalles de la orden.`;
    throw new Error(message);
  }

  if (payload?.success === false) {
    throw new Error(
      payload?.message ??
        "La API devolvió un estado de error al obtener los detalles de la orden."
    );
  }

  return payload?.data ?? null;
};

export const useOrderDetails = (
  token,
  orderId,
  { enabled = true } = {}
) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(Boolean(token && orderId && enabled));
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    if (!token || !orderId || !enabled) {
      setDetails(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;
    const cacheKey = orderId;
    const now = Date.now();
    const cachedResult = cacheRef.current.get(cacheKey);

    if (cachedResult && now - cachedResult.timestamp < CACHE_TTL_MS) {
      if (isMounted) {
        setDetails(cachedResult.details);
        setLoading(false);
      }
      return () => {
        isMounted = false;
        controller.abort();
      };
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getOrderDetails({
          token,
          orderId,
          signal: controller.signal,
        });

        if (isMounted) {
          setDetails(data);
          cacheRef.current.set(cacheKey, {
            details: data,
            timestamp: Date.now(),
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
  }, [token, orderId, enabled]);

  return { details, loading, error };
};


