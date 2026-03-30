import { useNavigate } from 'react-router-dom'
import welcomeVideo from '../assets/video.mp4'
import backgroundPhoto from '../assets/playing-together.png' // Asegúrate de importar la imagen

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-white bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundPhoto})` }}
    >
      {/* Overlay para oscurecer la imagen y que el contenido destaque */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Contenedor relativo para que esté por encima del overlay */}
      <div className="relative w-full max-w-md text-center z-10">
        <h1 className="text-3xl font-bold mb-6 text-white drop-shadow-md">
          ¡Bienvenidos a la comunidad!
        </h1>

        <div className="rounded-3xl overflow-hidden shadow-2xl mb-8 border border-white/20 aspect-video">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={welcomeVideo} type="video/mp4" />
          </video>
        </div>

        <p className="text-white/90 mb-8 px-4 drop-shadow-md">
          Ya eres parte de algo más grande. Tu perfil está listo y tus vecinos
          te esperan.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/explore')}
            className="w-full py-4 rounded-xl bg-brand-orange text-white font-bold hover:bg-orange-600 transition-colors shadow-lg"
          >
            ¡Empezar a hacer match!
          </button>
          <button
            onClick={() => navigate('/dashboard')} // Cambiado a /dashboard como ejemplo
            className="w-full py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 font-bold hover:bg-white/20 transition-colors"
          >
            Ver mi perfil
          </button>
        </div>
      </div>
    </div>
  )
}
