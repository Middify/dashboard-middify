import PropTypes from "prop-types";
import { formatDateTime, formatText, safeArray } from "./formatters";

const getFriendlyName = (name) => {
  if (!name) return null;
  const lowerName = String(name).toLowerCase().trim();

  if (lowerName === "createinvoice") return "Factura/Boleta Electrónica";
  if (lowerName === "createsalesorder") return "Nota de Venta";

  return name;
};

const getFriendlyStatus = (status) => {
  if (!status) return null;
  const lowerStatus = String(status).toLowerCase().trim();

  if (lowerStatus === "success") return "Generado exitosamente";

  return status;
};

const extractRealDate = (dateField) => {
  if (!dateField) return null;
  if (typeof dateField === "object" && dateField.$date) return dateField.$date;
  return dateField;
};

const PanelFive = ({ data }) => {
  const rawDocuments = data?.allDocuments ? data.allDocuments : data;
  const documents = safeArray(rawDocuments);

  if (documents.length === 0) {
    return <p className="text-sm text-slate-600">Sin datos</p>;
  }

  return (
    <div className="space-y-4">
      {documents.map((doc, index) => {
        const friendlyName =
          getFriendlyName(doc?.name) || doc?.folio || "Documento Tributario";
        const friendlyStatus = getFriendlyStatus(doc?.status) || "Generado";
        const creationDate = extractRealDate(doc?.creation || doc?.createdAt);
        const updateDate = extractRealDate(doc?.lastUpdate || doc?.createdAt);

        return (
          <div
            key={`${doc?.name ?? doc?.folio ?? "document"}-${index}`}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {formatText(friendlyName)}
                </p>
                <p className="text-xs text-slate-500">
                  Tipo:{" "}
                  <span className="capitalize">{formatText(doc?.type)}</span> •
                  Estado: {formatText(friendlyStatus)}
                </p>
              </div>
              {doc?.url ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-indigo-600 hover:underline"
                >
                  Ver documento
                </a>
              ) : null}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Creación
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {formatDateTime(creationDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Última actualización
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {formatDateTime(updateDate)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

PanelFive.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

PanelFive.defaultProps = {
  data: [],
};

export default PanelFive;
