interface PhotoFrameProps {
  imageUrl: string | null;
}

/**
 * PhotoFrame - The star component
 * Displays the user's collection photo in a premium "digital case" frame
 * with 4 corner L-bracket accents. No overlays, no chips - just clean presentation.
 */
export function PhotoFrame({ imageUrl }: PhotoFrameProps) {
  if (!imageUrl) {
    return null;
  }

  return (
    <div
      className="photo-frame-container"
      style={{
        position: 'relative',
        padding: '24px',
        backgroundColor: 'var(--color-bg-deep)',
      }}
    >
      {/* Corner accent - top left */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          width: '32px',
          height: '32px',
          borderTop: '2px solid var(--color-gshock-red)',
          borderLeft: '2px solid var(--color-gshock-red)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* Corner accent - top right */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '32px',
          height: '32px',
          borderTop: '2px solid var(--color-gshock-red)',
          borderRight: '2px solid var(--color-gshock-red)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* Corner accent - bottom left */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          width: '32px',
          height: '32px',
          borderBottom: '2px solid var(--color-gshock-red)',
          borderLeft: '2px solid var(--color-gshock-red)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* Corner accent - bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          width: '32px',
          height: '32px',
          borderBottom: '2px solid var(--color-gshock-red)',
          borderRight: '2px solid var(--color-gshock-red)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* Photo wrapper with border and shadow */}
      <div
        className="photo-wrapper"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '2px',
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 4px 20px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
        }}
      >
        <img
          src={imageUrl}
          alt="Collection photo"
          style={{
            width: '100%',
            maxHeight: '420px',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}
