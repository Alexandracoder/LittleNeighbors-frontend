import { useEffect, useState } from 'react'
import {
  Users,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { dashboardService, DashboardImpactDTO } from '../services/dashboardService'

export const NeighborhoodImpact: React.FC = () => {
  const { t } = useTranslation()
  const [stats, setStats] = useState<DashboardImpactDTO | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    dashboardService
      .getImpactStats()
      .then((data: DashboardImpactDTO) => {
        setStats(data)
        setError(false)
      })
      .catch((err: unknown) => {
        console.error('Error retrieving real neighborhood metrics:', err)
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => {

  }, [stats, error])

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] p-8 shadow-2xl border border-white mb-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-3xl"></div>
          ))}
        </div>
      </div>
    )
  }
  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-700 rounded-3xl p-5 mb-8 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
        <div>
          <span className="text-xs font-black uppercase tracking-wide block">
            {t('impact.syncPaused')}
          </span>
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide block mt-0.5">
            {t('impact.errorIndicator')}
          </span>
        </div>
      </div>
    )
  }

  const hoursOfConciliation = Math.round(stats.totalConciliationMinutes / 60)

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] p-8 shadow-2xl border border-white mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F28749] bg-orange-50 px-3 py-1 rounded-full">
            Valencia Innovation Capital 2026
          </span>
          <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter mt-2">
            {t('impact.titlePre')}{' '}
            <span className="text-[#F28749]">{t('impact.titlePost')}</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl shrink-0 self-start md:self-auto">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
            {t('impact.verifiedReturn')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Metric 1: Active Families */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-4xl font-black text-gray-900 tracking-tight">
              {stats.activeFamiliesCount}
            </span>
            <div className="bg-blue-500 p-3 rounded-2xl text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-gray-800 font-black uppercase text-xs tracking-wider leading-none mb-1">
              {t('impact.activeFamiliesTitle')}
            </h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-tight">
              {t('impact.activeFamiliesDesc')}
            </p>
          </div>
        </div>

        {/* Metric 2: Playdates */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-4xl font-black text-gray-900 tracking-tight">
              {stats.consolidatedPlaydatesCount}
            </span>
            <div className="bg-green-500 p-3 rounded-2xl text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-gray-800 font-black uppercase text-xs tracking-wider leading-none mb-1">
              {t('impact.playdatesTitle')}
            </h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-tight">
              {t('impact.playdatesDesc')}
            </p>
          </div>
        </div>

        {/* Metric 3: Conciliation Hours */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-4xl font-black text-gray-900 tracking-tight">
              {hoursOfConciliation}h
            </span>
            <div className="bg-[#F28749] p-3 rounded-2xl text-white shadow-md">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-gray-800 font-black uppercase text-xs tracking-wider leading-none mb-1">
              {t('impact.sharedTimeTitle')}
            </h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-tight">
              {t('impact.sharedTimeDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
