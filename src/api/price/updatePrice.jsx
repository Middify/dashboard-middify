const API_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/updatePrice";

export async function updatePrice({ token, sku, price, quantity }) {
    if (!token) throw new Error("Token is required");
    if (!sku) throw new Error("SKU is required");

    const body = { sku };
    if (price !== undefined && price !== "") body.price = Number(price);
    if (quantity !== undefined && quantity !== "") body.quantity = Number(quantity);

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error updating: ${response.statusText}`);
    }

    return response.json();
}
