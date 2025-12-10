import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Typography, Paper } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';

const StatusTab = ({ history }) => {
    const sortedHistory = useMemo(() => {
        if (!history) return [];
        return [...history].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }, [history]);

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <HistoryToggleOffIcon sx={{ fontSize: 40, mb: 1.5, opacity: 0.5 }} />
                <Typography variant="body2">No hay cambios de estado registrados.</Typography>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {sortedHistory.map((log, index) => {
                const isLast = index === sortedHistory.length - 1;
                const isFirst = index === 0;

                return (
                    <div key={index} className="flex gap-2 md:gap-3">
                        {/* Date Column - Solo desktop */}
                        <div className="hidden md:flex flex-none w-28 text-right pt-2.5">
                            <div className="w-full">
                                <div className="font-mono text-xs font-semibold text-slate-500 leading-tight">
                                    {new Date(log.fecha).toLocaleDateString()}
                                </div>
                                <div className="font-mono text-[10px] text-slate-400 leading-tight mt-0.5">
                                    {new Date(log.fecha).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative flex flex-col items-center">
                            <div className={`w-0.5 h-3 ${isFirst ? 'bg-transparent' : 'bg-slate-200'}`} />
                            <div 
                                className={`
                                    z-10 flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full border-2 shrink-0
                                    ${isFirst 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                                        : 'bg-white border-slate-300 text-slate-400'}
                                `}
                            >
                                <EventAvailableIcon sx={{ fontSize: { xs: '12px', md: '14px' } }} />
                            </div>
                            <div className={`w-0.5 flex-1 ${isLast ? 'bg-transparent' : 'bg-slate-200'}`} style={{ minHeight: '1rem' }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-3 md:pb-4 min-w-0">
                            <Paper 
                                elevation={0} 
                                className={`
                                    p-2 md:p-3 border transition-all rounded-lg relative
                                    ${isFirst 
                                        ? 'bg-white border-indigo-100 shadow-sm' 
                                        : 'bg-slate-50 border-slate-200 hover:bg-white'}
                                `}
                            >
                                {/* Arrow */}
                                <div 
                                    className={`
                                        absolute top-2.5 md:top-3 -left-1.5 w-3 h-3 border-l border-b transform rotate-45
                                        ${isFirst 
                                            ? 'bg-white border-indigo-100' 
                                            : 'bg-slate-50 border-slate-200'}
                                    `}
                                />

                                {/* Fecha móvil */}
                                <div className="md:hidden mb-1.5">
                                    <div className="font-mono text-[10px] font-semibold text-slate-500">
                                        {new Date(log.fecha).toLocaleDateString()}
                                    </div>
                                    <div className="font-mono text-[9px] text-slate-400">
                                        {new Date(log.fecha).toLocaleTimeString()}
                                    </div>
                                </div>

                                <Typography 
                                    variant="body2" 
                                    sx={{
                                        fontWeight: 600,
                                        color: '#1e293b',
                                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                                        lineHeight: { xs: '1.25rem', md: '1.375rem' },
                                        mb: 0.75
                                    }}
                                >
                                    {log.mensaje}
                                </Typography>
                                <div className="flex items-center gap-1">
                                    <PersonOutlineIcon sx={{ fontSize: '12px', color: '#94a3b8' }} />
                                    <Typography 
                                        variant="caption" 
                                        sx={{
                                            fontSize: { xs: '0.65rem', md: '0.75rem' },
                                            color: '#64748b',
                                            fontWeight: 500
                                        }}
                                    >
                                        {log.usuario || 'Sistema'}
                                    </Typography>
                                </div>
                            </Paper>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

StatusTab.propTypes = {
    history: PropTypes.array,
};

export default StatusTab;
