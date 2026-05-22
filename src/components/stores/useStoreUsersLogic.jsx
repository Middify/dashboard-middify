import { useState, useCallback, useEffect, useMemo } from "react";
import { getUsersList } from "../../api/users/getUsersList";
import { updateUser } from "../../api/users/updateUser";
import { useTableState } from "../../hooks/useTableState";

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
  const [allUsers, setAllUsers] = useState([]);
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
    if (!token || currentUser?.role === "User") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getUsersList({
        token,
        pageSize: 200,
        page: 1,
        tenantId: storeId,
      });
      const fetchedUsers = response.users || [];

      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, [token, storeId, currentUser?.role]);

  const CAN_MANAGE_ROLES = ["SuperAdmin", "MiddifyAdmin", "Admin", "admin"];

  const canUserManage = (role) => CAN_MANAGE_ROLES.includes(role);

  const loadAvailableUsers = useCallback(async () => {
    if (!token || allUsers.length > 0) return;

    setLoadingAllUsers(true);
    try {
      const response = await getUsersList({
        token,
        pageSize: 200,
        page: 1,
        tenantId: storeId,
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

  const handleRemoveUser = async (userId) => {
    if (!canUserManage(currentUser?.role)) {
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
