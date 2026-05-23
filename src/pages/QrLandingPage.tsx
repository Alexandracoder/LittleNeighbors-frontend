import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export const QrLandingPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [barrio, setBarrio] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)


  const [votosContador, setVotosContador] = useState<number>(0)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  const GOAL = 20

  
  const fetchContador = async (nombreBarrio: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/public/pilot-lead/count?neighborhood=${nombreBarrio}`,
      )
      if (response.ok) {
        const data = await response.json()
        setVotosContador(data.count)
      }
    } catch (error) {
      console.error('Error al recuperar el contador de votos:', error)
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
      
      const response = await fetch(
        'http://localhost:8080/api/public/pilot-lead',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            neighborhood: barrio,
          }),
        },
      )

      if (response.ok) {
        setSubmitted(true)
        setVotosContador(prev => prev + 1)
      } else if (response.status === 409) {
      
        setMensajeError(
          '¡Esta familia ya ha votado por este barrio! Gracias por tu entusiasmo. 🏘️',
        )
        setSubmitted(true)
      } else {
        const errorText = await response.text()
        setMensajeError(`Ups, algo ha ido mal: ${errorText}`)
      }
    } catch (error) {
      console.error('Error de red:', error)
      setMensajeError(
        'No se ha podido conectar con el servidor. Por favor, comprueba que el backend está arrancado.',
      )
    } finally {
      setLoading(false)
    }
  }


  const porcentaje = Math.min(Math.round((votosContador / GOAL) * 100), 100)

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>LittleNeighbors 🏘️</h1>

        {/* 📊 CONTADOR VISUAL: Aparece en cuanto tenemos un barrio seleccionado */}
        {barrio && (
          <div style={styles.progressContainer}>
            <div style={styles.progressText}>
              <span>
                <strong>{votosContador}</strong> de {GOAL} familias en {barrio}
              </span>
              <span>{porcentaje}%</span>
            </div>
            <div style={styles.progressBarBg}>
              <div
                style={{ ...styles.progressBarFill, width: `${porcentaje}%` }}
              />
            </div>
          </div>
        )}

        {/* Aviso de error si la petición falla antes de enviar */}
        {mensajeError && !submitted && (
          <div style={styles.errorMessage}>{mensajeError}</div>
        )}

        {!submitted ? (
          <>
            <p style={styles.subtitle}>
              ¡Tu barrio te necesita! Estamos listos para abrir la primera red
              de crianza verificada en <strong>{barrio || 'tu zona'}</strong>.
            </p>
            <p style={styles.instruction}>
              Si conseguimos 20 familias en tu barrio, arrancamos el piloto aquí
              primero. ¡Asegura tu plaza!
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label htmlFor="email" style={styles.label}>
                  Correo electrónico de la familia
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={styles.input}
                  disabled={loading}
                />
              </div>

              {/* Si el QR no traía barrio, dejamos que lo elijan ellos */}
              {!searchParams.get('barrio') && (
                <div style={styles.inputGroup}>
                  <label htmlFor="barrio" style={styles.label}>
                    ¿En qué barrio vives?
                  </label>
                  <select
                    id="barrio"
                    required
                    value={barrio}
                    onChange={e => {
                      const nuevoBarrio = e.target.value
                      setBarrio(nuevoBarrio)
                      if (nuevoBarrio) fetchContador(nuevoBarrio)
                    }}
                    style={styles.input}
                    disabled={loading}
                  >
                    <option value="">Selecciona tu barrio...</option>
                    <option value="Benimaclet">Benimaclet</option>
                    <option value="Ruzafa">Ruzafa</option>
                    <option value="Arrancapins">
                      Arrancapins (Finca Roja)
                    </option>
                    <option value="Cabañal">El Cabañal</option>
                  </select>
                </div>
              )}

              <button type="submit" style={styles.button} disabled={loading}>
                {loading
                  ? 'Apuntando...'
                  : `¡Voto por ${barrio || 'mi barrio'}! 🏁`}
              </button>
            </form>
          </>
        ) : (
          <div style={styles.successMessage}>
            {mensajeError ? (
              
              <p style={{ color: '#e67e22', fontWeight: '500' }}>
                {mensajeError}
              </p>
            ) : (
              <>
                <h2>¡Registrado con éxito! 🎉</h2>
                <p>
                  Gracias por sumarte a la tribu de <strong>{barrio}</strong>.
                </p>
              </>
            )}
            <p style={{ fontSize: '14px', color: '#666', marginTop: '15px' }}>
              Comparte el QR con otros padres y madres del barrio. ¡Faltan menos
              para llegar a los 20!
            </p>
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
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  title: {
    color: '#2c3e50',
    fontSize: '28px',
    marginBottom: '20px',
  },
  progressContainer: {
    backgroundColor: '#f8f9fa',
    padding: '12px 15px',
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
    borderRadius: '5px',
    transition: 'width 0.5s ease-out',
  },
  subtitle: {
    fontSize: '16px',
    color: '#34495e',
    lineHeight: '1.5',
  },
  instruction: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '25px',
  },
  form: {
    textAlign: 'left',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s',
  },
  errorMessage: {
    backgroundColor: '#fadbd8',
    color: '#78281f',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px',
    textAlign: 'left',
  },
  successMessage: {
    padding: '20px 0',
    color: '#27ae60',
  },
}
