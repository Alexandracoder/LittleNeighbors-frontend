import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Users } from 'lucide-react'
import { adminApi } from '../services/api'
import MainLayout from '../components/layout/MainLayout'
import dashboardBg from '../assets/Stats_image.png'

interface DetailedStats {
  leadsCaptados: number
  leadsConvertidos: number
  tasaConversion: number
}

interface DailyVisits {
  date: string
  uniqueVisitors: number
}

interface SiteVisitStats {
  totalVisits: number
  uniqueVisitors: number
  uniqueVisitorsLast30Days: number
  last30Days: DailyVisits[]
}

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Record<string, number>>({})
  const [detailedStats, setDetailedStats] = useState<
    Record<string, DetailedStats>
  >({})
  const [siteVisits, setSiteVisits] = useState<SiteVisitStats | null>(null)
  const [loading, setLoading] = useState(true)
  const GOAL = 20

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsData, detailedData, siteVisitData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getDetailedStats(),
          adminApi.getSiteVisitStats(),
        ])

        setStats(statsData)
        setDetailedStats(detailedData)
        setSiteVisits(siteVisitData)
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  if (loading) return <div>{t('common.loading')}</div>

  return (
    <MainLayout
      backgroundImage={dashboardBg}
      title={t('admin.dashboard.title')}
      subtitle={t('admin.dashboard.subtitle')}
    >
      <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <h1 style={{ margin: 0 }}>{t('admin.dashboard.heading')} 📊</h1>

          {/* Antes no había forma de llegar a moderación desde aquí:
              había que teclear /admin/moderation a mano en la URL. */}
          <button
            onClick={() => navigate('/admin/moderation')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#F28749',
              color: 'white',
              border: 'none',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(242,135,73,0.35)',
            }}
          >
            <ShieldCheck size={16} />
            {t('admin.dashboard.goToModeration', 'Ir a moderación')}
          </button>

          <button
            onClick={() => navigate('/admin/families')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#2D2D2D',
              color: 'white',
              border: 'none',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
            }}
          >
            <Users size={16} />
            {t('admin.dashboard.goToFamilies', 'Ver familias')}
          </button>
        </div>

        {siteVisits && (
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                flex: '1 1 180px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              }}
            >
              <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('admin.dashboard.totalVisits', 'Visitas totales')}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: '28px', fontWeight: 800 }}>
                {siteVisits.totalVisits}
              </p>
            </div>
            <div
              style={{
                flex: '1 1 180px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              }}
            >
              <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('admin.dashboard.uniqueVisitors', 'Visitantes únicos')}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: '28px', fontWeight: 800 }}>
                {siteVisits.uniqueVisitors}
              </p>
            </div>
            <div
              style={{
                flex: '1 1 180px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              }}
            >
              <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('admin.dashboard.uniqueVisitors30d', 'Visitantes únicos (30 días)')}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: '28px', fontWeight: 800, color: '#27ae60' }}>
                {siteVisits.uniqueVisitorsLast30Days}
              </p>
            </div>
          </div>
        )}

        <table
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0 10px',
          }}
        >
          <thead>
            <tr style={{ color: '#7f8c8d', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>
                {t('admin.table.neighborhood')}
              </th>
              <th style={{ padding: '10px' }}>{t('admin.table.captured')}</th>
              <th style={{ padding: '10px' }}>{t('admin.table.converted')}</th>
              <th style={{ padding: '10px' }}>{t('admin.table.progress')}</th>
            </tr>
          </thead>
          <tbody>
            {stats &&
              Object.entries(stats).map(([barrio, count]) => {
                const detail = detailedStats[barrio]
                const percentage = Math.min(
                  Math.round((count / GOAL) * 100),
                  100,
                )

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
                    <td style={{ padding: '15px' }}>{count}</td>
                    <td style={{ padding: '15px', color: '#27ae60' }}>
                      {detail?.leadsConvertidos || 0}
                    </td>
                    <td style={{ padding: '15px', width: '200px' }}>
                      <div
                        style={{
                          backgroundColor: '#eee',
                          height: '8px',
                          borderRadius: '4px',
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor:
                              percentage >= 100 ? '#27ae60' : '#3498db',
                            borderRadius: '4px',
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
    </MainLayout>
  )
}
