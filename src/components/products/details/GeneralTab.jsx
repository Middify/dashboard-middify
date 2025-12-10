import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import BrandingWatermarkOutlinedIcon from '@mui/icons-material/BrandingWatermarkOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';

const InfoCard = ({ icon, label, value, colorClass = "text-slate-800" }) => (
    <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
        <div className="p-1.5 rounded-full bg-indigo-50 text-indigo-600 shrink-0">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <Typography variant="caption" className="text-slate-500 uppercase tracking-wider font-semibold block mb-0.5 text-[10px]">
                {label}
            </Typography>
            <Typography variant="body2" className={`font-medium ${colorClass} text-xs md:text-sm break-words`}>
                {value || '-'}
            </Typography>
        </div>
    </div>
);

const GeneralTab = ({ product }) => {
    return (
        <div className="space-y-4 md:space-y-0">
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <div className="space-y-2">
                        <Typography variant="h6" className="text-slate-800 font-bold border-b border-slate-100 pb-1 mb-2 text-xs md:text-base">
                            Información Básica
                        </Typography>
                        <div className="grid grid-cols-1 gap-1">
                            <InfoCard 
                                icon={<QrCode2OutlinedIcon fontSize="small" />}
                                label="SKU"
                                value={product.sku}
                            />
                            <InfoCard 
                                icon={<BrandingWatermarkOutlinedIcon fontSize="small" />}
                                label="Marca"
                                value={product.brand}
                            />
                            <InfoCard 
                                icon={<FingerprintOutlinedIcon fontSize="small" />}
                                label="ID Origen"
                                value={product.idOrigen}
                            />
                            <InfoCard 
                                icon={<InfoOutlinedIcon fontSize="small" />}
                                label="Estado Actual"
                                value={product.estado}
                                colorClass="text-indigo-600 font-bold"
                            />
                        </div>
                    </div>
                </Grid>

                <Grid item xs={12} md={6}>
                    <div className="space-y-2">
                        <Typography variant="h6" className="text-slate-800 font-bold border-b border-slate-100 pb-1 mb-2 text-xs md:text-base">
                            Inventario y Fechas
                        </Typography>
                        <div className="grid grid-cols-1 gap-1">
                            <InfoCard 
                                icon={<InventoryOutlinedIcon fontSize="small" />}
                                label="Stock Actual"
                                value={product.stockNuevo}
                                colorClass="text-emerald-600 font-bold text-sm md:text-base"
                            />
                            <InfoCard 
                                icon={<CalendarTodayOutlinedIcon fontSize="small" />}
                                label="Ingreso Middify"
                                value={product.ingresoMiddify ? new Date(product.ingresoMiddify).toLocaleString() : '-'}
                            />
                            <InfoCard 
                                icon={<UpdateOutlinedIcon fontSize="small" />}
                                label="Última Actualización"
                                value={product.actualizacion ? new Date(product.actualizacion).toLocaleString() : '-'}
                            />
                        </div>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

GeneralTab.propTypes = {
    product: PropTypes.object.isRequired,
};

export default GeneralTab;
