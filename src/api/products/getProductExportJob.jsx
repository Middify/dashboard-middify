import axios from "axios";

const API_URL =
  "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/exportProducts";

export const getProductExportJob = async (token, jobId) => {
  try {
    const response = await axios.get(
      `${API_URL}/${jobId}?t=${new Date().getTime()}`,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error consultando estado de exportación de productos:",
      error,
    );
    throw error;
  }
};
