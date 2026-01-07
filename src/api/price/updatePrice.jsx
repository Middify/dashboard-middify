const API_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/updatePrice";

export async function updatePrice({ token, sku, price }) {
    if (!token) throw new Error("Token is required");
    if (!sku) throw new Error("SKU is required");
    if (price === undefined) throw new Error("Price is required");

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            sku,
            price: Number(price),
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error updating price: ${response.statusText}`);
    }

    return response.json();
}

