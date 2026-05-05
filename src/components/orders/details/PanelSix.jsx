import PropTypes from "prop-types";
import { safeArray, formatText } from "./formatters";

const STAGES_DICTIONARY = {
  getOrderDetail: "Recepción de la Orden",
  createSalesOrder: "Registro en Sistema (ERP)",
  createInvoice: "Generación de Boleta/Factura",
  uploadDte: "Carga de Documento (DTE)",
  sendMailCreateInvoice: "Envío de Correo al Cliente",
  createDelivery: "Preparación de Envío",
  getLabel: "Etiqueta de Envío Creada",
};
const PanelSix = ({ data }) => {
  const stages = safeArray(data?.stages);

  if (stages.length === 0) {
    return <p className="text-sm text-slate-600">Sin datos</p>;
  }

  return (
    <ol className="relative border-l border-slate-200 pl-4">
      {stages.map((stage, index) => {
        const isCompleted = Boolean(stage?.isCompleted);
        const rawName = stage?.name || "";
        const displayName =
          STAGES_DICTIONARY[rawName] ||
          formatText(rawName) ||
          "Etapa desconocida";
        return (
          <li key={`${stage?.name ?? "stage"}-${index}`} className="mb-6 ml-2">
            <span
              className={`absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full border ${
                isCompleted
                  ? "border-emerald-200 bg-emerald-500"
                  : "border-amber-200 bg-amber-500"
              }`}
            >
              <span className="sr-only">
                {isCompleted ? "Completado" : "Pendiente"}
              </span>
            </span>
            <p className="text-sm font-medium text-slate-800">{displayName}</p>
            <p
              className={`text-xs font-semibold uppercase ${
                isCompleted ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {isCompleted ? "Completado" : "Pendiente"}
            </p>
          </li>
        );
      })}
    </ol>
  );
};

PanelSix.propTypes = {
  data: PropTypes.shape({
    stages: PropTypes.array,
  }),
};

PanelSix.defaultProps = {
  data: null,
};

export default PanelSix;
