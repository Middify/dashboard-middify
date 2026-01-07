import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createUser } from '../api/users/createUser';
import { CircularProgress } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { toast } from 'react-toastify';

const Users = () => {
    const { token, authorizedTenants } = useOutletContext();
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        tenantId: '',
        role: 'user'
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.tenantId) {
            toast.error("Por favor selecciona una tienda (tenant)");
            return;
        }
        setLoading(true);

        try {
            await createUser({
                token,
                ...formData
            });
            toast.success("Usuario creado exitosamente");
            setFormData({
                email: '',
                fullName: '',
                tenantId: '',
                role: 'user'
            });
        } catch (err) {
            toast.error(err.message || "Error al crear el usuario");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 grid place-items-center text-white">
                            <PersonAddIcon />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Crear Nuevo Usuario</h2>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Completa la información para registrar un usuario</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre Completo</label>
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
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
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

                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tienda (Tenant)</label>
                            <select
                                name="tenantId"
                                required
                                value={formData.tenantId}
                                onChange={handleChange}
                                className="text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/30 transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
                                }}
                            >
                                <option value="">Selecciona una tienda</option>
                                {authorizedTenants?.map(tenant => (
                                    <option key={tenant.tenantId} value={tenant.tenantId}>
                                        {tenant.tenantName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rol de Usuario</label>
                            <select
                                name="role"
                                required
                                value={formData.role}
                                onChange={handleChange}
                                className="text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/30 transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
                                }}
                            >
                                <option value="MiddifyAdmin">MiddifyAdmin</option>
                                <option value="MiddifyUser">MiddifyUser</option>
                                <option value="SuperAdmin">SuperAdmin</option>
                                <option value="Admin">Admin</option>
                                <option value="User">User</option>
                            </select>
                        </div>
                    </div>

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

export default Users;

