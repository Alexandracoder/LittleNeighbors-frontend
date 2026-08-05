import api from '../services/api'

const VISITOR_ID_KEY = 'ln_visitor_id'
const LAST_TRACKED_KEY = 'ln_last_tracked_date'

function getOrCreateVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(VISITOR_ID_KEY, id)
  }
  return id
}

// Registra como mucho una visita por visitante y por día (no en cada
// recarga o cambio de ruta), para que el contador refleje visitantes
// reales y no ruido de navegación. Si la petición falla (red, backend
// dormido, etc.) no debe romper nada visible para la persona.
export function trackVisitOncePerDay(path: string) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    if (localStorage.getItem(LAST_TRACKED_KEY) === today) return

    const sessionId = getOrCreateVisitorId()
    localStorage.setItem(LAST_TRACKED_KEY, today)

    api.post('/public/site-visits', { sessionId, path }).catch(() => {
      // Silencioso a propósito: registrar la visita nunca debe interrumpir
      // ni avisar a la persona si falla.
    })
  } catch {
    // localStorage puede no estar disponible (modo incógnito muy
    // restrictivo, etc.) — en ese caso simplemente no se cuenta la visita.
  }
}
