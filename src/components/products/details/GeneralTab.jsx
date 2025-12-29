import React from 'react';
import PropTypes from 'prop-types';

const GeneralTab = ({ product }) => {
    if (!product) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <p className="text-slate-700"><strong>SKU:</strong> {product.sku}</p>
                <p className="text-slate-700"><strong>Marca:</strong> {product.brand || '-'}</p>
                <p className="text-slate-700"><strong>ID Origen:</strong> {product.idOrigen}</p>
                <p className="text-slate-700"><strong>Estado:</strong> {product.estado}</p>
            </div>
            <div className="space-y-2">
                <p className="text-slate-700"><strong>Stock Actual:</strong> {product.stockNuevo}</p>
                <p className="text-slate-700"><strong>Ingreso Middify:</strong> {new Date(product.ingresoMiddify).toLocaleString()}</p>
                <p className="text-slate-700"><strong>Actualización:</strong> {new Date(product.actualizacion).toLocaleString()}</p>
            </div>
        </div>
    );
};

GeneralTab.propTypes = {
    product: PropTypes.object.isRequired,
};

export default GeneralTab;

