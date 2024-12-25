'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function SafeImage({ src, alt, width, height, className }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width || 100}
        height={height || 100}
        className={className}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 100}
      height={height || 100}
      className={className}
      onError={() => setError(true)}
    />
  );
}
