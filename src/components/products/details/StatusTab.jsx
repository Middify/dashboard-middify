import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Typography, Paper, Box } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';

const StatusTab = ({ history }) => {
    // Ordenar historial: Reciente -> Antiguo
    const sortedHistory = useMemo(() => {
        if (!history) return [];
        return [...history].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }, [history]);

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <HistoryToggleOffIcon className="text-[48px] mb-2 opacity-50" />
                <Typography>No hay cambios de estado registrados.</Typography>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-4">
            {sortedHistory.map((log, index) => {
                const isLast = index === sortedHistory.length - 1;
                const isFirst = index === 0;

                return (
                    <div key={index} className="flex gap-4">
                        {/* Date/Time Column */}
                        <div className="flex-none w-24 md:w-32 text-right pt-3">
                            <div className="font-mono text-xs font-semibold text-slate-500">
                                {new Date(log.fecha).toLocaleDateString()}
                            </div>
                            <div className="font-mono text-xs text-slate-400">
                                {new Date(log.fecha).toLocaleTimeString()}
                            </div>
                        </div>

                        {/* Timeline Line & Dot */}
                        <div className="relative flex flex-col items-center">
                            {/* Top Line */}
                            <div 
                                className={`w-0.5 grow-0 h-4 ${isFirst ? 'bg-transparent' : 'bg-slate-200'}`} 
                            />
                            
                            {/* Dot */}
                            <div 
                                className={`
                                    z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 
                                    ${isFirst 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                                        : 'bg-white border-slate-300 text-slate-400'}
                                `}
                            >
                                <EventAvailableIcon fontSize="small" />
                            </div>

                            {/* Bottom Line */}
                            <div 
                                className={`w-0.5 grow ${isLast ? 'bg-transparent' : 'bg-slate-200'}`} 
                                style={{ minHeight: '2rem' }}
                            />
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 pb-8">
                            <Paper 
                                elevation={0} 
                                className={`
                                    p-4 border transition-all rounded-xl relative
                                    ${isFirst 
                                        ? 'bg-white border-indigo-100 shadow-sm ring-1 ring-indigo-50' 
                                        : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-sm'}
                                `}
                            >
                                {/* Arrow pointing left */}
                                <div 
                                    className={`
                                        absolute top-4 -left-1.5 w-3 h-3 border-l border-b transform rotate-45
                                        ${isFirst 
                                            ? 'bg-white border-indigo-100' 
                                            : 'bg-slate-50 border-slate-200 group-hover:bg-white'}
                                    `}
                                />

                                <Typography variant="subtitle2" component="span" className="font-bold text-slate-800 block mb-1">
                                    {log.mensaje}
                                </Typography>
                                <div className="flex items-center gap-1 text-slate-500">
                                    <PersonOutlineIcon fontSize="inherit" />
                                    <Typography variant="caption" className="font-medium">
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
