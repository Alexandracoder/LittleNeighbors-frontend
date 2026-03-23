import { Calendar, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function NeighborhoodEvents() {
  const { t } = useTranslation()

  const events = [
    {
      id: 1,
      title: t('dashboard.actions.findPlaymates'),
      date: 'Mar 15, 10:00 AM',
      location: 'Central Park',
    },
    {
      id: 2,
      title: t('dashboard.actions.findPlaymates'),
      date: 'Mar 18, 5:00 PM',
      location: 'Community Center',
    },
  ]

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl text-white">
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
        <Calendar className="w-6 h-6 text-brand-orange" />
        {t('dashboard.actions.findPlaymates')}
      </h2>

      <div className="space-y-4">
        {events.map(event => (
          <div
            key={event.id}
            className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer"
          >
            <h3 className="font-black text-lg uppercase tracking-tight group-hover:text-brand-orange transition-colors">
              {event.title}
            </h3>
            <div className="flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-widest text-white/50 mt-3">
              <span className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
                <Calendar className="w-3 h-3 text-brand-orange" />
                {event.date}
              </span>
              <span className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
                <MapPin className="w-3 h-3 text-brand-orange" />
                {event.location}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
