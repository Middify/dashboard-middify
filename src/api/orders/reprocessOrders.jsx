const API_URL =
  "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/reprocessOrders";

export const reprocessOrders = async ({ token, orderIds }) => {
  if (!token) throw new Error("Falta el token de autenticación");
  if (!orderIds || orderIds.length === 0)
    throw new Error("No hay órdenes seleccionadas");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderIds }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al reprocesar las órdenes");
  }

  return await response.json();
};
