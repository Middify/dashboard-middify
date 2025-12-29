import PropTypes from "prop-types";
import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CancelIcon from "@mui/icons-material/Cancel";
import InventoryIcon from "@mui/icons-material/Inventory";
import { postImportProducts } from "../../api/products/importProducts";
import { alertsProducts } from "../../utils/alertsProducts";

const ACCEPTED_FORMATS = [".xlsx", ".xls", ".csv", ".json"];

// Funciones de normalización
const getFileExtension = (fileName) => fileName.split(".").pop().toLowerCase();

const normalizeColumn = (row, variants) => {
    for (const variant of variants) {
        const value = row[variant] || row[variant.toUpperCase()] || row[variant.toLowerCase()];
        if (value !== undefined && value !== null && value !== "") return value;
    }
    return "";
};

const mapProductRow = (row, index = null) => {
    const sku = normalizeColumn(row, ["SKUSIMPLE", "SKU SIMPLE", "SKU", "sku", "Sku"]);
    if (!sku) {
        throw new Error(index !== null ? `Fila ${index + 2}: SKU es requerido` : "SKU es requerido");
    }

    const tipoOperacion = normalizeColumn(row, [
        "TIPO_OPERACION",
        "Tipo Operacion",
        "TIPO OPERACION",
        "tipo_operacion",
    ]);

    if (!tipoOperacion) {
        throw new Error(
            index !== null
                ? `Fila ${index + 2}: TIPO_OPERACION es requerido (AGREGAR_STOCK, DESCONTAR_STOCK, CARGA_COMPLETA)`
                : "TIPO_OPERACION es requerido"
        );
    }

    return {
        SKUSIMPLE: sku,
        STOCK: parseInt(normalizeColumn(row, ["STOCK", "Stock", "stock", "Cantidad", "cantidad"]) || 0),
        TIPO_OPERACION: tipoOperacion,
        MARCA: normalizeColumn(row, [
            "MARCA",
            "Marca",
            "marca",
            "BODEGA",
            "Bodega",
            "bodega",
            "WAREHOUSE",
            "Warehouse",
            "warehouse",
        ]),
    };
};

const parseJsonFile = async (file) => {
    const text = await file.text();
    const json = JSON.parse(text);
    const products = Array.isArray(json) ? json : [json];
    return products.map((p) => mapProductRow(p));
};

const parseExcelFile = async (file) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

    if (!jsonData || jsonData.length === 0) {
        throw new Error("El archivo está vacío o no tiene datos válidos.");
    }

    return jsonData.map((row, index) => mapProductRow(row, index));
};

const parseFile = async (file) => {
    const extension = getFileExtension(file.name);
    if (extension === "json") return await parseJsonFile(file);
    if (["xlsx", "xls", "csv"].includes(extension)) return await parseExcelFile(file);
    throw new Error(`Formato no soportado. Usa ${ACCEPTED_FORMATS.join(", ")}`);
};

// Componentes reutilizables
const AlertMessage = ({ type, icon: Icon, title, message, children }) => {
    const styles = {
        error: "border-red-200 bg-red-50 text-red-600",
        success: "border-green-200 bg-green-50 text-green-600",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-600",
        info: "border-blue-200 bg-blue-50 text-blue-600",
    };

    return (
        <div className={`rounded-lg border p-3 ${styles[type]}`}>
            <div className="flex items-start gap-2">
                {Icon && <Icon className={`text-[20px] ${styles[type].split(" ")[2]}`} />}
                <div className="flex-1">
                    {title && <p className="text-xs font-semibold">{title}</p>}
                    {message && <p className="text-xs">{message}</p>}
                    {children}
                </div>
            </div>
        </div>
    );
};

AlertMessage.propTypes = {
    type: PropTypes.oneOf(["error", "success", "warning", "info"]).isRequired,
    icon: PropTypes.elementType,
    title: PropTypes.string,
    message: PropTypes.string,
    children: PropTypes.node,
};

const FilePreview = ({ data, columns, maxRows = 5 }) => (
    <div className="max-h-32 overflow-y-auto rounded border border-green-200 bg-white p-2">
        <table className="w-full text-xs">
            <thead className="border-b border-slate-200">
                <tr>
                    {columns.map((col) => (
                        <th key={col.key} className="px-2 py-1 text-left text-slate-700">
                            {col.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.slice(0, maxRows).map((row, index) => (
                    <tr key={index} className="border-b border-slate-100">
                        {columns.map((col) => (
                            <td key={col.key} className="px-2 py-1 text-slate-600">
                                {row[col.key]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
        {data.length > maxRows && (
            <p className="mt-2 text-center text-xs text-slate-500">
                + {data.length - maxRows} producto(s) más...
            </p>
        )}
    </div>
);

FilePreview.propTypes = {
    data: PropTypes.array.isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    maxRows: PropTypes.number,
};

const ImportProductsModal = ({
    open,
    onClose,
    token = null,
    tenantId = null,
    tenantName = null,
    onImportSuccess = null,
}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [parsedData, setParsedData] = useState(null);
    const [parseError, setParseError] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const resetState = useCallback(() => {
        setSelectedFile(null);
        setParsedData(null);
        setParseError(null);
        setImportResult(null);
    }, []);

    const handleFileProcess = useCallback(async (file) => {
        setParseError(null);
        setParsedData(null);
        try {
            const data = await parseFile(file);
            setParsedData(data);
        } catch (error) {
            console.error("Error al parsear archivo:", error);
            setParseError(error.message);
            alertsProducts.parseError(error.message);
        }
    }, []);

    const handleFileSelect = useCallback(
        (event) => {
            const file = event.target.files?.[0];
            if (file) {
                setSelectedFile(file);
                handleFileProcess(file);
            }
        },
        [handleFileProcess]
    );

    const handleDrop = useCallback(
        (event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) {
                setSelectedFile(file);
                handleFileProcess(file);
            }
        },
        [handleFileProcess]
    );

    const handleClose = useCallback(() => {
        resetState();
        onClose();
    }, [resetState, onClose]);

    const handleImport = useCallback(async () => {
        if (!parsedData?.length) {
            alertsProducts.noDataToImport();
            return;
        }
        if (!token) {
            alertsProducts.noToken();
            return;
        }
        if (!tenantId || !tenantName) {
            alertsProducts.noTenant();
            return;
        }

        setIsImporting(true);
        setImportResult(null);

        try {
            const response = await postImportProducts({
                token,
                tenantId,
                tenantName,
                products: parsedData,
            });

            setImportResult(response);
            if (response.success) {
                alertsProducts.importSuccess(response.succeeded || response.processed || parsedData.length);
                onImportSuccess?.(response);
            }
        } catch (error) {
            console.error("Error al importar productos:", error);
            alertsProducts.importError(error.message);
        } finally {
            setIsImporting(false);
        }
    }, [parsedData, token, tenantId, tenantName, onImportSuccess]);

    const previewColumns = [
        { key: "SKUSIMPLE", label: "SKU" },
        { key: "STOCK", label: "Stock" },
        { key: "TIPO_OPERACION", label: "Operación" },
        { key: "MARCA", label: "Bodega" },
    ];

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ className: "rounded-xl" }}
        >
            <DialogTitle className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-lg font-semibold text-slate-800">Importar Productos</span>
                <button
                    onClick={handleClose}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                    <CloseIcon fontSize="small" />
                </button>
            </DialogTitle>

            <DialogContent className="pt-6">
                <div className="space-y-4">
                    <AlertMessage
                        type="info"
                        message={
                            <>
                                <strong>Formatos aceptados:</strong> Excel (.xlsx, .xls), CSV (.csv) o JSON (.json)
                                <br />
                                <strong>El archivo debe incluir:</strong> SKUSIMPLE, STOCK, TIPO_OPERACION (AGREGAR_STOCK, DESCONTAR_STOCK, CARGA_COMPLETA), MARCA
                            </>
                        }
                    />

                    <div
                        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition ${
                            isDragging
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-slate-300 bg-slate-50 hover:border-slate-400"
                        }`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                        }}
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
                                <p className="mb-4 text-xs text-slate-500">o haz clic en el botón de abajo</p>
                                <label
                                    htmlFor="file-upload"
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <CloudUploadIcon className="text-[18px]" />
                                    Seleccionar archivo
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept={ACCEPTED_FORMATS.join(",")}
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
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setParsedData(null);
                                        setParseError(null);
                                    }}
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
                                >
                                    <CloseIcon fontSize="small" />
                                </button>
                            </div>
                        )}
                    </div>

                    {parseError && (
                        <AlertMessage
                            type="error"
                            icon={ErrorIcon}
                            title="Error al leer el archivo"
                            message={parseError}
                        />
                    )}

                    {parsedData && parsedData.length > 0 && !importResult && (
                        <AlertMessage type="success" icon={CheckCircleIcon}>
                            <p className="mb-2 text-xs font-semibold">
                                {parsedData.length} producto(s) detectado(s)
                            </p>
                            <FilePreview data={parsedData} columns={previewColumns} />
                        </AlertMessage>
                    )}

                    {importResult && (
                        <AlertMessage
                            type={importResult.success && importResult.failed === 0 ? "success" : "warning"}
                            icon={importResult.success && importResult.failed === 0 ? CheckCircleIcon : ErrorIcon}
                            title="Importación completada"
                        >
                            <div className="space-y-1 text-xs">
                                <p className="flex items-center gap-2">
                                    <CheckCircleIcon className="text-[16px] text-green-600" />
                                    Exitosos: <strong>{importResult.succeeded}</strong>
                                </p>
                                <p className="flex items-center gap-2">
                                    <CancelIcon className="text-[16px] text-red-600" />
                                    Fallidos: <strong>{importResult.failed}</strong>
                                </p>
                                <p className="flex items-center gap-2">
                                    <InventoryIcon className="text-[16px] text-indigo-600" />
                                    Total procesados: {importResult.processed}
                                </p>
                            </div>
                            {importResult.results?.some((r) => r.status === "error") && (
                                <div className="mt-2 max-h-24 overflow-y-auto rounded border border-red-200 bg-white p-2">
                                    <p className="mb-1 text-xs font-semibold text-red-700">Errores:</p>
                                    {importResult.results
                                        .filter((r) => r.status === "error")
                                        .map((result, index) => (
                                            <p key={index} className="text-xs text-red-600">
                                                • {result.sku}: {result.error}
                                            </p>
                                        ))}
                                </div>
                            )}
                        </AlertMessage>
                    )}

                    {!parsedData && !parseError && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="mb-2 text-xs font-semibold text-slate-700">
                                Columnas requeridas:
                            </p>
                            <ul className="space-y-1 text-xs text-slate-600">
                                <li>• <strong>SKUSIMPLE</strong>: Código del producto (requerido)</li>
                                <li>• <strong>STOCK</strong>: Cantidad (requerido)</li>
                                <li>• <strong>TIPO_OPERACION</strong>: AGREGAR_STOCK, DESCONTAR_STOCK o CARGA_COMPLETA (requerido)</li>
                                <li>• <strong>MARCA</strong>: Nombre de la bodega/warehouse</li>
                            </ul>
                        </div>
                    )}
                </div>
            </DialogContent>

            <DialogActions className="border-t border-slate-200 px-6 py-4">
                <Button
                    onClick={handleClose}
                    color="inherit"
                    className="normal-case font-semibold"
                    disabled={isImporting}
                >
                    {importResult ? "Cerrar" : "Cancelar"}
                </Button>
                {!importResult && (
                    <Button
                        onClick={handleImport}
                        variant="contained"
                        color="primary"
                        disabled={!parsedData || parsedData.length === 0 || isImporting}
                        className="normal-case font-semibold rounded-lg"
                    >
                        {isImporting ? (
                            <>
                                <CircularProgress size={16} className="mr-1" />
                                Importando...
                            </>
                        ) : (
                            `Importar ${parsedData?.length || 0} Productos`
                        )}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

ImportProductsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    token: PropTypes.string,
    tenantId: PropTypes.string,
    tenantName: PropTypes.string,
    onImportSuccess: PropTypes.func,
};

export default ImportProductsModal;
