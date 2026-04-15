const BASE_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev";

export async function getUsersList({
  token,
  page = 1,
  pageSize = 20,
  tenantId = null,
}) {
  if (!token) throw new Error("Token is required");

  if (!tenantId) {
    console.warn("getUsersList: tenantId requerido");
    return { users: [], total: 0 };
  }

  const url = new URL(`${BASE_URL}/users/list`);
  url.searchParams.set("page", page);
  url.searchParams.set("pageSize", pageSize);
  url.searchParams.set("tenantId", tenantId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error: ${response.statusText}`);
  }

  return response.json();
}
