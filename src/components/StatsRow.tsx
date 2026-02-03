interface StatsRowProps {
  pieces: number;
  series: number;
  rare: number;
  score: number;
}

export function StatsRow({ pieces, series, rare, score }: StatsRowProps) {
  return (
    <div className="grid grid-cols-4 gap-[3px]">
      <div className="bg-resin-dark rounded-l-lg py-3.5 px-2 text-center">
        <div className="font-display text-[26px] text-brick leading-none mb-1">
          {pieces}
        </div>
        <div className="font-mono text-[10px] text-secondary tracking-wider uppercase">
          Pieces
        </div>
      </div>
      <div className="bg-resin-dark py-3.5 px-2 text-center">
        <div className="font-display text-[26px] text-primary leading-none mb-1">
          {series}
        </div>
        <div className="font-mono text-[10px] text-secondary tracking-wider uppercase">
          Series
        </div>
      </div>
      <div className="bg-resin-dark py-3.5 px-2 text-center">
        <div className="font-display text-[26px] text-gold leading-none mb-1">
          {rare}
        </div>
        <div className="font-mono text-[10px] text-secondary tracking-wider uppercase">
          Rare
        </div>
      </div>
      <div className="bg-resin-dark rounded-r-lg py-3.5 px-2 text-center">
        <div className="font-display text-[26px] text-primary leading-none mb-1">
          {score}
        </div>
        <div className="font-mono text-[10px] text-secondary tracking-wider uppercase">
          Score
        </div>
      </div>
    </div>
  );
}
