import { ShieldCheck, ShieldAlert, Clock, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface UserStatusProps {
  status: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED'
}

const UserStatus: React.FC<UserStatusProps> = ({ status }) => {
  const { t } = useTranslation()

  const getStatusConfig = () => {
    switch (status) {
      case 'VERIFIED':
        return {
          icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
          bgColor: 'bg-green-100',
          borderColor: 'border-green-600',
          textColor: 'text-green-900',
          label: t('status.verified', 'Verified Neighbor'),
        }
      case 'PENDING_REVIEW':
        return {
          icon: <Clock className="w-5 h-5 text-amber-600" />,
          bgColor: 'bg-amber-100',
          borderColor: 'border-amber-600',
          textColor: 'text-amber-900',
          label: t('status.pending', 'Pending Review'),
        }
      case 'REJECTED':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          bgColor: 'bg-red-100',
          borderColor: 'border-red-600',
          textColor: 'text-red-900',
          label: t('status.rejected', 'Verification Failed'),
        }
      default:
        return {
          icon: <ShieldAlert className="w-5 h-5 text-gray-500" />,
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-500',
          textColor: 'text-gray-900',
          label: t('status.unverified', 'Unverified'),
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-2xl border-2 ${config.bgColor} ${config.borderColor} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
      role="status"
      aria-live="polite"
    >
      <div aria-hidden="true">{config.icon}</div>
      <div className="flex flex-col">
        <span className="sr-only">Account status:</span>
        <span
          className={`text-[10px] font-black uppercase tracking-tighter ${config.textColor}`}
        >
          {config.label}
        </span>
      </div>
    </div>
  )
}

export default UserStatus
