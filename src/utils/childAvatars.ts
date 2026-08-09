import Avatar1 from '../assets/Avatar1.jpg'
import Avatar2 from '../assets/Avatar2.jpg'
import Avatar3 from '../assets/Avatar3.jpg'
import Avatar4 from '../assets/Avatar4.jpg'

// Galería libre a propósito: no se filtra por género (ver conversación de
// producto) — cualquier familia puede elegir cualquiera de estos avatares
// para el perfil de su hijo/a, independientemente del género indicado.
export const CHILD_AVATARS: { key: string; src: string }[] = [
  { key: 'avatar1', src: Avatar1 },
  { key: 'avatar2', src: Avatar2 },
  { key: 'avatar3', src: Avatar3 },
  { key: 'avatar4', src: Avatar4 },
]

export function getChildAvatarSrc(avatarKey?: string | null): string | null {
  if (!avatarKey) return null
  return CHILD_AVATARS.find(a => a.key === avatarKey)?.src ?? null
}
