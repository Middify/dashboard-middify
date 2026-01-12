import PropTypes from "prop-types";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

const RecycleBinHeader = ({
    activeTab,
    onTabChange,
    tabs = [],
    selectedCount = 0,
    isProcessing = false,
    actions = {}
}) => {
    const Spinner = () => (
        <svg className="animate-spin h-3.5 w-3.5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    const STATE_OPTIONS = activeTab === 'orders'
        ? [{ value: "deleted", label: "Restaurar" }] 
        : [
            { value: "creada", label: "Creada" },
            { value: "error", label: "Error" },
            { value: "procesada", label: "Procesada" }
        ];

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-red-100 p-2">
                    <DeleteOutlineIcon className="text-red-600 text-[28px]" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-slate-800">Papelera de Reciclaje</h1>
                    <p className="text-xs text-slate-500">Elementos eliminados que pueden ser restaurados</p>
                </div>
            </div>

            <div className="border-b border-slate-200">
                <div className="flex gap-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`relative flex min-h-[40px] items-center gap-2 pb-2 text-sm font-semibold transition-colors ${
                                activeTab === tab.id ? "text-red-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-red-600" : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {tab.label}
                            {tab.count > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">{tab.count}</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-4 flex flex-col border-slate-200 pt-4 lg:flex-row lg:items-center lg:justify-between h-10">
                <div className="flex items-center gap-2">
                    {selectedCount > 0 && (
                        <div className="flex items-center gap-1.5 rounded-lg bg-indigo-100 px-2.5 py-1">
                            <span className="text-[10px] uppercase text-indigo-400">Seleccionados</span>
                            <span className="text-xs font-semibold text-indigo-700">{selectedCount}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {selectedCount > 0 && actions.onStateChange && (
                        <div className="relative">
                            <select
                                className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-10 text-xs text-slate-700 shadow-sm focus:border-indigo-500 outline-none"
                                onChange={(e) => actions.onStateChange(e.target.value)}
                                value=""
                                disabled={isProcessing}
                            >
                                <option value="">Cambiar estado...</option>
                                {STATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            {isProcessing && <span className="absolute right-3 top-2"><Spinner /></span>}
                        </div>
                    )}
                    
                    {actions.onExportSelection && selectedCount > 0 && (
                        <button
                            onClick={actions.onExportSelection}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-indigo-500"
                        >
                            {isProcessing ? <Spinner /> : <FileDownloadOutlinedIcon className="text-[16px]" />}
                            Exportar Selección
                        </button>
                    )}

                    {actions.onExportAll && (
                        <button
                            onClick={actions.onExportAll}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-indigo-500"
                        >
                             {isProcessing ? <Spinner /> : <FileDownloadOutlinedIcon className="text-[16px]" />}
                            Exportar Todo
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

RecycleBinHeader.propTypes = {
    activeTab: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired,
    tabs: PropTypes.array,
    selectedCount: PropTypes.number,
    isProcessing: PropTypes.bool,
    actions: PropTypes.object
};

export default RecycleBinHeader;
