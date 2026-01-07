import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { updatePrice } from '../../../api/price/updatePrice';
import { CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const EditDetail = ({ product, token, onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        name: product.name || '',
        price: typeof product.price === 'object' ? (product.price?.precioVta || product.price?.PrecioBol) : product.price || '',
        sku: product.sku || '',
        quantity: product.quantity ?? product.stockNuevo ?? '',
        barcode: product.barcode || '',
        externalId: product.externalId || product.idOrigen || '',
        brand: product.brand || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await updatePrice({
                token,
                sku: product.sku,
                price: formData.price,
            });
            onSave();
        } catch (err) {
            setError(err.message || 'Error al actualizar el precio');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-4">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre del Producto</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SKU (No editable)</label>
                        <input
                            type="text"
                            value={formData.sku}
                            disabled
                            className="text-sm font-mono font-bold text-slate-400 border border-slate-100 rounded-lg px-3 py-2 bg-slate-50"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Código de Barras</label>
                        <input
                            type="text"
                            name="barcode"
                            value={formData.barcode}
                            onChange={handleChange}
                            className="text-sm font-mono text-slate-600 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1 font-black">Precio de Venta</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 font-bold">$</span>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full text-lg font-black text-indigo-600 font-mono border border-indigo-200 rounded-lg pl-7 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-indigo-50/30"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stock Disponible</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="text-sm font-bold text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
                    {error}
                </div>
            )}

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                    <CloseIcon fontSize="small" />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all disabled:opacity-50 min-w-[120px] justify-center"
                >
                    {loading ? (
                        <CircularProgress size={18} thickness={6} color="inherit" />
                    ) : (
                        <>
                            <CheckIcon fontSize="small" />
                            Guardar Cambios
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

EditDetail.propTypes = {
    product: PropTypes.object.isRequired,
    token: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
};

export default EditDetail;

