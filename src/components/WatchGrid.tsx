import type { Watch } from '../types/collection';
import { WatchTile } from './WatchTile';

interface WatchGridProps {
  watches: Watch[];
}

export function WatchGrid({ watches }: WatchGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {watches.map((watch, index) => (
        <WatchTile key={`${watch.model_number}-${index}`} watch={watch} index={index} />
      ))}
    </div>
  );
}
