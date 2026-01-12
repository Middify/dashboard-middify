const BASE_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev";

export async function getUsersList({ token, page = 1, pageSize = 20, tenantId = null }) {
    if (!token) {
        throw new Error("Token is required");
    }

    const url = new URL(`${BASE_URL}/users/list`);
    url.searchParams.append("page", page);
    url.searchParams.append("pageSize", pageSize);
    if (tenantId) {
        url.searchParams.append("tenant", tenantId);
    }

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error fetching users: ${response.statusText}`);
    }

    return response.json();
}
