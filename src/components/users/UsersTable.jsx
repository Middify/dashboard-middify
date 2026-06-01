import React, { useState, useEffect } from "react";
import { getUsersList } from "../../api/users/getUsersList";
import { deleteUser } from "../../api/users/deleteUser";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GroupIcon from "@mui/icons-material/Group";
import BusinessIcon from "@mui/icons-material/Business";
import ShieldIcon from "@mui/icons-material/Shield";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditUserModal from "./EditUserModal";

const UsersTable = ({ token, allTenants, selectedTenantId, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalPages: 1,
    count: 0,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // ESTADOS PARA ELIMINACIÓN
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const rawRole = currentUser?.role || currentUser?.authInfo?.role || "";
  const currentRole = String(rawRole).trim().toLowerCase();

  const canDeleteUser =
    currentRole === "superadmin" || currentRole === "middifyadmin";

  const canEditUser = (targetUser) => {
    const currentRole = currentUser?.role;
    const targetRole = targetUser?.role;

    if (!currentRole) return false;

    if (currentRole === "SuperAdmin") return true;

    if (currentRole === "MiddifyAdmin") {
      return targetRole !== "SuperAdmin" && targetRole !== "MiddifyAdmin";
    }

    if (currentRole === "Admin" || currentRole === "admin") {
      return !["SuperAdmin", "MiddifyAdmin", "Admin", "admin"].includes(
        targetRole,
      );
    }

    return false;
  };
  const fetchUsers = async () => {
    if (!selectedTenantId) return;
    try {
      setLoading(true);
      const data = await getUsersList({
        token,
        page: pagination.page,
        pageSize: pagination.pageSize,
        tenantId: selectedTenantId,
      });
      setUsers(data.users || []);
      setPagination((prev) => ({
        ...prev,
        count: data.total ?? data.count ?? 0,
        totalPages:
          Math.ceil((data.total ?? data.count ?? 0) / prev.pageSize) || 1,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && selectedTenantId) {
      fetchUsers();
    } else {
      setUsers([]);
      setLoading(false);
    }
  }, [token, pagination.page, selectedTenantId]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchUsers();
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      await deleteUser({ token, userId: userToDelete._id });
      toast.success(
        "Usuario eliminado correctamente de la Base de Datos y Cognito",
      );
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error(error.message || "Hubo un error al eliminar el usuario");
    } finally {
      setIsDeleting(false);
    }
  };
  const roleDisplayNames = {
    SuperAdmin: "SuperAdmin Middify",
    MiddifyAdmin: "MiddifyAdmin",
    Admin: "AdminTenant",
    User: "UserTenant",
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "SuperAdmin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "MiddifyAdmin":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "Admin":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
        <CircularProgress size={40} thickness={4} sx={{ color: "#4f46e5" }} />
        <p className="mt-4 text-sm font-semibold text-slate-500 animate-pulse">
          Cargando usuarios...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 grid place-items-center">
            <GroupIcon />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Usuarios Registrados
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Total:{" "}
              <span className="text-indigo-600 font-bold">
                {pagination.count}
              </span>{" "}
              usuarios
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <EmailIcon sx={{ fontSize: 16 }} />
                  Usuario / Email
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <ShieldIcon sx={{ fontSize: 16 }} />
                  Rol
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <BusinessIcon sx={{ fontSize: 16 }} />
                  Tenants Asignados
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                {/* 1. Columna usuario / email */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {user.email}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      ID: {user._id}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getRoleBadgeColor(user.role)}`}
                  >
                    {roleDisplayNames[user.role] || user.role}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {user.tenant && user.tenant.length > 0 ? (
                      user.tenant.map((t) => (
                        <div
                          key={t.tenantId}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-default"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span className="text-xs font-semibold text-slate-600">
                            {t.tenantName}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Sin tenants asignados
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {canEditUser(user) ? (
                    <IconButton
                      onClick={() => handleEditClick(user)}
                      size="small"
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Editar usuario"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <span
                      className="text-xs text-slate-300 cursor-not-allowed"
                      title="No tienes jerarquía para editar a este usuario"
                    >
                      —
                    </span>
                  )}
                  {/*BOTÓN DE ELIMINAR RESTRINGIDO */}
                  {canDeleteUser && (
                    <IconButton
                      onClick={() => handleDeleteClick(user)}
                      size="small"
                      className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                      title="Eliminar usuario permanentemente"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/30 flex items-center justify-between">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
            Anterior
          </button>

          <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
            Página {pagination.page} de {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
          >
            Siguiente
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      )}
      {/* MODAL DE ELIMINACIÓN */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <div className="p-2 bg-red-100 rounded-full">
                <DeleteOutlineIcon />
              </div>
              <h3 className="text-lg font-bold">¿Eliminar Usuario?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-2">
              Estás a punto de eliminar permanentemente a:
            </p>
            <p className="text-sm font-bold text-slate-800 mb-6 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              {userToDelete?.email}
            </p>
            <p className="text-xs text-red-500 mb-6 font-medium italic">
              Esta acción eliminará al usuario de AWS Cognito y de la Base de
              Datos. No se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 rounded-2xl py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <CircularProgress size={16} sx={{ color: "white" }} />
                ) : (
                  "Sí, Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <EditUserModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={editingUser}
        allTenants={allTenants || []}
        token={token}
        onSuccess={handleEditSuccess}
        currentUser={currentUser}
      />
    </div>
  );
};

export default UsersTable;
