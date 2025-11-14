import OrdersTableHeader from "../components/orders/OrdersTableHeader";
import OrdersTableGrid from "../components/orders/OrdersTableGrid";
import { useOrdersTableLogic } from "../components/orders/useOrdersTableLogic";

const OrdersTable = ({
  token = null,
  selectedTenantId = null,
  selectedOrderState = null,
  onSelectOrder = () => {},
}) => {
  const { error, searchTerm, grid, onSearchChange } = useOrdersTableLogic({
    token,
    selectedTenantId,
    selectedOrderState,
    onSelectOrder,
  });

  return (
    <div className="flex flex-col gap-6 pt-4">
      <OrdersTableHeader
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <OrdersTableGrid
          rows={grid.rows}
          columns={grid.columns}
          loading={grid.loading}
          error={error}
          paginationModel={grid.paginationModel}
          onPaginationModelChange={grid.onPaginationModelChange}
          pageSizeOptions={grid.pageSizeOptions}
          rowCount={grid.rowCount}
          onRowClick={grid.onRowClick}
        />
      </section>
    </div>
  );
};

export default OrdersTable;


