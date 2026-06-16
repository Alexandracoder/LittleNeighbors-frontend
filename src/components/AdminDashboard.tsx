import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../services/api'
import MainLayout from '../components/layout/MainLayout'
import dashboardBg from '../assets/Stats_image.png'

interface DetailedStats {
  leadsCaptados: number
  leadsConvertidos: number
  tasaConversion: number
}

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Record<string, number>>({})
  const [detailedStats, setDetailedStats] = useState<
    Record<string, DetailedStats>
  >({})
  const [loading, setLoading] = useState(true)
  const GOAL = 20

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsData, detailedData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getDetailedStats(),
        ])

        setStats(statsData)
        setDetailedStats(detailedData)
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
        <h1 style={{ marginBottom: '30px' }}>
          {t('admin.dashboard.heading')} 📊
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
