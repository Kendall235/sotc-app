interface StatsBarProps {
  pieces: number;
  series: number;
  collab: number;
  premium: number;
}

interface StatCellProps {
  value: number;
  label: string;
  color: 'red' | 'white' | 'gold';
}

function StatCell({ value, label, color }: StatCellProps) {
  const colorClass = {
    red: 'text-gshock-red',
    white: 'text-bright',
    gold: 'text-gshock-gold',
  }[color];

  return (
    <div className="flex-1 flex flex-col items-center py-2">
      <span className={`font-oswald text-[22px] font-semibold leading-none ${colorClass}`}>
        {value}
      </span>
      <span className="font-roboto-mono text-[9px] text-muted tracking-wider uppercase mt-1">
        {label}
      </span>
    </div>
  );
}

export function StatsBar({ pieces, series, collab, premium }: StatsBarProps) {
  return (
    <div
      className="flex divide-x divide-[var(--color-border-subtle)]"
      style={{ backgroundColor: 'var(--color-bg-surface)' }}
    >
      <StatCell value={pieces} label="Pieces" color="red" />
      <StatCell value={series} label="Series" color="white" />
      <StatCell value={collab} label="Collab" color="gold" />
      <StatCell value={premium} label="Premium" color="white" />
    </div>
  );
}
