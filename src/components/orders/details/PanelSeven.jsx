import React, { useMemo } from "react";
import PropTypes from "prop-types";
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
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

const PanelSeven = ({ data, current }) => {
  const pastHistory = data?.history || [];

  const fullHistory = useMemo(() => {
    const historyArray = [...pastHistory];

    if (current && current.statusOrder) {
      historyArray.push({
        status: current.statusOrder,
        mensaje: current.message || "Estado actual",
        timestamp: current.lastUpdate || current.creation,
        isCurrent: true,
      });
    }

    return historyArray.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );
  }, [pastHistory, current]);

  if (fullHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
        <HistoryIcon className="text-[48px] mb-2 opacity-50" />
        <Typography>
          No hay historial de cambios registrado para esta orden.
        </Typography>
      </div>
    );
  }
  const cleanUser = (mensaje) => {
    if (!mensaje) return "Sistema";
    const match = mensaje.match(/por\s+(.+)$/i);
    if (match) {
      const rawUser = match[1].trim();
      return rawUser.split("(")[0].trim();
    }
    return "Sistema";
  };

  const cleanMessage = (mensaje) => {
    if (!mensaje) return "Actualización de estado";

    const match = mensaje.match(/(Status cambiado a '.+?')\s+por/i);
    if (match) {
      return match[1].replace(/Status/i, "Estado") + " manualmente";
    }

    return mensaje;
  };

  return (
    <div className="space-y-6">
      <TableContainer
        component={Paper}
        elevation={0}
        className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
      >
        <Table className="min-w-[650px]" aria-label="historial estados table">
          <TableHead>
            <TableRow className="bg-slate-50">
              <TableCell className="font-bold text-slate-600 text-xs uppercase w-48">
                Fecha
              </TableCell>
              <TableCell className="font-bold text-slate-600 text-xs uppercase w-40">
                Estado
              </TableCell>
              <TableCell className="font-bold text-slate-600 text-xs uppercase">
                Detalle / Usuario
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fullHistory.map((log, index) => {
              const statusName = log.status || "desconocido";
              const isError =
                statusName.toLowerCase().includes("error") ||
                statusName.toLowerCase().includes("descartada");
              const isSuccess =
                statusName.toLowerCase().includes("procesada") ||
                statusName.toLowerCase().includes("success");

              let chipColors = "bg-slate-50 border-slate-200 text-slate-700";
              if (isError) chipColors = "bg-red-50 border-red-200 text-red-700";
              if (isSuccess)
                chipColors =
                  "bg-emerald-50 border-emerald-200 text-emerald-700";

              return (
                <TableRow
                  key={index}
                  className="[&:last-child_td]:border-0 [&:last-child_th]:border-0 hover:bg-slate-50"
                >
                  <TableCell
                    component="th"
                    scope="row"
                    className="text-slate-600 font-medium"
                  >
                    {log.timestamp
                      ? new Date(log.timestamp).toLocaleString()
                      : "—"}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={statusName}
                      size="small"
                      variant="outlined"
                      className={`font-bold capitalize max-w-full [&_.MuiChip-label]:truncate ${chipColors}`}
                    />
                  </TableCell>

                  <TableCell className="text-slate-600">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">
                        {log.isCurrent && (
                          <strong className="text-indigo-600 mr-1">
                            Actual:
                          </strong>
                        )}
                        {cleanMessage(log.mensaje)}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                        <PersonOutlineIcon style={{ fontSize: 14 }} />
                        <span className="text-xs font-medium">
                          {cleanUser(log.mensaje)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

PanelSeven.propTypes = {
  data: PropTypes.shape({
    history: PropTypes.array,
  }),
  current: PropTypes.object,
};

PanelSeven.defaultProps = {
  data: null,
  current: null,
};

export default PanelSeven;
