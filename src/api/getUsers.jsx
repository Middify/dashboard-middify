import { useEffect, useState } from "react";

const API_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getUsers";

export const getUsers = async ({ token, signal } = {}) => {
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

  const result = await response.json();
  return result.data || result;
};

export const useUsers = (token) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUsers({
          token,
          signal: controller.signal,
        });
        if (isMounted) {
          setUser(data);
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

    loadUser();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [token]);

  return { user, loading, error };
};

