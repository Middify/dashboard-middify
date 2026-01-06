import PropTypes from "prop-types";
import { useState, useCallback, lazy, Suspense } from "react";
import { patchExportProducts } from "../../api/products/patchStateProduct";
import { alertsProducts } from "../../utils/alertsProducts";
import SearchBar from "../common/SearchBar";

const ImportProductsModal = lazy(() => import("./ImportProductsModal"));
const SyncSkuModal = lazy(() => import("./SyncSkuModal"));

const PRODUCT_STATES = [
    { value: "creada", label: "Creada" },
    { value: "error", label: "Error" },
    { value: "procesada", label: "Procesada" },
];

const ProductsTableHeader = ({
    title = "Productos",
    subtitle,
    infoChips = [],
    onExportData,
    isExportingData = false,
    exportDisabled = false,
    selectedCount = 0,
    getSelectedProductIds,
    token,
    user,
    onDeleteSuccess,
    tenantId,
    tenantName,
    searchTerm,
    onSearchChange,
}) => {
    const [loading, setLoading] = useState(null); // 'update' | 'delete' | null
    const [modal, setModal] = useState(null); // 'update' | 'delete' | 'import' | 'sync'
    const [selectedState, setSelectedState] = useState("");

    const handleAction = async (state, type) => {
        try {
            const ids = getSelectedProductIds();
            if (!ids?.length) return;
            setLoading(type);
            const email = user?.email || user?.mail || user?.username || "usuario";
            const name = user?.name || user?.username || email;
            await patchExportProducts({ token, ids, state, user: name, mailUser: email });
            setModal(null);
            onDeleteSuccess?.();
            type === 'delete' ? alertsProducts.deleteSuccess(ids.length) : alertsProducts.updateSuccess(ids.length);
        } catch (e) {
            alertsProducts.updateError(e.message);
        } finally {
            setLoading(null);
            setSelectedState("");
        }
    };

    const Modal = ({ type, title, children, confirmText, color, onConfirm }) => (
        modal === type && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <div className="mt-4">{children}</div>
                    <div className="mt-6 flex gap-3">
                        <button onClick={() => setModal(null)} className="flex-1 rounded-2xl py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
                        <button onClick={onConfirm} disabled={!!loading} className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50 ${color}`}>
                            {loading === type && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        )
    );

    return (
        <div className="flex flex-col gap-4">
            <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h1>
                            {selectedCount > 0 && <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">{selectedCount} Seleccionados</span>}
                        </div>
                        {subtitle && <p className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {selectedCount > 0 && (
                            <>
                                <button onClick={() => setModal('update')} className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95">Cambiar Estado</button>
                                <button onClick={() => setModal('delete')} className="px-4 py-2 rounded-2xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95">Eliminar</button>
                            </>
                        )}
                        <button onClick={() => setModal('import')} className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-600 text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95">Importar</button>
                        <button onClick={() => setModal('sync')} className="px-4 py-2 rounded-2xl bg-amber-50 text-amber-600 text-sm font-bold hover:bg-amber-600 hover:text-white transition-all shadow-sm active:scale-95">Sincronizar SKU</button>
                        <button onClick={onExportData} disabled={exportDisabled || isExportingData} className="px-4 py-2 rounded-2xl bg-slate-800 text-white text-sm font-bold hover:bg-black transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2">
                            {isExportingData && <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                            {isExportingData ? 'Exportando...' : 'Exportar'}
                        </button>
                    </div>
                </div>

                {infoChips.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                        {infoChips.map(c => (
                            <div key={c.id} className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.label}</span>
                                <span className="text-xs font-black text-slate-700">{c.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </header>

            <SearchBar value={searchTerm} onChange={onSearchChange} placeholder="Buscar por SKU, nombre, tienda o bodega..." />

            <Modal type="update" title="Cambiar Estado" confirmText="Actualizar" color="bg-indigo-600" onConfirm={() => handleAction(selectedState, 'update')}>
                <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer">
                    <option value="">Seleccionar nuevo estado...</option>
                    {PRODUCT_STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </Modal>

            <Modal type="delete" title="¿Eliminar productos?" confirmText="Eliminar" color="bg-red-600" onConfirm={() => handleAction("discarded", 'delete')}>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">¿Estás seguro de eliminar los productos seleccionados? Se moverán a la papelera como <span className="text-red-600 font-bold italic underline decoration-red-200 underline-offset-2">discarded</span>.</p>
            </Modal>

            <Suspense fallback={null}>
                {modal === 'import' && (
                    <ImportProductsModal
                        open={true}
                        onClose={() => setModal(null)}
                        token={token}
                        tenantId={tenantId}
                        tenantName={tenantName}
                        onImportSuccess={() => { setModal(null); onDeleteSuccess?.(); }}
                    />
                )}
                {modal === 'sync' && (
                    <SyncSkuModal
                        open={true}
                        onClose={() => setModal(null)}
                        token={token}
                        tenantId={tenantId}
                        tenantName={tenantName}
                        onSyncSuccess={() => { setModal(null); onDeleteSuccess?.(); }}
                    />
                )}
            </Suspense>
        </div>
    );
};

ProductsTableHeader.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    infoChips: PropTypes.array,
    onExportData: PropTypes.func,
    isExportingData: PropTypes.bool,
    exportDisabled: PropTypes.bool,
    selectedCount: PropTypes.number,
    getSelectedProductIds: PropTypes.func,
    token: PropTypes.string,
    user: PropTypes.object,
    onDeleteSuccess: PropTypes.func,
    tenantId: PropTypes.string,
    tenantName: PropTypes.string,
    searchTerm: PropTypes.string,
    onSearchChange: PropTypes.func,
};

export default ProductsTableHeader;
