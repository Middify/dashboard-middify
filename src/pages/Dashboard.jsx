import CardsStates from "../components/dashboard/CardsStates";
import CardMarketplace from "../components/dashboard/CardMarketplace";
import { SkeletonDashboard } from "../components/skeleton";

const Dashboard = ({
  isLoading = false,
  error = null,
  tenants = [],
  marketplaceTenants = [],
  isAggregated = true,
  onSelectOrderState = null,
}) => {
  let content;

  if (isLoading) {
    content = <SkeletonDashboard />;
  } else if (error) {
    content = (
      <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        Ocurrió un error al cargar los datos: {error.message}
      </div>
    );
  } else if (!Array.isArray(tenants) || tenants.length === 0) {
    content = (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        No hay datos disponibles.
      </div>
    );
  } else {
    content = (
      <div className="space-y-6">
        <CardsStates
          tenants={tenants}
          isAggregated={isAggregated}
          onSelectState={onSelectOrderState}
        />

        <CardMarketplace
          tenants={marketplaceTenants}
          isAggregated={isAggregated}
        />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {content}
    </div>
  );
};

export default Dashboard;

