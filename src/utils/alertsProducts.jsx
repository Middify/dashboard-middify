import { toast } from "react-toastify";

const toastConfig = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

/**
 * Muestra un toast de error para productos
 * @param {string} message - Mensaje de error
 */
export const showProductError = (message) => {
    toast.error(message, toastConfig);
};

/**
 * Muestra un toast de éxito para productos
 * @param {string} message - Mensaje de éxito
 */
export const showProductSuccess = (message) => {
    toast.success(message, toastConfig);
};

/**
 * Muestra un toast de advertencia para productos
 * @param {string} message - Mensaje de advertencia
 */
export const showProductWarning = (message) => {
    toast.warning(message, toastConfig);
};

/**
 * Muestra un toast de información para productos
 * @param {string} message - Mensaje informativo
 */
export const showProductInfo = (message) => {
    toast.info(message, toastConfig);
};

// Alerts específicos para productos
export const alertsProducts = {
    // Importación
    noDataToImport: () => showProductError("No hay datos válidos para importar."),
    noToken: () => showProductError("No hay token de autenticación disponible."),
    noTenant: () => showProductError("Se requiere seleccionar un tenant."),
    importSuccess: (count) => showProductSuccess(`Importación exitosa: ${count} producto(s) procesado(s)`),
    importError: (error) => showProductError(`Error al importar productos: ${error || "Error desconocido"}`),
    parseError: (error) => showProductError(`Error al leer el archivo: ${error}`),
    invalidFileFormat: () => showProductError("Formato de archivo no válido. Usa .xlsx, .xls, .csv o .json"),

    // Actualización de estado
    selectState: () => showProductWarning("Por favor selecciona un estado."),
    updateSuccess: (count) => showProductSuccess(`${count} producto(s) actualizado(s) correctamente.`),
    updateError: (error) => showProductError(`Error: ${error || "Error desconocido"}`),

    // Eliminación
    deleteSuccess: (count) => showProductSuccess(`${count} producto(s) eliminado(s) correctamente.`),
    deleteError: (error) => showProductError(`Error: ${error || "Error desconocido"}`),

    // Sincronización
    noDataToSync: () => showProductError("No hay datos válidos para sincronizar."),
    syncError: (error) => showProductError(`Error al sincronizar SKUs: ${error || "Error desconocido"}`),
    syncSuccess: (count) => showProductSuccess(`Sincronización exitosa: ${count} SKU(s) procesado(s)`),

    // Exportación
    exportSuccess: (message) => showProductSuccess(message || "Exportación iniciada correctamente"),
    exportError: () => showProductError("Error al exportar productos."),
};

