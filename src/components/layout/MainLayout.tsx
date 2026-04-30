import { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
  backgroundImage: string
  title?: string
  subtitle?: string
  showGlassCard?: boolean
}

export default function MainLayout({
  children,
  backgroundImage,
  title,
  subtitle,
  showGlassCard = true,
}: MainLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start p-4 md:p-8 overflow-x-hidden font-sans">
    
      <div
        className="fixed inset-0 z-0 transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.95) saturate(1.1)',
        }}
      />

      {/* GRADIENTE DE TEXTO: Solo para que las letras blancas no se pierdan */}
      <div className="fixed inset-0 z-0 bg-black/10 pointer-events-none" />

      {/* CONTENIDO FLOTANTE */}
      <div className="relative z-10 w-full max-w-4xl mt-12 mb-24">
        {/* Encabezados con el estilo "Hello Again" */}
        {(title || subtitle) && (
          <div className="text-center mb-12 animate-in fade-in zoom-in duration-700">
            {title && (
              <h1 className="text-6xl md:text-7xl font-black text-white drop-shadow-2xl italic mb-4 tracking-tighter">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-2xl md:text-3xl text-white/90 font-medium drop-shadow-lg text-balance">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* EL CARD: El mismo estilo que el Welcome Back del Login */}
        {showGlassCard ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-8 md:p-12 border-t-[12px] border-[#F28749] animate-in slide-in-from-top-10 duration-500">
            {children}
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">{children}</div>
        )}
      </div>
    </div>
  )
}
