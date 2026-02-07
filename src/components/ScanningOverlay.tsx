import { useState, useEffect, useMemo } from 'react';

interface ScanningOverlayProps {
  previewUrl: string;
}

type Phase = 'SCAN' | 'ANALYZE' | 'CONFIRM';

interface DetectionBox {
  id: number;
  top: string;
  left: string;
  width: string;
  height: string;
  delay: number;
  confirmed: boolean;
}

interface TerminalLine {
  id: number;
  text: string;
  type: 'info' | 'detect' | 'confirm';
}

export function ScanningOverlay({ previewUrl }: ScanningOverlayProps) {
  const [phase, setPhase] = useState<Phase>('SCAN');
  const [detectedCount, setDetectedCount] = useState(0);
  const [visibleBoxes, setVisibleBoxes] = useState<number[]>([]);
  const [confirmedBoxes, setConfirmedBoxes] = useState<number[]>([]);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);

  // Generate semi-random detection box positions
  const detectionBoxes: DetectionBox[] = useMemo(() => [
    { id: 1, top: '12%', left: '8%', width: '18%', height: '22%', delay: 600, confirmed: false },
    { id: 2, top: '15%', left: '55%', width: '20%', height: '25%', delay: 1200, confirmed: false },
    { id: 3, top: '45%', left: '25%', width: '22%', height: '28%', delay: 2000, confirmed: false },
    { id: 4, top: '50%', left: '68%', width: '18%', height: '22%', delay: 2800, confirmed: false },
    { id: 5, top: '72%', left: '12%', width: '20%', height: '24%', delay: 3200, confirmed: false },
  ], []);

  const terminalMessages = useMemo(() => [
    { text: '> Analyzing your collection...', type: 'info' as const, delay: 200 },
    { text: '> Identifying watches...', type: 'info' as const, delay: 800 },
    { text: '> TIP: Click the collection title to rename it', type: 'detect' as const, delay: 1400 },
    { text: '> TIP: Click any model name to edit it', type: 'detect' as const, delay: 2200 },
    { text: '> TIP: Edited fields show a * indicator', type: 'detect' as const, delay: 3000 },
    { text: '> TIP: Download or share your card when done', type: 'detect' as const, delay: 3800 },
    { text: '> Generating your shareable card...', type: 'confirm' as const, delay: 4500 },
  ], []);

  // Animation timeline
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Show detection boxes progressively
    detectionBoxes.forEach((box) => {
      const timer = setTimeout(() => {
        setVisibleBoxes(prev => [...prev, box.id]);
        setDetectedCount(prev => prev + 1);
      }, box.delay);
      timers.push(timer);
    });

    // Phase transitions
    timers.push(setTimeout(() => setPhase('ANALYZE'), 2000));
    timers.push(setTimeout(() => setPhase('CONFIRM'), 4000));

    // Confirm boxes (turn green)
    timers.push(setTimeout(() => {
      setConfirmedBoxes([1, 2]);
    }, 4200));
    timers.push(setTimeout(() => {
      setConfirmedBoxes([1, 2, 3, 4]);
    }, 4600));
    timers.push(setTimeout(() => {
      setConfirmedBoxes([1, 2, 3, 4, 5]);
    }, 5000));

    // Terminal lines
    terminalMessages.forEach((msg, index) => {
      const timer = setTimeout(() => {
        setTerminalLines(prev => [...prev, { id: index, text: msg.text, type: msg.type }]);
      }, msg.delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [detectionBoxes, terminalMessages]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main scanning area */}
        <div className="flex-1">
          {/* Photo container with corner brackets */}
          <div className="relative rounded-2xl overflow-hidden bg-resin-dark border border-[var(--color-border)]">
            {/* The actual uploaded image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={previewUrl}
                alt="Your collection"
                className="w-full h-full object-cover"
              />

              {/* Grid overlay */}
              <div
                className="absolute inset-0 pointer-events-none animate-grid-pulse"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(196, 52, 46, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(196, 52, 46, 0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Corner brackets */}
              <div className="corner-bracket corner-bracket-tl" />
              <div className="corner-bracket corner-bracket-tr" />
              <div className="corner-bracket corner-bracket-bl" />
              <div className="corner-bracket corner-bracket-br" />

              {/* Enhanced scan line */}
              <div className="scan-line-enhanced" />

              {/* Detection boxes */}
              {detectionBoxes.map((box) => (
                <div
                  key={box.id}
                  className={`detection-box ${visibleBoxes.includes(box.id) ? 'visible' : ''} ${confirmedBoxes.includes(box.id) ? 'confirmed' : ''}`}
                  style={{
                    top: box.top,
                    left: box.left,
                    width: box.width,
                    height: box.height,
                  }}
                >
                  {/* Mini corner accents on detection box */}
                  <div className="detection-corner detection-corner-tl" />
                  <div className="detection-corner detection-corner-tr" />
                  <div className="detection-corner detection-corner-bl" />
                  <div className="detection-corner detection-corner-br" />
                </div>
              ))}

              {/* Vignette overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, transparent 40%, rgba(11, 11, 13, 0.6) 100%)',
                }}
              />
            </div>

            {/* Phase indicator bar */}
            <div className="bg-resin-mid border-t border-[var(--color-border)] px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Phase steps */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <PhaseStep label="SCAN" active={phase === 'SCAN'} completed={phase !== 'SCAN'} />
                  <PhaseConnector active={phase !== 'SCAN'} />
                  <PhaseStep label="ANALYZE" active={phase === 'ANALYZE'} completed={phase === 'CONFIRM'} />
                  <PhaseConnector active={phase === 'CONFIRM'} />
                  <PhaseStep label="CONFIRM" active={phase === 'CONFIRM'} completed={false} />
                </div>

                {/* Detection counter */}
                <div className="font-mono text-xs sm:text-sm">
                  <span className="text-brick">{detectedCount}</span>
                  <span className="text-secondary ml-1.5">DETECTED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile status text */}
          <div className="lg:hidden mt-4 text-center">
            <p className="font-mono text-sm text-brick">
              {phase === 'SCAN' && 'Scanning image...'}
              {phase === 'ANALYZE' && 'Analyzing watches...'}
              {phase === 'CONFIRM' && 'Confirming identifications...'}
              <span className="animate-blink">_</span>
            </p>
          </div>
        </div>

        {/* Terminal feed - desktop only */}
        <div className="hidden lg:block w-80">
          <div className="terminal-panel h-full">
            <div className="terminal-header">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brick" />
                <span className="font-mono text-xs text-secondary uppercase tracking-wider">Analysis Log</span>
              </div>
            </div>
            <div className="terminal-body">
              {terminalLines.map((line) => (
                <div
                  key={line.id}
                  className={`terminal-line ${line.type}`}
                >
                  {line.text}
                </div>
              ))}
              <div className="terminal-cursor">
                <span className="animate-blink">_</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Phase step component
function PhaseStep({ label, active, completed }: { label: string; active: boolean; completed: boolean }) {
  return (
    <div className={`
      font-mono text-[10px] sm:text-xs tracking-wider px-2 sm:px-3 py-1 rounded
      transition-all duration-300
      ${active
        ? 'text-brick bg-brick-dim border border-[var(--color-brick-border)]'
        : completed
          ? 'text-lcd bg-lcd-dim border border-[var(--color-lcd)]/20'
          : 'text-muted bg-resin-dark border border-[var(--color-border)]'
      }
    `}>
      {label}
    </div>
  );
}

// Phase connector
function PhaseConnector({ active }: { active: boolean }) {
  return (
    <div className={`
      w-4 sm:w-6 h-0.5 rounded transition-colors duration-300
      ${active ? 'bg-lcd' : 'bg-[var(--color-border)]'}
    `} />
  );
}
