import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { saveDashboardColumns } from "../api/orders/postParamTable";
import {
  DASHBOARD_COLUMNS_TEMPLATE,
  fetchTenantColumns,
} from "../api/orders/getOrdersByState";

const StoreDetail = ({ token }) => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const location = useLocation();
  const storeName = location.state?.store?.name ?? storeId ?? "Tienda";
  const [columns, setColumns] = useState(() =>
    DASHBOARD_COLUMNS_TEMPLATE.map((column) => ({ ...column }))
  );
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const selectedCount = useMemo(
    () => columns.filter((column) => column.hasFilter).length,
    [columns]
  );

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
          (Array.isArray(result) && result.length
            ? result
            : DASHBOARD_COLUMNS_TEMPLATE
          ).map((column) => ({
            ...column,
          }))
        );
      } catch (error) {
        if (error.name === "AbortError" || !isMounted) {
          return;
        }
        setColumns(DASHBOARD_COLUMNS_TEMPLATE.map((column) => ({ ...column })));
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
    setColumns((prev) =>
      prev.map((column) =>
        column.value === value
          ? { ...column, hasFilter: !column.hasFilter }
          : column
      )
    );
  };

  const handleSaveColumns = async () => {
    if (!token) {
      setMessage("Necesitas iniciar sesión.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      await saveDashboardColumns({
        token,
        tenantName: storeName,
        params: columns,
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
        <h1 className="text-2xl font-semibold text-slate-900">
          Vista personalizada
        </h1>
        <p className="mt-2 text-slate-600">
          Hola mundo desde <span className="font-semibold">{storeName}</span>.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Guardar columnas de ejemplo
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Marca las columnas que deben tener filtro antes de guardar la
          configuración del tenant.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {selectedCount} de {columns.length} columnas con filtro activo.
        </p>

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
                    checked={Boolean(column.hasFilter)}
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