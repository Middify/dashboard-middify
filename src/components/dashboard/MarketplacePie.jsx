import PropTypes from "prop-types";

// Paleta simple y legible
const COLORS = [
  "#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4",
  "#8B5CF6", "#10B981", "#F97316", "#3B82F6", "#E11D48",
  "#14B8A6", "#84CC16", "#A855F7", "#F43F5E", "#0EA5E9",
];

// Utilidad: convierte ángulos polares a coordenadas cartesianas
const polarToXY = (cx, cy, r, deg) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

// Describe un arco en forma de "sector" (pie slice)
const describeSlice = (cx, cy, r, startDeg, endDeg) => {
  const start = polarToXY(cx, cy, r, endDeg);
  const end = polarToXY(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
};

const MarketplacePie = ({ items, size = 280, thickness = 36, showLegend = true }) => {
  const data = Array.isArray(items) ? items.filter(i => (Number(i?.count) || 0) > 0) : [];
  const total = data.reduce((acc, d) => acc + (Number(d.count) || 0), 0);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = (size - 8) / 2;      // padding 4px
  const innerR = Math.max(outerR - thickness, 0);

  // Calcula sectores
  let current = 0;
  const slices = data.map((d, i) => {
    const value = Number(d.count) || 0;
    const ang = total > 0 ? (value / total) * 360 : 0;
    const start = current;
    const end = current + ang;
    current = end;
    return {
      key: d.id ?? d.name ?? i,
      name: d.name ?? `Item ${i + 1}`,
      value,
      color: COLORS[i % COLORS.length],
      start,
      end,
    };
  });

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* Donut */}
      <div className="mx-auto w-full max-w-[340px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full">
          {/* fondo para evitar huecos visuales */}
          <circle cx={cx} cy={cy} r={outerR} fill="#F1F5F9" />
          {slices.map((s) => (
            <path
              key={s.key}
              d={describeSlice(cx, cy, outerR, s.start, s.end)}
              fill={s.color}
            />
          ))}
          {/* círculo interior = donut */}
          <circle cx={cx} cy={cy} r={innerR} fill="white" />
          {/* total en el centro */}
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            fontSize="16"
            fontWeight="600"
            className="fill-slate-900"
          >
            {total.toLocaleString("es-CL")}
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            fontSize="10"
            className="fill-slate-500"
          >
            Total
          </text>
        </svg>
      </div>

      {/* Leyenda minimalista */}
      {showLegend && (
        <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {slices.map((s) => {
            const pct = total > 0 ? (s.value / total) * 100 : 0;
            return (
              <li
                key={s.key}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/70 px-3 py-2"
                title={`${s.name} • ${pct.toFixed(1)}% (${s.value.toLocaleString("es-CL")})`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
                  <span className="truncate text-sm text-slate-700">{s.name}</span>
                </div>
                <span className="text-xs font-medium text-slate-600">
                  {pct.toFixed(1)}%
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

MarketplacePie.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      count: PropTypes.number,
    })
  ).isRequired,
  size: PropTypes.number,
  thickness: PropTypes.number,
  showLegend: PropTypes.bool,
};

export default MarketplacePie;


