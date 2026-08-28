import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import adminService from '../services/adminService'
import { familyApi } from '../services/api'
import { FamilyResponseDTO } from '../types'
import MainLayout from '../components/layout/MainLayout'
import {
  ArrowLeft,
  Loader2,
  MapPin,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
} from 'lucide-react'
import dashboardBg from '../assets/neighborhood-picnic.png'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  APPROVED: { label: 'Foto aprobada', color: '#22c55e' },
  PENDING: { label: 'Foto pendiente', color: '#eab308' },
  REJECTED: { label: 'Foto rechazada', color: '#ef4444' },
}

export default function AdminFamiliesPage() {
  const navigate = useNavigate()

  const [families, setFamilies] = useState<FamilyResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedFamily, setSelectedFamily] = useState<FamilyResponseDTO | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    const fetchFamilies = async () => {
      setLoading(true)
      try {
        const data = await adminService.getAllFamilies(page, 20)
        setFamilies(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } catch (error) {
        console.error('Error fetching families:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFamilies()
  }, [page])

  useEffect(() => {
    if (selectedId === null) {
      setSelectedFamily(null)
      return
    }
    const fetchDetail = async () => {
      setDetailLoading(true)
      try {
        // Como admin, este mismo endpoint devuelve el perfil completo
        // (incluida la foto aunque esté pendiente/rechazada) — antes solo
        // había acceso a estadísticas agregadas, no al perfil real.
        const data = await familyApi.getById(selectedId)
        setSelectedFamily(data)
      } catch (error) {
        console.error('Error fetching family detail:', error)
      } finally {
        setDetailLoading(false)
      }
    }
    fetchDetail()
  }, [selectedId])

  const filtered = search.trim()
    ? families.filter(
        f =>
          f.familyName?.toLowerCase().includes(search.toLowerCase()) ||
          f.representativeName?.toLowerCase().includes(search.toLowerCase()) ||
          f.neighborhoodName?.toLowerCase().includes(search.toLowerCase()),
      )
    : families

  return (
    <MainLayout
      backgroundImage={dashboardBg}
      title="Familias registradas"
      subtitle={`${totalElements} familias en total`}
    >
      <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <button
            onClick={() => navigate('/admin/stats')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: 'white',
              color: '#2D2D2D',
              border: '2px solid #eee',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
            Volver
          </button>

          <input
            type="text"
            placeholder="Buscar por familia, nombre o barrio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: '1 1 280px',
              maxWidth: '380px',
              padding: '10px 18px',
              borderRadius: '999px',
              border: '2px solid #eee',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="animate-spin" size={32} color="#F28749" />
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
            No hay familias que coincidan con la búsqueda.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {filtered.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                style={{
                  textAlign: 'left',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                  padding: '16px',
                  borderRadius: '18px',
                  border: 'none',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: '#F28749',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {f.profilePictureUrl ? (
                    <img
                      src={f.profilePictureUrl}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <UserIcon color="white" size={22} />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '14px', color: '#2D2D2D' }}>
                    {f.familyName}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>
                    {f.representativeName}
                  </p>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: '11px',
                      color: '#F28749',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <MapPin size={11} /> {f.neighborhoodName || 'Sin barrio'} ·{' '}
                    {f.children?.length ?? 0}{' '}
                    {(f.children?.length ?? 0) === 1 ? 'niño' : 'niños'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              marginTop: '30px',
            }}
          >
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: page === 0 ? '#eee' : '#2D2D2D',
                color: page === 0 ? '#aaa' : 'white',
                fontWeight: 700,
                fontSize: '12px',
                cursor: page === 0 ? 'default' : 'pointer',
              }}
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <span style={{ fontSize: '13px', color: '#666', fontWeight: 700 }}>
              Página {page + 1} de {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: page >= totalPages - 1 ? '#eee' : '#2D2D2D',
                color: page >= totalPages - 1 ? '#aaa' : 'white',
                fontWeight: 700,
                fontSize: '12px',
                cursor: page >= totalPages - 1 ? 'default' : 'pointer',
              }}
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Panel de detalle */}
      {selectedId !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setSelectedId(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '30px',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setSelectedId(null)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#f5f5f5',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>

            {detailLoading || !selectedFamily ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <Loader2 className="animate-spin" size={28} color="#F28749" />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: '#F28749',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {selectedFamily.profilePictureUrl ? (
                      <img
                        src={selectedFamily.profilePictureUrl}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <UserIcon color="white" size={30} />
                    )}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#2D2D2D' }}>
                      {selectedFamily.familyName}
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#888' }}>
                      {selectedFamily.representativeName}
                    </p>
                  </div>
                </div>

                {selectedFamily.photoModerationStatus && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '999px',
                      backgroundColor: `${STATUS_LABEL[selectedFamily.photoModerationStatus]?.color}20`,
                      color: STATUS_LABEL[selectedFamily.photoModerationStatus]?.color,
                      fontSize: '11px',
                      fontWeight: 800,
                      marginBottom: '18px',
                    }}
                  >
                    {STATUS_LABEL[selectedFamily.photoModerationStatus]?.label}
                  </div>
                )}

                {selectedFamily.photoRejectionReason && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      backgroundColor: '#fef2f2',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      marginBottom: '18px',
                      fontSize: '12px',
                      color: '#b91c1c',
                    }}
                  >
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                    {selectedFamily.photoRejectionReason}
                  </div>
                )}

                {selectedFamily.description && (
                  <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, marginBottom: '18px' }}>
                    {selectedFamily.description}
                  </p>
                )}

                <div style={{ marginBottom: '18px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
                    Ubicación
                  </p>
                  <p style={{ fontSize: '13px', color: '#2D2D2D', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="#F28749" />
                    {[selectedFamily.streetName, selectedFamily.neighborhoodName, selectedFamily.cityName]
                      .filter(Boolean)
                      .join(', ') || 'Sin especificar'}
                    {selectedFamily.postalCode ? ` (${selectedFamily.postalCode})` : ''}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                    {(selectedFamily.children?.length ?? 0) === 1 ? 'Niño/a' : 'Niños/as'} (
                    {selectedFamily.children?.length ?? 0})
                  </p>
                  {(selectedFamily.children?.length ?? 0) === 0 ? (
                    <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>Sin perfiles de niños todavía.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedFamily.children.map(c => (
                        <div
                          key={c.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '12px',
                          }}
                        >
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#2D2D2D' }}>
                            {c.nickname}
                          </span>
                          <span style={{ fontSize: '12px', color: '#888' }}>
                            {c.age != null ? `${c.age} años` : c.lifeStage} · {c.gender}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  )
}
