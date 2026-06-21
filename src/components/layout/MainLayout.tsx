import { MainLayoutProps } from "../../types"
export default function MainLayout({
  children,
  backgroundImage,
  title,
  subtitle,
  variant = 'light',
  showGlassCard = true,
}: MainLayoutProps) {
  const bgClass = variant === 'dark' ? 'bg-black/40 text-white' : 'bg-white/90'

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

      <div className="fixed inset-0 z-0 bg-black/10 pointer-events-none" />

      {/* Ajuste: max-w-4xl es un poco ancho para móviles, cambiamos a max-w-2xl para que el texto sea legible */}
      <div className="relative z-10 w-full max-w-2xl mt-12 mb-12">
        {(title || subtitle) && (
          <div className="text-center mb-8 px-2 animate-in fade-in zoom-in duration-700">
            {title && (
              
              <h1 className="text-4xl md:text-7xl font-black text-white drop-shadow-2xl italic mb-4 tracking-tighter">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-lg md:text-3xl text-white/90 font-medium drop-shadow-lg text-balance">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {showGlassCard ? (
          <div
            className={`${bgClass} backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] shadow-2xl p-6 md:p-12 border-t-[8px] md:border-t-[12px] border-[#F28749] animate-in slide-in-from-top-10 duration-500`}
          >
            {children}
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">{children}</div>
        )}
      </div>
    </div>
  )
}
