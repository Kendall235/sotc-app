import { HeroV3 } from '../components/HeroV3';
import { UploadZoneV3 } from '../components/UploadZoneV3';
import { ExampleCards } from '../components/ExampleCards';

interface LandingV3Props {
  onFileSelect: (file: File) => void;
}

export function LandingV3({ onFileSelect }: LandingV3Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Minimal hero */}
      <HeroV3 />

      {/* The spotlight - luxury upload zone */}
      <UploadZoneV3
        onFileSelect={onFileSelect}
        isProcessing={false}
        previewUrl={null}
      />

      {/* Maximum breathing room before examples */}
      <div className="flex-1 min-h-[120px]" />

      {/* Example cards hidden by default, revealed on scroll */}
      <div className="w-full max-w-3xl pb-16 opacity-40 hover:opacity-90 transition-opacity duration-700">
        <ExampleCards />
      </div>
    </div>
  );
}
