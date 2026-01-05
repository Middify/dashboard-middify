const normalizeFileName = (fileName) => {
  const safeName =
    typeof fileName === "string" && fileName.trim().length > 0
      ? fileName.trim()
      : "ordenes";
  return safeName.toLowerCase().endsWith(".xlsx") ? safeName : `${safeName}.xlsx`;
};

const normalizeCellValue = (value) => {
  if (value === null || value === undefined || value === "—") {
    return "";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.warn("No se pudo serializar un valor para exportar:", error);
      return "[objeto]";
    }
  }

  return String(value);
};

/**
 * Exporta datos a Excel de forma optimizada cargando la librería dinámicamente.
 */
export const exportOrdersToExcel = async ({
  rows = [],
  columns = [],
  fileName = "ordenes.xlsx",
  sheetName = "Órdenes",
} = {}) => {
  const exportableColumns = Array.isArray(columns)
    ? columns.filter((column) => column?.field && column.field !== "select")
    : [];

  if (exportableColumns.length === 0) {
    throw new Error("No hay columnas disponibles para exportar.");
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("No hay filas disponibles para exportar.");
  }

  // Carga dinámica de la librería pesada XLSX solo cuando se necesita
  const XLSX = await import("xlsx");

  const headerRow = exportableColumns.map((column) => {
    if (typeof column.headerName === "string" && column.headerName.trim().length > 0) {
      return column.headerName.trim();
    }
    return column.field;
  });

  const dataRows = rows.map((row) => {
    return exportableColumns.map((column) => normalizeCellValue(row[column.field]));
  });

  const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const finalFileName = normalizeFileName(fileName);
  XLSX.writeFile(workbook, finalFileName);
};

export default exportOrdersToExcel;
