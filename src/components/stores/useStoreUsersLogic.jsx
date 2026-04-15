import { useState, useCallback, useEffect, useMemo } from "react";
import { getUsersList } from "../../api/users/getUsersList";
import { updateUser } from "../../api/users/updateUser";
import { useTableState } from "../../hooks/useTableState";
import { alertsProducts } from "../../utils/alertsProducts";

export const useStoreUsersLogic = ({
  token,
  storeName,
  storeId,
  currentUser,
}) => {
  const {
    paginationModel,
    setPaginationModel,
    refreshTrigger,
    triggerRefresh,
  } = useTableState({ initialPageSize: 10 });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]); // For assignment dropdown
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);

  const tenantEntry = useMemo(() => {
    const normalizedId = String(storeId || "").trim();
    const normalizedName = String(storeName || "").trim();
    if (!normalizedId && !normalizedName) return null;
    return {
      tenantId: normalizedId,
      tenantName: normalizedName || normalizedId || "",
    };
  }, [storeId, storeName]);

  const loadStoreUsers = useCallback(async () => {
    // Validacion de rol ---
    // Si no hay token o el rol es 'userTenant', cancelamos la carga
    if (!token || currentUser?.role === "User") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getUsersList({ token, pageSize: 200, page: 1 });
      const fetchedUsers = response.users || [];

      const filtered = fetchedUsers.filter((user) => {
        if (!Array.isArray(user.tenant)) return false;
        return user.tenant.some(
          (t) => t.tenantId === storeId || t.tenantName === storeName,
        );
      });
      setUsers(filtered);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, [token, storeId, storeName, currentUser?.role]);

  // Roles con permiso de gestión
  const CAN_MANAGE_ROLES = ["SuperAdmin", "MiddifyAdmin", "Admin", "admin"];

  const canUserManage = (role) => CAN_MANAGE_ROLES.includes(role);

  // En loadAvailableUsers — usar el storeId real del tenant actual
  const loadAvailableUsers = useCallback(async () => {
    if (!token || allUsers.length > 0) return;
    if (!storeId) {
      console.warn("loadAvailableUsers: storeId no disponible");
      return;
    }
    setLoadingAllUsers(true);
    try {
      const response = await getUsersList({
        token,
        pageSize: 200,
        page: 1,
        tenantId: storeId, // ✅ Dinámico, no hardcodeado
      });
      setAllUsers(response.users || []);
    } catch (err) {
      console.error("Error loading available users:", err);
    } finally {
      setLoadingAllUsers(false);
    }
  }, [token, storeId, allUsers.length]);

  useEffect(() => {
    loadStoreUsers();
  }, [loadStoreUsers, refreshTrigger]);

  // En handleAssignUser — respeta todos los roles con permiso
  const handleAssignUser = async (userId) => {
    if (!canUserManage(currentUser?.role)) {
      return {
        success: false,
        message: "No tienes permisos para asignar usuarios",
      };
    }
    if (!userId || !tenantEntry)
      return { success: false, message: "Datos incompletos" };

    try {
      await updateUser({ token, userId, tenantsToAssign: [tenantEntry] });
      triggerRefresh();
      return { success: true, message: "Usuario asignado correctamente" };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Error al asignar usuario",
      };
    }
  };

  // En handleRemoveUser — igual
  const handleRemoveUser = async (userId) => {
    if (!canUserManage(currentUser?.role)) {
      // ✅
      return {
        success: false,
        message: "No tienes permisos para eliminar usuarios",
      };
    }
    if (!userId || !tenantEntry) return { success: false };

    try {
      await updateUser({ token, userId, tenantsToRemove: [tenantEntry] });
      triggerRefresh();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const availableUsers = useMemo(() => {
    return allUsers.filter(
      (u) => !users.some((assigned) => assigned._id === u._id),
    );
  }, [allUsers, users]);

  return {
    users,
    loading,
    error,
    isRestricted: currentUser?.role === "User",
    availableUsers,
    loadingAllUsers,
    loadAvailableUsers,
    handleAssignUser,
    handleRemoveUser,
    grid: {
      paginationModel,
      onPaginationModelChange: setPaginationModel,
    },
  };
};
