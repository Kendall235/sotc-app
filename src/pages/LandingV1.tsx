import { UploadZoneV1 } from '../components/UploadZoneV1';
import { ExampleCards } from '../components/ExampleCards';

interface LandingV1Props {
  onFileSelect: (file: File) => void;
}

export function LandingV1({ onFileSelect }: LandingV1Props) {
  return (
    <div className="flex flex-col items-center">
      {/* Simplified hero with directional flow */}
      <section className="text-center pt-12 pb-16">
        {/* Logo */}
        <div className="font-logo text-lg tracking-[0.4em] mb-3">
          <span className="text-brick">SOTC</span>
          <span className="text-muted">.APP</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl md:text-5xl uppercase tracking-wide mb-4">
          <span className="text-secondary">State of</span>{' '}
          <span className="text-brick">the Collection</span>
        </h1>

        {/* Value prop */}
        <p className="text-secondary text-lg max-w-md mx-auto">
          Drop your G-Shock photo. AI identifies every piece.
          Get a shareable SOTC card in seconds.
        </p>

        {/* Flow indicator arrow */}
        <div className="mt-8 flex justify-center">
          <div className="flow-arrow" />
        </div>
      </section>

      {/* High-visibility upload zone */}
      <UploadZoneV1
        onFileSelect={onFileSelect}
        isProcessing={false}
        previewUrl={null}
      />

      {/* Example cards pushed way down with reduced opacity */}
      <div className="mt-32 opacity-60 hover:opacity-100 transition-opacity duration-500 w-full max-w-3xl px-4">
        <ExampleCards />
      </div>
    </div>
  );
}
