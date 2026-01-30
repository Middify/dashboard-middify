import StoreCards from "../components/stores/StoreCards";

const Stores = ({
  isLoading = false,
  error = null,
  productTenants = [],
  marketplaceTenants = [],
  authorizedTenants = [],
}) => {
  let content;

  if (isLoading) {
    content = <div>Cargando...</div>;
  } else if (error) {
    content = (
      <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        Ocurrió un error al cargar los datos: {error.message}
      </div>
    );
  } else {
    content = (
      <StoreCards
        productTenants={productTenants}
        marketplaceTenants={marketplaceTenants}
        authorizedTenants={authorizedTenants}
      />
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Tiendas</h1>
      {content}
    </div>
  );
};

export default Stores;

