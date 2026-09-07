import { useEffect, useState } from 'react'
import { X, ArrowRight, ArrowLeft } from 'lucide-react'

const SEEN_KEY = 'ln_welcome_explainer_seen'

/**
 * Explicativo animado de bienvenida — 3 pasos con ilustraciones en SVG
 * (formas simples, no fotos, no genera imágenes nuevas) en la paleta de
 * marca (brand.orange / yellow / coral / cream / dark).
 *
 * Se muestra automáticamente la primera vez que alguien entra a la web
 * (guardado en localStorage), y queda disponible después vía el botón
 * "¿Cómo funciona?" en el login (ver <WelcomeExplainerTrigger>).
 */
export default function WelcomeExplainer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  if (!open) return null

  const steps = [
    <NeighborhoodStep key="neighborhood" />,
    <VerificationStep key="verification" />,
    <HowItWorksStep key="how" />,
  ]

  const isLast = step === steps.length - 1

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem(SEEN_KEY, 'true')
      onClose()
    } else {
      setStep(s => s + 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem(SEEN_KEY, 'true')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-5"
      onClick={handleSkip}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-brand-cream rounded-[2rem] max-w-md w-full p-8 relative overflow-hidden"
      >
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/70 flex items-center justify-center z-10"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4 text-brand-dark" />
        </button>

        <div key={step} className="ln-explainer-fade">
          {steps[step]}
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-6 bg-brand-coral' : 'w-2 bg-brand-orange/30'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center justify-center w-14 h-14 rounded-2xl border-2 border-brand-orange/30 text-brand-dark shrink-0"
              aria-label="Anterior"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-brand-coral text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:brightness-105 transition-all"
          >
            {isLast ? 'Empezar' : 'Siguiente'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {!isLast && (
          <button
            onClick={handleSkip}
            className="w-full text-center mt-3 text-xs font-bold text-brand-dark/40 uppercase tracking-widest"
          >
            Saltar
          </button>
        )}
      </div>

      <style>{`
        @keyframes ln-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ln-explainer-fade { animation: ln-fade-in 0.4s ease-out; }

        @keyframes ln-pop {
          0% { opacity: 0; transform: scale(0.6); }
          60% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        .ln-pop { animation: ln-pop 0.5s ease-out both; }

        @keyframes ln-draw {
          from { stroke-dashoffset: 60; }
          to { stroke-dashoffset: 0; }
        }
        .ln-draw { animation: ln-draw 0.6s ease-out 0.3s both; }

        @keyframes ln-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .ln-float { animation: ln-float 3s ease-in-out infinite; }

        @keyframes ln-line-grow {
          from { stroke-dashoffset: 120; }
          to { stroke-dashoffset: 0; }
        }
        .ln-line-grow { animation: ln-line-grow 1s ease-out 0.2s both; }
      `}</style>
    </div>
  )
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xl font-black text-brand-dark text-center mt-4 mb-2">
      {children}
    </h3>
  )
}

function StepBody({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-brand-dark/60 text-center leading-relaxed px-2">
      {children}
    </p>
  )
}

// --- Paso 1: qué es Little Neighbors ---
function NeighborhoodStep() {
  return (
    <div>
      <svg viewBox="0 0 300 180" className="w-full h-40">
        {[60, 150, 240].map((cx, i) => (
          <g
            key={cx}
            className="ln-pop"
            style={{ animationDelay: `${i * 0.15}s`, transformOrigin: `${cx}px 110px` }}
          >
            <polygon
              points={`${cx - 28},95 ${cx},68 ${cx + 28},95`}
              fill="#F58D54"
            />
            <rect x={cx - 22} y={95} width={44} height={38} rx={4} fill="#FCD144" />
            <rect x={cx - 7} y={112} width={14} height={21} rx={2} fill="#FFF6E0" />
          </g>
        ))}
        <path
          d="M 88 120 Q 150 150 212 120"
          fill="none"
          stroke="#E86B5A"
          strokeWidth="3"
          strokeDasharray="120"
          strokeLinecap="round"
          className="ln-line-grow"
        />
        <circle cx="150" cy="140" r="5" fill="#E86B5A" className="ln-pop" style={{ animationDelay: '0.6s' }} />
      </svg>
      <StepTitle>Bienvenida a Little Neighbors</StepTitle>
      <StepBody>
        Conecta con otras familias de tu barrio, organiza quedadas para
        los peques y haz que criar en comunidad sea un poco más fácil.
      </StepBody>
    </div>
  )
}

// --- Paso 2: por qué se pide verificación ---
function VerificationStep() {
  return (
    <div>
      <svg viewBox="0 0 300 180" className="w-full h-40">
        <g className="ln-float" style={{ transformOrigin: '150px 90px' }}>
          <path
            d="M150 30 L205 50 V95 C205 130 180 155 150 165 C120 155 95 130 95 95 V50 Z"
            fill="#F58D54"
          />
          <path
            d="M150 30 L205 50 V95 C205 130 180 155 150 165 C120 155 95 130 95 95 V50 Z"
            fill="none"
            stroke="#E86B5A"
            strokeWidth="3"
          />
          <path
            d="M120 96 L142 118 L184 72"
            fill="none"
            stroke="#FFF6E0"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="60"
            className="ln-draw"
          />
        </g>
      </svg>
      <StepTitle>Por eso pedimos verificar tu identidad</StepTitle>
      <StepBody>
        Aquí hay niños de por medio. Pedimos DNI + selfie a cada familia
        para asegurarnos de que hablas con personas reales de tu barrio,
        no con perfiles falsos. Lo revisamos nosotros a mano.
      </StepBody>
    </div>
  )
}

// --- Paso 3: cómo funciona, 3 pasos numerados ---
function HowItWorksStep() {
  const items = [
    { n: 1, label: 'Crea tu perfil de familia' },
    { n: 2, label: 'Verifica tu identidad' },
    { n: 3, label: 'Conecta y organiza quedadas' },
  ]
  return (
    <div>
      <div className="flex flex-col gap-3 mt-2 mb-2">
        {items.map((item, i) => (
          <div
            key={item.n}
            className="flex items-center gap-3 ln-pop"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div className="w-10 h-10 rounded-full bg-brand-coral text-white font-black flex items-center justify-center shrink-0">
              {item.n}
            </div>
            <div className="flex-1 bg-white/70 rounded-2xl py-3 px-4 text-sm font-bold text-brand-dark">
              {item.label}
            </div>
          </div>
        ))}
      </div>
      <StepTitle>Así de sencillo</StepTitle>
      <StepBody>Tres pasos y ya estás lista para empezar.</StepBody>
    </div>
  )
}

/** Botón para volver a ver el explicativo cuando ya se cerró una vez. */
export function hasSeenWelcomeExplainer() {
  return localStorage.getItem(SEEN_KEY) === 'true'
}
