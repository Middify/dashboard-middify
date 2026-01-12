import PropTypes from "prop-types";
import { formatDateTime } from "./helpers";

const OrderMobileCard = ({ row, isSelected, onToggleSelection, onViewDetails }) => (
  <div
    className={`mb-3 flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
      isSelected
        ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/10"
        : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
    }`}
    onClick={() => onViewDetails && onViewDetails(row.rawOrder)}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3 flex-1">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection(row.id);
          }}
          className="mt-1 h-5 w-5 flex items-center justify-center rounded border border-slate-300 bg-white"
        >
          {isSelected && (
            <div className="h-2.5 w-2.5 rounded-sm bg-indigo-600" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            #{row.internalId}
          </h3>
          <span className="text-xs font-mono text-slate-500">
            {formatDateTime(row.creation)}
          </span>
        </div>
      </div>
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
        {row.status}
      </span>
    </div>

    <div className="flex justify-between items-end border-t border-slate-100 pt-3">
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
          Cliente
        </p>
        <p className="text-xs font-medium text-slate-700 truncate max-w-[150px]">
          {row.customerName || "—"}
        </p>
      </div>
      <div className="text-right">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
          Total
        </p>
        <p className="text-sm font-bold text-indigo-600 font-mono">
          {row.total}
        </p>
      </div>
    </div>
  </div>
);

OrderMobileCard.propTypes = {
  row: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  onToggleSelection: PropTypes.func,
  onViewDetails: PropTypes.func,
};

export default OrderMobileCard;

