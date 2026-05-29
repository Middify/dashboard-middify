const BASE_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev";

export async function deleteUser({ token, userId }) {
  if (!token) throw new Error("Token is required");
  if (!userId) throw new Error("User ID is required");

  const response = await fetch(`${BASE_URL}/users/delete`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Error al eliminar: ${response.statusText}`,
    );
  }

  return response.json();
}
