import { useState, useCallback, useEffect, useMemo } from "react";
import { getUsersList } from "../../api/users/getUsersList";
import { updateUserTenants } from "../../api/users/updateUserTenants";
import { useTableState } from "../../hooks/useTableState";
import { alertsProducts } from "../../utils/alertsProducts";

export const useStoreUsersLogic = ({ token, storeName, storeId }) => {
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

    // Load users assigned to this store
    // Note: Since we don't have a specific endpoint for "users of tenant X",
    // we filter client-side. To make this robust for large datasets, 
    // we would ideally need a backend filter. 
    // For now, we fetch a larger page size to find them, or we accept we only see matches in the first N users.
    // OPTIMIZATION: We fetch a reasonable amount to display.
    const loadStoreUsers = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            // We fetch a larger batch to filter client side as per legacy logic
            // If backend supports filtering, this should be updated.
            const response = await getUsersList({ token, pageSize: 200, page: 1 });
            const fetchedUsers = response.users || [];
            
            const filtered = fetchedUsers.filter((user) => {
                if (!Array.isArray(user.tenant)) return false;
                return user.tenant.some(
                    (t) => t.tenantId === storeId || t.tenantName === storeName
                );
            });
            setUsers(filtered);
        } catch (err) {
            console.error("Error loading users:", err);
            setError("No se pudieron cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    }, [token, storeId, storeName]);

    // Load available users for assignment (on demand)
    const loadAvailableUsers = useCallback(async () => {
        if (!token || allUsers.length > 0) return; // Cache if already loaded
        setLoadingAllUsers(true);
        try {
            // Fetch potential candidates. 
            // In a real large app, this should be a search endpoint.
            const response = await getUsersList({ token, pageSize: 100, page: 1 });
            setAllUsers(response.users || []);
        } catch (err) {
            console.error("Error loading available users:", err);
        } finally {
            setLoadingAllUsers(false);
        }
    }, [token, allUsers.length]);

    useEffect(() => {
        loadStoreUsers();
    }, [loadStoreUsers, refreshTrigger]);

    const handleAssignUser = async (userId) => {
        if (!userId || !tenantEntry) return { success: false, message: "Datos incompletos" };
        
        try {
            await updateUserTenants({
                token,
                userId,
                tenantsToAssign: [tenantEntry],
            });
            triggerRefresh();
            return { success: true, message: "Usuario asignado correctamente" };
        } catch (err) {
            console.error("Error assigning user:", err);
            return { success: false, message: err.message || "Error al asignar usuario" };
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!userId || !tenantEntry) return { success: false };

        try {
            await updateUserTenants({
                token,
                userId,
                tenantsToRemove: [tenantEntry],
            });
            triggerRefresh();
            return { success: true };
        } catch (err) {
            console.error("Error removing user:", err);
            return { success: false, message: err.message };
        }
    };

    const availableUsers = useMemo(() => {
        return allUsers.filter(u => !users.some(assigned => assigned._id === u._id));
    }, [allUsers, users]);

    return {
        users,
        loading,
        error,
        availableUsers,
        loadingAllUsers,
        loadAvailableUsers,
        handleAssignUser,
        handleRemoveUser,
        grid: {
            paginationModel,
            onPaginationModelChange: setPaginationModel,
        }
    };
};


