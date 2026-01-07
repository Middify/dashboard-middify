import React, { useState } from 'react';
import PropTypes from 'prop-types';
import EditDetail from './EditDetail';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Tooltip, IconButton } from '@mui/material';

const GeneralTab = ({ product, token, onRefresh }) => {
    const [isEditing, setIsEditing] = useState(false);

    if (!product) return null;

    const getPrice = (price) => {
        if (!price) return '-';
        if (typeof price === 'object') {
            const precio = price.precioVta || price.PrecioBol;
            return precio ? `$${parseFloat(precio).toLocaleString('es-ES')}` : '-';
        }
        return typeof price === 'number' ? `$${price.toLocaleString('es-ES')}` : String(price);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        const rawDate = date?.$date || date;
        const d = new Date(rawDate);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isEditing) {
        return (
            <EditDetail 
                product={product} 
                token={token} 
                onCancel={() => setIsEditing(false)} 
                onSave={() => {
                    setIsEditing(false);
                    onRefresh();
                }}
            />
        );
    }

    return (
        <div className="relative">
            {/* Edit Button */}
            <div className="absolute -top-1 right-0 z-10">
                <Tooltip title="Editar detalles">
                    <IconButton 
                        onClick={() => setIsEditing(true)}
                        className="bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 text-slate-400 hover:text-indigo-600 shadow-sm"
                        size="small"
                    >
                        <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-2">
                <div className="space-y-3">
                    <div className="flex flex-col border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre del Producto</span>
                        <span className="text-sm font-semibold text-slate-700">{product.name || '-'}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SKU</span>
                        <span className="text-sm font-mono font-bold text-slate-700">{product.sku || '-'}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código de Barras (Barcode)</span>
                        <span className="text-sm font-mono text-slate-600">{product.barcode || '-'}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado Actual</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit mt-1 ${
                            (product.state || product.estado || '').toLowerCase().includes('active') || (product.state || product.estado || '').toLowerCase().includes('procesada')
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                            {product.state || product.estado || '-'}
                        </span>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <div className="flex flex-col border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precio de Venta</span>
                        <span className="text-lg font-black text-indigo-600 font-mono">{getPrice(product.price)}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Disponible</span>
                        <span className="text-sm font-bold text-slate-700">{product.quantity ?? product.stockNuevo ?? '0'}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha de Creación</span>
                        <span className="text-sm font-medium text-slate-600">{formatDate(product.createdDate || product.ingresoMiddify)}</span>
                    </div>
                    <div className="flex flex-col border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Última Actualización</span>
                        <span className="text-sm font-medium text-slate-600">{formatDate(product.updatedAt || product.updatedDate || product.actualizacion)}</span>
                    </div>
                </div>

                {(product.message || (product.extras && product.extras.log)) && (
                    <div className="col-span-1 md:col-span-2 mt-4 space-y-4">
                        {product.message && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Mensaje del Sistema</p>
                                <p className="text-sm text-amber-800 font-medium">{product.message}</p>
                            </div>
                        )}
                        {product.extras && product.extras.log && (
                            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Log de Operación</p>
                                <pre className="text-[11px] text-emerald-400 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                                    {typeof product.extras.log === 'object' ? JSON.stringify(product.extras.log, null, 2) : product.extras.log}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

GeneralTab.propTypes = {
    product: PropTypes.object.isRequired,
    token: PropTypes.string,
    onRefresh: PropTypes.func
};

export default GeneralTab;
