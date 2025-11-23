import React from "react";
import CloseIcon from "@mui/icons-material/Close";

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isLoading = false,
    isDestructive = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 p-4 backdrop-blur-sm transition-all">
            <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-500"
                    >
                        <CloseIcon fontSize="small" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    <p className="text-sm text-slate-600">{message}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isDestructive
                                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                                : "bg-catalina-blue-600 hover:bg-catalina-blue-700 focus:ring-catalina-blue-500"
                            }`}
                    >
                        {isLoading ? "Procesando..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
