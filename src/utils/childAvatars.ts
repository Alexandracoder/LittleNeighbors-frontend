// Avatares nuevos (set ilustrado de 14 personajes). Las claves se guardan en
// BD (children.avatar_key, texto libre sin lista blanca en el backend), así
// que NO se deben renombrar ni reutilizar una vez en producción.
import Avatar05 from '../assets/avatars/avatar-05.jpg'
import Avatar06 from '../assets/avatars/avatar-06.jpg'
import Avatar07 from '../assets/avatars/avatar-07.jpg'
import Avatar08 from '../assets/avatars/avatar-08.jpg'
import Avatar09 from '../assets/avatars/avatar-09.jpg'
import Avatar10 from '../assets/avatars/avatar-10.jpg'
import Avatar11 from '../assets/avatars/avatar-11.jpg'
import Avatar12 from '../assets/avatars/avatar-12.jpg'
import Avatar13 from '../assets/avatars/avatar-13.jpg'
import Avatar14 from '../assets/avatars/avatar-14.jpg'
import Avatar15 from '../assets/avatars/avatar-15.jpg'
import Avatar16 from '../assets/avatars/avatar-16.jpg'
import Avatar17 from '../assets/avatars/avatar-17.jpg'
import Avatar18 from '../assets/avatars/avatar-18.jpg'

// Avatares antiguos: ya no se ofrecen en el selector, pero siguen resolviendo
// para los niños que ya los eligieron (avatar1..avatar4), de modo que nadie
// pierde de golpe el avatar que escogió.
import Avatar1 from '../assets/Avatar1.jpg'
import Avatar2 from '../assets/Avatar2.jpg'
import Avatar3 from '../assets/Avatar3.jpg'
import Avatar4 from '../assets/Avatar4.jpg'

// Galería libre a propósito: no se filtra por género (ver conversación de
// producto) — cualquier familia puede elegir cualquiera de estos avatares
// para el perfil de su hijo/a, independientemente del género indicado.
export const CHILD_AVATARS: { key: string; src: string }[] = [
  { key: 'avatar5', src: Avatar05 },
  { key: 'avatar6', src: Avatar06 },
  { key: 'avatar7', src: Avatar07 },
  { key: 'avatar8', src: Avatar08 },
  { key: 'avatar9', src: Avatar09 },
  { key: 'avatar10', src: Avatar10 },
  { key: 'avatar11', src: Avatar11 },
  { key: 'avatar12', src: Avatar12 },
  { key: 'avatar13', src: Avatar13 },
  { key: 'avatar14', src: Avatar14 },
  { key: 'avatar15', src: Avatar15 },
  { key: 'avatar16', src: Avatar16 },
  { key: 'avatar17', src: Avatar17 },
  { key: 'avatar18', src: Avatar18 },
]

const LEGACY_CHILD_AVATARS: { key: string; src: string }[] = [
  { key: 'avatar1', src: Avatar1 },
  { key: 'avatar2', src: Avatar2 },
  { key: 'avatar3', src: Avatar3 },
  { key: 'avatar4', src: Avatar4 },
]

export function getChildAvatarSrc(avatarKey?: string | null): string | null {
  if (!avatarKey) return null
  return (
    CHILD_AVATARS.find(a => a.key === avatarKey)?.src ??
    LEGACY_CHILD_AVATARS.find(a => a.key === avatarKey)?.src ??
    null
  )
}

// Avatar por defecto para niños que todavía no han elegido ninguno: se reparte
// de forma estable según el id (el mismo niño siempre ve el mismo).
export function getDefaultChildAvatarSrc(seed?: number | string | null): string {
  const n = Math.abs(Number(seed) || 0)
  return CHILD_AVATARS[n % CHILD_AVATARS.length].src
}
