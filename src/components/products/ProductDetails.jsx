import React, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import {
    CircularProgress,
    Box,
    Typography,
    Tab,
    Tabs,
    Paper,
    IconButton,
    Chip
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getProductDetails } from "../../api/products/getProductDetails";
import GeneralTab from './details/GeneralTab';
import StockTab from './details/StockTab';
import StatusTab from './details/StatusTab';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';

const TABS = [
    { id: "general", label: "Detalle General", icon: <Inventory2OutlinedIcon /> },
    { id: "stock", label: "Historial de Stock", icon: <TimelineOutlinedIcon /> },
    { id: "status", label: "Historial de Estados", icon: <HistoryOutlinedIcon /> },
];

const ProductDetails = ({ productId, token, onClose }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(TABS[0].id);

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!productId || !token) return;

            try {
                setLoading(true);
                setError(null);
                const data = await getProductDetails(token, productId);
                setProduct(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId, token]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading) return (
        <Box className="flex justify-center items-center min-h-[50vh]">
            <CircularProgress size={40} thickness={4} className="text-indigo-500" />
        </Box>
    );

    if (error) return (
        <Box className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm">
            <strong>Error:</strong> {error}
        </Box>
    );

    if (!product) return (
        <Box className="px-4 py-8 text-center text-slate-500">
            <Typography>No se encontró el producto o no se ha seleccionado ninguno.</Typography>
            <button onClick={onClose} className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium underline">
                Volver
            </button>
        </Box>
    );


    return (
        <Box className="flex mt-4 mb-4 flex-col w-full md:h-[calc(100vh-8rem)] md:max-w-7xl md:mx-auto">
            {/* Header */}
            <Box className="fixed top-14 left-0 right-0 z-40 md:relative md:top-0 md:left-auto md:right-auto md:z-auto bg-white border-b border-slate-200 md:border-b-0 md:bg-transparent md:mb-4">
                <Box className="flex items-center gap-2 md:gap-3 px-4 md:px-0 py-3 md:py-0 pt-4 md:pt-0 justify-start max-w-7xl mx-auto">
                    <IconButton 
                        onClick={onClose} 
                        className="bg-white border border-slate-200 w-9 h-9 md:w-11 md:h-11 rounded-[10px] shadow-sm hover:bg-slate-50 hover:border-slate-300"
                    >
                        <ArrowBackIcon className="text-[18px] md:text-[20px]" />
                    </IconButton>
                    <Box className="flex-1 min-w-0">
                        <Box className="flex items-center gap-1.5 md:gap-2 mb-0.5 flex-wrap">
                            <Typography className="font-bold text-slate-800 text-sm sm:text-base md:text-xl leading-tight sm:leading-tight md:leading-normal overflow-hidden text-ellipsis whitespace-nowrap">
                                {product.name}
                            </Typography>
                            <Chip 
                                label={product.state === 'active' ? 'Activo' : product.estado || 'Desconocido'} 
                                size="small" 
                                className={`font-bold uppercase text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] tracking-wider h-[18px] sm:h-5 md:h-[22px] px-1 md:px-1 border ${
                                    product.state === 'active' 
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                            />
                        </Box>
                        <Box className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500">
                            <span className="font-mono bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                ID: {product._id || productId}
                            </span>
                            <span className="hidden sm:inline text-slate-300">•</span>
                            <span className="font-medium truncate">{product.brand || 'Sin Marca'}</span>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box className="h-[5.5rem] md:hidden" />

            {/* Tabs */}
            <Box className="fixed top-[calc(4rem+5.5rem)] left-0 right-0 z-30 md:static md:top-auto md:left-auto md:right-auto md:z-auto bg-white/98 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none border-b border-slate-200 md:border-b-0 w-full md:w-auto">
                <Box className="px-1 md:px-2 py-1 md:py-1 bg-white flex justify-center w-full min-h-[3rem] md:min-h-0">
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange} 
                        variant="scrollable" 
                        scrollButtons="auto"
                        className="w-full md:w-auto [&_.MuiTabs-indicator]:hidden [&_.MuiTabs-flexContainer]:gap-1 sm:[&_.MuiTabs-flexContainer]:gap-1.5 md:[&_.MuiTabs-flexContainer]:gap-2 [&_.MuiTabs-flexContainer]:justify-start md:[&_.MuiTabs-flexContainer]:justify-center [&_.MuiTabs-scrollButtons]:flex md:[&_.MuiTabs-scrollButtons]:hidden"
                    >
                        {TABS.map((tab) => (
                            <Tab 
                                key={tab.id} 
                                label={<span className="hidden sm:inline">{tab.label}</span>}
                                value={tab.id} 
                                icon={tab.icon} 
                                iconPosition="start"
                                className="normal-case font-semibold text-[0.7rem] sm:text-xs md:text-sm min-h-8 sm:min-h-9 md:min-h-[38px] px-2 sm:px-2.5 md:px-3 py-1 md:py-1 rounded-[10px] text-slate-600 border border-transparent [&.Mui-selected]:text-indigo-600 [&.Mui-selected]:bg-indigo-50 [&.Mui-selected]:border-indigo-200 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-200"
                                disableRipple
                            />
                        ))}
                    </Tabs>
                </Box>
            </Box>

            <Box className="h-[4rem] md:hidden" />

            {/* Content */}
            <Paper 
                elevation={0} 
                className="rounded-none md:rounded-3xl border-0 md:border border-slate-200 overflow-hidden bg-white shadow-none md:shadow-md flex flex-col mx-0 md:mx-auto w-full"
            >
                <Box className="overflow-y-auto flex-1 max-h-[calc(100vh-4rem-3.5rem-2.5rem)] md:max-h-[calc(100vh-8rem-4rem-3.5rem)] bg-slate-50 px-2 md:px-3 lg:px-4 py-2 md:py-3 lg:py-4">
                    <Box className="w-full mx-auto">
                        {activeTab === "general" && <GeneralTab product={product} />}
                        {activeTab === "stock" && <StockTab history={product.historialStock} />}
                        {activeTab === "status" && <StatusTab history={product.historialEstados} />}
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

ProductDetails.propTypes = {
    productId: PropTypes.string,
    token: PropTypes.string,
    onClose: PropTypes.func,
};

export default ProductDetails;