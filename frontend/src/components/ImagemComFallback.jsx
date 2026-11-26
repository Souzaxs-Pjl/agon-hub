import { useEffect, useState } from 'react';

export default function ImagemComFallback({ src, alt = '', className = '', fallback = 'AGON' }) {
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    setFalhou(false);
  }, [src]);

  if (!src || falhou) {
    return (
      <div
        className={`${className} imagem-fallback`}
        role="img"
        aria-label={alt || 'Imagem indisponível'}
      >
        <span aria-hidden="true">{fallback}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFalhou(true)}
    />
  );
}
