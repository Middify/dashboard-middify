import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Box
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TableChartIcon from '@mui/icons-material/TableChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-xl ring-1 ring-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    {new Date(data.fecha).toLocaleString()}
                </p>
                
                <div className="space-y-3 mb-3">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-600 text-sm font-medium">Stock Anterior:</span>
                        <span className="font-mono font-bold text-slate-500">{data.stockAnterior}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-600 text-sm font-medium">Stock Nuevo:</span>
                        <span className="font-mono font-bold text-indigo-600 text-lg">{data.stockNuevo}</span>
                    </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1">
                    <div className="flex items-center gap-2">
                        <Chip 
                            label={data.operacion} 
                            size="small" 
                            variant="outlined"
                            className="h-5 text-[10px] font-bold uppercase tracking-wider border-slate-200"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <PersonOutlineIcon style={{ fontSize: 14 }} />
                        <span className="text-xs font-medium">{data.usuario || 'Sistema'}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const StockTab = ({ history }) => {
    const [viewMode, setViewMode] = useState('table');

    // Ordenar historial: Tabla (Reciente -> Antiguo), Gráfico (Antiguo -> Reciente)
    const sortedHistory = useMemo(() => {
        if (!history) return [];
        return [...history].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }, [history]);

    const chartData = useMemo(() => {
        if (!sortedHistory || sortedHistory.length === 0) return [];
        // Invertir para mostrar cronológicamente (antiguo -> reciente)
        const reversed = [...sortedHistory].reverse();
        // Asegurar que los datos tengan el formato correcto
        return reversed.map(item => ({
            fecha: item.fecha || item.date || new Date().toISOString(),
            stockAnterior: typeof item.stockAnterior === 'number' ? item.stockAnterior : parseInt(item.stockAnterior) || 0,
            stockNuevo: typeof item.stockNuevo === 'number' ? item.stockNuevo : parseInt(item.stockNuevo) || 0,
            operacion: item.operacion || item.operation || 'Desconocido',
            usuario: item.usuario || item.user || 'Sistema'
        }));
    }, [sortedHistory]);

    const handleViewChange = (event, nextView) => {
        if (nextView !== null) {
            setViewMode(nextView);
        }
    };

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <TrendingFlatIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography>No hay movimientos de stock registrados.</Typography>
            </div>
        );
    }

    const getTrendIcon = (prev, current) => {
        const diff = current - prev;
        if (diff > 0) return <TrendingUpIcon fontSize="small" className="text-emerald-500" />;
        if (diff < 0) return <TrendingDownIcon fontSize="small" className="text-red-500" />;
        return <TrendingFlatIcon fontSize="small" className="text-slate-400" />;
    };

    return (
        <div className="space-y-2 md:space-y-4">
            <div className="flex justify-end">
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewChange}
                    aria-label="view mode"
                    size="small"
                    sx={{ 
                        bgcolor: 'white',
                        '& .MuiToggleButton-root': {
                            border: '1px solid #e2e8f0',
                            px: { xs: 1.25, md: 1.5 },
                            py: 0.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: { xs: '0.7rem', md: '0.75rem' },
                            color: '#64748b',
                            '&.Mui-selected': {
                                bgcolor: '#eff6ff',
                                color: '#3b82f6',
                                borderColor: '#bfdbfe',
                                '&:hover': { bgcolor: '#dbeafe' }
                            },
                            '& .MuiSvgIcon-root': {
                                fontSize: { xs: '14px', md: '16px' },
                                marginRight: { xs: '3px', md: '6px' }
                            }
                        }
                    }}
                >
                    <ToggleButton value="table" aria-label="table view">
                        <TableChartIcon fontSize="small" />
                        <span className="hidden sm:inline ml-1">Tabla</span>
                    </ToggleButton>
                    <ToggleButton value="chart" aria-label="chart view">
                        <ShowChartIcon fontSize="small" />
                        <span className="hidden sm:inline ml-1">Gráfico</span>
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>

            {viewMode === 'table' ? (
                <>
                    {/* Vista móvil: Cards */}
                    <div className="block md:hidden space-y-1.5">
                        {sortedHistory.map((log, index) => {
                            const stockDiff = log.stockNuevo - log.stockAnterior;
                            return (
                                <div key={index} className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="text-xs text-slate-500 font-medium mb-1">
                                                {new Date(log.fecha).toLocaleString()}
                                            </div>
                                            <Chip 
                                                label={log.operacion} 
                                                size="small" 
                                                variant="outlined"
                                                className="capitalize font-bold bg-slate-50 border-slate-200 text-slate-700 text-[10px] h-5"
                                            />
                                        </div>
                                        {getTrendIcon(log.stockAnterior, log.stockNuevo)}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Anterior</div>
                                            <div className="text-slate-500 font-mono text-sm">{log.stockAnterior}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Nuevo</div>
                                            <div className={`font-mono font-bold text-sm ${stockDiff > 0 ? 'text-emerald-600' : stockDiff < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                                {log.stockNuevo}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
                                            {log.usuario ? log.usuario.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <span className="text-xs font-medium text-slate-600">{log.usuario || 'Sistema'}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Vista escritorio: Tabla */}
                    <div className="hidden md:block">
                        <TableContainer component={Paper} elevation={0} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                            <Table sx={{ minWidth: 650 }} aria-label="historial stock table">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                        <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Fecha</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Operación</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Anterior</TableCell>
                                        <TableCell align="center" sx={{ width: 50 }}></TableCell>
                                        <TableCell align="left" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Nuevo</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Usuario</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedHistory.map((log, index) => {
                                        const stockDiff = log.stockNuevo - log.stockAnterior;
                                        return (
                                            <TableRow
                                                key={index}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#f8fafc' } }}
                                            >
                                                <TableCell component="th" scope="row" className="text-slate-600 font-medium">
                                                    {new Date(log.fecha).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={log.operacion} 
                                                        size="small" 
                                                        variant="outlined"
                                                        className="capitalize font-bold bg-slate-50 border-slate-200 text-slate-700"
                                                    />
                                                </TableCell>
                                                <TableCell align="right" className="text-slate-500 font-mono">
                                                    {log.stockAnterior}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {getTrendIcon(log.stockAnterior, log.stockNuevo)}
                                                </TableCell>
                                                <TableCell align="left">
                                                    <span className={`font-mono font-bold text-base ${stockDiff > 0 ? 'text-emerald-600' : stockDiff < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                                        {log.stockNuevo}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
                                                            {log.usuario ? log.usuario.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <span className="text-sm font-medium">{log.usuario || 'Sistema'}</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </>
            ) : (
                <div className="h-[400px] md:h-[500px] w-full bg-white rounded-xl md:rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 10,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="fecha" 
                                tickFormatter={(date) => {
                                    if (!date) return '';
                                    try {
                                        return new Date(date).toLocaleDateString('es-ES', { 
                                            day: '2-digit', 
                                            month: '2-digit' 
                                        });
                                    } catch {
                                        return date;
                                    }
                                }}
                                stroke="#94a3b8"
                                tick={{ fontSize: 12 }}
                                tickMargin={10}
                            />
                            <YAxis 
                                stroke="#94a3b8"
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                            
                            <Line 
                                type="monotone" 
                                dataKey="stockAnterior" 
                                name="Stock Anterior"
                                stroke="#94a3b8" 
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ fill: '#94a3b8', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="stockNuevo" 
                                name="Stock Nuevo"
                                stroke="#4f46e5" 
                                strokeWidth={3}
                                dot={{ fill: '#4f46e5', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

StockTab.propTypes = {
    history: PropTypes.array,
};

export default StockTab;