import { useState, useRef, useCallback, useEffect } from "react";
import { postExportProducts } from "../../api/products/postExportProducts";
import { getProductExportJob } from "../../api/products/getProductExportJob";

const POLLING_INTERVAL = 2000;

export const useExportProducts = ({ token, onSuccess, onError }) => {
  const [isExporting, setIsExporting] = useState(false);
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
        const data = await getProductExportJob(token, jobId);

        if (!data || !data.ok || !data.job) {
          throw new Error("Respuesta inválida del servidor");
        }

        const { status, downloadUrl } = data.job;

        if (status === "completed") {
          setIsExporting(false);
          if (downloadUrl) {
            window.open(downloadUrl, "_blank");
          }
          if (onSuccess) onSuccess();
          return;
        }

        if (status === "failed") {
          setIsExporting(false);
          if (onError)
            onError(new Error(data.job.message || "La exportación falló"));
          return;
        }

        pollingRef.current = setTimeout(
          () => pollStatus(jobId),
          POLLING_INTERVAL,
        );
      } catch (err) {
        console.error("Error en polling:", err);
        setIsExporting(false);
        if (onError) onError(err);
      }
    },
    [token, onSuccess, onError],
  );

  const startExport = useCallback(
    async (filters) => {
      setIsExporting(true);
      try {
        const response = await postExportProducts(token, filters);
        if (response && response.ok && response.jobId) {
          setIsExporting(false);
          pollStatus(response.jobId);
        } else {
          throw new Error("No se pudo iniciar la exportación");
        }
      } catch (err) {
        console.error("Error iniciando exportación:", err);
        setIsExporting(false);
        if (onError) onError(err);
      }
    },
    [token, pollStatus, onError],
  );

  useEffect(() => stopPolling, [stopPolling]);

  return { isExporting, startExport, stopPolling };
};
