import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { createUser } from "../../api/users/createUser";
import { CircularProgress } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { toast } from "react-toastify";

const CreateUsers = ({
  token,
  currentUser,
  authorizedTenants = [],
  allTenants = [],
}) => {
  const getTenantsDisponibles = () => {
    const role = currentUser?.role;

    if (role === "SuperAdmin" || role === "MiddifyAdmin") {
      return allTenants && allTenants.length > 0
        ? allTenants
        : authorizedTenants || [];
    }
    return authorizedTenants || [];
  };

  const tenantsParaMostrar = getTenantsDisponibles();

  const getRolesPermitidos = (role) => {
    switch (role) {
      case "SuperAdmin":
        return [
          { value: "SuperAdmin", label: "SuperAdmin Middify" },
          { value: "MiddifyAdmin", label: "MiddifyAdmin" },
          { value: "Admin", label: "AdminTenant" },
          { value: "User", label: "UserTenant" },
        ];
      case "MiddifyAdmin":
        return [
          { value: "MiddifyAdmin", label: "MiddifyAdmin" },
          { value: "Admin", label: "AdminTenant" },
          { value: "User", label: "UserTenant" },
        ];
      case "Admin":
      case "admin":
        return [
          { value: "Admin", label: "AdminTenant" },
          { value: "User", label: "UserTenant" },
        ];
      default:
        return [];
    }
  };

  const rolesPermitidos = getRolesPermitidos(currentUser?.role);

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    tenantId: "",
    role: rolesPermitidos[0]?.value || "",
  });

  const [loading, setLoading] = useState(false);

  // Detectamos si el rol que vamos a crear es de acceso global
  const isGlobalRole =
    formData.role === "SuperAdmin" || formData.role === "MiddifyAdmin";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🌟 AHORA SIEMPRE ES OBLIGATORIO PARA SATISFACER A COGNITO
    if (!formData.tenantId) {
      toast.error("Por favor selecciona una tienda base (tenant)");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };

      // 🌟 LE PASAMOS UN ID REAL A COGNITO (EL QUE ELIGIÓ EN EL SELECTOR)
      // Ya no forzamos "ALL" en el tenantId principal para que Cognito no falle.
      const selectedT = tenantsParaMostrar.find(
        (t) => t.tenantId === formData.tenantId,
      );

      // LÓGICA MULTI-TENANT PARA MONGODB
      if (isGlobalRole) {
        // En BD le guardamos la lista completa de tenants por si acaso,
        // aunque el backend ya sabe que es global por su rol.
        payload.tenant = tenantsParaMostrar.map((t) => ({
          tenantId: t.tenantId,
          tenantName: t.tenantName,
        }));
      } else {
        if (selectedT) {
          payload.tenant = [
            { tenantId: selectedT.tenantId, tenantName: selectedT.tenantName },
          ];
        }
      }

      await createUser({ token, ...payload });
      toast.success("Usuario creado exitosamente");

      setFormData({
        email: "",
        fullName: "",
        tenantId: "",
        role: rolesPermitidos[0]?.value || "",
      });
    } catch (err) {
      toast.error(err.message || "Error al crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rolesPermitidos.length > 0 && !formData.role) {
      setFormData((prev) => ({ ...prev, role: rolesPermitidos[0].value }));
    }
  }, [rolesPermitidos, formData.role]);

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 grid place-items-center text-white">
              <PersonAddIcon />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Crear Nuevo Usuario
              </h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Completa la información para registrar un usuario
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ej: Juan Pablo"
                className="text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/30 transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="usuario@ejemplo.com"
                className="text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/30 transition-all"
              />
            </div>

            {/* SELECTOR DE ROL */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Rol de Usuario
              </label>
              <select
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/30 transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                }}
              >
                {rolesPermitidos?.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* SELECTOR DE TIENDA INTELIGENTE */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {isGlobalRole ? "Tienda Base (Requerida)" : "Tienda (Tenant)"}
              </label>
              <select
                name="tenantId"
                required
                value={formData.tenantId}
                onChange={handleChange}
                className="text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/30 transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                }}
              >
                <option value="">Selecciona una tienda</option>
                {tenantsParaMostrar?.map((tenant) => (
                  <option key={tenant.tenantId} value={tenant.tenantId}>
                    {tenant.tenantName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* 🌟 MENSAJE ACLARATORIO PARA UX */}
          {isGlobalRole && (
            <div className="flex items-start gap-2 bg-indigo-50 text-indigo-700 p-3 rounded-xl text-sm font-medium border border-indigo-100">
              <InfoOutlinedIcon fontSize="small" className="mt-0.5 shrink-0" />
              <p>
                Cognito requiere asignar una tienda base para el registro. Sin
                embargo, al tener el rol <strong>{formData.role}</strong>, este
                usuario tendrá{" "}
                <strong>acceso global a todas las tiendas</strong> de la base de
                datos automáticamente.
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 min-w-[160px] justify-center"
            >
              {loading ? (
                <CircularProgress size={20} thickness={6} color="inherit" />
              ) : (
                <>
                  <PersonAddIcon fontSize="small" />
                  Crear Usuario
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUsers;
