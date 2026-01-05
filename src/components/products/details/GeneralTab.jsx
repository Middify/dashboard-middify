import React from 'react';
import PropTypes from 'prop-types';

const GeneralTab = ({ product }) => {
    if (!product) return null;

    const getPrice = (price) => {
        if (!price) return '-';
        if (typeof price === 'object') {
            const precio = price.precioVta || price.PrecioBol;
            return precio ? `$${parseFloat(precio).toLocaleString('es-ES')}` : '-';
        }
        return typeof price === 'number' ? `$${price.toLocaleString('es-ES')}` : String(price);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <p className="text-slate-700"><strong>SKU:</strong> {product.sku || '-'}</p>
                <p className="text-slate-700"><strong>Marca:</strong> {product.brand || '-'}</p>
                <p className="text-slate-700"><strong>ID Origen:</strong> {product.idOrigen || '-'}</p>
                <p className="text-slate-700"><strong>Estado:</strong> {product.estado || '-'}</p>
                {product.price && (
                    <p className="text-slate-700"><strong>Precio:</strong> {getPrice(product.price)}</p>
                )}
            </div>
            <div className="space-y-2">
                <p className="text-slate-700"><strong>Stock Actual:</strong> {product.stockNuevo || product.quantity || '-'}</p>
                <p className="text-slate-700"><strong>Ingreso Middify:</strong> {product.ingresoMiddify || product.createdDate || '-'}</p>
                <p className="text-slate-700"><strong>Actualización:</strong> {product.actualizacion || product.updatedDate || '-'}</p>
            </div>
        </div>
    );
};

GeneralTab.propTypes = {
    product: PropTypes.object.isRequired,
};

export default GeneralTab;

