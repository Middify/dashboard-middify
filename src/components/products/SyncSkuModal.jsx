import PropTypes from "prop-types";
import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Tabs,
    Tab,
    TextField,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SyncIcon from "@mui/icons-material/Sync";
import EditIcon from "@mui/icons-material/Edit";

const SyncSkuModal = ({ open, onClose, token, tenantId, tenantName, onSyncSuccess }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [manualSkus, setManualSkus] = useState("");

    const handleClose = () => {
        setSelectedFile(null);
        setManualSkus("");
        setActiveTab(0);
        onClose();
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const handleSync = () => {
        // Solo diseño, sin lógica
        console.log("Sincronizar SKUs");
    };

    const parseManualSkus = () => {
        if (!manualSkus.trim()) {
            return [];
        }
        // Solo para preview visual, sin validación real
        const skus = manualSkus
            .split(/[\n,;]+/)
            .map((sku) => sku.trim())
            .filter((sku) => sku.length > 0);
        return skus;
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "12px",
                },
            }}
        >
            <DialogTitle className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                    <SyncIcon className="text-indigo-600 text-[24px]" />
                    <span className="text-lg font-semibold text-slate-800">
                        Sincronizar SKU
                    </span>
                </div>
                <button
                    onClick={handleClose}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                    <CloseIcon fontSize="small" />
                </button>
            </DialogTitle>

            <DialogContent className="pt-0">
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    className="border-b border-slate-200 mb-3 [&_.MuiTab-root]:normal-case [&_.MuiTab-root]:font-semibold [&_.MuiTab-root]:min-h-[48px]"
                >
                    <Tab
                        icon={<CloudUploadIcon className="text-[18px]" />}
                        iconPosition="start"
                        label="Importar desde archivo"
                    />
                    <Tab
                        icon={<EditIcon className="text-[18px]" />}
                        iconPosition="start"
                        label="Escribir manualmente"
                    />
                </Tabs>

                <div className="space-y-4">
                    {activeTab === 0 ? (
                        <>
                            {/* Información */}
                            <div className="rounded-lg bg-blue-50 p-3">
                                <p className="text-sm text-blue-700">
                                    <strong>Formatos aceptados:</strong> Excel (.xlsx, .xls), CSV (.csv) o JSON (.json)
                                </p>
                                <p className="mt-1 text-xs text-blue-600">
                                    El archivo debe contener una lista de SKUs a sincronizar.
                                </p>
                            </div>

                            {/* Área de carga de archivo */}
                            <div
                                className={`relative rounded-xl border-2 border-dashed p-8 text-center transition ${
                                    isDragging
                                        ? "border-indigo-500 bg-indigo-50"
                                        : "border-slate-300 bg-slate-50 hover:border-slate-400"
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {!selectedFile ? (
                                    <>
                                        <CloudUploadIcon
                                            className="mx-auto mb-3 text-slate-400 text-[48px]"
                                        />
                                        <p className="mb-2 text-sm font-medium text-slate-700">
                                            Arrastra y suelta tu archivo aquí
                                        </p>
                                        <p className="mb-4 text-xs text-slate-500">
                                            o haz clic en el botón de abajo
                                        </p>
                                        <label
                                            htmlFor="sync-file-upload"
                                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <CloudUploadIcon className="text-[18px]" />
                                            Seleccionar archivo
                                        </label>
                                        <input
                                            id="sync-file-upload"
                                            type="file"
                                            accept=".xlsx,.xls,.csv,.json"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-indigo-100 p-2">
                                                <DescriptionIcon className="text-indigo-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-slate-700">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemoveFile}
                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
                                        >
                                            <CloseIcon fontSize="small" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Instrucciones adicionales */}
                            {!selectedFile && (
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                    <p className="mb-2 text-xs font-semibold text-slate-700">
                                        Columnas esperadas en Excel/CSV:
                                    </p>
                                    <ul className="space-y-1 text-xs text-slate-600">
                                        <li className="flex gap-2">
                                            <span>•</span>
                                            <span>
                                                <strong>SKU</strong> o <strong>SKUSIMPLE</strong>: Código
                                                del producto a sincronizar (requerido)
                                            </span>
                                        </li>
                                    </ul>
                                    <p className="mt-2 text-xs text-slate-500">
                                        💡 La primera fila debe contener los encabezados. Solo se requiere
                                        la columna SKU.
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Tab de escribir manualmente */}
                            <div className="rounded-lg bg-blue-50 p-3">
                                <p className="text-sm text-blue-700">
                                    <strong>Instrucciones:</strong> Escribe los SKUs uno por línea, o separados por comas o punto y coma.
                                </p>
                                <p className="mt-1 text-xs text-blue-600">
                                    Cada SKU será procesado individualmente.
                                </p>
                            </div>

                            <TextField
                                fullWidth
                                multiline
                                rows={8}
                                value={manualSkus}
                                onChange={(e) => setManualSkus(e.target.value)}
                                placeholder="Ejemplo:&#10;SKU-001&#10;SKU-002&#10;SKU-003&#10;&#10;O separados por comas:&#10;SKU-001, SKU-002, SKU-003"
                                variant="outlined"
                                className="[&_.M uiOutlinedInput-root]:rounded-lg"
                            />

                            {/* Preview de SKUs ingresados */}
                            {parseManualSkus().length > 0 && (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                    <div className="mb-2 flex items-center gap-2">
                                        <CheckCircleIcon className="text-green-600 text-[20px]" />
                                        <p className="text-xs font-semibold text-green-700">
                                            {parseManualSkus().length} SKU(s) detectado(s)
                                        </p>
                                    </div>
                                    <div className="max-h-32 overflow-y-auto rounded border border-green-200 bg-white p-2">
                                        <div className="space-y-1">
                                            {parseManualSkus().slice(0, 10).map((sku, index) => (
                                                <div key={index} className="text-xs text-slate-600">
                                                    • {sku}
                                                </div>
                                            ))}
                                        </div>
                                        {parseManualSkus().length > 10 && (
                                            <p className="mt-2 text-center text-xs text-slate-500">
                                                + {parseManualSkus().length - 10} SKU(s) más...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>

            <DialogActions className="border-t border-slate-200 px-6 py-4">
                <Button
                    onClick={handleClose}
                    color="inherit"
                    className="normal-case font-semibold"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSync}
                    variant="contained"
                    color="primary"
                    className="normal-case font-semibold rounded-lg"
                >
                    Sincronizar SKUs
                </Button>
            </DialogActions>
        </Dialog>
    );
};

SyncSkuModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    token: PropTypes.string,
    tenantId: PropTypes.string,
    tenantName: PropTypes.string,
    onSyncSuccess: PropTypes.func,
};

SyncSkuModal.defaultProps = {
    token: null,
    tenantId: null,
    tenantName: null,
    onSyncSuccess: null,
};

export default SyncSkuModal;
