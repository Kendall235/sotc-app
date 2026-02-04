interface PhotoHeroProps {
  imageUrl: string | null;
}

export function PhotoHero({ imageUrl }: PhotoHeroProps) {
  if (!imageUrl) {
    return null;
  }

  return (
    <div className="px-7 py-4">
      <div className="rounded-lg overflow-hidden border border-[var(--color-border)]">
        <img
          src={imageUrl}
          alt="Collection photo"
          className="w-full max-h-[320px] object-cover"
        />
      </div>
    </div>
  );
}
