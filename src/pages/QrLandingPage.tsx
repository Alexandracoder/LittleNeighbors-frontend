import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const QrLandingPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [barrio, setBarrio] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [votosContador, setVotosContador] = useState(0)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  const GOAL = 20

  const fetchContador = async (nombreBarrio: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/public/pilot-lead/count?neighborhood=${nombreBarrio}`,
      )
      if (response.ok) {
        const data = await response.json()
        setVotosContador(data.count)
      }
    } catch (error) {
      console.error('Error fetching count:', error)
    }
  }

  useEffect(() => {
    const barrioParam = searchParams.get('barrio')
    if (barrioParam) {
      const nombreFormateado =
        barrioParam.charAt(0).toUpperCase() + barrioParam.slice(1).toLowerCase()
      setBarrio(nombreFormateado)
      fetchContador(nombreFormateado)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMensajeError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/public/pilot-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, neighborhood: barrio }),
      })

      if (response.ok) {
        setSubmitted(true)
        setVotosContador(prev => prev + 1)
      } else if (response.status === 409) {
        setMensajeError('¡Esta familia ya ha votado por este barrio!')
        setSubmitted(true)
      } else {
        setMensajeError('Error al procesar el registro.')
      }
    } catch (error) {
      setMensajeError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  const porcentaje = Math.min(Math.round((votosContador / GOAL) * 100), 100)

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>LittleNeighbors 🏘️</h1>

        {barrio && (
          <div style={styles.progressContainer}>
            <div style={styles.progressText}>
              <strong>{votosContador}</strong> de {GOAL} familias en {barrio}
              <span>{porcentaje}%</span>
            </div>
            <div style={styles.progressBarBg}>
              <div
                style={{ ...styles.progressBarFill, width: `${porcentaje}%` }}
              />
            </div>
          </div>
        )}

        {mensajeError && !submitted && (
          <div style={styles.errorMessage}>{mensajeError}</div>
        )}

        {!submitted ? (
          <>
            <p style={styles.subtitle}>
              Estamos abriendo la primera red de crianza verificada en{' '}
              <strong>{barrio || 'tu zona'}</strong>.
            </p>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Correo electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={styles.input}
                  disabled={loading}
                />
              </div>

              {!searchParams.get('barrio') && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Barrio</label>
                  <select
                    required
                    value={barrio}
                    onChange={e => {
                      const nuevoBarrio = e.target.value
                      setBarrio(nuevoBarrio)
                      if (nuevoBarrio) fetchContador(nuevoBarrio)
                    }}
                    style={styles.input}
                  >
                    <option value="">Selecciona...</option>
                    <option value="Benimaclet">Benimaclet</option>
                    <option value="Ruzafa">Ruzafa</option>
                  </select>
                </div>
              )}

              <button type="submit" style={styles.button} disabled={loading}>
                {loading
                  ? 'Enviando...'
                  : `¡Voto por ${barrio || 'mi barrio'}!`}
              </button>
            </form>
          </>
        ) : (
          <div style={styles.successMessage}>
            {mensajeError ? (
              <p>{mensajeError}</p>
            ) : (
              <h2>¡Registrado con éxito! 🎉</h2>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '20px',
    fontFamily: 'sans-serif',
  },
  card: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  title: { color: '#2c3e50', fontSize: '28px', marginBottom: '20px' },
  progressContainer: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '25px',
    border: '1px solid #e9ecef',
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#495057',
    marginBottom: '8px',
  },
  progressBarBg: {
    width: '100%',
    height: '10px',
    backgroundColor: '#e9ecef',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
    transition: 'width 0.5s ease-out',
  },
  subtitle: { fontSize: '16px', color: '#34495e', marginBottom: '20px' },
  form: { textAlign: 'left' },
  inputGroup: { marginBottom: '15px' },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  errorMessage: {
    backgroundColor: '#fadbd8',
    color: '#78281f',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px',
  },
  successMessage: { padding: '20px 0', color: '#27ae60' },
}
