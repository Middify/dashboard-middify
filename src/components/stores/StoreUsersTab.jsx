import { useState } from "react";
import PropTypes from "prop-types";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { CircularProgress } from "@mui/material";
import TableGrid from "../common/TableGrid";
import ConfirmModal from "../../utils/ConfirmModal";
import { useStoreUsersLogic } from "./useStoreUsersLogic";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

const getUserColumns = (onRemove, canManage) => [
  { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
  { field: "role", headerName: "Rol", width: 150 },
  { field: "fullName", headerName: "Nombre", width: 200 },

  ...(canManage
    ? [
        {
          field: "actions",
          headerName: "Acciones",
          width: 100,
          align: "right",
          headerAlign: "right",
          renderCell: ({ row }) => (
            <button
              onClick={() => onRemove(row)}
              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
              title="Eliminar usuario de esta tienda"
            >
              <DeleteOutlineIcon fontSize="small" />
            </button>
          ),
        },
      ]
    : []),
];

const UserMobileCard = ({ row, canManage, ...props }) => (
  <div className="mb-3 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{row.email}</h3>
        <p className="text-xs text-slate-500">{row.role}</p>
      </div>
      {/* Solo muestra el botón si tiene permisos */}
      {canManage && (
        <button
          onClick={() => props.onRemove && props.onRemove(row)}
          className="text-red-600 p-1"
        >
          <DeleteOutlineIcon fontSize="small" />
        </button>
      )}
    </div>
    {row.fullName && (
      <div className="text-xs text-slate-600">
        <span className="font-medium">Nombre:</span> {row.fullName}
      </div>
    )}
  </div>
);
const StoreUsersTab = ({ token, storeName, storeId, currentUser }) => {
  // Pasamos el currentUser al hook para que bloquee las peticiones API internamente
  const {
    users,
    loading,
    error,
    availableUsers,
    loadingAllUsers,
    loadAvailableUsers,
    handleAssignUser,
    handleRemoveUser,
    grid,
  } = useStoreUsersLogic({ token, storeName, storeId, currentUser });

  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [assignMessage, setAssignMessage] = useState("");

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Definimos permisos basados en el rol
  const isSuperAdmin = currentUser?.role === "SuperAdmin";
  const isMiddifyAdmin = currentUser?.role === "MiddifyAdmin";
  const isTenantAdmin =
    currentUser?.role === "Admin" || currentUser?.role === "admin";

  // El adminTenant y los superiores pueden gestionar
  const canManage = isSuperAdmin || isMiddifyAdmin || isTenantAdmin;
  // El userTenant tiene acceso restringido
  const isRestricted = currentUser?.role === "User";

  // Prepare rows for TableGrid
  const rows = users.map((u) => ({ id: u._id, ...u }));

  // Rendering condicional para userTenant
  if (isRestricted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 grid place-items-center mb-4">
          <ShieldOutlinedIcon />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">
          Acceso Restringido
        </h3>
        <p className="text-sm text-slate-500 text-center max-w-xs mt-2">
          No tienes permisos para ver o gestionar la lista de usuarios de este
          tenant.
        </p>
      </div>
    );
  }
  if (error) {
    return <div className="p-4 text-sm text-red-600">{error}</div>;
  }

  const handleToggleAssign = () => {
    if (!isAssigning) {
      loadAvailableUsers(); // Load only when opening
    }
    setIsAssigning(!isAssigning);
    setAssignMessage("");
    setSelectedUserId("");
  };

  const confirmAssign = async () => {
    if (!selectedUserId) return;
    setAssigningLoading(true);
    const result = await handleAssignUser(selectedUserId);
    setAssignMessage(result.message);
    setAssigningLoading(false);
    if (result.success) {
      setTimeout(() => {
        setIsAssigning(false);
        setSelectedUserId("");
        setAssignMessage("");
      }, 1500);
    }
  };

  const onRemoveClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    await handleRemoveUser(userToDelete.id);
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  if (error) {
    return <div className="p-4 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4 p-1">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Usuarios asignados
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Gestiona el acceso al tenant{" "}
            <span className="font-semibold text-slate-800">{storeName}</span>.
          </p>
        </div>
        {/* Solo mostramos el botón de asignar si tiene permisos */}
        {canManage && (
          <button
            onClick={() => {
              if (!isAssigning) loadAvailableUsers();
              setIsAssigning(!isAssigning);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-catalina-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-catalina-blue-700"
          >
            <PersonAddAlt1OutlinedIcon fontSize="small" />
            {isAssigning ? "Cerrar" : "Asignar Usuario"}
          </button>
        )}
      </header>

      {isAssigning && canManage && (
        <div className="rounded-xl border border-catalina-blue-100 bg-catalina-blue-50 p-4 transition-all animate-in fade-in slide-in-from-top-2">
          <h3 className="mb-3 text-sm font-medium text-catalina-blue-900">
            Asignar nuevo usuario
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 relative">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={loadingAllUsers}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-catalina-blue-500 focus:outline-none focus:ring-1 focus:ring-catalina-blue-500 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingAllUsers
                    ? "Cargando lista..."
                    : "Selecciona un usuario..."}
                </option>
                {availableUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.email} {user.fullName ? `(${user.fullName})` : ""}
                  </option>
                ))}
              </select>
              {loadingAllUsers && (
                <div className="absolute right-8 top-2.5">
                  <CircularProgress size={16} />
                </div>
              )}
            </div>
            <button
              onClick={confirmAssign}
              disabled={!selectedUserId || assigningLoading}
              className="rounded-lg bg-catalina-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-catalina-blue-700 disabled:cursor-not-allowed disabled:opacity-50 min-w-[100px] flex justify-center"
            >
              {assigningLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Confirmar"
              )}
            </button>
          </div>
          {assignMessage && (
            <p
              className={`mt-2 text-sm ${assignMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}
            >
              {assignMessage}
            </p>
          )}
        </div>
      )}

      <TableGrid
        rows={rows}
        columns={getUserColumns((user) => {
          setUserToDelete(user);
          setIsDeleteModalOpen(true);
        }, canManage)}
        loading={loading}
        rowCount={rows.length}
        paginationModel={grid.paginationModel}
        onPaginationModelChange={grid.onPaginationModelChange}
        pageSizeOptions={[5, 10, 25]}
        MobileComponent={UserMobileCard}
        mobileComponentProps={{
          onRemove: (u) => {
            setUserToDelete(u);
            setIsDeleteModalOpen(true);
          },
          canManage,
        }}
      />
      {canManage && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={async () => {
            if (!userToDelete) return;
            setIsDeleting(true);
            await handleRemoveUser(userToDelete.id);
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
          }}
          title="Eliminar usuario"
          message={`¿Estás seguro de que deseas eliminar al usuario ${userToDelete?.email} de esta tienda?`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          isLoading={isDeleting}
          isDestructive={true}
        />
      )}
    </div>
  );
};

StoreUsersTab.propTypes = {
  token: PropTypes.string,
  storeName: PropTypes.string,
  storeId: PropTypes.string,
  currentUser: PropTypes.object,
};

export default StoreUsersTab;
