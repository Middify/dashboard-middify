const BASE_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev";

/**
 * Updates the tenants assigned to a user.
 *
 * @param {Object} params
 * @param {string} params.token - The authentication token.
 * @param {string} params.userId - The ID of the user to update.
 * @param {Array} [params.tenantsToAssign] - List of tenants to assign.
 * @param {Array} [params.tenantsToRemove] - List of tenants to remove.
 * @returns {Promise<Object>} The response data.
 */
export async function updateUserTenants({ token, userId, tenantsToAssign, tenantsToRemove }) {
    if (!token) throw new Error("Token is required");
    if (!userId) throw new Error("UserId is required");

    const body = { userId };
    if (Array.isArray(tenantsToAssign)) body.tenantsToAssign = tenantsToAssign;
    if (Array.isArray(tenantsToRemove)) body.tenantsToRemove = tenantsToRemove;

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
        throw new Error(errorData.message || `Error updating user tenants: ${response.statusText}`);
    }

    return response.json();
}
