// api/postParamTable.js
const API_URL =
  "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/postParamTable";

export async function saveDashboardColumns({ token, tenantName, params, signal }) {
  if (!token) throw new Error("Falta token");
  if (!tenantName) throw new Error("Falta tenantName");
  if (!Array.isArray(params) || params.length === 0)
    throw new Error("params debe ser un array");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name: tenantName, params }),
    signal
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || "Error al guardar columnas");
  }

  return payload;
}