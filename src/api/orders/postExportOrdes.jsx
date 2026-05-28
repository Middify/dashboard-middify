import axios from "axios";

const API_URL =
  "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/exportOrders";

export const postExportOrders = async (token, body) => {
  try {
    console.log("Sending export request to backend:", { url: API_URL, body });
    const response = await axios.post(API_URL, body, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting export orders:", error);
    throw error;
  }
};
