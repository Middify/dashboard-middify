import { useState, useRef, useCallback, useEffect } from "react";
import { postExportOrders } from "../../api/orders/postExportOrdes";
import { getExportJob } from "../../api/orders/getExportJob";

const POLLING_INTERVAL = 2000; // 2 seconds

export const useExportOrders = ({ token, onSuccess }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState(null);
    const pollingRef = useRef(null);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearTimeout(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    const pollStatus = useCallback(
        async (jobId) => {
            try {
                const data = await getExportJob(token, jobId);

                if (!data || !data.ok || !data.job) {
                    throw new Error("Invalid response from getExportJob");
                }

                const { status, downloadUrl } = data.job;

                if (status === "completed" && downloadUrl) {
                    setIsExporting(false);
                    // Trigger download
                    window.open(downloadUrl, "_blank");
                    if (onSuccess) onSuccess();
                    return;
                }

                if (status === "failed") {
                    setIsExporting(false);
                    setError(new Error(data.job.message || "Export failed"));
                    return;
                }

                // Continue polling
                pollingRef.current = setTimeout(() => pollStatus(jobId), POLLING_INTERVAL);
            } catch (err) {
                console.error("Polling error:", err);
                setIsExporting(false);
                setError(err);
            }
        },
        [token, onSuccess]
    );

    const startExport = useCallback(
        async (filters) => {
            setIsExporting(true);
            setError(null);
            try {
                const response = await postExportOrders(token, filters);
                if (response && response.ok && response.jobId) {
                    pollStatus(response.jobId);
                } else {
                    throw new Error("Failed to start export job");
                }
            } catch (err) {
                console.error("Start export error:", err);
                setIsExporting(false);
                setError(err);
            }
        },
        [token, pollStatus]
    );

    // Cleanup on unmount
    useEffect(() => stopPolling, [stopPolling]);

    return {
        isExporting,
        error,
        startExport,
        stopPolling,
    };
};
