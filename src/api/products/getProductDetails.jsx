const API_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getProductsDetails";

export const getProductDetails = async (token, productId) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ id: productId })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener detalles');
  }

  return { ...data, _id: productId };
};
