import type { Archetype, ArchetypeColor } from '../utils/collectorDNA';

interface DNABarProps {
  archetypes: Archetype[];
}

// Map archetype colors to more vivid, distinct colors
const colorMap: Record<ArchetypeColor, { bg: string; text: string }> = {
  'brick': {
    bg: '#D42B1E',  // G-Shock red
    text: '#FFFFFF'
  },
  'warm-brown': {
    bg: '#C9A227',  // G-Shock gold (for collabs)
    text: '#1A1917'  // Dark text for contrast
  },
  'olive': {
    bg: '#5A564E',  // Warm gray (classic)
    text: '#E8E5DC'
  },
  'blue-gray': {
    bg: '#4A4A5A',  // Slate (analog)
    text: '#E8E5DC'
  },
};

// Color for "OTHER" segment
const otherColors = { bg: '#3A3A42', text: '#A8A5A0' };

// Threshold for grouping into OTHER
const otherThreshold = 10;

export function DNABar({ archetypes }: DNABarProps) {
  if (archetypes.length === 0) {
    return null;
  }

  // Separate segments into main (>=10%) and small (<10%)
  const mainSegments = archetypes.filter(a => a.percentage >= otherThreshold);
  const smallSegments = archetypes.filter(a => a.percentage < otherThreshold);

  // Calculate "OTHER" percentage from small segments
  const otherPercentage = smallSegments.reduce((sum, a) => sum + a.percentage, 0);

  // Build final display segments - all will have labels
  const displaySegments: Array<{ name: string; percentage: number; colors: { bg: string; text: string } }> = [];

  // Add main segments
  for (const archetype of mainSegments) {
    displaySegments.push({
      name: archetype.name,
      percentage: archetype.percentage,
      colors: colorMap[archetype.color],
    });
  }

  // Add OTHER segment if there are small segments
  if (otherPercentage > 0) {
    displaySegments.push({
      name: 'OTHER',
      percentage: otherPercentage,
      colors: otherColors,
    });
  }

  if (displaySegments.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '28px',
        borderRadius: '3px',
        overflow: 'hidden',
        gap: '2px',
      }}
    >
      {displaySegments.map((segment, i) => (
        <div
          key={i}
          style={{
            flex: segment.percentage,
            backgroundColor: segment.colors.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 6px',
            minWidth: '40px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-oswald)',
              fontSize: '11px',
              fontWeight: 500,
              color: segment.colors.text,
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {segment.name}
          </span>
        </div>
      ))}
    </div>
  );
}
