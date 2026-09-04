import { useState } from 'react'
import { ImageOff } from 'lucide-react'

/**
 * Miniatura para paneles de moderación (DNI/selfie, foto de familia).
 *
 * Por qué existe: si la imagen falla al cargar (típicamente porque el
 * preset de Cloudinary está en modo "Authenticated" y la URL no lleva
 * firma, o porque la URL guardada ya no es válida), un <img> normal
 * simplemente no se ve nada — sin pista de qué ha pasado. Este
 * componente detecta el fallo con onError y muestra:
 *   1. Un aviso visible en vez de un hueco vacío.
 *   2. Un enlace directo a la URL cruda, para poder abrirla a mano y
 *      ver el error real (401/403 = preset Authenticated sin firmar;
 *      404 = URL rota o asset borrado; nada de nada = problema de red).
 *   3. Un console.error con la URL exacta, para poder copiarla y
 *      probarla en la pestaña Network del navegador.
 */
export default function ModerationThumbnail({
  src,
  alt,
  className,
  style,
  fallbackStyle,
}: {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  fallbackStyle?: React.CSSProperties
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        title="La imagen no se pudo cargar aquí — pulsa para abrirla directamente y ver el error"
        className={className ? `${className} flex flex-col items-center justify-center gap-1 bg-red-500/10 border border-red-500/30 text-red-200 text-center p-1` : undefined}
        style={
          className
            ? undefined
            : {
                ...style,
                ...fallbackStyle,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#b91c1c',
                textAlign: 'center',
                textDecoration: 'none',
              }
        }
      >
        <ImageOff className="w-4 h-4 shrink-0" />
        <span style={className ? undefined : { fontSize: '8px', fontWeight: 800, lineHeight: 1.1 }}>
          No carga
        </span>
      </a>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        // eslint-disable-next-line no-console
        console.error('[Moderación] No se pudo cargar la imagen:', src)
        setFailed(true)
      }}
    />
  )
}