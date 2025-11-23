import { useEffect, useState, useMemo } from "react";
import { getUsersList } from "../../api/users/getUsersList";
import { updateUserTenants } from "../../api/users/updateUserTenants";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ConfirmModal from "../../utils/ConfirmModal";

const StoreUsersTab = ({ token, storeName, storeId }) => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [assignMessage, setAssignMessage] = useState("");
  const [removingUserId, setRemovingUserId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const tenantEntry = useMemo(() => {
    const normalizedId =
      typeof storeId === "number" || typeof storeId === "string"
        ? String(storeId).trim()
        : "";
    const normalizedName =
      typeof storeName === "string" ? storeName.trim() : "";

    if (!normalizedId && !normalizedName) {
      return null;
    }

    return {
      tenantId: normalizedId,
      tenantName: normalizedName || normalizedId || "",
    };
  }, [storeId, storeName]);

  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getUsersList({ token, pageSize: 100 });
      const fetchedUsers = response.users || [];
      setAllUsers(fetchedUsers);

      const storeUsers = fetchedUsers.filter((user) => {
        if (!Array.isArray(user.tenant)) return false;
        return user.tenant.some(
          (t) => t.tenantId === storeId || t.tenantName === storeName
        );
      });

      setUsers(storeUsers);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [token, storeId, storeName]);

  const handleAssignUser = async () => {
    if (!selectedUserId || !tenantEntry) return;

    setAssigningLoading(true);
    setAssignMessage("");
    try {
      await updateUserTenants({
        token,
        userId: selectedUserId,
        tenantsToAssign: [tenantEntry],
      });
      setAssignMessage("Usuario asignado correctamente.");
      setSelectedUserId("");
      setIsAssigning(false);
      loadUsers(); // Refresh list
    } catch (err) {
      console.error("Error assigning user:", err);
      setAssignMessage(err.message || "Error al asignar usuario.");
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleRemoveClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmRemoveUser = async () => {
    if (!userToDelete || !tenantEntry) return;

    setRemovingUserId(userToDelete._id);
    try {
      await updateUserTenants({
        token,
        userId: userToDelete._id,
        tenantsToRemove: [tenantEntry],
      });
      loadUsers(); // Refresh list
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error removing user:", err);
      alert(err.message || "Error al eliminar usuario.");
    } finally {
      setRemovingUserId(null);
    }
  };

  const availableUsers = allUsers.filter(
    (u) => !users.some((assigned) => assigned._id === u._id)
  );

  if (!token) {
    return (
      <div className="p-4 text-sm text-red-600">Necesitas iniciar sesión.</div>
    );
  }

  if (loading && users.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500">Cargando usuarios...</div>
    );
  }

  if (error) {
    return <div className="p-4 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4 p-3">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Usuarios asignados
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Usuarios con acceso al tenant{" "}
            <span className="font-semibold text-slate-800">{storeName}</span>.
          </p>
        </div>
        <button
          onClick={() => setIsAssigning(!isAssigning)}
          className="inline-flex items-center gap-2 rounded-lg bg-catalina-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-catalina-blue-700 focus:outline-none focus:ring-2 focus:ring-catalina-blue-500 focus:ring-offset-2"
        >
          <PersonAddAlt1OutlinedIcon fontSize="small" />
          {isAssigning ? "Cancelar" : "Asignar Usuario"}
        </button>
      </header>

      {isAssigning && (
        <div className="rounded-xl border border-catalina-blue-100 bg-catalina-blue-50 p-4">
          <h3 className="mb-3 text-sm font-medium text-catalina-blue-900">
            Asignar nuevo usuario
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-catalina-blue-500 focus:outline-none focus:ring-1 focus:ring-catalina-blue-500"
            >
              <option value="">Selecciona un usuario...</option>
              {availableUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.email} ({user.role})
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignUser}
              disabled={!selectedUserId || assigningLoading}
              className="rounded-lg bg-catalina-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-catalina-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {assigningLoading ? "Asignando..." : "Confirmar"}
            </button>
          </div>
          {assignMessage && (
            <p
              className={`mt-2 text-sm ${assignMessage.includes("Error")
                ? "text-red-600"
                : "text-green-600"
                }`}
            >
              {assignMessage}
            </p>
          )}
        </div>
      )}

      {users.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No hay usuarios asignados a esta tienda.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  Rol
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user._id || user.email}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {user.role}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleRemoveClick(user)}
                      disabled={removingUserId === user._id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="Eliminar usuario"
                    >
                      {removingUserId === user._id ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        <DeleteOutlineIcon fontSize="small" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmRemoveUser}
        title="Eliminar usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario ${userToDelete?.email} de esta tienda? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={removingUserId === userToDelete?._id}
        isDestructive={true}
      />
    </div>
  );
};

export default StoreUsersTab;
