import { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

const ORDER_STATE_ITEMS = [
  { id: "ingresada", label: "Ingresada" },
  { id: "pendiente", label: "Pendiente" },
  { id: "procesada", label: "Procesada" },
  { id: "error", label: "Error" },
  { id: "en_proceso", label: "En proceso" },
  { id: "descartada", label: "Descartada" },
];

const Sidebar = ({
  tenants = [],
  selectedTenantId = null,
  onChangeTenant,
  activeView = "dashboard",
  onChangeView,
  showTenantFilter = true,
  activeOrderState = null,
  onChangeOrderState,
}) => {
  const hasTenants =
    Array.isArray(tenants) &&
    tenants.some((tenant) => tenant?.tenantId && tenant?.tenantName);

  const handleViewChange = (view) => {
    if (typeof onChangeView === "function") {
      onChangeView(view);
    }
  };

  const handleTenantChange = (event) => {
    if (typeof onChangeTenant === "function") {
      const value = event.target.value;
      onChangeTenant(value === "all" ? null : value);
    }
  };

  const [expandedItems, setExpandedItems] = useState(() =>
    activeView === "orders" ? ["orders-root"] : []
  );

  useEffect(() => {
    if (activeView === "orders") {
      setExpandedItems((prev) =>
        prev.includes("orders-root") ? prev : [...prev, "orders-root"]
      );
    }
  }, [activeView]);

  const selectedOrderNodeId =
    activeView === "orders"
      ? activeOrderState
        ? `orders-${activeOrderState}`
        : "orders-root"
      : null;

  const handleOrderTreeSelect = (_event, itemIds) => {
    const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
    const itemId = ids[ids.length - 1];

    if (!itemId) {
      return;
    }

    if (itemId === "orders-root") {
      handleViewChange("orders");
      if (typeof onChangeOrderState === "function") {
        onChangeOrderState(null);
      }
      return;
    }

    if (itemId.startsWith("orders-")) {
      const stateId = itemId.replace("orders-", "");
      const exists = ORDER_STATE_ITEMS.some((state) => state.id === stateId);
      if (!exists) {
        return;
      }
      handleViewChange("orders");
      if (typeof onChangeOrderState === "function") {
        onChangeOrderState(stateId);
      }
    }
  };

  const handleExpandedItemsChange = (_event, newExpandedItems) => {
    setExpandedItems(
      Array.isArray(newExpandedItems) ? newExpandedItems : [newExpandedItems]
    );
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:flex">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Vistas
          </p>
          <div className="mt-2 space-y-2">
            <button
              type="button"
              onClick={() => handleViewChange("dashboard")}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                activeView === "dashboard"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("stores")}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                activeView === "stores"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
              }`}
            >
              Tiendas
            </button>
            <div className="px-1 py-2">
              <SimpleTreeView
                aria-label="órdenes"
                expandedItems={expandedItems}
                onExpandedItemsChange={handleExpandedItemsChange}
                selectedItems={
                  selectedOrderNodeId ? [selectedOrderNodeId] : undefined
                }
                onSelectedItemsChange={handleOrderTreeSelect}
                multiSelect={false}
                slots={{
                  collapseIcon: ExpandMoreIcon,
                  expandIcon: ChevronRightIcon,
                }}
                sx={{
                  "& .MuiTreeItem-content": {
                    borderRadius: "0.5rem",
                    paddingRight: "0.5rem",
                    marginBottom: "0.35rem",
                  },
                  "& .MuiTreeItem-label": {
                    fontSize: "0.875rem",
                    padding: "0.35rem 0.75rem",
                  },
                  "& .MuiTreeItem-content.Mui-selected .MuiTreeItem-label": {
                    backgroundColor: "rgba(79, 70, 229, 0.1)",
                    color: "rgb(79, 70, 229)",
                  },
                  "& .MuiTreeItem-content:hover .MuiTreeItem-label": {
                    backgroundColor: "rgba(79, 70, 229, 0.08)",
                  },
                  "& .MuiTreeItem-group": {
                    marginLeft: "0.75rem",
                    paddingLeft: "0.5rem",
                    borderLeft: "1px dashed rgba(148, 163, 184, 0.4)",
                  },
                }}
              >
                <TreeItem
                  itemId="orders-root"
                  label="órdenes"
                  sx={{
                    "& .MuiTreeItem-label": {
                      fontWeight: 600,
                      textTransform: "capitalize",
                    },
                  }}
                >
                  {ORDER_STATE_ITEMS.map((state) => (
                    <TreeItem
                      key={state.id}
                      itemId={`orders-${state.id}`}
                      label={state.label}
                    />
                  ))}
                </TreeItem>
              </SimpleTreeView>
            </div>
          </div>
        </div>

        {showTenantFilter && (
          <div>
            <label
              htmlFor="tenant-select"
              className="block text-sm font-medium text-slate-700"
            >
              Tienda
            </label>
            <div className="mt-2">
              <select
                id="tenant-select"
                value={selectedTenantId ?? "all"}
                onChange={handleTenantChange}
                className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todas las tiendas</option>
                {hasTenants &&
                  tenants.map((tenant) => (
                    <option key={tenant.tenantId} value={tenant.tenantId}>
                      {tenant.tenantName}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
