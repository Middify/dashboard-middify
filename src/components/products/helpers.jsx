import { Visibility } from "@mui/icons-material";

export const getStateColor = (s) => {
    const states = {
        success: "bg-green-100 text-green-700",
        procesada: "bg-green-100 text-green-700",
        failed: "bg-red-100 text-red-700",
        error: "bg-red-100 text-red-700",
        created: "bg-blue-100 text-blue-700",
        creada: "bg-blue-100 text-blue-700",
        discard: "bg-slate-100 text-slate-600",
        discarded: "bg-slate-100 text-slate-600"
    };
    return states[s?.toLowerCase()] || "bg-slate-100 text-slate-600";
};

export const formatPrice = (p) => p ? `$${Number(p).toLocaleString('es-ES')}` : '-';

export const formatDate = (date) => {
    if (!date) return '-';
    const rawDate = date?.$date || date;
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const getProductColumns = ({ onViewDetails, showPrice, showStock }) => {
    const cols = [
        { field: "sku", headerName: "SKU", width: 140, renderCell: (p) => <span className="text-xs font-mono text-slate-600">{p.value}</span> },
        { field: "name", headerName: "Producto", flex: 1, renderCell: (p) => <span className="font-semibold text-slate-800">{p.value}</span> },
        { field: "tenantName", headerName: "Tenant", width: 120 },
    ];

    if (showPrice) {
        cols.push(
            { field: "oldPrice", headerName: "Precio Ant.", width: 120, renderCell: (p) => <span className="font-mono text-slate-400">{formatPrice(p.row.oldPrice || p.row.precioAnterior)}</span> },
            { field: "price", headerName: "Precio Act.", width: 120, renderCell: (p) => (
                <span className="text-indigo-600 font-bold font-mono">
                    {formatPrice(typeof p.value === 'object' ? (p.value?.precioVta || p.value?.PrecioBol) : p.value)}
                </span>
            )}
        );
    }

    if (showStock) {
        cols.push(
            { field: "quantity", headerName: "Stock", width: 100, align: "center", headerAlign: "center", renderCell: (p) => (
                <span className="font-bold text-slate-700">{p.value || p.row.stockNuevo || 0}</span>
            )}
        );
    }

    cols.push(
        { field: "createdDate", headerName: "Fecha Ingreso", width: 140, renderCell: (p) => (
            <span className="text-xs text-slate-600 font-medium">{formatDate(p.value || p.row.ingresoMiddify)}</span>
        )},
        { field: "updatedDate", headerName: "Actualizado", width: 140, renderCell: (p) => (
            <span className="text-xs text-slate-600 font-medium">{formatDate(p.value || p.row.actualizacion)}</span>
        )},
        { field: "message", headerName: "Mensaje", flex: 1.5, minWidth: 200, renderCell: (p) => (
            <span className="text-xs text-slate-500 italic truncate" title={p.value}>{p.value || "—"}</span>
        )},
        { field: "state", headerName: "Estado", width: 110, align: "center", headerAlign: "center", renderCell: (p) => (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStateColor(p.value)}`}>
                {p.value}
            </span>
        )},
        {
            field: "actions", headerName: "", width: 50, sortable: false, align: "center",
            renderCell: (p) => (
                <button onClick={() => onViewDetails(p.row._id)} className="text-slate-400 hover:text-indigo-600 p-1 hover:bg-indigo-50 rounded-lg">
                    <Visibility fontSize="small" />
                </button>
            )
        }
    );

    return cols;
};
