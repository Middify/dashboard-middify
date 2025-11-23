// api/getOrderByParam.js
const API_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getOrderByParam";

export async function fetchOrdersByParam({ token, filtro = {}, signal } = {}) {
  if (!token) throw new Error("Falta token");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ filtro }),
    signal
  });

  const payload = await response.json();
  return payload;
}