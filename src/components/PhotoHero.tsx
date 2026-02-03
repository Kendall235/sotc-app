interface PhotoHeroProps {
  imageUrl: string | null;
}

export function PhotoHero({ imageUrl }: PhotoHeroProps) {
  if (!imageUrl) {
    return null;
  }

  return (
    <img
      src={imageUrl}
      alt="Collection photo"
      className="photo-hero"
    />
  );
}
