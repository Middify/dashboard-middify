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

    // Estados de carga y error simplificados
    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress size={40} thickness={4} sx={{ color: '#6366f1' }} />
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

    // Estilos reutilizables
    const styles = {
        iconButton: {
            bgcolor: 'white',
            border: '1px solid #e2e8f0',
            width: { xs: 36, md: 44 },
            height: { xs: 36, md: 44 },
            borderRadius: '10px',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
        },
        chip: {
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: { xs: '0.55rem', sm: '0.6rem', md: '0.65rem' },
            letterSpacing: '0.05em',
            height: { xs: 18, sm: 20, md: 22 },
            px: { xs: 0.75, md: 1 },
            bgcolor: product.state === 'active' ? '#dcfce7' : '#f1f5f9',
            color: product.state === 'active' ? '#166534' : '#64748b',
            border: '1px solid',
            borderColor: product.state === 'active' ? '#bbf7d0' : '#e2e8f0'
        },
        title: {
            fontWeight: 700,
            color: '#1e293b',
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
            lineHeight: { xs: '1.25rem', md: '1.5rem' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        tabContainer: {
            position: { xs: 'fixed', md: 'static' },
            top: { xs: 'calc(4rem + 5.5rem)', md: 'auto' },
            left: 0,
            right: 0,
            zIndex: { xs: 30, md: 'auto' },
            bgcolor: { xs: 'rgba(255, 255, 255, 0.98)', md: 'transparent' },
            backdropFilter: { xs: 'blur(8px)', md: 'none' },
            borderBottom: { xs: '1px solid #f1f5f9', md: 'none' },
            width: { xs: '100%', md: 'auto' }
        },
        tabs: {
            minHeight: 'auto',
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTabs-flexContainer': {
                gap: { xs: 0.75, sm: 1, md: 1.5 },
                justifyContent: { xs: 'flex-start', md: 'center' }
            }
        },
        tab: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
            minHeight: { xs: 32, sm: 36, md: 38 },
            px: { xs: 1, sm: 1.25, md: 1.5 },
            py: { xs: 0.375, md: 0.5 },
            borderRadius: '10px',
            color: '#64748b',
            border: '1px solid transparent',
            '&.Mui-selected': {
                color: '#4f46e5',
                backgroundColor: '#eef2ff',
                borderColor: '#e0e7ff',
            },
            '&:hover:not(.Mui-selected)': {
                backgroundColor: '#f8fafc',
                color: '#334155',
                borderColor: '#e2e8f0'
            }
        },
        contentContainer: {
            overflowY: 'auto',
            flex: 1,
            maxHeight: { xs: 'calc(100vh - 4rem - 3.5rem - 2.5rem)', md: 'calc(100vh - 8rem - 4rem - 3.5rem)' },
            bgcolor: '#fafbfc',
            px: { xs: 2, md: 3, lg: 4 },
            py: { xs: 2, md: 3, lg: 4 }
        }
    };

    return (
        <Box className="flex mt-4 mb-4 flex-col w-full md:h-[calc(100vh-8rem)] md:max-w-7xl md:mx-auto">
            {/* Header */}
            <Box className="fixed top-14 left-0 right-0 z-40 md:relative md:top-0 md:left-auto md:right-auto md:z-auto bg-white border-b border-slate-200 md:border-b-0 md:bg-transparent md:mb-4">
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 2, md: 3 },  
                    px: { xs: 4, md: 0 }, 
                    py: { xs: 3, md: 0 },
                    pt: { xs: 4, md: 0 },
                    justifyContent: 'flex-start',
                    maxWidth: { md: '7xl' },
                    mx: { md: 'auto' }
                }}>
                    <IconButton onClick={onClose} sx={styles.iconButton}>
                        <ArrowBackIcon sx={{ fontSize: { xs: '18px', md: '20px' } }} />
                    </IconButton>
                    <Box className="flex-1 min-w-0">
                        <Box className="flex items-center gap-1.5 md:gap-2 mb-0.5 flex-wrap">
                            <Typography sx={styles.title}>
                                {product.name}
                            </Typography>
                            <Chip label={product.state === 'active' ? 'Activo' : product.estado || 'Desconocido'} 
                                  size="small" sx={styles.chip} />
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
            <Box sx={styles.tabContainer}>
                <Box sx={{ 
                    px: { xs: 1, md: 2 }, 
                    py: { xs: 0.75, md: 1 }, 
                    bgcolor: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    minHeight: { xs: '3rem', md: 'auto' }
                }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange} 
                        variant="scrollable" 
                        scrollButtons="auto"
                        sx={{
                            ...styles.tabs,
                            width: { xs: '100%', md: 'auto' },
                            '& .MuiTabs-scrollButtons': {
                                display: { xs: 'flex', md: 'none' }
                            }
                        }}
                    >
                        {TABS.map((tab) => (
                            <Tab 
                                key={tab.id} 
                                label={<span className="hidden sm:inline">{tab.label}</span>}
                                value={tab.id} 
                                icon={tab.icon} 
                                iconPosition="start"
                                sx={styles.tab}
                                disableRipple
                            />
                        ))}
                    </Tabs>
                </Box>
            </Box>

            <Box className="h-[4rem] md:hidden" />

            {/* Content */}
            <Paper elevation={0} sx={{
                borderRadius: { xs: 0, md: '24px' },
                border: { xs: 'none', md: '1px solid #e2e8f0' },
                overflow: 'hidden',
                bgcolor: 'white',
                boxShadow: { xs: 'none', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                mx: { xs: 0, md: 'auto' },
                width: { xs: '100%', md: '100%' }
            }}>
                <Box sx={styles.contentContainer}>
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