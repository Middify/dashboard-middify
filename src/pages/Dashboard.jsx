import CardsStates from "../components/dashboard/CardsStates";
import CardMarketplace from "../components/dashboard/CardMarketplace";
import { SkeletonDashboard } from "../components/skeleton";

const Dashboard = ({
  isLoading = false,
  isFetching = false,
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
      <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center shadow-sm backdrop-blur-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-900">Error de conexión</h3>
        <p className="mt-1 text-sm text-red-700">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Reintentar ahora
        </button>
      </div>
    );
  } else if (!Array.isArray(tenants) || tenants.length === 0) {
    content = (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center backdrop-blur-sm">
        <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Sin datos disponibles</h3>
        <p className="mt-2 max-w-xs text-slate-500">No hemos encontrado información para esta tienda en este momento.</p>
      </div>
    );
  } else {
    content = (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-8">
        <div className="relative">
          {isFetching && (
            <div className="absolute -top-6 right-0 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-catalina-blue-500 animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-catalina-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-catalina-blue-500"></span>
              </span>
              Sincronizando...
            </div>
          )}
          <CardsStates
            tenants={tenants}
            isAggregated={isAggregated}
            onSelectState={onSelectOrderState}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-1">
          <CardMarketplace
            tenants={marketplaceTenants}
            isAggregated={isAggregated}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20 pt-4">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute -left-[10%] -top-[5%] h-[500px] w-[500px] rounded-full bg-catalina-blue-50/50 blur-[120px]" />
        <div className="absolute -right-[5%] top-[20%] h-[400px] w-[400px] rounded-full bg-emerald-50/40 blur-[100px]" />
      </div>

      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Dashboard <span className="text-catalina-blue-600">Middify</span>
          </h1>
          <p className="text-base font-medium text-slate-500">
            Bienvenido de nuevo. Aquí tienes el resumen de tu operación.
          </p>
        </div>
        
        <div className="flex items-center gap-3 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <div className="pr-4 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hoy</p>
            <p className="text-sm font-bold text-slate-700">
              {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
            </p>
          </div>
        </div>
      </header>

      {content}
    </div>
  );
};

export default Dashboard;

