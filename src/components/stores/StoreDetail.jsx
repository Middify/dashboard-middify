import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { saveDashboardColumns } from "../../api/orders/postParamTable";
import {
  DASHBOARD_COLUMNS_TEMPLATE,
  fetchTenantColumns,
} from "../../api/orders/getOrdersByState";
import StoreColumnsTab from "./StoreColumnsTab";
import StoreUsersTab from "./StoreUsersTab";
import { useQueryClient } from "@tanstack/react-query";

const TABS = [
  { id: "columns", label: "Campos tablas" },
  { id: "users", label: "Usuarios" },
];

const StoreDetail = ({ token, currentUser }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { storeId } = useParams();
  const location = useLocation();
  const storeName = location.state?.store?.name ?? storeId ?? "Tienda";

  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [columns, setColumns] = useState([]);
  const [loadingColumns, setLoadingColumns] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const selectedCount = useMemo(
    () => columns.filter((column) => column.active).length,
    [columns],
  );

  const allSelected = columns.length > 0 && selectedCount === columns.length;

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const controller = new AbortController();

    const loadColumns = async () => {
      try {
        setLoadingColumns(true);

        const result = await fetchTenantColumns({
          token,
          tenantId: storeId,
          tenantName: storeName,
          signal: controller.signal,
        });

        if (!isMounted) return;

        setColumns(
          Array.isArray(result) && result.length > 0
            ? result
            : DASHBOARD_COLUMNS_TEMPLATE,
        );
      } catch (error) {
        if (error.name === "AbortError" || !isMounted) return;
        setColumns(DASHBOARD_COLUMNS_TEMPLATE);
        setMessage({
          text: "Error al cargar la configuración actual. Mostrando por defecto.",
          type: "error",
        });
      } finally {
        if (isMounted) setLoadingColumns(false);
      }
    };

    loadColumns();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [token, storeName]);

  const handleToggleColumn = (value) => {
    setMessage({ text: "", type: "" });
    setColumns((prev) =>
      prev.map((column) =>
        column.value === value ? { ...column, active: !column.active } : column,
      ),
    );
  };

  const handleToggleAllColumns = () => {
    setMessage({ text: "", type: "" });
    setColumns((prev) => {
      if (prev.length === 0) return prev;
      const shouldSelectAll = prev.some((column) => !column.active);
      return prev.map((column) => ({
        ...column,
        active: shouldSelectAll,
      }));
    });
  };

  const handleSaveColumns = async () => {
    if (!token) {
      setMessage({
        text: "Sesión expirada. Por favor, recarga la página.",
        type: "error",
      });
      return;
    }

    const activeColumnValues = columns
      .filter((column) => column.active)
      .map((column) => column.value);

    if (activeColumnValues.length === 0) {
      setMessage({
        text: "Selecciona al menos una columna antes de guardar.",
        type: "error",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage({ text: "", type: "" });

      await saveDashboardColumns({
        token,
        tenantName: storeName,
        params: activeColumnValues,
      });
      queryClient.invalidateQueries(["tenantColumns"]);
      queryClient.invalidateQueries(["orders"]);

      setMessage({
        text: "Configuración de columnas guardada correctamente en el Tenant.",
        type: "success",
      });
    } catch (error) {
      setMessage({
        text: ` ${error.message || "Error al guardar columnas."}`,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors duration-150 hover:border-slate-300 hover:text-slate-800 hover:bg-slate-50"
      >
        <ArrowBackIcon fontSize="small" />
        Volver
      </button>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm min-h-[500px]">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-4">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage({ text: "", type: "" });
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {/* MENSAJE ERROR/ÉXITO */}
        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm font-medium border ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
            {message.text}
          </div>
        )}
        {activeTab === "columns" && (
          <StoreColumnsTab
            columns={columns}
            selectedCount={selectedCount}
            allSelected={allSelected}
            loadingColumns={loadingColumns}
            saving={saving}
            message={message.text}
            onToggleColumn={handleToggleColumn}
            onToggleAllColumns={handleToggleAllColumns}
            onSave={handleSaveColumns}
          />
        )}

        {activeTab === "users" && (
          <StoreUsersTab
            token={token}
            storeName={storeName}
            storeId={storeId}
            currentUser={currentUser}
          />
        )}
      </section>
    </div>
  );
};

export default StoreDetail;
