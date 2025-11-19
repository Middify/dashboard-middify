import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { saveDashboardColumns } from "../api/orders/postParamTable";
import {
  DASHBOARD_COLUMNS_TEMPLATE,
  fetchTenantColumns,
} from "../api/orders/getOrdersByState";

const toBoolean = (value, fallback = undefined) => {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return Boolean(value);
};

const getOrderValue = (column) => {
  if (typeof column.sortOrder === "number") {
    return column.sortOrder;
  }
  if (typeof column.originalIndex === "number") {
    return column.originalIndex;
  }
  return 0;
};

const normalizeColumns = (columns = []) =>
  columns.map((column, index) => {
    const explicitActive =
      column?.active !== undefined
        ? toBoolean(column.active, undefined)
        : column?.hasFilter !== undefined
        ? toBoolean(column.hasFilter, undefined)
        : undefined;
    const active = explicitActive === undefined ? true : explicitActive;
    const originalIndex =
      typeof column.originalIndex === "number"
        ? column.originalIndex
        : index;
    return {
      ...column,
      active,
      hasFilter: active,
      originalIndex,
      sortOrder:
        active
          ? typeof column.sortOrder === "number"
            ? column.sortOrder
            : index
          : null,
    };
  });

const sortColumnsBySelection = (columns = []) => {
  const selected = [];
  const unselected = [];

  columns.forEach((column) => {
    if (column.active) {
      selected.push(column);
    } else {
      unselected.push(column);
    }
  });

  selected.sort((a, b) => getOrderValue(a) - getOrderValue(b));
  unselected.sort(
    (a, b) =>
      (a.originalIndex ?? getOrderValue(a)) -
      (b.originalIndex ?? getOrderValue(b))
  );

  return [...selected, ...unselected];
};

const initializeColumns = (columns = []) =>
  sortColumnsBySelection(normalizeColumns(columns));

const getNextSortOrder = (columns = []) =>
  columns.reduce((max, column) => {
    if (column.active && typeof column.sortOrder === "number") {
      return Math.max(max, column.sortOrder);
    }
    return max;
  }, 0) + 1;

const StoreDetail = ({ token }) => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const location = useLocation();
  const storeName = location.state?.store?.name ?? storeId ?? "Tienda";
  const [columns, setColumns] = useState(() =>
    initializeColumns(DASHBOARD_COLUMNS_TEMPLATE)
  );
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const selectedCount = useMemo(
    () => columns.filter((column) => column.active).length,
    [columns]
  );
  const allSelected = selectedCount === columns.length;

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const loadColumns = async () => {
      try {
        setLoadingColumns(true);
        const result = await fetchTenantColumns({
          token,
          tenantName: storeName,
          signal: controller.signal,
        });
        if (!isMounted) {
          return;
        }
        setColumns(
          initializeColumns(
            Array.isArray(result) && result.length
              ? result
              : DASHBOARD_COLUMNS_TEMPLATE
          )
        );
      } catch (error) {
        if (error.name === "AbortError" || !isMounted) {
          return;
        }
        setColumns(initializeColumns(DASHBOARD_COLUMNS_TEMPLATE));
        setMessage(error.message || "No se pudo cargar la configuración actual.");
      } finally {
        if (isMounted) {
          setLoadingColumns(false);
        }
      }
    };

    loadColumns();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [token, storeName]);

  const handleToggleColumn = (value) => {
    setColumns((prev) => {
      const target = prev.find((column) => column.value === value);
      if (!target) {
        return prev;
      }
      const shouldEnable = !target.active;
      const nextSortOrder = shouldEnable ? getNextSortOrder(prev) : null;
      const updated = prev.map((column) => {
        if (column.value !== value) {
          return column;
        }
        if (!shouldEnable) {
          return {
            ...column,
            active: false,
            active: false,
            sortOrder: null,
          };
        }
        return {
          ...column,
          active: true,
          active: true,
          sortOrder: nextSortOrder,
        };
      });
      return sortColumnsBySelection(updated);
    });
  };

  const handleToggleAllColumns = () => {
    setColumns((prev) => {
      if (prev.length === 0) {
        return prev;
      }
      const shouldSelectAll = prev.some((column) => !column.active);
      if (!shouldSelectAll) {
        const cleared = prev.map((column) => ({
          ...column,
          active: false,
          active: false,
          sortOrder: null,
        }));
        return sortColumnsBySelection(cleared);
      }
      let nextSortOrder = getNextSortOrder(prev);
      const updated = prev.map((column) => {
        if (column.active) {
          return column;
        }
        const assigned = {
          ...column,
          active: true,
          active: true,
          sortOrder: nextSortOrder,
        };
        nextSortOrder += 1;
        return assigned;
      });
      return sortColumnsBySelection(updated);
    });
  };

  const handleSaveColumns = async () => {
    if (!token) {
      setMessage("Necesitas iniciar sesión.");
      return;
    }

    const activeColumnValues = columns
      .filter((column) => column.active)
      .map((column) => column.value);

    if (activeColumnValues.length === 0) {
      setMessage("Selecciona al menos una columna antes de guardar.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      await saveDashboardColumns({
        token,
        tenantName: storeName,
        params: activeColumnValues,
      });
      setMessage("Columnas guardadas correctamente.");
    } catch (error) {
      setMessage(error.message || "Error al guardar columnas.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors duration-150 hover:border-slate-300 hover:text-slate-800"
      >
        ← Volver
      </button>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Guardar columnas de ejemplo
        </h2>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <p>
            {selectedCount} de {columns.length} columnas con filtro activo.
          </p>
          <button
            type="button"
            onClick={handleToggleAllColumns}
            disabled={loadingColumns}
            className="rounded-md border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {allSelected ? "Deseleccionar todas" : "Seleccionar todas"}
          </button>
        </div>

        {loadingColumns ? (
          <p className="mt-4 text-sm text-slate-500">
            Cargando configuración guardada...
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {columns.map((column) => (
              <li key={column.value}>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:border-slate-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={Boolean(column.active)}
                    onChange={() => handleToggleColumn(column.value)}
                  />
                  <span className="font-medium">{column.title}</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={handleSaveColumns}
          disabled={saving || loadingColumns}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {saving ? "Guardando..." : "Guardar columnas"}
        </button>
        {message && (
          <p className="mt-3 text-sm text-slate-700">
            {message}
          </p>
        )}
      </section>
    </div>
  );
};

export default StoreDetail;