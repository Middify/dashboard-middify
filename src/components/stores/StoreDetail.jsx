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

const TABS = [
  { id: "columns", label: "Campos tablas" },
  { id: "users", label: "Usuarios" },
];

const prepareColumns = (columns = []) =>
  columns.map((column) => {
    const active =
      column?.active !== undefined
        ? Boolean(column.active)
        : column?.hasFilter !== undefined
          ? Boolean(column.hasFilter)
          : true;

    return {
      ...column,
      active,
    };
  });

const StoreDetail = ({ token }) => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const location = useLocation();
  const storeName = location.state?.store?.name ?? storeId ?? "Tienda";
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [columns, setColumns] = useState(() =>
    prepareColumns(DASHBOARD_COLUMNS_TEMPLATE)
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
          prepareColumns(
            Array.isArray(result) && result.length
              ? result
              : DASHBOARD_COLUMNS_TEMPLATE
          )
        );
      } catch (error) {
        if (error.name === "AbortError" || !isMounted) {
          return;
        }
        setColumns(prepareColumns(DASHBOARD_COLUMNS_TEMPLATE));
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
        column.value === value ? { ...column, active: !column.active } : column
      )
    );
  };

  const handleToggleAllColumns = () => {
    setColumns((prev) => {
      if (prev.length === 0) {
        return prev;
      }
      const shouldSelectAll = prev.some((column) => !column.active);
      return prev.map((column) => ({
        ...column,
        active: shouldSelectAll,
      }));
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
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors duration-150 hover:border-slate-300 hover:text-slate-800 hover:bg-slate-50"
      >
        <ArrowBackIcon fontSize="small" />
        Volver
      </button>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive
                    ? "bg-catalina-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "columns" && (
          <StoreColumnsTab
            columns={columns}
            selectedCount={selectedCount}
            allSelected={allSelected}
            loadingColumns={loadingColumns}
            saving={saving}
            message={message}
            onToggleColumn={handleToggleColumn}
            onToggleAllColumns={handleToggleAllColumns}
            onSave={handleSaveColumns}
          />
        )}

        {activeTab === "users" && (
          <StoreUsersTab token={token} storeName={storeName} storeId={storeId} />
        )}
      </section>
    </div>
  );
};

export default StoreDetail;