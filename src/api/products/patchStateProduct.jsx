const API_URL =
  "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/patchStateProduct";

export const patchExportProducts = async ({
  token,
  ids,
  state,
  user,
  mailUser,
  signal,
} = {}) => {
  if (!token) {
    throw new Error("Token de autenticación no proporcionado.");
  }

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new Error("Se requiere al menos un ID de producto.");
  }

  if (!state) {
    throw new Error("Se requiere un estado.");
  }

  try {
    const response = await fetch(API_URL, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids,
        state,
        user,
        mailUser: mailUser || null,
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Error ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    // Si es un error de red, proporcionar más información
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error(
        "Error de conexión. Verifica tu conexión a internet y que el servidor esté disponible."
      );
    }
    // Re-lanzar otros errores
    throw error;
  }
};

