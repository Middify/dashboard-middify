import PropTypes from "prop-types";
import { getStateColor, formatPrice, formatDate } from "./helpers";

const ProductMobileCard = ({ row, isSelected, onToggleSelection, onViewDetails, showPrice, showStock }) => (
    <div 
        className={`mb-3 flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
            isSelected ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/10" : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
        }`}
        onClick={() => onViewDetails(row._id)}
    >
        <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
                <div 
                    onClick={(e) => { e.stopPropagation(); onToggleSelection(row.id); }}
                    className="mt-1 h-5 w-5 flex items-center justify-center rounded border border-slate-300 bg-white"
                >
                    {isSelected && <div className="h-2.5 w-2.5 rounded-sm bg-indigo-600" />}
                </div>
                <div className="flex flex-col min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-900">{row.name}</h3>
                    <span className="text-xs font-mono text-slate-500">SKU: {row.sku}</span>
                </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStateColor(row.state)}`}>
                {row.state}
            </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-3 text-xs">
            {showPrice && (
                <>
                    <div>
                        <p className="text-slate-400 mb-0.5">Precio Ant.</p>
                        <p className="font-mono text-slate-500">{formatPrice(row.oldPrice || row.precioAnterior)}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 mb-0.5">Precio Act.</p>
                        <p className="font-bold text-indigo-600 font-mono">
                            {formatPrice(typeof row.price === 'object' ? (row.price?.precioVta || row.price?.PrecioBol) : row.price)}
                        </p>
                    </div>
                </>
            )}
            {showStock && (
                <div>
                    <p className="text-slate-400 mb-0.5">Stock</p>
                    <p className="font-bold text-slate-700">{row.quantity || row.stockNuevo || 0}</p>
                </div>
            )}
            <div>
                <p className="text-slate-400 mb-0.5">Tenant</p>
                <p className="font-medium text-slate-700 truncate">{row.tenantName}</p>
            </div>
            <div>
                <p className="text-slate-400 mb-0.5">Ingreso</p>
                <p className="text-slate-500 font-medium">{formatDate(row.createdDate || row.ingresoMiddify)}</p>
            </div>
            <div className="col-span-2">
                <p className="text-slate-400 mb-0.5">Actualizado</p>
                <p className="text-slate-500 font-medium">{formatDate(row.updatedDate || row.actualizacion)}</p>
            </div>
            {row.message && (
                <div className="col-span-2 mt-1 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-slate-400 mb-0.5 text-[10px] uppercase">Mensaje</p>
                    <p className="text-slate-600 italic line-clamp-2 leading-relaxed">{row.message}</p>
                </div>
            )}
        </div>
    </div>
);

ProductMobileCard.propTypes = {
    row: PropTypes.object.isRequired,
    isSelected: PropTypes.bool,
    onToggleSelection: PropTypes.func,
    onViewDetails: PropTypes.func,
    showPrice: PropTypes.bool,
    showStock: PropTypes.bool,
};

export default ProductMobileCard;

