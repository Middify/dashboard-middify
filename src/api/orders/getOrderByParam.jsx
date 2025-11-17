const API_URL =
  "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getOrderByParam";

export const getOrderByParam = async ({ token, filtro, signal } = {}) => {
  if (!token) {
    throw new Error("Token de autenticación no proporcionado.");
  }

  if (!filtro || typeof filtro !== "object") {
    throw new Error("El filtro debe ser un objeto válido.");
  }

  // Preparar el body exactamente como en Postman
  const body = JSON.stringify({
    filtro,
  });

  // Log para debuggear (puedes removerlo después)
  console.log("getOrderByParam - URL:", API_URL);
  console.log("getOrderByParam - Body:", body);
  console.log("getOrderByParam - Token presente:", !!token);
  console.log("getOrderByParam - Token (primeros 20 chars):", token ? token.substring(0, 20) + "..." : "N/A");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
      signal,
    });

    // Log de la respuesta para debuggear
    console.log("getOrderByParam - Status:", response.status);
    console.log("getOrderByParam - Status Text:", response.statusText);

    if (!response.ok) {
      // Intentar obtener el mensaje de error del body
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = await response.text();
        console.error("getOrderByParam - Error response:", errorData);
        if (errorData) {
          const parsed = JSON.parse(errorData);
          errorMessage = parsed.message || parsed.error || errorMessage;
        }
      } catch (e) {
        // Si no se puede parsear, usar el mensaje por defecto
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("getOrderByParam - Success response:", data);
    return data;
  } catch (error) {
    console.error("getOrderByParam - Error completo:", error);
    throw error;
  }
};

