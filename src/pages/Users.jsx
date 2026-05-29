import React from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import UsersTable from "../components/users/UsersTable";
import CreateUsers from "../components/users/CreateUsers";

const ROLES_QUE_PUEDEN_CREAR = ["superadmin", "middifyadmin", "admin"];

const ROLES_VISION_GLOBAL = ["superadmin", "middifyadmin"];

const Users = () => {
  const contextData = useOutletContext();
  const {
    token,
    authorizedTenants,
    user,
    selectedTenantId,
    allTenants,
    tenants,
  } = contextData;

  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "list";

  const userRole = user?.role?.toLowerCase() || "";
  const canCreateUser = ROLES_QUE_PUEDEN_CREAR.includes(userRole);

  const hasGlobalVision = ROLES_VISION_GLOBAL.includes(userRole);
  const effectiveTenantId = hasGlobalVision ? "ALL" : selectedTenantId;

  const array1 = allTenants || [];
  const array2 = tenants || [];
  const array3 = user?.tenant || [];
  const array4 = authorizedTenants || [];

  const listaMaestraTiendas = [array1, array2, array3, array4].sort(
    (a, b) => b.length - a.length,
  )[0];

  return (
    <div className="mt-8 mx-auto w-full">
      {view === "create" && canCreateUser ? (
        <CreateUsers
          token={token}
          currentUser={user}
          authorizedTenants={authorizedTenants}
          allTenants={listaMaestraTiendas}
        />
      ) : (
        <UsersTable
          token={token}
          allTenants={listaMaestraTiendas}
          selectedTenantId={effectiveTenantId}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default Users;
