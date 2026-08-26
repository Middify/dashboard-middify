// src/api/orders/patchOrderDetails.js

const API_URL =
  "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/patchOrderDetails";

export const patchOrderDetails = async ({ token, orderId, changes, user }) => {
  if (!token) throw new Error("Falta el token de autenticación");
  if (!orderId) throw new Error("Falta el ID de la orden");

  const response = await fetch(API_URL, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      orderId,
      changes,
      user,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Error al actualizar los detalles de la orden",
    );
  }

  return await response.json();
};
