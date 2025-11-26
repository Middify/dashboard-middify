import axios from "axios";

const API_URL =
    "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/getExportOrders";

export const getExportJob = async (token, jobId) => {
    try {
        const response = await axios.get(`${API_URL}?jobId=${jobId}`, {
            headers: {
                Authorization: token,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting export job:", error);
        throw error;
    }
};
