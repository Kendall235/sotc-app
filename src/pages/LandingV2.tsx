import { HeroV2 } from '../components/HeroV2';
import { UploadZoneV2 } from '../components/UploadZoneV2';

interface LandingV2Props {
  onFileSelect: (file: File) => void;
}

export function LandingV2({ onFileSelect }: LandingV2Props) {
  return (
    <div className="min-h-screen flex items-center">
      {/* Split-screen hero layout with CSS Grid Areas */}
      <div className="split-hero-v2 w-full">
        {/* HeroV2 renders: grid-area-hero, grid-area-preview, grid-area-checklist */}
        <HeroV2 />

        {/* Upload zone */}
        <div className="grid-area-upload w-full max-w-md lg:max-w-lg mx-auto lg:mx-0">
          <UploadZoneV2
            onFileSelect={onFileSelect}
            isProcessing={false}
            previewUrl={null}
          />
        </div>
      </div>
    </div>
  );
}
