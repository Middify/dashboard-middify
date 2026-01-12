const BASE_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev";

export async function updateUser({ token, userId, role, tenantsToAssign, tenantsToRemove, tenants, mode }) {
    if (!token) throw new Error("Token is required");
    if (!userId) throw new Error("UserId is required");

    const body = { userId };
    
    if (role) body.role = role;
    if (mode) body.mode = mode;
    if (tenants) body.tenants = tenants;
    if (tenantsToAssign) body.tenantsToAssign = tenantsToAssign;
    if (tenantsToRemove) body.tenantsToRemove = tenantsToRemove;

    const response = await fetch(`${BASE_URL}/users/tenants`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error updating user: ${response.statusText}`);
    }

    return response.json();
}

