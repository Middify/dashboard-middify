import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Checkbox,
    CircularProgress,
    Box,
    Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { toast } from "react-toastify";
import { updateUser } from "../../api/users/updateUser";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const ROLES = ["SuperAdmin", "MiddifyAdmin", "Admin", "User"];

const EditUserModal = ({ open, onClose, user, allTenants, token, onSuccess }) => {
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedTenants, setSelectedTenants] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && user) {
            setSelectedRole(user.role || "User");
            // Map user tenants to the format expected by Autocomplete (full objects)
            // We find the matching tenant objects from allTenants to ensure we have full data
            const userTenantIds = new Set((user.tenant || []).map(t => t.tenantId));
            const initialTenants = allTenants.filter(t => userTenantIds.has(t.tenantId));
            setSelectedTenants(initialTenants);
        }
    }, [open, user, allTenants]);

    const handleSave = async () => {
        if (!user || !token) return;

        setLoading(true);
        try {
            // Prepare changes
            const hasRoleChanged = selectedRole !== user.role;
            const currentTenantIds = new Set((user.tenant || []).map(t => t.tenantId));
            const selectedTenantIds = new Set(selectedTenants.map(t => t.tenantId));

            const tenantsToAssign = selectedTenants
                .filter(t => !currentTenantIds.has(t.tenantId))
                .map(t => ({ tenantId: t.tenantId, tenantName: t.tenantName }));

            const tenantsToRemove = (user.tenant || [])
                .filter(t => !selectedTenantIds.has(t.tenantId))
                .map(t => ({ tenantId: t.tenantId, tenantName: t.tenantName }));

            const hasTenantsChanged = tenantsToAssign.length > 0 || tenantsToRemove.length > 0;

            if (!hasRoleChanged && !hasTenantsChanged) {
                toast.info("No se detectaron cambios");
                onClose();
                return;
            }

            await updateUser({
                token,
                userId: user._id,
                role: hasRoleChanged ? selectedRole : undefined,
                tenantsToAssign: tenantsToAssign.length > 0 ? tenantsToAssign : undefined,
                tenantsToRemove: tenantsToRemove.length > 0 ? tenantsToRemove : undefined
            });

            toast.success("Usuario actualizado correctamente");
            if (onSuccess) onSuccess();
            onClose();

        } catch (error) {
            console.error("Error updating user:", error);
            toast.error(error.message || "Error al actualizar el usuario");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={loading ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ className: "rounded-xl m-4 w-full max-w-lg" }}
            scroll="paper"
        >
            <DialogTitle className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-lg font-semibold text-slate-800">
                    Editar Usuario
                </span>
                {!loading && (
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <CloseIcon fontSize="small" />
                    </button>
                )}
            </DialogTitle>

            <DialogContent className="pt-6 space-y-6">
                {user && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                         <Typography variant="subtitle2" color="textSecondary" className="uppercase tracking-wider text-xs font-semibold mb-1">
                            Usuario Seleccionado
                        </Typography>
                        <Typography variant="body1" fontWeight="600" className="text-slate-800 break-all">
                            {user.email}
                        </Typography>
                        <div className="mt-2 text-xs text-slate-500 font-mono bg-white inline-block px-2 py-0.5 rounded border border-slate-200">
                            ID: {user._id}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="role-select-label">Rol del Usuario</InputLabel>
                        <Select
                            labelId="role-select-label"
                            value={selectedRole}
                            label="Rol del Usuario"
                            onChange={(e) => setSelectedRole(e.target.value)}
                            disabled={loading}
                            className="rounded-lg"
                        >
                            {ROLES.map((role) => (
                                <MenuItem key={role} value={role} className="font-medium">
                                    {role}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Autocomplete
                        multiple
                        id="tenants-autocomplete"
                        options={allTenants}
                        disableCloseOnSelect
                        getOptionLabel={(option) => option.tenantName || option.tenantId}
                        isOptionEqualToValue={(option, value) => option.tenantId === value.tenantId}
                        value={selectedTenants}
                        onChange={(event, newValue) => {
                            setSelectedTenants(newValue);
                        }}
                        disabled={loading}
                        renderOption={(props, option, { selected }) => {
                            const { key, ...otherProps } = props;
                            return (
                                <li key={key} {...otherProps} className={`${otherProps.className} hover:bg-slate-50`}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                        color="primary"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-700">{option.tenantName}</span>
                                        <span className="text-xs text-slate-400">ID: {option.tenantId}</span>
                                    </div>
                                </li>
                            );
                        }}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="Tenants Asignados" 
                                placeholder="Buscar y seleccionar..." 
                                className="rounded-lg"
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => {
                                const { key, ...tagProps } = getTagProps({ index });
                                return (
                                    <Chip
                                        key={key}
                                        variant="outlined"
                                        label={option.tenantName}
                                        size="small"
                                        {...tagProps}
                                        className="bg-slate-50 border-slate-200 text-slate-700 font-medium"
                                    />
                                );
                            })
                        }
                    />
                </div>
            </DialogContent>

            <DialogActions className="border-t border-slate-200 px-6 py-4">
                <Button 
                    onClick={onClose} 
                    color="inherit" 
                    className="normal-case font-semibold"
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    className="bg-indigo-600 hover:bg-indigo-700 normal-case font-semibold rounded-lg"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar Cambios"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

EditUserModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    user: PropTypes.object,
    allTenants: PropTypes.array.isRequired,
    token: PropTypes.string.isRequired,
    onSuccess: PropTypes.func
};

export default EditUserModal;

