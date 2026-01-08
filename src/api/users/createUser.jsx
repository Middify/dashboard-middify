const API_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/users/create";

export const createUser = async ({ token, email, fullName, tenantId, role }) => {
  if (!token) {
    throw new Error("Token de autenticación no proporcionado.");
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        fullName,
        tenantId,
        role,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error(
        "Error de conexión. Verifica tu conexión a internet y que el servidor esté disponible."
      );
    }
    throw error;
  }
};


