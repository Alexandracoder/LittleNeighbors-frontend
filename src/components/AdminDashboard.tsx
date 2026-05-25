import { useEffect, useState } from 'react'

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const GOAL = 20

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAllStats()
  }, [])

  if (loading) return <div>Cargando datos del piloto...</div>

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: '30px' }}>
        Panel de Seguimiento - Ayuntamiento 📊
      </h1>

      <table
        style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: '0 10px',
        }}
      >
        <thead>
          <tr style={{ color: '#7f8c8d', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Barrio</th>
            <th style={{ padding: '10px' }}>Inscritos</th>
            <th style={{ padding: '10px' }}>Progreso (Meta: {GOAL})</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(stats).map(([barrio, count]) => {
            const percentage = Math.min(Math.round((count / GOAL) * 100), 100)
            return (
              <tr
                key={barrio}
                style={{
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                }}
              >
                <td style={{ padding: '15px', fontWeight: 'bold' }}>
                  {barrio}
                </td>
                <td style={{ padding: '15px' }}>{count} familias</td>
                <td style={{ padding: '15px', width: '300px' }}>
                  <div
                    style={{
                      backgroundColor: '#eee',
                      height: '10px',
                      borderRadius: '5px',
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor:
                          percentage >= 100 ? '#27ae60' : '#3498db',
                        borderRadius: '5px',
                      }}
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}