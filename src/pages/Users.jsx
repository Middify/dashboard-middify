import React from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import UsersTable from "../components/users/UsersTable";
import CreateUsers from "../components/users/CreateUsers";

const ROLES_QUE_PUEDEN_CREAR = ["superadmin", "middifyadmin", "admin"];

const Users = () => {
  const { token, authorizedTenants, user, selectedTenantId, allTenants } =
    useOutletContext();
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "list";

  const userRole = user?.role?.toLowerCase() || "";
  const canCreateUser = ROLES_QUE_PUEDEN_CREAR.includes(userRole); // ✅ Los 3 roles

  return (
    <div className="mt-8 mx-auto w-full">
      {view === "create" && canCreateUser ? (
        <CreateUsers
          token={token}
          currentUser={user}
          authorizedTenants={authorizedTenants}
          allTenants={allTenants}
        />
      ) : (
        <UsersTable
          token={token}
          allTenants={authorizedTenants || []}
          selectedTenantId={selectedTenantId}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default Users;
